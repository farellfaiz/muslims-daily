# PRD: Muslims Daily

| | |
| --- | --- |
| Pemilik | Farell Faiz Firmansyah |
| Status | MVP lengkap, belum di-deploy; konten doa dari buku Kemenag menunggu dicek orang yang paham |
| Versi dokumen | 0.3, 8 November 2026 |
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
- **Berikutnya**: publik berbahasa Indonesia, dan pengguna yang lebih nyaman dengan antarmuka bahasa Inggris. Proyek ini open source (MIT) sehingga siapa pun bisa memakai dan berkontribusi.
- **Konteks pakai**: dibuka berkali-kali sehari dalam waktu singkat (cek waktu salat, centang salat, baca doa), sering dengan satu tangan.

## 3. Prinsip produk

| Prinsip | Artinya dalam praktik |
| --- | --- |
| Kebiasaan, bukan penilaian | Tracker hanya mencatat sudah atau belum salat. Tidak ada skor tepat waktu. |
| Memaafkan lupa | Salat boleh dicentang kapan saja, termasuk hari-hari sebelumnya. |
| Satu ketukan | Aksi paling sering (centang salat) cukup satu ketukan dari beranda. |
| Informasi utama dulu, tanpa teks berlebihan | Indikator visual lebih diutamakan daripada kalimat penjelasan. |
| Konten ibadah harus bisa dipertanggungjawabkan | Teks Arab dan sumber diambil dari rujukan, bukan dari ingatan. Yang disusun sendiri disebut begitu di kredit. |

## 4. Ruang lingkup dan status fitur

Legenda: **Selesai** = sudah ada di `main`. **Nanti** = belum dikerjakan.

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
  - Malam dihitung dari Maghrib sampai Subuh lalu dibagi tiga. Imsak = Subuh dikurangi 10 menit (bisa diatur).
- **Teks di bukit** (rata kanan): "MENUJU SUBUH", hitung mundur besar `hh:mm:ss`, lalu "Pukul 04.06 WIB".

