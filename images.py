import base64
from datetime import datetime
from pathlib import Path

from config import VAULT_ROOT

IMAGES_DIR = VAULT_ROOT / "media" / "images"

_EXT_BY_MIME = {
    "image/png": "png",
    "image/jpeg": "jpg",
    "image/gif": "gif",
    "image/webp": "webp",
}


def save_pasted_image(data_base64: str, mime_type: str, images_dir: Path = None) -> dict:
    """
    Decodes a base64-encoded pasted image and writes it into media/images/,
    named to match Obsidian's own paste convention ('Pasted image
    <timestamp>.<ext>') so files dropped in by either tool look identical.
    Appends a numeric suffix on the rare same-second collision instead of
    overwriting.
    """
    images_dir = Path(images_dir) if images_dir else IMAGES_DIR
    images_dir.mkdir(parents=True, exist_ok=True)

    ext = _EXT_BY_MIME.get(mime_type, "png")
    stamp = datetime.now().strftime("%Y%m%d%H%M%S")
    name = f"Pasted image {stamp}.{ext}"
    path = images_dir / name
    counter = 1
    while path.exists():
        counter += 1
        name = f"Pasted image {stamp}-{counter}.{ext}"
        path = images_dir / name

    path.write_bytes(base64.b64decode(data_base64))
    return {"filename": name, "wikilink": f"![[{name}]]"}
