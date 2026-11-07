import { describe, expect, it } from 'vitest';
import { angleDiff, distanceKm, headingFrom, qiblaBearing, smoothAngle, windName } from './qibla.ts';

describe('arah kiblat', () => {
	// Rujukan umum: arah kiblat Jakarta sekitar 295° (barat laut), jarak sekitar 7.900 km.
	it('Jakarta sekitar 295° barat laut', () => {
		const b = qiblaBearing(-6.2088, 106.8456);
		expect(b).toBeGreaterThan(294);
		expect(b).toBeLessThan(296);
		expect(windName(b)).toBe('barat laut');
		const km = distanceKm(-6.2088, 106.8456);
		expect(km).toBeGreaterThan(7800);
		expect(km).toBeLessThan(8000);
	});

	it('Jayapura sedikit lebih ke barat dan lebih jauh', () => {
		const b = qiblaBearing(-2.5337, 140.7181);
		expect(b).toBeGreaterThan(285);
		expect(b).toBeLessThan(qiblaBearing(-6.2088, 106.8456));
		expect(distanceKm(-2.5337, 140.7181)).toBeGreaterThan(distanceKm(-6.2088, 106.8456));
	});
});

describe('sudut', () => {
	it('selisih terpendek melewati 0°', () => {
		expect(angleDiff(350, 10)).toBe(20);
		expect(angleDiff(10, 350)).toBe(-20);
		expect(angleDiff(0, 180)).toBe(180);
	});

	it('perataan tidak berputar jauh saat melewati utara', () => {
		const s = smoothAngle(355, 5, 0.5);
		expect(s).toBe(0);
		expect(smoothAngle(null, 370)).toBe(10);
	});

	it('arah hadap dari event iOS dan Android', () => {
		expect(headingFrom({ alpha: 10, webkitCompassHeading: 120 })).toBe(120);
		expect(headingFrom({ alpha: 90, absolute: true })).toBe(270);
		expect(headingFrom({ alpha: 90, absolute: true }, 90)).toBe(0);
		expect(headingFrom({ alpha: null })).toBeNull();
		expect(headingFrom({ alpha: 30, absolute: false })).toBeNull();
	});
});
