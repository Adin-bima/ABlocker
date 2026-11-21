# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/), versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

### Ditambahkan
- Dukungan Idlix: banner `.nb-sponsor-pair`, widget live chat `xyzchat`, menu "Games", banner "SPONSORED" di player.
- Iklan video pre-roll di player dipercepat 16x dan tombol "Skip Ad" diklik otomatis.
- Aturan umum "banner lebar tunggal": link ke situs luar berisi satu gambar dengan rasio >= 3:1.
- Blokir jaringan `xyzchat.net` dan `tasterdinger.com` (pop-under).
- Dukungan Komiku: blokir script anti-adblock `nyamnyam.js`, script pop-under `analytics.komiku.org/api/w/pop*`, dan jaringan `wynnscanela.com`; sembunyikan popup promo `[data-kv-popup]`.
- Penanganan umum panel "Adblock Terdeteksi": disembunyikan (bukan dihapus, supaya tidak dibuat ulang) dan scroll halaman dipulihkan.
- Pemblokir pop-under lewat `<a target=_blank>` buatan script yang di-klik secara programatik.
- Userscript: script anti-adblock dan pop-under dibatalkan sebelum dieksekusi (pengganti pemblokiran jaringan).

## [1.5.0-alpha.1] - 2026-11-21

Rilis pertama (alpha).

### Ditambahkan
- Extension Chrome (Manifest V3) untuk Oploverz, Samehadaku, Otakudesu, dan Anoboy, termasuk domain mirror-nya.
- Penghapusan banner judi, banner melayang, overlay di depan player, dan popup.
- Deteksi umum "kebun banner" dan overlay ber-ID acak.
- Pemblokir pop-under (`window.open` ke domain luar), klik yang dibajak, dan script/iframe iklan dinamis.
- Pemblokiran jaringan iklan dan domain judi lewat `declarativeNetRequest`.
- Versi userscript (`adinverse-clearer.user.js`) untuk Safari iPhone lewat app Userscripts.

### Catatan
- Overlay Samehadaku yang muncul setelah play, pemblokir pop-under, dan versi userscript belum diuji langsung.
