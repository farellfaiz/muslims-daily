import { json } from '@sveltejs/kit';
import wirdulLathif from '#lib/data/wirdulLathif.json';

/**
 * Wirdul Lathif (versi kedua dzikir pagi petang) sebagai file terpisah: hanya diunduh bila versi ini
 * dipilih, supaya halaman Dzikir tidak membawa sekitar 65 KB data yang jarang dipakai.
 */
export const prerender = true;

export type WirdulData = typeof wirdulLathif;

export function GET() {
	return json(wirdulLathif);
}
