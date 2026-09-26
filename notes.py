import os
import re
import shutil
import urllib.parse
from datetime import datetime
from pathlib import Path

import Foundation
import yaml

from config import VAULT_ROOT
from preferences import folder_path

NOTES_ROOT = VAULT_ROOT / "00 Notes"
TEMPLATES_DIR = NOTES_ROOT / "_templates"

# Noise directories never worth walking for a vault-wide wikilink rewrite -
# VCS internals, Python/JS dependency trees, build output. Prefixed with a
# leading "." are skipped generically (below), these are the un-prefixed
# ones that still need an explicit name.
_SKIP_DIR_NAMES = {"node_modules", "venv", "__pycache__", "dist", "build"}

_SAFE_NAME_RE = re.compile(r"^[^/\\]+$")

# File types the notes tree lists. Markdown is editable and read-aloud-able;
# PDFs are view-only - WKWebView renders them natively in an iframe, which is
# the only way to see a slide deck's CHARTS (text extraction loses them).
_MARKDOWN_SUFFIXES = {".md"}
_VIEW_ONLY_SUFFIXES = {".pdf"}
_READABLE_SUFFIXES = _MARKDOWN_SUFFIXES | _VIEW_ONLY_SUFFIXES

# Top-level 00 Notes/ subfolders that are NOT part of the entity/source
# concept this page covers (raw ingested media, derived synthesis outputs,
# mixed-editability folders, the note-creation templates dir) - everything
# else directly under 00 Notes/ is treated as a category. Inverted from a
# fixed include-list (the old CATEGORIES constant) so a newly created
# category shows up automatically with no code change. Names are
# case-sensitive exact matches against the real folder names on disk.
_CATEGORY_EXCLUDE = {
    "Books", "Courses", "Videos",
    "research", "canvases", "lint-reports", "saved-chats", "_templates",
}


def list_category_names(notes_root: Path = None) -> list:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    if not notes_root.is_dir():
        return []
    return sorted(
        p.name
        for p in notes_root.iterdir()
        if p.is_dir() and not p.name.startswith(".") and p.name not in _CATEGORY_EXCLUDE
    )


def _is_category(name: str, notes_root: Path) -> bool:
    return name == "." or name in list_category_names(notes_root)

_FRONTMATTER_RE = re.compile(r"^---\n(.*?)\n---\n?(.*)$", re.DOTALL)
_TLDR_HEADING_RE = re.compile(r"^##\s+TLDR\s*\n(.*?)(?=\n##\s|\Z)", re.DOTALL | re.MULTILINE)


def _parse_frontmatter(text: str):
    match = _FRONTMATTER_RE.match(text)
    if not match:
        return {}, text
    raw_frontmatter, body = match.groups()
    try:
        frontmatter = yaml.safe_load(raw_frontmatter) or {}
    except yaml.YAMLError:
        frontmatter = {}
    return frontmatter, body


def _extract_preview(body: str) -> str:
    # Entity pages (page-format.md): a "> ..." blockquote directly under the
    # first "# Title" heading is the TLDR.
    lines = body.splitlines()
    h1_index = next((i for i, line in enumerate(lines) if line.startswith("# ")), None)
    if h1_index is not None:
        for line in lines[h1_index + 1 : h1_index + 5]:
            stripped = line.strip()
            if stripped.startswith(">"):
                return stripped.lstrip(">").strip()
            if stripped:
                break

    # Non-entity notes (_NOTE_FORMAT.md): an explicit "## TLDR" section.
    heading_match = _TLDR_HEADING_RE.search(body)
    if heading_match:
        content = heading_match.group(1).strip()
        if content:
            return content.splitlines()[0].strip()

    return ""


def _refuse_view_only(resolved: Path, verb: str) -> None:
    """PDFs are listed and rendered but never written. Without this, saving
    would overwrite the PDF with the editor's text and renaming would append
    .md to it - both silently destroy the file."""
    if resolved.suffix.lower() in _VIEW_ONLY_SUFFIXES:
        raise ValueError(f"{resolved.suffix.upper().lstrip('.')} files are view-only and cannot be {verb}")


def _file_url(path: Path) -> str:
    # Percent-encoded - vault paths contain spaces ("My Vault", "00 Notes")
    # and an unencoded space makes the webview treat the src as relative.
    return "file://" + urllib.parse.quote(str(path))


def _human_size(n: int) -> str:
    return f"{n / 1_048_576:.1f} MB" if n >= 1_048_576 else f"{max(1, n // 1024)} KB"


