"""(C) Public exports must exclude local data and work as a fresh profile."""
import importlib.util
import json
import os
from pathlib import Path
import subprocess
import sys
import zipfile

spec = importlib.util.spec_from_file_location('source_export', Path(__file__).parents[1] / 'export_source (C).py')
exporter = importlib.util.module_from_spec(spec)
spec.loader.exec_module(exporter)


def test_export_is_only_allowlisted_files_without_history_or_local_data(tmp_path):
    folder, archive = exporter.export(tmp_path)
    files = {str(path.relative_to(folder)) for path in folder.rglob('*') if path.is_file()}
    assert files == set(exporter.PUBLIC_FILES)
    assert not (folder/'.git').exists()
    assert not (folder/'docs/superpowers').exists()
    assert json.loads(subprocess.check_output([sys.executable, '-c', '''
import json
from js_api import JsApi
api = JsApi()
settings = api.get_settings()
print(json.dumps({'crews': api.list_automations(), 'notes': api.get_notes_data(),
 'personal': api.get_journal_data('personal')['today']['exists'],
 'trade': api.get_journal_data('trade')['today']['exists'],
 'name': settings['branding']['title'], 'logo': settings['branding']['logo'],
 'tracker': api.get_tracker_info()['ok'], 'backtests': api.list_backtest_runs()['ok']}))
'''], cwd=folder, env={**{key:value for key,value in os.environ.items() if not key.startswith('ICARUS_')},
                       'ICARUS_DATA_DIR':str(tmp_path/'fresh-profile')}, text=True)) == {
       'crews': [], 'notes': {'categories': []}, 'personal': False, 'trade': False,
       'name':'Icarus', 'logo':'icarus', 'tracker':True, 'backtests':False}
    with zipfile.ZipFile(archive) as file:
        assert set(file.namelist()) == {'Icarus/'+name for name in files}


def test_export_scan_catches_personal_paths_and_tokens():
    path = '/' + 'Users' + '/' + 'example-person' + '/Documents/private.md'
    assert 'absolute user home path' in exporter.private_patterns(path)
    assert 'provider token' in exporter.private_patterns('sk-' + 'x'*30)
    assert not exporter.private_patterns('~/Projects/example_writer')


def test_public_rule_url_slug_is_not_a_provider_credential():
    assert not exporter.private_patterns('https://example.org/risk-management-and-trading-restrictions')
    assert 'provider token' in exporter.private_patterns('key="sk-' + 'x'*30 + '"')
