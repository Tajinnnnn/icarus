import shutil
from pathlib import Path

import pytest

from notes import (
    create_category,
    create_folder,
    create_note,
    get_note_content,
    list_categories,
    move_folder,
    move_note,
    rename_folder,
    rename_note,
    save_note_content,
    trash_folder,
    trash_note,
)


def _write(path, content):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content)


def test_category_with_notes_lists_title_preview_and_updated(tmp_path):
    _write(
        tmp_path / "concepts" / "Some Idea.md",
        """---
type: concept
name: Some Idea
created: 2026-07-15
---

# Some Idea

> A one-line synthesis of what this idea is about.

## Compiled truth

More detail here.
""",
    )

    result = list_categories(notes_root=tmp_path)
    concepts = next(c for c in result["categories"] if c["name"] == "concepts")
    assert len(concepts["children"]) == 1
    note = concepts["children"][0]
    assert note["type"] == "file"
    assert note["title"] == "Some Idea"
    assert note["preview"] == "A one-line synthesis of what this idea is about."
    assert note["updated"] == "2026-07-15"


def test_empty_category_returns_empty_list_not_error(tmp_path):
    (tmp_path / "people").mkdir()
    result = list_categories(notes_root=tmp_path)
    people = next(c for c in result["categories"] if c["name"] == "people")
    assert people["children"] == []


def test_no_category_folders_on_disk_returns_no_categories(tmp_path):
    # Categories are discovered from real subdirectories now (not a fixed
    # list) - a notes_root with nothing under it yet has no categories to
    # show, rather than every canonical name appearing pre-emptively empty.
    result = list_categories(notes_root=tmp_path)
    assert result["categories"] == []


def test_a_new_top_level_folder_appears_as_a_category(tmp_path):
    (tmp_path / "totally-new-category").mkdir()
    result = list_categories(notes_root=tmp_path)
    names = [c["name"] for c in result["categories"]]
    assert "totally-new-category" in names


def test_known_non_entity_folders_are_excluded_from_categories(tmp_path):
    for name in ["research", "canvases", "lint-reports", "saved-chats", "_templates", "Courses", "Videos", "Books", ".git"]:
        (tmp_path / name).mkdir()
    (tmp_path / "people").mkdir()

    result = list_categories(notes_root=tmp_path)
    names = [c["name"] for c in result["categories"]]
    assert names == ["people"]


def test_category_with_subfolder_shows_it_as_a_folder_node(tmp_path):
    _write(tmp_path / "sources" / "arxiv" / "Some Paper.md", "---\ntype: source\n---\n\n# Some Paper\n")

    result = list_categories(notes_root=tmp_path)
    sources = next(c for c in result["categories"] if c["name"] == "sources")
    assert len(sources["children"]) == 1
    folder_node = sources["children"][0]
    assert folder_node["type"] == "folder"
    assert folder_node["name"] == "arxiv"
    assert len(folder_node["children"]) == 1
    file_node = folder_node["children"][0]
    assert file_node["type"] == "file"
    assert file_node["title"] == "Some Paper"


def test_subfolders_are_nested_before_files_and_recurse(tmp_path):
    _write(tmp_path / "sources" / "arxiv" / "nested" / "Deep.md", "---\ntype: source\n---\n\n# Deep\n")
    _write(tmp_path / "sources" / "Top Level.md", "---\ntype: source\n---\n\n# Top Level\n")

    result = list_categories(notes_root=tmp_path)
    sources = next(c for c in result["categories"] if c["name"] == "sources")
    assert [c["type"] for c in sources["children"]] == ["folder", "file"]
    arxiv = sources["children"][0]
    assert arxiv["children"][0]["type"] == "folder"
    assert arxiv["children"][0]["children"][0]["title"] == "Deep"


def test_note_with_tldr_heading_instead_of_blockquote(tmp_path):
    _write(
        tmp_path / "sources" / "Some Article.md",
        """---
type: source
created: 2026-07-20
---

# Some Article

## TLDR
The article argues X is true because of Y.

## Key claims
- claim one
""",
    )

    result = list_categories(notes_root=tmp_path)
    sources = next(c for c in result["categories"] if c["name"] == "sources")
    note = sources["children"][0]
    assert note["preview"] == "The article argues X is true because of Y."


