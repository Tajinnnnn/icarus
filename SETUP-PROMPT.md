<!-- (C) -->
# Icarus setup prompt

Copy everything below the line into your AI coding assistant (Claude Code, Cursor, Codex, etc.) and let it walk you through the setup. It works best with an assistant that can run terminal commands on your Mac.

---

You are helping me install and set up **Icarus**, a local macOS dashboard for notes, journals, AI automations, and optional trading tools. Source: https://github.com/Tajinnnnn/icarus

Work through the phases below **in order, one step at a time**. After each step, confirm it worked before moving on. When a step needs something only I can do (download an app, sign in, get a key), tell me exactly what to do and wait for me to say it is done. Do not skip ahead and do not guess paths.

## Rules that apply the whole time

- **Never ask me to paste an API key into this chat**, and never write one into any file inside the Icarus repo. Keys go in my shell profile (`~/.zshrc`) or a `.env` file outside the repo. If I paste a key by mistake, tell me to treat it as compromised and rotate it.
- Do not run `git commit` or `git push` in the Icarus repo unless I ask.
- Do not delete or move any of my existing files or folders. If a folder already exists, use it.
- Explain each command in one plain sentence before running it.

## Phase 1 — Check the machine

1. Confirm this is macOS (`sw_vers`). Icarus is a native macOS app and will not run on Windows or Linux; if this is not a Mac, stop and tell me.
2. Check for Homebrew (`brew --version`). If missing, give me the install command from https://brew.sh and wait.
3. Check for Python 3.12 or newer (`python3 --version`) and for `uv` (`uv --version`). Install what is missing: `brew install uv` (uv can install Python itself with `uv python install 3.12`).
4. Check for git (`git --version`) and Node (`node --version`, only needed to run the JS tests; skip if I don't care).

## Phase 2 — Get Icarus running

1. Ask me where I keep code (default `~/Code`). Clone there:
   `git clone https://github.com/Tajinnnnn/icarus.git` and `cd icarus`.
2. Run `uv sync` to install dependencies.
3. Run `uv run python app.py`. A window titled **Icarus** should appear with a Dock icon and a menu-bar icon. Ask me to confirm I see it. Cmd+Q quits.
4. If it fails, read the traceback, fix the environment (not the source), and retry. Common causes: wrong Python version, missing `uv sync`.

Optional: `uv run python dev_preview.py` serves the same dashboard at http://127.0.0.1:8431 for use in a normal browser.

## Phase 3 — Set up Obsidian and my folders

Icarus reads and writes plain Markdown files. Obsidian is the recommended editor for the same files, but any folder works.

1. Ask whether I already use Obsidian.
   - **No:** tell me to install it (`brew install --cask obsidian` or https://obsidian.md), open it, and choose **Create new vault**. Suggest the name `Brain` and location `~/Documents/Brain`. Wait until I confirm the vault path.
   - **Yes:** ask for the vault's full path.
2. Inside that vault, create these folders if they do not exist (ask before creating anything):
   - `Notes/` — my notes (Markdown and PDFs, any subfolders)
   - `Journal/daily/` — one file per day, `YYYY-MM-DD.md`
   - `Journal/trade/` — only if I trade; otherwise skip
3. Create `Journal/daily/_template.md` with exactly these headings, because Icarus reads and writes these sections by name:

   ```markdown
   # {{date}}

   ## What would make today great
   1.
   2.
   3.

   ## Notes / captures throughout the day

   ## Amazing things that happened

   ## How today could've been better
   ```

   If I use trade journals, create `Journal/trade/_template.md` with these headings: `## Trade taken`, `## Reasoning`, `## What went right`, `## What went wrong`, `## What could be improved`, `## Net profit/loss`, `## 3 notes`.
4. In Obsidian, suggest **Settings → Files & Links → Default location for new attachments → `media/images`** so pasted images land in one place. This is optional.
5. Now in Icarus: open **Settings** (top right) and set **Notes**, **Personal Journal**, and (if used) **Trade Journal** to the folders above using **Browse**, then **Save**. Confirm the Notes page lists my files and the Journal page opens today's entry.

Icarus stores its own settings in `~/Library/Application Support/CrewDashboard/`. Nothing about my folders is written into the repo.

## Phase 4 — Automations (optional)

Ask whether I want Icarus to run any of my own AI agents or scripts. If yes:

1. Open **Coding / AI → Automations → Add automation**.
2. Enter a name, the project folder, and the command that starts my agent, for example `python3 agent.py --prompt "{input}"`. `{input}` is replaced with what I type when I press Run.
3. If my agent needs to ask me something mid-run, it should print the line `ICARUS_INPUT_REQUIRED`, flush stdout, and read one line from stdin; Icarus then shows a reply box.

Any API keys an agent needs belong to that agent's own environment, not to Icarus.

## Phase 5 — Trading pages (optional; skip if I don't trade)

Ask whether I want the trading pages. The **Accounts** and **Firm rules** pages work with no setup. **Flow** and **GEX** each need a paid data key; **Backtests** needs a separate backtest engine and can be ignored.

If I want Flow or GEX:

1. Tell me where to get each key, and wait while I sign up:
   - **Flow** — London Strategic Edge options data: https://londonstrategicedge.com/api-documentation → variable `LSE_API_KEY`
   - **GEX** — FreeFlow dealer-positioning data: https://www.free-flow.site → variable `FREEFLOW_API_KEY`
2. Store them **outside the repo**. Simplest: append to `~/.zshrc`, with me typing the values myself in my own editor, not in this chat:

   ```sh
   export LSE_API_KEY="..."
   export FREEFLOW_API_KEY="..."
   ```

   Then `source ~/.zshrc` and launch Icarus from that terminal with `uv run python app.py` so it inherits the variables. (Icarus can also read a `.env` file at `$ICARUS_TRADING_DIR/07 System/.env`, but the shell-profile route is easier.)
3. Open **Trading → Flow** and press refresh. If it reports "No LSE_API_KEY", the variable is not reaching the app: check that Icarus was launched from a terminal where `echo $LSE_API_KEY` prints a value.

## Phase 6 — Verify and hand off

1. Run the tests: `uv sync --group dev` then `uv run pytest -q`. All tests should pass; report the count.
2. Run `git status` inside the repo and confirm it is clean — no settings, keys, or personal files were written into it. If anything shows up, tell me what and why before touching it.
3. Give me a short summary: where the vault is, which folders Icarus points at, which optional features are on, and how to launch it next time (`cd` into the repo, `uv run python app.py`).

Ideas for improving Icarus go to https://github.com/Tajinnnnn/icarus/issues.
