import subprocess
import sys
import threading
import time
from dataclasses import dataclass
from pathlib import Path

import pytest

import runner


@dataclass
class FakeCrewEntry:
    id: str
    project_dir: Path
    output_dir: Path


def _wait_for(predicate, timeout=5):
    deadline = time.time() + timeout
    while time.time() < deadline:
        if predicate():
            return True
        time.sleep(0.02)
    return False


def _success_builder(script):
    def builder(entry, inputs_path):
        return [sys.executable, "-u", "-c", script]

    return builder


def test_successful_run_streams_logs_and_scans_new_output(tmp_path):
    project_dir = tmp_path
    output_dir = project_dir / "output"
    output_dir.mkdir()

    entry = FakeCrewEntry(id="fake", project_dir=project_dir, output_dir=output_dir)

    script = (
        "import pathlib, time\n"
        "print('line one')\n"
        "print('line two')\n"
        "pathlib.Path('output/result.md').write_text('# done')\n"
    )

    lines = []
    done = {}
    done_event = threading.Event()

    def on_log(line):
        lines.append(line)

    def on_done(success, payload):
        done["success"] = success
        done["payload"] = payload
        done_event.set()

    started = runner.start_run(
        entry, {}, on_log, on_done, command_builder=_success_builder(script)
    )
    assert started is True
    assert done_event.wait(timeout=5)

    assert lines == ["line one", "line two"]
    assert done["success"] is True
    outputs = done["payload"]["outputs"]
    assert len(outputs) == 1
    assert outputs[0]["name"] == "result.md"
    assert "mtime" in outputs[0]


def test_failed_run_reports_error_and_log_tail(tmp_path):
    project_dir = tmp_path
    output_dir = project_dir / "output"
    output_dir.mkdir()
    entry = FakeCrewEntry(id="fake-fail", project_dir=project_dir, output_dir=output_dir)

    script = "import sys; print('about to fail'); sys.exit(3)"

    done = {}
    done_event = threading.Event()

    def on_log(line):
        pass

    def on_done(success, payload):
        done["success"] = success
        done["payload"] = payload
        done_event.set()

    started = runner.start_run(
        entry, {}, on_log, on_done, command_builder=_success_builder(script)
    )
    assert started is True
    assert done_event.wait(timeout=5)

    assert done["success"] is False
    assert "3" in done["payload"]["error"]
    assert "about to fail" in done["payload"]["log_tail"]


def test_second_run_is_rejected_while_one_is_in_progress(tmp_path):
    project_dir = tmp_path
    output_dir = project_dir / "output"
    output_dir.mkdir()
    entry = FakeCrewEntry(id="fake-busy", project_dir=project_dir, output_dir=output_dir)

    script = "import time; time.sleep(1)"

    done_event = threading.Event()

    def on_log(line):
        pass

    def on_done(success, payload):
        done_event.set()

    first_started = runner.start_run(
        entry, {}, on_log, on_done, command_builder=_success_builder(script)
    )
    assert first_started is True
    assert runner.is_running("fake-busy") is True

    second_started = runner.start_run(
        entry, {}, on_log, on_done, command_builder=_success_builder(script)
    )
    assert second_started is False

    assert done_event.wait(timeout=5)
    assert _wait_for(lambda: not runner.is_running("fake-busy"))


def test_scan_outputs_ignores_files_older_than_since_timestamp(tmp_path):
    output_dir = tmp_path / "output"
    output_dir.mkdir()
    old_file = output_dir / "old.md"
    old_file.write_text("old")

    # Force an mtime clearly in the past, then scan from "now".
    past = time.time() - 3600
    import os

    os.utime(old_file, (past, past))

    since = time.time()
    new_file = output_dir / "new.md"
    new_file.write_text("new")

    results = runner.scan_outputs(output_dir, since)
    names = [r["name"] for r in results]
    assert "new.md" in names
    assert "old.md" not in names


def test_scan_outputs_returns_empty_list_for_missing_directory(tmp_path):
    missing_dir = tmp_path / "does-not-exist"
    assert runner.scan_outputs(missing_dir, time.time()) == []


def test_awaiting_input_marker_triggers_callback_and_send_input_unblocks_it(tmp_path):
    project_dir = tmp_path
    output_dir = project_dir / "output"
    output_dir.mkdir()
    entry = FakeCrewEntry(id="fake-feedback", project_dir=project_dir, output_dir=output_dir)

    # Mirrors the shape of crewai's real prompt closely enough for the
    # marker match: prints something containing "Feedback Required", then
    # blocks on stdin, then echoes whatever it reads back out.
    script = (
        "print('some prior output')\n"
        "print('Human Feedback Required')\n"
        "reply = input()\n"
        "print('got reply: ' + reply)\n"
    )

    lines = []
    awaiting_calls = []
    done_event = threading.Event()

    def on_log(line):
        lines.append(line)

    def on_awaiting_input():
        awaiting_calls.append(True)

    def on_done(success, payload):
        done_event.set()

    started = runner.start_run(
        entry, {}, on_log, on_done, on_awaiting_input, command_builder=_success_builder(script)
    )
    assert started is True

    assert _wait_for(lambda: len(awaiting_calls) == 1)
    assert _wait_for(lambda: runner.is_running("fake-feedback"))

    sent = runner.send_input("fake-feedback", "looks good")
    assert sent is True

    assert done_event.wait(timeout=5)
    assert "got reply: looks good" in lines


