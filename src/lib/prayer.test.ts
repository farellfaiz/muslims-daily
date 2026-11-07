import { describe, expect, it } from 'vitest';
import { DEFAULT_CITY } from './cities.ts';
import { heroArc, nextPrayer, skyPhase, timesFor } from './prayer.ts';

// Patokan: jadwal Kemenag Jakarta awal November ada di kisaran
// Subuh 04.0x, Dzuhur 11.4x, Ashar 14.5x/15.0x, Maghrib 17.5x, Isya 19.0x WIB.
// Waktu dibandingkan dalam UTC supaya tes tidak bergantung zona waktu mesin (WIB = UTC+7).
const minutesWIB = (d: Date) => ((d.getUTCHours() + 7) % 24) * 60 + d.getUTCMinutes();
const between = (d: Date, from: string, to: string) => {
	const m = minutesWIB(d);
	const [fh, fm] = from.split('.').map(Number);
	const [th, tm] = to.split('.').map(Number);
	return m >= fh * 60 + fm && m <= th * 60 + tm;
};

describe('jadwal salat Jakarta, 7 November 2026 (Kemenag)', () => {
	const t = timesFor(new Date(Date.UTC(2026, 10, 7, 5)), DEFAULT_CITY.lat, DEFAULT_CITY.lng, 'kemenag', 'syafii');

	it('masuk kisaran jadwal resmi', () => {
		expect(between(t.subuh, '03.55', '04.10')).toBe(true);
		expect(between(t.dzuhur, '11.35', '11.50')).toBe(true);
		expect(between(t.ashar, '14.50', '15.10')).toBe(true);
		expect(between(t.maghrib, '17.45', '18.00')).toBe(true);
		expect(between(t.isya, '18.55', '19.10')).toBe(true);
	});

	it('mazhab Hanafi memundurkan Ashar', () => {
		const h = timesFor(new Date(Date.UTC(2026, 10, 7, 5)), DEFAULT_CITY.lat, DEFAULT_CITY.lng, 'kemenag', 'hanafi');
		expect(h.ashar.getTime()).toBeGreaterThan(t.ashar.getTime());
	});

	it('salat berikutnya dan suasana langit', () => {
		const tomorrow = timesFor(new Date(Date.UTC(2026, 10, 8, 5)), DEFAULT_CITY.lat, DEFAULT_CITY.lng, 'kemenag', 'syafii');
		const afterDzuhur = new Date(t.dzuhur.getTime() + 60_000);
		expect(nextPrayer(afterDzuhur, t, tomorrow).key).toBe('ashar');
		expect(skyPhase(afterDzuhur, t)).toBe('dzuhur');
		const night = new Date(t.isya.getTime() + 3_600_000);
		expect(nextPrayer(night, t, tomorrow).at).toEqual(tomorrow.subuh);
		expect(skyPhase(night, t)).toBe('isya');
	});
});

describe('busur hero siang dan malam', () => {
	const at = (d: number) => new Date(Date.UTC(2026, 10, d, 5));
	const [y, t, tm] = [6, 7, 8].map((d) => timesFor(at(d), DEFAULT_CITY.lat, DEFAULT_CITY.lng, 'kemenag', 'syafii'));

	it('siang: Subuh sampai Isya dengan Terbit sebagai penanda', () => {
		const a = heroArc(new Date(+t.dzuhur + 60e3), y, t, tm);
		expect(a.mode).toBe('day');
		expect(a.points.map((p) => p.label)).toEqual(['Subuh', 'Terbit', 'Dzuhur', 'Ashar', 'Maghrib', 'Isya']);
		expect(a.points.find((p) => p.label === 'Terbit')!.kind).toBe('marker');
	});

	it('setelah Isya: busur sampai Subuh besok', () => {
		const a = heroArc(new Date(+t.isya + 3600e3), y, t, tm);
		expect(a.mode).toBe('night');
		expect(a.start).toEqual(t.isya);
		expect(a.end).toEqual(tm.subuh);
	});

	it('dini hari: busur dari Isya kemarin sampai Subuh hari ini', () => {
		const a = heroArc(new Date(+t.subuh - 3600e3), y, t, tm);
		expect(a.mode).toBe('night');
		expect(a.start).toEqual(y.isya);
		expect(a.end).toEqual(t.subuh);
	});

	it('sepertiga malam terakhir dihitung dari Maghrib sampai Subuh', () => {
		const a = heroArc(new Date(+t.isya + 60e3), y, t, tm);
		const night = +tm.subuh - +t.maghrib;
		expect(+a.lastThird!.from).toBe(+tm.subuh - night / 3);
		expect(+a.midnight!).toBe(+t.maghrib + night / 2);
		expect(+a.imsak!).toBe(+tm.subuh - 10 * 60e3);
		// Jakarta awal November: sepertiga terakhir mulai sekitar pukul 00.40 WIB
		expect(between(a.lastThird!.from, '00.30', '00.50')).toBe(true);
	});
});

