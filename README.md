<!-- (C) -->
# Icarus

A local macOS dashboard for coding and AI work, personal notes and journals, and optional trading tools. Chrome is the default monochrome theme; Fleur, Light, and Dark are also available.

## Run

Requires macOS, Python 3.12+, and [uv](https://docs.astral.sh/uv/). This is a native macOS app, not a hosted service. Cocoa/WebKit dependencies do not support Windows or Linux.

```sh
uv sync
uv run python app.py
```

For a local browser preview:

```sh
uv run python dev_preview.py
```

Open http://127.0.0.1:8431. The preview uses the same local data as the desktop app. Saving content writes to the selected folders. It binds only to localhost; do not expose it to a network.

## Make it yours

Open **Settings** at the top right:

- Choose Chrome, Fleur, Light, or Dark. Appearance changes immediately and is remembered in that browser/app.
- Change the dashboard name, hide it, choose Icarus/Moon/Sigil/Star, or upload a PNG/JPEG/WebP logo under 1 MB. This customizes the dashboard header; the installed app icon remains the falling Icarus mark.
- Set the Notes, Personal Journal, and Trade Journal folders. Use Browse in the desktop app; paste full paths in browser preview. Save settings to apply.

Changing a folder does not move, copy, or delete files. Use existing folders. Notes support Markdown and view-only PDFs, nested folders, and loose files. Journals use `YYYY-MM-DD.md` files and separate folders for personal and trade entries. Existing sections outside the dashboard's journal fields are preserved.

No personal notes, journal entries, account data, API keys, or configured automation commands are supplied. On first launch, empty default folders are created inside the app data directory.

## Local configuration

The default app data directory is `~/Library/Application Support/CrewDashboard` (the legacy directory is retained for existing installations). Preferences and machine-specific configuration stay here, outside the repository.

| Setting | Purpose |
| --- | --- |
| `ICARUS_DATA_DIR` | Override the app data directory; useful for a fresh profile |
| `ICARUS_VAULT_ROOT` | Optional root used for default folder locations and older integrations |
| `ICARUS_TRADING_DIR` | Optional trading workflow directory |
| `ICARUS_BACKTEST_DIR` | Directory containing a compatible `visual_backtest.py` engine |
| `ICARUS_TRACKER_FILE` | Optional compatible tracker HTML override; otherwise uses the bundled manual tracker |
| `ICARUS_TRACKER_DATA` | File for tracker data |
| `ICARUS_TV_CLI` | Optional TradingView CLI entrypoint |
| `ICARUS_ENABLE_WALLS_RECORDER=1` | Opt in to the background IV Walls recorder |
| `ICARUS_DEBUG=1` | Enable native developer tools |
| `ICARUS_PREVIEW_PORT` | Browser-preview port (default 8431) |

For Finder-launched apps, optional `machine (C).json` in the app data directory accepts `vault_root` and `tv_cli`. Environment variables override it. The Settings screen writes `preferences (C).json` there. Do not commit either file.

## Agentic automations

Open **Coding / AI → Automations → Add automation**. Enter a name, an existing project folder, and the command that starts your own agent or script. Choose where its output files appear. Saving a setup does not execute it; click **Run** and provide the prompt to start it.

Examples of command shapes (install and configure your own tools first):

```text
python3 agent.py --prompt "{input}"
node agent.mjs "{input}"
uv run python agent.py --inputs "{inputs_file}"
```

`{input}` is substituted as a command argument. `{inputs_file}` points to a temporary JSON file containing `{"input": "your prompt"}`. The child also receives `ICARUS_INPUT` and `ICARUS_INPUTS_FILE` environment variables. Commands run directly, without an implicit shell: put pipelines or multiple steps in a script.

For an agent that needs a human reply, print the configured feedback marker (default `ICARUS_INPUT_REQUIRED`) on a line, flush stdout, then read a line from stdin. Icarus shows the reply control in Feedback. Logs and status update in both the native app and browser preview. Output files remain available across launches; live run status is session-based.

Use **Edit** to change a setup or turn off **Enabled** to pause it without removing it. Settings are saved only in `automations (C).json` inside your app data directory. No agent framework, provider login, or credentials are bundled. Use the agent's own local environment for secrets.

Older private crew registries are preserved on disk but are no longer loaded. Set up the commands you want to use on the Automations page.

## Optional trading integrations

Personal pages, automations, manual Accounts and Firm rules work without external trading setup. Accounts start empty. Existing account data stays in its configured file and is never replaced by the public catalog. Backtests require a separately configured engine.

- Flow uses `LSE_API_KEY`; GEX uses `FREEFLOW_API_KEY`. Set environment variables, or place them in the private workflow's `07 System/.env`. Never put credentials in source files.
- The backtest adapter expects `visual_backtest.py` exposing `list_runs`, `load_run`, and `bars_between`, plus a `--run` command. See `backtests.py` for the adapter contract.
- The account tracker uses the `fleur-tracker:load`, `fleur-tracker:state`, and `fleur-tracker:save` message protocol. These legacy protocol names remain for compatibility. See `tracker.py` and `dashboard.js`.
- TradingView chart pushing is optional and off by default. It requires a separately installed compatible CLI and its configured desktop connection.

No trading credentials or private market-data caches are bundled. Enabling a provider requests data from that provider. Optional neural read-aloud downloads model assets on first use.

## Checks and packaging

```sh
uv sync --group dev
uv run pytest -q
node --test tests/*.test.cjs
uv run python make_icon.py
uv run pyinstaller dashboard.spec --noconfirm
```

The native build appears at `dist/Icarus.app`. Local preferences and private automation commands are not build inputs. The app is not signed or notarized for public distribution; the source setup above is the tested distribution route.

## Prepare a shareable source copy

```sh
uv run python 'export_source (C).py'
```

This exports an explicit allowlist into a timestamped `share-exports/` folder and ZIP. It excludes `.git`, local machine preferences, automation commands, registries, private handoffs, vault contents, generated data, logs, caches, and app backups. It also scans exported text for common private-path and credential patterns and refuses suspicious content.

**Use the clean export to create a new public repository. Do not publish the original development Git history:** old commits can retain personal paths and author metadata even when the current files are clean. The export has no Git history. Review your Git author identity before committing the exported source.

The allowlist is intentional. Adding a new source file requires updating the export manifest. The pattern scan is an extra check, not a guarantee against every possible secret. Review the exported files before publication. Third-party assets retain their included license notices; no new license for the original application code is assigned by this export.

## Prop firm rule library

**Trading → Firm rules** contains official-source references for Lucid Trading, Funded Futures Family, Topstep, My Funded Futures, Apex Trader Funding and Alpha Futures, checked September 26, 2026. Search by firm, plan or rule. Account sizes, stages, trading restrictions, drawdown and payout conditions are grouped by program. Legacy plans and conflicting official terms are identified separately. Each rule links to its source.

Choose **Track this plan manually**, then enter the account name, stage, size and current balance. Log daily P&L and payouts yourself. Catalog-backed accounts deliberately show no automated payout-readiness estimate: a balance-only model cannot establish intraday drawdown, trade-level restrictions or firm approval. Existing custom rule sets and their estimates are preserved.

The catalog is a dated reference, not a live subscription or a replacement for the account agreement. Exact prices, country eligibility, negotiated live allocations and undisclosed individual agreements are not reproduced as universal rules. Open the official links when buying, changing stage or requesting a payout.

Public catalog: `prop-firm-rules (C).json`. Supporting research is in the three `docs/prop-rules-… (C).md` files. To refresh, verify the linked official pages, update plan-specific entries and uncertainties, update the checked date, and run the catalog and tracker tests. Do not replace local account rule sets when refreshing the reference.
