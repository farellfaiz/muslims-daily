# PRD: Muslims Daily

| | |
| --- | --- |
| Pemilik | Farell Faiz Firmansyah |
| Status | MVP berjalan, konten doa masih draf |
| Versi dokumen | 0.1, 8 November 2026 |
| Repo | https://github.com/farellfaiz/muslims-daily |

Dokumen ini mencatat **apa** yang dibangun, **untuk siapa**, dan **kenapa** keputusannya begitu, termasuk ide yang sudah dicoba lalu ditolak. Detail teknis cara menjalankan ada di [README](../README.md).

---

## 1. Latar dan tujuan

Aplikasi ibadah yang ada umumnya berat, penuh iklan, meminta akun, atau tampilannya generik. Muslims Daily ingin menjadi pendamping ibadah harian yang:

1. **Cepat dan ringan**: terbuka seketika, nyaman di HP kelas menengah.
2. **Bisa offline**: jadwal salat dan semua doa tetap jalan tanpa internet.
3. **Menjaga privasi**: tanpa akun, tanpa iklan, tanpa pelacakan. Data tersimpan di perangkat pengguna.
4. **Elegan dan berciri khas**: bahasa visual diturunkan dari ikon aplikasi, bukan template generik.
5. **Jujur soal konten**: setiap doa punya sumber, dan doa yang bukan dari Al-Qur'an atau hadis diberi keterangan.

## 2. Pengguna

- **Utama**: pemilik sendiri, untuk pemakaian pribadi sehari-hari.
- **Berikutnya**: publik berbahasa Indonesia. Proyek ini open source (MIT) sehingga siapa pun bisa memakai dan berkontribusi.
- **Konteks pakai**: dibuka berkali-kali sehari dalam waktu singkat (cek waktu salat, centang salat, baca doa), sering dengan satu tangan.

## 3. Prinsip produk

| Prinsip | Artinya dalam praktik |
| --- | --- |
| Kebiasaan, bukan penilaian | Tracker hanya mencatat sudah atau belum salat. Tidak ada skor tepat waktu. |
| Memaafkan lupa | Salat boleh dicentang kapan saja, termasuk hari-hari sebelumnya. |
| Satu ketukan | Aksi paling sering (centang salat) cukup satu ketukan dari beranda. |
| Informasi utama dulu, tanpa teks berlebihan | Indikator visual lebih diutamakan daripada kalimat penjelasan. |
| Konten ibadah harus bisa dipertanggungjawabkan | Teks Arab dan sumber diambil dari rujukan, bukan dari ingatan. |

## 4. Ruang lingkup dan status fitur

Legenda: **Selesai** = sudah ada di `main`. **Draf** = jalan, tetapi isinya belum siap publik. **Nanti** = belum dikerjakan.

### 4.1 Jadwal salat (Selesai)
- Dihitung di perangkat dengan library `adhan`, tanpa API.
- Metode: **Kemenag RI** (bawaan; Subuh 20°, Isya 18°, ihtiyat 2 menit), MUIS Singapura, Muslim World League, Umm al-Qura.
- Mazhab untuk waktu Ashar: Syafi'i (juga sesuai untuk Maliki dan Hanbali) atau Hanafi.
- Lokasi: GPS (dibulatkan, tidak dikirim ke mana pun) atau 24 kota di Indonesia.
- Tanggal Hijriah memakai kalender Umm al-Qura dari browser.

### 4.2 Hero beranda (Selesai)
- Berbentuk pintu lengkung bawang seperti ikon aplikasi, dengan bukit krem yang naik ke kanan.
- **Langit mengikuti waktu sungguhan**: subuh, duha, dzuhur, ashar, maghrib, isya. Tidak ada pratinjau manual.
- **Dua mode busur**:
  - *Siang* (Subuh sampai Isya): Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya. Terbit memakai titik outline karena bukan waktu salat. Matahari bergerak sesuai jam. Chip di bawah hero: Terbit dan Terbenam.
  - *Malam* (Isya sampai Subuh): Isya, Tengah malam, awal sepertiga malam terakhir, Subuh. Ruas sepertiga malam terakhir disorot sebagai waktu terbaik qiyamul lail. Chip: awal sepertiga malam terakhir dan imsak untuk sahur.
  - Malam dihitung dari Maghrib sampai Subuh lalu dibagi tiga. Imsak = Subuh dikurangi 10 menit (kebiasaan imsakiyah Indonesia).
