#!/usr/bin/env python3
"""Gabungkan hide.css + nopopup.js + clean.js jadi satu userscript (untuk Safari iPhone via app Userscripts, atau Tampermonkey)."""
import json
m = json.load(open("manifest.json"))
globs = m["content_scripts"][0]["include_globs"]
css = open("hide.css").read()
head = ["// ==UserScript==",
        "// @name         adinverse-clearer",
        f"// @version      {m.get('version_name', m['version'])}",
        "// @description  " + m["description"],
        "// @author       Adin-bima",
        "// @run-at       document-start",
        "// @inject-into  page",
        "// @grant        none"]
head += [f"// @include      {g}/*" for g in globs]
head += ["// ==/UserScript==", ""]
body = f"""(() => {{
// ---- CSS: sembunyikan iklan sejak awal ----
const css = {json.dumps(css)};
const addCss = () => {{
  if (document.getElementById("adinverse-css")) return;
  const s = document.createElement("style"); s.id = "adinverse-css"; s.textContent = css;
  (document.head || document.documentElement).appendChild(s);
}};
addCss(); document.addEventListener("DOMContentLoaded", addCss);

// ---- Blokir pop-under & script iklan ----
{open("nopopup.js").read()}

// ---- Pembersih banner & overlay ----
{open("clean.js").read()}
}})();
"""
open("adinverse-clearer.user.js", "w").write("\n".join(head) + body)
print("ok")
