"""(C) Automation lifecycle tests run only disposable local Python scripts."""
import json
from pathlib import Path
import shlex
import sys
import threading

import pytest

import automations
import runner


@pytest.fixture
def setup(tmp_path,monkeypatch):
    monkeypatch.setattr(automations,'AUTOMATIONS_PATH',tmp_path/'profile/automations.json')
    return {'name':'Example agent','description':'A disposable agent','project_dir':str(tmp_path),
            'command':shlex.join([sys.executable,'agent.py','{input}']), 'output_dir':'output',
            'input_label':'Prompt','enabled':True,'feedback_marker':'ICARUS_INPUT_REQUIRED'}


def test_save_edit_and_pause_persist_without_running(setup):
    entry=automations.save_automation(setup)
    assert entry.valid
    assert not (entry.project_dir/'output').exists()
    changed=automations.save_automation({**setup,'id':entry.id,'enabled':False,'name':'Paused agent'})
    loaded=automations.load_automations()
    assert len(loaded)==1
    assert loaded[0].id==entry.id and loaded[0].name=='Paused agent'
    assert not changed.valid and changed.invalid_reason=='Paused'


def test_prompt_is_a_single_argument_not_shell_code(setup,tmp_path):
    entry=automations.save_automation(setup)
    text='hello; $(touch unwanted) "quoted"\nsecond line'
    inputs=tmp_path/'inputs.json';inputs.write_text(json.dumps({'input':text}))
    argv=automations.build_command(entry,inputs)
    assert argv==[sys.executable,'agent.py',text]
    assert not (tmp_path/'unwanted').exists()


def test_agent_runs_streams_feedback_and_collects_output(setup,tmp_path):
    (tmp_path/'agent.py').write_text('''import os, pathlib
print("ICARUS_INPUT_REQUIRED", flush=True)
reply = input()
p = pathlib.Path("output"); p.mkdir()
(p/"result.txt").write_text(os.environ["ICARUS_INPUT"] + " / " + reply)
print("All done", flush=True)
''')
    entry=automations.save_automation(setup)
    finished=threading.Event();events=[];result=[]
    def done(success,payload):result.append((success,payload));finished.set()
    def feedback():assert runner.send_input(entry.id,'approved')
    assert runner.start_run(entry,{'input':'A test prompt'},events.append,done,feedback,automations.build_command)
    assert finished.wait(5)
    assert result[0][0] is True
    assert events==['ICARUS_INPUT_REQUIRED','All done']
    assert (tmp_path/'output/result.txt').read_text()=='A test prompt / approved'
    assert result[0][1]['outputs'][0]['name']=='result.txt'


@pytest.mark.parametrize('field,value',[('name',''),('command',''),('command','python a.py | cat'),('project_dir','relative')])
def test_invalid_setup_is_not_saved(setup,field,value):
    with pytest.raises(ValueError):automations.save_automation({**setup,field:value})
    assert automations.load_automations()==[]
