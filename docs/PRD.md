# PRD: Muslims Daily

| | |
| --- | --- |
| Pemilik | Farell Faiz Firmansyah |
| Status | MVP berjalan, konten doa dan dzikir masih draf |
| Versi dokumen | 0.2, 8 November 2026 |
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
- Salat yang **sudah masuk waktunya** bebas dicentang kapan saja, termasuk hari-hari sebelumnya (pengguna sering lupa mencentang). Salat hari ini yang **belum masuk waktunya dikunci**: lingkaran putus-putus redup, ketukan memunculkan "Waktu Ashar belum masuk. Masuk pukul 14.57." Centang yang sudah ada selalu bisa dibatalkan.
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
- Halaman utama berupa daftar pengaturan seperti aplikasi pada umumnya: ikon, judul, dan subjudul berisi nilai saat ini. Mengetuk satu baris membuka layarnya sendiri (`/lainnya/lokasi`, `/metode`, `/koreksi`, `/cadangan`) dengan tombol kembali.
- **Lokasi** (GPS atau kota) dan **metode hitung** dengan mazhab Ashar.
- **Koreksi jadwal**: geser tiap salat per menit, maksimal 30 menit ke depan atau ke belakang, dengan jam hari ini yang langsung terlihat untuk dicocokkan dengan jadwal masjid. Ringkasan tampil di subjudul daftar ("Tanpa koreksi" atau "Maghrib +2"). Koreksi dipakai di semua tempat: hero, catatan salat, hari-hari lalu.
- **Imsak**: 5, 10 (bawaan), atau 15 menit sebelum Subuh.
- **Tampilan**: Device (ikut pengaturan HP), Terang, atau Gelap. Bawaannya Terang.
- **Cadangan data**: ringkasan (hari tercatat, jumlah salat, doa favorit) dan kapan terakhir dicadangkan; penanda peach bila sudah ada catatan tapi belum pernah dicadangkan.
  - *Simpan* mengunduh `muslims-daily-cadangan-YYYY-MM-DD.json` berisi pengaturan, catatan salat, favorit, dan preferensi baca. Tidak ada server.
  - *Pulihkan* membaca file itu, menampilkan ringkasan isinya, lalu menunggu konfirmasi. Catatan salat, hari udzur, dan favorit **digabung** (tidak ada centang yang hilang); lokasi, metode, dan preferensi baca diganti isi cadangan.
  - File rusak atau dari aplikasi lain ditolak dengan pesan jelas; bagian yang rusak dibuang tanpa menggagalkan sisanya.
- Daftar fitur yang akan datang dan informasi tentang aplikasi.

