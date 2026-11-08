import { json } from '@sveltejs/kit';
import { DZIKIR } from '#lib/data/dzikir.ts';
import { SALAT, SOURCE_NAME, SOURCE_URL } from '#lib/data/salat.ts';

/**
 * Teks dzikir sebagai file statis (dibuat saat build). Data tetap ditulis di src/lib/data,
 * tapi tidak ikut JavaScript halaman: halaman Dzikir membacanya lewat load().
 */
export const prerender = true;

export type DzikirData = {
	source: { url: string; name: string };
	salat: typeof SALAT;
	dzikir: typeof DZIKIR;
};

export function GET() {
	return json({ source: { url: SOURCE_URL, name: SOURCE_NAME }, salat: SALAT, dzikir: DZIKIR } satisfies DzikirData);
}
