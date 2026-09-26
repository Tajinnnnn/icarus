import re
from datetime import date
from pathlib import Path

from config import VAULT_ROOT
from preferences import folder_path

DAILY_DIR = VAULT_ROOT / "01 Journals" / "daily"
TRADE_DIR = VAULT_ROOT / "Trading" / "journal"

# (data key, heading text expected in the daily journal template)
SECTIONS = [
    ("what_would_make_today_great", "What would make today great"),
    ("notes_captures", "Notes / captures throughout the day"),
    ("amazing_things", "Amazing things that happened"),
    ("could_have_been_better", "How today could've been better"),
]

# (data key, heading text expected in the trade journal template)
TRADE_SECTIONS = [
    ("trade_taken", "Trade taken"),
    ("reasoning", "Reasoning"),
    ("what_went_right", "What went right"),
    ("what_went_wrong", "What went wrong"),
    ("could_be_improved", "What could be improved"),
    ("net_pnl", "Net profit/loss"),
    ("three_notes", "3 notes"),
]

SOURCES = {
    "personal": {"dir": DAILY_DIR, "sections": SECTIONS, "label": "Personal"},
    "trade": {"dir": TRADE_DIR, "sections": TRADE_SECTIONS, "label": "Trade"},
}


def _resolve_source(source, dir_override=None):
    cfg = SOURCES.get(source, SOURCES["personal"])
    directory = Path(dir_override) if dir_override else folder_path("trade_journal" if source == "trade" else "personal_journal")
    return directory, cfg["sections"]

_DATE_FILENAME = re.compile(r"^\d{4}-\d{2}-\d{2}$")
_PLACEHOLDER_LINE = re.compile(r"^\s*(\d+\.|-)\s*$")


def _split_sections(text: str) -> dict:
    """
    Splits a daily note's body into {heading_text: raw_content}, one entry
    per '## <heading>' line, each running until the next '##' heading.
    """
    sections = {}
    current_heading = None
    buffer = []

    def flush():
        if current_heading is not None:
            sections[current_heading] = "\n".join(buffer).strip()

    for line in text.splitlines():
        heading_match = re.match(r"^##\s+(.*)$", line)
        if heading_match:
            flush()
            current_heading = heading_match.group(1).strip()
            buffer = []
            continue
        if current_heading is not None:
            buffer.append(line)
    flush()
    return sections


def _clean_section_body(raw: str) -> str:
    """
    Strips the template's own instructional italics line, unfilled
    numbered/bullet placeholders, and anything after a '---' soft break,
    leaving only what was actually written.
    """
    kept = []
    for line in raw.splitlines():
        stripped = line.strip()
        if stripped == "---":
            break
        if stripped.startswith("*") and stripped.endswith("*") and len(stripped) > 1:
            continue
        if _PLACEHOLDER_LINE.match(line):
            continue
        kept.append(line)
    return "\n".join(kept).strip()


def _parse_note(path: Path, sections=SECTIONS) -> dict:
    text = path.read_text(encoding="utf-8")
    raw_sections = _split_sections(text)
    return {key: _clean_section_body(raw_sections.get(heading, "")) for key, heading in sections}


def _is_empty_note(parsed: dict) -> bool:
    return not any(parsed.values())


_LIST_MARKER = re.compile(r"^\s*(?:\d+\.|-)\s*")


def _preview_for(parsed: dict, sections=SECTIONS) -> str:
    for key, _ in sections:
        if parsed.get(key):
            first_line = parsed[key].splitlines()[0].strip()
            first_line = _LIST_MARKER.sub("", first_line)
            return first_line[:140]
    return ""


