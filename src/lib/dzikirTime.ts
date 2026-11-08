import type { Dzikir, DzikirText, DzikirTime } from './data/dzikir.ts';

/**
 * Bacaan pagi atau petang, dengan lafaz yang sudah disesuaikan.
 * Menerima daftar sebagai argumen supaya halaman tidak perlu membundel data dzikir;
 * datanya datang dari /data/dzikir.json.
 */
export function forTime(list: Dzikir[], time: DzikirTime): (Dzikir & { text: DzikirText })[] {
	return list
		.filter((d) => !d.only || d.only === time)
		.map((d) => ({
			...d,
			text: time === 'petang' && d.petang ? d.petang : { arabic: d.arabic, latin: d.latin, translation: d.translation }
		}));
}