def test_note_with_no_discoverable_preview_gets_placeholder(tmp_path):
    _write(
        tmp_path / "companies" / "Some Company.md",
        """---
type: company
created: 2026-07-20
---

# Some Company

## Compiled truth

Just some prose, no TLDR blockquote or heading.
""",
    )

    result = list_categories(notes_root=tmp_path)
    companies = next(c for c in result["categories"] if c["name"] == "companies")
    note = companies["children"][0]
    assert note["preview"] == "(no summary yet)"


def test_underscore_prefixed_files_are_skipped(tmp_path):
    _write(tmp_path / "concepts" / "_template.md", "---\ntype: concept\n---\n\n# Template\n")
    result = list_categories(notes_root=tmp_path)
    concepts = next(c for c in result["categories"] if c["name"] == "concepts")
    assert concepts["children"] == []


def test_get_note_content_returns_raw_file_text(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "---\ntype: concept\n---\n\n# Idea\n\n> A summary.\n")

    result = get_note_content(str(note_path), notes_root=tmp_path)
    assert result["content"] == "---\ntype: concept\n---\n\n# Idea\n\n> A summary.\n"


def test_save_note_content_writes_and_returns_refreshed_entry(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "---\ntype: concept\n---\n\n# Idea\n\n> Old summary.\n")

    new_content = "---\ntype: concept\n---\n\n# Idea\n\n> New summary.\n"
    entry = save_note_content(str(note_path), new_content, notes_root=tmp_path)

    assert entry["preview"] == "New summary."
    assert note_path.read_text() == new_content


def test_note_write_functions_reject_paths_outside_notes_root(tmp_path):
    outside_path = tmp_path.parent / "not-a-note.md"
    outside_path.write_text("not a real note")

    with pytest.raises(ValueError):
        get_note_content(str(outside_path), notes_root=tmp_path)
    with pytest.raises(ValueError):
        save_note_content(str(outside_path), "malicious content", notes_root=tmp_path)


# ---- create_note ----------------------------------------------------------


def test_create_note_in_concepts_seeds_from_template_with_tokens_filled(tmp_path):
    templates_dir = tmp_path / "_templates"
    _write(
        templates_dir / "concept.md",
        '---\ntype: concept\nname: "{{NAME}}"\ncreated: "{{YYYY-MM-DD}}"\nslug: "{{slug}}"\n---\n\n# {{NAME}}\n',
    )
    (tmp_path / "concepts").mkdir()

    entry = create_note("concepts", "Some New Idea", notes_root=tmp_path, templates_dir=templates_dir)

    assert entry["type"] == "file"
    assert entry["title"] == "Some New Idea"
    content = (tmp_path / "concepts" / "Some New Idea.md").read_text()
    assert '{{NAME}}' not in content
    assert '{{YYYY-MM-DD}}' not in content
    assert '{{slug}}' in content  # left alone - not something a generic create can fill in
    assert "# Some New Idea" in content


def test_create_note_in_other_category_gets_minimal_skeleton(tmp_path):
    (tmp_path / "people").mkdir()
    entry = create_note("people", "Some Person", notes_root=tmp_path)

    assert entry["title"] == "Some Person"
    content = (tmp_path / "people" / "Some Person.md").read_text()
    assert content.startswith("# Some Person")
    assert "---" in content


def test_create_note_name_collision_is_rejected(tmp_path):
    _write(tmp_path / "concepts" / "Existing.md", "# Existing\n")

    with pytest.raises(ValueError):
        create_note("concepts", "Existing", notes_root=tmp_path)


def test_create_note_in_a_subfolder(tmp_path):
    (tmp_path / "sources" / "arxiv").mkdir(parents=True)

    entry = create_note(
        "sources", "Paper", parent_path=str(tmp_path / "sources" / "arxiv"), notes_root=tmp_path
    )

    assert (tmp_path / "sources" / "arxiv" / "Paper.md").exists()
    assert entry["path"] == str(tmp_path / "sources" / "arxiv" / "Paper.md")


