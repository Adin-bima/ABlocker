// Jalan di konteks halaman, sebelum script iklan dimuat
(() => {
  const BAD = /(safest\.com|t2m\.io|\.biz\b|\.site\b|777|slot|gacor|toto|bandar|judi|casino|popads|popcash|propeller|adsterra|onclick|exoclick|hilltop|clickadu|monetag)/i;
  const sameSite = h => { try { return new URL(h, location.href).hostname === location.hostname; } catch { return true; } };

  // 0. Script anti-adblock & pop-under: dibatalkan sebelum sempat jalan.
  //    Extension Chrome sudah memblokirnya di jaringan (rules.json); ini cadangan untuk userscript.
  //    Script yang ditulis di HTML terdeteksi MutationObserver sebelum dieksekusi; type-nya diganti
  //    supaya browser tidak menjalankannya.
  const BLOCK_SCRIPT = /(keikomik\.[a-z]+\/C[bp][0-9_]*\.js|funny-blind\.com|guidepaparazzisurface\.com|unlinedsound\.com|bauval\.org|massivesalad\.com|deductgreedyheadroom\.com|nappyonsetstiffness\.com|\/asset\/js\/nyamnyam\.js|analytics\.komiku\.org\/api\/w\/pop|wynnscanela\.com|xyzchat\.net|tasterdinger\.com|ads\.desustream\.com)/i;
  const killScript = s => {
    if (s.tagName === "SCRIPT" && s.src && BLOCK_SCRIPT.test(s.src)) {
      s.type = "javascript/blocked";
      s.addEventListener("beforescriptexecute", e => e.preventDefault(), { once: true });
      s.remove();
    }
  };
  new MutationObserver(ms => ms.forEach(m => m.addedNodes.forEach(n => {
    if (n.nodeType !== 1) return;
    killScript(n);
    n.querySelectorAll?.("script[src]").forEach(killScript);
  }))).observe(document.documentElement, { childList: true, subtree: true });

  // 1. Pop-under: window.open ke situs lain diblokir (iklan selalu ke domain luar)
  const realOpen = window.open;
  window.open = function (url, ...r) {
    if (url && !sameSite(url)) return null;
    return realOpen.call(this, url, ...r);
  };

  // 1b. Trik pop-under: ambil window.open "asli" dari iframe kosong. Tutup juga jalur itu.
  const cwDesc = Object.getOwnPropertyDescriptor(HTMLIFrameElement.prototype, "contentWindow");
  Object.defineProperty(HTMLIFrameElement.prototype, "contentWindow", {
    configurable: true,
    get() {
      const w = cwDesc.get.call(this);
      try { if (w && w.open !== window.open) w.open = window.open; } catch {}
      return w;
    }
  });

  // 1c. Judul tab dibajak jadi "(1) New Message!" oleh iklan notifikasi palsu
  const titleDesc = Object.getOwnPropertyDescriptor(Document.prototype, "title");
  Object.defineProperty(Document.prototype, "title", {
    configurable: true,
    get() { return titleDesc.get.call(this); },
    set(v) { if (/^\(\d+\)\s*new message/i.test(String(v))) return; titleDesc.set.call(this, v); }
  });

  // 2. Klik apa pun yang dibajak jadi buka tab iklan
  document.addEventListener("click", e => {
    const a = e.target.closest?.("a[href]");
    if (a && BAD.test(a.href) && !sameSite(a.href)) { e.preventDefault(); e.stopImmediatePropagation(); }
  }, true);

  // 3. Script iklan yang disuntik dinamis → dibatalkan sebelum dimuat
  const blockSrc = (el, v) => el.tagName === "SCRIPT" || el.tagName === "IFRAME" ? (BAD.test(String(v)) || BLOCK_SCRIPT.test(String(v))) : false;
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

  // 3b. Pop-under lewat <a target=_blank> buatan script yang di-.click() tanpa ditempel ke halaman,
  //     atau elemen <a> yang tiba-tiba dibuat dan diklik ke domain luar (cara yang lolos dari window.open)
  const realClick = HTMLElement.prototype.click;
  HTMLElement.prototype.click = function () {
    if (this instanceof HTMLAnchorElement && this.target === "_blank" && this.href && !sameSite(this.href) && !this.isConnected) return;
    return realClick.call(this);
  };
  const realDispatch = EventTarget.prototype.dispatchEvent;
  EventTarget.prototype.dispatchEvent = function (ev) {
    if (ev && ev.type === "click" && this instanceof HTMLAnchorElement && this.target === "_blank" &&
        this.href && !sameSite(this.href) && (!this.isConnected || !ev.isTrusted)) return false;
    return realDispatch.call(this, ev);
  };

  // 4. Matikan Popup Builder (sgpb) dan redirect paksa ke situs iklan
  Object.defineProperty(window, "SGPBPopup", { get: () => undefined, set() {}, configurable: false });
  const realAssign = location.assign.bind(location);
  try { location.assign = u => { if (!BAD.test(u)) realAssign(u); }; } catch {}
})();
