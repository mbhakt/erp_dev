// src/utils/masterLink.js
// Simple pub-sub style helper for opening a master and getting a result.

const listeners = [];

export function openMaster(modalName, opts = {}) {
  // modalName: "party" | "item"
  // opts: any
  listeners.forEach((l) => l({ modalName, opts }));
}

export function onMasterOpen(cb) {
  listeners.push(cb);
  return () => {
    const idx = listeners.indexOf(cb);
    if (idx >= 0) listeners.splice(idx, 1);
  };
}
