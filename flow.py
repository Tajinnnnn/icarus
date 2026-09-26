"""Options flow by strike for the dashboard's Flow page.

Data: London Strategic Edge's options chain (https://londonstrategicedge.com/api-documentation),
which carries today's traded VOLUME and PREMIUM per contract. It carries no open
interest, so this is a "where is it trading right now" read - it is NOT gamma
exposure and will not match the GEX Profile Bands, which run off CBOE's OI file.

The API key is read from the trading workflow's existing .env (LSE_API_KEY), the
same file the backtest engine reads MASSIVE_API_KEY from.

This module also computes IV WALLS off the NEXT session's board - see the section at
the bottom of the file and docs/(C) iv-walls-design.md.
"""
import json
import os
import math
import statistics
import time
import urllib.error
import urllib.parse
import urllib.request
from datetime import datetime, timedelta, timezone
from zoneinfo import ZoneInfo

from config import TRADING_DIR

API_BASE = "https://api.londonstrategicedge.com/vault"
ENV_PATH = TRADING_DIR / "07 System" / ".env"
YAHOO_NQ_URL = "https://query1.finance.yahoo.com/v8/finance/chart/NQ=F?range=1d&interval=1m"
ET = ZoneInfo("America/New_York")
CT = ZoneInfo("America/Chicago")

STRIKE_WINDOW_PCT = 0.03  # strikes shown: spot +/- 3%
RATIO_TTL_SECONDS = 300

# Remembered between polls so every pull after the first can ask LSE for only the
# strikes near spot (~50 KB) instead of the whole expiry (~225 KB).
_last_spot = {}
# The page's poll and the push loop both run about once a minute; a short cache lets
# them share one API call instead of doubling the data allowance spent.
CACHE_SECONDS = 20
_cache = {}
_ratio_cache = {"at": 0.0, "nq": None}


def _load_key():
    if os.environ.get("LSE_API_KEY"):
        return os.environ["LSE_API_KEY"]
    if not ENV_PATH.exists():
        return None
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if line.startswith("LSE_API_KEY="):
            return line.partition("=")[2].strip() or None
    return None


def _get_json(url, headers, timeout=30):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def _lse_get(path, params, key):
    params = {k: v for k, v in params.items() if v is not None}
    url = f"{API_BASE}{path}?{urllib.parse.urlencode(params)}"
    # The User-Agent is load-bearing: LSE sits behind Cloudflare, which answers
    # Python's default urllib agent with 403 "error code: 1010".
    return _get_json(url, {"x-api-key": key, "User-Agent": "icarus-dashboard/1.0", "Accept": "application/json"})


def _nq_price():
    """Latest NQ futures price from Yahoo, cached a few minutes. None if unavailable."""
    now = time.time()
    if now - _ratio_cache["at"] < RATIO_TTL_SECONDS:
        return _ratio_cache["nq"]
    nq = None
    try:
        res = _get_json(YAHOO_NQ_URL, {"User-Agent": "Mozilla/5.0"}, timeout=10)["chart"]["result"][0]
        closes = [c for c in res["indicators"]["quote"][0]["close"] if c is not None]
        nq = closes[-1] if closes else None
    except Exception:  # noqa: BLE001 - the NQ column is a convenience, never a reason to fail the page
        nq = None
    _ratio_cache.update(at=now, nq=nq)
    return nq


def aggregate_by_strike(contracts, window_pct=STRIKE_WINDOW_PCT):
    """Collapse per-contract chain rows into one row per strike near spot.

    Spot is the underlying price on the most recently updated contract, since each
    row only knows the underlying as of its own last update.
    """
    live = [c for c in contracts if c.get("strike") is not None and c.get("underlying_price")]
    if not live:
        return None, []
    spot = max(live, key=lambda c: c.get("updated_at") or "")["underlying_price"]
    lo, hi = spot * (1 - window_pct), spot * (1 + window_pct)

    by_strike = {}
    for c in live:
        strike = round(c["strike"], 2)
        if not lo <= strike <= hi:
            continue
        row = by_strike.setdefault(strike, {"strike": strike, "call_vol": 0, "put_vol": 0, "call_prem": 0.0, "put_prem": 0.0})
        side = "call" if c.get("contract_type") == "call" else "put"
        row[f"{side}_vol"] += c.get("volume_today") or 0
        row[f"{side}_prem"] += c.get("premium_today") or 0.0
    return spot, [by_strike[k] for k in sorted(by_strike, reverse=True)]


