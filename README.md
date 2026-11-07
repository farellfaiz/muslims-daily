<p align="center">
  <img src="static/icons/icon-192.png" width="96" height="96" alt="Ikon Muslims Daily">
</p>

<h1 align="center">Muslims Daily</h1>

<p align="center">
  Pendamping ibadah harian: jadwal salat, tracker salat, dan kumpulan doa.<br>
  Ringan, cepat, bisa dipasang di layar utama, dan tetap jalan tanpa internet.
</p>

---

## Fitur

- **Jadwal salat** dihitung langsung di perangkat (library [adhan](https://github.com/batoulapps/adhan-js)), tanpa API dan tanpa internet. Metode Kemenag RI (Subuh 20°, Isya 18°, ihtiyat 2 menit), MUIS, MWL, atau Umm al-Qura, plus pilihan mazhab untuk waktu Ashar.
- **Langit yang hidup**: hero beranda berubah warna mengikuti waktu salat, dengan matahari dan bulan yang bergerak di busur jadwal.
- **Tracker salat**: ketuk untuk menandai sudah salat, streak harian, jejak 6 bulan ala kontribusi GitHub, konsistensi per salat, dan mode udzur (haid atau nifas) yang menjeda streak tanpa memutusnya.
- **Kumpulan doa**: tampilan kartu atau daftar, filter kategori, urutan, pencarian toleran ejaan (dhuha = duha), favorit, dan halaman baca sendiri dengan teks Arab, transliterasi, terjemahan, serta **arti per kata**.
- **Privasi**: tanpa akun, tanpa iklan, tanpa pelacakan. Semua catatan tersimpan di `localStorage` perangkat pengguna.

## Teknologi

| Bagian | Pilihan |
| --- | --- |
| Framework | SvelteKit 3 + Svelte 5, di-prerender jadi file statis (`adapter-static`) |
| PWA | `@vite-pwa/sveltekit` (Workbox), seluruh aplikasi termasuk font di-precache |
| Jadwal salat | `adhan` |
| Font | Fraunces, Plus Jakarta Sans, Amiri (self-host lewat Fontsource) |
| Tes | Vitest untuk logika jadwal dan tracker |

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
    data/doa.ts         data doa
    state/              state tersimpan di perangkat (pengaturan, tracker, favorit)
    components/         Hero, TodayPrayers, Heatmap, BottomNav, dll.
  routes/
    +page.svelte        beranda
    tracker/            tracker salat
    doa/                daftar doa dan halaman baca per doa
    lainnya/            pengaturan lokasi dan metode
design/prototype/       prototipe desain awal (HTML statis)
```

## Kontribusi konten doa

Konten doa adalah bagian paling sensitif dari aplikasi ini. Aturan untuk setiap doa di `src/lib/data/doa.ts`:

1. **Wajib ada sumber.** Ayat: nama surah dan nomor ayat. Hadis: perawi (HR. Bukhari, Muslim, dll).
2. **Cek teks dari rujukan**, bukan dari ingatan atau situs acak: mushaf Kemenag untuk ayat, kitab hadis atau Hisnul Muslim untuk doa ma'tsur.
3. Doa yang bukan dari Al-Qur'an atau hadis tetap boleh dimuat, tetapi diberi `warn: true` dan keterangan sumber yang jujur.
4. Ubah `verified` menjadi `true` hanya setelah dicek oleh orang yang paham.

> Status saat ini: semua doa masih **draf dan belum diverifikasi**. Jangan dirilis ke publik sebelum dicek.

## Lisensi

[MIT](LICENSE)
