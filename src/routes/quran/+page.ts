import { SURAT_URL, type Surat } from '#lib/quran.ts';
import type { PageLoad } from './$types';

// Daftar surat kecil: saat prerender disisipkan ke HTML, saat pindah halaman diunduh (dan di-precache).
export const load: PageLoad = async ({ fetch }) => {
	const r = await fetch(SURAT_URL);
	if (!r.ok) throw new Error(`Daftar surat gagal dimuat (${r.status})`);
	return { surat: (await r.json()) as Surat[] };
};
