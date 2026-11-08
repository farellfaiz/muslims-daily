import { json } from '@sveltejs/kit';
import { DAILY } from '#lib/server/doa.ts';

/**
 * Kumpulan doa pendek untuk kartu "Doa pilihan" di beranda, sebagai file terpisah supaya HTML beranda
 * tidak membawa semuanya (pilihannya ditentukan tanggal di perangkat, jadi tetap perlu seluruh daftar).
 */
export const prerender = true;

export function GET() {
	return json(DAILY);
}
