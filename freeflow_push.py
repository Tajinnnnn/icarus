"""Keep the chart's GEX Walls study current, with no script re-save.

Same mechanism as flow_push.py (see that file for the full rationale), against a
DIFFERENT study - "GEX Walls (C)", never "Options Flow Ladder (C)". Deliberately its own
copy of the safety mechanics (find-study / find-input / write-one-input / study-error),
not a shared import: design.md decision 7 is that a bug in this pusher must never be able
to reach the ladder's push, and the cheapest way to guarantee that is for the two to share
no mutable state or control flow at all - only the small, harmless NQ-price utility is
reused from flow.py (a read-only price lookup, not push-safety code).

Safety rules, because this writes to a live trading chart:
  - it only ever touches the study NAMED "GEX Walls (C)";
  - two studies with that name -> it refuses, rather than guess which one is real;
  - it finds the data input by its VALUE SHAPE, never by position, so it cannot
    write into some other input if the script's inputs are ever reordered;
  - it pushes only when the pulled snapshot's timestamp is new, so a quiet feed means
    no writes;
  - it writes ONE input and nothing else, checks the study's health after every write,
    and switches itself off the moment the study reports an error.
"""
import json
import re
import shutil
import subprocess
import threading
import time
from pathlib import Path

from flow import _nq_price
from freeflow import get_gex_walls
from freeflow_pine import build_gex_data

STUDY_NAME = "GEX Walls (C)"
from config import TV_CLI
NODE_CANDIDATES = [str(Path.home() / ".local/bin/node"), "/opt/homebrew/bin/node", "/usr/local/bin/node"]
PUSH_INTERVAL_SECONDS = 60
POST_WRITE_CHECK_SECONDS = 4  # the study recalculates after a write; read its health once it settles
CHART = "window.TradingViewApi._activeChartWidgetWV.value()"
# What the GEX Walls data input looks like: "label|<ms timestamp>|<ratio>|..." - same
# shape as the ladder's, since both start with label|ts|ratio.
DATA_SHAPE = re.compile(r"^[^|]*\|\d{12,}\|[\d.]+\|")

_lock = threading.Lock()
_stop = threading.Event()
_thread = None
_status = {"enabled": False, "state": "off", "detail": "", "pushed_label": ""}
_last_pushed_ts = None


def _node():
    for candidate in NODE_CANDIDATES:
        if Path(candidate).exists():
            return candidate
    return shutil.which("node")


def _tv(*args):
    """Run one tv CLI command and return its parsed JSON."""
    node = _node()
    if not node:
        raise RuntimeError("node not found, so the tv CLI cannot run")
    if not TV_CLI.exists():
        raise RuntimeError(f"tv CLI not found at {TV_CLI}")
    done = subprocess.run([node, str(TV_CLI), *args], capture_output=True, text=True, timeout=20)
    if done.returncode != 0:
        message = (done.stderr or done.stdout).strip().splitlines()
        raise RuntimeError(message[-1] if message else "tv CLI failed")
    return json.loads(done.stdout)


def find_gex_study(state):
    """Entity id of the one GEX Walls study on the active chart. Raises if absent or duplicated."""
    studies = state.get("studies") or state.get("indicators") or []
    matches = [s for s in studies if (s.get("name") or s.get("title")) == STUDY_NAME]
    if not matches:
        raise RuntimeError(f"'{STUDY_NAME}' is not on the active chart ({state.get('symbol', '?')})")
    if len(matches) > 1:
        raise RuntimeError(f"{len(matches)} studies named '{STUDY_NAME}' on the chart - remove the extras, then retry")
    return matches[0].get("id") or matches[0].get("entity_id")


def find_data_input(indicator):
    """Id of the input currently holding a GEX snapshot. Raises if there is not exactly one."""
    inputs = indicator.get("inputs") or []
    if isinstance(inputs, dict):
        inputs = [{"id": key, "value": value} for key, value in inputs.items()]
    matches = [i["id"] for i in inputs if isinstance(i.get("value"), str) and DATA_SHAPE.match(i["value"])]
    if len(matches) != 1:
        raise RuntimeError("The GEX Walls study on the chart has no Data input - paste the newest export over it once")
    return matches[0]


