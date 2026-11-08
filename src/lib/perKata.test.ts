import { describe, expect, it } from 'vitest';
import { DZIKIR } from './data/dzikir.ts';
import { SALAT } from './data/salat.ts';
import { SALAT_RINGKAS } from './data/salatRingkas.ts';
import { perKataKey, tokens, type PerKata } from './perKata.ts';
import raw from '../../static/data/per-kata.json';

const data = raw as unknown as PerKata;

// Semua teks yang tampil di halaman Dzikir, dengan kuncinya.
const texts: [string, string][] = [
	...[...SALAT, ...SALAT_RINGKAS].map((d) => [perKataKey('salat', d.id), d.arabic] as [string, string]),
	...DZIKIR.flatMap((d) => [
		[perKataKey('dzikir', d.id), d.arabic] as [string, string],
		...(d.petang ? [[perKataKey('dzikir', d.id, true), d.petang.arabic] as [string, string]] : [])
	])
];

describe('tokens', () => {
	it('tanda waqaf dan nomor ayat menempel ke kata sebelumnya', () => {
		expect(tokens('قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿١﴾ ٱللَّهُ ٱلصَّمَدُ ۚ')).toEqual(['قُلْ', 'هُوَ', 'ٱللَّهُ', 'أَحَدٌ ﴿١﴾', 'ٱللَّهُ', 'ٱلصَّمَدُ ۚ']);
	});
});

describe('data arti per kata', () => {
	it('setiap bacaan punya arti per kata dan tidak ada entri yatim', () => {
		expect(Object.keys(data).sort()).toEqual(texts.map(([k]) => k).sort());
	});

	it.each(texts)('%s cocok dengan teks Arab', (key, arabic) => {
		const e = data[key];
		// kata-kata (boleh digabung jadi frasa) harus persis teks Arab di aplikasi
		expect(e.w.map((w) => w[0]).join(' ')).toBe(tokens(arabic).join(' '));
		for (const w of e.w) {
			expect(w).toHaveLength(3);
			for (const v of w) expect(v.trim()).not.toBe('');
			expect(w.join('')).not.toContain('—');
		}
		expect(['quran', 'draf']).toContain(e.src);
	});

	it('hanya ayat Qur\'an yang bersumber quran.com', () => {
		for (const [key, e] of Object.entries(data)) {
			if (e.src !== 'quran') continue;
			const id = Number(key.split(':')[1]);
			const src = key.startsWith('salat:') ? [...SALAT, ...SALAT_RINGKAS].find((d) => d.id === id)?.source : DZIKIR.find((d) => d.id === id)?.source;
			expect(src).toMatch(/^QS\./);
		}
	});
});
