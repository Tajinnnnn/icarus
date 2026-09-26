/* (C) Public, sourced plan reference. Narrative rules never imply payout approval. */
(function (root) {
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function search(catalog, query = '', firmId = '') {
    const terms = query.toLowerCase().trim().split(/\s+/).filter(Boolean);
    return (catalog?.firms || []).filter(f => !firmId || f.id === firmId).flatMap(firm => firm.programs.map(program => ({firm, program})))
      .filter(({firm,program}) => terms.every(t => [firm.name,program.name,program.status,...program.sizes,...program.stages,program.overview,...program.rules.map(r => r.text),...(firm.rules || []).map(r => r.text)].join(' ').toLowerCase().includes(t)));
  }
  function safeUrl(url) { try { const u = new URL(url); return u.protocol === 'https:' ? u.href : '#'; } catch (_) { return '#'; } }
  function link(url, title) { return `<a href="${esc(safeUrl(url))}" target="_blank" rel="noopener noreferrer">${esc(title)} ↗</a>`; }
  function html(catalog, view = {}) {
    if (!catalog?.firms?.length) return '<div class="tracker-missing">The firm rule library could not be loaded. Reopen the app to try again.</div>';
    const results = search(catalog, view.query, view.firm);
    let selected = results.find(({program}) => program.id === view.program) || results[0];
    if (selected) selected = {firm:selected.firm,program:{...selected.program,
      rules:[...selected.program.rules,...(selected.firm.rules || [])],
      sources:[...selected.program.sources,...(selected.firm.sources || [])]}};
    const groups = selected ? [...new Set(selected.program.rules.map(r => r.category))] : [];
    return `<section class="rules-page">
      <header class="rules-heading"><div><span class="label">Trading reference</span><h1>Know your account.</h1><p>Plans, stages and limits, with official sources a click away.</p></div><span class="rules-date">Checked ${esc(catalog.verified)}<small>Stats stay manual</small></span></header>
      <div class="rules-controls"><label>Firm<select id="rules-firm"><option value="">All firms</option>${catalog.firms.map(f=>`<option value="${esc(f.id)}" ${view.firm===f.id?'selected':''}>${esc(f.name)}</option>`).join('')}</select></label><label class="rules-search">Find a rule<input id="rules-search" type="search" value="${esc(view.query || '')}" placeholder="Search plans, payouts, drawdown…"></label></div>
      <div class="rules-layout"><nav class="rules-plans" aria-label="Account plans"><div class="rules-count">${results.length} ${results.length===1 ? "plan" : "plans & variants"}</div>${results.map(({firm,program:p})=>`<button type="button" data-rules-plan="${esc(p.id)}" class="${selected?.program.id===p.id?'selected':''}" ${selected?.program.id===p.id?'aria-current="true"':''}><small>${esc(firm.name)}</small><strong>${esc(p.name)}</strong><span>${esc(p.sizes.join(' · '))}</span>${p.status!=='current'?`<em>${p.status==='legacy'?'Legacy':'Review details'}</em>`:''}</button>`).join('') || '<p class="rules-empty">No matching plans. Try a firm name or a simpler search.</p>'}</nav>
      <article class="rules-detail">${selected ? `<header><div class="rules-detail-meta"><span class="label">${esc(selected.firm.name)}</span><span class="rules-status">${esc(selected.program.status)}</span></div><h2>${esc(selected.program.name)}</h2><p>${esc(selected.program.overview)}</p><div class="rules-tags">${selected.program.sizes.map(s=>`<span>${esc(s)}</span>`).join('')}</div><p class="rules-stages">${esc(selected.program.stages.join(' → '))}</p></header>
      ${selected.program.uncertainties.length?`<aside class="rules-review"><strong>Check your account agreement</strong><ul>${selected.program.uncertainties.map(t=>`<li>${esc(t)}</li>`).join('')}</ul></aside>`:''}
      <div class="rules-sections">${groups.map(category=>`<details class="rules-section" open><summary>${esc(category)}</summary><ul>${selected.program.rules.filter(r=>r.category===category).map(r=>`<li><p>${esc(r.text)}</p>${link(r.source,'Official rule')}</li>`).join('')}</ul></details>`).join('')}</div>
      <footer class="rules-sources"><h3>Official references</h3>${selected.program.sources.map(s=>link(s.url,s.title)).join('')}<p>Rules depend on plan, purchase date and stage. This saved reference does not determine payout approval. Follow your signed agreement and the firm’s current dashboard.</p><button type="button" class="btn" id="rules-add-account" data-program="${esc(selected.program.id)}">Track this plan manually</button></footer>` : '<p class="rules-empty">Choose a different search to find a plan.</p>'}</article></div></section>`;
  }
  const api = {search,html,safeUrl};
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.IcarusRules = api;
})(typeof window !== 'undefined' ? window : this);