def _find_chain(underlying, key):
    """Today's expiry, or the next one within a few days (weekends, holidays).

    Asks by explicit expiry date on purpose: LSE keeps EXPIRED contracts in the
    chain frozen at dte=0, so max_dte=0 returns a month of dead expiries.
    """
    today = datetime.now(ET).date()
    spot = _last_spot.get(underlying)
    for offset in range(5):
        expiry = (today + timedelta(days=offset)).isoformat()
        params = {"underlying": underlying, "expiry": expiry}
        if spot:
            params["strike_min"] = round(spot * (1 - STRIKE_WINDOW_PCT * 1.5), 2)
            params["strike_max"] = round(spot * (1 + STRIKE_WINDOW_PCT * 1.5), 2)
        rows = _lse_get("/options/chain", params, key)
        if rows:
            return expiry, rows
    return None, []


def get_options_flow(underlying="QQQ"):
    cached = _cache.get(underlying)
    if cached and time.time() - cached[0] < CACHE_SECONDS:
        return cached[1]
    result = _pull_options_flow(underlying)
    if result["ok"]:
        _cache[underlying] = (time.time(), result)
    return result


def _pull_options_flow(underlying):
    key = _load_key()
    if not key:
        return {"ok": False, "error": f"No LSE_API_KEY in {ENV_PATH}"}
    try:
        expiry, contracts = _find_chain(underlying, key)
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": f"LSE API error {e.code}: {e.read().decode(errors='replace')[:200]}"}
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        return {"ok": False, "error": f"Could not reach LSE: {e}"}

    spot, rows = aggregate_by_strike(contracts)
    if not rows:
        return {"ok": False, "error": f"No {underlying} contracts found for the next 5 days"}
    _last_spot[underlying] = spot

    nq = _nq_price()
    ratio = nq / spot if nq else None
    for row in rows:
        row["nq"] = round(row["strike"] * ratio) if ratio else None

    # LSE timestamps are naive UTC.
    freshest = max(c.get("updated_at") or "" for c in contracts)
    updated_label, age_seconds = "", None
    if freshest:
        updated_utc = datetime.strptime(freshest[:19], "%Y-%m-%d %H:%M:%S").replace(tzinfo=timezone.utc)
        updated_label = updated_utc.astimezone(CT).strftime("%-I:%M:%S %p CT")
        age_seconds = int((datetime.now(timezone.utc) - updated_utc).total_seconds())

    totals = {k: sum(r[k] for r in rows) for k in ("call_vol", "put_vol", "call_prem", "put_prem")}
    return {
        "ok": True,
        "underlying": underlying,
        "expiry": expiry,
        "spot": spot,
        "nq": nq,
        "rows": rows,
        "totals": totals,
        "updated_label": updated_label,
        "age_seconds": age_seconds,
    }


# ── IV Walls ─────────────────────────────────────────────────────────────────────────
# One statistical claim per session: "the next session stays inside this zone with 90%
# probability", computed from the next session's option board. Full spec and the
# evidence behind every constant below: docs/(C) iv-walls-design.md.

# These multipliers are EMPIRICAL, not Gaussian. Calibrated over 501 days: the textbook
# symmetric 1.645 sigma band contained only 89.2% of days and its misses were lopsided -
# 39 downside breaks against 16 upside. Phi(1.55) is 0.939, not 0.95; the pair encodes a
# fat left tail, and the put wall must sit ~20% wider than the call wall. Do not "correct"
# them back toward 1.645.
CALL_SIGMA = 1.55
PUT_SIGMA = 1.85
TRADING_DAYS = 252

