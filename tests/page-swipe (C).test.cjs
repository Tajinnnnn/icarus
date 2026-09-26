const { test } = require('node:test');
const assert = require('node:assert/strict');
const { adjacentPage, horizontal, createWheelGesture } = require('../page-swipe (C).js');
test('navigation stays in its workspace and never wraps', () => {
  const pages = ['home', 'notes', 'journal'];
  assert.equal(adjacentPage(pages, 'notes', 1), 'journal');
  assert.equal(adjacentPage(pages, 'notes', -1), 'home');
  assert.equal(adjacentPage(pages, 'home', -1), null);
  assert.equal(adjacentPage(pages, 'journal', 1), null);
  assert.equal(adjacentPage(pages, 'flow', 1), null);
});
test('small, vertical and diagonal movements do not navigate', () => {
  assert.equal(horizontal(40, 0), false);
  assert.equal(horizontal(100, 100), false);
  assert.equal(horizontal(2, 300), false);
  assert.equal(horizontal(-100, 10), true);
});
test('trackpad momentum navigates only once until the gesture ends', () => {
  const step = createWheelGesture();
  assert.equal(step(50, 2, 0), 0);
  assert.equal(step(50, 2, 20), 1);
  for (let time = 40; time < 1000; time += 20) assert.equal(step(100, 0, time), 0);
  assert.equal(step(-100, 0, 1300), -1);
});
test('isolated small gestures do not accumulate across idle gaps', () => {
  const step = createWheelGesture();
  assert.equal(step(60, 0, 0), 0);
  assert.equal(step(60, 0, 500), 0);
});
