// ベランダ探偵 — 図鑑の発見記録（localStorage永続）
(function (root) {
  const KEY = 'vt_dex_v1';
  let data = { i: {}, r: {} };
  try {
    if (typeof localStorage !== 'undefined') {
      const raw = localStorage.getItem(KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && parsed.i && parsed.r) data = parsed;
      }
    }
  } catch (e) { /* private mode等 */ }

  function save() {
    try { if (typeof localStorage !== 'undefined') localStorage.setItem(KEY, JSON.stringify(data)); } catch (e) { /* noop */ }
  }

  const DEX = {
    unlockItem: function (key) { if (!key) return; data.i[key] = (data.i[key] || 0) + 1; save(); },
    unlockResident: function (id) { if (!id) return; data.r[id] = (data.r[id] || 0) + 1; save(); },
    itemCount: function (key) { return data.i[key] || 0; },
    resCount: function (id) { return data.r[id] || 0; },
  };

  root.VT_DEX = DEX;
  if (typeof module !== 'undefined') module.exports = DEX;
})(typeof window !== 'undefined' ? window : globalThis);
