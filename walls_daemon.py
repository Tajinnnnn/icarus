"""Keep the IV Walls scoreboard current while the dashboard is running.

Unlike the chart pusher, this writes nothing outside the vault - no live study, no broker,
no order. So it starts with the app and stays on, rather than being a toggle that
deliberately resets off on every restart.

It degrades gracefully when the app is closed. record() refines the forecast for a session
that has not opened yet, so every tick before that open writes the same row and the last
one wins; grade() catches up on every session that closed while the app was down. The only
forecast that can be missed outright is one for a session the app never saw before its open
- and the scoreboard shows that as a gap rather than silently scoring it.
"""
import threading
import time

from flow import get_iv_walls
from walls_scoreboard import grade, record, summary

TICK_SECONDS = 900  # the forecast is refined, not re-decided; 15 minutes is plenty
FIRST_TICK_DELAY = 20  # let the window finish loading before the first network call

_lock = threading.Lock()
_stop = threading.Event()
_thread = None
_status = {"state": "starting", "detail": "", "session": "", "recorded_at": "", "graded": 0}


def _set(**changes):
    with _lock:
        _status.update(changes)


def tick():
    """One pass: grade whatever has closed, then record the next session. Returns a status."""
    just_graded = grade()
    walls = get_iv_walls()
    if not walls["ok"]:
        return {"state": "error", "detail": walls["error"], "graded": len(just_graded)}
    got = record(walls)
    return {
        "state": "ok",
        "detail": "",
        "session": got["session"],
        "recorded_at": got["forecast_at"],
        "graded": len(just_graded),
    }


def _loop():
    _stop.wait(FIRST_TICK_DELAY)
    while not _stop.is_set():
        try:
            _set(**tick())
        except Exception as e:  # noqa: BLE001 - a bad tick must never kill the loop
            _set(state="error", detail=f"{type(e).__name__}: {e}")
        _stop.wait(TICK_SECONDS)


def start():
    global _thread
    if _thread is not None and _thread.is_alive():
        return
    _stop.clear()
    _thread = threading.Thread(target=_loop, name="walls-scoreboard", daemon=True)
    _thread.start()


def stop():
    _stop.set()


def get_status():
    with _lock:
        return {**_status, "scoreboard": summary()}
