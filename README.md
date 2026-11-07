<p align="center">
  <img src="static/icons/icon-192.png" width="96" height="96" alt="Ikon Muslims Daily">
</p>

<h1 align="center">Muslims Daily</h1>

<p align="center">
  Pendamping ibadah harian: jadwal salat, tracker salat, doa, dzikir pagi petang, dan kiblat.<br>
  Ringan, cepat, bisa dipasang di layar utama, dan tetap jalan tanpa internet.
</p>

---

> Tujuan produk, keputusan desain, dan roadmap ada di **[docs/PRD.md](docs/PRD.md)**.

## Fitur

- **Jadwal salat** dihitung langsung di perangkat (library [adhan](https://github.com/batoulapps/adhan-js)), tanpa API dan tanpa internet. Metode Kemenag RI (Subuh 20°, Isya 18°, ihtiyat 2 menit), MUIS, MWL, atau Umm al-Qura, plus pilihan mazhab untuk waktu Ashar.
- **Langit yang hidup**: hero beranda berubah warna mengikuti waktu salat, dengan matahari dan bulan yang bergerak di busur jadwal.
- **Tracker salat**: ketuk untuk menandai sudah salat, streak harian, jejak 6 bulan ala kontribusi GitHub, konsistensi per salat, dan mode udzur (haid atau nifas) yang menjeda streak tanpa memutusnya.
- **Kumpulan doa**: tampilan kartu atau daftar, filter kategori, urutan, pencarian toleran ejaan (dhuha = duha), favorit, dan halaman baca sendiri dengan teks Arab, transliterasi, terjemahan, serta **arti per kata**.
- **Dzikir dan doa setelah salat** (dari [Dzikir & Doa Setelah Sholat](https://farellfaiz.github.io/dzikr-and-duas/)) serta **dzikir pagi dan petang**, dengan penghitung ketuk per bacaan (tasbih 33×), lafaz pagi atau petang yang otomatis menyesuaikan, dan progres per salat.
- **Ceklis salat**: salat yang belum masuk waktunya dikunci, yang sudah lewat tetap bisa dicentang kapan saja.
- **Kiblat**: arah dan jarak ke Ka'bah dari lokasimu, dengan kompas di HP yang menyala saat sudah sejajar.
- **Koreksi jadwal** per salat (per menit) supaya cocok dengan masjid setempat, dan pilihan imsak 5, 10, atau 15 menit.
- **Mode gelap** yang mengikuti HP atau dipilih manual.
- **Cadangan data**: simpan semua catatan ke satu file JSON dan pulihkan di HP lain (digabung, tidak menimpa).
- **Privasi**: tanpa akun, tanpa iklan, tanpa pelacakan. Semua catatan tersimpan di `localStorage` perangkat pengguna.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | SvelteKit 3 + Svelte 5, di-prerender jadi file statis (`adapter-static`) |
| PWA | `@vite-pwa/sveltekit` (Workbox), seluruh aplikasi termasuk font di-precache |
| Jadwal salat | `adhan` |
| Font | Fraunces, Plus Jakarta Sans, Amiri (self-host lewat Fontsource) |
| Tes | Vitest untuk logika jadwal, tracker, kiblat, dzikir, dan cadangan |

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run check      # typecheck
npm test           # tes unit
npm run build      # build produksi ke folder build/
npm run preview    # coba hasil build (termasuk service worker)
```

Folder `build/` berisi situs statis yang bisa di-host di mana saja: Vercel, Cloudflare Pages, Netlify, atau GitHub Pages.

## Struktur

```
src/
  lib/
    prayer.ts           hitung jadwal salat dan fase langit
    tracker.ts          streak, heatmap, konsistensi, mode udzur (murni, teruji)
    qibla.ts            arah kiblat, jarak, dan pembacaan kompas
    backup.ts           ekspor, validasi, dan penggabungan cadangan
    dzikirProgress.ts   hitungan dzikir harian
    data/doa.ts         data doa
    data/dzikir.ts      data dzikir pagi dan petang
    data/salat.ts       data dzikir dan doa setelah salat
    state/              state tersimpan di perangkat (pengaturan, tracker, favorit)
    components/         Hero, TodayPrayers, Heatmap, BottomNav, dll.
  routes/
    +page.svelte        beranda
    tracker/            tracker salat
    doa/                daftar doa dan halaman baca per doa
    dzikir/             dzikir setelah salat dan pagi petang, dengan penghitung
    kiblat/             arah kiblat dan kompas
    lainnya/            pengaturan, koreksi jadwal, tampilan, cadangan data
design/prototype/       prototipe desain awal (HTML statis)
```

## Kontribusi konten doa dan dzikir

Konten doa dan dzikir adalah bagian paling sensitif dari aplikasi ini. Aturan untuk setiap entri di `src/lib/data/doa.ts` dan `src/lib/data/dzikir.ts`:

1. **Wajib ada sumber.** Ayat: nama surah dan nomor ayat. Hadis: perawi (HR. Bukhari, Muslim, dll).
2. **Cek teks dari rujukan**, bukan dari ingatan atau situs acak: mushaf Kemenag untuk ayat, kitab hadis atau Hisnul Muslim untuk doa ma'tsur.
3. Doa yang bukan dari Al-Qur'an atau hadis tetap boleh dimuat, tetapi diberi `warn: true` dan keterangan sumber yang jujur.
4. Ubah `verified` menjadi `true` hanya setelah dicek oleh orang yang paham.

> Status saat ini: semua doa dan dzikir masih **draf dan belum diverifikasi**. Jangan dirilis ke publik sebelum dicek.

## Kredit

- Desain terinspirasi dari **Pillars** (Prayer Times & Qibla).
- Dzikir dan doa setelah salat dari [Dzikir & Doa Setelah Sholat](https://farellfaiz.github.io/dzikr-and-duas/).
- Jadwal salat dan arah kiblat dihitung dengan [adhan](https://github.com/batoulapps/adhan-js).

## Lisensi

[MIT](LICENSE)
