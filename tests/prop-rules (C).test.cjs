// (C) Catalog selection must not turn narrative risk rules into payout approval.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const path = require('node:path');
const root = path.join(__dirname, '..');
const libraryPath = path.join(root, 'prop-rules (C).js');
test('rule library exists and searches across firms and rule text', () => {
  assert.ok(fs.existsSync(libraryPath), 'Rule library module is required');
  const lib = require(libraryPath);
  const catalog = {firms:[{id:'one',name:'One',programs:[{id:'p',name:'Plan',status:'current',sizes:['50K'],stages:['Funded'],rules:[{category:'Risk',text:'Intraday trailing drawdown'}]}]}]};
  assert.equal(lib.search(catalog, 'intraday').length, 1);
  assert.equal(lib.search(catalog, 'missing').length, 0);
});
function engine() {
  const file = path.join(root,'account-tracker (C).html');
  assert.ok(fs.existsSync(file), 'Public tracker is required');
  const html = fs.readFileSync(file,'utf8');
  const code = html.split('<script>')[1].split('</script>')[0].split('/* ---------- boot ---------- */')[0];
  const el = {addEventListener(){},classList:{add(){},remove(){}},querySelectorAll(){return[];}};
  const ctx = {document:{addEventListener(){},getElementById(){return el;}},window:{addEventListener(){}}, location:{search:'',hash:''},localStorage:{getItem(){return null;}},setTimeout,clearTimeout,URLSearchParams,console};
  vm.createContext(ctx); vm.runInContext(code,ctx); return ctx;
}
test('new installs never seed personal accounts or transactions', () => {
  const ctx = engine();
  assert.equal(vm.runInContext('seedState().accounts.length + seedState().expenses.length',ctx),0);
  assert.equal(vm.runInContext('Object.keys(seedState().firms).length',ctx),0);
});
test('a narrative-only plan never claims payout readiness, while recording balances', () => {
  const ctx = engine();
  vm.runInContext(`state = seedState(); state.firms.test={id:'test',referenceOnly:true,tiers:[],winDays:0,consistency:100};`,ctx);
  const c = vm.runInContext(`calc({firm:'test',startBalance:50000,seedBalance:50000,seedWinDays:0,days:[{pnl:200,ts:1}],payouts:[]})`,ctx);
  assert.equal(c.balance,50200); assert.equal(c.ready,false);
});
test('loading existing accounts never rewrites their rules or history', () => {
  const ctx=engine();
  assert.equal(vm.runInContext(`state={version:11,firms:{custom:{winDays:3}},accounts:[{name:'Example',days:[{pnl:123}]}],expenses:[{cost:10}]}; const before=JSON.stringify(state); migrate(); JSON.stringify(state)===before;`,ctx),true);
});

test('catalog import keeps stage-specific identity and leaves existing rules intact', () => {
  const ctx=engine();
  vm.runInContext(`ruleCatalog={firms:[{name:'Example Firm',programs:[{id:'example',name:'One',stages:['Evaluation','Funded'],sizes:['50K']}]}]}; state=seedState(); state.firms.old={id:'old',winDays:3};`,ctx);
  const evalId=vm.runInContext("catalogRule('example',50000,'Evaluation').id",ctx);
  const fundedId=vm.runInContext("catalogRule('example',50000,'Funded').id",ctx);
  assert.notEqual(evalId,fundedId);
  assert.equal(vm.runInContext("catalogRule('example',50000,'Funded').referenceOnly",ctx),true);
  assert.equal(vm.runInContext('state.firms.old.winDays',ctx),3);
});

test('manual plan card omits false readiness gates but retains log actions', () => {
  const ctx=engine();
  vm.runInContext(`state=seedState(); const a={id:'sample',name:'Example',firm:'p',status:'active',color:'#888',startBalance:50000,seedBalance:50200,seedWinDays:0,days:[],payouts:[]}; state.accounts=[a];state.firms.p={id:'p',name:'Reference',catalogId:'p',referenceOnly:true,tiers:[],winDays:0,consistency:100};`,ctx);
  const html=vm.runInContext('accountCard(state.accounts[0],calc(state.accounts[0]))',ctx);
  assert.match(html,/Review firm rules/); assert.match(html,/Log payout/); assert.match(html,/History/);
  assert.doesNotMatch(html,/Balance target reached|Buffer secured|Ready to request|Win days done/);
});

test('reference links reject executable URLs and escape source text', () => {
  const lib=require(libraryPath);
  assert.equal(lib.safeUrl('javascript:alert(1)'),'#');
});

test('adding a catalog account saves only its manual starting values and leaves history untouched', async () => {
  const ctx=engine();
  vm.runInContext(`state=seedState(); state.firms.old={id:'old',winDays:3}; state.accounts=[{id:'kept',days:[{pnl:123}],payouts:[]}];
    ruleCatalog={firms:[{name:'Example Firm',programs:[{id:'plan',name:'Funded Plan',stages:['Funded'],sizes:['50K']}]}]};
    const values={naName:'Sample account',naFirm:'catalog:plan',naStage:'Funded',naSize:'50000',naBal:'50500',naWin:'0',naCost:''};
    document.getElementById=id=>({value:values[id]??'',classList:{add(){},remove(){}}});
    render=()=>{}; toast=()=>{}; let saved=null; save=()=>{saved=JSON.stringify(state);};`,ctx);
  await vm.runInContext("act('add-account')",ctx);
  const data=JSON.parse(vm.runInContext('saved',ctx));
  assert.equal(data.accounts.length,2); assert.equal(data.accounts[0].days[0].pnl,123);
  assert.equal(data.accounts[1].seedBalance,50500); assert.equal(data.accounts[1].days.length,0);
  assert.equal(data.firms[data.accounts[1].firm].referenceOnly,true);
  assert.equal(data.firms.old.winDays,3);
});
