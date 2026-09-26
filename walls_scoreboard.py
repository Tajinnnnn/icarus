"""Grade the IV Walls forecasts, so the band is measured rather than asserted.

The model's author is explicit that grading is part of the model: "graded every morning on
a rolling scoreboard. If the scoreboard drifts off 90%, the calibration gets revisited."
This matters more here than it did for him, because his 1.55/1.85 multipliers were
calibrated against NDX with VXN as the vol input, while this build feeds QQQ side-specific
board IV. The multipliers have never been validated against that. The scoreboard is how we
find out.

One CSV, one row per forecast session. A row is written when the forecast is made and
filled in once the session it forecast has closed. A forecast may be refined while its
target session is still in the future; once a row is graded it is FROZEN, and this module
refuses to alter it - see _merge(). A scoreboard that can silently rewrite its own
forecasts measures nothing.

Grading uses Yahoo's DAILY bar, which is regular-session only. Measured 2026-09-19 against
Yahoo's own minute tape: the daily bar agrees to <= $0.03 over five sessions, while
including pre/post market puts the 2026-09-16 low at 658.35 against a true 700.00 - a 5.9%
phantom excursion, against a put wall that sits ~1.4% away. It would score as a breach and
trigger a recalibration of a model that was working. NEVER grade with extended hours.

Regular session is also the correct boundary, not merely the safe one: the multipliers were
calibrated against NDX, an index that only computes during the regular session.

    uv run python walls_scoreboard.py record    # tonight's forecast for the next session
    uv run python walls_scoreboard.py grade     # fill in any session that has since closed
    uv run python walls_scoreboard.py summary
"""
import csv
import os
import sys
import tempfile
from datetime import datetime, date
from zoneinfo import ZoneInfo

from config import TRADING_DIR
from flow import _get_json  # one place owns the Yahoo/urllib quirks

ET = ZoneInfo("America/New_York")
SCOREBOARD_PATH = TRADING_DIR / "07 System" / "lse" / "walls" / "scoreboard.csv"
YAHOO_DAILY = "https://query1.finance.yahoo.com/v8/finance/chart/{sym}?range=3mo&interval=1d"

FORECAST_FIELDS = ["underlying", "session", "forecast_at", "spot", "iv_call", "iv_put", "lower", "upper"]
GRADE_FIELDS = ["actual_low", "actual_high", "contained_lower", "contained_upper", "graded_at"]
FIELDS = FORECAST_FIELDS + GRADE_FIELDS


def _read(path=None):
    path = path or SCOREBOARD_PATH
    if not path.exists():
        return []
    with open(path, newline="") as f:
        return list(csv.DictReader(f))


def _write(rows, path=None):
    """Atomic, so a crash mid-write cannot truncate the forecast history."""
    path = path or SCOREBOARD_PATH
    path.parent.mkdir(parents=True, exist_ok=True)
    fd, tmp = tempfile.mkstemp(dir=path.parent, suffix=".tmp")
    with os.fdopen(fd, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=FIELDS)
        writer.writeheader()
        writer.writerows(sorted(rows, key=lambda r: (r["session"], r["underlying"])))
    os.replace(tmp, path)


def is_graded(row):
    return bool(row.get("graded_at"))


def _merge(existing, incoming):
    """A graded row is frozen. An ungraded one may be refined until its session arrives."""
    if is_graded(existing):
        raise ValueError(f"{existing['session']} is already graded - forecasts are frozen once graded")
    return {**existing, **incoming}


