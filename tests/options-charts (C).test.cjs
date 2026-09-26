// (C) Verify snapshot calculations and unavailable-feed behavior independently of the UI.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {flowModel,gexModel,flowHtml,gexHtml}=require('../options-charts (C).js');
const {regimeModel,regimeHtml}=require('../options-charts (C).js');

test('regime uses the explicitly selected model, including zero and missing gamma',()=>{
  const gex={oi_gex:{status:'healthy',spot:100,total_gex:20,total_dex:40,call_wall:105,put_wall:95},sf_gex:{status:'unavailable',total_gex:-50}};
  assert.equal(regimeModel(gex,'oi').regime,'Long gamma');
  assert.equal(regimeModel(gex,'sf').usable,false);
  assert.equal(regimeModel({oi_gex:{status:'healthy',total_gex:0}},'oi').regime,'Neutral gamma');
  assert.equal(regimeModel({oi_gex:{status:'healthy'}},'oi').regime,'Unknown gamma');
});
test('regime levels are sorted by price, strengths are per side, support stays below spot',()=>{
  const gex={oi_gex:{status:'healthy',spot:100,total_gex:10,call_wall:105,put_wall:95,by_strike:[{strike:105,call_gex:100,put_gex:-1,net_gex:99},{strike:110,call_gex:50,put_gex:0,net_gex:50},{strike:95,call_gex:1,put_gex:-10,net_gex:-9},{strike:97,call_gex:1,put_gex:-5,net_gex:-4},{strike:103,call_gex:0,put_gex:-6,net_gex:-6}]}};
  const m=regimeModel(gex,'oi');
  assert.equal(m.levels.find(l=>l.label==='Put wall').strength,100);
  assert.equal(m.levels.find(l=>l.label==='Call wall').strength,100);
  assert.equal(m.levels.find(l=>l.label==='Support 1').price,97);
  assert.equal(m.levels.find(l=>l.label==='Resistance 1').price,110);
  assert.deepEqual(m.levels.map(l=>l.price),[110,105,97,95]);
});
test('sentiment preserves missing values, sums the chosen model, and labels stale data',()=>{
  const m=regimeModel({oi_gex:{status:'healthy',stale:true,spot:100,total_gex:-2,total_dex:0,rows:[{vex:10,charmex:null},{vex:-5,charmex:null}]}},'oi');
  assert.equal(m.stale,true); assert.equal(m.regime,'Short gamma');
  assert.equal(m.pressures.find(p=>p.key==='vanna').net,5);
  assert.equal(m.pressures.find(p=>p.key==='charm').net,null);
  assert.equal(m.pressures.find(p=>p.key==='delta').net,0);
});
test('unavailable source never supplies sentiment from another source',()=>{
  const html=regimeHtml({oi_gex:{status:'healthy',total_gex:10},sf_gex:{status:'unavailable',total_gex:-10,detail:'<script>alert(1)</script>'}},'sf');
  assert.match(html,/unavailable/); assert.doesNotMatch(html,/Long gamma|Short gamma|<script>/);
});

test('volume and premium use independent totals and a numeric strike order without mutating input',()=>{
  const flow={spot:101,rows:[{strike:105,call_vol:10,put_vol:30,call_prem:3000,put_prem:1000},{strike:99,call_vol:30,put_vol:10,call_prem:1000,put_prem:9000}]};
  const before=JSON.stringify(flow), vol=flowModel(flow), prem=flowModel(flow,'prem');
  assert.deepEqual(vol.rows.map(r=>r.strike),[99,105]);
  assert.equal(vol.total,80); assert.equal(vol.share,.5);
  assert.equal(prem.total,14000); assert.equal(prem.call,4000);
  assert.equal(JSON.stringify(flow),before);
});
test('missing, nonfinite and zero values do not invent activity or a busiest strike',()=>{
  const empty=flowModel({rows:[{strike:100,call_vol:null,put_vol:Infinity},{strike:NaN,call_vol:30}]});
  assert.equal(empty.total,null); assert.equal(empty.share,null); assert.equal(empty.busiest,null);
  const zero=flowModel({rows:[{strike:100,call_vol:0,put_vol:0}]});
  assert.equal(zero.total,0); assert.equal(zero.share,null); assert.equal(zero.busiest,null);
  assert.doesNotMatch(flowHtml({ok:true,rows:[],spot:null}),/NaN|Infinity/);
});
test('GEX models never substitute unavailable methodologies or treat null as zero',()=>{
  const model=gexModel({spot:100,sf_gex:{status:'healthy',call_wall:104,put_wall:98,gamma_flip:null},oi_gex:{status:'unavailable',call_wall:110},eoi_gex:{status:'calibrating',call_wall:111}}, {vanna:false,charm:false});
  assert.deepEqual(model.groups[0].levels.map(x=>x[1]),[104,98]);
  assert.equal(model.groups[1].levels.length,0); assert.equal(model.groups[2].levels.length,0);
});
test('GEX visibility filters and stale labels survive rendering',()=>{
  const gex={ok:true,spot:100,sf_gex:{status:'stale',call_wall:103},oi_gex:{status:'healthy',call_wall:109},vanna_walls:{flip:null,call_wall:{strike:102}}};
  const shown={oi:false,eoi:false,charm:false};
  const model=gexModel(gex,shown);
  assert.deepEqual(model.groups.map(g=>g.key),['sf','vanna']);
  assert.equal(model.groups[1].levels.length,1);
  const html=gexHtml(gex,shown);
  assert.match(html,/stale/); assert.match(html,/\+3 from spot/); assert.doesNotMatch(html,/109/);
});
test('chart labels escape upstream text and preserve an honest empty state',()=>{
  const html=gexHtml({ok:true,underlying:'<img onerror=x>',exp:'<script>',sf_gex:{status:'healthy',call_wall:100}}, {oi:false,eoi:false,vanna:false,charm:false});
  assert.match(html,/&lt;img/); assert.doesNotMatch(html,/<img|<script>/);
  assert.match(gexHtml({ok:true},{sf:false,oi:false,eoi:false,vanna:false,charm:false}),/Choose a methodology/);
});
