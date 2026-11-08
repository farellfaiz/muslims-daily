<p align="center">
  <img src="static/icons/icon-192.png" width="96" height="96" alt="Ikon Muslims Daily">
</p>

<h1 align="center">Muslims Daily</h1>

<p align="center">
  Pendamping ibadah harian: jadwal salat, tracker salat, doa, dzikir, Al-Qur'an, dan kiblat.<br>
  Ringan, tanpa akun, bisa di-install ke home screen, dan tetap jalan offline.
</p>

---

> Tujuan produk, keputusan desain, dan roadmap ada di **[docs/PRD.md](docs/PRD.md)**.

## Fitur

- **Jadwal salat** dihitung langsung di HP, tanpa internet. Bisa pilih metode (Kemenag RI, MUIS, MWL, Umm al-Qura), mazhab Ashar, lokasi GPS atau kota, koreksi per salat supaya cocok dengan masjid setempat, dan imsak 5, 10, atau 15 menit.
- **Langit yang hidup**: hero beranda berbentuk pintu lengkung yang warna langitnya ikut waktu salat, dengan hitung mundur ke salat berikutnya. Malam hari menampilkan sepertiga malam terakhir dan imsak.
- **Catatan dan tracker salat**: tap untuk menandai sudah salat, termasuk hari-hari yang lalu. Ada streak, heatmap 6 bulan, konsistensi per salat, dan mode udzur yang menjeda streak tanpa memutusnya.
- **Kumpulan doa**: 260 doa dalam 19 kategori, lengkap dengan teks Arab, latin, dan terjemahan. Bisa di-search (toleran ejaan, dhuha = duha), diurutkan, ditampilkan sebagai kartu atau daftar, disimpan ke favorit, dan dikelompokkan ke **koleksi pribadi**.
- **Dzikir** setelah salat dan pagi petang, masing-masing dengan dua versi. Ada penghitung ketuk dengan getar halus, lafaz pagi atau petang yang menyesuaikan sendiri, alur sesi (Journey), dan progres per sesi.
- **Al-Qur'an**: 114 surat dan tab juz, teks Utsmani, latin, terjemahan, arti per kata, lompat ke ayat, dan lanjutkan dari posisi terakhir.
- **Kiblat**: arah dan jarak ke Ka'bah, dengan kompas yang menyala saat HP sudah menghadap kiblat.
- **Notifikasi adzan** per salat, bisa dengan pengingat beberapa menit sebelumnya.
- **Dua bahasa**: antarmuka Indonesia atau English.
- **Tour aplikasi** untuk pengguna baru, splash screen, dan ajakan install ke home screen.
- **Dark mode**: Terang (bawaan), Gelap, atau ikut pengaturan HP.
- **Backup**: simpan semua data ke satu file JSON lalu restore di HP lain. Datanya digabung, tidak menimpa.
- **Privasi**: tanpa akun, tanpa iklan, tanpa pelacakan. Semua catatan tersimpan di HP sendiri.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | SvelteKit 3 + Svelte 5, di-prerender jadi file statis (`adapter-static`) |
| PWA | `@vite-pwa/sveltekit` dengan service worker sendiri, seluruh aplikasi termasuk font di-precache |
| Jadwal salat | `adhan` |
| Font | Fraunces, Plus Jakarta Sans, Amiri (self-host lewat Fontsource) |
| Tes | Vitest untuk logika jadwal, tracker, kiblat, dzikir, backup, koleksi, tour, dan transliterasi |

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run check      # typecheck
npm test           # tes unit
npm run build      # build produksi ke folder build/
npm run preview    # coba hasil build (termasuk service worker)
node scripts/js-budget.mjs   # cek anggaran JavaScript per halaman (setelah build)
```

Folder `build/` berisi situs statis yang bisa di-host di mana saja: Vercel, Cloudflare Pages, Netlify, atau GitHub Pages.

## Deploy

Hosting yang dipakai: **Cloudflare Pages**. Bandwidth gratisnya tanpa batas dan ada server di Jakarta.

1. Di dashboard Cloudflare, buka **Workers & Pages → Create → Pages → Connect to Git**, lalu pilih repo ini.
2. Isi pengaturan build:
   - Framework preset: `SvelteKit` (atau `None`)
   - Build command: `npm run build`
   - Build output directory: `build`
   - Root directory: kosongkan (root repo)
3. Pasang domain `app.muslimsdaily.id` di tab **Custom domains**.

Versi Node dikunci lewat `.node-version`. Header cache dan keamanan ada di [`static/_headers`](static/_headers):
`sw.js` dan manifest selalu dicek ulang supaya pembaruan langsung sampai, sedangkan file ber-hash di `_app/immutable/`
disimpan selamanya.

Landing page di-deploy sebagai project Pages kedua dari repo yang sama, dengan root directory `landing`
(lihat [`landing/README.md`](landing/README.md)).

## Struktur

```
src/
  app.html              kerangka HTML, splash screen, dan pemasang tema/bahasa sebelum halaman digambar
  service-worker/sw.ts  cache offline dan ketukan notifikasi adzan
  lib/
    prayer.ts           hitung jadwal salat dan fase langit
    tracker.ts          streak, heatmap, konsistensi, mode udzur
    qibla.ts            arah kiblat, jarak, dan pembacaan kompas
    backup.ts           ekspor, validasi, dan penggabungan backup
    koleksi.ts          koleksi doa pribadi
    tour.ts             langkah tour dan posisi kartunya
    i18n.svelte.ts      bahasa antarmuka: tr('Indonesia', 'English')
    latinNu.ts          penyeragam transliterasi ayat
    adzan.ts            penjadwal notifikasi adzan
    doaIndex.ts         pemuat data doa bersama di browser
    data/               data doa, dzikir, dan dzikir setelah salat
    server/doa.ts       pembaca data doa, hanya dipakai saat prerender
    state/              state tersimpan di perangkat (pengaturan, tracker, doa, dzikir, adzan, tour)
    components/         Hero, TodayPrayers, Heatmap, DoaList, Tour, KoleksiSheet, dll.
  routes/
    +page.svelte        beranda
    tracker/            tracker salat
    quran/              daftar surat dan halaman baca
    doa/                kategori, semua/, favorit/, koleksi/, [kategori]/[slug]/ (halaman baca)
    dzikir/             dzikir setelah salat dan pagi petang, dengan penghitung
    kiblat/             arah kiblat dan kompas
    lainnya/            pengaturan, tampilan, bahasa, kredit
      lokasi/ metode/ adzan/ koreksi/ cadangan/
    data/               file data statis saat build (dzikir, doa, Wirdul Lathif), tidak ikut JavaScript
