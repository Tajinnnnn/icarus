// (C) Verify snapshot calculations and unavailable-feed behavior independently of the UI.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {flowModel,gexModel,flowHtml,gexHtml}=require('../options-charts (C).js');

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
