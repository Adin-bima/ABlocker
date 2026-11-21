// Jalan di konteks halaman, sebelum script iklan dimuat
(() => {
  const BAD = /(safest\.com|t2m\.io|\.biz\b|\.site\b|777|slot|gacor|toto|bandar|judi|casino|popads|popcash|propeller|adsterra|onclick|exoclick|hilltop|clickadu|monetag)/i;
  const sameSite = h => { try { return new URL(h, location.href).hostname === location.hostname; } catch { return true; } };

  // 1. Pop-under: window.open ke situs lain diblokir (iklan selalu ke domain luar)
  const realOpen = window.open;
  window.open = function (url, ...r) {
    if (url && !sameSite(url)) return null;
    return realOpen.call(this, url, ...r);
  };

  // 2. Klik apa pun yang dibajak jadi buka tab iklan
  document.addEventListener("click", e => {
    const a = e.target.closest?.("a[href]");
    if (a && BAD.test(a.href) && !sameSite(a.href)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // 3. Script iklan yang disuntik dinamis → dibatalkan sebelum dimuat
  const blockSrc = (el, v) => el.tagName === "SCRIPT" || el.tagName === "IFRAME" ? BAD.test(String(v)) : false;
  for (const P of [HTMLScriptElement, HTMLIFrameElement]) {
    const d = Object.getOwnPropertyDescriptor(P.prototype, "src");
    Object.defineProperty(P.prototype, "src", {
      get() { return d.get.call(this); },
      set(v) { if (blockSrc(this, v)) return; d.set.call(this, v); }
    });
  }
  const realSetAttr = Element.prototype.setAttribute;
  Element.prototype.setAttribute = function (n, v) {
    if (n === "src" && blockSrc(this, v)) return;
    return realSetAttr.call(this, n, v);
  };

  // 4. Matikan Popup Builder (sgpb) dan redirect paksa ke situs iklan
  Object.defineProperty(window, "SGPBPopup", { get: () => undefined, set() {}, configurable: false });
  const realAssign = location.assign.bind(location);
  try { location.assign = u => { if (!BAD.test(u)) realAssign(u); }; } catch {}
})();
