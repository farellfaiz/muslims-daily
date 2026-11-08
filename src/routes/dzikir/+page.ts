import type { DzikirData } from '../data/dzikir.json/+server.ts';
import type { PageLoad } from './$types';

// Saat prerender, respons ini disisipkan ke HTML sehingga teks langsung tampil.
// Saat pindah halaman di dalam aplikasi, file JSON-nya diunduh (dan di-precache untuk offline).
export const load: PageLoad = async ({ fetch }) => {
	const r = await fetch('/data/dzikir.json');
	if (!r.ok) throw new Error(`Teks dzikir gagal dimuat (${r.status})`);
	return (await r.json()) as DzikirData;
};
