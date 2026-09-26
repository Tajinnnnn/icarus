"""(C) Persist dashboard branding and user-selected content folders."""
import base64
import json
import os
import tempfile
import threading
from pathlib import Path

from config import DATA_DIR, VAULT_ROOT

SETTINGS_PATH = DATA_DIR / 'preferences (C).json'
DEFAULT_PATHS = {
    'notes': str(VAULT_ROOT / '00 Notes'),
    'personal_journal': str(VAULT_ROOT / '01 Journals/daily'),
    'trade_journal': str(VAULT_ROOT / 'Trading/journal'),
}
DEFAULT_BRANDING = {'title': 'Icarus', 'show_title': True, 'logo': 'icarus', 'logo_image': ''}
_LOCK = threading.RLock()


def get_preferences():
    with _LOCK:
        try:
            saved = json.loads(SETTINGS_PATH.read_text(encoding='utf-8'))
        except FileNotFoundError:
            saved = {}
        # Only create the app-owned empty defaults, never a missing custom folder.
        if VAULT_ROOT == DATA_DIR / 'Library':
            for default in DEFAULT_PATHS.values():
                Path(default).mkdir(parents=True, exist_ok=True)
        if not isinstance(saved, dict):
            raise ValueError('Dashboard preferences could not be read.')
        return {'paths': {**DEFAULT_PATHS, **saved.get('paths', {})},
                'branding': {**DEFAULT_BRANDING, **saved.get('branding', {})}}


def folder_path(key):
    return Path(get_preferences()['paths'][key])


def save_preferences(paths, branding):
    if not isinstance(paths, dict) or set(paths) != set(DEFAULT_PATHS):
        raise ValueError('Provide all three folder paths.')
    resolved = {}
    for key, value in paths.items():
        if not isinstance(value, str) or not value.strip():
            raise ValueError(f'Choose a folder for {key.replace("_", " ")}.')
        path = Path(value.strip()).expanduser()
        if not path.is_absolute():
            raise ValueError('Use a full folder path, starting with / or ~/.')
        path = path.resolve()
        if not path.is_dir():
            raise ValueError(f'Folder does not exist: {path}')
        if not os.access(path, os.R_OK | os.W_OK | os.X_OK):
            raise ValueError(f'Folder must be readable and writable: {path}')
        resolved[key] = str(path)
    if resolved['personal_journal'] == resolved['trade_journal']:
        raise ValueError('Personal and trade journals need separate folders so entries stay separate.')
    if not isinstance(branding, dict):
        raise ValueError('Invalid branding settings.')
    title = branding.get('title', '').strip()
    if not title or len(title) > 40 or any(ord(c) < 32 for c in title):
        raise ValueError('Use a dashboard name between 1 and 40 characters.')
    logo = branding.get('logo')
    if logo not in ('icarus', 'moon', 'sigil', 'star', 'custom'):
        raise ValueError('Choose a logo.')
    image = branding.get('logo_image', '')
    if image:
        if not isinstance(image, str) or len(image) > 1_400_000:
            raise ValueError('Logo must be a PNG, JPEG or WebP under 1 MB.')
        header, _, data = image.partition(',')
        signatures = {'data:image/png;base64': b'\x89PNG\r\n\x1a\n',
                      'data:image/jpeg;base64': b'\xff\xd8\xff',
                      'data:image/webp;base64': b'RIFF'}
        try:
            raw = base64.b64decode(data, validate=True)
        except ValueError as exc:
            raise ValueError('Invalid logo image.') from exc
        if header not in signatures or not raw.startswith(signatures[header]) or len(raw) > 1_048_576:
            raise ValueError('Logo must be a PNG, JPEG or WebP under 1 MB.')
        if header == 'data:image/webp;base64' and raw[8:12] != b'WEBP':
            raise ValueError('Invalid WebP image.')
    if logo == 'custom' and not image:
        raise ValueError('Upload a logo image first.')
    if not isinstance(branding.get('show_title'), bool):
        raise ValueError('Invalid title visibility.')
    result = {'paths': resolved, 'branding': {'title': title, 'show_title': branding['show_title'],
                                            'logo': logo, 'logo_image': image}}
    with _LOCK:
        SETTINGS_PATH.parent.mkdir(parents=True, exist_ok=True)
        with tempfile.NamedTemporaryFile(mode='w', encoding='utf-8', dir=SETTINGS_PATH.parent,
                                         prefix='preferences (C)-', suffix='.tmp', delete=False) as file:
            json.dump(result, file, indent=2)
            file.flush()
            os.fsync(file.fileno())
        os.replace(file.name, SETTINGS_PATH)
    return result