# Which strikes carry a trustworthy IV. Three independent gates, because no single one
# holds. Measured 2026-09-19 on the QQQ 2026-09-21 board:
#   - delta band: the liquid core. But delta CANNOT police moneyness on its own, because
#     it is solved from the same quote as the IV - the 687 call sat 4.7% in the money
#     (~4 sigma on a 3-day board, so a true delta of ~1.000) yet reported 0.835.
#   - moneyness: a price-based window, derived from spot rather than from any greek, so a
#     bad quote cannot talk its way past it.
#   - volume floor: the 687 and 696 calls traded 6 and 1 contracts and reported 21.6% and
#     19.5% against a 10.7% board. One contract is a stale print, not a market.
# Without the last two, the estimate moved 0.36 vol points depending only on how wide the
# CALLER's pull window happened to be - so the first call after app start disagreed with
# every later one. The median absorbs a lone outlier (see tests) but cannot fix that.
IV_DELTA_MIN = 0.15
IV_DELTA_MAX = 0.85
IV_MONEYNESS_PCT = 0.04
IV_MIN_VOLUME = 25

WALLS_CACHE_SECONDS = 600  # next-session vol does not move on a 60-second clock
_walls_cache = {}


def atm_iv_from_prints(prints):
    """Median implied vol per side, and the spot they were priced against, from TRADES.

    Why not the chain: the chain's `iv` is solved from `last_price`, and QQQ options keep
    trading until 16:15 while its `underlying_price` is the 16:00 cash close. The two stop
    describing the same moment, and the error is SIGNED - post-close drift lifts one side
    and cuts the other. Measured 2026-09-18 on the 09-21 board, that inverted the skew:
    the chain read call 10.71% / put 9.88%, while trades in the last five minutes of the
    session read call 7.23% / put 11.17%, and every one of five sampled sessions had put
    above call, which is ordinary equity skew. Sizing the put wall off the smaller number
    and the call wall off the larger is backwards, and it is the wrong wall that gets wide.

    A print carries no such mismatch: each one has its own trade price AND its own
    underlying_price, so the IV is internally consistent whatever time it happened.

    Returns (iv_call, iv_put, spot). Any of them may be None.
    """
    per_side = {"call": [], "put": []}
    spots = [p["underlying_price"] for p in prints if p.get("underlying_price")]
    if not spots:
        return None, None, None
    spot = statistics.median(spots)
    lo, hi = spot * (1 - IV_MONEYNESS_PCT), spot * (1 + IV_MONEYNESS_PCT)
    for c in prints:
        side, iv, delta, strike = c.get("contract_type"), c.get("iv"), c.get("delta"), c.get("strike")
        if side not in per_side or iv is None or delta is None or strike is None:
            continue
        if not lo <= float(strike) <= hi:
            continue
        if not IV_DELTA_MIN <= abs(float(delta)) <= IV_DELTA_MAX:
            continue
        # No volume gate here, unlike the chain path: a print IS a trade, and a strike that
        # traded more contributes more prints, which is the weighting we want anyway.
        per_side[side].append(float(iv))
    return (statistics.median(per_side["call"]) if per_side["call"] else None,
            statistics.median(per_side["put"]) if per_side["put"] else None,
            spot)


def atm_iv(contracts, spot):
    """Median implied vol per side over liquid near-the-money strikes.

    Returns (iv_call, iv_put) as decimals. A side with no usable contract comes back None
    rather than borrowing from the other side, which would erase the skew this model runs on.

    Deliberately independent of how wide the caller's chain pull was: every gate is
    absolute, so a full chain and a windowed one give the same answer.
    """
    per_side = {"call": [], "put": []}
    if not spot:
        return None, None
    lo, hi = spot * (1 - IV_MONEYNESS_PCT), spot * (1 + IV_MONEYNESS_PCT)
    for c in contracts:
        side = c.get("contract_type")
        iv, delta, strike = c.get("iv"), c.get("delta"), c.get("strike")
        if side not in per_side or iv is None or delta is None or strike is None:
            continue
        if (c.get("volume_today") or 0) < IV_MIN_VOLUME:
            continue
        if not lo <= float(strike) <= hi:
            continue
        if not IV_DELTA_MIN <= abs(float(delta)) <= IV_DELTA_MAX:
            continue
        per_side[side].append(float(iv))
    return (statistics.median(per_side["call"]) if per_side["call"] else None,
            statistics.median(per_side["put"]) if per_side["put"] else None)


