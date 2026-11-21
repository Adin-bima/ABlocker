// ==UserScript==
// @name         adinverse-clearer
// @version      1.5.0-alpha.1
// @description  Hapus banner judi, popup, overlay, pop-under dan script iklan di situs streaming anime.
// @author       Adin-bima
// @run-at       document-start
// @inject-into  page
// @grant        none
// @include      *://*oploverz*/*
// @include      *://*samehadaku*/*
// @include      *://*otakudesu*/*
// @include      *://*anoboy*/*
// ==/UserScript==
(() => {
// ---- CSS: sembunyikan iklan sejak awal ----
const css = "/* Banner judi: hanya bloknya, bukan wadah player */\n.kln, .blox.mlb.kln,\n/* Anoboy (ID-nya dobel, jadi pakai [id=...]) */\n#ad_box, #ad_bawah, #countDown2, [id=\"judi\"], [id=\"judi2\"], [id=\"coloma\"],\n/* Otakudesu */\n.iklan, .iklanpost, #iklanbawah, #iklantengah1, .iklantengah1, #overplay,\n/* Samehadaku */\n.ads-area-2col, .ads-grid-wrapper, #player-ad-overlay, .player-ad-overlay, .player-ad-box,\n[class*=\"sgpb-\"], [id*=\"sgpb\"],\nins.adsbygoogle, [id^=\"div-gpt-ad\"],\na[href*=\"safest.com\"], a[href*=\"t2m.io\"]\n{ display: none !important; }\nhtml, body { overflow: auto !important; }\n";
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

  document.querySelectorAll(".kln, [class*='sgpb-']").forEach(e => { if (safeToRemove(e)) e.remove(); });

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
    if (overlay || hasAd) el.remove();
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

  document.documentElement.style.overflow = "";
  if (document.body) document.body.style.overflow = "";
}

let t;
new MutationObserver(() => { clearTimeout(t); t = setTimeout(clean, 200); })
  .observe(document.documentElement, { childList: true, subtree: true });
document.addEventListener("DOMContentLoaded", clean);
addEventListener("load", clean);

})();