- **Teks di bukit** (rata kanan): "MENUJU SUBUH", hitung mundur besar `hh:mm:ss`, lalu "Pukul 04.06 WIB".

### 4.3 Catatan salat di beranda (Selesai)
- Lima baris salat dengan jam masing-masing. Satu ketukan = sudah salat, ketuk lagi = batal.
- **Pemilih hari** dengan panah kiri dan kanan (juga bisa digeser di HP): Hari ini, Kemarin, lalu nama hari. Tidak bisa maju melewati hari ini, mundur sampai satu tahun.
- Centang **tidak dikunci jadwal**. Pengguna sering lupa mencentang setelah salat.
- Salat berikutnya ditandai, hanya bila masih di hari yang sama.

### 4.4 Tracker (Selesai)
- **Streak**: jumlah hari lengkap (lima waktu) berturut-turut. Hari ini yang belum lengkap tidak memutus streak.
- Kartu streak: ikon api padat sewarna angka dengan percikan peach, plus baris **Rekor terbaik** berikon piala dan badge yang menyala saat streak sedang menyamai rekor.
- **Jejak 6 bulan** ala kontribusi GitHub: makin gelap = makin lengkap. Detail hari menampilkan lima indikator centang per salat, bawaan menampilkan hari ini.
- **Konsistensi per salat** (30 hari): bisa dibuka-tutup, tertutup secara bawaan.
- **Mode udzur** (haid atau nifas): menjeda pencatatan. Hari udzur tidak menambah dan tidak memutus streak.

### 4.5 Kumpulan doa (Selesai, konten Draf)
- Tampilan **kartu** atau **daftar**, filter kategori (Salat, Kebutuhan, Waktu, Aktivitas, Favorit), urutan (kategori, A sampai Z, terpendek, terpanjang), pencarian toleran ejaan (dhuha = duha).
- Mengetuk doa membuka **layar baru**, bukan pop-up, karena ada doa yang panjang.
- Layar baca: teks Arab, transliterasi, dan terjemahan (masing-masing bisa disembunyikan), **arti per kata**, ukuran huruf Arab, favorit, salin, bagikan, tandai sudah dibaca hari ini.
- Setiap doa punya halaman statis sendiri sehingga bisa dibagikan lewat tautan.
- **Status konten**: 9 doa contoh, semuanya `verified: false` dan diberi label "Draf, belum diverifikasi".

### 4.6 Lainnya (Selesai)
- Pengaturan lokasi, metode hitung, dan mazhab.
- Daftar fitur yang akan datang dan informasi tentang aplikasi.

### 4.7 PWA (Selesai)
- Bisa dipasang ke layar utama, seluruh aplikasi termasuk font di-precache (Workbox), memperbarui diri otomatis.
- Semua halaman di-prerender menjadi file statis sehingga bisa di-host gratis.

## 5. Log keputusan

Keputusan yang pernah dibahas, termasuk yang ditolak, supaya tidak diulang.

| Topik | Diputuskan | Ditolak / diganti | Alasan |
| --- | --- | --- | --- |
| Status tracker | Sudah atau belum salat | Tepat waktu / terlambat / terlewat | Tracker untuk menjaga kebiasaan, bukan menilai |
| Kapan boleh centang | Kapan saja, termasuk hari lalu | Hanya setelah waktu salat masuk | Pengguna sering lupa mencentang |
| Detail doa | Layar baru | Modal atau pop-up | Doa panjang tidak nyaman di pop-up |
| Langit hero | Mengikuti waktu asli | Tombol "pratinjau langit" | Fitur demo yang membingungkan pengguna |
| Busur hero | Dua mode, siang dan malam | Satu busur Subuh sampai Isya | Malam hari bulan muncul di posisi yang salah |
| Teks hero | Rata kanan, countdown besar lalu jam | Rata tengah dengan jam salat besar | Dicoba, pemilik lebih suka versi awal |
| Ikon streak | Api padat sewarna angka + percikan peach | Api di dalam kotak; api dengan inti peach | Lebih sederhana dan menyatu dengan angka |
| Konsistensi per salat | Bisa dibuka-tutup, tertutup bawaan | Selalu tampil | Mengurangi kepadatan halaman |
| Notifikasi adzan | Ditunda | Masuk MVP | PWA butuh server Web Push; iOS hanya jalan bila sudah dipasang |
| Gaya CSS | Token CSS + style per komponen | Tailwind | Lebih ringan dan cukup untuk desain ini |