def _pdf_entry(path: Path) -> dict:
    stat = path.stat()
    return {
        "title": path.stem,
        "preview": f"PDF \u00b7 {_human_size(stat.st_size)} \u00b7 view only",
        "updated": datetime.fromtimestamp(stat.st_mtime).date().isoformat(),
        "path": str(path),
        "doc_type": "pdf",
    }


def _note_entry(path: Path) -> dict:
    if path.suffix.lower() in _VIEW_ONLY_SUFFIXES:
        return _pdf_entry(path)
    text = path.read_text(encoding="utf-8")
    frontmatter, body = _parse_frontmatter(text)
    title = frontmatter.get("name") or path.stem
    preview = _extract_preview(body) or "(no summary yet)"
    updated_raw = frontmatter.get("updated") or frontmatter.get("created")
    if updated_raw:
        updated = str(updated_raw)
    else:
        updated = datetime.fromtimestamp(path.stat().st_mtime).date().isoformat()
    return {"title": title, "preview": preview, "updated": updated, "path": str(path), "doc_type": "md"}


def _resolve_within(notes_root: Path, path: str) -> Path:
    """
    Resolves path and ensures it's inside notes_root - a note editor writes
    exactly the path a card already gave it, but this guards against ever
    writing outside 00 Notes/ if something upstream passed a bad value.
    """
    resolved = Path(path).resolve()
    if notes_root.resolve() not in resolved.parents and resolved != notes_root.resolve():
        raise ValueError(f"Path is outside the notes root: {path}")
    return resolved


def _validate_name(name: str) -> str:
    name = name.strip()
    if not name or name in (".", "..") or not _SAFE_NAME_RE.match(name):
        raise ValueError(f"Invalid name: {name!r}")
    return name


def _ensure_target_dir(notes_root: Path, folder_path: str) -> Path:
    target_dir = _resolve_within(notes_root, folder_path)
    if target_dir.exists() and not target_dir.is_dir():
        raise ValueError(f"Not a folder: {folder_path}")
    target_dir.mkdir(parents=True, exist_ok=True)
    return target_dir


def _seed_content(category: str, title: str, templates_dir: Path = None) -> str:
    """
    New-note starter content. `concepts` has a real template
    (00 Notes/_templates/concept.md) - its {{NAME}}/{{YYYY-MM-DD}} tokens are
    filled in since leaving them literal would make every new note look
    broken; its other tokens ({{slug}}, {{source}}, ...) are left as-is,
    since those need real context only /sync's caller has. The other five
    categories have no template yet, so they get the minimal skeleton
    page-format.md actually mandates: title, empty TLDR, the compiled-truth
    divider - nothing invented beyond that.
    """
    templates_dir = Path(templates_dir) if templates_dir else folder_path("notes") / "_templates"
    if category == "concepts":
        template_path = templates_dir / "concept.md"
        if template_path.is_file():
            text = template_path.read_text(encoding="utf-8")
            text = text.replace("{{NAME}}", title)
            text = text.replace("{{YYYY-MM-DD}}", datetime.now().date().isoformat())
            return text
    return f"# {title}\n\n> \n\n---\n"


def create_note(
    category: str,
    name: str,
    parent_path: str = None,
    notes_root: Path = None,
    templates_dir: Path = None,
    blank: bool = False,
) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    if not _is_category(category, notes_root):
        raise ValueError(f"Unknown category: {category}")

    name = _validate_name(name)
    if not name.endswith(".md"):
        name = f"{name}.md"
    title = name[:-3]

    target_dir = _ensure_target_dir(notes_root, parent_path or str(notes_root / category))
    target_path = target_dir / name
    if target_path.exists():
        raise ValueError(f"A note named {name!r} already exists here")

    content = "" if blank else _seed_content(category, title, templates_dir)
    target_path.write_text(content, encoding="utf-8")
    return {"type": "file", **_note_entry(target_path)}


