"""(C) Public rules and manual tracker preserve private account data."""
import json
from pathlib import Path
import tracker


def test_public_tracker_load_does_not_rewrite_saved_accounts(tmp_path, monkeypatch):
    data = tmp_path / 'accounts.json'
    original = json.dumps({'version': 11, 'accounts': [{'name': 'Example', 'days': [{'pnl': 123}]}], 'firms': {}, 'expenses': []})
    data.write_text(original)
    monkeypatch.setattr(tracker, 'TRACKER_DATA', data)
    monkeypatch.setattr(tracker, 'DATA_DIR', tmp_path / 'cache')
    result = tracker.get_tracker_info()
    assert result['ok']
    assert result['data'] == original
    assert data.read_text() == original
    assert 'Personal data loads from the user data folder' in (tmp_path / 'cache' / 'tracker-view (C).html').read_text()


def test_catalog_has_six_firms_and_every_claim_has_official_source():
    assert hasattr(tracker, 'get_prop_firm_rules'), 'Rules API required'
    catalog = tracker.get_prop_firm_rules()
    assert len(catalog['firms']) == 6
    ids = set()
    for firm in catalog['firms']:
        assert firm['programs']
        for program in firm['programs']:
            assert program['id'] not in ids
            ids.add(program['id'])
            assert program['sizes'] and program['stages']
            assert program['rules'] and program['sources']
            assert program['status'] in {'current', 'legacy', 'needs-review'}
            for rule in program['rules']:
                assert rule['text'] and rule['source'].startswith('https://')
