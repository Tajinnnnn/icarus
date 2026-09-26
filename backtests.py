# Backtests page: visual replay of engine runs. The engine lives outside this
# repo (see BACKTEST_DIR in config.py) and runs on the system python3 with
# no third-party deps, so a RUN is a subprocess of visual_backtest.py there,
# while listing runs, loading a run's trades and slicing bars are direct
# imports of that same module (pure JSON/CSV reads).
import importlib.util
import json
import os
import subprocess
import sys
import threading

from config import BACKTEST_DIR

RUNNER = BACKTEST_DIR / "visual_backtest.py"

_mod = None
_run_state = {"running": False, "started": None, "result": None, "error": None, "log": ""}


def _runner():
    global _mod
    if _mod is None:
        if not RUNNER.is_file():
            raise RuntimeError("Backtests are not configured. Set ICARUS_BACKTEST_DIR to your compatible backtest engine folder.")
        if str(BACKTEST_DIR) not in sys.path:
            sys.path.insert(0, str(BACKTEST_DIR))
        spec = importlib.util.spec_from_file_location("visual_backtest", str(RUNNER))
        _mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(_mod)
    return _mod


def list_backtest_runs():
    try:
        return {"ok": True, "runs": _runner().list_runs(), "running": _run_state["running"]}
    except Exception as e:  # noqa: BLE001 - surfaced to the page as text
        return {"ok": False, "error": str(e), "runs": [], "running": _run_state["running"]}


def get_backtest_run(run_id):
    try:
        return {"ok": True, "run": _runner().load_run(run_id)}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": str(e)}


def get_backtest_bars(symbol, resolution, start_iso, end_iso):
    try:
        return {"ok": True, "bars": _runner().bars_between(symbol, resolution, start_iso, end_iso)}
    except Exception as e:  # noqa: BLE001
        return {"ok": False, "error": str(e), "bars": []}


def start_backtest_run(label=None):
    if _run_state["running"]:
        return {"ok": False, "error": "A run is already in progress."}

    def _work():
        try:
            cmd = ["python3", str(RUNNER), "--run"] + (["--label", label] if label else [])
            proc = subprocess.run(cmd, cwd=str(BACKTEST_DIR), capture_output=True, text=True, timeout=1800)
            _run_state["log"] = (proc.stdout or "")[-4000:] + (proc.stderr or "")[-4000:]
            if proc.returncode != 0:
                _run_state["error"] = f"exit {proc.returncode}: {(proc.stderr or proc.stdout or '').strip()[-600:]}"
            else:
                last = (proc.stdout or "").strip().splitlines()
                _run_state["result"] = json.loads(last[-1]) if last else None
        except Exception as e:  # noqa: BLE001
            _run_state["error"] = str(e)
        finally:
            _run_state["running"] = False

    _run_state.update({"running": True, "result": None, "error": None, "log": ""})
    threading.Thread(target=_work, daemon=True).start()
    return {"ok": True}


def get_backtest_run_status():
    return dict(_run_state)