def create_category(name: str, notes_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    name = _validate_name(name)
    new_category = notes_root / name
    if new_category.exists():
        raise ValueError(f"A category named {name!r} already exists")

    new_category.mkdir(parents=True)
    return {"name": name, "children": []}


def create_folder(category: str, name: str, parent_path: str = None, notes_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    if not _is_category(category, notes_root):
        raise ValueError(f"Unknown category: {category}")

    name = _validate_name(name)
    parent_dir = _ensure_target_dir(notes_root, parent_path or str(notes_root / category))
    new_folder = parent_dir / name
    if new_folder.exists():
        raise ValueError(f"A folder named {name!r} already exists here")

    new_folder.mkdir(parents=True)
    return {"type": "folder", "name": name, "path": str(new_folder), "children": []}


def _iter_markdown_files(root: Path):
    for dirpath, dirnames, filenames in os.walk(root):
        dirnames[:] = [d for d in dirnames if d not in _SKIP_DIR_NAMES and not d.startswith(".")]
        for filename in filenames:
            if filename.endswith(".md"):
                yield Path(dirpath) / filename


def _rewrite_wikilinks(vault_root: Path, old_name: str, new_name: str) -> int:
    """
    Vault-wide backlink fix for a rename: rewrites every [[old_name]] and
    [[old_name|alias]] reference anywhere under vault_root to point at
    new_name instead, preserving alias text untouched. Returns how many
    files were modified.
    """
    pattern = re.compile(r"\[\[" + re.escape(old_name) + r"(\|[^\]]*)?\]\]")

    def _replace(match):
        alias = match.group(1) or ""
        return f"[[{new_name}{alias}]]"

    modified_count = 0
    for path in _iter_markdown_files(vault_root):
        try:
            text = path.read_text(encoding="utf-8")
        except (UnicodeDecodeError, OSError):
            continue
        new_text, count = pattern.subn(_replace, text)
        if count:
            path.write_text(new_text, encoding="utf-8")
            modified_count += 1
    return modified_count


def rename_note(path: str, new_name: str, notes_root: Path = None, vault_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    vault_root = Path(vault_root) if vault_root else (VAULT_ROOT if notes_root.resolve() == NOTES_ROOT.resolve() else notes_root)
    resolved = _resolve_within(notes_root, path)
    if not resolved.is_file():
        raise ValueError(f"Not a note file: {path}")
    _refuse_view_only(resolved, "renamed")

    new_name = _validate_name(new_name)
    if not new_name.endswith(".md"):
        new_name = f"{new_name}.md"

    old_stem = resolved.stem
    new_stem = new_name[:-3]
    target = resolved.parent / new_name
    if target.exists():
        raise ValueError(f"A note named {new_name!r} already exists here")

    resolved.rename(target)
    links_updated_in = 0
    if old_stem != new_stem:
        links_updated_in = _rewrite_wikilinks(vault_root, old_stem, new_stem)

    return {"type": "file", "links_updated_in": links_updated_in, **_note_entry(target)}


def rename_folder(path: str, new_name: str, notes_root: Path = None) -> dict:
    # No wikilink rewrite needed here, unlike rename_note - wikilinks
    # reference note filenames, never folder paths.
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    if not resolved.is_dir():
        raise ValueError(f"Not a folder: {path}")

    new_name = _validate_name(new_name)
    target = resolved.parent / new_name
    if target.exists():
        raise ValueError(f"A folder named {new_name!r} already exists here")

    resolved.rename(target)
    return {"type": "folder", "name": new_name, "path": str(target), "children": _tree_children(target)}


def move_note(path: str, target_folder: str = None, category: str = None, notes_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    if not resolved.is_file():
        raise ValueError(f"Not a note file: {path}")

    if not target_folder:
        if not _is_category(category, notes_root):
            raise ValueError(f"Unknown category: {category}")
        target_folder = str(notes_root / category)

    target_dir = _ensure_target_dir(notes_root, target_folder)
    destination = target_dir / resolved.name
    if destination.exists():
        raise ValueError(f"A note named {resolved.name!r} already exists in the target folder")

    shutil.move(str(resolved), str(destination))
    return {"type": "file", **_note_entry(destination)}


def move_folder(path: str, target_folder: str = None, category: str = None, notes_root: Path = None) -> dict:
    """
    Like move_note, but for a folder - with an extra containment guard
    shutil.move doesn't give a clean error for: dropping a folder into
    itself or one of its own descendants would otherwise either raise an
    opaque shutil.Error or, worse, succeed into a broken nested state.
    """
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    if not resolved.is_dir():
        raise ValueError(f"Not a folder: {path}")

    if not target_folder:
        if not _is_category(category, notes_root):
            raise ValueError(f"Unknown category: {category}")
        target_folder = str(notes_root / category)

    target_dir = _ensure_target_dir(notes_root, target_folder)
    if target_dir == resolved or resolved in target_dir.parents:
        raise ValueError("Can't move a folder into itself or one of its own subfolders")

    destination = target_dir / resolved.name
    if destination.exists():
        raise ValueError(f"A folder named {resolved.name!r} already exists in the target folder")

    shutil.move(str(resolved), str(destination))
    return {"type": "folder", "name": resolved.name, "path": str(destination), "children": _tree_children(destination)}


def trash_folder(path: str, notes_root: Path = None) -> dict:
    """
    Moves a folder (and everything inside it) to macOS Trash via Cocoa's
    NSFileManager, rather than shutil.rmtree - recoverable the same way
    deleting it in Finder would be. Nothing is deleted without confirming
    first (the confirmation itself happens client-side; this is the actual
    deletion once that's already been confirmed).
    """
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    if not resolved.is_dir():
        raise ValueError(f"Not a folder: {path}")
    if resolved == notes_root.resolve():
        raise ValueError("Refusing to trash the notes root itself")

    url = Foundation.NSURL.fileURLWithPath_(str(resolved))
    fm = Foundation.NSFileManager.defaultManager()
    ok, _resulting_url, error = fm.trashItemAtURL_resultingItemURL_error_(url, None, None)
    if not ok:
        message = error.localizedDescription() if error else "Unknown error moving to Trash"
        raise ValueError(f"Couldn't move {resolved.name!r} to Trash: {message}")

    return {"path": str(resolved)}


def trash_note(path: str, notes_root: Path = None) -> dict:
    """
    Moves a single note to macOS Trash - same mechanism as trash_folder,
    scoped to one file. A file can never be the notes root, so there's no
    equivalent "refuse the root itself" guard.
    """
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    if not resolved.is_file():
        raise ValueError(f"Not a file: {path}")

    url = Foundation.NSURL.fileURLWithPath_(str(resolved))
    fm = Foundation.NSFileManager.defaultManager()
    ok, _resulting_url, error = fm.trashItemAtURL_resultingItemURL_error_(url, None, None)
    if not ok:
        message = error.localizedDescription() if error else "Unknown error moving to Trash"
        raise ValueError(f"Couldn't move {resolved.name!r} to Trash: {message}")

    return {"path": str(resolved)}


def get_note_content(path: str, notes_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    if resolved.suffix.lower() in _VIEW_ONLY_SUFFIXES:
        # No "content" key at all - read_text() on a PDF raises
        # UnicodeDecodeError, and there is no text for the editor to hold.
        return {"path": str(resolved), "doc_type": "pdf", "url": _file_url(resolved)}
    return {
        "path": str(resolved),
        "doc_type": "md",
        "content": resolved.read_text(encoding="utf-8"),
    }


def save_note_content(path: str, content: str, notes_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    resolved = _resolve_within(notes_root, path)
    _refuse_view_only(resolved, "edited")
    resolved.write_text(content, encoding="utf-8")
    return _note_entry(resolved)


def _tree_children(folder: Path) -> list:
    """
    One folder's immediate children as tree nodes - subfolders (recursed)
    first, then note files, both alphabetical. Dotfiles and anything
    underscore-prefixed (templates, etc.) are skipped at every level.
    """
    children = []
    if not folder.is_dir():
        return children

    subfolders = sorted(
        p for p in folder.iterdir() if p.is_dir() and not p.name.startswith((".", "_"))
    )
    for subfolder in subfolders:
        children.append(
            {
                "type": "folder",
                "name": subfolder.name,
                "path": str(subfolder),
                "children": _tree_children(subfolder),
            }
        )

    files = sorted(
        (
            p
            for p in folder.iterdir()
            if p.is_file()
            and p.suffix.lower() in _READABLE_SUFFIXES
            and not p.name.startswith(("_", "."))
        ),
        key=lambda p: p.name.lower(),
    )
    for path in files:
        children.append({"type": "file", **_note_entry(path)})

    return children


def list_categories(notes_root: Path = None) -> dict:
    notes_root = Path(notes_root) if notes_root else folder_path("notes")
    categories = []
    loose = [{"type": "file", **_note_entry(path)} for path in sorted(notes_root.iterdir())
             if path.is_file() and path.suffix.lower() in _READABLE_SUFFIXES
             and not path.name.startswith((".", "_"))] if notes_root.is_dir() else []
    if loose:
        categories.append({"name": ".", "label": "Loose notes", "path": str(notes_root), "children": loose})
    for category in list_category_names(notes_root):
        folder = notes_root / category
        categories.append({"name": category, "path": str(folder), "children": _tree_children(folder)})
    return {"categories": categories}
