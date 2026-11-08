import { describe, expect, it } from 'vitest';
import { cardTop, GAP, spotlight, TOUR_STEPS } from './tour.ts';

/** isi semua file .svelte di src, untuk memastikan setiap target tour benar-benar ada */
const sources = Object.values(
	import.meta.glob<string>('/src/**/*.svelte', { query: '?raw', import: 'default', eager: true })
);

describe('langkah tour', () => {
	it('menemukan file komponen', () => expect(sources.length).toBeGreaterThan(20));

	it('setiap target punya elemen data-tour di kode', () => {
		for (const s of TOUR_STEPS) {
			expect(sources.some((src) => src.includes(`data-tour="${s.target}"`)), s.target).toBe(true);
		}
	});

	it('target unik dan langkah terakhir menunjuk tombol ulang tour', () => {
		expect(new Set(TOUR_STEPS.map((s) => s.target)).size).toBe(TOUR_STEPS.length);
		expect(TOUR_STEPS.at(-1)!.target).toBe('tour');
	});

	it('teks tanpa em dash', () => {
		for (const s of TOUR_STEPS) expect(s.title + s.body).not.toMatch(/—/);
	});

	it('teks Inggris terisi dan tanpa em dash', () => {
		for (const s of TOUR_STEPS) {
			expect(s.titleEn.trim(), s.target).not.toBe('');
			expect(s.bodyEn.trim(), s.target).not.toBe('');
			expect(s.titleEn + s.bodyEn, s.target).not.toMatch(/—/);
		}
	});
});

describe('cardTop', () => {
	const spot = { top: 100, left: 10, width: 300, height: 80 };

	it('di bawah sorotan bila muat', () => {
		expect(cardTop(spot, 150, 800)).toBe(100 + 80 + GAP);
	});

	it('di atas sorotan bila bawah tertutup navigasi', () => {
		const low = { ...spot, top: 600 };
		expect(cardTop(low, 150, 800, 90)).toBe(600 - GAP - 150);
	});

	it('menempel di atas layar bila sorotan setinggi layar', () => {
		const tall = { ...spot, top: 20, height: 760 };
		expect(cardTop(tall, 150, 800, 90)).toBe(GAP);
	});
});

describe('spotlight', () => {
	it('menambah jarak dan tetap di dalam layar', () => {
		expect(spotlight({ top: 2, left: 0, width: 375, height: 50 }, 375, 800)).toEqual({ top: 4, left: 4, width: 367, height: 56 });
	});
});
