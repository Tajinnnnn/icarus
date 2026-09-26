(() => {
  "use strict";

  // ---- Escaping -------------------------------------------------------

  function escapeHtml(text) {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  // ---- Icons (ported from prototype-ui.html round 3 — locked) --------

  function flowerMark(size) {
    // (C) A silver-edged bloom: the spring identity, drawn as a cyber sigil.
    return `
      <svg class="flower-mark" width="${size}" height="${size}" viewBox="0 0 40 40" fill="none" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
        <path d="M20 1 22 13 31 7 27 17 39 20 27 23 31 33 22 27 20 39 18 27 9 33 13 23 1 20 13 17 9 7 18 13Z" stroke="currentColor" stroke-width="1.1" />
        <path d="M20 9 26 20 20 31 14 20Z M6 6Q20 24 34 6 M6 34Q20 16 34 34" stroke="currentColor" stroke-width=".75" opacity=".65" />
        <circle cx="20" cy="20" r="2" fill="currentColor" />
      </svg>`;
  }

  function libraryIcon(size) {
    return `
      <svg width="${size}" height="${size * 0.82}" viewBox="0 0 32 28" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="6" width="7" height="20" rx="1.6" fill="#cf7f97" />
        <rect x="4" y="9.5" width="3" height="1.4" rx="0.5" fill="#151217" opacity="0.5" />
        <rect x="12.5" y="2" width="7" height="24" rx="1.6" fill="#8a7aa8" />
        <rect x="14.5" y="6" width="3" height="1.4" rx="0.5" fill="#151217" opacity="0.5" />
        <rect x="23" y="8" width="7" height="18" rx="1.6" fill="#b1748f" />
        <rect x="25" y="11.5" width="3" height="1.4" rx="0.5" fill="#151217" opacity="0.5" />
      </svg>`;
  }

  function journalIcon(size) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="2.5" width="16" height="19" rx="2" fill="#b1748f" />
        <circle cx="4.4" cy="6" r="0.9" fill="#151217" />
        <circle cx="4.4" cy="10.5" r="0.9" fill="#151217" />
        <circle cx="4.4" cy="15" r="0.9" fill="#151217" />
        <rect x="8" y="7" width="9" height="1.3" rx="0.6" fill="#f5ece6" opacity="0.85" />
        <rect x="8" y="10.5" width="9" height="1.3" rx="0.6" fill="#f5ece6" opacity="0.85" />
        <rect x="8" y="14" width="6" height="1.3" rx="0.6" fill="#f5ece6" opacity="0.85" />
      </svg>`;
  }

  function flowIcon(size) {
    // Puts left, calls right, off a centre spine - the page's own layout in miniature.
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="11.3" y="2" width="1.4" height="20" rx="0.7" fill="#8a828a" />
        <rect x="13.5" y="4" width="7" height="3" rx="1" fill="#82b871" />
        <rect x="5.5" y="4" width="5" height="3" rx="1" fill="#cf7f97" />
        <rect x="13.5" y="10.5" width="9" height="3" rx="1" fill="#82b871" />
        <rect x="2" y="10.5" width="8.5" height="3" rx="1" fill="#cf7f97" />
        <rect x="13.5" y="17" width="4" height="3" rx="1" fill="#82b871" />
        <rect x="4" y="17" width="6.5" height="3" rx="1" fill="#cf7f97" />
      </svg>`;
  }

  function notesIcon(size) {
    return `
      <svg width="${size}" height="${size * 0.82}" viewBox="0 0 24 20" xmlns="http://www.w3.org/2000/svg">
        <path d="M2 4a2 2 0 0 1 2-2h5l2 2.4h9a2 2 0 0 1 2 2V16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V4Z" fill="#a88ab8" />
        <rect x="5" y="10" width="10" height="1.4" rx="0.6" fill="#151217" opacity="0.35" />
        <rect x="5" y="13" width="7" height="1.4" rx="0.6" fill="#151217" opacity="0.35" />
      </svg>`;
  }

  function runningIcon(size) {
    const c = "#cf7f97";
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="12.6" cy="4.2" r="2.1" fill="${c}" />
        <path d="M12 6.6 L8.8 11.2" stroke="${c}" stroke-width="2" stroke-linecap="round" fill="none" />
        <path d="M10.8 7.8 L14 6.8" stroke="${c}" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <path d="M10 8.6 L6.3 7.6" stroke="${c}" stroke-width="1.8" stroke-linecap="round" fill="none" />
        <path d="M8.8 11.2 L12 13.3 L11 16.8" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
        <path d="M8.8 11.2 L4.8 12.6 L3.4 16.2" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
      </svg>`;
  }

  function badgeIcon(size, bg, glyph) {
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
        <circle cx="10" cy="10" r="9" fill="${bg}" />
        <text x="10" y="14.2" font-size="12" font-weight="800" text-anchor="middle" font-family="ui-monospace, Menlo, monospace" fill="#f7efe8">${glyph}</text>
      </svg>`;
  }
  const feedbackIcon = (size) => badgeIcon(size, "#d98b4a", "?");
  const errorIcon = (size) => badgeIcon(size, "#d1453f", "!");
  const outputIcon = (size) => badgeIcon(size, "#82b871", "✓");
  // Neutral (not success/fail-coded) since "Recently Finished" mixes both -
  // the per-row dot in homeFinishedSectionHtml already carries the outcome.
  const finishedIcon = (size) => badgeIcon(size, "#605a63", "⚑");

  // ---- State -----------------------------------------------------------

  const state = {
    crews: [],
    status: {}, // crewId -> "idle" | "running" | "success" | "failed"
    awaitingInput: {}, // crewId -> bool
    awaitingPrompt: {}, // crewId -> string preview of the feedback prompt
    stopping: {}, // crewId -> bool, true between clicking Stop and runFinished arriving
    focusedAwaitingId: null, // crewId of the one expanded Awaiting Feedback row, or null
    focusedErrorId: null, // crewId of the one expanded Errors row, or null
    outputsTree: null, // {crews: [{id, name, children: [...]}]} - full run-output history, fetched at init and refreshed after a successful run
    outputsExpanded: {}, // crew id or folder path -> explicit expanded override (mirrors notesExpanded)
    selectedOutputPath: null, // path of the file currently shown in the Outputs preview pane, or null
    selectedOutputPreview: null, // {loading} | {ok, kind, content|path} | {ok:false, error} for the selected file, or null
    errors: {}, // crewId -> string | null
    liveLabel: {}, // crewId -> latest raw output line
    recentLines: {}, // crewId -> [line, ...] capped buffer, still used for the awaiting-feedback prompt preview
    runModalCrewId: null,
    currentPage: "home",
    automationDraft: null,
    automationMessage: "",
    automationBusy: false,
    settings: null,
    settingsDraft: null,
    settingsReturnPage: "home",
    settingsBusy: false,
    settingsMessage: "",
    journal: null,
    journalSource: "personal", // "personal" | "trade" - which journal the page is showing
    journalEntry: null, // the entry currently shown/edited - today's by default, or a past date
    flow: null, // null (never loaded) | {ok:true, spot, rows, totals, ...} | {ok:false, error} - options flow by strike
    flowLoading: false,
    flowShowVol: true, // volume and premium are independent - both can be on, matching the
    flowShowPrem: true, // Show both snapshot charts initially. At least one always stays on.
    flowAuto: true, // re-pull every FLOW_REFRESH_MS while the Flow page is open
    flowPush: { enabled: false, state: "off", detail: "", pushed_label: "" }, // mirror of flow_push.get_status()
    flowExport: null, // null | {busy:true} | {ok:true, strikes, copied, path} | {ok:false, error} - last Export Pine result
    walls: null, // null | {ok:true, lower, upper, iv_call, ...} | {ok:false, error} - IV Walls for the next session
    wallsStatus: null, // mirror of walls_daemon.get_status(), incl. the rolling scoreboard
    gex: null, // null (never loaded) | {ok:true, spot, sf_gex, oi_gex, eoi_gex, vanna_walls, charm_zones, ...} | {ok:false, error} - FreeFlow dealer GEX/vanna/charm
    gexLoading: false,
    gexAuto: true, // re-pull every GEX_REFRESH_MS while the Flow page is open - independent of the ladder's flowAuto
    gexSource: "oi", // Explicit basis for regime and sentiment; never silently substitute models.
    // Per-group visibility, mirroring the "GEX Walls (C)" Pine indicator's own toggles (design.md decision 8):
    // the three GEX methodologies get separate switches on purpose, not one combined "GEX" toggle.
    gexShow: { sf: true, oi: true, eoi: false, vanna: true, charm: true },
    gexPush: { enabled: false, state: "off", detail: "", pushed_label: "" }, // mirror of freeflow_push.get_status()
    gexExport: null, // null | {busy:true} | {ok:true, path, copied} | {ok:false, error} - last GEX Export Pine result
    notes: null,
    noteEditorPath: null, // path of the note currently open in the editor modal, or null
    noteEditorTitle: "",
    noteEditorContent: null,
  noteEditorDocType: "md", // "md" = editable + read-aloud; "pdf" = rendered in an iframe, view-only
  noteEditorUrl: null,     // file:// URL, pdf only
    notesSearch: "",
    notesSearchFocused: false,
    notesExpanded: {}, // node id (category name, or folder path) -> explicit expanded override
    notesContextMenu: null, // {x, y, kind: "category"|"folder"|"file", category, folderPath, filePath, fileName} | null
    notesCreateInput: null, // {parentId, kind: "note"|"folder", category, parentPath} | null - inline create row target
    notesRenameTarget: null, // {kind: "file"|"folder", path, currentName} | null - inline rename row target
    notesTreeError: null, // transient error string shown in the tree pane, or null
    mediaImagesDir: "", // absolute path to media/images/, fetched once at init - used by rich-field image chips
    homeSectionCollapsed: {}, // home section key ("awaiting"|"finished"|"outputs"|"notes") -> bool, all start expanded
    ruleCatalog: null,
    ruleView: {firm:"",query:"",program:""},
    trackerPlan: "",
    tracker: null, // mirror of tracker.get_tracker_info(): {ok, url, data, error}; data is the tracker's JSON text
    bt: { runs: null, runId: null, run: null, tradeId: null, bars: null, loading: false, running: false, error: null }, // Backtests page
  };

  const app = document.getElementById("app");

  // Attached once (not per-render, unlike everything in attachHandlers) -
  // closes the notes-tree context menu on any click outside it. Safe to
  // reference closeContextMenu here despite it being defined later in this
  // file: function declarations are hoisted within this IIFE's scope.
  document.addEventListener("click", (event) => {
    if (!state.notesContextMenu) return;
    const menuEl = document.getElementById("notes-context-menu");
    if (menuEl && !menuEl.contains(event.target)) closeContextMenu();
  });

  // Same pattern, for the read-aloud volume popup - it's plain local DOM
  // state (see wireReadAloudBar), not app state, so this closer works
  // directly off whatever's in the DOM rather than a state field.
  document.addEventListener("click", (event) => {
    document.querySelectorAll(".ra-volume-popup.open").forEach((popup) => {
      const wrapper = popup.closest(".ra-volume");
      if (wrapper && !wrapper.contains(event.target)) popup.classList.remove("open");
    });
  });

  function getCrew(crewId) {
    return state.crews.find((c) => c.id === crewId) || null;
  }

  function effectiveStatus(crewId) {
    if (state.awaitingInput[crewId]) return "awaiting";
    return state.status[crewId] || "idle";
  }

  // ---- Shared bits -------------------------------------------------------

  // The header badges double as navigation to their status page - clicking
  // one jumps straight to Running/Awaiting/Outputs/Errors instead of just
  // being a read-only count.
  function navStat(iconHtml, num, pageKey, cls) {
    const isActive = state.currentPage === pageKey;
    return `<div class="stat ${cls || ""} ${isActive ? "active" : ""}" data-status-page="${pageKey}"><div class="stat-icon">${iconHtml}</div><div class="num">${num}</div></div>`;
  }

  // Main pages (Crew Control/Journal/Notes) live as icon buttons in the
  // header instead of a full-width labeled tab row, to leave more vertical
  // room for the page content below.
  // (C) Labeled navigation: stable places, grouped by the user's activity.
  function pageNavItem(pageKey, label, badge = 0) {
    const page = PAGES[pageKey];
    const active = state.currentPage === pageKey;
    const icons = { home: brandMark, outputs: outputIcon, running: runningIcon,
      awaiting: feedbackIcon, errors: errorIcon };
    const icon = page.icon || icons[pageKey] || notesIcon;
    return `<button class="nav-item ${active ? "active" : ""}" data-page="${pageKey}" type="button" ${active ? 'aria-current="page"' : ''}>
      <span class="nav-item-icon" aria-hidden="true">${icon(17)}</span>
      <span class="nav-label">${escapeHtml(label || page.label)}</span>
      ${badge ? `<span class="nav-count">${badge}</span>` : ""}
    </button>`;
  }

  const WORKFLOWS = {
    coding: { label: "Coding / AI", pages: ["crew", "outputs", "running", "awaiting", "errors"] },
    personal: { label: "Personal", pages: ["home", "notes", "journal"] },
    trading: { label: "Trading", pages: ["tracker", "rules", "flow", "gex", "backtests"] },
  };
  const lastWorkflowPage = { coding: "crew", personal: "home", trading: "tracker" };
  function activeWorkflow() {
    if (state.currentPage === "settings") return Object.keys(WORKFLOWS).find((key) => WORKFLOWS[key].pages.includes(state.settingsReturnPage)) || "personal";
    return Object.keys(WORKFLOWS).find((key) => WORKFLOWS[key].pages.includes(state.currentPage)) || "personal";
  }
  function switchWorkflow(key) {
    if (!WORKFLOWS[key]) return;
    if (state.currentPage !== "settings") lastWorkflowPage[activeWorkflow()] = state.currentPage;
    goToPage(lastWorkflowPage[key]);
  }
  function stepPage(direction) {
    const next = window.FleurSwipe.adjacentPage(WORKFLOWS[activeWorkflow()].pages, state.currentPage, direction);
    if (next) goToPage(next);
  }
  function pageStepperHtml() {
    const pages = WORKFLOWS[activeWorkflow()].pages;
    const index = pages.indexOf(state.currentPage);
    return `<div class="page-stepper"><span>Swipe between pages</span>
      <button type="button" data-page-step="-1" aria-label="Previous page" ${index === 0 ? "disabled" : ""}>‹</button>
      <small>${index + 1} / ${pages.length}</small>
      <button type="button" data-page-step="1" aria-label="Next page" ${index === pages.length - 1 ? "disabled" : ""}>›</button></div>`;
  }

  function workflowTile(label, value, page, tone = "") {
    return `<button type="button" class="workflow-tile ${tone} ${state.currentPage === page ? "selected" : ""}" data-status-page="${page}">
      <span class="tile-label">${escapeHtml(label)}</span><span class="tile-value">${escapeHtml(value)}</span><span class="tile-open" aria-hidden="true">↗</span></button>`;
  }
  function workflowTiles(key, c) {
    if (key === "coding") return [
      workflowTile("Running", c.running, "running"),
      workflowTile("Needs feedback", c.awaiting, "awaiting", c.awaiting ? "attention" : ""),
      workflowTile("Completed this session", c.success, "outputs"),
      workflowTile("Errors", c.failed, "errors", c.failed ? "error" : ""),
    ].join("");
    if (key === "personal") {
      const notes = recentNotes(Number.MAX_SAFE_INTEGER);
      const today = state.journal?.today;
      const hasEntry = today && Object.values(today.sections || {}).some((v) => String(v).trim());
      return [workflowTile("Notes", notes.length, "notes"),
        workflowTile("Categories", state.notes?.categories?.length || 0, "notes"),
        workflowTile(state.journalSource === "trade" ? "Trade journal today" : "Journal today", hasEntry ? "Written" : "Blank", "journal"),
        workflowTile("Recent entries", state.journal?.recent?.length || 0, "journal")].join("");
    }
    // These are explicit data-availability states, never inferred live P&L.
    return [workflowTile("Account tracker", state.tracker?.ok ? "Ready" : "Unavailable", "tracker"),
      workflowTile("Options flow", state.flowLoading ? "Loading" : state.flow?.ok ? "Loaded" : state.flow ? "Unavailable" : "Not loaded", "flow"),
      workflowTile("GEX walls", state.gexLoading ? "Loading" : state.gex?.ok ? "Loaded" : state.gex ? "Unavailable" : "Not loaded", "gex"),
      workflowTile("Backtest runs", state.bt.runs ? state.bt.runs.length : "Not loaded", "backtests")].join("");
  }

  function pageHeaderHtml(iconHtml, title, subtitle) {
    return `<div class="page-header">${iconHtml}<div><h2>${title}</h2><div class="sub">${subtitle}</div></div></div>`;
  }

  function fieldHtml(field) {
    const isLong = (field.default || "").length > 60 || field.name === "input" || field.name === "user_idea" || field.name === "blog_topic";
    const escapedDefault = escapeHtml(field.default || "");
    const control = isLong
      ? `<textarea id="field-${field.name}" name="${field.name}" rows="3">${escapedDefault}</textarea>`
      : `<input type="text" id="field-${field.name}" name="${field.name}" value="${escapedDefault}">`;
    return `<div class="field"><label for="field-${field.name}">${escapeHtml(field.label)}</label>${control}</div>`;
  }

  function stopButtonHtml(crewId, inline = false) {
    const isStopping = !!state.stopping[crewId];
    const button = `<button type="button" class="btn stop-btn" data-stop-crew-id="${crewId}" ${
      isStopping ? "disabled" : ""
    }>${isStopping ? "Stopping…" : "Stop"}</button>`;
    return inline ? button : `<div class="card-actions">${button}</div>`;
  }

  // ---- Library page (home) --------------------------------------------

  function libraryPageHtml() {
    const draft = state.automationDraft;
    if (draft) return `<div class="page automation-setup">
      ${pageHeaderHtml(libraryIcon(28), draft.id ? "Edit automation" : "New automation", "Connect an agent, a script, or a workflow you already use.")}
      <form id="automation-form"><fieldset ${state.automationBusy ? "disabled" : ""}>
      <div class="automation-form-grid">
      <label>Name<input data-auto-field="name" required maxlength="80" value="${escapeHtml(draft.name)}" placeholder="Research assistant" /></label>
      <label>Description<input data-auto-field="description" maxlength="500" value="${escapeHtml(draft.description)}" placeholder="What does it help you do?" /></label>
      <label class="full">Project folder<div class="folder-setting"><div><input data-auto-field="project_dir" required value="${escapeHtml(draft.project_dir)}" placeholder="~/Projects/my-agent" /><button type="button" class="btn" id="automation-browse">Browse</button></div></div></label>
      <label class="full">Run command<textarea data-auto-field="command" required rows="3" spellcheck="false" placeholder='python3 agent.py --prompt "{input}"'>${escapeHtml(draft.command)}</textarea><small>Use {input} for the prompt or {inputs_file} for a JSON file of inputs. Runs inside your project folder.</small></label>
      <label>Output folder<input data-auto-field="output_dir" value="${escapeHtml(draft.output_dir)}" placeholder="output" /><small>Relative to the project, or a full path.</small></label>
      <label>Prompt label<input data-auto-field="input_label" value="${escapeHtml(draft.input_label)}" placeholder="Leave blank if no input is needed" /></label>
      <label class="full">Feedback marker<input data-auto-field="feedback_marker" value="${escapeHtml(draft.feedback_marker)}" /><small>When your agent prints this on its own line, Icarus opens a reply box. Leave blank for jobs that don’t need feedback.</small></label>
      <label class="setting-check full"><input type="checkbox" id="automation-enabled" ${draft.enabled ? "checked" : ""}/>Enabled</label>
      </div><div class="settings-footer"><p role="status">${escapeHtml(state.automationMessage || "Saved only on this Mac. Saving does not run the command.")}</p><div class="automation-actions"><button type="button" class="btn" id="automation-cancel">Cancel</button><button type="submit" class="primary">${state.automationBusy ? "Saving…" : "Save automation"}</button></div></div>
      </fieldset></form></div>`;
    const cards = state.crews.map(c => `<article class="card lib-card automation-card">
      <div class="lib-card-head"><span class="dot ${c.valid ? effectiveStatus(c.id) : "idle"}"></span><span class="lib-card-title">${escapeHtml(c.name)}</span></div>
      <p class="lib-card-desc">${escapeHtml(c.description || "Your custom workflow")}</p>
      <code class="automation-command">${escapeHtml(c.command)}</code>
      ${!c.valid ? `<p class="lib-card-invalid">${escapeHtml(c.invalid_reason)}</p>` : ""}
      <div class="automation-actions"><button type="button" class="btn" data-edit-automation="${c.id}">Edit</button><button type="button" class="primary" data-customize-crew-id="${c.id}" ${!c.valid || ["running","awaiting"].includes(effectiveStatus(c.id)) ? "disabled" : ""}>Run</button></div>
    </article>`).join("");
    return `<div class="page automations-page"><div class="automation-heading">${pageHeaderHtml(libraryIcon(28), "Automations", "Your agents and workflows, in one place.")}<button class="primary" type="button" id="new-automation">＋ Add automation</button></div>
      ${cards ? `<div class="library-grid">${cards}</div>` : `<section class="automation-empty"><span class="automation-empty-mark">${brandMark(80)}</span><h3>Build a little room for your agents.</h3><p>Connect a local agent or script. Give it a prompt, follow its progress, and keep the results together.</p><div class="automation-examples"><span>Research & writing</span><span>Coding & reviews</span><span>Personal workflows</span></div><button type="button" class="btn" id="first-automation">Set up your first automation</button><small>Works with your own Python, Node, and command-line tools.</small></section>`}</div>`;
  }

  function attachAutomationHandlers() {
    const begin = entry => { state.automationDraft = entry ? {...entry} : { name:"",description:"",project_dir:"",command:"",output_dir:"output",input_label:"Prompt",feedback_marker:"ICARUS_INPUT_REQUIRED",enabled:true }; state.automationMessage = ""; render(); };
    for (const id of ["new-automation","first-automation"]) document.getElementById(id)?.addEventListener("click", () => begin(null));
    app.querySelectorAll("[data-edit-automation]").forEach(button => button.addEventListener("click", () => begin(getCrew(button.dataset.editAutomation))));
    const form = document.getElementById("automation-form"); if (!form) return;
    form.querySelectorAll("[data-auto-field]").forEach(input => input.addEventListener("input", () => { state.automationDraft[input.dataset.autoField] = input.value; }));
    document.getElementById("automation-enabled").addEventListener("change", event => { state.automationDraft.enabled = event.target.checked; });
    document.getElementById("automation-cancel").addEventListener("click", () => { state.automationDraft = null; render(); });
    document.getElementById("automation-browse").addEventListener("click", async () => {
      try { const result = await window.pywebview.api.choose_folder(state.automationDraft.project_dir); if (!result.ok) state.automationMessage = result.error; else if (result.path) state.automationDraft.project_dir = result.path; }
      catch (error) { state.automationMessage = error.message; } render();
    });
    form.addEventListener("submit", async event => {
      event.preventDefault(); if (state.automationBusy) return;
      state.automationBusy = true; render();
      try {
        const result = await window.pywebview.api.save_automation(state.automationDraft);
        if (!result.ok) throw new Error(result.error);
        state.crews = await window.pywebview.api.list_automations();
        state.outputsTree = await window.pywebview.api.get_outputs_tree();
        state.automationDraft = null;
      } catch (error) { state.automationMessage = error.message; }
      finally { state.automationBusy = false; render(); }
    });
  }

  // ---- Running page ----------------------------------------------------

  function runningPageHtml() {
    const running = state.crews.filter((c) => c.valid && effectiveStatus(c.id) === "running");
    const body = running.length
      ? running
          .map((c) => {
            const label = state.liveLabel[c.id] || "Starting…";
            return `
        <div class="card acc-running run-row" data-crew-id="${c.id}">
          <span class="dot running"></span>
          <span class="run-row-name">${escapeHtml(c.name)}</span>
          <span class="run-row-status">${escapeHtml(label)}</span>
          ${stopButtonHtml(c.id, true)}
        </div>`;
          })
          .join("")
      : `<p class="pane-empty">No automations running.</p>`;

    return `
      <div class="page">
        ${pageHeaderHtml(runningIcon(30), "Running", `${running.length} crew${running.length === 1 ? "" : "s"} in progress`)}
        <div class="status-list">${body}</div>
      </div>`;
  }

  // ---- Awaiting Feedback page --------------------------------------------

  function awaitingCrews() {
    return state.crews.filter((c) => c.valid && effectiveStatus(c.id) === "awaiting");
  }

  function awaitingPageHtml() {
    const awaiting = awaitingCrews();
    const body = awaiting.length
      ? awaiting
          .map((c) => {
            const prompt = state.awaitingPrompt[c.id] || "Waiting for your feedback…";
            const isFocused = state.focusedAwaitingId === c.id;
            const previewLine = (prompt.split("\n").find((line) => line.trim()) || prompt).trim();
            const row = `
          <div class="wait-row" data-focus-awaiting="${c.id}">
            <span class="dot awaiting"></span>
            <span class="wait-row-name">${escapeHtml(c.name)}</span>
            ${isFocused ? "" : `<span class="wait-row-preview">${escapeHtml(previewLine)}</span>`}
            ${stopButtonHtml(c.id, true)}
          </div>`;
            if (!isFocused) {
              return `<div class="card acc-awaiting wait-card" data-crew-id="${c.id}">${row}</div>`;
            }
            return `
        <div class="card acc-awaiting wait-card expanded" data-crew-id="${c.id}">
          ${row}
          <div class="prompt">${escapeHtml(prompt)}</div>
          <form class="feedback-form" data-crew-id="${c.id}">
            <textarea rows="3" placeholder="Leave blank to accept as-is"></textarea>
            <div class="modal-actions"><button type="submit" class="primary">Send</button></div>
          </form>
        </div>`;
          })
          .join("")
      : `<p class="pane-empty">Nothing waiting.</p>`;

    return `
      <div class="page">
        ${pageHeaderHtml(feedbackIcon(30), "Awaiting Feedback", `${awaiting.length} automation${awaiting.length === 1 ? "" : "s"} waiting on you`)}
        <div class="status-list">${body}</div>
      </div>`;
  }

  // ---- Outputs page: crew -> run folder -> file tree + preview pane -----

  function isOutputNodeExpanded(id, isCrew) {
    if (Object.prototype.hasOwnProperty.call(state.outputsExpanded, id)) return state.outputsExpanded[id];
    return isCrew; // crews start expanded, run folders start collapsed - mirrors Notes categories/folders
  }

  function toggleOutputNode(id, isCrew) {
    state.outputsExpanded[id] = !isOutputNodeExpanded(id, isCrew);
    render();
  }

  function outputsTreeFileRowHtml(node, depth) {
    const isActive = node.path === state.selectedOutputPath;
    const indent = `padding-left:${depth * 16 + 8}px`;
    return `
      <div class="notes-tree-row notes-tree-file${isActive ? " active" : ""}" style="${indent}" data-output-file="${escapeHtml(node.path)}">
        <span class="notes-tree-label">${escapeHtml(node.name)}</span>
      </div>`;
  }

  function outputsTreeFolderRowHtml(node, depth) {
    const expanded = isOutputNodeExpanded(node.path, false);
    const indent = `padding-left:${depth * 16 + 8}px`;
    const childrenHtml = node.children.map((child) => outputsTreeNodeHtml(child, depth + 1)).join("");
    return `
      <div class="notes-tree-folder">
        <div class="notes-tree-row notes-tree-folder-row" style="${indent}" data-output-toggle="${escapeHtml(node.path)}">
          <span class="notes-tree-caret">${expanded ? "▾" : "▸"}</span><span class="notes-tree-label">${escapeHtml(node.name)}</span>
        </div>
        ${expanded ? `<div class="notes-tree-children">${childrenHtml}</div>` : ""}
      </div>`;
  }

  function outputsTreeNodeHtml(node, depth) {
    return node.type === "file" ? outputsTreeFileRowHtml(node, depth) : outputsTreeFolderRowHtml(node, depth);
  }

  function outputsTreeCrewHtml(crew) {
    const expanded = isOutputNodeExpanded(crew.id, true);
    const childrenHtml = crew.children.map((child) => outputsTreeNodeHtml(child, 1)).join("");
    return `
      <div class="notes-tree-category">
        <div class="notes-tree-row notes-tree-category-row" data-output-toggle="${escapeHtml(crew.id)}" data-output-toggle-crew="true">
          <span class="notes-tree-caret">${expanded ? "▾" : "▸"}</span><span class="notes-tree-label">${escapeHtml(crew.name)}</span>
        </div>
        ${expanded ? `<div class="notes-tree-children">${childrenHtml || `<p class="pane-empty output-tree-empty">No output yet.</p>`}</div>` : ""}
      </div>`;
  }

  function prettyJson(text) {
    try {
      return JSON.stringify(JSON.parse(text), null, 2);
    } catch (e) {
      return text; // malformed JSON - fall back to raw text rather than failing to render
    }
  }

  // Allowlist HTML sanitizer for rendered-markdown output. Report content
  // originates from crew web research, not from the user, so a scraped page's
  // injected <script>/event-handler/javascript: payload could otherwise ride
  // straight through marked's HTML passthrough into this window, which has
  // window.pywebview.api access (file read/write, subprocess launch). Runs
  // on marked's *output*, not by restricting marked's input, since that's
  // the actual point where untrusted content becomes live DOM.
  const SANITIZE_ALLOWED_TAGS = new Set([
    "P", "BR", "STRONG", "EM", "B", "I", "U", "S", "DEL", "CODE", "PRE", "BLOCKQUOTE",
    "H1", "H2", "H3", "H4", "H5", "H6", "UL", "OL", "LI", "A", "IMG", "HR",
    "TABLE", "THEAD", "TBODY", "TFOOT", "TR", "TH", "TD", "SPAN", "DIV",
  ]);
  const SANITIZE_ALLOWED_ATTRS = { A: ["href", "title"], IMG: ["src", "alt", "title"] };

  function sanitizeHtml(html) {
    const template = document.createElement("template");
    template.innerHTML = html;
    _sanitizeNode(template.content);
    return template.innerHTML;
  }

  function _sanitizeNode(root) {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT);
    const toStrip = [];
    let node = walker.nextNode();
    while (node) {
      if (!SANITIZE_ALLOWED_TAGS.has(node.tagName)) {
        toStrip.push(node);
      } else {
        const allowedAttrs = SANITIZE_ALLOWED_ATTRS[node.tagName] || [];
        Array.from(node.attributes).forEach((attr) => {
          const name = attr.name.toLowerCase();
          const value = attr.value.trim();
          const isDangerousValue = /^\s*javascript:/i.test(value);
          if (!allowedAttrs.includes(name) || isDangerousValue) node.removeAttribute(attr.name);
        });
      }
      node = walker.nextNode();
    }
    // Disallowed elements are unwrapped (children promoted), not just deleted -
    // a <script> or <style> is removed complete with its text (safe either way,
    // since text nodes never execute), but any other disallowed wrapper keeps
    // its visible text content in place instead of silently disappearing.
    toStrip.forEach((el) => {
      const parent = el.parentNode;
      if (!parent) return;
      if (el.tagName === "SCRIPT" || el.tagName === "STYLE") {
        el.remove();
        return;
      }
      while (el.firstChild) parent.insertBefore(el.firstChild, el);
      parent.removeChild(el);
    });
  }

  // Shared read-aloud control bar (see vendor/read-aloud.js) - used by both
  // the Outputs preview pane and the Notes editor pane header. `prefix`
  // scopes the bar's data attribute so attachHandlers() knows which target
  // container to read from without the two panes colliding (only one is
  // ever on screen at a time, since they're different pages).
  function readAloudControlsHtml(prefix) {
    return `
      <span class="read-aloud-bar" data-read-aloud="${prefix}">
        <button type="button" class="btn ra-btn" data-ra-action="rewind" disabled title="Back to previous paragraph">⏮ Back</button>
        <button type="button" class="btn ra-btn" data-ra-action="toggle">▶ Read aloud</button>
        <button type="button" class="btn ra-btn" data-ra-action="forward" disabled title="Forward to next paragraph">⏭ Forward</button>
        <button type="button" class="btn ra-btn" data-ra-action="stop" disabled>■ Stop</button>
        <span class="ra-rate-label">Rate
          <span class="ra-rate-stepper">
            <button type="button" class="btn ra-rate-btn" data-ra-rate-step="-1" aria-label="Slower">−</button>
            <span class="ra-rate-value">1.0×</span>
            <button type="button" class="btn ra-rate-btn" data-ra-rate-step="1" aria-label="Faster">+</button>
          </span>
        </span>
        <span class="ra-volume">
          <button type="button" class="btn ra-btn ra-volume-btn" data-ra-action="volume-toggle" aria-label="Volume">🔊</button>
          <span class="ra-volume-popup">
            <input type="range" class="ra-volume-slider" min="0" max="1" step="0.05" value="1" orient="vertical" aria-label="Volume level">
          </span>
        </span>
        <select class="ra-engine">
          <option value="system">System Voice</option>
          <option value="natural">Natural Voice</option>
        </select>
        <span class="ra-status"></span>
      </span>`;
  }

  // Wires one read-aloud control bar's buttons/rate/engine-select to the
  // shared ReadAloud singleton and keeps it in sync via subscription.
  // `getContainer` returns the live DOM element to read from, resolved at
  // click time (not captured up front) since the pane's content can change
  // out from under it (a different file/note selected) before Play is hit.
  const RA_RATE_MIN = 0.5;
  const RA_RATE_MAX = 2;
  const RA_RATE_STEP = 0.1;

  let readAloudUnsubscribe = null;
  function wireReadAloudBar(bar, getContainer) {
    const rewindBtn = bar.querySelector('[data-ra-action="rewind"]');
    const toggleBtn = bar.querySelector('[data-ra-action="toggle"]');
    const forwardBtn = bar.querySelector('[data-ra-action="forward"]');
    const stopBtn = bar.querySelector('[data-ra-action="stop"]');
    const rateValueEl = bar.querySelector(".ra-rate-value");
    const rateDownBtn = bar.querySelector('[data-ra-rate-step="-1"]');
    const rateUpBtn = bar.querySelector('[data-ra-rate-step="1"]');
    const volumeBtn = bar.querySelector(".ra-volume-btn");
    const volumePopup = bar.querySelector(".ra-volume-popup");
    const volumeSlider = bar.querySelector(".ra-volume-slider");
    const engineSelect = bar.querySelector(".ra-engine");
    const statusEl = bar.querySelector(".ra-status");

    function refresh(state) {
      const s = state || window.ReadAloud.getState();
      engineSelect.value = s.engineChoice;
      rateValueEl.textContent = `${s.rate.toFixed(1)}×`;
      rateDownBtn.disabled = s.rate <= RA_RATE_MIN;
      rateUpBtn.disabled = s.rate >= RA_RATE_MAX;
      volumeSlider.value = s.volume;
      volumeBtn.textContent = s.volume === 0 ? "🔇" : s.volume < 0.5 ? "🔉" : "🔊";
      stopBtn.disabled = !s.active;
      rewindBtn.disabled = !s.active;
      forwardBtn.disabled = !s.active;
      toggleBtn.textContent = s.active && !s.paused ? "⏸ Pause" : s.active && s.paused ? "▶ Resume" : "▶ Read aloud";
      let status = "";
      if (s.engineChoice === "natural") {
        if (s.natural.status === "loading") {
          status = `Downloading voice model…${s.natural.progress != null ? " " + s.natural.progress + "%" : ""}`;
        } else if (s.natural.status === "error") {
          status = `Natural Voice unavailable: ${s.natural.error}`;
        }
      }
      statusEl.textContent = status;
    }

    function stepRate(direction) {
      const current = window.ReadAloud.getState().rate;
      // Round to one decimal to dodge float drift (e.g. 0.1 + 0.2 = 0.30000000000000004).
      const next = Math.round((current + direction * RA_RATE_STEP) * 10) / 10;
      window.ReadAloud.setRate(Math.min(RA_RATE_MAX, Math.max(RA_RATE_MIN, next)));
    }

    toggleBtn.addEventListener("click", async () => {
      const s = window.ReadAloud.getState();
      if (!s.active) {
        const container = getContainer();
        if (container) await window.ReadAloud.start(container);
      } else {
        window.ReadAloud.togglePause();
      }
    });
    stopBtn.addEventListener("click", () => window.ReadAloud.stop());
    rewindBtn.addEventListener("click", () => window.ReadAloud.rewind());
    forwardBtn.addEventListener("click", () => window.ReadAloud.fastForward());
    rateDownBtn.addEventListener("click", () => stepRate(-1));
    rateUpBtn.addEventListener("click", () => stepRate(1));
    // Popup open/close is pure local DOM state (a CSS class), not app
    // state - toggling it must never trigger a full render(), which would
    // tear down and rebuild the pane's content mid-read (see the top-level
    // outside-click closer below for the matching cleanup half of this).
    volumeBtn.addEventListener("click", (event) => {
      event.stopPropagation();
      volumePopup.classList.toggle("open");
    });
    volumeSlider.addEventListener("input", () => window.ReadAloud.setVolume(parseFloat(volumeSlider.value)));
    engineSelect.addEventListener("change", () => window.ReadAloud.setEngineChoice(engineSelect.value));

    readAloudUnsubscribe = window.ReadAloud.subscribe(refresh);
    refresh();
  }

  function outputsPreviewPaneHtml() {
    if (!state.selectedOutputPath) {
      return `<div class="notes-editor-empty"><p class="pane-empty">Select a file to preview.</p></div>`;
    }

    const preview = state.selectedOutputPreview;
    const fileName = state.selectedOutputPath.split("/").pop();
    const canReadAloud = preview && preview.ok && (preview.kind === "markdown" || preview.kind === "text");
    const actionsHtml = `
      <div class="output-preview-actions">
        <button type="button" class="btn" data-open-file="${escapeHtml(state.selectedOutputPath)}">Open</button>
        <button type="button" class="btn reveal-btn" data-reveal-file="${escapeHtml(state.selectedOutputPath)}">Show in Finder</button>
        ${canReadAloud ? readAloudControlsHtml("output") : ""}
      </div>`;

    let bodyHtml;
    if (!preview || preview.loading) {
      bodyHtml = `<p class="pane-empty">Loading…</p>`;
    } else if (!preview.ok) {
      bodyHtml = `<p class="pane-empty">Couldn't load this file: ${escapeHtml(preview.error || "unknown error")}</p>`;
    } else if (preview.kind === "markdown") {
      bodyHtml = `<div class="output-preview-markdown">${sanitizeHtml(marked.parse(preview.content))}</div>`;
    } else if (preview.kind === "text") {
      // Plain escaped text, not parsed as Markdown - a .txt file isn't
      // Markdown source, and running it through marked() would mangle any
      // line that happens to look like Markdown syntax (e.g. "# " or "- ").
      bodyHtml = `<pre class="output-preview-pre output-preview-text">${escapeHtml(preview.content)}</pre>`;
    } else if (preview.kind === "html") {
      bodyHtml = `<iframe class="output-preview-frame" sandbox="" srcdoc="${escapeHtml(preview.content)}"></iframe>`;
    } else if (preview.kind === "json") {
      bodyHtml = `<pre class="output-preview-pre">${escapeHtml(prettyJson(preview.content))}</pre>`;
    } else if (preview.kind === "image") {
      bodyHtml = `<div class="output-preview-image"><img src="file://${encodeURI(preview.path)}" alt="${escapeHtml(fileName)}"></div>`;
    } else {
      bodyHtml = `<p class="pane-empty">No preview available for this file type.</p>`;
    }

    return `
      <div class="output-preview-head">
        <h3>${escapeHtml(fileName)}</h3>
        ${actionsHtml}
      </div>
      <div class="output-preview-body">${bodyHtml}</div>`;
  }

  function outputsPageHtml() {
    const tree = state.outputsTree;
    const crewsHtml = tree ? tree.crews.map(outputsTreeCrewHtml).join("") : "";

    return `
      <div class="page outputs-page">
        ${pageHeaderHtml(outputIcon(30), "Outputs", "browse your automation outputs")}
        <div class="notes-split">
          <div class="notes-tree-pane">
            <div class="notes-tree">${tree ? crewsHtml || `<p class="pane-empty">No automations yet.</p>` : `<p class="pane-empty">Loading…</p>`}</div>
          </div>
          <div class="output-preview-pane">${outputsPreviewPaneHtml()}</div>
        </div>
      </div>`;
  }

  async function refreshOutputsTree() {
    state.outputsTree = await window.pywebview.api.get_outputs_tree();
    render();
  }

  async function selectOutputFile(path) {
    window.ReadAloud.stop(); // a different file's preview is about to replace the read-aloud target
    state.selectedOutputPath = path;
    state.selectedOutputPreview = { loading: true };
    render();
    const result = await window.pywebview.api.get_output_file_preview(path);
    if (state.selectedOutputPath !== path) return; // a different file was selected while this was in flight
    state.selectedOutputPreview = result;
    render();
  }

  // ---- Errors page --------------------------------------------------------

  function errorsPageHtml() {
    const failed = state.crews.filter((c) => c.valid && effectiveStatus(c.id) === "failed");
    const body = failed.length
      ? failed
          .map((c) => {
            const errorText = state.errors[c.id] || "Run failed";
            const isFocused = state.focusedErrorId === c.id;
            const previewLine = (errorText.split("\n").find((line) => line.trim()) || errorText).trim();
            const row = `
          <div class="error-row" data-focus-error="${c.id}">
            <span class="dot failed"></span>
            <span class="error-row-name">${escapeHtml(c.name)}</span>
            ${isFocused ? "" : `<span class="error-row-preview">${escapeHtml(previewLine)}</span>`}
          </div>`;
            if (!isFocused) {
              return `<div class="card acc-failed error-card" data-crew-id="${c.id}">${row}</div>`;
            }
            return `
        <div class="card acc-failed error-card expanded" data-crew-id="${c.id}">
          ${row}
          <div class="error-full">${escapeHtml(errorText)}</div>
        </div>`;
          })
          .join("")
      : `<p class="pane-empty">No errors.</p>`;

    return `
      <div class="page">
        ${pageHeaderHtml(errorIcon(30), "Errors", `${failed.length} failed run${failed.length === 1 ? "" : "s"}`)}
        <div class="status-list">${body}</div>
      </div>`;
  }

  // ---- Home page: triage view - what needs input, what just finished,
  // what output landed recently. Reads only state the app already fetches
  // (no new pywebview.api calls) and every row links through to the real
  // detail page rather than duplicating its actions inline. ------------

  function finishedCrews() {
    return state.crews.filter((c) => c.valid && ["success", "failed"].includes(effectiveStatus(c.id)));
  }

  function recentOutputFiles(limit = 6) {
    const tree = state.outputsTree;
    if (!tree) return [];
    const files = [];
    const walk = (nodes, crewName) => {
      nodes.forEach((node) => {
        if (node.type === "file") files.push({ ...node, crewName });
        else walk(node.children, crewName);
      });
    };
    tree.crews.forEach((crew) => walk(crew.children, crew.name));
    return files.sort((a, b) => b.mtime - a.mtime).slice(0, limit);
  }

  function homeRowHtml(dotClass, name, preview, attrs) {
    return `
      <div class="card home-card" ${attrs}>
        <div class="home-row">
          ${dotClass ? `<span class="dot ${dotClass}"></span>` : ""}
          <span class="home-row-name">${escapeHtml(name)}</span>
          <span class="home-row-preview">${escapeHtml(preview)}</span>
        </div>
      </div>`;
  }

  // Collapsed is an explicit per-section override, same convention as
  // isOutputNodeExpanded/isNodeExpanded - undefined means "not collapsed".
  function isHomeSectionCollapsed(key) {
    return !!state.homeSectionCollapsed[key];
  }

  function toggleHomeSection(key) {
    state.homeSectionCollapsed[key] = !isHomeSectionCollapsed(key);
    render();
  }

  // `bodyHtml` is whatever the caller already wrapped (a `.status-list` of
  // rows, or a `.home-card-grid` of cards) - this only owns the title and
  // the section shell, not the layout inside it. `emptyText`, when given,
  // keeps the title visible with a placeholder line instead of collapsing
  // the whole section away when there's no body content. `iconHtml`, when
  // given, sits inline before the title so the sidebar's sections are
  // tellable apart at a glance rather than by label text alone. `key`
  // identifies the section for the collapse/expand toggle - the whole
  // title row is the click target (data-home-section-toggle lives on the
  // row, not the caret), and the caret itself is decorative, shown on
  // hover only, so it never needs its own click handler.
  function homeSectionHtml(title, bodyHtml, emptyText, iconHtml, key) {
    if (!bodyHtml && !emptyText) return "";
    const collapsed = isHomeSectionCollapsed(key);
    return `
      <div class="home-section">
        <div class="label home-section-title" data-home-section-toggle="${key}" title="${collapsed ? "Expand" : "Collapse"} ${escapeHtml(title)}">
          ${iconHtml ? `<span class="home-section-icon">${iconHtml}</span>` : ""}
          <span class="home-section-title-text">${escapeHtml(title)}</span>
          <span class="home-section-toggle">${collapsed ? "▸" : "▾"}</span>
        </div>
        ${collapsed ? "" : bodyHtml || `<p class="pane-empty">${escapeHtml(emptyText)}</p>`}
      </div>`;
  }

  function homeAwaitingSectionHtml() {
    const rows = awaitingCrews()
      .map((c) => {
        const prompt = state.awaitingPrompt[c.id] || "Waiting for your feedback…";
        const previewLine = (prompt.split("\n").find((line) => line.trim()) || prompt).trim();
        return homeRowHtml("awaiting", c.name, previewLine, `data-status-page="awaiting"`);
      })
      .join("");
    return homeSectionHtml(
      "Awaiting Feedback",
      rows ? `<div class="status-list">${rows}</div>` : "",
      "Nothing waiting on you.",
      feedbackIcon(16),
      "awaiting"
    );
  }

  function homeFinishedSectionHtml() {
    const rows = finishedCrews()
      .map((c) => {
        const status = effectiveStatus(c.id);
        const targetPage = status === "success" ? "outputs" : "errors";
        const label = status === "success" ? "Succeeded" : "Failed";
        return homeRowHtml(status, c.name, label, `data-status-page="${targetPage}"`);
      })
      .join("");
    return homeSectionHtml(
      "Recently Finished",
      rows ? `<div class="status-list">${rows}</div>` : "",
      "Nothing finished recently.",
      finishedIcon(16),
      "finished"
    );
  }

  // Sidebar section like Awaiting/Finished, at the bottom of the sidebar -
  // stays a row list rather than becoming cards; only Recent Notes was
  // asked to become cards.
  function homeOutputsSectionHtml() {
    const rows = recentOutputFiles(6)
      .map((f) => homeRowHtml(null, f.name, f.crewName, `data-home-output-file="${escapeHtml(f.path)}"`))
      .join("");
    return homeSectionHtml(
      "Recent Outputs",
      rows ? `<div class="status-list">${rows}</div>` : "",
      undefined,
      outputIcon(16),
      "outputs"
    );
  }

  function recentNotes(limit = 6) {
    const notes = state.notes;
    if (!notes) return [];
    const files = [];
    const walk = (nodes, categoryName) => {
      nodes.forEach((node) => {
        if (node.type === "file") files.push({ ...node, categoryName });
        else walk(node.children, categoryName);
      });
    };
    notes.categories.forEach((cat) => walk(cat.children, cat.label || cat.name));
    return files.sort((a, b) => b.updated.localeCompare(a.updated)).slice(0, limit);
  }

  // Reuses the Crew Library's .lib-card look (title + one-line desc,
  // hover border) rather than the notepad-row style the other sections
  // use - Recent Notes and Today's Journal are cards, not a list.
  function homeCardHtml(title, desc, attrs) {
    return `
      <div class="card lib-card" ${attrs}>
        <div class="lib-card-title">${escapeHtml(title)}</div>
        <div class="lib-card-desc">${escapeHtml(desc)}</div>
      </div>`;
  }

  function homeNotesSectionHtml() {
    const cards = recentNotes(6)
      .map((n) =>
        homeCardHtml(
          n.title,
          n.categoryName,
          `data-home-note-file="${escapeHtml(n.path)}" data-home-note-title="${escapeHtml(n.title)}"`
        )
      )
      .join("");
    return homeSectionHtml(
      "Recent Notes",
      cards ? `<div class="home-card-grid">${cards}</div>` : "",
      undefined,
      notesIcon(16),
      "notes"
    );
  }

  // Plain navigation shortcuts, not deep-linked into any create/run flow -
  // shown unconditionally, above the gated sections and empty-state alike.
  function homeQuickActionsHtml() {
    return `
      <div class="home-quick-actions">
        <button type="button" class="btn primary" data-home-action="crew">Run an automation</button>
        <button type="button" class="btn" data-home-action="notes">Create new note</button>
        <button type="button" class="btn" data-home-action="journal">Log today</button>
      </div>`;
  }

  function homePageHtml() {
    const recent = recentNotes(3);
    const outputs = recentOutputFiles(3);
    const c = counts();
    const notesHtml = recent.map((n) => `<button type="button" class="resume-row"
      data-home-note-file="${escapeHtml(n.path)}" data-home-note-title="${escapeHtml(n.title)}">
      <span class="resume-icon" aria-hidden="true">${notesIcon(21)}</span>
      <span class="resume-copy"><strong>${escapeHtml(n.title)}</strong><small>${escapeHtml(n.categoryName)}</small></span>
      <span class="resume-arrow" aria-hidden="true">↗</span></button>`).join("");
    const outputHtml = outputs.map((f) => `<button type="button" class="recent-output-row" data-home-output-file="${escapeHtml(f.path)}">
      <span>${escapeHtml(f.name)}</span><small>${escapeHtml(f.crewName)}</small><span aria-hidden="true">↗</span></button>`).join("");
    return `<div class="page home-page calm-home">
      <header class="home-welcome"><span class="home-eyebrow">YOUR WORKSPACE</span>
        <h1>A little room to focus.</h1><p>Pick up where you left off, or start something new.</p></header>
      ${(c.awaiting || c.failed) ? `<div class="attention-strip" aria-label="Needs attention">
        ${c.awaiting ? `<button type="button" data-status-page="awaiting">${c.awaiting} crew${c.awaiting === 1 ? " needs" : "s need"} your feedback <span>→</span></button>` : ""}
        ${c.failed ? `<button type="button" data-status-page="errors">${c.failed} automation error${c.failed === 1 ? "" : "s"} to review <span>→</span></button>` : ""}
      </div>` : ""}
      <section class="resume-section"><div class="section-heading"><h2>Continue where you left off</h2><button type="button" class="text-action" data-home-action="notes">All notes ↗</button></div>
        <div class="resume-list">${notesHtml || '<p class="pane-empty">Your recent notes will appear here.</p>'}</div>
      </section>
      <section class="start-section"><div class="section-heading"><h2>Start something</h2></div>
        <div class="start-actions">
          <button type="button" data-home-action="notes"><span aria-hidden="true">＋</span>Write a note</button>
          <button type="button" data-home-action="journal"><span aria-hidden="true">＋</span>Open your journal</button>
          <button type="button" data-home-action="crew"><span aria-hidden="true">＋</span>Run an automation</button>
        </div>
      </section>
      ${outputs.length ? `<section class="recent-section"><div class="section-heading"><h2>Recent outputs</h2><button type="button" class="text-action" data-status-page="outputs">View all ↗</button></div>${outputHtml}</section>` : ""}
    </div>`;
  }

  function runModalHtml() {
    const crewId = state.runModalCrewId;
    if (!crewId) return "";
    const crew = getCrew(crewId);
    if (!crew) return "";
    return `
      <div class="modal-overlay" id="run-modal-overlay">
        <div class="card modal-card">
          <h3>${escapeHtml(crew.name)}</h3>
          <div class="desc">${escapeHtml(crew.description)}</div><code class="automation-command">${escapeHtml(crew.command || "")}</code>
          <form id="run-modal-form">
            ${crew.inputs.map(fieldHtml).join("")}
            <div class="modal-actions">
              <button type="submit" class="primary">Run</button>
              <button type="button" id="run-modal-cancel">Cancel</button>
            </div>
          </form>
        </div>
      </div>`;
  }

  // ---- Rich field: shared image-embed editor for Notes + Journal ---------
  //
  // Model: a field's content is an ordered array of nodes:
  //   {type: "text", value: string} | {type: "image", filename: string}
  // parseToChips/chipsToText and nodesToLines/linesToNodes are pure (no DOM)
  // and are exact inverses of each other - this is the highest-risk part of
  // the feature, so the DOM layer below is kept as thin and
  // mechanical as possible: one <div class="rich-line"> per line, one child
  // per node. Only ![[filename.ext]] image embeds get special rendering -
  // everything else stays plain, unstyled, editable text.

  const IMAGE_EMBED_RE = /!\[\[([^\]]+\.(?:png|jpg|jpeg|gif|webp))\]\]/gi;

  function parseToChips(text) {
    const nodes = [];
    let lastIndex = 0;
    let match;
    IMAGE_EMBED_RE.lastIndex = 0;
    while ((match = IMAGE_EMBED_RE.exec(text)) !== null) {
      if (match.index > lastIndex) {
        nodes.push({ type: "text", value: text.slice(lastIndex, match.index) });
      }
      nodes.push({ type: "image", filename: match[1] });
      lastIndex = match.index + match[0].length;
    }
    if (lastIndex < text.length || nodes.length === 0) {
      nodes.push({ type: "text", value: text.slice(lastIndex) });
    }
    return nodes;
  }

  function chipsToText(nodes) {
    return nodes.map((node) => (node.type === "image" ? `![[${node.filename}]]` : node.value)).join("");
  }

  function _mergeAdjacentText(nodes) {
    const merged = [];
    nodes.forEach((node) => {
      const prev = merged[merged.length - 1];
      if (node.type === "text" && prev && prev.type === "text") {
        prev.value += node.value;
      } else {
        merged.push({ ...node });
      }
    });
    return merged;
  }

  function nodesToLines(nodes) {
    const lines = [[]];
    nodes.forEach((node) => {
      if (node.type !== "text") {
        lines[lines.length - 1].push(node);
        return;
      }
      const parts = node.value.split("\n");
      parts.forEach((part, i) => {
        if (i > 0) lines.push([]);
        if (part.length) lines[lines.length - 1].push({ type: "text", value: part });
      });
    });
    return lines;
  }

  function linesToNodes(lines) {
    const nodes = [];
    lines.forEach((line, i) => {
      if (i > 0) nodes.push({ type: "text", value: "\n" });
      line.forEach((node) => nodes.push(node));
    });
    return _mergeAdjacentText(nodes);
  }

  // ---- DOM layer: mechanical translation between lines[][] and the live
  // contenteditable, plus the paste/delete/Enter handlers that keep it in
  // sync with the model above. ---------------------------------------------

  function _renderChipNode(node, container) {
    if (node.type === "text") {
      return document.createTextNode(node.value);
    }
    const chip = document.createElement("span");
    chip.className = "rich-image-chip";
    chip.contentEditable = "false";
    chip.dataset.embed = `![[${node.filename}]]`;

    const img = document.createElement("img");
    img.src = `file://${state.mediaImagesDir}/${encodeURIComponent(node.filename)}`;
    img.alt = node.filename;
    img.onerror = () => {
      // Referenced file doesn't actually exist under media/images/ - fall
      // back to plain embed text instead of a broken image icon.
      chip.replaceWith(document.createTextNode(`![[${node.filename}]]`));
    };

    const del = document.createElement("button");
    del.type = "button";
    del.className = "rich-image-chip-delete";
    del.textContent = "×";
    del.tabIndex = -1;
    del.addEventListener("mousedown", (event) => event.preventDefault()); // don't steal focus/caret
    del.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      chip.remove();
      // Dispatch on the field container, not the now-detached chip - a
      // removed element's dispatched event has no parent left to bubble
      // to, so the field's own "input" listener would never see it.
      container.dispatchEvent(new Event("input", { bubbles: true }));
    });

    chip.appendChild(img);
    chip.appendChild(del);
    return chip;
  }

  function _renderLines(container, lines) {
    container.innerHTML = "";
    lines.forEach((line) => {
      const lineEl = document.createElement("div");
      lineEl.className = "rich-line";
      if (line.length === 0) {
        lineEl.appendChild(document.createElement("br"));
      } else {
        line.forEach((node) => lineEl.appendChild(_renderChipNode(node, container)));
      }
      container.appendChild(lineEl);
    });
  }

  function _getLineElement(node, container) {
    let el = node.nodeType === Node.TEXT_NODE ? node.parentElement : node;
    while (el && el !== container && !(el.classList && el.classList.contains("rich-line"))) {
      el = el.parentElement;
    }
    return el === container ? null : el;
  }

  function domToLines(container) {
    const lines = [];
    container.querySelectorAll(":scope > .rich-line").forEach((lineEl) => {
      const line = [];
      lineEl.childNodes.forEach((child) => {
        if (child.nodeType === Node.TEXT_NODE) {
          line.push({ type: "text", value: child.textContent });
        } else if (child.nodeType === Node.ELEMENT_NODE && child.classList.contains("rich-image-chip")) {
          const match = /^!\[\[(.+)\]\]$/.exec(child.dataset.embed || "");
          if (match) line.push({ type: "image", filename: match[1] });
        } else if (child.nodeType === Node.ELEMENT_NODE && child.tagName !== "BR") {
          // Defensive fallback for any other element the browser might
          // insert (shouldn't normally happen) - keep its text rather than
          // silently lose it on save.
          line.push({ type: "text", value: child.textContent });
        }
      });
      lines.push(line);
    });
    return lines.length ? lines : [[]];
  }

  // Leading "- ", "* ", or "1. " (optionally indented) - markers are kept
  // as literal typed text, not structured data, same as everything else
  // in this editor (it's a plain-text file on disk, chips are the only
  // exception). Group 1 is the indent, group 2 is the marker + its space.
  const LIST_MARKER_RE = /^(\s*)((?:[-*]|\d+\.)\s)/;

  function _handleEnterKey(event, container, triggerChange) {
    if (event.key !== "Enter") return;
    event.preventDefault();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();

    const currentLine = _getLineElement(range.startContainer, container);
    if (!currentLine) return;

    const newLine = document.createElement("div");
    newLine.className = "rich-line";

    let fragment;
    if (currentLine.hasChildNodes()) {
      const afterRange = document.createRange();
      afterRange.setStart(range.startContainer, range.startOffset);
      afterRange.setEndAfter(currentLine.lastChild);
      fragment = afterRange.extractContents();
    } else {
      fragment = document.createDocumentFragment();
    }
    newLine.appendChild(fragment);

    // Continue a bulleted/numbered list onto the new line, the way typing
    // markdown by hand would - pressing Enter on a line that starts with
    // "- "/"* "/"1. " repeats that marker (incrementing the number for an
    // ordered list); pressing Enter on an otherwise-empty list item (just
    // the marker, nothing after it) clears the marker instead, exiting
    // the list rather than adding another empty bullet.
    let caretAfterMarker = null;
    const leadingText = currentLine.firstChild && currentLine.firstChild.nodeType === Node.TEXT_NODE ? currentLine.firstChild.textContent : "";
    const marker = LIST_MARKER_RE.exec(leadingText);
    if (marker) {
      const lineWasJustTheMarker = currentLine.childNodes.length === 1 && leadingText.trim() === marker[0].trim();
      const newLineHasContent = newLine.hasChildNodes() && newLine.textContent.trim().length > 0;
      if (lineWasJustTheMarker && !newLineHasContent) {
        currentLine.innerHTML = "";
        currentLine.appendChild(document.createElement("br"));
      } else {
        const [, indent, bulletWithSpace] = marker;
        const orderedMatch = /^(\d+)\.\s$/.exec(bulletWithSpace);
        const nextBullet = orderedMatch ? `${parseInt(orderedMatch[1], 10) + 1}. ` : bulletWithSpace;
        const markerNode = document.createTextNode(indent + nextBullet);
        newLine.insertBefore(markerNode, newLine.firstChild || null);
        caretAfterMarker = markerNode;
      }
    }

    if (!newLine.hasChildNodes()) newLine.appendChild(document.createElement("br"));
    if (!currentLine.hasChildNodes()) currentLine.appendChild(document.createElement("br"));

    currentLine.after(newLine);

    const newRange = document.createRange();
    if (caretAfterMarker) {
      newRange.setStart(caretAfterMarker, caretAfterMarker.textContent.length);
    } else {
      newRange.setStart(newLine, 0);
    }
    newRange.collapse(true);
    selection.removeAllRanges();
    selection.addRange(newRange);

    triggerChange();
  }

  // Tab/Shift+Tab indent/outdent the whole current line by two spaces
  // (markdown's own nested-list indent convention), regardless of where
  // the caret sits on the line - not literal tab-character insertion at
  // the caret, which is what a browser's default Tab-in-contenteditable
  // would otherwise do (move focus, not insert anything).
  const LINE_INDENT = "  ";

  function _handleTabKey(event, container, triggerChange) {
    if (event.key !== "Tab") return;
    event.preventDefault();

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    const currentLine = _getLineElement(range.startContainer, container);
    if (!currentLine) return;

    const firstChild = currentLine.firstChild;
    const caretInFirstChild = firstChild && firstChild.nodeType === Node.TEXT_NODE && range.startContainer === firstChild;
    let newCaretOffset = null;

    if (event.shiftKey) {
      if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
        const removeLen = firstChild.textContent.startsWith(LINE_INDENT) ? LINE_INDENT.length : firstChild.textContent.startsWith(" ") ? 1 : 0;
        if (removeLen) {
          firstChild.textContent = firstChild.textContent.slice(removeLen);
          if (caretInFirstChild) newCaretOffset = Math.max(0, range.startOffset - removeLen);
        }
      }
    } else if (firstChild && firstChild.nodeType === Node.TEXT_NODE) {
      firstChild.textContent = LINE_INDENT + firstChild.textContent;
      if (caretInFirstChild) newCaretOffset = range.startOffset + LINE_INDENT.length;
    } else {
      currentLine.insertBefore(document.createTextNode(LINE_INDENT), firstChild || null);
    }

    if (newCaretOffset !== null) {
      const newRange = document.createRange();
      newRange.setStart(firstChild, Math.min(newCaretOffset, firstChild.textContent.length));
      newRange.collapse(true);
      selection.removeAllRanges();
      selection.addRange(newRange);
    }

    triggerChange();
  }

  async function _handleImagePaste(event, container, triggerChange) {
    const clipboardData = event.clipboardData;
    if (!clipboardData) return;

    let file = null;
    let mimeType = null;
    if (clipboardData.files && clipboardData.files.length) {
      file = Array.from(clipboardData.files).find((f) => f.type.startsWith("image/")) || null;
      if (file) mimeType = file.type;
    }
    if (!file && clipboardData.items) {
      const item = Array.from(clipboardData.items).find((it) => it.type && it.type.startsWith("image/"));
      if (item) {
        file = item.getAsFile();
        mimeType = item.type;
      }
    }
    if (!file) return; // not an image - let default text paste happen

    event.preventDefault();

    const dataUrl = await new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
    const base64 = dataUrl.split(",")[1];
    const result = await window.pywebview.api.save_pasted_image(base64, mimeType);
    if (!result.ok) {
      console.error("Image paste failed:", result.error);
      return;
    }

    const selection = window.getSelection();
    if (!selection.rangeCount) return;
    const range = selection.getRangeAt(0);
    range.deleteContents();
    const chip = _renderChipNode({ type: "image", filename: result.filename }, container);
    range.insertNode(chip);
    range.setStartAfter(chip);
    range.collapse(true);
    selection.removeAllRanges();
    selection.addRange(range);

    triggerChange();
  }

  // Builds a rich-editor field inside `container` (must be empty), backed
  // by `getValue()`/`onChange(newText)` - mirrors the existing
  // journalPageHtml()/notesPageHtml() render-function style: this owns its
  // own DOM and event wiring rather than being re-rendered by the app's
  // main render() loop (same reasoning as the existing textarea fields -
  // re-rendering on every keystroke would steal focus/cursor position).
  function createRichField(container, { getValue, onChange }) {
    container.classList.add("rich-field");
    container.contentEditable = "true";
    container.spellcheck = false;

    _renderLines(container, nodesToLines(parseToChips(getValue() || "")));

    function triggerChange() {
      const text = chipsToText(linesToNodes(domToLines(container)));
      onChange(text);
    }

    container.addEventListener("input", () => triggerChange());
    container.addEventListener("keydown", (event) => _handleEnterKey(event, container, triggerChange));
    container.addEventListener("keydown", (event) => _handleTabKey(event, container, triggerChange));
    container.addEventListener("paste", (event) => _handleImagePaste(event, container, triggerChange));

    return {
      element: container,
      refresh(newText) {
        _renderLines(container, nodesToLines(parseToChips(newText || "")));
      },
    };
  }

  // ---- Journal page --------------------------------------------------------

  function journalPageHtml() {
    const journal = state.journal;
    if (!journal || !state.journalEntry) {
      return `<div class="page journal-workspace ${state.journalSource === "trade" ? "trade-journal" : "personal-journal"}"><p class="pane-empty">Loading…</p></div>`;
    }
    const entry = state.journalEntry;
    const isToday = entry.date === journal.today.date;

    const sectionsHtml = (journal.section_labels || [])
      .map(
        ({ key, label }) => `
        <div class="jrn-section">
          <label class="label" id="journal-label-${key}">${escapeHtml(label)}</label>
          <div class="rich-field" data-journal-section-key="${key}" role="textbox" aria-multiline="true" aria-labelledby="journal-label-${key}"></div>
        </div>`
      )
      .join("");

    const sourceTabsHtml = (journal.sources || [])
      .map(
        ({ key, label }) => `
        <button type="button" class="jrn-source-tab${key === state.journalSource ? " active" : ""}" data-journal-source="${key}">${escapeHtml(label)}</button>`
      )
      .join("");

    return `
      <div class="page journal-workspace ${state.journalSource === "trade" ? "trade-journal" : "personal-journal"}">
        <div class="page-header">
          ${journalIcon(30)}
          <div><h2>Journal</h2><div class="sub">${state.journalSource === "trade" ? "trade log, pulled straight from the vault" : "daily notes, pulled straight from the vault"}</div></div>
          <div class="jrn-source-switch">${sourceTabsHtml}</div>
        </div>
        <div class="card today-card">
          <div class="date">
            <div class="journal-date-title"><span class="editor-kicker">${state.journalSource === "trade" ? "TRADE JOURNAL" : "DAILY JOURNAL"}</span><h3>${isToday ? "Today" : "Your entry"}</h3><span>${escapeHtml(entry.date)}</span></div>
            <span class="save-status" id="journal-save-status"></span>
            ${!isToday ? `<button type="button" class="btn" id="journal-back-to-today">Back to today</button>` : ""}
          </div>
          ${sectionsHtml}
        </div>
        <div>
          <div class="label" style="margin-bottom:10px;">Recent entries</div>
          <div class="recent-list">
            ${
              journal.recent && journal.recent.length
                ? journal.recent
                    .map(
                      (j) => `
              <div class="card recent-row" data-journal-date="${j.date}">
                <div class="rdate">${escapeHtml(j.date)}</div>
                <div class="rpreview">${escapeHtml(j.preview)}</div>
              </div>`
                    )
                    .join("")
                : `<p class="pane-empty">No recent entries.</p>`
            }
          </div>
        </div>
      </div>`;
  }

  async function loadJournalEntry(dateStr) {
    await flushJournalSave();
    const entry = await window.pywebview.api.get_journal_entry(dateStr, state.journalSource);
    state.journalEntry = entry;
    render();
  }

  async function loadJournalSource(source) {
    if (source === state.journalSource) return;
    await flushJournalSave();
    state.journalSource = source;
    state.journal = null;
    state.journalEntry = null;
    render();
    const journal = await window.pywebview.api.get_journal_data(source);
    state.journal = journal;
    state.journalEntry = journal.today;
    render();
  }

  let journalSaveTimer = null, pendingJournal = null;
  let journalSaveQueue = Promise.resolve();
  function scheduleJournalSave() {
    const status = document.getElementById("journal-save-status");
    if (status) status.textContent = "Editing…";
    clearTimeout(journalSaveTimer);
    pendingJournal = { date: state.journalEntry.date, sections: { ...state.journalEntry.sections }, source: state.journalSource };
    journalSaveTimer = setTimeout(() => flushJournalSave().catch(() => {}), 800);
  }
  async function flushJournalSave() {
    clearTimeout(journalSaveTimer);
    if (pendingJournal) {
      const edit = pendingJournal; pendingJournal = null;
      journalSaveQueue = journalSaveQueue.catch(() => {}).then(async () => {
        try {
          await window.pywebview.api.save_journal_entry(edit.date, edit.sections, edit.source);
          const data = await window.pywebview.api.get_journal_data(edit.source);
          if (state.journal && state.journalSource === edit.source) state.journal.recent = data.recent;
          const status = document.getElementById("journal-save-status");
          if (status && !pendingJournal) status.textContent = "Saved";
        } catch (error) {
          if (!pendingJournal) pendingJournal = edit;
          const status = document.getElementById("journal-save-status");
          if (status) status.textContent = "Could not save — try again";
          throw error;
        }
      });
    }
    await journalSaveQueue;
  }

  // ---- Notes page -----------------------------------------------------------

  // A node id for expand/collapse tracking is the category name for a
  // top-level category, or the folder's absolute path for anything nested.
  // Categories default open, subfolders default closed, until the user (or
  // an active search match) overrides it.
  function isNodeExpanded(id, isCategory) {
    if (Object.prototype.hasOwnProperty.call(state.notesExpanded, id)) return state.notesExpanded[id];
    return isCategory;
  }

  function toggleTreeNode(id, isCategory) {
    state.notesExpanded[id] = !isNodeExpanded(id, isCategory);
    render();
  }

  // ---- File management: inline create/rename rows, context menu ---------

  function createInputRowHtml(parentId, depth) {
    const create = state.notesCreateInput;
    if (!create || create.parentId !== parentId) return "";
    const placeholder = create.kind === "folder" ? "New folder name…" : create.blank ? "New blank note name…" : "New note name…";
    return `
      <div class="notes-tree-row notes-tree-create-row" style="padding-left:${depth * 16 + 8}px">
        <input type="text" class="notes-tree-inline-input" id="notes-tree-create-input" placeholder="${escapeHtml(placeholder)}" />
      </div>`;
  }

  // New-category creation isn't nested under any existing tree node (it's a
  // new top-level peer of the categories themselves), so it gets its own
  // row at the top of the tree rather than reusing createInputRowHtml's
  // parentId-nested placement.
  function newCategoryInputRowHtml() {
    const create = state.notesCreateInput;
    if (!create || create.kind !== "category") return "";
    return `
      <div class="notes-tree-row notes-tree-create-row">
        <input type="text" class="notes-tree-inline-input" id="notes-tree-create-input" placeholder="New category name…" />
      </div>`;
  }

  function notesTreeFileRowHtml(node, depth, search) {
    const renaming =
      state.notesRenameTarget && state.notesRenameTarget.kind === "file" && state.notesRenameTarget.path === node.path;
    if (!renaming && search && !node.title.toLowerCase().includes(search)) return "";
    const indent = `padding-left:${depth * 16 + 8}px`;

    if (renaming) {
      return `
        <div class="notes-tree-row notes-tree-file notes-tree-renaming" style="${indent}">
          <input type="text" class="notes-tree-inline-input" id="notes-tree-rename-input" value="${escapeHtml(node.title)}" />
        </div>`;
    }
    const isActive = node.path === state.noteEditorPath;
    return `
      <div class="notes-tree-row notes-tree-file${isActive ? " active" : ""}" style="${indent}"
           data-tree-kind="file" data-note-path="${escapeHtml(node.path)}" data-note-title="${escapeHtml(node.title)}"
           data-note-doctype="${escapeHtml(node.doc_type || "md")}"
           draggable="true">
        <span class="notes-tree-label">${escapeHtml(node.title)}</span>
      </div>`;
  }

  function notesTreeFolderRowHtml(node, depth, search, category) {
    const renaming =
      state.notesRenameTarget && state.notesRenameTarget.kind === "folder" && state.notesRenameTarget.path === node.path;
    const childrenHtml = node.children.map((child) => notesTreeNodeHtml(child, depth + 1, search, category)).join("");
    const createRowHtml = createInputRowHtml(node.path, depth + 1);
    if (!renaming && search && !childrenHtml.trim() && !createRowHtml) return "";
    const expanded = renaming || isNodeExpanded(node.path, false) || (!!search && !!childrenHtml.trim()) || !!createRowHtml;
    const indent = `padding-left:${depth * 16 + 8}px`;

    const rowInner = renaming
      ? `<input type="text" class="notes-tree-inline-input" id="notes-tree-rename-input" value="${escapeHtml(node.name)}" />`
      : `<span class="notes-tree-caret">${expanded ? "▾" : "▸"}</span><span class="notes-tree-label">${escapeHtml(node.name)}</span>`;
    const rowAttrs = renaming
      ? ""
      : `data-tree-toggle="${escapeHtml(node.path)}" data-drop-target-path="${escapeHtml(node.path)}" data-tree-category="${escapeHtml(category)}" draggable="true"`;

    return `
      <div class="notes-tree-folder">
        <div class="notes-tree-row notes-tree-folder-row${renaming ? " notes-tree-renaming" : ""}" style="${indent}"
             data-tree-kind="folder" ${rowAttrs}>
          ${rowInner}
        </div>
        ${expanded ? `<div class="notes-tree-children">${childrenHtml}${createRowHtml}</div>` : ""}
      </div>`;
  }

  function notesTreeNodeHtml(node, depth, search, category) {
    return node.type === "file"
      ? notesTreeFileRowHtml(node, depth, search)
      : notesTreeFolderRowHtml(node, depth, search, category);
  }

  function notesTreeCategoryHtml(category, search) {
    const childrenHtml = (category.children || []).map((child) => notesTreeNodeHtml(child, 1, search, category.name)).join("");
    const createRowHtml = createInputRowHtml(category.name, 1);
    if (search && !childrenHtml.trim() && !createRowHtml) return "";
    const expanded = isNodeExpanded(category.name, true) || (!!search && !!childrenHtml.trim()) || !!createRowHtml;
    return `
      <div class="notes-tree-category">
        <div class="notes-tree-row notes-tree-category-row"
             data-tree-kind="category" data-tree-toggle="${escapeHtml(category.name)}"
             data-drop-target-category="${escapeHtml(category.name)}">
          <span class="notes-tree-caret">${expanded ? "▾" : "▸"}</span>
          <span class="notes-tree-label">${escapeHtml(category.label || category.name)}</span>
        </div>
        ${expanded ? `<div class="notes-tree-children">${childrenHtml}${createRowHtml}</div>` : ""}
      </div>`;
  }

  function contextMenuHtml() {
    const menu = state.notesContextMenu;
    if (!menu) return "";
    const items = [];
    if (menu.kind === "category" || menu.kind === "folder") {
      items.push({ action: "new-note", label: "New note" });
      items.push({ action: "new-blank-note", label: "New blank note" });
      items.push({ action: "new-folder", label: "New folder" });
    }
    if (menu.kind === "folder" || (menu.kind === "file" && menu.docType !== "pdf")) {
      // A view-only file can't be renamed (notes.py would append .md to it),
      // so the item is hidden rather than offered and then rejected.
      items.push({ action: "rename", label: "Rename" });
    }
    if (menu.kind === "category" || menu.kind === "folder" || menu.kind === "file") {
      items.push({ action: "delete", label: "Delete" });
    }
    return `
      <div class="context-menu" id="notes-context-menu" style="left:${menu.x}px; top:${menu.y}px">
        ${items
          .map((item) => `<button type="button" class="context-menu-item" data-menu-action="${item.action}">${escapeHtml(item.label)}</button>`)
          .join("")}
      </div>`;
  }

  function noteEditorPaneHtml() {
    if (!state.noteEditorPath) {
      return `<div class="notes-editor-empty"><div class="editor-empty-card">${notesIcon(36)}<h3>A place for your thoughts.</h3><p>Choose a note from the library to start reading or writing.</p></div></div>`;
    }
    if (state.noteEditorDocType === "pdf") {
      // Rendered by WKWebView itself, which is the whole point - a PDF's charts
      // are the content, and no text extraction can carry them over. No
      // read-aloud bar: there is no text layer in the iframe to read.
      return `
        <div class="note-editor-head">
          <h3>${escapeHtml(state.noteEditorTitle || "")}</h3>
          <span class="save-status">view only</span>
          <button type="button" class="btn" id="note-pdf-open-btn">Open in Preview</button>
        </div>
        ${
          state.noteEditorUrl
            ? `<iframe class="note-pdf-view" id="note-pdf-view" src="${escapeHtml(state.noteEditorUrl)}"></iframe>`
            : `<p class="pane-empty">Loading…</p>`
        }`;
    }
    const loading = state.noteEditorContent == null;
    return `
      <div class="note-editor-head">
        <div class="editor-document-title"><span class="editor-kicker">NOTEBOOK</span><h3>${escapeHtml(state.noteEditorTitle || "Untitled note")}</h3></div>
        <span class="save-status" id="note-save-status"></span>
      </div>
      ${loading ? "" : `<div class="editor-tools">${readAloudControlsHtml("notes")}</div>`}
      ${loading ? `<p class="pane-empty">Loading…</p>` : `<div class="rich-field note-editor-rich-field" id="note-editor-rich-field"></div>`}`;
  }

  function notesPageHtml() {
    const search = state.notesSearch.trim().toLowerCase();
    const categories = (state.notes && state.notes.categories) || [];
    const treeHtml = categories.map((cat) => notesTreeCategoryHtml(cat, search)).join("");

    return `
      <div class="page notes-page">
        <div class="page-header">
          ${libraryIcon(30)}
          <div><h2>Notes</h2><div class="sub">browse your vault's notes by category</div></div>
        </div>
        <div class="notes-split">
          <div class="notes-tree-pane">
            <div class="notes-tree-pane-head">
              <input class="notes-search" type="text" id="notes-search-input" placeholder="Search notes…" value="${escapeHtml(state.notesSearch)}" />
              <button type="button" class="btn" id="notes-new-category-btn">+ New category</button>
            </div>
            ${state.notesTreeError ? `<div class="notes-tree-error">${escapeHtml(state.notesTreeError)}</div>` : ""}
            <div class="notes-tree">${newCategoryInputRowHtml()}${treeHtml || `<p class="pane-empty">Nothing here yet.</p>`}</div>
          </div>
          <div class="notes-editor-pane">${noteEditorPaneHtml()}</div>
        </div>
      </div>`;
  }

  async function openNoteEditor(notePath, title, docType) {
    window.ReadAloud.stop(); // a different note's content is about to replace the read-aloud target
    await flushNoteSave();
    state.noteEditorPath = notePath;
    state.noteEditorTitle = title;
    state.noteEditorContent = null;
    state.noteEditorUrl = null;
    // Trust the row's own type for the first paint so the pane doesn't flash the
    // markdown editor before the fetch comes back; the response corrects it.
    state.noteEditorDocType = docType || "md";
    render();
    const result = await window.pywebview.api.get_note_content(notePath);
    state.noteEditorDocType = result.doc_type || "md";
    if (state.noteEditorDocType === "pdf") {
      state.noteEditorUrl = result.ok ? result.url : null;
      state.noteEditorContent = "";
    } else {
      state.noteEditorContent = result.ok ? result.content : "";
    }
    render();
  }

  let noteSaveTimer = null, pendingNote = null;
  let noteSaveQueue = Promise.resolve();
  function scheduleNoteSave(notePath) {
    const status = document.getElementById("note-save-status");
    if (status) status.textContent = "Editing…";
    clearTimeout(noteSaveTimer);
    pendingNote = { path: notePath, content: state.noteEditorContent };
    noteSaveTimer = setTimeout(() => flushNoteSave().catch(() => {}), 800);
  }
  async function flushNoteSave() {
    clearTimeout(noteSaveTimer);
    if (pendingNote) {
      const edit = pendingNote; pendingNote = null;
      noteSaveQueue = noteSaveQueue.catch(() => {}).then(async () => {
        try {
          const result = await window.pywebview.api.save_note_content(edit.path, edit.content);
          if (!result.ok) throw new Error(result.error || "Could not save note");
          state.notes = await window.pywebview.api.get_notes_data();
          const status = document.getElementById("note-save-status");
          if (status && !pendingNote) status.textContent = "Saved";
        } catch (error) {
          if (!pendingNote) pendingNote = edit;
          const status = document.getElementById("note-save-status");
          if (status) status.textContent = "Could not save — try again";
          throw error;
        }
      });
    }
    await noteSaveQueue;
  }

  // ---- Notes tree: file management (create / rename / move) -------------

  async function refreshNotesTree() {
    state.notes = await window.pywebview.api.get_notes_data();
  }

  function openContextMenu(x, y, kind, extra) {
    state.notesContextMenu = { x, y, kind, ...extra };
    render();
  }

  function closeContextMenu() {
    if (!state.notesContextMenu) return;
    state.notesContextMenu = null;
    render();
  }

  function beginCreate(kind, category, parentId, parentPath, blank = false) {
    state.notesContextMenu = null;
    state.notesTreeError = null;
    state.notesCreateInput = { kind, category, parentId, parentPath, blank };
    state.notesExpanded[parentId] = true;
    render();
  }

  function beginCreateCategory() {
    state.notesContextMenu = null;
    state.notesTreeError = null;
    state.notesCreateInput = { kind: "category" };
    render();
  }

  function cancelCreate() {
    state.notesCreateInput = null;
    render();
  }

  async function submitCreate() {
    const create = state.notesCreateInput;
    if (!create) return;
    const input = document.getElementById("notes-tree-create-input");
    const name = input ? input.value.trim() : "";
    if (!name) {
      cancelCreate();
      return;
    }

    const result =
      create.kind === "category"
        ? await window.pywebview.api.create_category(name)
        : create.kind === "folder"
        ? await window.pywebview.api.create_folder(create.category, name, create.parentPath || null)
        : await window.pywebview.api.create_note(create.category, name, create.parentPath || null, create.blank || false);

    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }

    state.notesCreateInput = null;
    state.notesTreeError = null;
    await refreshNotesTree();
    if (create.kind === "note") {
      openNoteEditor(result.entry.path, result.entry.title);
    } else {
      render();
    }
  }

  function beginRename(kind, path, currentName) {
    state.notesContextMenu = null;
    state.notesTreeError = null;
    state.notesRenameTarget = { kind, path, currentName };
    render();
  }

  function cancelRename() {
    state.notesRenameTarget = null;
    render();
  }

  async function submitRename() {
    const target = state.notesRenameTarget;
    if (!target) return;
    const input = document.getElementById("notes-tree-rename-input");
    const newName = input ? input.value.trim() : "";
    if (!newName || newName === target.currentName) {
      cancelRename();
      return;
    }

    const result =
      target.kind === "folder"
        ? await window.pywebview.api.rename_folder(target.path, newName)
        : await window.pywebview.api.rename_note(target.path, newName);

    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }

    state.notesRenameTarget = null;
    state.notesTreeError = null;
    if (target.kind === "file" && state.noteEditorPath === target.path) {
      state.noteEditorPath = result.entry.path;
      state.noteEditorTitle = result.entry.title;
    }
    await refreshNotesTree();
    render();
  }

  async function moveNoteTo(path, targetFolder, category) {
    const result = await window.pywebview.api.move_note(path, targetFolder || null, category || null);
    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }
    state.notesTreeError = null;
    if (state.noteEditorPath === path) {
      state.noteEditorPath = result.entry.path;
    }
    await refreshNotesTree();
    render();
  }

  async function moveFolderTo(path, targetFolder, category) {
    const result = await window.pywebview.api.move_folder(path, targetFolder || null, category || null);
    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }
    state.notesTreeError = null;
    // If the currently-open note lived inside the moved folder, its old
    // path no longer resolves - remap it onto the folder's new location
    // rather than leaving the editor pointed at a path that no longer
    // exists (which would silently fail the next autosave).
    if (state.noteEditorPath && (state.noteEditorPath === path || state.noteEditorPath.startsWith(path + "/"))) {
      state.noteEditorPath = result.entry.path + state.noteEditorPath.slice(path.length);
    }
    await refreshNotesTree();
    render();
  }

  // Dispatches a tree drop to the right backend call based on what was
  // dragged. The dataTransfer payload is JSON ({path, kind}) rather than a
  // bare path so a dropped folder and a dropped note can be told apart.
  function handleTreeDrop(rawPayload, targetFolder, targetCategory) {
    let payload;
    try {
      payload = JSON.parse(rawPayload);
    } catch (e) {
      return; // not a recognized drag source - ignore
    }
    if (!payload || !payload.path) return;

    if (payload.kind === "folder") {
      if (targetFolder && (targetFolder === payload.path || targetFolder.startsWith(payload.path + "/"))) {
        state.notesTreeError = "Can't move a folder into itself or one of its own subfolders";
        render();
        return;
      }
      moveFolderTo(payload.path, targetFolder, targetCategory);
    } else {
      moveNoteTo(payload.path, targetFolder, targetCategory);
    }
  }

  // Recursively counts a tree node's descendant files/folders, for the
  // delete-confirmation message - computed from the already-loaded tree
  // rather than a new backend call.
  function countTreeContents(node) {
    let files = 0;
    let folders = 0;
    (node.children || []).forEach((child) => {
      if (child.type === "file") {
        files += 1;
      } else {
        folders += 1;
        const nested = countTreeContents(child);
        files += nested.files;
        folders += nested.folders;
      }
    });
    return { files, folders };
  }

  function findFolderNode(nodes, path) {
    for (const node of nodes) {
      if (node.type === "folder" && node.path === path) return node;
      // Recurse regardless of this node's own type/kind - a top-level
      // category object has children but no "type" field of its own, so
      // gating the recursion on node.type === "folder" here would skip
      // straight past every category without ever reaching its folders.
      if (node.children) {
        const found = findFolderNode(node.children, path);
        if (found) return found;
      }
    }
    return null;
  }

  function deleteConfirmationMessage(name, node) {
    const counts = node ? countTreeContents(node) : { files: 0, folders: 0 };
    const parts = [];
    if (counts.files) parts.push(`${counts.files} note${counts.files === 1 ? "" : "s"}`);
    if (counts.folders) parts.push(`${counts.folders} folder${counts.folders === 1 ? "" : "s"}`);
    const contents = parts.length ? ` (${parts.join(", ")})` : " (empty)";
    return `Move "${name}"${contents} to Trash?`;
  }

  // Plain message, not deleteConfirmationMessage - that helper's
  // notes/folders counts describe a folder's contents, which don't apply
  // to a single file.
  async function deleteNote(path, name) {
    if (!window.confirm(`Move "${name}" to Trash?`)) return;

    const result = await window.pywebview.api.trash_note(path);
    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }
    state.notesTreeError = null;
    if (state.noteEditorPath === path) {
      state.noteEditorPath = null;
      state.noteEditorTitle = "";
      state.noteEditorContent = null;
    }
    await refreshNotesTree();
    render();
  }

  async function deleteFolder(path, name) {
    if (!window.confirm(deleteConfirmationMessage(name, findFolderNode((state.notes && state.notes.categories) || [], path)))) {
      return;
    }
    const result = await window.pywebview.api.trash_folder(path);
    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }
    state.notesTreeError = null;
    if (state.noteEditorPath && (state.noteEditorPath === path || state.noteEditorPath.startsWith(path + "/"))) {
      state.noteEditorPath = null;
      state.noteEditorTitle = "";
      state.noteEditorContent = null;
    }
    await refreshNotesTree();
    render();
  }

  async function deleteCategory(name) {
    const category = ((state.notes && state.notes.categories) || []).find((c) => c.name === name);
    if (!category) return;
    if (!window.confirm(deleteConfirmationMessage(name, category))) return;

    const result = await window.pywebview.api.trash_folder(category.path);
    if (!result.ok) {
      state.notesTreeError = result.error;
      render();
      return;
    }
    state.notesTreeError = null;
    const categoryPrefix = category.path + "/";
    if (state.noteEditorPath && (state.noteEditorPath === category.path || state.noteEditorPath.startsWith(categoryPrefix))) {
      state.noteEditorPath = null;
      state.noteEditorTitle = "";
      state.noteEditorContent = null;
    }
    await refreshNotesTree();
    render();
  }

  // ---- Flow page -------------------------------------------------------------
  // Today's QQQ options volume/premium per strike (flow.py). Volume, not open
  // interest - a "where is it trading right now" read, NOT gamma exposure.

  const FLOW_REFRESH_MS = 60000;
  let flowTimer = null;

  function fmtCompact(n, prefix) {
    const p = prefix || "";
    if (n >= 1e9) return `${p}${(n / 1e9).toFixed(2)}B`;
    if (n >= 1e6) return `${p}${(n / 1e6).toFixed(1)}M`;
    if (n >= 1e3) return `${p}${(n / 1e3).toFixed(0)}k`;
    return `${p}${Math.round(n)}`;
  }

  function flowPageHtml() {
    const flow = state.flow;
    const controls = `
      <div class="flow-controls">
        <button type="button" class="jrn-source-tab${state.flowShowVol ? " active" : ""}" data-flow-metric="vol" title="Contracts traded today">Volume</button>
        <button type="button" class="jrn-source-tab${state.flowShowPrem ? " active" : ""}" data-flow-metric="prem" title="Dollars traded today. With both on, each metric is scaled to its own biggest bar - compare shapes, not lengths.">Premium</button>
        <button type="button" class="jrn-source-tab${state.flowAuto ? " active" : ""}" data-flow-auto>Auto ${FLOW_REFRESH_MS / 1000}s</button>
        <button type="button" class="jrn-source-tab${state.flowPush.enabled ? " active" : ""}" data-flow-push title="Rewrite the chart ladder's Data input every minute through TradingView Desktop">Push to chart</button>
        <button type="button" class="btn" data-flow-refresh ${state.flowLoading ? "disabled" : ""}>${state.flowLoading ? "Pulling…" : "Refresh"}</button>
        <button type="button" class="btn" data-flow-export ${state.flowExport && state.flowExport.busy ? "disabled" : ""}>Export Pine</button>
      </div>
      ${flowExportStatusHtml()}
      ${flowPushStatusHtml()}`;

    if (!flow || !flow.ok) {
      const message = !flow ? "Pulling the chain…" : escapeHtml(flow.error);
      return `
        <div class="page">
          ${pageHeaderHtml(flowIcon(30), "Options Flow", "QQQ by strike")}
          ${controls}
          <p class="pane-empty">${message}</p>
        </div>`;
    }

    // Each metric is scaled to its OWN biggest bar, exactly as the Pine ladder does it -
    // premium dwarfs volume numerically, so a shared scale would flatten the volume bars
    // into nothing. The two are there to be compared by shape, not by length.
    const metrics = [];
    if (state.flowShowVol) metrics.push({ key: "vol", callKey: "call_vol", putKey: "put_vol", prefix: "" });
    if (state.flowShowPrem) metrics.push({ key: "prem", callKey: "call_prem", putKey: "put_prem", prefix: "$" });
    for (const m of metrics) {
      m.max = Math.max(1, ...flow.rows.map((r) => Math.max(r[m.callKey], r[m.putKey])));
    }
    const both = metrics.length > 1;
    // The one strike closest to spot gets the marker - volume always piles up
    // there, so the read is in how the OTHER strikes are skewed.
    const spotStrike = flow.rows.reduce((best, r) => (Math.abs(r.strike - flow.spot) < Math.abs(best.strike - flow.spot) ? r : best)).strike;

    const cell = (r, side) => {
      const bars = metrics
        .map((m) => `<span class="flow-bar ${side} m-${m.key}" style="width:${((r[side === "put" ? m.putKey : m.callKey] / m.max) * 100).toFixed(1)}%"></span>`)
        .join("");
      const nums = metrics
        .map((m) => {
          const v = r[side === "put" ? m.putKey : m.callKey];
          return `<span class="m-${m.key}">${v ? fmtCompact(v, m.prefix) : ""}</span>`;
        })
        .join("");
      return { bars, nums };
    };

    const rowsHtml = flow.rows
      .map((r) => {
        const isSpot = r.strike === spotStrike;
        const put = cell(r, "put");
        const call = cell(r, "call");
        return `
          <div class="flow-row${isSpot ? " at-spot" : ""}${both ? " two-metric" : ""}">
            <span class="flow-num">${put.nums}</span>
            <span class="flow-bar-track put">${put.bars}</span>
            <span class="flow-strike"><b>${r.strike}</b>${r.nq ? `<i>${r.nq.toLocaleString()}</i>` : ""}</span>
            <span class="flow-bar-track call">${call.bars}</span>
            <span class="flow-num">${call.nums}</span>
          </div>`;
      })
      .join("");

    const t = flow.totals;
    const pcRatio = t.call_vol ? (t.put_vol / t.call_vol).toFixed(2) : "-";
    const isStale = flow.age_seconds !== null && flow.age_seconds > 300;
    const subtitle = `${flow.underlying} ${flow.expiry} · spot ${flow.spot.toFixed(2)}${flow.nq ? ` · NQ ${Math.round(flow.nq).toLocaleString()}` : ""}`;

    return `
      <div class="page" data-flow-page>
        ${pageHeaderHtml(flowIcon(30), "Options Flow", subtitle)}
        ${controls}
        <div class="flow-summary">
          <span>Puts <b class="put">${fmtCompact(t.put_vol)}</b> · ${fmtCompact(t.put_prem, "$")}</span>
          <span>Calls <b class="call">${fmtCompact(t.call_vol)}</b> · ${fmtCompact(t.call_prem, "$")}</span>
          <span>P/C vol <b>${pcRatio}</b></span>
          <span class="${isStale ? "flow-stale" : ""}">Last print ${escapeHtml(flow.updated_label)}${isStale ? " - market closed or feed quiet" : ""}</span>
        </div>
        ${window.IcarusOptionsCharts.flowHtml(flow, {volume:state.flowShowVol,premium:state.flowShowPrem})}
        ${wallsHtml()}
        <h3 class="options-detail-heading">Strike-by-strike detail</h3>
        <div class="flow-ladder">
          <div class="flow-row flow-head"><span>Puts</span><span></span><span>Strike · NQ</span><span></span><span>Calls</span></div>
          ${rowsHtml}
        </div>
        <p class="flow-note">Traded ${metrics.map((m) => (m.key === "prem" ? "premium" : "volume")).join(" and ")} today, per strike${both ? ", each scaled to its own biggest bar" : ""}. This is not open interest and not GEX - it will not match the GEX Bands or TWB.</p>
      </div>`;
  }

  function wallsHtml() {
    const w = state.walls;
    if (!w) return "";
    if (!w.ok) return `<p class="flow-export-status fail">IV Walls: ${escapeHtml(w.error)}</p>`;
    const s = state.wallsStatus && state.wallsStatus.scoreboard;
    const pct = (v) => (v === null || v === undefined ? "–" : `${v}%`);
    const board = s
      ? `<span>Scoreboard <b>${s.graded}</b> graded${s.pending ? ` · ${s.pending} pending` : ""}</span>
         <span>Put wall held <b>${pct(s.put_wall_held_pct)}</b></span>
         <span>Call wall held <b>${pct(s.call_wall_held_pct)}</b></span>
         <span>Both <b>${pct(s.both_held_pct)}</b> <i>target ${s.target_both_pct}%</i></span>`
      : "";
    return `
      <div class="walls-card">
        <div class="walls-zone">
          <span class="walls-label">90% zone · ${escapeHtml(w.expiry)}</span>
          <span class="walls-range"><b class="put">${w.lower.toFixed(2)}</b> – <b class="call">${w.upper.toFixed(2)}</b></span>
          ${w.lower_nq ? `<span class="walls-nq">NQ ${w.lower_nq.toLocaleString()} – ${w.upper_nq.toLocaleString()}</span>` : ""}
        </div>
        <div class="flow-summary">
          <span>Put IV <b>${(w.iv_put * 100).toFixed(2)}%</b> × 1.85σ</span>
          <span>Call IV <b>${(w.iv_call * 100).toFixed(2)}%</b> × 1.55σ</span>
          <span>Spot <b>${w.spot.toFixed(2)}</b></span>
          ${board}
        </div>
      </div>`;
  }

  function flowPushStatusHtml() {
    const push = state.flowPush;
    if (!push.enabled && push.state !== "error") return "";
    if (push.state === "error") return `<p class="flow-export-status fail">Chart push: ${escapeHtml(push.detail)}</p>`;
    if (push.state === "pushed") return `<p class="flow-export-status ok">Chart push: ${escapeHtml(push.pushed_label)}</p>`;
    if (push.state === "idle") return `<p class="flow-export-status">Chart push: ${escapeHtml(push.detail)}</p>`;
    return `<p class="flow-export-status">Chart push: starting…</p>`;
  }

  // The push loop runs in Python (so it keeps going with the window hidden); the page
  // only mirrors its status, re-read on every flow refresh.
  async function refreshFlowPushStatus() {
    try {
      state.flowPush = await window.pywebview.api.get_flow_push_status();
    } catch (err) {
      /* status is cosmetic - keep the last known one */
    }
  }

  async function toggleFlowPush() {
    try {
      state.flowPush = await window.pywebview.api.set_flow_push(!state.flowPush.enabled);
    } catch (err) {
      state.flowPush = { enabled: false, state: "error", detail: String((err && err.message) || err), pushed_label: "" };
    }
    renderFlowKeepingScroll();
    // The first push lands a few seconds after switching on; pick its result up.
    if (state.flowPush.enabled) setTimeout(async () => { await refreshFlowPushStatus(); if (state.currentPage === "flow") renderFlowKeepingScroll(); }, 6000);
  }

  function flowExportStatusHtml() {
    const ex = state.flowExport;
    if (!ex) return "";
    if (ex.busy) return `<p class="flow-export-status">Pulling a fresh chain and building the script…</p>`;
    if (!ex.ok) return `<p class="flow-export-status fail">Export failed: ${escapeHtml(ex.error)}</p>`;
    const where = ex.copied ? "Copied to clipboard - paste into the Pine Editor." : "Clipboard copy failed - open the file instead.";
    return `<p class="flow-export-status ok">${ex.strikes} strikes exported. ${where} <a href="#" data-flow-export-reveal>Show file</a></p>`;
  }

  async function exportFlowPine() {
    state.flowExport = { busy: true };
    renderFlowKeepingScroll();
    try {
      state.flowExport = await window.pywebview.api.export_flow_pine();
    } catch (err) {
      state.flowExport = { ok: false, error: String((err && err.message) || err) };
    }
    if (state.currentPage === "flow") renderFlowKeepingScroll();
  }

  async function refreshFlow() {
    if (state.flowLoading) return;
    state.flowLoading = true;
    // A rejected bridge call must not leave flowLoading stuck true - that would
    // silently end every later poll at the guard above.
    try {
      state.flow = await window.pywebview.api.get_options_flow();
    } catch (err) {
      state.flow = { ok: false, error: String((err && err.message) || err) };
    } finally {
      state.flowLoading = false;
    }
    await refreshFlowPushStatus();
    await refreshWalls();
    if (state.currentPage !== "flow") return;
    renderFlowKeepingScroll();
  }

  // The walls are pulled off the NEXT session's board and cached ten minutes in Python,
  // so this rides the flow poll rather than running a timer of its own.
  async function refreshWalls() {
    try {
      state.walls = await window.pywebview.api.get_iv_walls();
      state.wallsStatus = await window.pywebview.api.get_walls_status();
    } catch (err) {
      state.walls = { ok: false, error: String((err && err.message) || err) };
    }
  }

  // Keep refreshes in place, but start at the visual overview on the first load.
  function renderFlowKeepingScroll() {
    const page = app.querySelector("[data-flow-page]");
    const scrollTop = page ? window.scrollY : null;
    render();
    const fresh = app.querySelector("[data-flow-page]");
    if (!fresh) return;
    if (scrollTop !== null) window.scrollTo(0, scrollTop);
    else window.scrollTo(0, 0);
  }

  // Polls only while the Flow page is showing, so the API allowance isn't spent
  // on a page nobody is looking at.
  function syncFlowPolling() {
    const shouldPoll = state.currentPage === "flow" && state.flowAuto;
    if (shouldPoll && !flowTimer) flowTimer = setInterval(refreshFlow, FLOW_REFRESH_MS);
    if (!shouldPoll && flowTimer) {
      clearInterval(flowTimer);
      flowTimer = null;
    }
  }

  // ---- GEX Walls (FreeFlow) ---------------------------------------------------
  // Dealer gamma/vanna/charm exposure (freeflow.py) - the dealer-POSITIONING data the
  // ladder above does not have at all (that's traded volume/premium, not exposure).
  // A separate pull, a separate poll timer, and a separate push toggle from the ladder's,
  // on purpose (design.md decision 1/7): a FreeFlow outage or bug here must never be able
  // to degrade the ladder or IV Walls sections above it.

  const GEX_REFRESH_MS = 60000;
  let gexTimer = null;
  const GEX_GROUPS = [
    { key: "sf", label: "Signed-Flow GEX", field: "sf_gex" },
    { key: "oi", label: "Settlement-OI GEX", field: "oi_gex" },
    { key: "eoi", label: "Estimated-OI GEX", field: "eoi_gex" },
  ];

  function fmtLevel(v) {
    return v === null || v === undefined || Number.isNaN(v) ? "–" : Number(v).toFixed(2);
  }

  // One GEX methodology block: status always shown; wall/flip/trigger only when the
  // methodology actually has them (an unavailable/calibrating status carries none).
  function gexMethodologyHtml(group, gex) {
    const g = gex[group.field] || {};
    const healthy = g.status && g.status !== "unavailable" && g.status !== "calibrating";
    return `
      <div class="gex-group${state.gexShow[group.key] ? "" : " gex-group-off"}${healthy ? "" : " gex-group-unhealthy"}">
        <div class="gex-group-head">
          <span class="gex-group-name">${escapeHtml(group.label)}</span>
          <span class="gex-group-status">${escapeHtml(g.status || "unknown")}</span>
        </div>
        ${
          healthy
            ? `<div class="flow-summary">
                <span>Call wall <b class="call">${fmtLevel(g.call_wall)}</b></span>
                <span>Put wall <b class="put">${fmtLevel(g.put_wall)}</b></span>
                <span>Gamma flip <b>${fmtLevel(g.gamma_flip)}</b></span>
                <span>Vol trigger <b>${fmtLevel(g.vol_trigger)}</b></span>
              </div>`
            : `<p class="gex-group-note">${escapeHtml(g.message || g.detail || "No levels for this methodology right now.")}</p>`
        }
      </div>`;
  }

  // Vanna Walls / Charm Zones share the same {call/put or positive/negative, peak, flip}
  // shape from /public/vanna-charm - one renderer for both, driven by a field map.
  function gexPointGroupHtml(key, label, data, fields) {
    const d = data || {};
    const point = (p) => (p && p.strike !== undefined ? fmtLevel(p.strike) : "–");
    return `
      <div class="gex-group${state.gexShow[key] ? "" : " gex-group-off"}${d.flip === undefined ? " gex-group-unhealthy" : ""}">
        <div class="gex-group-head">
          <span class="gex-group-name">${escapeHtml(label)}</span>
        </div>
        ${
          d.flip !== undefined
            ? `<div class="flow-summary">
                <span>${fields[0].label} <b class="call">${point(d[fields[0].key])}</b></span>
                <span>${fields[1].label} <b class="put">${point(d[fields[1].key])}</b></span>
                <span>Flip <b>${fmtLevel(d.flip)}</b></span>
              </div>`
            : `<p class="gex-group-note">No data for this expiry right now.</p>`
        }
      </div>`;
  }

  function gexPushStatusHtml() {
    const push = state.gexPush;
    if (!push.enabled && push.state !== "error") return "";
    if (push.state === "error") return `<p class="flow-export-status fail">GEX chart push: ${escapeHtml(push.detail)}</p>`;
    if (push.state === "pushed") return `<p class="flow-export-status ok">GEX chart push: ${escapeHtml(push.pushed_label)}</p>`;
    if (push.state === "idle") return `<p class="flow-export-status">GEX chart push: ${escapeHtml(push.detail)}</p>`;
    return `<p class="flow-export-status">GEX chart push: starting…</p>`;
  }

  function gexExportStatusHtml() {
    const ex = state.gexExport;
    if (!ex) return "";
    if (ex.busy) return `<p class="flow-export-status">Pulling fresh GEX and building the script…</p>`;
    if (!ex.ok) return `<p class="flow-export-status fail">Export failed: ${escapeHtml(ex.error)}</p>`;
    const where = ex.copied ? "Copied to clipboard - paste into the Pine Editor." : "Clipboard copy failed - open the file instead.";
    return `<p class="flow-export-status ok">${where} <a href="#" data-gex-export-reveal>Show file</a></p>`;
  }

  function gexIcon(size) {
    // Three staggered levels either side of a centre flip line - GEX walls in miniature.
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="2" y="11.3" width="20" height="1.4" rx="0.7" fill="#8a828a" />
        <rect x="12.5" y="3" width="9.5" height="2.4" rx="1" fill="#82b871" />
        <rect x="10" y="8" width="7" height="2.4" rx="1" fill="#82b871" />
        <rect x="12.5" y="13" width="5" height="2.4" rx="1" fill="#cf7f97" />
        <rect x="2" y="18" width="9.5" height="2.4" rx="1" fill="#cf7f97" />
      </svg>`;
  }

  function gexPageHtml() {
    const gex = state.gex;
    const groupToggle = (key, label) => `
      <button type="button" class="jrn-source-tab${state.gexShow[key] ? " active" : ""}" data-gex-toggle="${key}">${label}</button>`;
    const controls = `
      <div class="flow-controls">
        <label class="gex-source-picker">Regime source <select id="gex-source" aria-label="Regime source">${GEX_GROUPS.map(g=>`<option value="${g.key}" ${state.gexSource===g.key ? "selected" : ""}>${g.label}</option>`).join("")}</select></label>
        <button type="button" class="jrn-source-tab${state.gexAuto ? " active" : ""}" data-gex-auto>Auto ${GEX_REFRESH_MS / 1000}s</button>
        <button type="button" class="jrn-source-tab${state.gexPush.enabled ? " active" : ""}" data-gex-push title="Rewrite the GEX Walls chart study's Data input every minute through TradingView Desktop">Push to chart</button>
        <button type="button" class="btn" data-gex-refresh ${state.gexLoading ? "disabled" : ""}>${state.gexLoading ? "Pulling…" : "Refresh"}</button>
        <button type="button" class="btn" data-gex-export ${state.gexExport && state.gexExport.busy ? "disabled" : ""}>Export Pine</button>
      </div>
      ${gexExportStatusHtml()}
      ${gexPushStatusHtml()}`;

    const body = !gex
      ? `<p class="pane-empty">Pulling FreeFlow…</p>`
      : !gex.ok
        ? `<p class="pane-empty">${escapeHtml(gex.error)}</p>`
        : `
          ${window.IcarusOptionsCharts.regimeHtml(gex, state.gexSource)}
          <details class="gex-comparison" data-gex-disclosure="comparison"><summary>Compare methodologies & level map</summary>
          <div class="flow-controls gex-map-controls">${groupToggle("sf", "Signed-Flow")}${groupToggle("oi", "Settlement-OI")}${groupToggle("eoi", "Estimated-OI")}${groupToggle("vanna", "Vanna")}${groupToggle("charm", "Charm")}</div>
          ${window.IcarusOptionsCharts.gexHtml(gex, state.gexShow)}
          <h3 class="options-detail-heading">Methodology details</h3>
          <div class="gex-groups">
            ${GEX_GROUPS.map((g) => gexMethodologyHtml(g, gex)).join("")}
            ${gexPointGroupHtml("vanna", "Vanna Walls", gex.vanna_walls, [
              { key: "call_wall", label: "Call wall" },
              { key: "put_wall", label: "Put wall" },
            ])}
            ${gexPointGroupHtml("charm", "Charm Zones", gex.charm_zones, [
              { key: "positive_zone", label: "+ zone" },
              { key: "negative_zone", label: "− zone" },
            ])}
          </div></details>`;

    const subtitle = gex && gex.ok ? `${gex.underlying} ${gex.exp} · spot ${gex.spot ? gex.spot.toFixed(2) : "–"}` : "FreeFlow - dealer gamma/vanna/charm exposure";

    return `
      <div class="page" data-gex-page>
        ${pageHeaderHtml(gexIcon(30), "GEX Regimes & Levels", subtitle)}
        ${controls}
        ${body}
        <p class="flow-note">Dealer gamma exposure (3 methodologies), vanna walls, and charm zones from FreeFlow - separate pull, separate failure mode from the Options Flow page's LSE ladder.</p>
      </div>`;
  }

  async function refreshGex() {
    if (state.gexLoading) return;
    state.gexLoading = true;
    try {
      state.gex = await window.pywebview.api.get_gex_walls();
    } catch (err) {
      state.gex = { ok: false, error: String((err && err.message) || err) };
    } finally {
      state.gexLoading = false;
    }
    await refreshGexPushStatus();
    if (state.currentPage !== "gex") return;
    renderGexKeepingScroll();
  }

  async function refreshGexPushStatus() {
    try {
      state.gexPush = await window.pywebview.api.get_freeflow_push_status();
    } catch (err) {
      /* status is cosmetic - keep the last known one */
    }
  }

  async function toggleGexPush() {
    try {
      state.gexPush = await window.pywebview.api.set_freeflow_push(!state.gexPush.enabled);
    } catch (err) {
      state.gexPush = { enabled: false, state: "error", detail: String((err && err.message) || err), pushed_label: "" };
    }
    renderGexKeepingScroll();
    if (state.gexPush.enabled) setTimeout(async () => { await refreshGexPushStatus(); if (state.currentPage === "gex") renderGexKeepingScroll(); }, 6000);
  }

  async function exportGexPine() {
    state.gexExport = { busy: true };
    renderGexKeepingScroll();
    try {
      state.gexExport = await window.pywebview.api.export_gex_pine();
    } catch (err) {
      state.gexExport = { ok: false, error: String((err && err.message) || err) };
    }
    if (state.currentPage === "gex") renderGexKeepingScroll();
  }

  // render() replaces the DOM wholesale; keep the page where the user left it scrolled to.
  function renderGexKeepingScroll() {
    const page = app.querySelector("[data-gex-page]");
    const scrollTop = page ? window.scrollY : null;
    const expanded = new Set([...app.querySelectorAll("details[data-gex-disclosure][open]")].map(el=>el.dataset.gexDisclosure));
    render();
    app.querySelectorAll("details[data-gex-disclosure]").forEach(el=>{el.open=expanded.has(el.dataset.gexDisclosure);});
    const fresh = app.querySelector("[data-gex-page]");
    if (fresh && scrollTop !== null) window.scrollTo(0, scrollTop);
  }

  // Polls only while the GEX Walls page is showing and gexAuto is on - its own page, own
  // timer, own toggle, independent of the Options Flow page's ladder poll.
  function syncGexPolling() {
    const shouldPoll = state.currentPage === "gex" && state.gexAuto;
    if (shouldPoll && !gexTimer) gexTimer = setInterval(refreshGex, GEX_REFRESH_MS);
    if (!shouldPoll && gexTimer) {
      clearInterval(gexTimer);
      gexTimer = null;
    }
  }

  // ---- Page shell / nav ------------------------------------------------------

  // ---- Backtests page (visual replay of engine runs) ----------------------
  // A run is output/visual/<id>/run.json written by the engine's
  // visual_backtest.py: every trade carries its entry-time context (first-hour
  // anchor, rung ladder, stop, target, entry path). Clicking a trade pulls the
  // 1-min bars around it from the engine's cache and draws the rules on the
  // candles, so a wrong rung or a same-bar fill is visible at a glance.

  const ET_TZ = "America/New_York";
  const etFmt = new Intl.DateTimeFormat("en-US", { timeZone: ET_TZ, month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false });
  const etTime = new Intl.DateTimeFormat("en-US", { timeZone: ET_TZ, hour: "2-digit", minute: "2-digit", hour12: false });
  const etDay = new Intl.DateTimeFormat("en-US", { timeZone: ET_TZ, month: "short", day: "numeric" });
  function etStamp(iso) { return iso ? etFmt.format(new Date(iso)).replace(",", "") : ""; }
  // ET wall time -> unix seconds. Two passes handle the DST offset.
  function etWallToUnix(dateStr, h, m) {
    const [y, mo, d] = dateStr.split("-").map(Number);
    let guess = Date.UTC(y, mo - 1, d, h, m);
    for (let i = 0; i < 2; i++) {
      const parts = new Intl.DateTimeFormat("en-US", { timeZone: ET_TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date(guess));
      const g = {}; parts.forEach((p) => { g[p.type] = p.value; });
      const wall = Date.UTC(+g.year, +g.month - 1, +g.day, +g.hour % 24, +g.minute);
      guess += Date.UTC(y, mo - 1, d, h, m) - wall;
    }
    return Math.floor(guess / 1000);
  }
  const fmtPx = (v) => (v == null || Number.isNaN(v) ? "—" : Number(v).toFixed(2));
  const fmtUsd = (v) => (v == null ? "—" : (v < 0 ? "-" : "+") + "$" + Math.abs(v).toFixed(2));

  function backtestIcon(size) {
    // Candles with a level line through them.
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="4" y="7" width="3" height="8" rx="0.8" fill="#82b871" /><rect x="5.2" y="4" width="0.6" height="14" fill="#82b871" />
        <rect x="10.5" y="9" width="3" height="7" rx="0.8" fill="#d1453f" /><rect x="11.7" y="6" width="0.6" height="13" fill="#d1453f" />
        <rect x="17" y="5" width="3" height="9" rx="0.8" fill="#82b871" /><rect x="18.2" y="3" width="0.6" height="15" fill="#82b871" />
        <rect x="2" y="12.2" width="20" height="1.2" rx="0.6" fill="#cf7f97" />
      </svg>`;
  }

  async function loadBacktestRuns() {
    const res = await window.pywebview.api.list_backtest_runs();
    state.bt.runs = res.ok ? res.runs : [];
    state.bt.error = res.ok ? null : res.error;
    state.bt.running = !!res.running;
    if (!state.bt.runId && state.bt.runs.length) await selectBacktestRun(state.bt.runs[0].id, false);
    render();
  }

  async function selectBacktestRun(runId, rerender = true) {
    state.bt.runId = runId; state.bt.run = null; state.bt.tradeId = null; state.bt.bars = null;
    const res = await window.pywebview.api.get_backtest_run(runId);
    if (res.ok) state.bt.run = res.run; else state.bt.error = res.error;
    if (rerender) render();
  }

  async function selectBacktestTrade(tradeId) {
    const run = state.bt.run; if (!run) return;
    const t = run.trades.find((x) => x.id === tradeId); if (!t) return;
    state.bt.tradeId = tradeId; state.bt.bars = null; state.bt.loading = true; render();
    const entry = Math.floor(new Date(t.entry_ts).getTime() / 1000);
    const exit = t.exit_ts ? Math.floor(new Date(t.exit_ts).getTime() / 1000) : entry + 3600;
    const c = t.context || {};
    let start = entry - 90 * 60;
    if (c.session_date_et && c.fh_start_hm) start = Math.min(start, etWallToUnix(c.session_date_et, c.fh_start_hm[0], c.fh_start_hm[1]) - 15 * 60);
    const end = exit + 45 * 60;
    const iso = (s) => new Date(s * 1000).toISOString().replace(".000Z", "+00:00");
    const res = await window.pywebview.api.get_backtest_bars(run.symbol, run.resolution, iso(start), iso(end));
    state.bt.bars = res.ok ? res.bars : [];
    if (!res.ok) state.bt.error = res.error;
    state.bt.loading = false; render();
  }

  async function startBacktestRun() {
    const res = await window.pywebview.api.start_backtest_run(null);
    if (!res.ok) { state.bt.error = res.error; render(); return; }
    state.bt.running = true; render();
    const poll = async () => {
      const st = await window.pywebview.api.get_backtest_run_status();
      if (st.running) { setTimeout(poll, 1500); return; }
      state.bt.running = false;
      if (st.error) { state.bt.error = st.error; render(); return; }
      state.bt.runId = null; // pick up the newest run
      await loadBacktestRuns();
    };
    setTimeout(poll, 1500);
  }

  // Rule checks the chart makes obvious; listed so the eye has a place to start.
  function backtestTradeChecks(t, bars) {
    const c = t.context || {}; const out = [];
    const long = t.direction === "long"; const sgn = long ? 1 : -1;
    if (c.stop != null) out.push({ ok: sgn * (t.entry_price - c.stop) > 0, text: `Stop ${fmtPx(c.stop)} is on the correct side, ${Math.abs(t.entry_price - c.stop).toFixed(2)} pts away` });
    if (c.target != null) out.push({ ok: sgn * (c.target - t.entry_price) > 0, text: `Target ${fmtPx(c.target)} is on the correct side, ${Math.abs(c.target - t.entry_price).toFixed(2)} pts away` });
    if (c.entry_level_price != null) { const d = Math.abs(t.entry_price - c.entry_level_price); out.push({ ok: d <= 2.0, text: `Fill ${fmtPx(t.entry_price)} vs rung ${fmtPx(c.entry_level_price)}: ${d.toFixed(2)} pts` }); }
    const entryBar = bars && bars.find((b) => b.time === Math.floor(new Date(t.entry_ts).getTime() / 1000));
    if (entryBar && c.target != null) {
      const reached = long ? entryBar.high >= c.target : entryBar.low <= c.target;
      out.push({ ok: !reached, text: reached ? "Entry bar's range already covers the target: same-bar fill artifact risk" : "Target not inside the entry bar's range" });
    }
    if (entryBar && c.stop != null) {
      const hit = long ? entryBar.low <= c.stop : entryBar.high >= c.stop;
      out.push({ ok: !hit, text: hit ? "Entry bar's range already covers the stop" : "Stop not inside the entry bar's range" });
    }
    if (t.exit_reason && t.exit_price != null && c.stop != null && c.target != null) {
      const ref = t.exit_reason === "stop" ? c.stop : t.exit_reason === "target" ? c.target : null;
      if (ref != null) { const d = Math.abs(t.exit_price - ref); out.push({ ok: d <= 2.0, text: `Exit "${t.exit_reason}" at ${fmtPx(t.exit_price)} vs entry-time ${t.exit_reason} ${fmtPx(ref)}: ${d.toFixed(2)} pts${d > 2 ? " (moved after entry)" : ""}` }); }
    }
    if (c.fh_high != null && c.fh_low != null) out.push({ ok: true, text: `First hour ${fmtPx(c.fh_low)} – ${fmtPx(c.fh_high)} (range ${(c.fh_high - c.fh_low).toFixed(2)}), CE ${fmtPx(c.ce)}` });
    return out;
  }

  function backtestsPageHtml() {
    const bt = state.bt; const run = bt.run;
    const runOptions = (bt.runs || []).map((r) => `<option value="${r.id}" ${r.id === bt.runId ? "selected" : ""}>${escapeHtml(r.label || r.id)} · ${r.summary ? r.summary.trades + " trades, net " + fmtUsd(r.summary.net) : ""}</option>`).join("");
    const t = run && run.trades.find((x) => x.id === bt.tradeId);
    const c = (t && t.context) || {};
    const checks = t ? backtestTradeChecks(t, bt.bars) : [];
    return `<div class="page backtests-page">
      ${pageHeaderHtml(backtestIcon(22), "Backtests", "click a trade, see the rules it was judged against")}
      <div class="bt-toolbar">
        <select id="bt-run-select" ${bt.runs && bt.runs.length ? "" : "disabled"}>${runOptions || '<option value="">No runs yet</option>'}</select>
        <button type="button" class="btn" id="bt-run-btn" ${bt.running ? "disabled" : ""}>${bt.running ? "Running…" : "Run backtest"}</button>
        ${run ? `<span class="label">${escapeHtml(run.symbol)} ${escapeHtml(run.resolution)} · ${etDay.format(new Date(run.bars_from))} → ${etDay.format(new Date(run.bars_to))} · ${escapeHtml((run.config || "").replace(/^\\(C\\) /, ""))}</span>` : ""}
        ${bt.error ? `<span class="bt-error">${escapeHtml(bt.error)}</span>` : ""}
      </div>
      ${!bt.runs ? `<div class="label">Loading runs…</div>` : ""}
      ${run ? `
      <div class="bt-summary">
        ${[["Trades", run.summary.trades], ["Net", fmtUsd(run.summary.net)], ["Wins / losses", run.summary.wins + " / " + run.summary.losses], ["Profit factor", run.summary.profit_factor == null ? "∞" : run.summary.profit_factor], ["Max DD", "$" + run.summary.max_dd.toFixed(2)]].map(([k, v]) => `<div class="bt-stat"><span class="label">${k}</span><b>${v}</b></div>`).join("")}
      </div>
      <div class="bt-split">
        <div class="bt-trades">
          <table class="bt-table"><thead><tr><th>Entry (ET)</th><th>Mech</th><th>Dir</th><th>In</th><th>Out</th><th>Exit</th><th>Rung</th><th>P&amp;L</th></tr></thead><tbody>
            ${run.trades.map((x) => `<tr class="${x.id === bt.tradeId ? "active" : ""} ${x.pnl_dollars > 0 ? "win" : "loss"}" data-bt-trade="${x.id}">
              <td>${etStamp(x.entry_ts)}</td><td>${escapeHtml(x.tag)}${x.context && x.context.path ? `<span class="bt-path">${escapeHtml(x.context.path)}</span>` : ""}</td><td>${x.direction === "long" ? "L" : "S"}</td>
              <td>${fmtPx(x.entry_price)}</td><td>${fmtPx(x.exit_price)}</td><td>${escapeHtml(x.exit_reason || "")}</td><td>${x.level_mult == null ? "" : x.level_mult}</td><td class="${x.pnl_dollars > 0 ? "ok" : "bad"}">${fmtUsd(x.pnl_dollars)}</td></tr>`).join("")}
          </tbody></table>
        </div>
        <div class="bt-detail">
          ${t ? `
            <div class="bt-detail-head">
              <div><span class="editor-kicker">TRADE REVIEW · ${escapeHtml(run.symbol)}</span><h3>${escapeHtml(t.tag)} <span class="trade-direction">${escapeHtml(t.direction)}</span></h3><p>${etStamp(t.entry_ts)}${c.path ? " · " + escapeHtml(c.path) : ""}</p></div>
              <div class="trade-result ${t.pnl_dollars >= 0 ? "ok" : "bad"}"><span>Realized P&amp;L</span><strong>${fmtUsd(t.pnl_dollars)}</strong></div>
            </div>
            <div class="trade-facts">${[["Entry",fmtPx(t.entry_price)],["Exit",fmtPx(t.exit_price)],["Stop",c.stop == null ? "—" : fmtPx(c.stop)],["Target",c.target == null ? "—" : fmtPx(c.target)],["Exit reason",t.exit_reason || "—"]].map(([label,value]) => `<div><span>${escapeHtml(label)}</span><b>${escapeHtml(value)}</b></div>`).join("")}</div>
            <div id="bt-chart" class="bt-chart">${bt.loading ? '<div class="label" style="padding:14px">Loading bars…</div>' : ""}</div>
            <div class="bt-legend"><span><i style="background:var(--accent)"></i>entry rung</span><span><i style="background:var(--fail)"></i>stop</span><span><i style="background:var(--ok)"></i>target</span><span><i style="background:var(--border-bright)"></i>rungs</span><span><i style="background:var(--amber)"></i>first hour / CE</span></div>
            <div class="trade-check-heading">Rule checks</div><div class="bt-checks">${checks.map((k) => `<div class="bt-check ${k.ok ? "ok" : "bad"}"><span>${k.ok ? "✓" : "!"}</span>${escapeHtml(k.text)}</div>`).join("")}</div>
          ` : `<div class="label" style="padding:24px">Choose a trade from the table below to review its chart and rule checks.</div>`}
        </div>
      </div>` : ""}</div>`;
  }

  let btChart = null;
  function mountBacktestChart() {
    const el = document.getElementById("bt-chart");
    if (btChart) { try { btChart.remove(); } catch (e) { /* already gone */ } btChart = null; }
    if (!el || !state.bt.bars || !state.bt.bars.length || !window.LightweightCharts) return;
    const run = state.bt.run; const t = run.trades.find((x) => x.id === state.bt.tradeId); if (!t) return;
    const c = t.context || {};
    const computed = getComputedStyle(el);
    const color = (name) => computed.getPropertyValue(name).trim();
    el.innerHTML = "";
    const chart = window.LightweightCharts.createChart(el, {
      layout: { background: { color: "transparent" }, textColor: color("--text-dim"), fontFamily: "ui-monospace, Menlo, monospace", fontSize: 11 },
      grid: { vertLines: { color: color("--panel-alt") }, horzLines: { color: color("--panel-alt") } },
      rightPriceScale: { borderColor: color("--border-bright") },
      timeScale: { borderColor: color("--border-bright"), timeVisible: true, secondsVisible: false, tickMarkFormatter: (time) => etTime.format(new Date(time * 1000)) },
      localization: { timeFormatter: (time) => etStamp(new Date(time * 1000).toISOString()) },
      crosshair: { mode: 0 },
      handleScroll: true, handleScale: true,
    });
    const series = chart.addCandlestickSeries({ upColor: color("--ok"), downColor: color("--fail"), borderUpColor: color("--ok"), borderDownColor: color("--fail"), wickUpColor: color("--ok"), wickDownColor: color("--fail") });
    series.setData(state.bt.bars);
    const line = (price, color, title, style = 0, width = 1) => { if (price == null || Number.isNaN(price)) return; series.createPriceLine({ price, color, lineWidth: width, lineStyle: style, axisLabelVisible: true, title }); };
    (c.rungs || []).forEach((r) => { if (Math.abs(r.price - (c.entry_level_price ?? -1)) > 1e-6 && r.name !== "FH low" && r.name !== "FH high" && r.name !== "CE") line(r.price, color("--border-bright"), r.name, 1); });
    line(c.fh_high, color("--amber"), "FH high", 2); line(c.fh_low, color("--amber"), "FH low", 2); line(c.ce, color("--amber"), "CE", 3);
    line(c.entry_level_price, color("--accent"), "entry rung", 0, 2);
    line(c.stop, color("--fail"), "stop", 0, 2); line(c.target, color("--ok"), "target", 0, 2);
    const entry = Math.floor(new Date(t.entry_ts).getTime() / 1000);
    const exit = t.exit_ts ? Math.floor(new Date(t.exit_ts).getTime() / 1000) : null;
    const markers = [{ time: entry, position: t.direction === "long" ? "belowBar" : "aboveBar", color: color("--accent"), shape: t.direction === "long" ? "arrowUp" : "arrowDown", text: `${t.direction === "long" ? "Buy" : "Sell"} ${fmtPx(t.entry_price)}` }];
    if (exit) markers.push({ time: exit, position: t.direction === "long" ? "aboveBar" : "belowBar", color: t.pnl_dollars > 0 ? color("--ok") : color("--fail"), shape: "circle", text: `${t.exit_reason || "exit"} ${fmtPx(t.exit_price)}` });
    series.setMarkers(markers.filter((m) => state.bt.bars.some((b) => b.time === m.time)));
    chart.timeScale().fitContent();
    btChart = chart;
    const ro = new ResizeObserver(() => { if (btChart === chart) chart.applyOptions({ width: el.clientWidth, height: el.clientHeight }); });
    ro.observe(el);
  }

  // ---- Accounts page (Account Tracker) ---------------------------
  // The tracker is the single-file page account-tracker (C).html, embedded
  // in an iframe. With ?host=fleur it asks us for its data over postMessage
  // instead of using browser storage, and we keep that JSON on disk via the
  // Python API (see tracker.py).

  function trackerIcon(size) {
    // A payout ladder: three rungs climbing to a filled coin.
    return `
      <svg width="${size}" height="${size}" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <rect x="3" y="17" width="8" height="2.4" rx="1" fill="#8a828a" />
        <rect x="6" y="12" width="8" height="2.4" rx="1" fill="#cf7f97" />
        <rect x="9" y="7" width="8" height="2.4" rx="1" fill="#cf7f97" />
        <circle cx="19" cy="5" r="3" fill="#d98b4a" />
      </svg>`;
  }

  function trackerPageHtml() {
    const t = state.tracker;
    if (!t) return `<div class="tracker-missing">Loading the account tracker…</div>`;
    if (!t.ok) return `<div class="tracker-missing">${escapeHtml(t.error || "The tracker page could not be loaded.")}</div>`;
    return `<div class="tracker-page"><iframe id="tracker-frame" class="tracker-frame" src="${escapeHtml(t.url)}" title="Account Tracker"></iframe></div>`;
  }

  // Bridge: the embedded tracker posts {type:"fleur-tracker:load"} on boot and
  // {type:"fleur-tracker:save", json} on every change. Only the tracker frame
  // is answered; anything else posting here is ignored.
  window.addEventListener("message", async (event) => {
    const frame = document.getElementById("tracker-frame");
    if (!frame || event.source !== frame.contentWindow) return;
    const msg = event.data || {};
    if (msg.type === "icarus:tracker-height") {
      if (Number.isFinite(msg.height) && msg.height > 0 && msg.height < 1000000) frame.style.height = Math.ceil(msg.height) + "px";
    } else if (msg.type === "fleur-tracker:load") {
      event.source.postMessage({ type: "fleur:theme", theme: window.FleurAppearance.current() }, "*");
      event.source.postMessage({ type: "fleur-tracker:state", json: state.tracker ? state.tracker.data : null, catalog: state.ruleCatalog, program: state.trackerPlan }, "*");
      state.trackerPlan = "";
    } else if (msg.type === "icarus:show-rules") {
      state.ruleView = {firm:"",query:"",program:msg.program || ""};
      goToPage("rules");
    } else if (msg.type === "fleur-tracker:save" && typeof msg.json === "string") {
      if (state.tracker) state.tracker.data = msg.json;
      try {
        const result = await window.pywebview.api.save_tracker_data(msg.json);
        event.source.postMessage({ type: "fleur-tracker:saved", ok: !!(result && result.ok), error: result && result.error }, "*");
      } catch (err) {
        event.source.postMessage({ type: "fleur-tracker:saved", ok: false, error: String((err && err.message) || err) }, "*");
      }
    }
  });

  window.addEventListener("fleur-theme-change", () => {
    const theme = window.FleurAppearance.current();
    const select = document.getElementById("theme-select");
    if (select) select.value = theme;
    app.querySelectorAll("[data-theme-choice]").forEach(button => {
      button.classList.toggle("selected", button.dataset.themeChoice === theme);
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
    const frame = document.getElementById("tracker-frame");
    if (frame) frame.contentWindow.postMessage({ type: "fleur:theme", theme: window.FleurAppearance.current() }, "*");
    if (state.currentPage === "backtests") mountBacktestChart();
  });

  // (C) App preferences live outside the source tree; drafts survive background renders.
  function moonMark(size) {
    return `<svg class="moon-mark" width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="M25.8 21.4A12.4 12.4 0 0 1 11 5.1a12.4 12.4 0 1 0 14.8 16.3Z" fill="currentColor" fill-opacity=".13" stroke="currentColor" stroke-width="1.3"/><path d="m24 3 1 3 3 1-3 1-1 3-1-3-3-1 3-1Z" fill="currentColor"/></svg>`;
  }
  function brandMark(size, branding = state.settings?.branding || { logo: "icarus" }) {
    if (branding.logo === "icarus") return `<img class="brand-image icarus-mark" width="${size}" height="${size}" src="assets/icarus-falling%20(C).png" alt="" />`;
    if (branding.logo === "custom" && /^data:image\/(png|jpeg|webp);base64,/.test(branding.logo_image || "")) return `<img class="brand-image" width="${size}" height="${size}" src="${escapeHtml(branding.logo_image)}" alt="" />`;
    if (branding.logo === "sigil") return flowerMark(size);
    if (branding.logo === "star") return `<svg width="${size}" height="${size}" viewBox="0 0 32 32" fill="none" aria-hidden="true"><path d="m16 2 3.5 10.5L30 16l-10.5 3.5L16 30l-3.5-10.5L2 16l10.5-3.5Z" stroke="currentColor" stroke-width="1.3" fill="currentColor" fill-opacity=".12"/></svg>`;
    return moonMark(size);
  }
  function settingsIcon(size) {
    return `<svg width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><path d="M4 7h16M4 17h16"/><circle cx="9" cy="7" r="3" fill="var(--bg)"/><circle cx="16" cy="17" r="3" fill="var(--bg)"/></svg>`;
  }
  const FOLDER_LABELS = { notes: "Notes directory", personal_journal: "Personal journal", trade_journal: "Trade journal" };
  function settingsPageHtml() {
    const draft = state.settingsDraft;
    if (!draft) return '<div class="page"><p>Loading settings…</p></div>';
    const b = draft.branding;
    return `<div class="page settings-page">
      <div class="settings-heading"><div><span class="editor-kicker">MAKE ROOM FOR YOURSELF</span><h1>Settings</h1><p>Your space, your way.</p></div><button class="btn" type="button" id="settings-done">Back to dashboard</button></div>
      <form id="settings-form"><fieldset ${state.settingsBusy ? "disabled" : ""}>
      <section class="settings-section"><div class="settings-section-intro"><h2>Appearance</h2><p>Choose the atmosphere. Changes apply instantly.</p></div>
      <div class="theme-options">${[["fleur","Fleur","Pink glass"],["light","Light","Soft daylight"],["dark","Dark","Quiet slate"],["chrome","Chrome","Silver & ink"]].map(([key,label,sub]) => `<button type="button" data-theme-choice="${key}" class="theme-option ${window.FleurAppearance.current() === key ? "selected" : ""}" aria-pressed="${window.FleurAppearance.current() === key}"><span class="theme-swatch swatch-${key}"><i></i><i></i><i></i></span><strong>${label}</strong><small>${sub}</small></button>`).join("")}</div></section>
      <section class="settings-section"><div class="settings-section-intro"><h2>Identity</h2><p>A name and a small mark to call your own.</p></div>
        <div class="identity-fields"><div class="brand-preview">${brandMark(76,b)}<span>${b.show_title ? escapeHtml(b.title) : ""}</span></div><div class="identity-controls">
          <label for="dashboard-title">Dashboard name</label><input id="dashboard-title" maxlength="40" required value="${escapeHtml(b.title)}" />
          <label class="setting-check"><input id="show-dashboard-title" type="checkbox" ${b.show_title ? "checked" : ""}/>Show name beside logo</label>
          <label for="dashboard-logo">Logo</label><div class="logo-controls"><select id="dashboard-logo"><option value="icarus" ${b.logo === "icarus" ? "selected" : ""}>Icarus</option><option value="moon" ${b.logo === "moon" ? "selected" : ""}>Moon</option><option value="sigil" ${b.logo === "sigil" ? "selected" : ""}>Sigil</option><option value="star" ${b.logo === "star" ? "selected" : ""}>Star</option>${b.logo_image ? `<option value="custom" ${b.logo === "custom" ? "selected" : ""}>Custom image</option>` : ""}</select><label class="btn upload-logo">Upload image<input type="file" id="logo-file" accept="image/png,image/jpeg,image/webp" aria-label="Upload logo" /></label></div><small>PNG, JPEG or WebP · up to 1 MB</small>
        </div></div></section>
      <section class="settings-section"><div class="settings-section-intro"><h2>Your folders</h2><p>Connect your files. Changing a path doesn’t move or copy them.</p></div><div class="folder-fields">${Object.entries(FOLDER_LABELS).map(([key,label]) => `<div class="folder-setting"><label for="folder-${key}">${label}</label><div><input id="folder-${key}" data-folder-path="${key}" value="${escapeHtml(draft.paths[key])}" spellcheck="false" required /><button class="btn" type="button" data-browse-folder="${key}">Browse</button></div></div>`).join("")}<small>Journal entries use YYYY-MM-DD.md filenames. In the browser preview, paste a full folder path.</small><button type="button" class="text-button" id="restore-folders">Use default folders</button></div></section>
      <div class="settings-footer"><p id="settings-status" role="status">${escapeHtml(state.settingsMessage || "Saved only on this Mac. Your files stay private.")}</p><button class="primary" type="submit">${state.settingsBusy ? "Saving…" : "Save settings"}</button></div>
      </fieldset></form></div>`;
  }
  async function openSettings() {
    if (state.currentPage === "settings") return;
    await Promise.all([flushNoteSave(), flushJournalSave()]);
    state.settingsReturnPage = state.currentPage;
    state.settingsDraft = structuredClone(state.settings);
    state.settingsMessage = "";
    goToPage("settings");
  }
  function attachSettingsHandlers() {
    document.getElementById("settings-open").addEventListener("click", () => openSettings().catch(error => window.alert(error.message)));
    if (state.currentPage !== "settings") return;
    const draft = state.settingsDraft;
    const preview = () => { const el = app.querySelector(".brand-preview"); el.innerHTML = `${brandMark(76,draft.branding)}<span>${draft.branding.show_title ? escapeHtml(draft.branding.title) : ""}</span>`; };
    document.getElementById("settings-done").addEventListener("click", () => goToPage(state.settingsReturnPage));
    app.querySelectorAll("[data-theme-choice]").forEach(button => button.addEventListener("click", () => { window.FleurAppearance.apply(button.dataset.themeChoice); render(); }));
    document.getElementById("dashboard-title").addEventListener("input", event => { draft.branding.title = event.target.value; preview(); });
    document.getElementById("show-dashboard-title").addEventListener("change", event => { draft.branding.show_title = event.target.checked; preview(); });
    document.getElementById("dashboard-logo").addEventListener("change", event => { draft.branding.logo = event.target.value; preview(); });
    document.getElementById("logo-file").addEventListener("change", async event => {
      const file = event.target.files[0]; if (!file) return;
      if (file.size > 1048576 || !["image/png","image/jpeg","image/webp"].includes(file.type)) { state.settingsMessage = "Choose a PNG, JPEG or WebP under 1 MB."; render(); return; }
      try {
        const data = await new Promise((resolve,reject) => { const reader = new FileReader(); reader.onload = () => resolve(reader.result); reader.onerror = reject; reader.readAsDataURL(file); });
        draft.branding.logo_image = data; draft.branding.logo = "custom"; state.settingsMessage = "Logo ready. Save settings to apply it."; render();
      } catch (_) { state.settingsMessage = "That image could not be opened."; render(); }
    });
    app.querySelectorAll("[data-folder-path]").forEach(input => input.addEventListener("input", () => { draft.paths[input.dataset.folderPath] = input.value; }));
    app.querySelectorAll("[data-browse-folder]").forEach(button => button.addEventListener("click", async () => {
      try { const key = button.dataset.browseFolder; const result = await window.pywebview.api.choose_folder(draft.paths[key]); if (!result.ok) state.settingsMessage = result.error; else if (result.path) draft.paths[key] = result.path; }
      catch (error) { state.settingsMessage = error.message; } render();
    }));
    document.getElementById("restore-folders").addEventListener("click", () => { draft.paths = {...state.settings.defaults}; state.settingsMessage = "Default folders selected. Save to apply."; render(); });
    document.getElementById("settings-form").addEventListener("submit", async event => {
      event.preventDefault(); if (state.settingsBusy) return;
      state.settingsBusy = true; state.settingsMessage = "Saving…"; render();
      try {
        await Promise.all([flushNoteSave(), flushJournalSave()]);
        const result = await window.pywebview.api.save_settings(draft.paths, draft.branding);
        if (!result.ok) throw new Error(result.error);
        state.settings = result; state.settingsDraft = structuredClone(result);
        document.title = result.branding.title;
        state.noteEditorPath = null; state.noteEditorContent = null; state.noteEditorUrl = null;
        state.notesExpanded = {}; state.notesCreateInput = null; state.notesContextMenu = null;
        const [notes,journal] = await Promise.all([window.pywebview.api.get_notes_data(),window.pywebview.api.get_journal_data(state.journalSource)]);
        state.notes = notes; state.journal = journal; state.journalEntry = journal.today;
        state.settingsMessage = "Saved. Your folders and identity are up to date.";
      } catch (error) { state.settingsMessage = error.message || "Could not save settings. Try again."; }
      finally { state.settingsBusy = false; render(); }
    });
  }

  const PAGES = {
    settings: { label: "Settings", html: settingsPageHtml },
    home: { label: "Home", html: homePageHtml },
    crew: { label: "Automations", icon: libraryIcon, html: libraryPageHtml },
    running: { label: "Running", html: runningPageHtml },
    awaiting: { label: "Awaiting Feedback", html: awaitingPageHtml },
    outputs: { label: "Outputs", html: outputsPageHtml },
    errors: { label: "Errors", html: errorsPageHtml },
    journal: { label: "Journal", icon: journalIcon, html: journalPageHtml },
    notes: { label: "Notes", icon: notesIcon, html: notesPageHtml },
    flow: { label: "Options Flow", icon: flowIcon, html: flowPageHtml },
    gex: { label: "GEX Walls", icon: gexIcon, html: gexPageHtml },
    rules: { label: "Firm rules", html: () => window.IcarusRules.html(state.ruleCatalog, state.ruleView) },
    tracker: { label: "Accounts", icon: trackerIcon, html: trackerPageHtml },
    backtests: { label: "Backtests", icon: backtestIcon, html: backtestsPageHtml },
  };
  // Running/Awaiting/Outputs/Errors/Home are reached via the header stat
  // badges or the brand-mark icon, not the main page-nav icon row - only
  // these get an icon button there.
  const MAIN_NAV_KEYS = ["crew", "journal", "notes", "flow", "gex", "tracker", "backtests"];

  function goToPage(key) {
    if (key === state.currentPage) return;
    window.ReadAloud.stop(); // leaving the page takes its read-aloud bar with it
    state.currentPage = key;
    render();
    window.scrollTo(0, 0);
    syncFlowPolling();
    syncGexPolling();
    if (key === "flow") {
      refreshFlow(); // Keep the visual overview visible while the snapshot refreshes.
    }
    if (key === "gex") refreshGex(); // own page, own pull, separate failure mode from the ladder
    if (key === "backtests" && !state.bt.runs) loadBacktestRuns();
  }

  function counts() {
    const c = { running: 0, awaiting: 0, success: 0, failed: 0 };
    state.crews.forEach((crew) => {
      if (!crew.valid) return;
      const eff = effectiveStatus(crew.id);
      if (eff === "running") c.running += 1;
      else if (eff === "awaiting") c.awaiting += 1;
      else if (eff === "success") c.success += 1;
      else if (eff === "failed") c.failed += 1;
    });
    return c;
  }

  function render() {
    const c = counts();
    const workflow = activeWorkflow();
    if (state.currentPage !== "settings") lastWorkflowPage[workflow] = state.currentPage;
    app.innerHTML = `
      <div class="app-shell workflow-shell" data-active-workflow="${workflow}">
        <div class="topnav pywebview-drag-region">
          <span class="compact-brand">${brandMark(34)}${state.settings?.branding.show_title !== false ? `<span>${escapeHtml(state.settings?.branding.title || "Icarus")}</span>` : ""}</span>
          <nav class="workflow-switch" aria-label="Workspaces">${Object.entries(WORKFLOWS).map(([key, w]) => `<button type="button" data-workflow="${key}" class="${key === workflow ? "active" : ""}" ${key === workflow ? 'aria-current="true"' : ''}>${w.label}</button>`).join("")}</nav>
          <label class="theme-picker"><span class="theme-dot" aria-hidden="true"></span><select aria-label="Color theme" id="theme-select">${[["fleur","Fleur"],["light","Light"],["dark","Dark"],["chrome","Chrome"]].map(([value,label]) => `<option value="${value}" ${window.FleurAppearance.current() === value ? "selected" : ""}>${label}</option>`).join("")}</select></label><button class="settings-open" id="settings-open" type="button" aria-label="Settings" title="Settings">${settingsIcon(19)}</button>
        </div>
        ${state.currentPage !== "settings" ? `<div class="workflow-header">
          <div class="workflow-stats" aria-label="${WORKFLOWS[workflow].label} overview">${workflowTiles(workflow, c)}</div>
          <div class="workflow-navigation"><nav class="workflow-pages" aria-label="${WORKFLOWS[workflow].label} pages">${WORKFLOWS[workflow].pages.map((key) => pageNavItem(key, key === "crew" ? "Automations" : key === "awaiting" ? "Feedback" : undefined)).join("")}</nav>${pageStepperHtml()}</div>
        </div>
        ` : ""}
        <main class="page-area workflow-content" data-view="${state.currentPage}" aria-label="${escapeHtml(PAGES[state.currentPage].label)}">${PAGES[state.currentPage].html()}</main>
      </div>
      ${runModalHtml()}
      ${contextMenuHtml()}
    `;
    attachHandlers();
    window.IcarusOptionsCharts.attach(app);
    if (state.currentPage === "backtests") { mountBacktestChart(); attachBacktestHandlers(); }
  }

  function attachRulesHandlers() {
    const firm = document.getElementById("rules-firm");
    if (!firm) return;
    firm.addEventListener("change", () => {state.ruleView.firm = firm.value; state.ruleView.program = ""; render();});
    const search = document.getElementById("rules-search");
    search.addEventListener("input", () => {
      const position = search.selectionStart;
      state.ruleView.query = search.value; render();
      const next = document.getElementById("rules-search"); next.focus(); next.setSelectionRange(position,position);
    });
    app.querySelectorAll("[data-rules-plan]").forEach(button => button.addEventListener("click", () => {
      const scroll = document.querySelector(".rules-plans").scrollTop;
      state.ruleView.program = button.dataset.rulesPlan; render();
      document.querySelector(".rules-plans").scrollTop = scroll;
    }));
    document.getElementById("rules-add-account")?.addEventListener("click", event => {
      state.trackerPlan = event.currentTarget.dataset.program; goToPage("tracker");
    });
  }

  function attachBacktestHandlers() {
    const sel = document.getElementById("bt-run-select");
    if (sel) sel.addEventListener("change", () => selectBacktestRun(sel.value));
    const runBtn = document.getElementById("bt-run-btn");
    if (runBtn) runBtn.addEventListener("click", startBacktestRun);
    app.querySelectorAll("[data-bt-trade]").forEach((row) => row.addEventListener("click", () => selectBacktestTrade(Number(row.dataset.btTrade))));
  }

  function attachHandlers() {
    attachAutomationHandlers();
    attachSettingsHandlers();
    attachRulesHandlers();
    document.getElementById("theme-select").addEventListener("change", (event) => window.FleurAppearance.apply(event.target.value));
    app.querySelectorAll("[data-page-step]").forEach((button) => {
      button.addEventListener("click", () => stepPage(Number(button.dataset.pageStep)));
    });
    app.querySelectorAll("[data-workflow]").forEach((button) => {
      button.addEventListener("click", () => switchWorkflow(button.dataset.workflow));
    });
    // Every render() replaces app.innerHTML wholesale, so any read-aloud bar
    // wired on the previous render is gone - drop its subscription before
    // (re)wiring whichever bar (if any) is present now. Only one of the two
    // panes' bars can exist at a time, since they're on different pages.
    if (readAloudUnsubscribe) {
      readAloudUnsubscribe();
      readAloudUnsubscribe = null;
    }
    const outputReadAloudBar = app.querySelector('[data-read-aloud="output"]');
    if (outputReadAloudBar) {
      wireReadAloudBar(outputReadAloudBar, () => document.querySelector(".output-preview-markdown, .output-preview-text"));
    }
    // PDFs render inline, but Preview.app gives real page navigation and zoom.
    const pdfOpenBtn = app.querySelector("#note-pdf-open-btn");
    if (pdfOpenBtn) {
      pdfOpenBtn.addEventListener("click", () => {
        if (state.noteEditorPath) window.pywebview.api.open_output_file(state.noteEditorPath);
      });
    }

    const notesReadAloudBar = app.querySelector('[data-read-aloud="notes"]');
    if (notesReadAloudBar) {
      wireReadAloudBar(notesReadAloudBar, () => {
        const field = document.getElementById("note-editor-rich-field");
        // Image-embed chips have real text nodes inside them (the "×" delete
        // button) that aren't reading content - mark them ignored right
        // before each read starts (see IGNORE_ATTR in vendor/read-aloud.js).
        if (field) field.querySelectorAll(".rich-image-chip").forEach((chip) => chip.setAttribute(window.ReadAloud.IGNORE_ATTR, "true"));
        return field;
      });
    }

    app.querySelectorAll(".nav-item").forEach((btn) => {
      btn.addEventListener("click", () => goToPage(btn.dataset.page));
    });

    app.querySelectorAll("[data-flow-metric]").forEach((btn) => {
      btn.addEventListener("click", () => {
        const key = btn.dataset.flowMetric === "prem" ? "flowShowPrem" : "flowShowVol";
        const other = key === "flowShowPrem" ? "flowShowVol" : "flowShowPrem";
        // Turning the last one off would leave a ladder with no bars, so that click is a
        // no-op rather than a disabled-looking button.
        if (state[key] && !state[other]) return;
        state[key] = !state[key];
        renderFlowKeepingScroll();
      });
    });
    const flowAutoBtn = app.querySelector("[data-flow-auto]");
    if (flowAutoBtn) {
      flowAutoBtn.addEventListener("click", () => {
        state.flowAuto = !state.flowAuto;
        syncFlowPolling();
        renderFlowKeepingScroll();
      });
    }
    const flowRefreshBtn = app.querySelector("[data-flow-refresh]");
    if (flowRefreshBtn) flowRefreshBtn.addEventListener("click", refreshFlow);
    const flowPushBtn = app.querySelector("[data-flow-push]");
    if (flowPushBtn) flowPushBtn.addEventListener("click", toggleFlowPush);
    const flowExportBtn = app.querySelector("[data-flow-export]");
    if (flowExportBtn) flowExportBtn.addEventListener("click", exportFlowPine);
    const flowExportReveal = app.querySelector("[data-flow-export-reveal]");
    if (flowExportReveal) {
      flowExportReveal.addEventListener("click", (event) => {
        event.preventDefault();
        window.pywebview.api.reveal_output_file(state.flowExport.path);
      });
    }

    app.querySelectorAll("[data-gex-toggle]").forEach((btn) => {
      btn.addEventListener("click", () => {
        // Toggling only changes what's drawn/shown - it never re-pulls or affects what
        // the push loop writes to the chart (design.md decision 8, spec scenario
        // "Toggling a group does not affect what is pushed").
        const key = btn.dataset.gexToggle;
        state.gexShow[key] = !state.gexShow[key];
        renderGexKeepingScroll();
      });
    });
    const gexSource = app.querySelector("#gex-source");
    if (gexSource) gexSource.addEventListener("change", event => {
      state.gexSource = event.target.value;
      renderGexKeepingScroll();
    });
    const gexAutoBtn = app.querySelector("[data-gex-auto]");
    if (gexAutoBtn) {
      gexAutoBtn.addEventListener("click", () => {
        state.gexAuto = !state.gexAuto;
        syncGexPolling();
        renderGexKeepingScroll();
      });
    }
    const gexRefreshBtn = app.querySelector("[data-gex-refresh]");
    if (gexRefreshBtn) gexRefreshBtn.addEventListener("click", refreshGex);
    const gexPushBtn = app.querySelector("[data-gex-push]");
    if (gexPushBtn) gexPushBtn.addEventListener("click", toggleGexPush);
    const gexExportBtn = app.querySelector("[data-gex-export]");
    if (gexExportBtn) gexExportBtn.addEventListener("click", exportGexPine);
    const gexExportReveal = app.querySelector("[data-gex-export-reveal]");
    if (gexExportReveal) {
      gexExportReveal.addEventListener("click", (event) => {
        event.preventDefault();
        window.pywebview.api.reveal_output_file(state.gexExport.path);
      });
    }

    app.querySelectorAll("[data-status-page]").forEach((el) => {
      el.addEventListener("click", () => goToPage(el.dataset.statusPage));
    });

    // Home's quick-action buttons - plain navigation.
    app.querySelectorAll("[data-home-action]").forEach((btn) => {
      btn.addEventListener("click", () => goToPage(btn.dataset.homeAction));
    });

    // Home's Recent Outputs rows: jump to Outputs with that file already
    // selected, rather than just landing on an empty preview pane.
    app.querySelectorAll("[data-home-output-file]").forEach((row) => {
      row.addEventListener("click", () => {
        selectOutputFile(row.dataset.homeOutputFile);
        goToPage("outputs");
      });
    });

    // Home's Recent Notes rows: jump to Notes with that note already open.
    app.querySelectorAll("[data-home-note-file]").forEach((row) => {
      row.addEventListener("click", () => {
        openNoteEditor(row.dataset.homeNoteFile, row.dataset.homeNoteTitle);
        goToPage("notes");
      });
    });

    app.querySelectorAll("[data-open-file]").forEach((head) => {
      head.addEventListener("click", () => openOutputFile(head.dataset.openFile));
    });

    app.querySelectorAll("[data-reveal-file]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        revealOutputFile(btn.dataset.revealFile);
      });
    });

    // Whole title row is clickable, not just the caret - the caret is a
    // hover-only visual hint (see .home-section-toggle in dashboard.css).
    app.querySelectorAll("[data-home-section-toggle]").forEach((row) => {
      row.addEventListener("click", () => toggleHomeSection(row.dataset.homeSectionToggle));
    });

    app.querySelectorAll("[data-focus-awaiting]").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.focusAwaiting;
        state.focusedAwaitingId = state.focusedAwaitingId === id ? null : id;
        render();
      });
    });

    app.querySelectorAll("[data-focus-error]").forEach((row) => {
      row.addEventListener("click", () => {
        const id = row.dataset.focusError;
        state.focusedErrorId = state.focusedErrorId === id ? null : id;
        render();
      });
    });

    app.querySelectorAll("[data-chip-crew-id]").forEach((chip) => {
      chip.addEventListener("click", () => onChipClick(chip.dataset.chipCrewId));
    });

    app.querySelectorAll("[data-customize-crew-id]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        onCustomizeClick(btn.dataset.customizeCrewId);
      });
    });

    app.querySelectorAll("[data-output-toggle]").forEach((row) => {
      row.addEventListener("click", () => {
        toggleOutputNode(row.dataset.outputToggle, row.dataset.outputToggleCrew === "true");
      });
    });

    app.querySelectorAll("[data-output-file]").forEach((row) => {
      row.addEventListener("click", () => selectOutputFile(row.dataset.outputFile));
    });

    app.querySelectorAll("[data-stop-crew-id]").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        event.stopPropagation();
        stopCrew(btn.dataset.stopCrewId);
      });
    });

    app.querySelectorAll(".jrn-section .rich-field[data-journal-section-key]").forEach((container) => {
      const key = container.dataset.journalSectionKey;
      createRichField(container, {
        getValue: () => (state.journalEntry.sections || {})[key] || "",
        onChange: (text) => {
          if (!state.journalEntry.sections) state.journalEntry.sections = {};
          state.journalEntry.sections[key] = text;
          scheduleJournalSave();
        },
      });
    });

    app.querySelectorAll("[data-journal-date]").forEach((row) => {
      row.addEventListener("click", () => loadJournalEntry(row.dataset.journalDate));
    });

    app.querySelectorAll("[data-journal-source]").forEach((btn) => {
      btn.addEventListener("click", () => loadJournalSource(btn.dataset.journalSource));
    });

    const backToTodayBtn = document.getElementById("journal-back-to-today");
    if (backToTodayBtn) {
      backToTodayBtn.addEventListener("click", () => loadJournalEntry(state.journal.today.date));
    }

    app.querySelectorAll('[data-tree-kind="file"]').forEach((row) => {
      row.addEventListener("click", () => openNoteEditor(row.dataset.notePath, row.dataset.noteTitle, row.dataset.noteDoctype));
      row.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        openContextMenu(event.clientX, event.clientY, "file", {
          filePath: row.dataset.notePath,
          fileName: row.dataset.noteTitle,
          docType: row.dataset.noteDoctype || "md",
        });
      });
      row.addEventListener("dragstart", (event) => {
        event.dataTransfer.setData("text/plain", JSON.stringify({ path: row.dataset.notePath, kind: "file" }));
        event.dataTransfer.effectAllowed = "move";
      });
    });

    app.querySelectorAll('[data-tree-kind="folder"]').forEach((row) => {
      if (row.dataset.treeToggle) {
        row.addEventListener("click", () => toggleTreeNode(row.dataset.treeToggle, false));
        row.addEventListener("contextmenu", (event) => {
          event.preventDefault();
          openContextMenu(event.clientX, event.clientY, "folder", {
            folderPath: row.dataset.treeToggle,
            folderName: row.querySelector(".notes-tree-label").textContent,
            category: row.dataset.treeCategory,
          });
        });
        row.addEventListener("dragstart", (event) => {
          event.dataTransfer.setData("text/plain", JSON.stringify({ path: row.dataset.treeToggle, kind: "folder" }));
          event.dataTransfer.effectAllowed = "move";
        });
        row.addEventListener("dragover", (event) => {
          event.preventDefault();
          row.classList.add("drop-target-active");
        });
        row.addEventListener("dragleave", () => row.classList.remove("drop-target-active"));
        row.addEventListener("drop", (event) => {
          event.preventDefault();
          row.classList.remove("drop-target-active");
          handleTreeDrop(event.dataTransfer.getData("text/plain"), row.dataset.dropTargetPath, null);
        });
      }
    });

    app.querySelectorAll('[data-tree-kind="category"]').forEach((row) => {
      row.addEventListener("click", () => toggleTreeNode(row.dataset.treeToggle, true));
      row.addEventListener("contextmenu", (event) => {
        event.preventDefault();
        openContextMenu(event.clientX, event.clientY, "category", { category: row.dataset.dropTargetCategory });
      });
      row.addEventListener("dragover", (event) => {
        event.preventDefault();
        row.classList.add("drop-target-active");
      });
      row.addEventListener("dragleave", () => row.classList.remove("drop-target-active"));
      row.addEventListener("drop", (event) => {
        event.preventDefault();
        row.classList.remove("drop-target-active");
        handleTreeDrop(event.dataTransfer.getData("text/plain"), null, row.dataset.dropTargetCategory);
      });
    });

    const newCategoryBtn = document.getElementById("notes-new-category-btn");
    if (newCategoryBtn) {
      newCategoryBtn.addEventListener("click", () => beginCreateCategory());
    }

    app.querySelectorAll(".context-menu-item").forEach((btn) => {
      btn.addEventListener("click", () => {
        const menu = state.notesContextMenu;
        if (!menu) return;
        const action = btn.dataset.menuAction;
        if (action === "new-note" || action === "new-blank-note" || action === "new-folder") {
          const kind = action === "new-folder" ? "folder" : "note";
          const blank = action === "new-blank-note";
          if (menu.kind === "category") {
            beginCreate(kind, menu.category, menu.category, null, blank);
          } else {
            beginCreate(kind, menu.category, menu.folderPath, menu.folderPath, blank);
          }
        } else if (action === "rename") {
          if (menu.kind === "file") {
            beginRename("file", menu.filePath, menu.fileName);
          } else if (menu.kind === "folder") {
            beginRename("folder", menu.folderPath, menu.folderName);
          }
        } else if (action === "delete") {
          state.notesContextMenu = null;
          render();
          if (menu.kind === "file") {
            deleteNote(menu.filePath, menu.fileName);
          } else if (menu.kind === "folder") {
            deleteFolder(menu.folderPath, menu.folderName);
          } else if (menu.kind === "category") {
            deleteCategory(menu.category);
          }
        }
      });
    });

    const createInputEl = document.getElementById("notes-tree-create-input");
    if (createInputEl) {
      createInputEl.focus();
      createInputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submitCreate();
        else if (event.key === "Escape") cancelCreate();
      });
      createInputEl.addEventListener("blur", () => submitCreate());
    }

    const renameInputEl = document.getElementById("notes-tree-rename-input");
    if (renameInputEl) {
      renameInputEl.focus();
      renameInputEl.select();
      renameInputEl.addEventListener("keydown", (event) => {
        if (event.key === "Enter") submitRename();
        else if (event.key === "Escape") cancelRename();
      });
      renameInputEl.addEventListener("blur", () => submitRename());
    }

    const noteRichFieldEl = document.getElementById("note-editor-rich-field");
    if (noteRichFieldEl) {
      // Registered before createRichField's own keydown handlers, so this
      // runs first: stop-and-unwrap happens before the browser applies the
      // keystroke to the contenteditable DOM, so domToLines() never has to
      // reason about reader-injected <span>s (dashboard-notes-page spec:
      // reading must not affect saved content, and must stop before the
      // keystroke lands).
      noteRichFieldEl.addEventListener("keydown", () => {
        if (window.ReadAloud.getState().active) window.ReadAloud.stop();
      });
      createRichField(noteRichFieldEl, {
        getValue: () => state.noteEditorContent || "",
        onChange: (text) => {
          state.noteEditorContent = text;
          scheduleNoteSave(state.noteEditorPath);
        },
      });
    }

    app.querySelectorAll(".feedback-form").forEach((form) => {
      form.addEventListener("submit", (event) => {
        event.preventDefault();
        submitFeedback(form.dataset.crewId, form);
      });
    });

    const runModalForm = document.getElementById("run-modal-form");
    if (runModalForm) {
      runModalForm.addEventListener("submit", (event) => {
        event.preventDefault();
        submitRunModal(state.runModalCrewId);
      });
    }
    const cancelBtn = document.getElementById("run-modal-cancel");
    if (cancelBtn) {
      cancelBtn.addEventListener("click", () => {
        state.runModalCrewId = null;
        render();
      });
    }
    const overlay = document.getElementById("run-modal-overlay");
    if (overlay) {
      overlay.addEventListener("click", (event) => {
        if (event.target === overlay) {
          state.runModalCrewId = null;
          render();
        }
      });
    }

    const searchInput = document.getElementById("notes-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", () => {
        state.notesSearch = searchInput.value;
        render();
      });
      searchInput.addEventListener("focus", () => {
        state.notesSearchFocused = true;
      });
      searchInput.addEventListener("blur", () => {
        state.notesSearchFocused = false;
      });
      if (state.notesSearchFocused) {
        searchInput.focus();
        const pos = searchInput.value.length;
        searchInput.setSelectionRange(pos, pos);
      }
    }

  }

  // ---- Actions ------------------------------------------------------------

  // Starts a run for crewId with the given inputs - shared by the
  // click-to-run path (defaults) and the Customize modal's submit
  // (edited values). If a run is already active for it, the backend
  // rejects a second one and that surfaces as the usual error banner,
  // same as any other failed-to-start case.
  async function startRun(crewId, inputs) {
    state.status[crewId] = "running";
    state.awaitingInput[crewId] = false;
    state.errors[crewId] = null;
    state.liveLabel[crewId] = "Starting…";
    state.recentLines[crewId] = [];
    render();

    const result = await window.pywebview.api.run_automation(crewId, inputs);
    if (!result.started) {
      state.status[crewId] = "failed";
      state.errors[crewId] = result.error || "Could not start run";
      render();
    }
  }

  // Clicking a valid crew in the Library always opens the input form first,
  // so every crew asks for its inputs before running - a crew run silently
  // on blank/stale defaults (e.g. an empty major, or a leftover location
  // from a previous topic) was the actual dashboard bug this fixes. The
  // form still pre-fills each field's configured default; the gear icon is
  // just a second way to reach the same modal.
  function onChipClick(crewId) {
    onCustomizeClick(crewId);
  }

  function onCustomizeClick(crewId) {
    const crew = getCrew(crewId);
    if (!crew || !crew.valid) return;
    state.runModalCrewId = crewId;
    render();
  }

  async function submitRunModal(crewId) {
    const crew = getCrew(crewId);
    if (!crew) return;
    const inputs = {};
    crew.inputs.forEach((field) => {
      const el = document.getElementById(`field-${field.name}`);
      inputs[field.name] = el ? el.value : field.default || "";
    });

    state.runModalCrewId = null;
    await startRun(crewId, inputs);
  }

  async function stopCrew(crewId) {
    state.stopping[crewId] = true;
    render();
    const result = await window.pywebview.api.stop_run(crewId);
    if (!result.stopped) {
      // Nothing was there to stop (e.g. it had already finished) - no
      // runFinished() is coming to clear the pending flag, so clear it now.
      delete state.stopping[crewId];
      render();
    }
  }

  function openOutputFile(path) {
    window.pywebview.api.open_output_file(path);
  }

  function revealOutputFile(path) {
    window.pywebview.api.reveal_output_file(path);
  }

  async function submitFeedback(crewId, form) {
    const textEl = form.querySelector("textarea");
    const text = textEl ? textEl.value : "";
    state.awaitingInput[crewId] = false;
    render();
    await window.pywebview.api.send_input(crewId, text);
  }

  // ---- Bridge from js_api.py (pushed live from a background thread) -----

  const RECENT_LINES_CAP = 200;

  function appendLog(crewId, line) {
    state.status[crewId] = "running";
    state.liveLabel[crewId] = line;
    if (!state.recentLines[crewId]) state.recentLines[crewId] = [];
    state.recentLines[crewId].push(line);
    if (state.recentLines[crewId].length > RECENT_LINES_CAP) state.recentLines[crewId].shift();
    render();
  }

  function awaitingInput(crewId) {
    state.awaitingInput[crewId] = true;
    state.awaitingPrompt[crewId] = (state.recentLines[crewId] || []).slice(-15).join("\n");
    render();
  }

  function runFinished(crewId, success, payload) {
    delete state.stopping[crewId];

    if (!success && payload && payload.stopped) {
      // User-initiated stop - back to idle, not an error.
      delete state.status[crewId];
      state.awaitingInput[crewId] = false;
      state.awaitingPrompt[crewId] = "";
      state.errors[crewId] = null;
      state.liveLabel[crewId] = "";
      state.recentLines[crewId] = [];
      render();
      return;
    }

    state.awaitingInput[crewId] = false;
    state.status[crewId] = success ? "success" : "failed";
    state.errors[crewId] = success ? null : payload.error || "Run failed";
    render();
    if (success) refreshOutputsTree(); // new run output just landed on disk - pick it up without waiting for a page revisit
  }

  window.crewDashboard = { appendLog, runFinished, awaitingInput };

  async function init() {
    const [crews, journal, notes, outputsTree, mediaImagesDir, tracker, settings, catalog] = await Promise.all([
      window.pywebview.api.list_automations(),
      window.pywebview.api.get_journal_data(state.journalSource),
      window.pywebview.api.get_notes_data(),
      window.pywebview.api.get_outputs_tree(),
      window.pywebview.api.get_media_images_dir(),
      window.pywebview.api.get_tracker_info(),
      window.pywebview.api.get_settings(),
      window.pywebview.api.get_prop_firm_rules().catch(() => null),
    ]);
    state.ruleCatalog = catalog;
    state.settings = settings;
    document.title = settings.branding.title;
    state.tracker = tracker;
    state.crews = crews;
    state.journal = journal;
    state.journalEntry = journal.today;
    state.notes = notes;
    state.outputsTree = outputsTree;
    state.mediaImagesDir = mediaImagesDir;
    render();
    if (window.icarusBrowserPreview && !previewEventTimer) pollPreviewEvents();
  }

  let previewEventTimer = null, previewEventSequence = 0;
  async function pollPreviewEvents() {
    try {
      const events = await window.pywebview.api.get_run_events(previewEventSequence);
      for (const event of events) {
        if (event.sequence <= previewEventSequence) continue;
        previewEventSequence = event.sequence;
        ({appendLog,runFinished,awaitingInput})[event.kind]?.(...event.args);
      }
    } catch (_) { /* The next poll recovers after a preview-server restart. */ }
    previewEventTimer = setTimeout(pollPreviewEvents, 1000);
  }
  window.FleurSwipe.install(app, stepPage);
  window.addEventListener("pywebviewready", init);
})();