def test_send_input_returns_false_when_no_run_is_active():
    assert runner.send_input("no-such-crew", "hello") is False


def test_stop_run_terminates_a_running_process_and_reports_stopped_not_failed(tmp_path):
    project_dir = tmp_path
    output_dir = project_dir / "output"
    output_dir.mkdir()
    entry = FakeCrewEntry(id="fake-stop", project_dir=project_dir, output_dir=output_dir)

    script = "import time; time.sleep(30)"

    done = {}
    done_event = threading.Event()

    def on_done(success, payload):
        done["success"] = success
        done["payload"] = payload
        done_event.set()

    started = runner.start_run(
        entry, {}, lambda line: None, on_done, command_builder=_success_builder(script)
    )
    assert started is True
    assert _wait_for(lambda: runner.is_running("fake-stop"))

    stopped = runner.stop_run("fake-stop")
    assert stopped is True

    assert done_event.wait(timeout=5)
    assert done["success"] is False
    assert done["payload"]["stopped"] is True
    assert _wait_for(lambda: not runner.is_running("fake-stop"))


def test_stop_run_returns_false_when_no_active_run():
    assert runner.stop_run("no-such-crew") is False


def test_stop_requested_during_starting_window_terminates_as_soon_as_it_spawns(tmp_path):
    project_dir = tmp_path
    output_dir = project_dir / "output"
    output_dir.mkdir()
    entry = FakeCrewEntry(id="fake-stop-early", project_dir=project_dir, output_dir=output_dir)

    def slow_to_spawn_builder(entry, inputs_path):
        # Holds _active_runs[entry.id] at the "starting" placeholder for a
        # moment, giving the test a reliable window to call stop_run()
        # before the real subprocess exists.
        time.sleep(0.3)
        return [sys.executable, "-u", "-c", "import time; time.sleep(30)"]

    done = {}
    done_event = threading.Event()

    def on_done(success, payload):
        done["success"] = success
        done["payload"] = payload
        done_event.set()

    started = runner.start_run(
        entry, {}, lambda line: None, on_done, command_builder=slow_to_spawn_builder
    )
    assert started is True
    assert runner.is_running("fake-stop-early") is True  # still in the "starting" placeholder

    stopped = runner.stop_run("fake-stop-early")
    assert stopped is True

    assert done_event.wait(timeout=5)
    assert done["success"] is False
    assert done["payload"]["stopped"] is True
    assert _wait_for(lambda: not runner.is_running("fake-stop-early"))


def test_terminate_with_grace_force_kills_a_process_that_ignores_sigterm():
    proc = subprocess.Popen(
        [sys.executable, "-u", "-c", "import signal, time; signal.signal(signal.SIGTERM, signal.SIG_IGN); time.sleep(30)"]
    )
    try:
        assert _wait_for(lambda: proc.poll() is None, timeout=2)
        runner._terminate_with_grace(proc, grace_seconds=0.3)
        assert _wait_for(lambda: proc.poll() is not None, timeout=5)
    finally:
        if proc.poll() is None:
            proc.kill()
            proc.wait()


def test_open_output_file_invokes_macos_open(monkeypatch):
    calls = []
    monkeypatch.setattr(runner.subprocess, "run", lambda args, **kwargs: calls.append(args))
    runner.open_output_file("/tmp/some/output.md")
    assert calls == [["open", "/tmp/some/output.md"]]


def test_reveal_output_file_invokes_macos_open_with_reveal_flag(monkeypatch):
    calls = []
    monkeypatch.setattr(runner.subprocess, "run", lambda args, **kwargs: calls.append(args))
    runner.reveal_output_file("/tmp/some/output.md")
    assert calls == [["open", "-R", "/tmp/some/output.md"]]


def test_stop_all_runs_stops_every_active_crew(tmp_path):
    entries = [
        FakeCrewEntry(id="fake-a", project_dir=tmp_path, output_dir=tmp_path / "output-a"),
        FakeCrewEntry(id="fake-b", project_dir=tmp_path, output_dir=tmp_path / "output-b"),
    ]
    for entry in entries:
        entry.output_dir.mkdir()

    script = "import time; time.sleep(30)"
    done_events = {}
    for entry in entries:
        done_event = threading.Event()
        done_events[entry.id] = done_event
        started = runner.start_run(
            entry, {}, lambda line: None, lambda success, payload, e=done_event: e.set(),
            command_builder=_success_builder(script),
        )
        assert started is True
    for entry in entries:
        assert _wait_for(lambda e=entry: runner.is_running(e.id))

    runner.stop_all_runs()

    for entry in entries:
        assert done_events[entry.id].wait(timeout=5)
        assert _wait_for(lambda e=entry: not runner.is_running(e.id))