### 4.3 Catatan salat di beranda (Selesai)
- Lima baris salat dengan jam masing-masing. Satu ketukan = sudah salat, ketuk lagi = batal.
- **Pemilih hari** dengan panah kiri dan kanan (juga bisa digeser di HP): Hari ini, Kemarin, lalu nama hari. Tidak bisa maju melewati hari ini, mundur sampai satu tahun.
- Salat yang **sudah masuk waktunya** bebas dicentang kapan saja, termasuk hari-hari sebelumnya. Salat hari ini yang **belum masuk waktunya dikunci**: lingkaran putus-putus redup, ketukan memunculkan "Waktu Ashar belum masuk. Masuk pukul 14.57." Centang yang sudah ada selalu bisa dibatalkan.
- Salat berikutnya ditandai, hanya bila masih di hari yang sama.
- Di bawahnya: menu cepat (Doa, Dzikir, Al-Qur'an, Kiblat) dan kartu **Doa pilihan** yang berganti tiap hari.

### 4.4 Tracker (Selesai)
- **Streak**: jumlah hari lengkap (lima waktu) berturut-turut. Hari ini yang belum lengkap tidak memutus streak.
- Kartu streak: ikon api padat sewarna angka dengan percikan peach, plus baris **Rekor terbaik** berikon piala.
- **Jejak 6 bulan** ala kontribusi GitHub: makin gelap = makin lengkap.
- **Konsistensi per salat** (30 hari): bisa dibuka-tutup, tertutup secara bawaan.
- **Mode udzur** (haid atau nifas): menjeda pencatatan. Hari udzur tidak menambah dan tidak memutus streak.

### 4.5 Kumpulan doa (Selesai)
- **260 doa dari dua sumber**:
  - **NU Online** (quran.nu.or.id/doa): 180 doa dalam 16 kategori, diunduh dengan `scripts/doa-data.mjs`. Arab, latin, terjemahan, dan keterangan sumber disalin apa adanya.
  - **Buku "Kumpulan Doa Sehari-hari", Kemenag RI (cetakan III, 2013)**: 80 doa yang belum ada di NU Online, disusun dengan `scripts/doa-kemenag.mjs` dari `scripts/data/doa-kemenag.src.json`. 25 doa buku yang sudah ada di NU Online atau di fitur dzikir dilewati supaya tidak dobel.
    - Doa dari ayat: teks, latin, dan terjemahan Kemenag diambil dari data Al-Qur'an aplikasi, bukan diketik ulang. Latin per kata quran.com diubah ke gaya NU Online (`src/lib/latinNu.ts`) supaya seragam.
    - Doa lain: teks Arab ditranskripsi dari gambar halaman buku (font Arab di PDF tidak bisa diekstrak). Salah cetak yang jelas dibetulkan dan dicatat di keterangan. Transliterasi dan terjemahannya disusun Muslims Daily, bukan salinan terjemahan buku (buku mencantumkan larangan memperbanyak).
    - Rujukan ayat yang keliru di buku dibetulkan (mis. "Ali Imran 193-294" menjadi 193-194) dan dicatat.
- **Layar awal /doa**: kotak cari, kartu besar "Semua doa", Favorit, pintasan dzikir setelah salat, **Koleksi kamu**, lalu kartu kategori (16 kategori NU ditambah Doa dari Al-Qur'an, Ampunan & Taubat, Pagi & Petang).
- Daftar: tampilan **kartu** atau **daftar**, urutan (bawaan, A sampai Z, terpendek, terpanjang), pencarian toleran ejaan (dhuha = duha = dluha).
- Mengetuk doa membuka **layar baru**, bukan pop-up, karena ada doa yang panjang. Layar baca: teks Arab, transliterasi, dan terjemahan (bisa disembunyikan), ukuran huruf Arab, favorit, salin, bagikan, koleksi, tandai sudah dibaca hari ini, dan keterangan sumber (tautan NU Online, atau judul buku dan halamannya).
- Setiap doa punya halaman statis sendiri sehingga bisa dibagikan lewat tautan.
- **Koleksi doa pribadi**: tombol Koleksi di layar baca membuka lembar untuk mencentang satu atau beberapa koleksi, atau membuat koleksi baru. Tiap koleksi punya halaman sendiri (`/doa/koleksi?id=...`) dengan ubah nama dan hapus; menghapus koleksi tidak menghapus doanya. Koleksi ikut cadangan dan digabung saat dipulihkan.

### 4.6 Lainnya (Selesai)
- Daftar pengaturan seperti aplikasi pada umumnya: ikon, judul, dan subjudul berisi nilai saat ini. Mengetuk satu baris membuka layarnya sendiri (`/lainnya/lokasi`, `/metode`, `/adzan`, `/koreksi`, `/cadangan`).
- **Tour aplikasi** dan **install ke home screen** (bila belum terpasang) di bagian atas.
- **Koreksi jadwal**: geser tiap salat per menit, maksimal 30 menit, dipakai di semua tempat. **Imsak**: 5, 10 (bawaan), atau 15 menit sebelum Subuh.
- **Tampilan**: tema Device, Terang (bawaan), atau Gelap; dan **bahasa** Indonesia atau English.
- **Cadangan data**: simpan ke `muslims-daily-cadangan-YYYY-MM-DD.json` (pengaturan, catatan salat, favorit, koleksi, preferensi baca, posisi baca Al-Qur'an, pengaturan dzikir dan adzan, bahasa, tema) dan pulihkan dengan konfirmasi. Catatan salat, hari udzur, favorit, dan koleksi **digabung**; pengaturan diganti isi cadangan. File rusak ditolak dengan pesan jelas.
- **Kredit**: Pillars (inspirasi desain), NU Online, Hisnul Muslim edisi Indonesia, Wirdul Lathif NU Online, adhan, quran.com, dan Kementerian Agama RI.

### 4.7 Dzikir (Selesai)
- Satu halaman `/dzikir` dengan dua jenis: **Setelah salat** dan **Pagi & petang**. Pilihan bawaan mengikuti jam; bisa diganti manual, dan tautan `?set=salat` atau `?set=pagi-petang` membuka langsung.
- **Setelah salat**, dua versi:
  - **Ringkas** (bawaan): 11 bacaan sahih mengikuti bab dzikir setelah salam dalam Hisnul Muslim (`src/lib/data/salatRingkas.ts`).
  - **Al-Azhar (Syifa Budi)**: 6 dzikir lalu 16 doa dari situs pemilik [Dzikir & Doa Setelah Sholat](https://farellfaiz.github.io/dzikr-and-duas/) (`src/lib/data/salat.ts`).
- **Pagi & petang**, dua versi:
  - **Hisnul Muslim** (bawaan, `src/lib/data/dzikir.ts`): teks Arab dari hisnmuslim.com dan Al-Qur'an, **terjemahan resmi Hisnul Muslim edisi Indonesia** (alih bahasa H. Mahrus Ali), rujukan hadis per bacaan, dan keterangan jujur bila sanadnya dinilai lemah. Terjemahan ayat (Ayat Kursi, tiga qul) dari Kemenag. Terjemahan lafaz petang memakai terjemahan pagi buku dengan kata waktunya disesuaikan (buku hanya mencetak Arab versi sore).
  - **Wirdul Lathif** (al-Habib Abdullah al-Haddad): 56 bacaan pagi dan 56 sore dari NU Online (`scripts/wirdul-lathif.mjs`), Arab, latin, dan terjemahan apa adanya. Datanya file terpisah yang baru diunduh bila versi ini dipilih.
- Kartu tiap bacaan: nomor bintang, judul, jumlah bacaan, Arab, latin, terjemahan, sumber, keutamaan, catatan.
- **Penghitung**: tombol hitung mengambang untuk bacaan yang sedang di tengah layar; titik untuk bacaan pendek, angka dan bilah untuk 100x. Getar halus tiap ketukan; saat selesai layar bergeser ke bacaan berikutnya.
- Progres tersimpan per sesi (tiap salat, pagi, petang) dan mulai dari nol saat tanggal berganti.
- **Journey**: gambaran alur sesi, satu ruas per bacaan, dan daftar langkah lengkap di lembar bawah.
- **Pengaturan dzikir** (lembar sendiri): versi setelah salat, versi pagi petang, jumlah tasbih 33× atau 11×, getar, dan geser otomatis.
- **Per kata**: hanya untuk ayat Al-Qur'an (arti per kata quran.com). Bacaan hadis tidak punya sumber arti per kata yang terbuka, jadi tidak ditampilkan.

### 4.8 Al-Qur'an (Selesai)
- Daftar 114 surat dan tab juz, pencarian surat (ejaan longgar), lompat ke ayat (mis. "2:255"), dan **lanjutkan membaca** dari posisi terakhir.
- Halaman baca per surat: teks Utsmani, transliterasi, dan arti per kata dari quran.com, terjemahan Kemenag. Isi surat diunduh saat dibuka lalu disimpan untuk offline.

### 4.9 Kiblat (Selesai)
- Arah kiblat dihitung di perangkat dari lokasi yang dipilih, lengkap dengan arah mata angin dan jarak ke Ka'bah.
- **Kompas**: piringan berputar mengikuti arah hadap HP. Saat selisih 4° atau kurang, bingkai menyala peach, muncul "Sudah menghadap kiblat", dan HP bergetar singkat. Panduan kalibrasi angka 8.

### 4.10 Notifikasi adzan (Selesai, terbatas)
- Tanpa server: notifikasi dijadwalkan di perangkat. Selama aplikasi masih hidup (terbuka atau berjalan di latar), jam diperiksa berkala dan notifikasi dimunculkan lewat service worker saat waktu salat masuk.
- Sakelar utama, pilihan per salat, dan pengingat 5, 10, atau 15 menit sebelumnya. Notifikasi yang terlambat lebih dari 10 menit tidak dimunculkan.
- Di iPhone hanya jalan bila aplikasi sudah di-install ke home screen. Tidak bisa berbunyi saat aplikasi benar-benar ditutup (butuh Web Push dari server).

### 4.11 Install, splash, dan tour (Selesai)
- **Ajakan install**: kartu di beranda pada kunjungan pertama dan kelima, plus lembar panduan per platform (dialog bawaan Chrome, iPhone lewat Bagikan, browser di dalam aplikasi lain).
- **Splash screen**: pintu lengkung navy, matahari peach terbit dari balik bukit, lalu "Muslims Daily / Your daily Muslim companion". Saat aplikasi siap, pintu membesar seolah kita melangkah masuk lalu memudar. CSS murni di `src/app.html` supaya tampil sebelum JavaScript. Sekali per sesi, minimal sekitar 1,7 detik, bisa di-tap, menutup sendiri setelah 5 detik bila JavaScript gagal.
- **Tour aplikasi**: ditawarkan sekali di beranda saat pertama buka (setelah splash hilang). Tour hanya jalan bila pengguna mengetuk Mulai. 9 langkah dengan sorotan dan kartu penjelas, berpindah halaman bila perlu (beranda, doa, dzikir, lainnya). Bisa diulang dari Lainnya > Tour aplikasi.

### 4.12 Bahasa (Selesai)
- Antarmuka Indonesia (bawaan) atau English, dipilih di Lainnya > Tampilan dan langsung berganti tanpa muat ulang.
- Teks ditulis berpasangan di tempatnya: `tr('Jadwal salat', 'Prayer times')` (`src/lib/i18n.svelte.ts`). Nama salat dalam bahasa Inggris: Fajr, Dhuhr, Asr, Maghrib, Isha.
- **Isi doa, dzikir, dan terjemahan Al-Qur'an tetap berbahasa Indonesia** karena sumbernya berbahasa Indonesia; ini disebutkan di bawah pilihan bahasa.
- Halaman diprerender dalam bahasa Indonesia; pengguna bahasa Inggris melihat teks Inggris begitu aplikasi hidup di browser.

### 4.13 Mode gelap (Selesai)
- Palet malam diturunkan dari ikon: latar navy pekat, aksen biru muda, peach tetap sebagai matahari.
- Tema dipasang sebelum halaman digambar (tidak berkedip), dan warna bilah status ikut latar.

### 4.14 PWA (Selesai)
- Bisa di-install ke home screen, seluruh aplikasi termasuk font di-precache (Workbox), memperbarui diri otomatis.
- Service worker mengabaikan query saat mencocokkan cache, supaya `/dzikir?set=...`, `/doa/semua?cari`, dan `/doa/koleksi?id=...` tetap membuka halamannya sendiri saat offline.
- Semua halaman di-prerender menjadi file statis sehingga bisa di-host gratis.

## 5. Log keputusan

Keputusan yang pernah dibahas, termasuk yang ditolak, supaya tidak diulang.

| Topik | Diputuskan | Ditolak / diganti | Alasan |
| --- | --- | --- | --- |
| Status tracker | Sudah atau belum salat | Tepat waktu / terlambat / terlewat | Tracker untuk menjaga kebiasaan, bukan menilai |
| Kapan boleh centang | Setelah waktu salat masuk, kapan saja sesudahnya (termasuk hari lalu) | Bebas tanpa kunci; hanya di dalam waktu salat itu | Salat yang belum tiba tidak masuk akal dicentang, tapi pengguna sering lupa mencentang yang sudah lewat |
| Detail doa | Layar baru | Modal atau pop-up | Doa panjang tidak nyaman di pop-up |
| Langit hero | Mengikuti waktu asli | Tombol "pratinjau langit" | Fitur demo yang membingungkan pengguna |
| Busur hero | Dua mode, siang dan malam | Satu busur Subuh sampai Isya | Malam hari bulan muncul di posisi yang salah |
| Teks hero | Rata kanan, countdown besar lalu jam | Rata tengah dengan jam salat besar | Dicoba, pemilik lebih suka versi awal |
| Gaya CSS | Token CSS + style per komponen | Tailwind | Lebih ringan dan cukup untuk desain ini |
| Pulihkan cadangan | Gabung catatan salat, favorit, koleksi | Timpa seluruh data | Memulihkan di HP yang sudah dipakai tidak boleh menghapus data baru |
| Koreksi jadwal | Per salat, per menit, maks 30 | Satu geser untuk semua salat | Selisih dengan masjid biasanya tidak sama di tiap salat |
| Dzikir | Penghitung ketuk, satu halaman bergulir | Satu bacaan per layar | Mudah melihat urutan dan melompat |
| Kiblat | Piringan berputar, penunjuk tetap | Jarum berputar di atas piringan diam | Sama dengan kompas fisik |
| Label "Draf" di konten | Tidak ada label draf; yang disusun sendiri disebut di kredit ("disusun Muslims Daily") | Label "Draf, belum diverifikasi" di tiap doa dan kartu | Pemilik tidak ingin peringatan di UI; kejujuran tetap lewat keterangan sumber |
| Arti per kata hadis | Tidak ditampilkan | Draf susunan AI dengan label draf | Tidak ada sumber terbuka; lebih baik tidak ada daripada tidak bersumber |
| Dzikir pagi petang | Hisnul Muslim + Wirdul Lathif sebagai versi kedua | Al-Ma'tsurat dari situs pemilik | Bagian Al-Ma'tsurat di situs itu hanya 11 ayat tanpa rujukan |
| Terjemahan doa buku Kemenag | Disusun sendiri | Salin terjemahan buku | Buku mencantumkan larangan memperbanyak isinya |
| Doa dobel | Doa buku yang sudah ada di NU Online dilewati | Masukkan semua | Hindari dua versi doa yang sama |
| Kredit di halaman Doa | Hanya di halaman tiap doa dan Lainnya > Kredit | Paragraf kredit di bawah layar /doa | Diminta pemilik |
| Tour | Ditawarkan sekali, jalan hanya bila diketuk Mulai | Langsung jalan saat pertama buka | Tidak memaksa pengguna |
| Splash | Sekali per sesi | Tiap pindah halaman | Tidak mengganggu |
| Subtitle splash | "Your daily Muslim companion" | "Pendamping ibadah harian", "Your daily worship companion" | Pilihan pemilik |
| Data daftar doa | Satu file bersama yang dimuat di browser | Ditanam di HTML tiap halaman | HTML Semua doa turun dari 509 KB ke 17 KB |

## 6. Desain

- **Palet dari ikon**: navy `#33506F` (pintu lengkung), peach `#E59B78` (matahari, aksen saja), krem `#FDF3EA` (bukit), biru langit `#D3E4F3`, kertas `#FAF6F1`.
- **Huruf**: Fraunces (judul dan angka besar), Plus Jakarta Sans (isi), Amiri 400 (Arab; versi tebal tidak dimuat karena tidak dipakai).
- **Motif**: lengkung bawang, bintang delapan (penanda nomor), langit yang berubah.
- **Gerak**: halus dan bermakna, menghormati `prefers-reduced-motion`.
- **Mode**: terang dan gelap. Semua warna lewat token CSS di `src/app.css`.
- **Tulisan**: bahasa Indonesia santai, label singkat, tanpa em dash, jam ditulis "04.06 WIB". Istilah yang umum dalam bahasa Inggris tetap Inggris (install, home screen, offline, backup, dark mode, tracker, streak, tap). Teks Inggris natural dan singkat.

## 7. Aturan konten doa dan dzikir

1. Wajib ada sumber: ayat (surah dan nomor ayat), hadis (perawi), atau buku rujukan beserta halamannya.
2. Teks Arab diambil dari rujukan (mushaf, kitab hadis, Hisnul Muslim, NU Online, buku Kemenag), bukan dari ingatan atau situs acak. Ayat selalu diambil dari data Al-Qur'an aplikasi.
3. Doa yang bukan dari Al-Qur'an atau hadis boleh dimuat dengan keterangan jujur, misalnya doa setelah duha yang populer.
4. Transliterasi atau terjemahan yang disusun sendiri disebut begitu di keterangan sumber dan kredit, bukan dengan label draf.
5. `verified` diubah menjadi `true` hanya setelah dicek oleh orang yang paham.

## 8. Teknis singkat

- SvelteKit 3 + Svelte 5, `adapter-static`, `@vite-pwa/sveltekit` (service worker sendiri di `src/service-worker/sw.ts`), `adhan`, Fontsource.
- Data pengguna di `localStorage` dengan awalan `md:`: `settings`, `tracker`, `doa` (favorit, koleksi, preferensi daftar), `reading`, `backup`, `theme`, `lang`, `dzikir`, `dzikirPrefs`, `quran`, `adzan`, `tour`, `visits`.
- Logika jadwal, busur hero, tracker, kiblat, hitungan dzikir, cadangan, koleksi, tour, dan latin gaya NU berupa fungsi murni yang diuji dengan Vitest.
- Anggaran performa: JavaScript yang diunduh **per halaman** paling banyak 100 KB gzip. Saat ini halaman terberat sekitar 70 KB, bagian bersama sekitar 62 KB. Cek dengan `node scripts/js-budget.mjs` setelah `npm run build`.
  - Data besar tidak ditaruh di JavaScript atau di HTML halaman: teks dzikir (`/data/dzikir.json`), Wirdul Lathif (`/data/wirdul.json`, hanya bila dipilih), ringkasan semua doa (`/data/doa-items.json`, dipakai bersama Semua doa, Favorit, Koleksi), pool doa pilihan beranda (`/data/daily.json`), arti per kata, dan isi Al-Qur'an disajikan sebagai file data.
- Skor Lighthouse 95 ke atas, dan jalan penuh offline setelah kunjungan pertama.

## 9. Risiko dan batasan

| Risiko | Dampak | Mitigasi |
| --- | --- | --- |
| Konten doa keliru | Tinggi, menyangkut ibadah | Aturan konten, sumber per doa, verifikasi sebelum rilis publik; doa non-Qur'an dari buku Kemenag paling perlu dicek (cetakannya banyak salah ketik) |
| Data hilang saat browser dibersihkan | Riwayat streak dan koleksi hilang | Cadangan ke file JSON, dengan penanda bila belum pernah dicadangkan |
| Notifikasi adzan terbatas di PWA | Tidak berbunyi saat aplikasi ditutup | Dijelaskan di halaman pengaturannya; Web Push butuh server |
| Selisih jadwal dengan masjid setempat | Kepercayaan pengguna turun | Pilihan metode dan mazhab, plus koreksi manual per salat |
| Kompas HP tidak akurat | Arah salat keliru | Derajat dan arah mata angin selalu tampil; panduan kalibrasi |
| Versi lama tersimpan service worker | Pengguna melihat versi lama sekali | Pembaruan otomatis; muat ulang berikutnya sudah versi baru |
| Antarmuka Inggris, isi Indonesia | Pengguna asing tidak memahami terjemahan | Dijelaskan di bawah pilihan bahasa; terjemahan Inggris butuh sumber terbuka |

## 10. Roadmap

**Berikutnya (prioritas)**
1. Deploy ke hosting statis (Vercel atau Cloudflare Pages) dengan domain.
2. Mode Ramadan sebelum Ramadan 1448 H (sekitar pertengahan Februari 2027): jadwal imsakiyah, tracker puasa, doa berbuka dan sahur.
3. Verifikasi konten doa dan dzikir oleh orang yang paham.

**Fitur**
- Terjemahan Inggris untuk ayat (mis. dari quran.com) dan doa, bila ada sumber terbuka.
- Pengingat dzikir pagi dan petang (bersama notifikasi adzan).
- Riwayat dzikir di tracker.
- Hapus doa dari koleksi langsung di daftar koleksi.

## 11. Pertanyaan terbuka

- Siapa yang akan memverifikasi konten doa dan dzikir sebelum rilis publik?
- Domain dan hosting final.
- Bentuk mode Ramadan.
