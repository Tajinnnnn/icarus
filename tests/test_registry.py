from pathlib import Path

from registry import get_crew, load_registry


def _write_yaml(tmp_path: Path, body: str) -> Path:
    yaml_path = tmp_path / "crews.yaml"
    yaml_path.write_text(body)
    return yaml_path


def test_valid_entry_loads_and_validates(tmp_path):
    project_dir = tmp_path / "myproj"
    (project_dir / ".venv" / "bin").mkdir(parents=True)
    venv_python = project_dir / ".venv" / "bin" / "python"
    venv_python.write_text("")

    yaml_path = _write_yaml(
        tmp_path,
        """
crews:
  - id: myproj
    name: My Project
    description: A test crew.
    project_dir: myproj
    venv_python: myproj/.venv/bin/python
    module: myproj.main
    entry_function: run_with_inputs
    output_dir: output
    inputs:
      - name: topic
        label: Topic
        type: text
        default: hello
""",
    )

    entries = load_registry(yaml_path)
    assert len(entries) == 1
    entry = entries[0]
    assert entry.valid is True
    assert entry.invalid_reason == ""
    assert entry.id == "myproj"
    assert entry.inputs[0].name == "topic"
    assert entry.inputs[0].default == "hello"
    assert get_crew(entries, "myproj") is entry
    assert get_crew(entries, "nonexistent") is None


def test_missing_project_dir_marks_invalid_without_dropping_entry(tmp_path):
    yaml_path = _write_yaml(
        tmp_path,
        """
crews:
  - id: ghost
    name: Ghost Crew
    description: Points nowhere.
    project_dir: does-not-exist
    venv_python: does-not-exist/.venv/bin/python
    module: ghost.main
    entry_function: run_with_inputs
    output_dir: output
    inputs: []
""",
    )

    entries = load_registry(yaml_path)
    assert len(entries) == 1
    entry = entries[0]
    assert entry.valid is False
    assert "Project directory not found" in entry.invalid_reason


def test_missing_venv_python_marks_invalid(tmp_path):
    project_dir = tmp_path / "noenv"
    project_dir.mkdir()

    yaml_path = _write_yaml(
        tmp_path,
        """
crews:
  - id: noenv
    name: No Env Crew
    description: Project exists, venv doesn't.
    project_dir: noenv
    venv_python: noenv/.venv/bin/python
    module: noenv.main
    entry_function: run_with_inputs
    output_dir: output
    inputs: []
""",
    )

    entries = load_registry(yaml_path)
    assert len(entries) == 1
    entry = entries[0]
    assert entry.valid is False
    assert "Virtualenv python not found" in entry.invalid_reason


def test_one_invalid_entry_does_not_block_others(tmp_path):
    good_dir = tmp_path / "good"
    (good_dir / ".venv" / "bin").mkdir(parents=True)
    (good_dir / ".venv" / "bin" / "python").write_text("")

    yaml_path = _write_yaml(
        tmp_path,
        """
crews:
  - id: broken
    name: Broken Crew
    description: Missing everything.
    project_dir: nope
    venv_python: nope/.venv/bin/python
    module: broken.main
    entry_function: run_with_inputs
    output_dir: output
    inputs: []
  - id: good
    name: Good Crew
    description: Works fine.
    project_dir: good
    venv_python: good/.venv/bin/python
    module: good.main
    entry_function: run_with_inputs
    output_dir: output
    inputs: []
""",
    )

    entries = load_registry(yaml_path)
    assert len(entries) == 2
    broken = get_crew(entries, "broken")
    good = get_crew(entries, "good")
    assert broken.valid is False
    assert good.valid is True
