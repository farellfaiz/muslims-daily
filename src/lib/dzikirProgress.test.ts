import { describe, expect, it } from 'vitest';
import { afterPrayer, counts, doneCount, emptyProgress, pagiPetang, resetSession, suggestedSet, tap } from './dzikirProgress.ts';
import type { DayTimes } from './prayer.ts';

const D = '2026-11-08';
const at = (h: number, m = 0) => new Date(2026, 10, 8, h, m);
const t = { subuh: at(4, 6), terbit: at(5, 20), dzuhur: at(11, 40), ashar: at(14, 57), maghrib: at(17, 50), isya: at(19, 2) } as DayTimes;

describe('hitungan dzikir', () => {
	it('ketukan bertambah dan berhenti di jumlah bacaan', () => {
		let p = emptyProgress();
		for (let i = 0; i < 5; i++) p = tap(p, 'pagi', D, 3, 3);
		expect(counts(p, 'pagi', D)[3]).toBe(3);
		expect(counts(p, 'petang', D)).toEqual({});
	});

	it('tanggal baru mulai dari nol, per sesi', () => {
		let p = tap(emptyProgress(), 'isya', '2026-11-07', 1, 1);
		p = tap(p, 'subuh', D, 1, 1);
		expect(counts(p, 'isya', '2026-11-07')).toEqual({ 1: 1 });
		expect(counts(p, 'subuh', D)).toEqual({ 1: 1 });
		expect(counts(p, 'subuh', '2026-11-09')).toEqual({});
	});

	it('menghitung bacaan selesai dan mulai ulang satu sesi', () => {
		const items = [
			{ id: 1, count: 1 },
			{ id: 2, count: 33 }
		];
		let p = tap(emptyProgress(), 'dzuhur', D, 1, 1);
		p = tap(p, 'dzuhur', D, 2, 33);
		p = tap(p, 'ashar', D, 1, 1);
		expect(doneCount(p, 'dzuhur', D, items)).toBe(1);
		p = resetSession(p, 'dzuhur', D);
		expect(doneCount(p, 'dzuhur', D, items)).toBe(0);
		expect(doneCount(p, 'ashar', D, items)).toBe(1);
	});
});

describe('sesi menurut jam', () => {
	it('salat terakhir yang sudah masuk', () => {
		expect(afterPrayer(at(12, 0), t)).toEqual({ prayer: 'dzuhur', date: D });
		expect(afterPrayer(at(19, 2), t)).toEqual({ prayer: 'isya', date: D });
		// dini hari masih "setelah Isya" kemarin
		expect(afterPrayer(at(1, 30), t)).toEqual({ prayer: 'isya', date: '2026-11-07' });
	});

	it('pagi dan petang', () => {
		expect(pagiPetang(at(6, 0), t)).toBe('pagi');
		expect(pagiPetang(at(15, 30), t)).toBe('petang');
		expect(pagiPetang(at(2, 0), t)).toBe('petang');
	});

	it('set yang disarankan', () => {
		expect(suggestedSet(at(4, 20), t)).toBe('salat');
		expect(suggestedSet(at(6, 30), t)).toBe('pagi-petang');
		expect(suggestedSet(at(12, 0), t)).toBe('salat');
		expect(suggestedSet(at(13, 30), t)).toBe('salat');
		expect(suggestedSet(at(15, 10), t)).toBe('salat');
		expect(suggestedSet(at(16, 0), t)).toBe('pagi-petang');
		expect(suggestedSet(at(21, 0), t)).toBe('salat');
	});
});
