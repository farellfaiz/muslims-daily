import { describe, expect, it } from 'vitest';
import { VISIT_GAP, detectPlatform, emptyVisits, shouldOffer, touchVisit } from './install.ts';

const IPHONE = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Version/18.0 Mobile/15E148 Safari/604.1';
const IPAD = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 Version/18.0 Safari/605.1.15';
const ANDROID = 'Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/130.0 Mobile Safari/537.36';
const IG = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148 Instagram 350.0';
const WEBVIEW = 'Mozilla/5.0 (Linux; Android 14; SM-A546E; wv) AppleWebKit/537.36 Version/4.0 Chrome/130.0 Mobile Safari/537.36';

describe('detectPlatform', () => {
	it('memakai dialog bawaan bila browser menyediakannya', () => {
		expect(detectPlatform(ANDROID, 5, true)).toBe('prompt');
	});
	it('mengenali iPhone dan iPad yang mengaku Mac', () => {
		expect(detectPlatform(IPHONE, 5)).toBe('ios');
		expect(detectPlatform(IPAD, 5)).toBe('ios');
		expect(detectPlatform(IPAD, 0)).toBe('manual'); // Mac sungguhan
	});
	it('mengenali browser di dalam aplikasi, walau ada dialog', () => {
		expect(detectPlatform(IG, 5)).toBe('inapp');
		expect(detectPlatform(WEBVIEW, 5, true)).toBe('inapp');
	});
	it('jatuh ke cara manual bila belum ada dialog', () => {
		expect(detectPlatform(ANDROID, 5)).toBe('manual');
	});
});

describe('kunjungan dan ajakan', () => {
	const T = 1_800_000_000_000;

	it('kunjungan pertama langsung ditawari', () => {
		const s = touchVisit(emptyVisits(), T);
		expect(s.visits).toBe(1);
		expect(shouldOffer(s)).toBe(true);
	});

	it('membuka lagi dalam 30 menit tidak dihitung kunjungan baru', () => {
		let s = touchVisit(emptyVisits(), T);
		s = touchVisit(s, T + VISIT_GAP - 1);
		expect(s.visits).toBe(1);
		s = touchVisit(s, T + 2 * VISIT_GAP);
		expect(s.visits).toBe(2);
	});

	it('ditutup di kunjungan pertama, muncul lagi di kunjungan kelima saja', () => {
		let s = { ...touchVisit(emptyVisits(), T), dismissedAt: 1 };
		const shown: number[] = [];
		for (let i = 1; i <= 7; i++) {
			s = touchVisit(s, T + i * VISIT_GAP);
			if (shouldOffer(s)) shown.push(s.visits);
		}
		expect(shown).toEqual([5]);
		expect(shouldOffer({ ...s, visits: 5, dismissedAt: 5 })).toBe(false);
	});

	it('tidak ditawari lagi setelah dipasang', () => {
		expect(shouldOffer({ ...emptyVisits(), visits: 5, installed: true })).toBe(false);
	});
});