## 6. Desain

- **Palet dari ikon**: navy `#33506F` (pintu lengkung), peach `#E59B78` (matahari, aksen saja), krem `#FDF3EA` (bukit), biru langit `#D3E4F3`, kertas `#FAF6F1`.
- **Huruf**: Fraunces (judul dan angka besar), Plus Jakarta Sans (isi), Amiri (Arab).
- **Motif**: lengkung bawang, bintang delapan (penanda nomor doa), langit yang berubah.
- **Gerak**: halus dan bermakna (transisi halaman, centang dengan percikan, api yang bergoyang), menghormati `prefers-reduced-motion`.
- **Mode**: terang dulu. Mode gelap masuk roadmap.
- **Tulisan**: bahasa Indonesia santai, label singkat, tanpa em dash, jam ditulis "04.06 WIB".

## 7. Aturan konten doa

1. Wajib ada sumber: ayat (surah dan nomor ayat) atau hadis (perawi).
2. Teks dicek dari rujukan (mushaf Kemenag, kitab hadis, Hisnul Muslim), bukan dari ingatan atau situs acak.
3. Doa yang bukan dari Al-Qur'an atau hadis boleh dimuat dengan `warn: true` dan keterangan jujur, misalnya doa setelah duha yang populer.
4. `verified` diubah menjadi `true` hanya setelah dicek oleh orang yang paham.

## 8. Teknis singkat

- SvelteKit 3 + Svelte 5, `adapter-static`, `@vite-pwa/sveltekit`, `adhan`, Fontsource.
- Data pengguna di `localStorage` dengan kunci `md:settings`, `md:tracker`, `md:doa`, `md:reading`.
- Logika jadwal, busur hero, dan tracker berupa fungsi murni yang diuji dengan Vitest.
- Anggaran performa: JavaScript di bawah 100 KB gzip (saat ini sekitar 67 KB), skor Lighthouse 95 ke atas, jalan penuh offline setelah kunjungan pertama.

## 9. Risiko dan batasan

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Konten doa keliru | Tinggi, menyangkut ibadah | Label draf, aturan konten, verifikasi sebelum rilis publik |
| Data hilang saat browser dibersihkan | Riwayat streak hilang | Fitur ekspor dan impor data (roadmap) |
| Notifikasi adzan terbatas di PWA | Pengguna tidak diingatkan | Fase 2 dengan Web Push; jelaskan batasan di iOS |
| Selisih jadwal dengan masjid setempat | Kepercayaan pengguna turun | Pilihan metode dan mazhab; ke depan penyesuaian manual per salat |
| Versi lama tersimpan service worker | Pengguna melihat versi lama sekali | Pembaruan otomatis; muat ulang berikutnya sudah versi baru |

## 10. Roadmap

**Berikutnya (prioritas)**
1. Verifikasi dan perbanyak konten doa dari rujukan terbuka.
2. Deploy ke hosting statis (Vercel atau Cloudflare Pages) dengan domain.
3. Ekspor dan impor data tracker (cadangan).

**Fitur**
- Dzikir pagi dan petang (memakai mesin yang sama dengan doa, plus penghitung).
- Al-Qur'an dengan terjemahan per kata.
- Arah kiblat dengan kalibrasi kompas.
- Mode gelap.
- Koleksi doa pribadi.
- Notifikasi adzan (Web Push).
- Penyesuaian manual jadwal per salat (+/- menit).

## 11. Pertanyaan terbuka

- Siapa yang akan memverifikasi konten doa sebelum rilis publik?
- Domain dan hosting final.
- Apakah selisih imsak tetap 10 menit, atau bisa diatur pengguna?
- Perlukah fitur khusus Ramadan (jadwal imsakiyah, tracker puasa)?
