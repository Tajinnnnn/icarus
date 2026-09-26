from dataclasses import dataclass, field
from pathlib import Path

import yaml

from config import CREWS_YAML_PATH


@dataclass
class InputField:
    name: str
    label: str
    type: str
    default: str = ""


@dataclass
class CrewEntry:
    id: str
    name: str
    description: str
    project_dir: Path
    venv_python: Path
    module: str
    entry_function: str
    output_dir: Path
    inputs: list = field(default_factory=list)
    valid: bool = True
    invalid_reason: str = ""

    def to_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "description": self.description,
            "valid": self.valid,
            "invalid_reason": self.invalid_reason,
            "inputs": [
                {"name": f.name, "label": f.label, "type": f.type, "default": f.default}
                for f in self.inputs
            ],
        }


def _resolve(base_dir: Path, raw_path: str) -> Path:
    path = Path(raw_path).expanduser()
    if not path.is_absolute():
        path = base_dir / path
    return path.resolve()


def load_registry(yaml_path: Path = None) -> list:
    """
    Load and validate crews.yaml. Entries whose project_dir or venv_python
    don't exist on disk are still returned, marked invalid with a reason,
    so one broken entry never prevents the others from loading.
    """
    yaml_path = Path(yaml_path) if yaml_path else CREWS_YAML_PATH
    base_dir = yaml_path.parent

    with open(yaml_path) as f:
        data = yaml.safe_load(f) or {}

    entries = []
    for raw in data.get("crews", []):
        project_dir = _resolve(base_dir, raw["project_dir"])
        venv_python = _resolve(base_dir, raw["venv_python"])
        output_dir = project_dir / raw.get("output_dir", "output")

        inputs = [InputField(**field_raw) for field_raw in raw.get("inputs", [])]

        entry = CrewEntry(
            id=raw["id"],
            name=raw["name"],
            description=raw.get("description", ""),
            project_dir=project_dir,
            venv_python=venv_python,
            module=raw["module"],
            entry_function=raw.get("entry_function", "run_with_inputs"),
            output_dir=output_dir,
            inputs=inputs,
        )

        if not project_dir.is_dir():
            entry.valid = False
            entry.invalid_reason = f"Project directory not found: {project_dir}"
        elif not venv_python.exists():
            entry.valid = False
            entry.invalid_reason = f"Virtualenv python not found: {venv_python} (run `uv sync` in the crew's project first)"

        entries.append(entry)

    return entries


def get_crew(entries: list, crew_id: str):
    for entry in entries:
        if entry.id == crew_id:
            return entry
    return None
