# Changelog

Format mengikuti [Keep a Changelog](https://keepachangelog.com/id/1.1.0/), versi mengikuti [Semantic Versioning](https://semver.org/lang/id/).

## [Unreleased]

### Ditambahkan
- Dukungan Idlix: banner `.nb-sponsor-pair`, widget live chat `xyzchat`, menu "Games", banner "SPONSORED" di player.
- Iklan video pre-roll di player dipercepat 16x dan tombol "Skip Ad" diklik otomatis.
- Aturan umum "banner lebar tunggal": link ke situs luar berisi satu gambar dengan rasio >= 3:1.
- Blokir jaringan `xyzchat.net` dan `tasterdinger.com` (pop-under).

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