def test_create_note_rejects_unknown_category(tmp_path):
    with pytest.raises(ValueError):
        create_note("not-a-real-category", "Name", notes_root=tmp_path)


def test_create_note_rejects_path_traversal_in_name(tmp_path):
    with pytest.raises(ValueError):
        create_note("concepts", "../escape", notes_root=tmp_path)


def test_create_note_blank_skips_all_seeding(tmp_path):
    (tmp_path / "concepts").mkdir()
    templates_dir = tmp_path / "_templates"
    _write(templates_dir / "concept.md", "# {{NAME}}\n")

    entry = create_note("concepts", "Truly Empty", notes_root=tmp_path, templates_dir=templates_dir, blank=True)

    assert (tmp_path / "concepts" / "Truly Empty.md").read_text() == ""
    assert entry["title"] == "Truly Empty"


def test_create_note_blank_in_non_template_category_is_also_empty(tmp_path):
    (tmp_path / "people").mkdir()
    create_note("people", "Blank Person", notes_root=tmp_path, blank=True)
    assert (tmp_path / "people" / "Blank Person.md").read_text() == ""


# ---- create_folder ---------------------------------------------------------


def test_create_folder_makes_an_empty_folder_node(tmp_path):
    (tmp_path / "sources").mkdir()
    entry = create_folder("sources", "arxiv", notes_root=tmp_path)

    assert entry == {"type": "folder", "name": "arxiv", "path": str(tmp_path / "sources" / "arxiv"), "children": []}
    assert (tmp_path / "sources" / "arxiv").is_dir()


def test_create_folder_name_collision_is_rejected(tmp_path):
    (tmp_path / "sources" / "arxiv").mkdir(parents=True)

    with pytest.raises(ValueError):
        create_folder("sources", "arxiv", notes_root=tmp_path)


# ---- create_category --------------------------------------------------------


def test_create_category_makes_a_new_top_level_folder(tmp_path):
    entry = create_category("projects", notes_root=tmp_path)

    assert entry == {"name": "projects", "children": []}
    assert (tmp_path / "projects").is_dir()


def test_create_category_appears_in_list_categories(tmp_path):
    create_category("projects", notes_root=tmp_path)
    names = [c["name"] for c in list_categories(notes_root=tmp_path)["categories"]]
    assert "projects" in names


def test_create_category_name_collision_is_rejected(tmp_path):
    (tmp_path / "people").mkdir()
    with pytest.raises(ValueError):
        create_category("people", notes_root=tmp_path)


def test_create_category_rejects_path_traversal_in_name(tmp_path):
    with pytest.raises(ValueError):
        create_category("../escape", notes_root=tmp_path)


# ---- rename_note ------------------------------------------------------------


def test_rename_note_with_no_incoming_links(tmp_path):
    note_path = tmp_path / "concepts" / "Old Name.md"
    _write(note_path, "# Old Name\n")

    entry = rename_note(str(note_path), "New Name", notes_root=tmp_path, vault_root=tmp_path)

    assert entry["title"] == "New Name"
    assert not note_path.exists()
    assert (tmp_path / "concepts" / "New Name.md").exists()
    assert entry["links_updated_in"] == 0


def test_rename_note_updates_incoming_link_elsewhere_in_the_vault(tmp_path):
    note_path = tmp_path / "concepts" / "Old Name.md"
    _write(note_path, "# Old Name\n")
    other_path = tmp_path / "people" / "Someone.md"
    _write(other_path, "See [[Old Name]] for context.\n")

    entry = rename_note(str(note_path), "New Name", notes_root=tmp_path, vault_root=tmp_path)

    assert entry["links_updated_in"] == 1
    assert other_path.read_text() == "See [[New Name]] for context.\n"


