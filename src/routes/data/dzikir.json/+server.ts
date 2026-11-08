import { json } from '@sveltejs/kit';
import { DZIKIR } from '#lib/data/dzikir.ts';
import { SALAT, SOURCE_NAME, SOURCE_URL } from '#lib/data/salat.ts';
import { SALAT_RINGKAS } from '#lib/data/salatRingkas.ts';

/**
 * Teks dzikir sebagai file statis (dibuat saat build). Data tetap ditulis di src/lib/data,
 * tapi tidak ikut JavaScript halaman: halaman Dzikir membacanya lewat load().
 */
export const prerender = true;

export type DzikirData = {
	source: { url: string; name: string };
	/** versi Al-Azhar (Syifa Budi) */
	salat: typeof SALAT;
	/** versi ringkas dari hadis sahih */
	salatRingkas: typeof SALAT_RINGKAS;
	dzikir: typeof DZIKIR;
};
// Wirdul Lathif (versi kedua pagi petang) ada di /data/wirdul.json, diunduh hanya bila dipilih.

export function GET() {
	return json({ source: { url: SOURCE_URL, name: SOURCE_NAME }, salat: SALAT, salatRingkas: SALAT_RINGKAS, dzikir: DZIKIR } satisfies DzikirData);
}
