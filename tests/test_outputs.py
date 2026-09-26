from pathlib import Path

from outputs import get_output_file_preview
from registry import CrewEntry


def _entry(output_dir: Path) -> CrewEntry:
    return CrewEntry(
        id="crew1",
        name="Crew One",
        description="",
        project_dir=output_dir,
        venv_python=output_dir / "venv",
        module="crew1",
        entry_function="run",
        output_dir=output_dir,
    )


def test_txt_file_classifies_as_text_and_round_trips(tmp_path):
    run_dir = tmp_path / "run1"
    run_dir.mkdir()
    txt_path = run_dir / "notes.txt"
    txt_path.write_text("Plain text output.\n- not a markdown list, just text\n")

    result = get_output_file_preview([_entry(tmp_path)], str(txt_path))

    assert result["kind"] == "text"
    assert result["content"] == "Plain text output.\n- not a markdown list, just text\n"


def test_md_file_still_classifies_as_markdown(tmp_path):
    run_dir = tmp_path / "run1"
    run_dir.mkdir()
    md_path = run_dir / "report.md"
    md_path.write_text("# Report\n")

    result = get_output_file_preview([_entry(tmp_path)], str(md_path))

    assert result["kind"] == "markdown"
