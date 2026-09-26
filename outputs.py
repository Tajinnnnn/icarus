from pathlib import Path

_IMAGE_EXTS = {".png", ".jpg", ".jpeg", ".gif", ".webp"}
_HTML_EXTS = {".html", ".htm"}


def _resolve_within_any(roots: list, path: str) -> Path:
    """
    Resolves path and ensures it's inside at least one of roots - mirrors
    notes.py's _resolve_within, generalized to multiple allowed roots since
    every valid crew has its own output_dir rather than one shared root.
    Raises ValueError (never returns a path outside every root) so a
    manipulated path argument from the JS bridge can't read arbitrary
    filesystem content.
    """
    resolved = Path(path).resolve()
    for root in roots:
        root_resolved = Path(root).resolve()
        if resolved == root_resolved or root_resolved in resolved.parents:
            return resolved
    raise ValueError(f"Path is outside every registered crew's output directory: {path}")


def _file_node(path: Path) -> dict:
    stat = path.stat()
    return {"type": "file", "name": path.name, "path": str(path), "mtime": stat.st_mtime}


def _folder_children(folder: Path) -> list:
    """
    One folder's immediate children as tree nodes - subfolders (recursed)
    newest-first by their own most-recently-modified content, then files
    alphabetically. Newest-first at the folder level matches run folders
    being named with a leading timestamp; sorting by mtime rather than name
    keeps it correct even if that naming convention ever changes.
    """
    if not folder.is_dir():
        return []

    subfolders = sorted(
        (p for p in folder.iterdir() if p.is_dir() and not p.name.startswith(".")),
        key=lambda p: p.stat().st_mtime,
        reverse=True,
    )
    children = [
        {
            "type": "folder",
            "name": subfolder.name,
            "path": str(subfolder),
            "children": _folder_children(subfolder),
        }
        for subfolder in subfolders
    ]

    files = sorted((p for p in folder.iterdir() if p.is_file() and not p.name.startswith(".")), key=lambda p: p.name)
    children.extend(_file_node(p) for p in files)

    return children


def get_outputs_tree(crew_entries: list) -> dict:
    """
    Full run-output history for every valid crew, as a tree: crew -> run
    folder (newest-first) -> file, with any deeper nesting a crew's own
    output happens to have (e.g. a screenshots/ subfolder) preserved as
    nested folder nodes rather than flattened.
    """
    crews = []
    for entry in crew_entries:
        if not entry.valid:
            continue
        crews.append(
            {
                "id": entry.id,
                "name": entry.name,
                "children": _folder_children(entry.output_dir),
            }
        )
    return {"crews": crews}


def _classify(path: Path) -> str:
    ext = path.suffix.lower()
    if ext == ".md":
        return "markdown"
    if ext == ".txt":
        return "text"
    if ext in _HTML_EXTS:
        return "html"
    if ext == ".json":
        return "json"
    if ext in _IMAGE_EXTS:
        return "image"
    return "unsupported"


def get_output_file_preview(crew_entries: list, path: str) -> dict:
    """
    Validated read of a single output file for the preview pane. `path`
    must resolve inside one of the currently loaded registry's valid
    crews' output_dir - see _resolve_within_any. Returns content already
    shaped for the client by kind:
    - markdown/text/html: raw text, rendered/sanitized client-side
    - json: raw text; the client pretty-prints, with a raw-text fallback
      if it fails to parse (kept a plain string here rather than
      pre-parsed so a malformed file still round-trips instead of
      raising server-side)
    - image: no content, just the validated absolute path, so the client
      builds a file:// URL directly instead of round-tripping bytes
      through the JS bridge
    - unsupported: no content
    """
    roots = [entry.output_dir for entry in crew_entries if entry.valid]
    resolved = _resolve_within_any(roots, path)
    if not resolved.is_file():
        raise ValueError(f"Not a file: {path}")

    kind = _classify(resolved)
    if kind == "image":
        return {"kind": kind, "path": str(resolved)}

    content = resolved.read_text(encoding="utf-8", errors="replace")
    return {"kind": kind, "path": str(resolved), "content": content}
