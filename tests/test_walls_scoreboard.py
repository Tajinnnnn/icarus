from datetime import date, datetime

import pytest

import walls_scoreboard as sb


@pytest.fixture
def path(tmp_path):
    return tmp_path / "scoreboard.csv"


def _walls(session="2026-09-21", spot=721.28, lower=713.02, upper=728.86):
    return {"ok": True, "underlying": "QQQ", "expiry": session, "spot": spot,
            "iv_call": 0.1071, "iv_put": 0.0988, "lower": lower, "upper": upper}


def _at(stamp):
    return datetime.fromisoformat(stamp)


# ── recording ────────────────────────────────────────────────────────────────────────

def test_a_forecast_round_trips(path):
    sb.record(_walls(), now=_at("2026-09-19T18:00:00"), path=path)
    rows = sb._read(path)
    assert len(rows) == 1
    assert rows[0]["session"] == "2026-09-21"
    assert float(rows[0]["lower"]) == 713.02
    assert rows[0]["graded_at"] == ""


def test_a_second_forecast_for_the_same_session_refines_it_rather_than_duplicating(path):
    sb.record(_walls(lower=713.02), now=_at("2026-09-19T18:00:00"), path=path)
    sb.record(_walls(lower=714.50), now=_at("2026-09-20T18:00:00"), path=path)
    rows = sb._read(path)
    assert len(rows) == 1
    assert float(rows[0]["lower"]) == 714.50
    assert rows[0]["forecast_at"].startswith("2026-09-20")


def test_different_sessions_are_separate_rows(path):
    sb.record(_walls(session="2026-09-21"), path=path)
    sb.record(_walls(session="2026-09-22"), path=path)
    assert [r["session"] for r in sb._read(path)] == ["2026-09-21", "2026-09-22"]


def test_a_failed_pull_is_never_recorded(path):
    with pytest.raises(ValueError):
        sb.record({"ok": False, "error": "no board"}, path=path)
    assert sb._read(path) == []


# ── the freeze rule ──────────────────────────────────────────────────────────────────

def test_a_graded_forecast_cannot_be_rewritten(path):
    sb.record(_walls(), now=_at("2026-09-19T18:00:00"), path=path)
    sb.grade(bars_by_symbol={"QQQ": {"2026-09-21": (715.0, 726.0)}},
             today=date(2026, 9, 22), now=_at("2026-09-22T08:00:00"), path=path)
    with pytest.raises(ValueError, match="frozen"):
        sb.record(_walls(lower=1.0, upper=9999.0), path=path)
    assert float(sb._read(path)[0]["lower"]) == 713.02


# ── grading ──────────────────────────────────────────────────────────────────────────

def test_a_contained_session_grades_as_held_on_both_sides(path):
    sb.record(_walls(), path=path)
    graded = sb.grade(bars_by_symbol={"QQQ": {"2026-09-21": (715.0, 726.0)}},
                      today=date(2026, 9, 22), now=_at("2026-09-22T08:00:00"), path=path)
    assert len(graded) == 1
    row = sb._read(path)[0]
    assert (row["contained_lower"], row["contained_upper"]) == ("True", "True")
    assert row["graded_at"].startswith("2026-09-22")


def test_each_side_is_graded_independently():
    cases = {
        "downside break": ((700.0, 726.0), ("False", "True")),
        "upside break": ((715.0, 740.0), ("True", "False")),
        "both break": ((700.0, 740.0), ("False", "False")),
    }
    for name, (bar, expected) in cases.items():
        import tempfile, pathlib
        with tempfile.TemporaryDirectory() as d:
            p = pathlib.Path(d) / "s.csv"
            sb.record(_walls(), path=p)
            sb.grade(bars_by_symbol={"QQQ": {"2026-09-21": bar}}, today=date(2026, 9, 22), path=p)
            row = sb._read(p)[0]
            assert (row["contained_lower"], row["contained_upper"]) == expected, name


def test_touching_a_wall_exactly_counts_as_contained(path):
    sb.record(_walls(lower=713.02, upper=728.86), path=path)
    sb.grade(bars_by_symbol={"QQQ": {"2026-09-21": (713.02, 728.86)}}, today=date(2026, 9, 22), path=path)
    row = sb._read(path)[0]
    assert (row["contained_lower"], row["contained_upper"]) == ("True", "True")


def test_a_session_that_has_not_closed_yet_is_not_graded(path):
    sb.record(_walls(), path=path)
    assert sb.grade(bars_by_symbol={"QQQ": {"2026-09-21": (715.0, 726.0)}},
                    today=date(2026, 9, 21), path=path) == []
    assert not sb.is_graded(sb._read(path)[0])


def test_a_missing_bar_leaves_the_row_for_a_later_run(path):
    # A market holiday, or the daily bar has simply not published yet.
    sb.record(_walls(), path=path)
    assert sb.grade(bars_by_symbol={"QQQ": {}}, today=date(2026, 9, 22), path=path) == []
    assert not sb.is_graded(sb._read(path)[0])


def test_grading_twice_does_not_regrade(path):
    sb.record(_walls(), path=path)
    bars = {"QQQ": {"2026-09-21": (715.0, 726.0)}}
    sb.grade(bars_by_symbol=bars, today=date(2026, 9, 22), now=_at("2026-09-22T08:00:00"), path=path)
    again = sb.grade(bars_by_symbol=bars, today=date(2026, 9, 23), now=_at("2026-09-23T08:00:00"), path=path)
    assert again == []
    assert sb._read(path)[0]["graded_at"].startswith("2026-09-22")


# ── summary ──────────────────────────────────────────────────────────────────────────

def test_summary_reports_each_side_separately(path):
    outcomes = {"2026-09-21": (715.0, 726.0),   # held both
                "2026-09-22": (700.0, 726.0),   # downside break
                "2026-09-23": (715.0, 740.0),   # upside break
                "2026-09-24": (715.0, 726.0)}   # held both
    for session in outcomes:
        sb.record(_walls(session=session), path=path)
    sb.grade(bars_by_symbol={"QQQ": outcomes}, today=date(2026, 9, 30), path=path)
    got = sb.summary(path)
    assert got["graded"] == 4 and got["pending"] == 0
    assert got["put_wall_held_pct"] == 75.0
    assert got["call_wall_held_pct"] == 75.0
    assert got["both_held_pct"] == 50.0


def test_summary_on_an_empty_scoreboard_does_not_divide_by_zero(path):
    assert sb.summary(path) == {"graded": 0, "pending": 0, "call_wall_held_pct": None,
                                "put_wall_held_pct": None, "both_held_pct": None,
                                "target_both_pct": 90.0}


def test_ungraded_rows_count_as_pending(path):
    sb.record(_walls(session="2026-09-21"), path=path)
    sb.record(_walls(session="2026-09-22"), path=path)
    sb.grade(bars_by_symbol={"QQQ": {"2026-09-21": (715.0, 726.0)}}, today=date(2026, 9, 22), path=path)
    got = sb.summary(path)
    assert (got["graded"], got["pending"]) == (1, 1)
