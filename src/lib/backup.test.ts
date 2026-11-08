import { describe, expect, it } from 'vitest';
import { BackupError, backupFileName, makeBackup, mergeTracker, parseBackup, trackerSummary } from './backup.ts';
import { emptyTracker, type TrackerData } from './tracker.ts';

const now = new Date(2026, 10, 8, 9, 30);
const settings = { place: 'jakarta', label: 'Jakarta', lat: -6.2, lng: 106.8, method: 'kemenag' as const, madhab: 'syafii' as const, adjust: { maghrib: 2 }, imsak: 10 };
const reading = { lat: true, tr: true, wbw: false, size: 30 };
const doa = { view: 'card' as const, sort: 'kat' as const, favs: [1, 3], koleksi: [{ id: 'a1', name: 'Harian', ids: [3, 9] }] };
const tracker: TrackerData = {
	logs: { '2026-11-07': { subuh: true, isya: true }, '2026-11-08': { subuh: true } },
	udzurDays: ['2026-10-01'],
	udzurSince: null
};

const roundTrip = () => JSON.stringify(makeBackup({ settings, tracker, doa, reading }, now));

describe('ekspor', () => {
	it('nama file memakai tanggal lokal', () => {
		expect(backupFileName(now)).toBe('muslims-daily-cadangan-2026-11-08.json');
	});

	it('status "sudah dibaca hari ini" tidak ikut', () => {
		const b = makeBackup({ settings, tracker, doa: { ...doa, readOn: '2026-11-08', read: [1] } as never, reading }, now);
		expect(b.doa).toEqual(doa);
	});
});

describe('impor', () => {
	it('bolak-balik ekspor lalu impor menghasilkan data yang sama', () => {
		const p = parseBackup(roundTrip());
		expect(p.tracker).toEqual(tracker);
		expect(p.settings).toEqual(settings);
		expect(p.doa).toEqual(doa);
		expect(p.reading).toEqual(reading);
		expect(p.exportedAt?.getTime()).toBe(now.getTime());
	});

	it('menolak file yang bukan JSON atau bukan dari aplikasi ini', () => {
		expect(() => parseBackup('halo')).toThrow(BackupError);
		expect(() => parseBackup('{"app":"lain"}')).toThrow(BackupError);
		expect(() => parseBackup('[]')).toThrow(BackupError);
	});

	it('menolak cadangan dari versi yang lebih baru', () => {
		const raw = JSON.parse(roundTrip());
		raw.version = 99;
		expect(() => parseBackup(JSON.stringify(raw))).toThrow(/lebih baru/);
	});

	it('membuang isi catatan yang rusak tanpa menggagalkan semuanya', () => {
		const raw = JSON.parse(roundTrip());
		raw.tracker.logs = {
			'2026-11-01': { subuh: true, tahajud: true, dzuhur: 'ya' },
			bukan_tanggal: { subuh: true },
			'2026-11-02': {}
		};
		raw.tracker.udzurDays = ['2026-10-01', '2026-10-01', 5, 'x'];
		raw.settings.lat = 999;
		raw.reading.size = 200;
		const p = parseBackup(JSON.stringify(raw));
		expect(p.tracker.logs).toEqual({ '2026-11-01': { subuh: true } });
		expect(p.tracker.udzurDays).toEqual(['2026-10-01']);
		expect(p.settings).toBeNull();
		expect(p.reading?.size).toBe(46);
	});

	it('cadangan lama tanpa koreksi jadwal tetap terbaca dengan nilai bawaan', () => {
		const raw = JSON.parse(roundTrip());
		delete raw.settings.adjust;
		delete raw.settings.imsak;
		const p = parseBackup(JSON.stringify(raw));
		expect(p.settings?.adjust).toEqual({});
		expect(p.settings?.imsak).toBe(10);
	});
});

describe('gabung catatan', () => {
	it('centang dari kedua sisi dipertahankan', () => {
		const current: TrackerData = {
			logs: { '2026-11-08': { dzuhur: true }, '2026-11-09': { subuh: true } },
			udzurDays: ['2026-10-02'],
			udzurSince: '2026-11-08'
		};
		const m = mergeTracker(current, tracker);
		expect(m.logs).toEqual({
			'2026-11-07': { subuh: true, isya: true },
			'2026-11-08': { subuh: true, dzuhur: true },
			'2026-11-09': { subuh: true }
		});
		expect(m.udzurDays).toEqual(['2026-10-01', '2026-10-02']);
		expect(m.udzurSince).toBe('2026-11-08');
	});

	it('mode udzur dari cadangan dipakai bila perangkat tidak sedang udzur', () => {
		expect(mergeTracker(emptyTracker(), { ...emptyTracker(), udzurSince: '2026-11-01' }).udzurSince).toBe('2026-11-01');
	});

	it('ringkasan menghitung hari dan salat', () => {
		expect(trackerSummary(tracker)).toEqual({ days: 2, prayers: 3, first: '2026-11-07' });
		expect(trackerSummary(emptyTracker())).toEqual({ days: 0, prayers: 0, first: null });
	});
});

describe('koleksi di cadangan', () => {
	it('cadangan lama tanpa koleksi dianggap kosong', () => {
		const raw = JSON.parse(roundTrip());
		delete raw.doa.koleksi;
		expect(parseBackup(JSON.stringify(raw)).doa?.koleksi).toEqual([]);
	});
});

describe('pengaturan tambahan di cadangan', () => {
	const prefs = {
		quran: { s: 2, a: 255 },
		dzikir: { salat: 'ringkas' as const, pagi: 'wirdul' as const, tasbih: 11 as const, haptic: false, autoNext: true },
		adzan: { enabled: true, on: { subuh: true, dzuhur: false, ashar: true, maghrib: true, isya: true }, before: 10 },
		lang: 'en' as const,
		theme: 'dark' as const
	};

	it('ikut tersimpan dan terbaca kembali', () => {
		const text = JSON.stringify(makeBackup({ settings, tracker, doa, reading, prefs }, now));
		expect(parseBackup(text).prefs).toEqual(prefs);
	});

	it('cadangan lama tanpa pengaturan tambahan tetap bisa dipulihkan', () => {
		expect(parseBackup(roundTrip()).prefs).toEqual({});
	});

	it('bagian yang rusak dibuang tanpa menggagalkan yang lain', () => {
		const raw = JSON.parse(JSON.stringify(makeBackup({ settings, tracker, doa, reading, prefs }, now)));
		raw.prefs.dzikir.tasbih = 99;
		raw.prefs.adzan.before = 7;
		raw.prefs.lang = 'fr';
		const p = parseBackup(JSON.stringify(raw)).prefs;
		expect(p.dzikir).toBeUndefined();
		expect(p.adzan).toBeUndefined();
		expect(p.lang).toBeUndefined();
		expect(p.quran).toEqual(prefs.quran);
		expect(p.theme).toBe('dark');
	});
});

