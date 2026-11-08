import { DAILY } from '#lib/server/doa.ts';
import type { PageServerLoad } from './$types';

// Kumpulan doa pendek untuk kartu "doa hari ini"; pilihannya ditentukan tanggal di perangkat.
export const load: PageServerLoad = () => ({ daily: DAILY });