def test_rename_note_preserves_alias_text(tmp_path):
    note_path = tmp_path / "concepts" / "Old Name.md"
    _write(note_path, "# Old Name\n")
    other_path = tmp_path / "people" / "Someone.md"
    _write(other_path, "See [[Old Name|the old thing]] for context.\n")

    rename_note(str(note_path), "New Name", notes_root=tmp_path, vault_root=tmp_path)

    assert other_path.read_text() == "See [[New Name|the old thing]] for context.\n"


def test_rename_note_updates_link_in_a_file_outside_notes_root(tmp_path):
    # vault_root is a separate, wider scope than notes_root - rewrite must
    # reach files that aren't even under 00 Notes/.
    notes_root = tmp_path / "00 Notes"
    note_path = notes_root / "concepts" / "Old Name.md"
    _write(note_path, "# Old Name\n")
    journal_path = tmp_path / "01 Journals" / "daily" / "2026-08-07.md"
    _write(journal_path, "Talked about [[Old Name]] today.\n")

    rename_note(str(note_path), "New Name", notes_root=notes_root, vault_root=tmp_path)

    assert journal_path.read_text() == "Talked about [[New Name]] today.\n"


def test_rename_note_does_not_touch_a_similarly_prefixed_name(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")
    other_path = tmp_path / "people" / "Someone.md"
    _write(other_path, "See [[Idea Two]] and [[Idea]] both.\n")

    rename_note(str(note_path), "Renamed", notes_root=tmp_path, vault_root=tmp_path)

    assert other_path.read_text() == "See [[Idea Two]] and [[Renamed]] both.\n"


def test_rename_note_collision_is_rejected(tmp_path):
    note_path = tmp_path / "concepts" / "Old Name.md"
    _write(note_path, "# Old Name\n")
    _write(tmp_path / "concepts" / "Taken.md", "# Taken\n")

    with pytest.raises(ValueError):
        rename_note(str(note_path), "Taken", notes_root=tmp_path, vault_root=tmp_path)


def test_rename_note_rejects_paths_outside_notes_root(tmp_path):
    outside_path = tmp_path.parent / "not-a-note.md"
    outside_path.write_text("not a real note")

    with pytest.raises(ValueError):
        rename_note(str(outside_path), "New Name", notes_root=tmp_path, vault_root=tmp_path)


# ---- rename_folder -----------------------------------------------------------


def test_rename_folder_relocates_the_folder_and_keeps_its_contents(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    _write(folder_path / "Paper.md", "# Paper\n")

    entry = rename_folder(str(folder_path), "renamed", notes_root=tmp_path)

    assert not folder_path.exists()
    new_path = tmp_path / "sources" / "renamed"
    assert new_path.is_dir()
    assert entry["path"] == str(new_path)
    assert entry["children"][0]["title"] == "Paper"


def test_rename_folder_does_not_touch_any_links(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    _write(folder_path / "Paper.md", "# Paper\n")
    other_path = tmp_path / "people" / "Someone.md"
    _write(other_path, "See [[Paper]] and [[arxiv]].\n")  # "arxiv" here is just text, not a folder link

    rename_folder(str(folder_path), "renamed", notes_root=tmp_path)

    assert other_path.read_text() == "See [[Paper]] and [[arxiv]].\n"


def test_rename_folder_collision_is_rejected(tmp_path):
    (tmp_path / "sources" / "arxiv").mkdir(parents=True)
    (tmp_path / "sources" / "taken").mkdir(parents=True)

    with pytest.raises(ValueError):
        rename_folder(str(tmp_path / "sources" / "arxiv"), "taken", notes_root=tmp_path)


def test_rename_folder_rejects_paths_outside_notes_root(tmp_path):
    outside_folder = tmp_path.parent / "not-in-vault"
    outside_folder.mkdir()

    with pytest.raises(ValueError):
        rename_folder(str(outside_folder), "renamed", notes_root=tmp_path)


# ---- move_note --------------------------------------------------------------


def test_move_note_relocates_the_file(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")
    (tmp_path / "companies").mkdir()

    entry = move_note(str(note_path), str(tmp_path / "companies"), notes_root=tmp_path)

    assert not note_path.exists()
    assert (tmp_path / "companies" / "Idea.md").exists()
    assert entry["path"] == str(tmp_path / "companies" / "Idea.md")


def test_move_note_does_not_alter_any_links(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")
    other_path = tmp_path / "people" / "Someone.md"
    _write(other_path, "See [[Idea]] for context.\n")
    (tmp_path / "companies").mkdir()

    move_note(str(note_path), str(tmp_path / "companies"), notes_root=tmp_path)

    assert other_path.read_text() == "See [[Idea]] for context.\n"


def test_move_note_collision_is_rejected(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")
    _write(tmp_path / "companies" / "Idea.md", "# Existing\n")

    with pytest.raises(ValueError):
        move_note(str(note_path), str(tmp_path / "companies"), notes_root=tmp_path)


def test_move_note_by_category_name_when_target_folder_omitted(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")
    (tmp_path / "companies").mkdir()

    entry = move_note(str(note_path), category="companies", notes_root=tmp_path)

    assert (tmp_path / "companies" / "Idea.md").exists()
    assert entry["path"] == str(tmp_path / "companies" / "Idea.md")


def test_move_note_rejects_unknown_category_when_target_folder_omitted(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")

    with pytest.raises(ValueError):
        move_note(str(note_path), category="not-a-real-category", notes_root=tmp_path)


def test_move_note_to_a_not_yet_existing_category_folder_creates_it(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")

    entry = move_note(str(note_path), str(tmp_path / "vehicles"), notes_root=tmp_path)

    assert (tmp_path / "vehicles").is_dir()
    assert entry["path"] == str(tmp_path / "vehicles" / "Idea.md")


def test_move_note_rejects_paths_outside_notes_root(tmp_path):
    outside_path = tmp_path.parent / "not-a-note.md"
    outside_path.write_text("not a real note")

    with pytest.raises(ValueError):
        move_note(str(outside_path), str(tmp_path / "companies"), notes_root=tmp_path)


# ---- move_folder -------------------------------------------------------------


def test_move_folder_relocates_the_folder_and_its_contents(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    _write(folder_path / "Paper.md", "# Paper\n")
    (tmp_path / "concepts").mkdir()

    entry = move_folder(str(folder_path), str(tmp_path / "concepts"), notes_root=tmp_path)

    assert entry["path"] == str(tmp_path / "concepts" / "arxiv")
    assert (tmp_path / "concepts" / "arxiv" / "Paper.md").exists()
    assert not folder_path.exists()


def test_move_folder_by_category_name_when_target_folder_omitted(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    folder_path.mkdir(parents=True)
    (tmp_path / "companies").mkdir()

    entry = move_folder(str(folder_path), category="companies", notes_root=tmp_path)

    assert (tmp_path / "companies" / "arxiv").is_dir()
    assert entry["path"] == str(tmp_path / "companies" / "arxiv")


def test_move_folder_collision_is_rejected(tmp_path):
    source = tmp_path / "sources" / "arxiv"
    source.mkdir(parents=True)
    (tmp_path / "concepts" / "arxiv").mkdir(parents=True)

    with pytest.raises(ValueError):
        move_folder(str(source), str(tmp_path / "concepts"), notes_root=tmp_path)


def test_move_folder_onto_itself_is_rejected(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    folder_path.mkdir(parents=True)

    with pytest.raises(ValueError):
        move_folder(str(folder_path), str(folder_path), notes_root=tmp_path)


def test_move_folder_onto_its_own_descendant_is_rejected(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    nested = folder_path / "nested"
    nested.mkdir(parents=True)

    with pytest.raises(ValueError):
        move_folder(str(folder_path), str(nested), notes_root=tmp_path)

    # nothing should have moved
    assert folder_path.is_dir()
    assert nested.is_dir()


def test_move_folder_rejects_unknown_category_when_target_folder_omitted(tmp_path):
    folder_path = tmp_path / "sources" / "arxiv"
    folder_path.mkdir(parents=True)

    with pytest.raises(ValueError):
        move_folder(str(folder_path), category="not-a-real-category", notes_root=tmp_path)


def test_move_folder_rejects_paths_outside_notes_root(tmp_path):
    outside_path = tmp_path.parent / "not-a-folder"
    outside_path.mkdir()
    (tmp_path / "companies").mkdir()

    with pytest.raises(ValueError):
        move_folder(str(outside_path), str(tmp_path / "companies"), notes_root=tmp_path)


# ---- trash_folder -------------------------------------------------------
#
# These exercise the real macOS Trash (NSFileManager doesn't accept a fake
# root the way the rest of this file's tmp_path-based tests do) - each test
# cleans up after itself so nothing lingers in ~/.Trash.


def _cleanup_trash(name):
    trashed = Path.home() / ".Trash" / name
    if trashed.exists():
        shutil.rmtree(trashed)


def test_trash_folder_moves_folder_and_contents_to_trash(tmp_path):
    folder_path = tmp_path / "sources" / "to-delete"
    _write(folder_path / "Paper.md", "# Paper\n")

    try:
        result = trash_folder(str(folder_path), notes_root=tmp_path)
        assert result["path"] == str(folder_path)
        assert not folder_path.exists()
        assert (Path.home() / ".Trash" / "to-delete" / "Paper.md").exists()
    finally:
        _cleanup_trash("to-delete")


def test_trash_folder_rejects_the_notes_root_itself(tmp_path):
    with pytest.raises(ValueError):
        trash_folder(str(tmp_path), notes_root=tmp_path)
    assert tmp_path.exists()


def test_trash_folder_rejects_a_file(tmp_path):
    note_path = tmp_path / "concepts" / "Idea.md"
    _write(note_path, "# Idea\n")

    with pytest.raises(ValueError):
        trash_folder(str(note_path), notes_root=tmp_path)
    assert note_path.exists()


def test_trash_folder_rejects_paths_outside_notes_root(tmp_path):
    outside_path = tmp_path.parent / "not-under-notes-root"
    outside_path.mkdir()

    try:
        with pytest.raises(ValueError):
            trash_folder(str(outside_path), notes_root=tmp_path)
        assert outside_path.exists()
    finally:
        shutil.rmtree(outside_path, ignore_errors=True)


# ---- trash_note ----------------------------------------------------------
#
# Same real-Trash caveat as trash_folder above - each test cleans up after
# itself so nothing lingers in ~/.Trash.


def test_trash_note_moves_file_to_trash(tmp_path):
    note_path = tmp_path / "concepts" / "to-delete.md"
    _write(note_path, "# To Delete\n")

    trashed = Path.home() / ".Trash" / "to-delete.md"
    try:
        result = trash_note(str(note_path), notes_root=tmp_path)
        assert result["path"] == str(note_path)
        assert not note_path.exists()
        assert trashed.exists()
    finally:
        trashed.unlink(missing_ok=True)


def test_trash_note_rejects_a_folder(tmp_path):
    folder_path = tmp_path / "concepts" / "a-folder"
    folder_path.mkdir(parents=True)

    with pytest.raises(ValueError):
        trash_note(str(folder_path), notes_root=tmp_path)
    assert folder_path.exists()


def test_trash_note_rejects_paths_outside_notes_root(tmp_path):
    outside_path = tmp_path.parent / "not-under-notes-root.md"
    _write(outside_path, "# Outside\n")

    try:
        with pytest.raises(ValueError):
            trash_note(str(outside_path), notes_root=tmp_path)
        assert outside_path.exists()
    finally:
        outside_path.unlink(missing_ok=True)


# ---- PDFs: listed and viewable, never written ---------------------------
# The notes tree used to glob "*.md" only, so a folder of PDFs rendered as
# empty. PDFs are listed so their CHARTS can be viewed in the webview - text
# extraction cannot carry a slide deck's charts over, which is the whole
# reason they're here rather than converted to markdown.

_MINIMAL_PDF = b"%PDF-1.4\n1 0 obj<</Type/Catalog>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF\n"


def _write_pdf(path, payload=_MINIMAL_PDF):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_bytes(payload)


def test_pdf_in_a_category_is_listed_alongside_markdown(tmp_path):
    _write(tmp_path / "concepts" / "A Note.md", "# A Note\n")
    _write_pdf(tmp_path / "concepts" / "A Deck.pdf")
    children = list_categories(notes_root=tmp_path)["categories"][0]["children"]
    by_title = {c["title"]: c for c in children}
    assert set(by_title) == {"A Note", "A Deck"}
    assert by_title["A Deck"]["doc_type"] == "pdf"
    assert by_title["A Note"]["doc_type"] == "md"


def test_pdf_entry_does_not_try_to_decode_the_file_as_text(tmp_path):
    # Binary that is not valid UTF-8 - the markdown path would raise
    # UnicodeDecodeError here and take the whole tree down with it.
    _write_pdf(tmp_path / "concepts" / "Binary.pdf", b"%PDF-1.4\n\xff\xfe\x00\x80 binary\n")
    entry = list_categories(notes_root=tmp_path)["categories"][0]["children"][0]
    assert entry["title"] == "Binary"
    assert "view only" in entry["preview"]


def test_get_note_content_on_a_pdf_returns_a_url_and_no_content(tmp_path):
    pdf = tmp_path / "concepts" / "Deck.pdf"
    _write_pdf(pdf)
    result = get_note_content(str(pdf), notes_root=tmp_path)
    assert result["doc_type"] == "pdf"
    assert "content" not in result
    assert result["url"].startswith("file:///")


def test_pdf_url_percent_encodes_spaces(tmp_path):
    # Vault paths contain spaces ("00 Notes", "My Vault"); an unencoded
    # space makes the webview treat the iframe src as a relative path.
    pdf = tmp_path / "concepts" / "My Deck.pdf"
    _write_pdf(pdf)
    result = get_note_content(str(pdf), notes_root=tmp_path)
    assert "My%20Deck.pdf" in result["url"]
    assert " " not in result["url"]


def test_saving_over_a_pdf_is_refused(tmp_path):
    pdf = tmp_path / "concepts" / "Deck.pdf"
    _write_pdf(pdf)
    with pytest.raises(ValueError, match="view-only"):
        save_note_content(str(pdf), "clobbered", notes_root=tmp_path)
    assert pdf.read_bytes() == _MINIMAL_PDF


def test_renaming_a_pdf_is_refused_rather_than_appending_md(tmp_path):
    pdf = tmp_path / "concepts" / "Deck.pdf"
    _write_pdf(pdf)
    with pytest.raises(ValueError, match="view-only"):
        rename_note(str(pdf), "Renamed", notes_root=tmp_path, vault_root=tmp_path)
    assert pdf.exists()
    assert not (tmp_path / "concepts" / "Renamed.md").exists()


def test_moving_a_pdf_keeps_its_extension(tmp_path):
    # move_note uses resolved.name rather than forcing a suffix, so this is
    # allowed - but pin it, since a refactor to mirror rename_note would
    # silently turn the PDF into a .md file.
    _write_pdf(tmp_path / "concepts" / "Deck.pdf")
    (tmp_path / "concepts" / "sub").mkdir()
    entry = move_note(
        str(tmp_path / "concepts" / "Deck.pdf"),
        target_folder=str(tmp_path / "concepts" / "sub"),
        notes_root=tmp_path,
    )
    assert entry["doc_type"] == "pdf"
    assert (tmp_path / "concepts" / "sub" / "Deck.pdf").exists()


def test_other_binary_types_are_still_not_listed(tmp_path):
    # Only markdown and PDF are readable; an images/ folder next to the notes
    # must not start showing up in the tree as unopenable rows.
    _write_pdf(tmp_path / "concepts" / "Deck.pdf")
    (tmp_path / "concepts" / "photo.png").write_bytes(b"\x89PNG\r\n")
    (tmp_path / "concepts" / "sheet.xlsx").write_bytes(b"PK\x03\x04")
    titles = {c["title"] for c in list_categories(notes_root=tmp_path)["categories"][0]["children"]}
    assert titles == {"Deck"}
