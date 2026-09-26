import walls_daemon as wd


def test_a_tick_grades_first_then_records(monkeypatch):
    # Order matters: grading uses the walls already on the board, so recording first
    # would be harmless but grading first keeps the summary the page reads current.
    calls = []
    monkeypatch.setattr(wd, "grade", lambda: calls.append("grade") or [{"session": "2026-09-21"}])
    monkeypatch.setattr(wd, "get_iv_walls", lambda: {"ok": True})
    monkeypatch.setattr(wd, "record", lambda w: calls.append("record") or
                        {"session": "2026-09-22", "forecast_at": "2026-09-21T18:00:00"})
    got = wd.tick()
    assert calls == ["grade", "record"]
    assert got["state"] == "ok"
    assert got["session"] == "2026-09-22"
    assert got["graded"] == 1


def test_a_failed_walls_pull_still_reports_what_was_graded(monkeypatch):
    monkeypatch.setattr(wd, "grade", lambda: [{"session": "2026-09-21"}])
    monkeypatch.setattr(wd, "get_iv_walls", lambda: {"ok": False, "error": "no board"})
    monkeypatch.setattr(wd, "record", lambda w: pytest_fail())
    got = wd.tick()
    assert got["state"] == "error"
    assert got["detail"] == "no board"
    assert got["graded"] == 1


def pytest_fail():
    raise AssertionError("record must not run when the pull failed")


def test_a_raising_tick_does_not_kill_the_loop(monkeypatch):
    monkeypatch.setattr(wd, "tick", lambda: (_ for _ in ()).throw(RuntimeError("boom")))
    wd._stop.set()  # one pass, then exit
    wd._loop()      # must return rather than propagate
    assert wd.get_status()["state"] in {"starting", "error"}