def _split_document(text: str):
    """
    Like _split_sections, but preserves heading ORDER and any heading not
    in SECTIONS verbatim (e.g. List Widget's synced '## Tasks' block) - so
    a save can rewrite only the tracked sections without touching anything
    else in the file.
    """
    lines = text.splitlines()
    title_line = lines[0] if lines and lines[0].startswith("#") else None
    body_lines = lines[1:] if title_line is not None else lines

    blocks = []
    current_heading = None
    buffer = []

    def flush():
        if current_heading is not None:
            blocks.append({"heading": current_heading, "body": "\n".join(buffer).strip("\n")})

    for line in body_lines:
        heading_match = re.match(r"^##\s+(.*)$", line)
        if heading_match:
            flush()
            current_heading = heading_match.group(1).strip()
            buffer = []
            continue
        if current_heading is not None:
            buffer.append(line)
    flush()
    return title_line, blocks


def _rebuild_document(title_line: str, blocks: list) -> str:
    parts = [title_line, ""] if title_line else []
    for block in blocks:
        parts.append(f"## {block['heading']}")
        parts.append("")
        if block["body"]:
            parts.append(block["body"])
            parts.append("")
    return "\n".join(parts).rstrip("\n") + "\n"


def get_journal_entry(date_str: str, daily_dir: Path = None, source: str = "personal") -> dict:
    if not _DATE_FILENAME.fullmatch(date_str):
        raise ValueError("Use a date in YYYY-MM-DD format.")
    directory, sections = _resolve_source(source, daily_dir)
    path = directory / f"{date_str}.md"
    if path.exists():
        return {"date": date_str, "exists": True, "sections": _parse_note(path, sections)}
    return {"date": date_str, "exists": False, "sections": {}}


def save_journal_entry(date_str: str, sections: dict, daily_dir: Path = None, source: str = "personal") -> dict:
    """
    Writes sections (a subset of the source's section keys -> new plain-text
    content) into date_str's note, creating it if needed. Any other heading
    already in the file (e.g. '## Tasks', '## Links') is carried over untouched.
    """
    if not _DATE_FILENAME.fullmatch(date_str):
        raise ValueError("Use a date in YYYY-MM-DD format.")
    directory, source_sections = _resolve_source(source, daily_dir)
    directory.mkdir(parents=True, exist_ok=True)
    path = directory / f"{date_str}.md"

    if path.exists():
        title_line, blocks = _split_document(path.read_text(encoding="utf-8"))
        if title_line is None:
            title_line = f"# {date_str}"
    else:
        title_line = f"# {date_str}"
        blocks = [{"heading": heading, "body": ""} for _, heading in source_sections]

    heading_by_key = dict(source_sections)
    for key, new_body in sections.items():
        if key not in heading_by_key:
            continue
        heading = heading_by_key[key]
        matched = False
        for block in blocks:
            if block["heading"] == heading:
                block["body"] = new_body
                matched = True
                break
        if not matched:
            blocks.append({"heading": heading, "body": new_body})

    path.write_text(_rebuild_document(title_line, blocks), encoding="utf-8")
    return get_journal_entry(date_str, daily_dir=directory, source=source)


def get_today_and_recent(
    daily_dir: Path = None, today: date = None, recent_count: int = 5, source: str = "personal"
) -> dict:
    directory, sections = _resolve_source(source, daily_dir)
    today = today or date.today()
    today_str = today.isoformat()
    today_path = directory / f"{today_str}.md"

    if today_path.exists():
        today_data = {"date": today_str, "exists": True, "sections": _parse_note(today_path, sections)}
    else:
        today_data = {"date": today_str, "exists": False, "sections": {}}

    recent = []
    if directory.is_dir():
        candidates = sorted(
            (p for p in directory.glob("*.md") if p.stem != today_str and _DATE_FILENAME.match(p.stem)),
            key=lambda p: p.stem,
            reverse=True,
        )
        for path in candidates[:recent_count]:
            parsed = _parse_note(path, sections)
            recent.append(
                {
                    "date": path.stem,
                    "preview": "(no entry yet)" if _is_empty_note(parsed) else _preview_for(parsed, sections),
                }
            )

    return {
        "today": today_data,
        "recent": recent,
        "section_labels": [{"key": key, "label": label} for key, label in sections],
        "source": source,
        "sources": [{"key": key, "label": cfg["label"]} for key, cfg in SOURCES.items()],
    }
