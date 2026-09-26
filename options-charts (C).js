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
  function regimeModel(gex, source="oi") {
    const group=groups.find(g=>g.key===source) || groups[1];
    const data=gex?.[group.field] || {};
    const usable=["healthy","limited","stale"].includes(data.status);
    const base={source:group.key,label:group.label,status:data.status || "unavailable",usable,stale:data.stale===true || data.status==="stale",stamp:data.as_of || data.timestamp || null,detail:data.message || data.detail || "This methodology has no usable snapshot."};
    if (!usable) return {...base,levels:[],pressures:[],regime:"Unavailable"};
    const spot=finite(data.spot) ? data.spot : null;
    const gamma=finite(data.total_gex) ? data.total_gex : null;
    const direction=gamma===null ? null : Math.sign(gamma);
    const regime=direction===null ? "Unknown gamma" : direction>0 ? "Long gamma" : direction<0 ? "Short gamma" : "Neutral gamma";
    const rows=Array.isArray(data.rows) ? data.rows : [];
    const strikes=(Array.isArray(data.by_strike) ? data.by_strike : []).filter(r=>finite(r.strike));
    const pressure=(key,label,field,totalField,grossField)=>{
      const complete=rows.length>0 && rows.every(r=>finite(r[field]));
      const net=finite(data[totalField]) ? data[totalField] : complete ? rows.reduce((sum,r)=>sum+r[field],0) : null;
      const gross=finite(data[grossField]) ? data[grossField] : complete ? rows.reduce((sum,r)=>sum+Math.abs(r[field]),0) : null;
      return {key,label,net,gross,balance:net!==null && gross>0 ? Math.max(-1,Math.min(1,net/gross)) : null};
    };
    const pressures=[pressure("delta","Dealer delta","dex","total_dex","gross_dex"),pressure("vanna","Vanna exposure","vex","total_vex","gross_vex"),pressure("charm","Charm exposure","charmex","total_charmex","gross_charmex")];
    const strength=(strike,field)=>{
      const values=strikes.map(r=>r[field]).filter(finite), here=strikes.find(r=>r.strike===strike)?.[field];
      const peak=Math.max(0,...values.map(Math.abs));
      return finite(here) && peak>0 ? Math.round(Math.abs(here)/peak*100) : null;
    };
    const descriptions={
      call:direction>0 ? "Call-side concentration. Long-gamma hedging can dampen a rally near this level." : direction<0 ? "Call-side concentration. Short-gamma hedging can extend a move through this level." : "Feed-reported call-side gamma concentration.",
      put:direction>0 ? "Put-side concentration. Long-gamma hedging can dampen a decline near this level." : direction<0 ? "Put-side concentration. Short-gamma hedging can extend a move through this level." : "Feed-reported put-side gamma concentration.",
      flip:"Model boundary where aggregate gamma changes sign; separate from the net gamma at spot.",
      trigger:"Feed-reported volatility trigger. Compare spot with this level and the gamma flip.",
      pain:"Open-interest settlement reference; it is not a price target.",
    };
    const levels=[];
    const add=(label,price,kind,field)=>{if(finite(price)) levels.push({label,price,kind,description:descriptions[kind],strength:field ? strength(price,field) : null,delta:spot===null ? null : price-spot,pct:spot>0 ? (price/spot-1)*100 : null});};
    add("Call wall",data.call_wall,"call","call_gex");
    add("Put wall",data.put_wall,"put","put_gex");
    add("Gamma flip",data.gamma_flip,"flip");
    add("Volatility trigger",data.vol_trigger,"trigger");
    add("Max pain",data.max_pain,"pain");
    if(spot!==null) {
      const candidates=strikes.filter(r=>finite(r.net_gex));
      const resistance=candidates.filter(r=>r.strike>spot && r.net_gex>0 && r.strike!==data.call_wall).sort((a,b)=>b.net_gex-a.net_gex).slice(0,2);
      const support=candidates.filter(r=>r.strike<spot && r.net_gex<0 && r.strike!==data.put_wall).sort((a,b)=>a.net_gex-b.net_gex).slice(0,2);
      resistance.forEach((r,i)=>add(`Resistance ${i+1}`,r.strike,"call","call_gex"));
      support.forEach((r,i)=>add(`Support ${i+1}`,r.strike,"put","put_gex"));
    }
    levels.sort((a,b)=>b.price-a.price);
    const bounds=finite(data.put_wall) && finite(data.call_wall) && data.put_wall<data.call_wall ? [data.put_wall,data.call_wall] : null;
    const location=spot===null || !bounds ? "Range unavailable" : spot>bounds[1] ? "Above call wall" : spot<bounds[0] ? "Below put wall" : "Inside wall range";
    const flip=finite(data.gamma_flip)?data.gamma_flip:null, trigger=finite(data.vol_trigger)?data.vol_trigger:null;
    const corridor=flip!==null && trigger!==null && flip!==trigger ? [Math.min(flip,trigger),Math.max(flip,trigger)] : null;
    return {...base,spot,gamma,direction,regime,pressures,levels,bounds,location,corridor,inCorridor:spot!==null && corridor && spot>=corridor[0] && spot<=corridor[1]};
  }
  function regimeHtml(gex,source) {
    const m=regimeModel(gex,source);
    const sourceBar=`<div class="gex-source-line"><span class="editor-kicker">${esc(m.label)}</span><span class="gex-status${m.stale ? " stale" : ""}">${esc(m.stale ? "Stale snapshot" : m.status)}</span>${m.stamp ? `<span class="options-muted">As of ${esc(m.stamp)}</span>` : ""}</div>`;
    if(!m.usable) return `${sourceBar}<section class="options-chart-card"><h3>Regime unavailable</h3><p class="options-muted">${esc(m.detail)} Choose another source above to inspect its regime and levels.</p></section>`;
    const signed=v=>v===null ? "—" : `${v>0 ? "+" : ""}${compact(v)}`;
    const environment=m.direction>0 ? "Dampening bias" : m.direction<0 ? "Amplifying bias" : m.direction===0 ? "Balanced gamma" : "Not enough data";
    const context=m.direction>0 ? "Long-gamma hedging tends to buy declines and sell rallies, favoring mean reversion." : m.direction<0 ? "Short-gamma hedging tends to sell declines and buy rallies, which can extend moves in either direction." : "No directional gamma interpretation is available from this snapshot.";
    const cards=`<div class="options-overview gex-regime-cards"><section class="options-chart-card"><span class="editor-kicker">Gamma regime</span><strong class="${m.direction>0 ? "gex-positive" : m.direction<0 ? "gex-negative" : ""}">${m.regime}</strong><p class="options-muted">Net GEX ${signed(m.gamma)} · ${environment}</p></section><section class="options-chart-card"><span class="editor-kicker">Market context</span><strong>${m.location}</strong><p class="options-muted">${m.bounds ? number(m.bounds[0])+" – "+number(m.bounds[1])+" · put / call wall" : "Both wall prices are needed to locate the range."}</p></section><section class="options-chart-card"><span class="editor-kicker">Spot / regime boundary</span><strong>${number(m.spot)}</strong><p class="options-muted">${m.corridor ? (m.inCorridor ? "Inside" : "Outside")+" flip / trigger corridor: "+number(m.corridor[0])+" – "+number(m.corridor[1]) : "Flip / trigger corridor unavailable."}</p></section></div>`;
    const sentiment=m.pressures.map(p=>{
      const label=p.net===null ? "Unavailable" : p.net===0 ? "Balanced" : p.key==="delta" ? (p.net>0 ? "Net long delta" : "Net short delta") : (p.net>0 ? "Positive" : "Negative")+" "+p.key;
      const explanation=p.key==="delta" ? "Signed dealer delta positioning; its sign alone is not a forecast of price direction." : p.key==="vanna" ? "Volatility-sensitive positioning. Changes in implied volatility alter delta hedging needs." : "Time-sensitive positioning. Passing time alters delta hedging needs.";
      const meter=p.balance===null ? `<p class="options-muted">Exposure balance unavailable</p>` : `<div class="gex-pressure-track" aria-label="${esc(p.label)} net is ${number(Math.abs(p.balance)*100)}% of gross"><span class="${p.balance>=0 ? "gex-pressure-positive" : "gex-pressure-negative"}" style="left:${p.balance>=0 ? 50 : 50+p.balance*50}%;width:${Math.abs(p.balance)*50}%"></span></div><div class="gex-pressure-labels"><span>Negative</span><span>${number(Math.abs(p.balance)*100)}% net / gross</span><span>Positive</span></div>`;
      return `<section class="options-chart-card"><span class="editor-kicker">${p.label}</span><h3>${label}</h3><strong class="gex-pressure-value ${p.net>0 ? "gex-positive" : p.net<0 ? "gex-negative" : ""}">${signed(p.net)}</strong>${meter}<p class="options-muted">${explanation}</p></section>`;
    }).join("");
    const spotRow=`<div class="gex-level-spot"><span>Spot · ${esc(gex.underlying)}</span><strong>${number(m.spot)}</strong></div>`;
    let inserted=false;
    const levelRows=m.levels.map(l=>{
      const before=!inserted && m.spot!==null && l.price<m.spot ? spotRow : "";
      if(before) inserted=true;
      return `${before}<details class="gex-level-row" data-gex-disclosure="${esc(m.source+":"+l.label+":"+l.price)}"><summary><span class="gex-level-kind options-${l.kind}" aria-hidden="true"></span><span class="gex-level-label">${l.label}${l.strength!==null ? `<span class="gex-strength-track"><i class="options-${l.kind}" style="width:${l.strength}%"></i></span>` : ""}</span><span class="gex-level-price">${number(l.price)}<small>${l.pct===null ? "" : (l.pct>0 ? "+" : "")+number(l.pct)+"%"}</small></span><span class="gex-strength-value">${l.strength===null ? "" : l.strength+" / 100"}</span></summary><div class="gex-level-explainer"><p>${l.description}</p>${l.delta===null ? "" : `<p>${number(Math.abs(l.delta))} ${l.delta>=0 ? "above" : "below"} spot.${l.strength===null ? "" : " Strength is relative to the largest gamma exposure on the same side of this snapshot."}</p>`}</div></details>`;
    }).join("");
    return `${sourceBar}${cards}<section class="gex-context-note"><span class="editor-kicker">Regime read</span><p>${context}</p><p class="options-muted">${m.stale ? "These readings use a stale snapshot. " : ""}Interpretation of the selected model, not a buy/sell signal. Gamma regime describes hedging behavior; delta, vanna and charm describe positioning.</p></section><div class="gex-section-heading"><h3>Sentiment & dealer pressure</h3><span class="options-muted">Selected source only · native feed units</span></div><div class="options-overview">${sentiment}</div><section class="options-chart-card gex-levels-card"><div class="options-chart-heading"><div><span class="editor-kicker">Ranked concentrations · tap a level for context</span><h3>Key levels</h3></div><span class="options-muted">Relative gamma strength ≠ probability</span></div>${levelRows}${!inserted && m.spot!==null ? spotRow : ""}${!m.levels.length ? `<p class="options-muted">No levels are available in this snapshot.</p>` : ""}<p class="options-muted">Walls, flip, trigger and max pain come from the feed. Additional resistance/support: two strongest positive/negative net-GEX strikes above/below spot. This is a gamma ranking, not FreeFlow's multi-Greek composite score.</p></section>`;
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
  const api={flowModel,gexModel,flowHtml,gexHtml,regimeModel,regimeHtml,attach};
  if (typeof module !== "undefined" && module.exports) module.exports=api;
  else root.IcarusOptionsCharts=api;
})(typeof window === "undefined" ? null : window);
