import { JUZ_URL, SURAT_URL, type Juz, type Surat } from '#lib/quran.ts';
import type { PageLoad } from './$types';

// Daftar surat dan juz kecil: saat prerender disisipkan ke HTML, saat pindah halaman diunduh (dan di-precache).
export const load: PageLoad = async ({ fetch }) => {
	const get = async <T,>(url: string): Promise<T> => {
		const r = await fetch(url);
		if (!r.ok) throw new Error(`${url} gagal dimuat (${r.status})`);
		return r.json();
	};
	const [surat, juz] = await Promise.all([get<Surat[]>(SURAT_URL), get<Juz[]>(JUZ_URL)]);
	return { surat, juz };
};
