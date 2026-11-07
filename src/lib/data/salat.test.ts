import { describe, expect, it } from 'vitest';
import { SALAT } from './salat.ts';

const ARABIC = /[؀-ۿ]/;

describe('data dzikir dan doa setelah salat', () => {
	it('6 dzikir lalu 16 doa, sesuai sumber', () => {
		expect(SALAT.filter((d) => d.group === 'dzikir')).toHaveLength(6);
		expect(SALAT.filter((d) => d.group === 'doa')).toHaveLength(16);
		// dzikir selalu di depan doa
		const firstDoa = SALAT.findIndex((d) => d.group === 'doa');
		expect(SALAT.slice(firstDoa).every((d) => d.group === 'doa')).toBe(true);
	});

	it('tasbih, tahmid, takbir 33 kali; istighfar 3 kali', () => {
		const c = Object.fromEntries(SALAT.map((d) => [d.slug, d.count]));
		expect([c.istighfar, c.tasbih, c.tahmid, c.takbir]).toEqual([3, 33, 33, 33]);
	});

	it('id dan slug unik, teks lengkap', () => {
		expect(new Set(SALAT.map((d) => d.id)).size).toBe(SALAT.length);
		expect(new Set(SALAT.map((d) => d.slug)).size).toBe(SALAT.length);
		for (const d of SALAT) {
			expect(d.arabic).toMatch(ARABIC);
			expect(d.latin).not.toMatch(ARABIC);
			expect(d.translation.trim()).not.toBe('');
		}
	});
});
