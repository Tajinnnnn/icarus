const {test} = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const fs = require('node:fs');
const source = fs.readFileSync(require('node:path').join(__dirname,'../appearance (C).js'),'utf8');
function setup(saved, unavailable=false) {
  const document={documentElement:{dataset:{}}}, events=[];
  const window={dispatchEvent:e=>events.push(e)};
  const store={value:saved,getItem(){if(unavailable)throw Error();return this.value},setItem(k,v){if(unavailable)throw Error();this.value=v}};
  vm.runInNewContext(source,{document,window,localStorage:store,CustomEvent:class{constructor(type,{detail}){this.type=type;this.detail=detail}}});
  return {document,window,store,events};
}
test('Chrome is default and unknown stored values fall back to Chrome',()=>{
  for(const value of [null,'unknown']) assert.equal(setup(value).window.FleurAppearance.current(),'chrome');
});
test('all four themes restore, persist, and notify the current view',()=>{
  for(const value of ['fleur','light','dark','chrome']){
    const x=setup(value); assert.equal(x.window.FleurAppearance.current(),value);
    x.window.FleurAppearance.apply(value);assert.equal(x.store.value,value);assert.equal(x.events.at(-1).detail,value);
  }
});
test('storage failure still allows changing the theme for this session',()=>{
  const x=setup(null,true);x.window.FleurAppearance.apply('chrome');assert.equal(x.document.documentElement.dataset.theme,'chrome');
});
