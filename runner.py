import json
import os
import subprocess
import tempfile
import threading
import time
from pathlib import Path

_active_runs = {}  # crew_id -> subprocess.Popen
_stop_requested = set()  # crew_ids the user asked to stop (protected by _lock)
_lock = threading.Lock()

_LOG_TAIL_LINES = 50
_STOP_GRACE_SECONDS = 5.0

# CrewAI's human-in-the-loop feedback prompt (crewai/core/providers/human_input.py)
# prints a rich Panel titled "Human Feedback Required" or "Training Feedback
# Required" right before blocking on input(). Watching the streamed log for this
# substring is how we know the subprocess is now waiting on stdin, so the
# dashboard can surface an input box instead of leaving the run looking stuck.
# Fragile to a CrewAI wording change; if that happens, the symptom is a run
# that hangs silently instead of showing an input box - fine to leave until
# it actually breaks (v1 doesn't need a general-purpose detector for this).
AWAITING_INPUT_MARKER = "Feedback Required"


def is_running(crew_id: str) -> bool:
    with _lock:
        proc = _active_runs.get(crew_id)
        if proc is None:
            return False
        if proc == "starting":
            return True
        return proc.poll() is None


def send_input(crew_id: str, text: str) -> bool:
    """
    Writes text (as a line) to the stdin of crew_id's running subprocess -
    how a human's reply to a CrewAI feedback prompt gets relayed in. Returns
    False if there's no active subprocess for this crew.
    """
    with _lock:
        proc = _active_runs.get(crew_id)
    if proc is None or proc == "starting" or proc.stdin is None:
        return False
    try:
        proc.stdin.write(text + "\n")
        proc.stdin.flush()
        return True
    except (BrokenPipeError, OSError):
        return False


def _terminate_with_grace(proc, grace_seconds: float = _STOP_GRACE_SECONDS):
    """
    Asks proc to exit (SIGTERM) and arms a background timer that force-kills
    it (SIGKILL) if it's still alive after grace_seconds - covers crews that
    catch/ignore the polite signal.
    """
    try:
        proc.terminate()
    except ProcessLookupError:
        return

    def _force_kill():
        if proc.poll() is None:
            try:
                proc.kill()
            except ProcessLookupError:
                pass

    threading.Timer(grace_seconds, _force_kill).start()


def stop_run(crew_id: str) -> bool:
    """
    Requests termination of crew_id's active run, if any. Handles the race
    where the run is still in the synchronous "starting" placeholder window
    (before _worker has spawned the real subprocess) by recording the stop
    request so _worker terminates it immediately once it spawns. Returns
    False if there is no active run for crew_id.
    """
    with _lock:
        proc = _active_runs.get(crew_id)
        if proc is None:
            return False
        _stop_requested.add(crew_id)
        target = proc if proc != "starting" else None

    if target is not None:
        _terminate_with_grace(target)
    return True


def stop_all_runs():
    """Stops every crew currently running - used when quitting the app so no subprocess is orphaned."""
    with _lock:
        crew_ids = list(_active_runs.keys())
    for crew_id in crew_ids:
        stop_run(crew_id)


def build_command(entry, inputs_path: Path):
    """
    The real command used to run a crew: invokes `uv run --project <crew_dir>`
    so uv resolves/repairs that crew's own venv, then calls its
    run_with_inputs(inputs) with -u for unbuffered (truly live) stdout.
    """
    script = (
        "import json, importlib, sys\n"
        f"mod = importlib.import_module({entry.module!r})\n"
        "inputs = json.load(open(sys.argv[1]))\n"
        f"mod.{entry.entry_function}(inputs)\n"
    )
    return ["uv", "run", "--project", str(entry.project_dir), "python", "-u", "-c", script, str(inputs_path)]


