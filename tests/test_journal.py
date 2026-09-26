from datetime import date

from journal import get_journal_entry, get_today_and_recent, save_journal_entry

TEMPLATE_EMPTY = """# {date}

## What would make today great
1.
2.
3.

## Notes / captures throughout the day
*Anything worth remembering. Will be reviewed at end of day. Use `[[wikilinks]]` for people, projects, concepts.*

---

## Amazing things that happened
1.
2.
3.

## How today could've been better
-
"""

FILLED = """# {date}

## What would make today great
1. Ship the dashboard rewrite
2. Review the release notes
3.

## Notes / captures throughout the day
*Anything worth remembering. Will be reviewed at end of day. Use `[[wikilinks]]` for people, projects, concepts.*

Talked to [[a colleague]] about the release plan.

---

## Amazing things that happened
1.
2.
3.

## How today could've been better
-
"""


def test_today_note_exists_and_parses_filled_sections(tmp_path):
    today = date(2026, 8, 3)
    (tmp_path / f"{today.isoformat()}.md").write_text(FILLED.format(date=today.isoformat()))

    result = get_today_and_recent(daily_dir=tmp_path, today=today)

    assert result["today"]["exists"] is True
    sections = result["today"]["sections"]
    assert "Ship the dashboard rewrite" in sections["what_would_make_today_great"]
    assert "a colleague" in sections["notes_captures"]
    assert sections["amazing_things"] == ""


def test_today_note_missing(tmp_path):
    today = date(2026, 8, 3)
    result = get_today_and_recent(daily_dir=tmp_path, today=today)

    assert result["today"]["exists"] is False
    assert result["today"]["sections"] == {}


def test_recent_note_that_is_template_only_shows_no_entry(tmp_path):
    today = date(2026, 8, 3)
    (tmp_path / f"{today.isoformat()}.md").write_text(FILLED.format(date=today.isoformat()))
    (tmp_path / "2026-08-02.md").write_text(TEMPLATE_EMPTY.format(date="2026-08-02"))

    result = get_today_and_recent(daily_dir=tmp_path, today=today)

    recent_by_date = {r["date"]: r for r in result["recent"]}
    assert recent_by_date["2026-08-02"]["preview"] == "(no entry yet)"


def test_recent_note_with_real_content_shows_a_preview(tmp_path):
    today = date(2026, 8, 3)
    (tmp_path / f"{today.isoformat()}.md").write_text(FILLED.format(date=today.isoformat()))
    (tmp_path / "2026-08-01.md").write_text(FILLED.format(date="2026-08-01"))

    result = get_today_and_recent(daily_dir=tmp_path, today=today)

    recent_by_date = {r["date"]: r for r in result["recent"]}
    assert recent_by_date["2026-08-01"]["preview"] == "Ship the dashboard rewrite"


def test_recent_excludes_today_and_sorts_most_recent_first(tmp_path):
    today = date(2026, 8, 3)
    for d in ["2026-08-03", "2026-08-02", "2026-08-01", "2026-07-31"]:
        (tmp_path / f"{d}.md").write_text(FILLED.format(date=d))

    result = get_today_and_recent(daily_dir=tmp_path, today=today, recent_count=5)

    dates = [r["date"] for r in result["recent"]]
    assert "2026-08-03" not in dates
    assert dates == ["2026-08-02", "2026-08-01", "2026-07-31"]


def test_save_journal_entry_creates_a_new_file(tmp_path):
    result = save_journal_entry(
        "2026-08-03",
        {"what_would_make_today_great": "Ship the dashboard rewrite"},
        daily_dir=tmp_path,
    )

    assert result["exists"] is True
    assert result["sections"]["what_would_make_today_great"] == "Ship the dashboard rewrite"
    assert (tmp_path / "2026-08-03.md").exists()


def test_save_journal_entry_updates_an_existing_tracked_section(tmp_path):
    (tmp_path / "2026-08-03.md").write_text(TEMPLATE_EMPTY.format(date="2026-08-03"))

    save_journal_entry("2026-08-03", {"amazing_things": "Got the app working end to end"}, daily_dir=tmp_path)

    entry = get_journal_entry("2026-08-03", daily_dir=tmp_path)
    assert entry["sections"]["amazing_things"] == "Got the app working end to end"


def test_save_journal_entry_preserves_untracked_sections(tmp_path):
    note_with_tasks = FILLED.format(date="2026-08-03") + "\n## Tasks\n- [ ] Gym <!--id:abc123-->\n"
    (tmp_path / "2026-08-03.md").write_text(note_with_tasks)

    save_journal_entry("2026-08-03", {"amazing_things": "New content"}, daily_dir=tmp_path)

    raw = (tmp_path / "2026-08-03.md").read_text()
    assert "- [ ] Gym <!--id:abc123-->" in raw
    assert "## Tasks" in raw


def test_save_journal_entry_on_a_past_date_is_allowed(tmp_path):
    (tmp_path / "2026-07-20.md").write_text(TEMPLATE_EMPTY.format(date="2026-07-20"))

    result = save_journal_entry("2026-07-20", {"notes_captures": "Forgot to log this at the time"}, daily_dir=tmp_path)

    assert result["sections"]["notes_captures"] == "Forgot to log this at the time"