def read_inputs(entity_id):
    """The study's inputs as [{id, value}], strings cut to their first 80 characters.

    Deliberately NOT `tv indicator get`: see flow_push.py's read_inputs for why - it
    silently drops any string input over 500 characters, and the shape check only needs
    the prefix anyway.
    """
    if not re.fullmatch(r"[A-Za-z0-9_$]+", entity_id or ""):
        raise RuntimeError(f"Unexpected study id: {entity_id!r}")
    expression = (
        "(function(){var s=" + CHART + ".getStudyById('" + entity_id + "');"
        "if(!s)return null;"
        "return s.getInputValues().map(function(i){return {id:i.id,value:typeof i.value==='string'?i.value.slice(0,80):i.value}})})()"
    )
    result = _tv("ui", "eval", expression).get("result")
    if result is None:
        raise RuntimeError("The GEX Walls study disappeared from the chart")
    return {"inputs": result}


class GexStudyBroken(RuntimeError):
    """The GEX Walls study is in an error state - stop writing to it."""


def write_one_input(entity_id, input_id, value):
    """Set exactly ONE input on the study. See flow_push.py's write_one_input for why
    NOT `tv indicator set` - it rewrites every input, including TradingView's internal
    ones, and that has put a study into a parse error on its first push before."""
    expression = (
        "(function(){var s=" + CHART + ".getStudyById('" + entity_id + "');"
        "if(!s)return 'gone';"
        "s.setInputValues([{id:" + json.dumps(input_id) + ",value:" + json.dumps(value) + "}]);return 'sent'})()"
    )
    if _tv("ui", "eval", expression).get("result") != "sent":
        raise RuntimeError("The GEX Walls study disappeared from the chart")


def study_error(entity_id):
    """The study's runtime error text, or None when it is healthy."""
    expression = (
        "(function(){var d=" + CHART + "._chartWidget.model().model().dataSourceForId('" + entity_id + "');"
        "var st=d&&d.status?d.status():null;"
        "return st&&st.errorDescription?st.errorDescription.error:null})()"
    )
    return _tv("ui", "eval", expression).get("result")


def push_once(gex, nq=None):
    """Write one snapshot into the chart's GEX Walls study. Returns the label that was stamped."""
    data = build_gex_data(gex, nq=nq)
    entity_id = find_gex_study(_tv("state"))
    if study_error(entity_id):
        raise GexStudyBroken("The GEX Walls study on the chart is in an error state - remove it and add it back")
    input_id = find_data_input(read_inputs(entity_id))
    write_one_input(entity_id, input_id, data)
    time.sleep(POST_WRITE_CHECK_SECONDS)
    error = study_error(entity_id)
    if error:
        raise GexStudyBroken(f"The push put the GEX Walls study into an error state ({error}) - pushing stopped")
    return data.split("|", 1)[0]


def _set_status(**changes):
    with _lock:
        _status.update(changes)


def _loop():
    global _last_pushed_ts
    while not _stop.is_set():
        try:
            gex = get_gex_walls()
            if not gex["ok"]:
                _set_status(state="error", detail=gex["error"])
            elif gex["timestamp"] == _last_pushed_ts:
                _set_status(state="idle", detail=f"No new snapshot since {gex['timestamp']} - chart left alone")
            else:
                # An NQ-price miss must not stop the push - the ratio field just goes out
                # as 0 and the Pine side falls back to reading strikes as chart-native
                # prices (fine on an actual QQQ chart, off-scale on NQ/MNQ).
                nq = _nq_price()
                label = push_once(gex, nq)
                _last_pushed_ts = gex["timestamp"]
                _set_status(state="pushed", detail="", pushed_label=label)
        except GexStudyBroken as e:
            # Never keep writing to a study that is erroring - switch off and say why.
            _set_status(enabled=False, state="error", detail=str(e))
            _stop.set()
            return
        except Exception as e:  # noqa: BLE001 - any other failed push must never kill the loop
            _set_status(state="error", detail=str(e))
        _stop.wait(PUSH_INTERVAL_SECONDS)


def set_enabled(enabled):
    global _thread, _last_pushed_ts
    with _lock:
        _status["enabled"] = bool(enabled)
    if enabled and (_thread is None or not _thread.is_alive()):
        _stop.clear()
        _last_pushed_ts = None  # first tick after switching on always pushes
        _set_status(state="starting", detail="")
        _thread = threading.Thread(target=_loop, name="freeflow-push", daemon=True)
        _thread.start()
    elif not enabled:
        _stop.set()
        _set_status(state="off", detail="")
    return get_status()


def get_status():
    with _lock:
        return dict(_status)
