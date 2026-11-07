import { describe, expect, it } from 'vitest';
import { DZIKIR, forTime } from './dzikir.ts';

const ARABIC = /[؀-ۿ]/;

describe('data dzikir', () => {
	it('tidak kosong', () => {
		expect(DZIKIR.length).toBeGreaterThan(5);
	});

	it('id dan slug unik', () => {
		expect(new Set(DZIKIR.map((d) => d.id)).size).toBe(DZIKIR.length);
		expect(new Set(DZIKIR.map((d) => d.slug)).size).toBe(DZIKIR.length);
	});

	it.each(DZIKIR.map((d) => [d.slug, d] as const))('%s lengkap', (_, d) => {
		expect(d.title.trim()).not.toBe('');
		expect(Number.isInteger(d.count) && d.count >= 1).toBe(true);
		for (const t of [d, ...(d.petang ? [d.petang] : [])]) {
			expect(t.arabic).toMatch(ARABIC);
			expect(t.latin).not.toMatch(ARABIC);
			expect(t.latin.trim()).not.toBe('');
			expect(t.translation.trim()).not.toBe('');
		}
		expect(d.source.trim()).not.toBe('');
		expect(d.ref).toMatch(/^https:\/\//);
		// lafaz petang hanya masuk akal untuk bacaan yang dibaca di kedua waktu
		if (d.petang) expect(d.only).toBeUndefined();
		if (d.warn) expect(d.note?.trim()).toBeTruthy();
	});

	it('pagi dan petang sama-sama punya bacaan', () => {
		expect(forTime('pagi').length).toBeGreaterThan(5);
		expect(forTime('petang').length).toBeGreaterThan(5);
	});

	it('lafaz petang dipakai saat petang', () => {
		const withVariant = DZIKIR.find((d) => d.petang);
		if (!withVariant) return;
		expect(forTime('petang').find((d) => d.id === withVariant.id)!.text.arabic).toBe(withVariant.petang!.arabic);
		expect(forTime('pagi').find((d) => d.id === withVariant.id)!.text.arabic).toBe(withVariant.arabic);
	});
});
