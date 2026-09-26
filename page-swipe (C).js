/* (C) One horizontal gesture = one page, bounded to the current workflow. */
(function (root) {
  'use strict';
  function adjacentPage(pages, current, direction) {
    const index = pages.indexOf(current);
    return index < 0 ? null : pages[index + direction] || null;
  }
  function horizontal(dx, dy, threshold = 90) {
    return Math.abs(dx) >= threshold && Math.abs(dx) > Math.abs(dy) * 1.7;
  }
  function createWheelGesture() {
    let totalX = 0, totalY = 0, last = -Infinity, fired = false;
    return function (dx, dy, time) {
      if (time - last > 260) { totalX = 0; totalY = 0; fired = false; }
      last = time;
      if (fired) return 0;
      totalX += dx; totalY += Math.abs(dy);
      if (!horizontal(totalX, totalY)) return 0;
      fired = true;
      return totalX > 0 ? 1 : -1;
    };
  }
  function install(element, navigate) {
    const wheel = createWheelGesture();
    let touch = null;
    const editing = 'input,textarea,select,[contenteditable="true"]';
    function blocked(target) {
      if (document.querySelector('.modal-overlay') || document.querySelector('.context-menu')) return true;
      if (document.activeElement?.closest(editing)) return true;
      if (target.closest(editing + ',iframe,.bt-chart,.chart,.flow-ladder,.read-aloud-bar')) return true;
      if (window.getSelection()?.toString()) return true;
      for (let node = target; node && node !== element; node = node.parentElement) {
        if (node.scrollWidth > node.clientWidth + 2 && /auto|scroll/.test(getComputedStyle(node).overflowX)) return true;
      }
      return false;
    }
    element.addEventListener('wheel', (event) => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || blocked(event.target)) return;
      if (Math.abs(event.deltaX) <= Math.abs(event.deltaY) * 1.7) return;
      const scale = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? element.clientWidth : 1;
      event.preventDefault();
      const direction = wheel(event.deltaX * scale, event.deltaY * scale, event.timeStamp);
      if (direction) navigate(direction);
    }, { passive: false });
    element.addEventListener('touchstart', (event) => {
      touch = event.touches.length === 1 && !blocked(event.target)
        ? { x: event.touches[0].clientX, y: event.touches[0].clientY, time: event.timeStamp, fired: false } : null;
    }, { passive: true });
    element.addEventListener('touchmove', (event) => {
      if (!touch || event.touches.length !== 1) { touch = null; return; }
      if (touch.fired) { event.preventDefault(); return; }
      const dx = touch.x - event.touches[0].clientX;
      const dy = touch.y - event.touches[0].clientY;
      if (Math.abs(dy) > 24 && Math.abs(dy) >= Math.abs(dx)) { touch = null; return; }
      if (event.timeStamp - touch.time > 900) { touch = null; return; }
      if (horizontal(dx, dy, 75)) {
        event.preventDefault(); touch.fired = true; navigate(dx > 0 ? 1 : -1);
      }
    }, { passive: false });
    for (const name of ['touchend', 'touchcancel']) element.addEventListener(name, () => { touch = null; }, { passive: true });
  }
  const api = { adjacentPage, horizontal, createWheelGesture, install };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  else root.FleurSwipe = api;
})(typeof window !== 'undefined' ? window : this);
