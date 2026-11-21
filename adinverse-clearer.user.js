// ==UserScript==
// @name         adinverse-clearer
// @version      1.7.0-alpha.2
// @description  Hapus banner judi, popup, overlay, iklan video, pop-under, notifikasi palsu, peringatan anti-adblock dan script iklan di situs streaming anime, film & komik.
// @author       Adin-bima
// @run-at       document-start
// @inject-into  page
// @grant        none
// @include      *://*oploverz*/*
// @include      *://*samehadaku*/*
// @include      *://*otakudesu*/*
// @include      *://*anoboy*/*
// @include      *://*idlix*/*
// @include      *://*komiku*/*
// @include      *://*keikomik*/*
// ==/UserScript==
(() => {
// ---- CSS: sembunyikan iklan sejak awal ----
const css = "/* Banner judi: hanya bloknya, bukan wadah player */\n.kln, .blox.mlb.kln,\n/* Keikomik: kotak iklan Clickadilla & notifikasi palsu (iframe ditempel langsung di <html>) */\n[id^=\"__clb-spot\"], div:has(> [id^=\"__clb-spot\"]),\nhtml > iframe[id^=\"container-\"], iframe[id^=\"container-\"][class^=\"container-\"],\n/* Komiku: popup promo Komiku Plus (di dalam shadow DOM) */\n[data-kv-popup],\n/* Idlix */\n.nb-sponsor-pair, #xyzchat-widget-root, a[href*=\"4play.my.id\"],\n.hero-player-playing a[href^=\"http\"]:not([href*=\"idlix\"]),\n/* Anoboy (ID-nya dobel, jadi pakai [id=...]) */\n#ad_box, #ad_bawah, #countDown2, [id=\"judi\"], [id=\"judi2\"], [id=\"coloma\"],\n/* Otakudesu */\n.iklan, .iklanpost, #iklanbawah, #iklantengah1, .iklantengah1, #overplay,\n/* Samehadaku */\n.ads-area-2col, .ads-grid-wrapper, #player-ad-overlay, .player-ad-overlay, .player-ad-box,\n[class*=\"sgpb-\"], [id*=\"sgpb\"],\nins.adsbygoogle, [id^=\"div-gpt-ad\"],\na[href*=\"safest.com\"], a[href*=\"t2m.io\"]\n{ display: none !important; }\n";
const addCss = () => {
  if (document.getElementById("adinverse-css")) return;
  const s = document.createElement("style"); s.id = "adinverse-css"; s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
};
addCss(); document.addEventListener("DOMContentLoaded", addCss);

// ---- Blokir pop-under & script iklan ----
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


// ---- Pembersih banner & overlay ----
const BAD = /(safest\.com|t2m\.io|\.biz$|\.site$|\.xyz$|\.online$|\.vip$|777|88|slot|gacor|toto|bandar|mpo|judi|casino|qqsawer|7kucing|emas5000)/i;
const SAFE = "iframe:not([src*='ads']), .player-embed, .player-frame-wrapper, iframe[src*='blogger'], video, #disqus_thread, #comments, header, nav, .mainheader, #mobile-menu-drawer";

function adLink(a) {
  try { const u = new URL(a.href, location.href); return u.hostname !== location.hostname && BAD.test(u.hostname); }
  catch { return false; }
}
// Aman dihapus hanya kalau elemen itu tidak membungkus player/komentar
const safeToRemove = el => el && !el.matches(SAFE) && !el.querySelector(SAFE);

const extHost = a => { try { const h = new URL(a.href, location.href).hostname; return h !== location.hostname ? h : null; } catch { return null; } };

function clean() {
  // Samehadaku: tutup overlay iklan player lewat tombol close bawaannya, lalu buang
  document.getElementById("close-player-ad")?.click();
  document.querySelectorAll(".ads-area-2col, .ads-grid-wrapper, #player-ad-overlay, .iklan, .iklanpost, #iklanbawah, #overplay, #ad_box, #ad_bawah, [id='judi'], [id='judi2'], [id='coloma']").forEach(e => { if (safeToRemove(e)) e.remove(); });

  // Banner gambar ke situs luar yang diselipkan di widget navigasi
  document.querySelectorAll("#navigasi a[href]").forEach(a => { if (extHost(a) && a.querySelector("img")) a.remove(); });

  // "Kebun banner": wadah berisi >=3 link-gambar ke >=2 domain luar berbeda
  document.querySelectorAll("div, section, aside, ul").forEach(box => {
    if (!box.isConnected || !safeToRemove(box)) return;
    const imgLinks = [...box.querySelectorAll("a[href]")].filter(a => a.querySelector("img") && extHost(a));
    if (imgLinks.length < 3) return;
    const hosts = new Set(imgLinks.map(extHost));
    const allLinks = box.querySelectorAll("a[href]").length;
    if (hosts.size >= 2 && imgLinks.length / allLinks >= 0.8) box.remove();
  });

  // Banner lebar tunggal: link ke situs luar yang isinya cuma 1 gambar dengan rasio >= 3:1
  // (ukuran banner standar 728x90, 1456x90, 970x250, dll). Poster film/anime selalu tegak, jadi aman.
  document.querySelectorAll("a[href] > img:only-child").forEach(img => {
    const a = img.parentElement;
    if (!extHost(a) || !img.naturalWidth || !img.naturalHeight) return;
    if (img.naturalWidth / img.naturalHeight < 3) return;
    let box = a;
    while (box.parentElement && box.parentElement.children.length === 1 &&
           box.parentElement !== document.body && safeToRemove(box.parentElement)) box = box.parentElement;
    if (safeToRemove(box)) box.remove();
  });

  document.querySelectorAll(".kln, [class*='sgpb-']").forEach(e => {
    if (!safeToRemove(e)) return;
    if (/sgpb/.test(e.className)) window.__adinverseUnlock = true;
    e.remove();
  });

  document.querySelectorAll("a[href]").forEach(a => {
    if (!adLink(a)) return;
    // naik ke wadah terkecil yang isinya cuma iklan
    let box = a;
    while (box.parentElement && box.parentElement !== document.body &&
           safeToRemove(box.parentElement) &&
           [...box.parentElement.querySelectorAll("a[href]")].every(adLink)) box = box.parentElement;
    if (safeToRemove(box)) box.remove();
  });

  // Banner melayang (ID acak) & overlay full-screen
  document.querySelectorAll("body > div, body > section, body > aside, body > ins").forEach(el => {
    const pos = getComputedStyle(el).position;
    if (pos !== "fixed" && pos !== "sticky") return;
    if (!safeToRemove(el)) return;
    const r = el.getBoundingClientRect();
    const overlay = r.width >= innerWidth * 0.9 && r.height >= innerHeight * 0.9;
    const hasAd = [...el.querySelectorAll("a[href]")].some(a => adLink(a) || (a.querySelector("img") && extHost(a)));
    if (overlay || hasAd) { el.remove(); window.__adinverseUnlock = true; }
  });
  // Overlay absolute/fixed di atas player (ID acak, z-index tinggi, berisi link iklan)
  document.querySelectorAll("body div, body section, body aside, body span").forEach(el => {
    const cs = getComputedStyle(el);
    if (cs.position !== "absolute" && cs.position !== "fixed") return;
    if (!safeToRemove(el)) return;
    const ext = [...el.querySelectorAll("a[href]")].filter(a => {
      try { return new URL(a.href, location.href).hostname !== location.hostname; } catch { return false; }
    });
    const z = parseInt(cs.zIndex) || 0;
    if (ext.some(adLink) || (ext.length && el.querySelector("img") && z >= 10)) el.remove();
  });

  removeAntiAdblock();
}

// Buka kunci scroll HANYA setelah extension menutup popup/overlay (situs biasanya mengunci scroll
// selama popup tampil). Jangan dipaksa di semua situs: di Idlix, overflow:auto pada html+body
// sekaligus malah membuat halaman tidak bisa di-scroll.
function unlockScroll() {
  for (const el of [document.documentElement, document.body]) {
    if (el && getComputedStyle(el).overflowY === "hidden") el.style.setProperty("overflow", "visible", "important");
  }
}

// Panel "Adblock Terdeteksi" (Komiku dan situs lain): lapisan fixed hampir layar penuh
// dengan teks soal adblock. ID-nya acak, jadi dikenali dari isi dan ukurannya.
// Disembunyikan, BUKAN dihapus: kalau dihapus, script-nya langsung membuat ulang terus-menerus.
const ANTI_ADBLOCK_TEXT = /ad\s?block(er)?\s+(terdeteksi|detected)|matikan\s+ad\s?block|disable\s+(your\s+)?ad\s?block/i;
function removeAntiAdblock() {
  document.querySelectorAll("body > div, body > section, body > aside").forEach(el => {
    if (el.dataset.adinverseHidden) return;
    if (getComputedStyle(el).position !== "fixed") return;
    const r = el.getBoundingClientRect();
    if (r.width < innerWidth * 0.8 || r.height < innerHeight * 0.8) return;
    if (!ANTI_ADBLOCK_TEXT.test(el.textContent || "")) return;
    if (!safeToRemove(el)) return;
    el.dataset.adinverseHidden = "1";
    el.style.setProperty("display", "none", "important");
    window.__adinverseUnlock = true;
  });
  // Halaman dikunci (tidak bisa scroll / blur) selama panel tampil: buka lagi
  if (window.__adinverseUnlock) {
    unlockScroll();
    for (const el of [document.documentElement, document.body]) if (el && el.style.filter) el.style.filter = "";
  }
}

// Idlix: iklan video pre-roll diputar di <video> yang sama dengan film.
// Selama badge "AD" tampil: percepat 16x (30 detik jadi ~2 detik) dan klik "Skip Ad" kalau ada.
// Tidak dibisukan: player mengingat status mute dan menerapkannya ke film.
// Tidak pakai lompat waktu (currentTime): posisinya bisa terbawa ke film.
function skipVideoAds() {
  const badge = [...document.querySelectorAll(".content-badge--gold, [class*='ad-badge']")]
    .find(b => b.textContent.trim().toUpperCase() === "AD");
  const frame = badge?.closest(".hero-player-frame, .hero-player-playing") || null;
  document.querySelectorAll("video").forEach(v => {
    if (frame && frame.contains(v)) {
      v.dataset.adinverseAd = "1";
      if (v.playbackRate !== 16) v.playbackRate = 16;
    } else if (v.dataset.adinverseAd) {
      delete v.dataset.adinverseAd;
      v.playbackRate = 1;
    }
  });
  if (frame) [...frame.querySelectorAll("button")].find(b => /skip ad|lewati/i.test(b.textContent))?.click();
}
setInterval(skipVideoAds, 250);

let t;
new MutationObserver(() => { clearTimeout(t); t = setTimeout(clean, 200); })
  .observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", clean);
// Gambar banner yang baru selesai dimuat (ukurannya baru diketahui setelah load)
document.addEventListener("load", e => {
  if (e.target.tagName === "IMG") { clearTimeout(t); t = setTimeout(clean, 200); }
}, true);
addEventListener("load", clean);

})();
