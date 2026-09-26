"""(C) User-owned agent/script launchers; no bundled agents or personal commands."""
from dataclasses import dataclass
from pathlib import Path
import json
import os
import shlex
import tempfile
import threading
import uuid

from config import DATA_DIR

AUTOMATIONS_PATH = DATA_DIR / 'automations (C).json'
_LOCK = threading.RLock()


@dataclass
class Automation:
    id: str
    name: str
    description: str
    project_dir: Path
    command: str
    output_dir: Path
    input_label: str = 'Prompt'
    feedback_marker: str = 'ICARUS_INPUT_REQUIRED'
    enabled: bool = True

    @property
    def valid(self):
        return self.enabled and self.project_dir.is_dir()

    @property
    def invalid_reason(self):
        return 'Paused' if not self.enabled else ('' if self.project_dir.is_dir() else 'Project folder is unavailable. Edit this automation to reconnect it.')

    def to_dict(self):
        return {'id':self.id, 'name':self.name, 'description':self.description,
                'project_dir':str(self.project_dir), 'command':self.command,
                'output_dir':str(self.output_dir), 'input_label':self.input_label,
                'feedback_marker':self.feedback_marker, 'enabled':self.enabled,
                'valid':self.valid, 'invalid_reason':self.invalid_reason,
                'inputs':[{'name':'input','label':self.input_label,'type':'text','default':''}] if self.input_label else []}


def load_automations():
    with _LOCK:
        try:
            records = json.loads(AUTOMATIONS_PATH.read_text(encoding='utf-8'))
        except FileNotFoundError:
            return []
    if not isinstance(records, list):
        raise ValueError('Automation settings must be a list.')
    return [Automation(**{**item,'project_dir':Path(item['project_dir']), 'output_dir':Path(item['output_dir'])}) for item in records]


def save_automation(draft):
    if not isinstance(draft, dict): raise ValueError('Invalid automation settings.')
    name = str(draft.get('name','')).strip()
    if not name or len(name)>80: raise ValueError('Give this automation a name of up to 80 characters.')
    raw_folder = str(draft.get('project_dir','')).strip()
    folder = Path(raw_folder).expanduser()
    if not folder.is_absolute() or not folder.is_dir(): raise ValueError('Choose an existing project folder using a full path.')
    folder = folder.resolve()
    command = str(draft.get('command','')).strip()
    if not command or len(command)>4096 or '\x00' in command: raise ValueError('Enter a run command (up to 4096 characters).')
    args = shlex.split(command)
    if not args: raise ValueError('Enter a run command.')
    if any(arg in {'|','||','&&',';','>','>>','<','&'} for arg in args):
        raise ValueError('Use one command. Put shell pipelines or multiple steps in a script and run that script.')
    output = Path(str(draft.get('output_dir') or 'output')).expanduser()
    output = (output if output.is_absolute() else folder/output).resolve()
    if output.exists() and not output.is_dir(): raise ValueError('Output path must be a folder.')
    identifier = draft.get('id')
    with _LOCK:
        entries = load_automations()
        if identifier and not any(entry.id == identifier for entry in entries): raise ValueError('Automation no longer exists.')
        entry = Automation(id=identifier or str(uuid.uuid4()), name=name,
            description=str(draft.get('description','')).strip()[:500], project_dir=folder,
            command=command, output_dir=output, input_label=str(draft.get('input_label','Prompt')).strip()[:80],
            feedback_marker=str(draft.get('feedback_marker','ICARUS_INPUT_REQUIRED')).strip()[:120],
            enabled=bool(draft.get('enabled',True)))
        entries = [entry if item.id == entry.id else item for item in entries] if identifier else entries+[entry]
        records = [{key:value for key,value in item.to_dict().items() if key not in {'valid','invalid_reason','inputs'}} for item in entries]
        AUTOMATIONS_PATH.parent.mkdir(parents=True,exist_ok=True)
        with tempfile.NamedTemporaryFile(mode='w',encoding='utf-8',dir=AUTOMATIONS_PATH.parent,prefix='automations (C)-',suffix='.tmp',delete=False) as file:
            json.dump(records,file,indent=2);file.flush();os.fsync(file.fileno())
        os.replace(file.name,AUTOMATIONS_PATH)
    return entry


def build_command(entry, inputs_path):
    inputs = json.loads(Path(inputs_path).read_text(encoding='utf-8'))
    # Substitute inside each argument after parsing: user input never becomes shell syntax.
    args = [arg.replace('{input}',str(inputs.get('input',''))).replace('{inputs_file}',str(inputs_path)) for arg in shlex.split(entry.command)]
    args[0] = os.path.expanduser(args[0])
    return args