scripts/                pengambil dan penyusun data (doa, dzikir, Al-Qur'an) dan cek anggaran JavaScript
landing/                landing page
design/prototype/       prototipe desain awal (HTML statis)
```

## Kontribusi konten doa dan dzikir

Konten doa dan dzikir adalah bagian paling sensitif dari aplikasi ini. Data doa dibuat oleh skrip di `scripts/`, jadi jangan sunting file JSON-nya dengan tangan: perbaiki sumbernya lalu jalankan ulang skripnya. Aturan untuk setiap entri:

1. **Wajib ada sumber.** Ayat: nama surah dan nomor ayat. Hadis: perawi. Buku: judul dan halamannya.
2. **Cek teks dari rujukan**, bukan dari ingatan atau situs acak. Ayat selalu diambil dari data Al-Qur'an aplikasi.
3. Doa yang bukan dari Al-Qur'an atau hadis tetap boleh dimuat, dengan keterangan sumber yang jujur.
4. Transliterasi atau terjemahan yang disusun sendiri disebut begitu di keterangan sumbernya.

Koreksi isi doa sangat diterima, terutama dari yang paham bahasa Arab. Buka issue atau pull request.

## Kredit

- Pillars
- [NU Online](https://nu.or.id)
- Kementerian Agama RI
- Hisnul Muslim
- [quran.com](https://quran.com)
- [adhan](https://github.com/batoulapps/adhan-js)
- [Dzikir & Doa Setelah Sholat](https://farellfaiz.github.io/dzikr-and-duas/)

## Lisensi

[MIT](LICENSE)
