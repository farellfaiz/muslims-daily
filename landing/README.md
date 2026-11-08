# Landing page Muslims Daily

Situs `muslimsdaily.id`. Aplikasinya sendiri ada di folder root repo dan di-deploy terpisah ke `app.muslimsdaily.id`.
Alamat domain dan repo diatur di satu tempat: [`src/lib/config.ts`](src/lib/config.ts).

SvelteKit 3 + Svelte 5, di-prerender jadi file statis (`adapter-static`). Palet, font, dan ikon sama dengan aplikasinya.

## Menjalankan

```bash
npm install
npm run dev        # server pengembangan
npm run check      # typecheck
npm run build      # situs statis ke folder build/
npm run preview    # coba hasil build
```

## Deploy

Buat project Cloudflare Pages kedua dari repo yang sama, dengan **Root directory = `landing`**,
build command `npm run build`, dan output `build`, lalu pasang domain `muslimsdaily.id`.
Project aplikasinya tetap memakai root repo. Header cache ada di [`static/_headers`](static/_headers).

## Isi halaman

| Bagian | File | Catatan |
| --- | --- | --- |
| Hero dan cerita sehari | `src/lib/components/Journey.svelte` | Satu adegan scroll: pintu membesar, lalu langit berganti dari Subuh sampai malam dan HP menampilkan fitur yang cocok |
| Pintu dengan langit live | `src/lib/components/Door.svelte` | Jadwal Kemenag RI dihitung di browser (`src/lib/sky.ts`), kota dipilih dari zona waktu pengunjung |
| Buat siapa | `src/lib/components/Purpose.svelte` | Kalimat besar yang menyala per kata saat di-scroll |
| Privasi, fitur lain, install, open source, penutup | `src/lib/components/*.svelte` | |

Animasi scroll hanya aktif bila pengunjung tidak memilih "kurangi gerakan" dan JavaScript jalan
(kelas `motion` di `<html>`, dipasang oleh `src/app.html`). Selain itu halaman tampil sebagai daftar biasa.

## Screenshot aplikasi

Screenshot di `static/screens/` diambil dari aplikasinya sendiri, bukan mockup. Daftar layarnya (rute, jam, tema)
ada di [`src/lib/screens.json`](src/lib/screens.json). Untuk mengambil ulang setelah tampilan aplikasi berubah:

```bash
# di folder root: jalankan aplikasinya dulu
npm run dev -- --port 5174

# di folder landing
npm run screens                       # semua layar
npm run screens -- http://localhost:5174 tracker   # satu layar
```

Skrip memakai Chrome atau Edge yang sudah terpasang (atur `CHROME_PATH` bila letaknya lain), memalsukan jam
sesuai `at`, dan mengisi localStorage dengan data contoh (streak, progres dzikir, posisi baca).

Gambar pratinjau link (`static/og.png`) dibuat dari hero: `npm run build && npm run og`.

## Gaya tulisan

- Bahasa Indonesia sehari-hari. Istilah yang biasa dipakai dalam bahasa Inggris tetap Inggris: install, home screen,
  Play Store, offline, dark mode, backup, tracker, streak.
- Tanpa em dash, dan hindari daftar tiga hal beruntun ("X, Y, dan Z") yang bikin tulisan terasa seperti buatan AI.
- Jangan menjanjikan fitur yang belum ada di aplikasinya.