### 4.7 Dzikir (Selesai; konten pagi petang Draf)
- Satu halaman `/dzikir` dengan dua jenis: **Setelah salat** dan **Pagi & petang**. Pilihan bawaan mengikuti jam: sampai 45 menit setelah masuk waktu salat dibuka dzikir setelah salat; selebihnya Subuh sampai Dzuhur dan Ashar sampai Maghrib dibuka dzikir pagi petang. Bisa diganti manual, dan tautan `?set=salat` membuka langsung.
- **Setelah salat**, dua versi yang bisa dipilih pengguna (pilihan diingat, `md:dzikirPrefs`). Pilihan salat (Subuh sampai Isya) otomatis ke salat terakhir yang sudah masuk; dini hari masih terhitung setelah Isya kemarin.
  - **Al-Azhar (Syifa Budi)**, bawaan: 6 dzikir (istighfar 3×, tasbih, tahmid, takbir masing-masing 33×, dan lainnya) lalu 16 doa, diambil apa adanya dari situs pemilik [Dzikir & Doa Setelah Sholat](https://farellfaiz.github.io/dzikr-and-duas/) (`src/lib/data/salat.ts`). Bagian Al-Ma'tsurat dari situs itu sengaja tidak dipakai.
  - **Ringkas** (Draf): 11 bacaan sahih mengikuti bab dzikir setelah salam dalam Hisnul Muslim: istighfar 3×, Allāhumma antas-salām, lā ilāha illallāh… lā māni'a (Bukhari 844, Muslim 593), tasbih, tahmid, takbir 33× dan tahlil penutup (Bukhari 843, Muslim 597), Ayat Kursi, lalu Al-Ikhlas, Al-Falaq, An-Nas (Abu Dawud 1523; tiga kali setelah Subuh dan Maghrib). Bacaan khusus Subuh atau Maghrib tidak dimasukkan supaya tetap pendek. Teks Arab dipotong otomatis dari teks hadis dan teks Al-Qur'an oleh `scripts/salat-ringkas.mjs` (`src/lib/data/salatRingkas.ts`); latin dan terjemahan masih perlu dicek.
- **Pagi & petang**: mengikuti sistem Muslims Daily (Hisnul Muslim, sumber per bacaan, `src/lib/data/dzikir.ts`). Waktu bawaan: pagi dari Subuh sampai sebelum Ashar, selebihnya petang.
- Setiap bacaan berupa kartu: nomor bintang, judul, jumlah bacaan, teks Arab, latin, terjemahan, sumber, keutamaan, dan catatan jujur bila sanadnya dinilai lemah.
- Lafaz yang berbeda antara pagi dan petang (*aṣbaḥnā* dan *amsainā*) otomatis menyesuaikan. Ada bacaan yang khusus pagi atau khusus petang.
- **Penghitung**: tombol besar di bawah tiap kartu, satu ketukan = satu bacaan. Bacaan pendek (sampai 10x) memakai titik-titik, bacaan panjang (100x) memakai angka dan bilah. HP bergetar halus tiap ketukan. Saat selesai, kartu meredup dan layar bergeser ke bacaan berikutnya.
- Progres ("5 dari 22 bacaan") tersimpan per sesi (tiap salat, pagi, petang), masing-masing dengan tanggalnya sendiri, dan mulai dari nol saat tanggal berganti. Ada tombol mulai ulang.
- Halaman Doa punya pintasan "Dzikir & doa setelah salat".
- **Journey**: kartu di atas progres yang memberi gambaran alur sesi (mis. "6 dzikir lalu 16 doa"), satu ruas per bacaan, bacaan berikutnya, dan daftar langkah lengkap yang bisa dibuka; ketuk langkah untuk melompat ke kartunya.
- **Per kata** (Draf): tombol di sebelah Latin dan Terjemahan. Teks Arab dipecah per kata dengan transliterasi dan artinya, tanpa mengubah teks Arab (dicek otomatis oleh tes). Ayat Qur'an (Ayat Kursi, Al-Ikhlas, Al-Falaq, An-Nas, dan tiga doa dari ayat) memakai arti per kata quran.com; dzikir dan doa dari hadis masih draf susunan AI yang perlu dicek orang yang paham, dan diberi label begitu di tiap kartu. Datanya file statis `static/data/per-kata.json` (sekitar 9 KB gzip) yang baru diunduh saat tombol dinyalakan dan ikut di-precache untuk offline.
- Memakai preferensi baca yang sama dengan doa (latin, terjemahan, ukuran huruf Arab).

### 4.8 Kiblat (Selesai)
- Arah kiblat dihitung di perangkat (lingkaran besar) dari lokasi yang dipilih, lengkap dengan arah mata angin dan jarak ke Ka'bah.
- **Kompas**: piringan berputar mengikuti arah hadap HP (iOS meminta izin lewat ketukan "Aktifkan kompas"). Penunjuk tetap di atas. Saat selisih 4° atau kurang, bingkai menyala peach, muncul "Sudah menghadap kiblat", dan HP bergetar singkat. Sebelum sejajar muncul petunjuk "Putar ke kanan 12°".
- Tanpa kompas (laptop) atau izin ditolak: piringan diam dengan utara di atas dan petunjuk derajat.
- Panduan kalibrasi angka 8, disorot bila akurasi kompas buruk.

### 4.9 Mode gelap (Selesai)
- Palet malam diturunkan dari ikon: latar navy pekat, aksen biru muda, peach tetap sebagai matahari. Bukit hero menjadi siluet gelap di bawah langit.
- Bawaannya Terang. Bisa dipilih Gelap, atau Device untuk mengikuti pengaturan HP. Tema dipasang sebelum halaman digambar (tidak berkedip), dan warna bilah status ikut latar.

### 4.10 PWA (Selesai)
- Bisa dipasang ke layar utama, seluruh aplikasi termasuk font di-precache (Workbox), memperbarui diri otomatis.
- Semua halaman di-prerender menjadi file statis sehingga bisa di-host gratis.

## 5. Log keputusan

Keputusan yang pernah dibahas, termasuk yang ditolak, supaya tidak diulang.

| Topik | Diputuskan | Ditolak / diganti | Alasan |
| --- | --- | --- | --- |
| Status tracker | Sudah atau belum salat | Tepat waktu / terlambat / terlewat | Tracker untuk menjaga kebiasaan, bukan menilai |
| Kapan boleh centang | Setelah waktu salat masuk, kapan saja sesudahnya (termasuk hari lalu) | Bebas tanpa kunci (versi awal); hanya di dalam waktu salat itu | Salat yang belum tiba tidak masuk akal dicentang, tapi pengguna sering lupa mencentang yang sudah lewat |
| Detail doa | Layar baru | Modal atau pop-up | Doa panjang tidak nyaman di pop-up |
| Langit hero | Mengikuti waktu asli | Tombol "pratinjau langit" | Fitur demo yang membingungkan pengguna |
| Busur hero | Dua mode, siang dan malam | Satu busur Subuh sampai Isya | Malam hari bulan muncul di posisi yang salah |
| Teks hero | Rata kanan, countdown besar lalu jam | Rata tengah dengan jam salat besar | Dicoba, pemilik lebih suka versi awal |
| Ikon streak | Api padat sewarna angka + percikan peach | Api di dalam kotak; api dengan inti peach | Lebih sederhana dan menyatu dengan angka |
| Konsistensi per salat | Bisa dibuka-tutup, tertutup bawaan | Selalu tampil | Mengurangi kepadatan halaman |
| Notifikasi adzan | Ditunda | Masuk MVP | PWA butuh server Web Push; iOS hanya jalan bila sudah dipasang |
| Gaya CSS | Token CSS + style per komponen | Tailwind | Lebih ringan dan cukup untuk desain ini |
| Pulihkan cadangan | Gabung catatan salat | Timpa seluruh data | Memulihkan di HP yang sudah dipakai tidak boleh menghapus centang baru |
| Imsak | Bisa diatur 5, 10, 15 menit (bawaan 10) | Tetap 10 menit | Jadwal imsakiyah tiap daerah berbeda |
| Koreksi jadwal | Per salat, per menit, maks 30 | Satu geser untuk semua salat | Selisih dengan masjid biasanya tidak sama di tiap salat |
| Dzikir | Penghitung ketuk di tiap kartu, satu halaman bergulir | Satu bacaan per layar | Mudah melihat urutan dan melompat; layar bergeser sendiri saat bacaan selesai |
| Sumber dzikir setelah salat | Situs pemilik (dzikr-and-duas) | Hisnul Muslim | Susunan yang biasa dibaca pemilik; bagian lain situs itu tidak dipakai |
| Kiblat | Piringan berputar, penunjuk tetap | Jarum berputar di atas piringan diam | Sama dengan kompas fisik; Ka'bah terlihat "datang" ke atas saat sejajar |

## 6. Desain

- **Palet dari ikon**: navy `#33506F` (pintu lengkung), peach `#E59B78` (matahari, aksen saja), krem `#FDF3EA` (bukit), biru langit `#D3E4F3`, kertas `#FAF6F1`.
- **Huruf**: Fraunces (judul dan angka besar), Plus Jakarta Sans (isi), Amiri (Arab).
- **Motif**: lengkung bawang, bintang delapan (penanda nomor doa), langit yang berubah.
- **Gerak**: halus dan bermakna (transisi halaman, centang dengan percikan, api yang bergoyang), menghormati `prefers-reduced-motion`.
- **Kredit**: tombol di halaman Lainnya yang membuka pop up berisi "Desain terinspirasi dari Pillars" dan pustaka adhan. Sumber dzikir setelah salat cukup disebut di halaman Dzikir.
- **Mode**: terang dan gelap (langit malam). Semua warna lewat token CSS di `src/app.css`; komponen tidak boleh menulis warna langsung.
- **Tulisan**: bahasa Indonesia santai, label singkat, tanpa em dash, jam ditulis "04.06 WIB".

## 7. Aturan konten doa dan dzikir

1. Wajib ada sumber: ayat (surah dan nomor ayat) atau hadis (perawi).
2. Teks dicek dari rujukan (mushaf Kemenag, kitab hadis, Hisnul Muslim), bukan dari ingatan atau situs acak.
3. Doa yang bukan dari Al-Qur'an atau hadis boleh dimuat dengan `warn: true` dan keterangan jujur, misalnya doa setelah duha yang populer.
4. `verified` diubah menjadi `true` hanya setelah dicek oleh orang yang paham.

## 8. Teknis singkat

- SvelteKit 3 + Svelte 5, `adapter-static`, `@vite-pwa/sveltekit`, `adhan`, Fontsource.
- Data pengguna di `localStorage` dengan kunci `md:settings`, `md:tracker`, `md:doa`, `md:reading`, `md:backup` (waktu cadangan terakhir), `md:theme`, `md:dzikir` (hitungan dzikir hari ini).
- Logika jadwal, busur hero, tracker, kiblat, hitungan dzikir, dan cadangan berupa fungsi murni yang diuji dengan Vitest.
- Anggaran performa: JavaScript yang diunduh **per halaman** paling banyak 100 KB gzip (entri aplikasi, layout, kode halaman, dan impornya). Saat ini halaman terberat sekitar 62 KB. Cek dengan `node scripts/js-budget.mjs` setelah `npm run build`; skrip gagal bila ada halaman yang melewati batas.
  - Yang paling perlu dijaga adalah **bagian bersama** (sekitar 55 KB: kerangka aplikasi, Svelte, pustaka adhan), karena ikut terunduh di semua halaman.
  - Total JavaScript semua halaman (sekitar 107 KB) hanya dipantau, bukan batas: angkanya pasti naik setiap ada halaman baru, tapi menentukan besar unduhan pertama untuk offline.
  - Data besar tidak ditaruh di JavaScript: teks dzikir (`/data/dzikir.json`), arti per kata, dan isi Al-Qur'an disajikan sebagai file data.
- Skor Lighthouse 95 ke atas, dan jalan penuh offline setelah kunjungan pertama.

## 9. Risiko dan batasan

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Konten doa keliru | Tinggi, menyangkut ibadah | Label draf, aturan konten, verifikasi sebelum rilis publik |
| Data hilang saat browser dibersihkan | Riwayat streak hilang | Cadangan ke file JSON di halaman Lainnya, dengan penanda bila belum pernah dicadangkan |
| Notifikasi adzan terbatas di PWA | Pengguna tidak diingatkan | Fase 2 dengan Web Push; jelaskan batasan di iOS |
| Selisih jadwal dengan masjid setempat | Kepercayaan pengguna turun | Pilihan metode dan mazhab, plus koreksi manual per salat |
| Kompas HP tidak akurat (magnet, belum dikalibrasi) | Arah salat keliru | Derajat dan arah mata angin selalu tampil; panduan kalibrasi angka 8; sarankan mencocokkan dengan arah masjid terdekat |
| Versi lama tersimpan service worker | Pengguna melihat versi lama sekali | Pembaruan otomatis; muat ulang berikutnya sudah versi baru |

## 10. Roadmap

**Berikutnya (prioritas)**
1. Verifikasi konten doa dan dzikir oleh orang yang paham, lalu perbanyak doa dari rujukan terbuka.
2. Deploy ke hosting statis (Vercel atau Cloudflare Pages) dengan domain.

**Fitur**
- Al-Qur'an dengan terjemahan per kata.
- Koleksi doa pribadi.
- Notifikasi adzan (Web Push).
- Pengingat dzikir pagi dan petang (bersama notifikasi adzan).
- Riwayat dzikir di tracker (jejak hari dzikir pagi dan petang).

## 11. Pertanyaan terbuka

- Siapa yang akan memverifikasi konten doa dan dzikir sebelum rilis publik?
- Domain dan hosting final.
- Perlukah fitur khusus Ramadan (jadwal imsakiyah, tracker puasa)?
