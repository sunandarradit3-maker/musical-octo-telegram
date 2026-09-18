# TemuinHP — Recovery Center

Website statis mobile-first untuk membantu pemilik perangkat yang kehilangan HP.

## Fitur
- Shortcut resmi ke Google Find Hub, Apple Find My, dan Samsung SmartThings Find.
- Device Vault lokal (localStorage), tanpa database/backend.
- Tombol telepon, WhatsApp, pencarian lokasi terakhir di Google Maps.
- Checklist recovery dengan progress tersimpan lokal.
- Generator ringkasan laporan kehilangan dan ekspor TXT.
- PWA ringan dan offline cache.
- Header keamanan untuk Vercel.

## Menjalankan lokal
Gunakan server statis apa pun, misalnya:

```bash
python3 -m http.server 8080
```

Lalu buka http://localhost:8080.

## Deploy ke Vercel
Import folder/repository ini sebagai project Vercel. Tidak ada build command yang diperlukan karena situs ini statis.

## Batasan penting
Website tidak mencoba dan tidak bisa memperoleh GPS perangkat hanya dari nomor telepon. Lokasi harus diperoleh melalui layanan resmi yang sudah terhubung ke perangkat sebelum hilang.
