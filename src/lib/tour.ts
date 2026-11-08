/**
 * Tour aplikasi: langkah-langkah dan hitungan posisi kartu penjelasnya.
 * Tanpa akses DOM supaya bisa dites; komponen Tour.svelte yang mengukur dan menggambar.
 *
 * Tiap langkah menyorot elemen dengan atribut `data-tour="<target>"` di halaman `route`
 * (tanpa `route`: elemen yang ada di semua halaman, mis. navigasi bawah).
 */

export interface TourStep {
	route?: string;
	target: string;
	title: string;
	body: string;
}

export const TOUR_STEPS: TourStep[] = [
	{
		route: '/',
		target: 'hero',
		title: 'Jadwal salat',
		body: 'Hitung mundur ke salat berikutnya. Warna langitnya ikut waktu asli, dari Subuh sampai malam.'
	},
	{
		route: '/',
		target: 'lokasi',
		title: 'Lokasi',
		body: 'Tap di sini buat ganti kota atau pakai GPS, biar jadwalnya sesuai tempat kamu.'
	},
	{
		route: '/',
		target: 'catatan',
		title: 'Catatan salat',
		body: 'Centang salat yang sudah kamu kerjakan. Lupa centang kemarin? Mundurkan harinya pakai tombol panah.'
	},
	{
		route: '/',
		target: 'streak',
		title: 'Streak',
		body: 'Jumlah hari berturut-turut yang salatnya lengkap. Heatmap dan detailnya ada di Tracker.'
	},
	{
		route: '/',
		target: 'menu',
		title: 'Menu',
		body: "Jalan pintas ke doa, dzikir, Al-Qur'an, dan arah kiblat."
	},
	{
		route: '/doa',
		target: 'doa',
		title: 'Kumpulan doa',
		body: 'Ratusan doa per kategori, lengkap dengan Arab, latin, dan terjemahan. Bisa di-search juga.'
	},
	{
		route: '/dzikir',
		target: 'dzikir',
		title: 'Dzikir',
		body: 'Pilih dzikir setelah salat atau pagi petang. Tap tombol di bawah tiap selesai baca, hitungannya jalan sendiri.'
	},
	{
		target: 'nav',
		title: 'Navigasi',
		body: 'Pindah halaman dari sini. Pengaturan jadwal, backup, dan dark mode ada di Lainnya.'
	},
	{
		route: '/lainnya',
		target: 'tour',
		title: 'Mau ulang tour?',
		body: 'Tour ini bisa kamu buka lagi kapan saja dari sini. Selamat beribadah!'
	}
];

export interface Box {
	top: number;
	left: number;
	width: number;
	height: number;
}

/** Jarak sorotan dari tepi elemen. */
export const PAD = 8;
/** Jarak kartu dari sorotan dan dari tepi layar. */
export const GAP = 12;

/**
 * Posisi atas kartu penjelas: di bawah sorotan bila muat, di atasnya bila tidak,
 * dan bila dua-duanya tidak muat (elemen hampir setinggi layar, mis. hero) kartu menempel di atas
 * layar. Bagian atas elemen besar biasanya hiasan, isi pentingnya (mis. hitung mundur) di bawah.
 * `bottomInset` = ruang yang tertutup navigasi bawah, supaya kartu tidak tertindih.
 */
export function cardTop(spot: Box, cardH: number, viewH: number, bottomInset = 0): number {
	const below = spot.top + spot.height + GAP;
	if (below + cardH <= viewH - bottomInset - GAP) return below;
	const above = spot.top - GAP - cardH;
	if (above >= GAP) return above;
	return GAP;
}

/** Kotak sorotan: elemen ditambah PAD, dipotong supaya tetap di dalam layar. */
export function spotlight(el: Box, viewW: number, viewH: number): Box {
	const top = Math.max(4, el.top - PAD);
	const left = Math.max(4, el.left - PAD);
	const right = Math.min(viewW - 4, el.left + el.width + PAD);
	const bottom = Math.min(viewH - 4, el.top + el.height + PAD);
	return { top, left, width: Math.max(0, right - left), height: Math.max(0, bottom - top) };
}
