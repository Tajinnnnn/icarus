/* (C) Snapshot charts for the existing options feeds. No additional data requests. */
(function (root) {
  "use strict";
  const finite = value => typeof value === "number" && Number.isFinite(value);
  const esc = value => String(value ?? "").replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const number = value => finite(value) ? Number(value.toFixed(2)).toLocaleString("en-US", {maximumFractionDigits: 2}) : "—";
  const compact = value => finite(value) ? new Intl.NumberFormat("en-US", {notation:"compact", maximumFractionDigits:1}).format(value) : "—";
  const valueLabel = (value, metric) => `${metric === "prem" ? "$" : ""}${number(value)}`;
  function flowModel(flow, metric = "vol") {
    const key = metric === "prem" ? "prem" : "vol";
    const rows = (flow?.rows || []).filter(r => finite(r.strike)).map(r => ({
      strike:r.strike,
      call:finite(r[`call_${key}`]) && r[`call_${key}`] >= 0 ? r[`call_${key}`] : null,
      put:finite(r[`put_${key}`]) && r[`put_${key}`] >= 0 ? r[`put_${key}`] : null,
    })).sort((a,b) => a.strike-b.strike);
    const sum = side => rows.some(r => r[side] !== null) ? rows.reduce((t,r) => t+(r[side] || 0),0) : null;
    const call=sum("call"), put=sum("put");
    const total=call !== null && put !== null ? call+put : null;
    const busiest=rows.filter(r => r.call !== null && r.put !== null && r.call+r.put > 0).reduce((best,r) => !best || r.call+r.put > best.call+best.put ? r : best,null);
    return {rows,call,put,total,busiest,share:total > 0 ? call/total : null,spot:finite(flow?.spot) ? flow.spot : null};
  }
  function domain(values) {
    const valid=values.filter(finite);
    if (!valid.length) return [0,1];
    const min=Math.min(...valid), max=Math.max(...valid), pad=(max-min || Math.max(Math.abs(min)*.01,1))*.08;
    return [min-pad,max+pad];
  }
  function flowChart(flow, metric) {
    const m=flowModel(flow,metric), premium=metric === "prem";
    const name=premium ? "Premium by strike" : "Volume by strike";
    if (!m.rows.length) return `<section class="options-chart-card"><h3>${name}</h3><p class="options-muted">No strike data available.</p></section>`;
    const [lo,hi]=domain([...m.rows.map(r=>r.strike),m.spot]);
    const x=v=>58+(v-lo)/(hi-lo)*618;
    const maximum=Math.max(1,...m.rows.flatMap(r=>[r.call || 0,r.put || 0]));
    const height=v=>(v || 0)/maximum*168;
    const gaps=m.rows.slice(1).map((r,i)=>r.strike-m.rows[i].strike).filter(g=>g>0);
    const width=Math.max(.5,Math.min(9,(gaps.length ? Math.min(...gaps)/(hi-lo)*618 : 24)*.37));
    const grid=[0,.25,.5,.75,1].map(f=>`<line x1="58" x2="676" y1="${220-f*168}" y2="${220-f*168}" class="options-gridline"/><text x="49" y="${224-f*168}" text-anchor="end" class="options-axis">${premium ? "$" : ""}${compact(maximum*f)}</text>`).join("");
    const ticks=[0,.25,.5,.75,1].map(f=>`<text x="${58+618*f}" y="244" text-anchor="middle" class="options-axis">${number(lo+(hi-lo)*f)}</text>`).join("");
    const bars=m.rows.map(r=>{
      const detail=`Strike ${number(r.strike)} · Calls ${valueLabel(r.call,metric)} · Puts ${valueLabel(r.put,metric)}`;
      return `<g tabindex="0" role="img" aria-label="${esc(detail)}" data-chart-detail="${esc(detail)}" class="options-mark"><title>${esc(detail)}</title><rect x="${x(r.strike)-width-1}" y="${220-height(r.call)}" width="${width}" height="${height(r.call)}" rx="1" class="options-call"/><rect x="${x(r.strike)+1}" y="${220-height(r.put)}" width="${width}" height="${height(r.put)}" rx="1" class="options-put"/><rect x="${x(r.strike)-width-2}" y="48" width="${width*2+4}" height="174" fill="transparent"/></g>`;
    }).join("");
    const spot=m.spot === null ? "" : `<line x1="${x(m.spot)}" x2="${x(m.spot)}" y1="39" y2="223" class="options-spot"/><text x="${Math.min(610,Math.max(110,x(m.spot)))}" y="27" text-anchor="middle" class="options-spot-label">Spot ${number(m.spot)}</text>`;
    return `<section class="options-chart-card"><div class="options-chart-heading"><div><span class="editor-kicker">${premium ? "Dollars traded" : "Contracts traded"}</span><h3>${name}</h3></div><div class="options-legend"><span><i class="options-call"></i>Calls</span><span><i class="options-put"></i>Puts</span></div></div><div class="options-svg-wrap"><svg viewBox="0 0 720 269" aria-label="${name}" role="group">${grid}${ticks}${bars}${spot}<text x="367" y="266" text-anchor="middle" class="options-axis">${esc(flow.underlying || "Underlying")} strike</text></svg></div><p class="options-chart-readout" data-chart-readout>Hover or focus a strike for exact values.</p><p class="options-muted">${premium ? "Premium" : "Volume"} scale · calls and puts share the same axis.</p></section>`;
  }
  function flowHtml(flow, {volume=true,premium=false}={}) {
    if (!flow?.ok) return "";
    const m=flowModel(flow), p=flowModel(flow,"prem");
    const share=m.share === null ? "—" : `${(m.share*100).toFixed(1)}%`;
    const split=m.share === null ? `<p class="options-muted">No traded volume to compare.</p>` : `<div class="options-share" aria-label="Calls ${share} of volume"><span class="options-call" style="width:${m.share*100}%"></span><span class="options-put" style="width:${(1-m.share)*100}%"></span></div><p class="options-muted">Calls ${share} · puts ${((1-m.share)*100).toFixed(1)}%</p>`;
    return `<div class="options-overview"><section class="options-chart-card"><span class="editor-kicker">Call / put balance</span><strong>${compact(m.total)} <small>contracts</small></strong>${split}</section><section class="options-chart-card"><span class="editor-kicker">Most active strike</span><strong>${m.busiest ? number(m.busiest.strike) : "—"}</strong><p class="options-muted">${m.busiest ? compact(m.busiest.call+m.busiest.put)+" contracts · calls + puts" : "No traded volume in this snapshot"}</p></section><section class="options-chart-card"><span class="editor-kicker">Premium traded</span><strong>${p.total === null ? "—" : "$"+compact(p.total)}</strong><p class="options-muted">Calls $${compact(p.call)} · puts $${compact(p.put)}</p></section></div><p class="options-muted">Shown strikes only · call/put volume does not identify buying or selling.</p><div class="options-chart-grid">${volume ? flowChart(flow,"vol") : ""}${premium ? flowChart(flow,"prem") : ""}</div>`;
  }
  const groups=[
    {key:"sf",field:"sf_gex",label:"Signed-flow GEX"},
    {key:"oi",field:"oi_gex",label:"Settlement-OI GEX"},
    {key:"eoi",field:"eoi_gex",label:"Estimated-OI GEX"},
  ];
  function gexModel(gex,shown={}) {
    const result=[];
    for (const group of groups) {
      if (shown[group.key] === false) continue;
      const data=gex?.[group.field] || {};
      const usable=["healthy","limited","stale"].includes(data.status);
      const levels=usable ? [["Call wall",data.call_wall,"call"],["Put wall",data.put_wall,"put"],["Gamma flip",data.gamma_flip,"flip"],["Vol trigger",data.vol_trigger,"trigger"]].filter(([,v])=>finite(v)) : [];
      result.push({...group,status:data.status || "unavailable",levels});
    }
    for (const [key,field,label,positive,negative] of [["vanna","vanna_walls","Vanna walls","call_wall","put_wall"],["charm","charm_zones","Charm zones","positive_zone","negative_zone"]]) {
      if (shown[key] === false) continue;
      const d=gex?.[field];
      const blocked=d?.status && !["healthy","limited","stale"].includes(d.status);
      const levels=d && !blocked ? [[key === "vanna" ? "Call wall" : "Positive zone",d[positive]?.strike,"call"],[key === "vanna" ? "Put wall" : "Negative zone",d[negative]?.strike,"put"],["Flip",d.flip,"flip"]].filter(([,v])=>finite(v)) : [];
      result.push({key,label,status:d?.status || (levels.length ? "snapshot" : "unavailable"),levels});
    }
    return {groups:result,spot:finite(gex?.spot) ? gex.spot : null};
  }
  function gexHtml(gex,shown) {
    if (!gex?.ok) return "";
    const m=gexModel(gex,shown), levels=m.groups.flatMap(g=>g.levels.map(([,v])=>v));
    if (!levels.length) return `<section class="options-chart-card"><h3>Positioning map</h3><p class="options-muted">${m.groups.length ? "No usable levels for the selected methodologies. Status details are below." : "Choose a methodology above to show its levels."}</p></section>`;
    const [lo,hi]=domain([...levels,m.spot]), x=v=>192+(v-lo)/(hi-lo)*476;
    const bottom=52+m.groups.length*92, height=bottom+43;
    const ticks=[0,.25,.5,.75,1].map(f=>`<line x1="${192+476*f}" x2="${192+476*f}" y1="43" y2="${bottom}" class="options-gridline"/><text x="${192+476*f}" y="${bottom+24}" text-anchor="middle" class="options-axis">${number(lo+(hi-lo)*f)}</text>`).join("");
    const rows=m.groups.map((g,i)=>{
      const y=60+i*92;
      const marks=g.levels.map(([label,v,kind],j)=>{
        const cy=y+j*17, detail=`${g.label} · ${label} ${number(v)}${m.spot === null ? "" : ` · ${v-m.spot >= 0 ? "+" : ""}${number(v-m.spot)} from spot`} · ${g.status}`;
        return `<g tabindex="0" role="img" aria-label="${esc(detail)}" data-chart-detail="${esc(detail)}" class="options-mark"><title>${esc(detail)}</title><circle cx="${x(v)}" cy="${cy}" r="5" class="options-${kind}"/><text x="${x(v)+(x(v)>610 ? -10 : 10)}" y="${cy+4}" text-anchor="${x(v)>610 ? "end" : "start"}" class="options-axis">${number(v)}</text><rect x="${x(v)-8}" y="${cy-8}" width="16" height="16" fill="transparent"/></g>`;
      }).join("");
      return `<text x="12" y="${y+4}" class="options-method">${esc(g.label)}</text><text x="12" y="${y+22}" class="options-axis">${esc(g.status)}</text>${marks || `<text x="200" y="${y+8}" class="options-axis">No levels available</text>`}`;
    }).join("");
    const spot=m.spot === null ? "" : `<line x1="${x(m.spot)}" x2="${x(m.spot)}" y1="37" y2="${bottom}" class="options-spot"/><text x="${Math.min(625,Math.max(240,x(m.spot)))}" y="23" text-anchor="middle" class="options-spot-label">Spot ${number(m.spot)}</text>`;
    return `<section class="options-chart-card"><div class="options-chart-heading"><div><span class="editor-kicker">Levels relative to spot</span><h3>Positioning map</h3></div><span class="options-muted">${esc(gex.underlying)} · ${esc(gex.exp)}</span></div><div class="options-legend"><span><i class="options-call"></i>Call / positive</span><span><i class="options-put"></i>Put / negative</span><span><i class="options-flip"></i>Flip</span><span><i class="options-trigger"></i>Vol trigger</span></div><div class="options-svg-wrap"><svg viewBox="0 0 720 ${height}" role="group" aria-label="GEX positioning map">${ticks}${spot}${rows}<text x="430" y="${height-2}" text-anchor="middle" class="options-axis">${esc(gex.underlying)} price · shared scale</text></svg></div><p class="options-chart-readout" data-chart-readout>Hover or focus a level to see its distance from spot.</p><p class="options-muted">Each methodology stays separate. This map shows price levels, not exposure size.${gex.timestamp ? " Snapshot: "+esc(gex.timestamp)+"." : ""}</p></section>`;
  }
  function attach(container) {
    container.querySelectorAll(".options-chart-card").forEach(card=>{
      const readout=card.querySelector("[data-chart-readout]");
      if (!readout) return;
      const initial=readout.textContent;
      const show=event=>{const mark=event.target.closest("[data-chart-detail]"); if(mark) readout.textContent=mark.dataset.chartDetail;};
      card.addEventListener("pointerover",show);
      card.addEventListener("focusin",show);
      card.addEventListener("pointerleave",()=>{if(!card.contains(document.activeElement)) readout.textContent=initial;});
      card.addEventListener("focusout",event=>{if(!card.contains(event.relatedTarget)) readout.textContent=initial;});
    });
  }
  const api={flowModel,gexModel,flowHtml,gexHtml,attach};
  if (typeof module !== "undefined" && module.exports) module.exports=api;
  else root.IcarusOptionsCharts=api;
})(typeof window === "undefined" ? null : window);
