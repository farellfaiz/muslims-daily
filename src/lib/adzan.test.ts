import { describe, expect, it } from 'vitest';
import { alertTag, alertText, alertsFor, defaultAdzanPrefs, dueAlerts, nextAlert, notifSupport, type AdzanPrefs } from './adzan.ts';
import type { DayTimes } from './prayer.ts';

const at = (d: number, h: number, m: number) => new Date(2026, 10, d, h, m);
const day = (d: number): DayTimes => ({
	subuh: at(d, 4, 10),
	terbit: at(d, 5, 30),
	dzuhur: at(d, 11, 50),
	ashar: at(d, 15, 10),
	maghrib: at(d, 17, 55),
	isya: at(d, 19, 5)
});
const on = (p: Partial<AdzanPrefs> = {}): AdzanPrefs => ({ ...defaultAdzanPrefs(), enabled: true, ...p });

describe('alertsFor', () => {
	it('kosong selama sakelar utama mati', () => {
		expect(alertsFor(day(8), defaultAdzanPrefs())).toEqual([]);
	});
	it('satu notifikasi per waktu salat yang dinyalakan', () => {
		const prefs = on({ on: { subuh: true, dzuhur: false, ashar: true, maghrib: true, isya: false } });
		expect(alertsFor(day(8), prefs).map((a) => a.key)).toEqual(['subuh', 'ashar', 'maghrib']);
	});
	it('menambah pengingat sebelum adzan, urut waktu', () => {
		const list = alertsFor(day(8), on({ before: 10, on: { subuh: true, dzuhur: true, ashar: false, maghrib: false, isya: false } }));
		expect(list.map((a) => `${a.key}:${a.kind}`)).toEqual(['subuh:before', 'subuh:adzan', 'dzuhur:before', 'dzuhur:adzan']);
		expect(list[0].at).toEqual(at(8, 4, 0));
		expect(list[0].prayerAt).toEqual(at(8, 4, 10));
	});
});

describe('dueAlerts', () => {
	const list = alertsFor(day(8), on());
	it('hanya yang lewat sejak pemeriksaan terakhir', () => {
		const due = dueAlerts(list, at(8, 11, 49), at(8, 11, 50));
		expect(due.map((a) => a.key)).toEqual(['dzuhur']);
		expect(dueAlerts(list, at(8, 11, 50), at(8, 11, 51))).toEqual([]);
	});
	it('melewatkan yang sudah terlalu terlambat (HP tertidur)', () => {
		expect(dueAlerts(list, at(8, 11, 0), at(8, 12, 30))).toEqual([]);
		expect(dueAlerts(list, at(8, 11, 0), at(8, 11, 58)).map((a) => a.key)).toEqual(['dzuhur']);
	});
});

describe('nextAlert', () => {
	it('lanjut ke Subuh besok setelah Isya', () => {
		const n = nextAlert(at(8, 20, 0), day(8), day(9), on());
		expect(n?.key).toBe('subuh');
		expect(n?.at).toEqual(at(9, 4, 10));
	});
	it('melewati waktu yang dimatikan', () => {
		const n = nextAlert(at(8, 12, 0), day(8), day(9), on({ on: { subuh: false, dzuhur: true, ashar: false, maghrib: false, isya: true } }));
		expect(n?.key).toBe('isya');
	});
	it('null bila semua dimatikan', () => {
		expect(nextAlert(at(8, 12, 0), day(8), day(9), on({ on: { subuh: false, dzuhur: false, ashar: false, maghrib: false, isya: false } }))).toBeNull();
	});
});

describe('teks dan tag', () => {
	const [before, adzan] = alertsFor(day(8), on({ before: 5, on: { subuh: false, dzuhur: false, ashar: false, maghrib: true, isya: false } }));
	it('judul dan isi berbahasa Indonesia', () => {
		expect(alertText(adzan, 'Jakarta', 5)).toEqual({ title: 'Waktu Maghrib', body: 'Sudah masuk waktu Maghrib, pukul 17.55 · Jakarta' });
		expect(alertText(before, 'Jakarta', 5).title).toBe('Maghrib 5 menit lagi');
	});
	it('tag berbeda untuk pengingat dan adzan', () => {
		expect(alertTag(adzan)).toBe('adzan-2026-11-8-maghrib-adzan');
		expect(alertTag(before)).not.toBe(alertTag(adzan));
	});
});

describe('notifSupport', () => {
	it('iPhone wajib dipasang dulu', () => {
		expect(notifSupport(false, true, true, false)).toBe('ios-install');
		expect(notifSupport(true, true, true, true)).toBe('ok');
	});
	it('butuh Notification dan service worker', () => {
		expect(notifSupport(false, true, false, false)).toBe('unsupported');
		expect(notifSupport(true, true, false, false)).toBe('ok');
	});
});