def iv_walls(spot, iv_call, iv_put):
    """The next session's 90% containment zone, as (lower, upper).

    Lognormal over one trading day - NOT scaled by the board's calendar dte. A Saturday
    pull sees dte=4 for Monday's board, but the move being forecast is one session.

    Verified against the one forecast the model's author put on record (NDX 28,274.2 at
    26.0 vol -> 27,430 / 29,001): this reproduces both walls to 0.3 points, while a linear
    band using the same multipliers misses by 9 to 13.
    """
    if not spot or iv_call is None or iv_put is None:
        return None, None
    root = math.sqrt(TRADING_DAYS)
    return (spot * math.exp(-PUT_SIGMA * iv_put / root),
            spot * math.exp(CALL_SIGMA * iv_call / root))


def _find_next_session_chain(underlying, key):
    """The NEXT session's board. Never today's, and never an expired one.

    0DTE closing IV is banned as a source: at 4PM it prices the last minutes of a dying
    board. Measured on an expired board 2026-09-18, one strike carried a 79% call IV
    against a 444% put IV; the next session's board came back 12.1% / 12.0%.

    Starts at offset 1 so weekends and holidays fall through to the next real expiry, and
    asks by explicit expiry because LSE keeps expired contracts in the chain frozen at dte=0.
    """
    today = datetime.now(ET).date()
    spot = _last_spot.get(underlying)
    for offset in range(1, 6):
        expiry = (today + timedelta(days=offset)).isoformat()
        params = {"underlying": underlying, "expiry": expiry}
        if spot:
            params["strike_min"] = round(spot * (1 - STRIKE_WINDOW_PCT * 1.5), 2)
            params["strike_max"] = round(spot * (1 + STRIKE_WINDOW_PCT * 1.5), 2)
        rows = _lse_get("/options/chain", params, key)
        if rows:
            return expiry, rows
    return None, []


def _recent_prints(underlying, expiry, key, limit=5000):
    """The most recent trades on one board. LSE returns newest first, so this is the
    freshest slice of the tape without needing to know when the session ended."""
    return _lse_get("/options/flow", {"underlying": underlying, "expiry": expiry, "limit": limit}, key)


def get_iv_walls(underlying="QQQ"):
    cached = _walls_cache.get(underlying)
    if cached and time.time() - cached[0] < WALLS_CACHE_SECONDS:
        return cached[1]
    result = _pull_iv_walls(underlying)
    if result["ok"]:
        _walls_cache[underlying] = (time.time(), result)
    return result


def _pull_iv_walls(underlying):
    key = _load_key()
    if not key:
        return {"ok": False, "error": f"No LSE_API_KEY in {ENV_PATH}"}
    try:
        expiry, contracts = _find_next_session_chain(underlying, key)
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": f"LSE API error {e.code}: {e.read().decode(errors='replace')[:200]}"}
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        return {"ok": False, "error": f"Could not reach LSE: {e}"}

    priced = [c for c in contracts if c.get("underlying_price")]
    if not priced:
        return {"ok": False, "error": f"No {underlying} board found for the next 5 days"}

    # Trades first - see atm_iv_from_prints for why the chain's own IV cannot be trusted
    # for skew. The chain stays as a fallback so a quiet tape still produces a band.
    source = "prints"
    iv_call = iv_put = spot = None
    try:
        iv_call, iv_put, spot = atm_iv_from_prints(_recent_prints(underlying, expiry, key))
    except (urllib.error.HTTPError, urllib.error.URLError, TimeoutError, ValueError):
        pass
    if iv_call is None or iv_put is None or spot is None:
        source = "chain"
        spot = max(priced, key=lambda c: c.get("updated_at") or "")["underlying_price"]
        iv_call, iv_put = atm_iv(contracts, spot)
    if iv_call is None or iv_put is None:
        missing = "calls" if iv_call is None else "puts"
        return {"ok": False, "error": f"No traded near-the-money {missing} on the {expiry} board"}

    lower, upper = iv_walls(spot, iv_call, iv_put)
    nq = _nq_price()
    ratio = nq / spot if nq else None
    return {
        "ok": True,
        "underlying": underlying,
        "expiry": expiry,
        "spot": spot,
        "iv_source": source,
        "iv_call": iv_call,
        "iv_put": iv_put,
        "lower": lower,
        "upper": upper,
        "lower_nq": round(lower * ratio) if ratio else None,
        "upper_nq": round(upper * ratio) if ratio else None,
    }