def record(walls, now=None, path=None):
    """Write (or refine) the forecast for the session `walls` describes.

    The target session is always in the future by construction: get_iv_walls() reads the
    NEXT session's board, never today's. So the last write before that session opens is
    what gets graded, which is the evening forecast whenever the app is open in the evening.
    """
    if not walls.get("ok"):
        raise ValueError(f"refusing to record a failed pull: {walls.get('error')}")
    now = now or datetime.now(ET)
    incoming = {
        "underlying": walls["underlying"],
        "session": walls["expiry"],
        "forecast_at": now.isoformat(timespec="seconds"),
        "spot": f"{walls['spot']:.4f}",
        "iv_call": f"{walls['iv_call']:.6f}",
        "iv_put": f"{walls['iv_put']:.6f}",
        "lower": f"{walls['lower']:.4f}",
        "upper": f"{walls['upper']:.4f}",
    }
    rows = _read(path)
    key = (incoming["underlying"], incoming["session"])
    for i, row in enumerate(rows):
        if (row["underlying"], row["session"]) == key:
            rows[i] = _merge(row, incoming)
            break
    else:
        rows.append({**{f: "" for f in FIELDS}, **incoming})
    _write(rows, path)
    return incoming


def daily_bars(underlying):
    """{date -> (low, high)} from Yahoo's regular-session daily bar. No key needed."""
    res = _get_json(YAHOO_DAILY.format(sym=underlying), {"User-Agent": "Mozilla/5.0"}, timeout=20)
    res = res["chart"]["result"][0]
    q = res["indicators"]["quote"][0]
    bars = {}
    for i, ts in enumerate(res["timestamp"]):
        low, high = q["low"][i], q["high"][i]
        if low is None or high is None:
            continue
        bars[datetime.fromtimestamp(ts, ET).date().isoformat()] = (low, high)
    return bars


def grade(bars_by_symbol=None, today=None, now=None, path=None):
    """Fill in every ungraded row whose session has closed. Returns the rows it graded."""
    today = today or datetime.now(ET).date()
    now = now or datetime.now(ET)
    rows = _read(path)
    due = [r for r in rows if not is_graded(r) and date.fromisoformat(r["session"]) < today]
    if not due:
        return []

    bars_by_symbol = bars_by_symbol or {}
    graded = []
    for row in due:
        sym = row["underlying"]
        if sym not in bars_by_symbol:
            bars_by_symbol[sym] = daily_bars(sym)
        bar = bars_by_symbol[sym].get(row["session"])
        if bar is None:
            continue  # market holiday, or the bar has not published yet - try again later
        low, high = bar
        row.update({
            "actual_low": f"{low:.4f}",
            "actual_high": f"{high:.4f}",
            "contained_lower": str(low >= float(row["lower"])),
            "contained_upper": str(high <= float(row["upper"])),
            "graded_at": now.isoformat(timespec="seconds"),
        })
        graded.append(row)
    if graded:
        _write(rows, path)
    return graded


def summary(path=None):
    """Containment rates. Per side, because the whole point of 1.55/1.85 is that the sides
    fail differently - a joint rate alone hides which wall is miscalibrated."""
    rows = _read(path)
    done = [r for r in rows if is_graded(r)]
    n = len(done)
    up = sum(r["contained_upper"] == "True" for r in done)
    dn = sum(r["contained_lower"] == "True" for r in done)
    both = sum(r["contained_upper"] == "True" and r["contained_lower"] == "True" for r in done)
    rate = lambda k: round(k / n * 100, 1) if n else None
    return {
        "graded": n,
        "pending": len(rows) - n,
        "call_wall_held_pct": rate(up),
        "put_wall_held_pct": rate(dn),
        "both_held_pct": rate(both),
        "target_both_pct": 90.0,
    }


def main(argv):
    command = argv[1] if len(argv) > 1 else "summary"
    if command == "record":
        from flow import get_iv_walls
        walls = get_iv_walls()
        if not walls["ok"]:
            print("could not pull walls:", walls["error"])
            return 1
        got = record(walls)
        print(f"recorded {got['underlying']} {got['session']}: {float(got['lower']):.2f} - {float(got['upper']):.2f}")
    elif command == "grade":
        done = grade()
        print(f"graded {len(done)} session(s)")
        for r in done:
            held = "held" if r["contained_lower"] == "True" and r["contained_upper"] == "True" else "BREACHED"
            print(f"  {r['session']}  {r['lower']}-{r['upper']}  actual {r['actual_low']}-{r['actual_high']}  {held}")
    for k, v in summary().items():
        print(f"  {k:20} {v}")
    return 0


if __name__ == "__main__":
    sys.exit(main(sys.argv))
