# adinverse-clearer

Extension Chrome (Manifest V3) untuk menghapus banner judi, overlay di depan player, popup, dan pop-under di situs streaming anime:

- Oploverz
- Samehadaku
- Otakudesu
- Anoboy

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
