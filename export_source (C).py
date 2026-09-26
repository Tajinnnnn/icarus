"""(C) Export audited application source without development history or local data."""
from datetime import datetime
from pathlib import Path
import re
import shutil
import zipfile

ROOT = Path(__file__).resolve().parent
# An allowlist prevents newly added private files from silently becoming public.
PUBLIC_FILES = '''
.gitignore README.md LICENSE pyproject.toml uv.lock crews.yaml
app.py config.py preferences.py automations.py journal.py notes.py js_api.py images.py outputs.py
registry.py runner.py single_instance.py state.py tray.py window_chrome.py window_controls.py
backtests.py tracker.py flow.py flow_pine.py flow_push.py freeflow.py freeflow_pine.py freeflow_push.py
walls_daemon.py walls_scoreboard.py dev_preview.py make_icon.py icon.icns menubar_icon.png
dashboard.html dashboard.css dashboard.js dashboard.spec
vendor/marked.min.js vendor/read-aloud.js vendor/lightweight-charts.standalone.production.js
vendor/LIGHTWEIGHT-CHARTS-LICENSE vendor/kokoro/kokoro.web.js vendor/kokoro/LICENSE
'''.split() + ['appearance (C).js', 'page-swipe (C).js', 'workflow-tracker-preview (C).css', 'crews.example (C).yaml',
             'export_source (C).py', 'account-tracker (C).html', 'prop-rules (C).js', 'prop-firm-rules (C).json',
             'options-charts (C).js', 'tests/options-charts (C).test.cjs',
             'docs/prop-rules-lucid-fff (C).md', 'docs/prop-rules-topstep-mffu (C).md', 'docs/prop-rules-apex-alpha (C).md',
             'tests/prop-rules (C).test.cjs', 'tests/test_prop_rules.py', 'assets/icarus-falling (C).png',
             'tests/appearance (C).test.cjs', 'tests/page-swipe (C).test.cjs',
             'tests/test_preferences.py', 'tests/test_automations.py', 'tests/test_share_export.py'] + [
    'tests/' + name for name in '''test_journal.py test_notes.py test_runner.py test_registry.py
    test_flow.py test_flow_pine.py test_flow_push.py test_freeflow.py test_freeflow_pine.py
    test_freeflow_push.py test_iv_walls.py test_outputs.py test_walls_daemon.py test_walls_scoreboard.py'''.split()
    if (ROOT / 'tests' / name).exists()
]


def private_patterns(text):
    """Return categories, never the matching credential or personal value."""
    patterns = {
        'absolute user home path': r'/(?:Users|home)/[a-zA-Z0-9_.-]+/',
        'private key': r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
        'provider token': r'(?<![A-Za-z0-9_-])(?:sk-[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|github_pat_[A-Za-z0-9_]{30,}|AKIA[A-Z0-9]{16})',
        'credential assignment': r'''(?im)^\s*(?:[A-Z_]*(?:API_KEY|SECRET|PASSWORD|ACCESS_TOKEN))\s*[:=]\s*["']?[a-zA-Z0-9_/-]{16,}''',
    }
    return [label for label, pattern in patterns.items() if re.search(pattern, text)]


def validate_source():
    issues = []
    for name in PUBLIC_FILES:
        path = ROOT / name
        if not path.is_file() or path.is_symlink():
            issues.append(f'{name}: missing source or symlink')
            continue
        if path.suffix in {'.icns', '.png'}:
            continue
        for category in private_patterns(path.read_text(encoding='utf-8')):
            issues.append(f'{name}: {category}')
    if issues:
        raise ValueError('Export blocked:\n' + '\n'.join(issues))


def export(destination=None):
    validate_source()
    base = Path(destination) if destination else ROOT / 'share-exports'
    folder = base / ('Icarus-source-' + datetime.now().strftime('%Y%m%d-%H%M%S-%f') + ' (C)')
    folder.mkdir(parents=True, exist_ok=False)
    for name in PUBLIC_FILES:
        target = folder / name
        target.parent.mkdir(parents=True, exist_ok=True)
        shutil.copyfile(ROOT/name, target)
    archive = folder.with_suffix('.zip')
    with zipfile.ZipFile(archive, 'x', zipfile.ZIP_DEFLATED) as file:
        for name in PUBLIC_FILES:
            file.write(folder/name, arcname='Icarus/'+name)
    return folder, archive


if __name__ == '__main__':
    folder, archive = export()
    print(f'Clean source: {folder}\nZIP: {archive}\nFiles: {len(PUBLIC_FILES)}. No Git history or local data included.')