def scan_outputs(output_dir, since_timestamp: float):
    """
    Files under output_dir modified at/after since_timestamp. The dashboard
    opens these with the OS default app / reveals them in Finder rather than
    rendering content inline, so only path/name/mtime are needed here.
    """
    output_dir = Path(output_dir)
    if not output_dir.is_dir():
        return []

    results = []
    for path in sorted(output_dir.rglob("*")):
        if not path.is_file():
            continue
        mtime = path.stat().st_mtime
        if mtime < since_timestamp:
            continue
        results.append(
            {
                "path": str(path),
                "name": str(path.relative_to(output_dir)),
                "mtime": mtime,
            }
        )
    return results


def open_output_file(path: str):
    """Opens path with its default macOS application, like double-clicking it in Finder."""
    subprocess.run(["open", path], check=False)


def reveal_output_file(path: str):
    """Opens Finder with path selected in its containing folder."""
    subprocess.run(["open", "-R", path], check=False)


def start_run(entry, inputs: dict, on_log, on_done, on_awaiting_input=None, command_builder=build_command):
    """
    Runs entry's run_with_inputs(inputs) in a subprocess on a background
    thread, calling on_log(line) for each line of output as it arrives and
    on_done(success, payload) exactly once when the process exits.

    on_awaiting_input(), if given, is called (with no arguments) whenever the
    crew's output shows it's now blocked waiting for a human-feedback reply
    on stdin (see AWAITING_INPUT_MARKER) - the caller can send that reply via
    send_input(entry.id, text).

    payload is {"outputs": [...]} on success (see scan_outputs), or
    {"error": str, "log_tail": [str, ...]} on failure.

    Returns False without starting anything if a run for this crew is
    already in progress; True otherwise.
    """
    with _lock:
        if entry.id in _active_runs:
            return False
        # Reserve the slot synchronously so a second call made immediately
        # after this one returns can never race the background thread that
        # hasn't spawned the real subprocess yet.
        _active_runs[entry.id] = "starting"
        _stop_requested.discard(entry.id)

    def _worker():
        start_time = time.time()
        tmp = tempfile.NamedTemporaryFile(mode="w", suffix=".json", delete=False)
        tmp_path = Path(tmp.name)
        try:
            json.dump(inputs, tmp)
            tmp.close()

            command = command_builder(entry, tmp_path)
            env = {**os.environ, "PYTHONUNBUFFERED": "1", "ICARUS_INPUTS_FILE": str(tmp_path), "ICARUS_INPUT": str(inputs.get("input", ""))}

            proc = subprocess.Popen(
                command,
                cwd=str(entry.project_dir),
                stdin=subprocess.PIPE,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
                env=env,
            )
            with _lock:
                _active_runs[entry.id] = proc
                stop_during_start = entry.id in _stop_requested
            if stop_during_start:
                _terminate_with_grace(proc)

            log_tail = []
            for line in proc.stdout:
                line = line.rstrip("\n")
                log_tail.append(line)
                del log_tail[:-_LOG_TAIL_LINES]
                on_log(line)
                marker = getattr(entry, "feedback_marker", AWAITING_INPUT_MARKER)
                if on_awaiting_input and marker and marker in line:
                    on_awaiting_input()

            exit_code = proc.wait()

            with _lock:
                was_stopped = entry.id in _stop_requested
                _stop_requested.discard(entry.id)

            if was_stopped:
                on_done(False, {"error": "Stopped by user", "stopped": True})
            elif exit_code == 0:
                outputs = scan_outputs(entry.output_dir, start_time)
                on_done(True, {"outputs": outputs})
            else:
                on_done(False, {"error": f"Exited with code {exit_code}", "log_tail": log_tail})
        except Exception as e:
            on_done(False, {"error": str(e)})
        finally:
            with _lock:
                _active_runs.pop(entry.id, None)
                _stop_requested.discard(entry.id)
            tmp_path.unlink(missing_ok=True)

    threading.Thread(target=_worker, daemon=True).start()
    return True
