"""FreeFlow GEX walls, vanna walls, and charm zones for the dashboard's Flow page.

Data: FreeFlow's options-market microstructure API (https://www.free-flow.site) - dealer
gamma/vanna/charm exposure, measured three independent ways: today's signed-flow (inferred
dealer positioning from classified trades), settlement OI (official, exchange-published),
and estimated intraday OI (calibrating, often unavailable). This is dealer-POSITIONING
data - LSE's flow.py has none of this, only traded volume/premium.

The API key is read from the trading workflow's existing .env (FREEFLOW_API_KEY), the same
file flow.py reads LSE_API_KEY from and the backtest engine reads MASSIVE_API_KEY from.

Each of the three GEX methodologies carries its OWN status (healthy/limited/stale/
rebuilding/unavailable/calibrating) and is never substituted for another - see
docs/superpowers/specs/... design. A caller that only wants one methodology's numbers
must check that methodology's own status field.
"""
import json
import os
import time
import urllib.error
import urllib.parse
import urllib.request

from config import TRADING_DIR

API_BASE = "https://www.free-flow.site"
ENV_PATH = TRADING_DIR / "07 System" / ".env"

# The page poll and the push loop both run about once a minute; a short cache lets them
# share one API call instead of doubling the data allowance spent - same rationale as
# flow.py's CACHE_SECONDS.
CACHE_SECONDS = 20
_cache = {}

# The nearest expiration changes at most once a day (when it rolls to the next session),
# so this is cached far longer than the GEX pull itself - one extra request per hour,
# not per refresh.
EXPIRATIONS_CACHE_SECONDS = 3600
_expirations_cache = {}


def _load_key():
    if os.environ.get("FREEFLOW_API_KEY"):
        return os.environ["FREEFLOW_API_KEY"]
    if not ENV_PATH.exists():
        return None
    for line in ENV_PATH.read_text().splitlines():
        line = line.strip()
        if line.startswith("FREEFLOW_API_KEY="):
            return line.partition("=")[2].strip() or None
    return None


def _get_json(url, headers, timeout=30):
    req = urllib.request.Request(url, headers=headers)
    with urllib.request.urlopen(req, timeout=timeout) as resp:
        return json.loads(resp.read().decode())


def _ff_get(path, params, key):
    params = {k: v for k, v in params.items() if v is not None}
    url = f"{API_BASE}{path}?{urllib.parse.urlencode(params)}"
    return _get_json(url, {"X-API-Key": key, "Accept": "application/json"})


def _nearest_expiration(underlying, key):
    """The nearest tradeable expiration FreeFlow will actually serve GEX for.

    NOT today's calendar date: /public/expirations stops listing an expiration once its
    session has closed, so after-hours (or on the day itself, post-close) "today" is
    already gone and every GEX route 500s or comes back unavailable against it. Measured
    2026-09-22 16:15 ET: exp=today -> sf_gex/oi_gex both `unavailable`
    (GEX_MODEL_UNAVAILABLE) and the single-model /public/oi-gex route 500s outright; the
    same pull against tomorrow's listed expiration came back `healthy` with real walls.
    """
    cached = _expirations_cache.get(underlying)
    if cached and time.time() - cached[0] < EXPIRATIONS_CACHE_SECONDS:
        return cached[1]
    data = _ff_get("/public/expirations", {"symbol": underlying}, key)
    expirations = data.get("expirations") or []
    if not expirations:
        return None
    nearest = expirations[0]
    _expirations_cache[underlying] = (time.time(), nearest)
    return nearest


def get_gex_walls(underlying="QQQ"):
    cached = _cache.get(underlying)
    if cached and time.time() - cached[0] < CACHE_SECONDS:
        return cached[1]
    result = _pull_gex_walls(underlying)
    if result["ok"]:
        _cache[underlying] = (time.time(), result)
    return result


def _http_error(e):
    if e.code == 429:
        retry_after = e.headers.get("Retry-After")
        return f"FreeFlow rate limit exceeded{f' - retry after {retry_after}s' if retry_after else ''}"
    return f"FreeFlow API error {e.code}: {e.read().decode(errors='replace')[:200]}"


def _pull_gex_walls(underlying):
    key = _load_key()
    if not key:
        return {"ok": False, "error": f"No FREEFLOW_API_KEY in {ENV_PATH}"}
    try:
        exp = _nearest_expiration(underlying, key)
        if not exp:
            return {"ok": False, "error": f"No upcoming expirations returned for {underlying}"}
        snapshot = _ff_get("/public/snapshot", {"symbol": underlying, "exp": exp}, key)
        vanna_charm = _ff_get("/public/vanna-charm", {"symbol": underlying, "exp": exp}, key)
    except urllib.error.HTTPError as e:
        return {"ok": False, "error": _http_error(e)}
    except (urllib.error.URLError, TimeoutError, ValueError) as e:
        return {"ok": False, "error": f"Could not reach FreeFlow: {e}"}

    # Each product member (sf_gex/oi_gex/eoi_gex) is self-contained per the API docs -
    # passed through untouched, status and all. No substitution between methodologies.
    sf_gex = snapshot.get("sf_gex") or {}
    oi_gex = snapshot.get("oi_gex") or {}
    eoi_gex = snapshot.get("eoi_gex") or {}
    spot = sf_gex.get("spot") or oi_gex.get("spot") or eoi_gex.get("spot") or vanna_charm.get("spot")

    return {
        "ok": True,
        "underlying": underlying,
        "exp": exp,
        "spot": spot,
        "sf_gex": sf_gex,
        "oi_gex": oi_gex,
        "eoi_gex": eoi_gex,
        "vanna_walls": vanna_charm.get("vanna_walls"),
        "charm_zones": vanna_charm.get("charm_zones"),
        "timestamp": vanna_charm.get("timestamp") or snapshot.get("timestamp"),
    }
