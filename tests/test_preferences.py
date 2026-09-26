"""(C) Settings tests use isolated folders, never real journal or note data."""
import json
from pathlib import Path

import pytest

import preferences
import notes
import journal


@pytest.fixture
def setup(tmp_path, monkeypatch):
    monkeypatch.setattr(preferences, 'SETTINGS_PATH', tmp_path / 'config/preferences.json')
    paths = {key: str(tmp_path / key) for key in preferences.DEFAULT_PATHS}
    for path in paths.values():
        Path(path).mkdir()
    return paths, dict(preferences.DEFAULT_BRANDING)


def test_fresh_preferences_have_icarus_mark(setup):
    saved = preferences.get_preferences()
    assert saved['branding'] == {'title': 'Icarus', 'show_title': True, 'logo': 'icarus', 'logo_image': ''}


def test_settings_persist_and_route_notes_and_both_journals(setup):
    paths, branding = setup
    branding.update(title='My space', show_title=False, logo='star')
    preferences.save_preferences(paths, branding)
    assert json.loads(preferences.SETTINGS_PATH.read_text()) == preferences.get_preferences()
    note_root = Path(paths['notes'])
    (note_root / 'ideas').mkdir()
    note = notes.create_note('ideas', 'Example', blank=True)
    notes.save_note_content(note['path'], '# Example\nPrivate test text')
    assert notes.get_note_content(note['path'])['content'].endswith('Private test text')
    journal.save_journal_entry('2026-01-03', {'notes_captures': 'Personal test'}, source='personal')
    journal.save_journal_entry('2026-01-03', {'trade_taken': 'Trade test'}, source='trade')
    assert 'Personal test' in (Path(paths['personal_journal'])/'2026-01-03.md').read_text()
    assert 'Trade test' in (Path(paths['trade_journal'])/'2026-01-03.md').read_text()
    assert preferences.get_preferences()['branding']['show_title'] is False


def test_changing_root_does_not_move_files_or_allow_stale_writes(setup, tmp_path):
    paths, branding = setup
    preferences.save_preferences(paths, branding)
    note = Path(paths['notes'])/'old.md'; note.write_text('original')
    new_root = tmp_path/'new'; new_root.mkdir()
    paths['notes'] = str(new_root)
    preferences.save_preferences(paths, branding)
    assert notes.list_categories() == {'categories': []}
    with pytest.raises(ValueError): notes.save_note_content(str(note), 'wrong folder')
    assert note.read_text() == 'original'
    assert not list(new_root.iterdir())


@pytest.mark.parametrize('bad', ['', 'relative/path', '/this/folder/does/not/exist'])
def test_invalid_folder_keeps_previous_settings(setup, bad):
    paths, branding = setup
    before = preferences.save_preferences(paths, branding)
    paths['notes'] = bad
    with pytest.raises(ValueError): preferences.save_preferences(paths, branding)
    assert preferences.get_preferences() == before


def test_same_journal_folder_rejected(setup):
    paths, branding = setup
    paths['trade_journal'] = paths['personal_journal']
    with pytest.raises(ValueError, match='separate folders'): preferences.save_preferences(paths, branding)


def test_custom_logo_rejects_remote_urls_and_non_images(setup):
    paths, branding = setup
    branding.update(logo='custom', logo_image='https://example.com/logo.png')
    with pytest.raises(ValueError): preferences.save_preferences(paths, branding)
    branding['logo_image'] = 'data:image/png;base64,bm90IGFuIGltYWdl'
    with pytest.raises(ValueError): preferences.save_preferences(paths, branding)


def test_notes_at_folder_root_are_visible(setup):
    paths, branding = setup
    preferences.save_preferences(paths, branding)
    (Path(paths['notes'])/'loose.md').write_text('# Loose note')
    category = notes.list_categories()['categories'][0]
    assert category['label'] == 'Loose notes'
    assert category['children'][0]['title'] == 'loose'
    assert Path(notes.create_note('.', 'Another', blank=True)['path']).parent == Path(paths['notes'])


def test_journal_path_traversal_rejected(setup):
    paths, branding = setup
    preferences.save_preferences(paths, branding)
    with pytest.raises(ValueError): journal.save_journal_entry('../escape', {})
    with pytest.raises(ValueError): journal.get_journal_entry('../escape')
