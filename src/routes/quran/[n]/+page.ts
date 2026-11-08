import { error } from '@sveltejs/kit';
import { SURAT_URL, suratUrl, type Surat, type SuratData } from '#lib/quran.ts';
import type { EntryGenerator, PageLoad } from './$types';

// Isi surat dimuat di perangkat, bukan disisipkan ke HTML: 114 halaman tetap berupa kerangka kecil,
// dan isi surat (sampai ~90 KB untuk Al-Baqarah) diunduh hanya saat dibuka lalu disimpan untuk offline.
export const ssr = false;
export const entries: EntryGenerator = () => Array.from({ length: 114 }, (_, i) => ({ n: String(i + 1) }));

export const load: PageLoad = async ({ params, fetch }) => {
	const n = Number(params.n);
	if (!Number.isInteger(n) || n < 1 || n > 114) error(404, 'Surat tidak ditemukan');

	const list: Surat[] = await fetch(SURAT_URL).then((r) => {
		if (!r.ok) throw new Error(`Daftar surat gagal dimuat (${r.status})`);
		return r.json();
	});
	// Bila offline dan surat ini belum pernah dibuka, tampilkan pesan, bukan halaman error.
	const isi: SuratData | null = await fetch(suratUrl(n))
		.then((r) => (r.ok ? r.json() : null))
		.catch(() => null);

	return { surat: list[n - 1], prev: list[n - 2] ?? null, next: list[n] ?? null, isi };
};
