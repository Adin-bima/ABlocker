# adinverse-clearer

Extension Chrome (Manifest V3) untuk menghapus banner judi, overlay di depan player, popup, dan pop-under di situs streaming anime, film, dan baca komik:

- Oploverz
- Samehadaku
- Otakudesu
- Anoboy
- Idlix
- Komiku
- Keikomik

Berlaku juga untuk domain mirror selama nama host-nya mengandung nama situs di atas.

## Isi

| File | Fungsi |
|---|---|
| `manifest.json` | Konfigurasi extension |
| `hide.css` | Menyembunyikan elemen iklan yang sudah dikenal sejak halaman mulai dimuat |
| `clean.js` | Menghapus banner, kebun banner, overlay melayang, dan iklan yang disisipkan belakangan (MutationObserver) |
| `nopopup.js` | Jalan di konteks halaman: blokir `window.open` ke domain luar, klik yang dibajak, dan script/iframe iklan dinamis |
| `rules.json` | Aturan `declarativeNetRequest` untuk memblokir jaringan iklan dan domain judi |

## Pasang

1. Clone atau download repo ini.
2. Buka `chrome://extensions`, nyalakan **Developer mode**.
3. Klik **Load unpacked**, pilih folder repo ini.
4. Refresh halaman anime-nya.

## iPhone / iPad

Chrome di iPhone tidak bisa memakai extension maupun userscript. Pakai salah satu cara ini:

- **Safari + app [Userscripts](https://apps.apple.com/app/userscripts/id1463298887)** (paling stabil): pasang app-nya, aktifkan di Pengaturan → Safari → Ekstensi, lalu buka file [`adinverse-clearer.user.js`](adinverse-clearer.user.js) versi *Raw* di Safari dan simpan lewat ikon Userscripts.
- **Orion Browser**: mendukung extension Chrome secara beta. Bisa dicoba lewat Extensions → Install from file, tapi tidak semua fitur extension dijamin jalan di iOS.

`adinverse-clearer.user.js` dibuat otomatis dari file extension dengan `python3 build-userscript.py`. Pemblokiran di level jaringan (`rules.json`) tidak ikut, tapi penghapusan banner, overlay, dan pop-under tetap jalan.
