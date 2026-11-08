import { describe, expect, it } from 'vitest';
import { DZIKIR } from './dzikir.ts';
import { SALAT } from './salat.ts';
import { SALAT_RINGKAS } from './salatRingkas.ts';

const ARABIC = /[؀-ۿ]/;

describe('dzikir setelah salat versi ringkas', () => {
	it('11 bacaan: 7 dzikir lalu 4 bacaan Al-Qur\'an', () => {
		expect(SALAT_RINGKAS).toHaveLength(11);
		expect(SALAT_RINGKAS.filter((d) => d.group === 'dzikir')).toHaveLength(7);
		expect(SALAT_RINGKAS.slice(7).every((d) => d.group === 'quran')).toBe(true);
	});

	it('id tidak bentrok dengan versi Al-Azhar (progres disimpan per id)', () => {
		const azhar = new Set(SALAT.map((d) => d.id));
		expect(SALAT_RINGKAS.some((d) => azhar.has(d.id))).toBe(false);
		expect(new Set(SALAT_RINGKAS.map((d) => d.id)).size).toBe(SALAT_RINGKAS.length);
	});

	it('istighfar 3, tasbih, tahmid, takbir 33', () => {
		const c = Object.fromEntries(SALAT_RINGKAS.map((d) => [d.slug, d.count]));
		expect([c.istighfar, c.tasbih, c.tahmid, c.takbir]).toEqual([3, 33, 33, 33]);
	});

	it('tiga surah tiga kali setelah Subuh dan Maghrib', () => {
		for (const slug of ['al-ikhlas', 'al-falaq', 'an-nas']) {
			const d = SALAT_RINGKAS.find((x) => x.slug === slug)!;
			expect(d.count).toBe(1);
			expect(d.countFor).toEqual({ subuh: 3, maghrib: 3 });
		}
	});

	it('teks ayat sama persis dengan dzikir pagi petang', () => {
		const kursi = SALAT_RINGKAS.find((d) => d.slug === 'ayat-kursi')!;
		expect(kursi.arabic).toBe(DZIKIR.find((d) => d.slug === 'ayat-kursi')!.arabic);
	});

	it.each(SALAT_RINGKAS.map((d) => [d.slug, d] as const))('%s lengkap dengan sumber', (_, d) => {
		expect(d.arabic).toMatch(ARABIC);
		expect(d.latin).not.toMatch(ARABIC);
		expect(d.translation.trim()).not.toBe('');
		expect(d.source).toMatch(/^(HR\.|QS\.)/);
		expect(d.ref).toMatch(/^https:\/\//);
		expect(d.verified).toBe(false);
		expect(`${d.title}${d.latin}${d.translation}${d.note ?? ''}${d.benefit ?? ''}`).not.toContain('—');
	});
});
