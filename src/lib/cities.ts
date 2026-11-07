/**
 * Kota pilihan bila pengguna tidak mau berbagi lokasi GPS.
 * Koordinat pusat kota, cukup akurat untuk jadwal salat (selisih di bawah 1 menit dalam satu kota).
 */
export interface City {
	id: string;
	name: string;
	lat: number;
	lng: number;
}

export const CITIES: City[] = [
	{ id: 'banda-aceh', name: 'Banda Aceh', lat: 5.5483, lng: 95.3238 },
	{ id: 'medan', name: 'Medan', lat: 3.5952, lng: 98.6722 },
	{ id: 'padang', name: 'Padang', lat: -0.9471, lng: 100.4172 },
	{ id: 'pekanbaru', name: 'Pekanbaru', lat: 0.5071, lng: 101.4478 },
	{ id: 'palembang', name: 'Palembang', lat: -2.9761, lng: 104.7754 },
	{ id: 'pangkalpinang', name: 'Pangkalpinang', lat: -2.1291, lng: 106.109 },
	{ id: 'bandar-lampung', name: 'Bandar Lampung', lat: -5.3971, lng: 105.2668 },
	{ id: 'jakarta', name: 'Jakarta', lat: -6.2088, lng: 106.8456 },
	{ id: 'bogor', name: 'Bogor', lat: -6.5971, lng: 106.806 },
	{ id: 'bandung', name: 'Bandung', lat: -6.9175, lng: 107.6191 },
	{ id: 'semarang', name: 'Semarang', lat: -6.9667, lng: 110.4167 },
	{ id: 'yogyakarta', name: 'Yogyakarta', lat: -7.7956, lng: 110.3695 },
	{ id: 'surabaya', name: 'Surabaya', lat: -7.2575, lng: 112.7521 },
	{ id: 'malang', name: 'Malang', lat: -7.9666, lng: 112.6326 },
	{ id: 'denpasar', name: 'Denpasar', lat: -8.6705, lng: 115.2126 },
	{ id: 'mataram', name: 'Mataram', lat: -8.5833, lng: 116.1167 },
	{ id: 'pontianak', name: 'Pontianak', lat: -0.0263, lng: 109.3425 },
	{ id: 'banjarmasin', name: 'Banjarmasin', lat: -3.3186, lng: 114.5944 },
	{ id: 'balikpapan', name: 'Balikpapan', lat: -1.2379, lng: 116.8529 },
	{ id: 'samarinda', name: 'Samarinda', lat: -0.5022, lng: 117.1536 },
	{ id: 'makassar', name: 'Makassar', lat: -5.1477, lng: 119.4327 },
	{ id: 'manado', name: 'Manado', lat: 1.4748, lng: 124.8421 },
	{ id: 'ambon', name: 'Ambon', lat: -3.6954, lng: 128.1814 },
	{ id: 'jayapura', name: 'Jayapura', lat: -2.5337, lng: 140.7181 }
];

export const DEFAULT_CITY = CITIES.find((c) => c.id === 'jakarta')!;
