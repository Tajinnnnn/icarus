#!/usr/bin/env bash
# (C) Publish the audited public source to the Icarus GitHub repo in one step:
#   export (allowlist + secret scan) -> sync into the public clone -> run the
#   tests THERE -> commit -> push. Any failure stops before anything is pushed.
#
# Usage: ./publish\ \(C\).sh "commit message"
set -euo pipefail

HERE="$(cd "$(dirname "$0")" && pwd)"
PUBLIC="${ICARUS_PUBLIC_REPO:-$HOME/Documents/Coding/icarus}"
MSG="${1:-Sync from private working tree}"

[ -d "$PUBLIC/.git" ] || { echo "Public clone not found at $PUBLIC"; exit 1; }

echo "== export"
OUT="$(python3 "$HERE/export_source (C).py")"
echo "$OUT"
SRC="$(printf '%s\n' "$OUT" | sed -n 's/^Clean source: //p')"

echo "== sync -> $PUBLIC"
rsync -a --delete --exclude .git --exclude .venv "$SRC"/ "$PUBLIC"/

cd "$PUBLIC"
if git diff --quiet && [ -z "$(git status --porcelain)" ]; then
  echo "Nothing changed; public repo already matches."; exit 0
fi

echo "== tests (inside the public tree)"
uv run pytest -q
for f in tests/*.cjs; do node "$f" >/dev/null && echo "ok $f"; done

echo "== last-chance scan of the diff"
if git diff | grep -E '^\+' | grep -E -i 'sk-[A-Za-z0-9_-]{24,}|gh[pousr]_[A-Za-z0-9]{30,}|AKIA[A-Z0-9]{16}|BEGIN .*PRIVATE KEY|/Users/[a-z]'; then
  echo "Blocked: the diff above contains a credential or a home path."; exit 1
fi

echo "== commit + push"
git add -A
git commit -q -m "$MSG"
git push
git log --oneline -1
