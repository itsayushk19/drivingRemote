const LS_KEY = "__controller_layouts_v1";
const MAX_BYTES = 5 * 1024 * 1024;

/* ---------- STORAGE STATS ---------- */
export function storageBytesUsed() {
  let total = 0;
  for (const k in localStorage) {
    const v = localStorage.getItem(k);
    total += k.length + (v?.length || 0);
  }
  return total;
}

export function storagePercentUsed() {
  return Math.min(100, (storageBytesUsed() / MAX_BYTES) * 100);
}

/* ---------- COMPRESSION ---------- */
export function compressLayout(layout) {
  return {
    i: layout.id,
    b: layout.baseId ?? layout.id,
    n: layout.name,
    c: layout.controls.map(c => ({
      i: c.id,
      t: c.type,
      x: +c.x.toFixed(4),
      y: +c.y.toFixed(4),
      w: +c.w.toFixed(4),
      h: +c.h.toFixed(4),
      g: c.config,
      s: c.skin    // ✅ SAVE SKIN DIRECTLY
    }))
  };
}



export function decompressLayout(d) {
  return {
    id: d.i,
    baseId: d.b,
    name: d.n,
    controls: d.c.map(c => ({
      id: c.i,
      type: c.t,
      x: c.x,
      y: c.y,
      w: c.w,
      h: c.h,
      config: c.g,
      skin: c.s    // ✅ RESTORE SKIN
    }))
  };
}


/* ---------- CRUD ---------- */
export function loadLayouts() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY)) || {};
  } catch {
    return {};
  }
}

export function saveLayouts(map) {
  localStorage.setItem(LS_KEY, JSON.stringify(map));
}

export function deleteLayout(id) {
  const m = loadLayouts();
  delete m[id];
  saveLayouts(m);
}

export function renameLayout(id, name) {
  const m = loadLayouts();
  if (m[id]) {
    m[id].n = name;
    saveLayouts(m);
  }
}

export function deleteAllLayouts() {
  localStorage.removeItem("__controller_layouts_v1");
}
