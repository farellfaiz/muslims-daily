import { describe, expect, it } from 'vitest';
import { addDays, dateKey } from './date.ts';
import {
	bestStreak,
	canCheck,
	consistency,
	currentStreak,
	emptyTracker,
	heatmap,
	togglePrayer,
	toggleUdzurDay,
	type DayLog,
	type TrackerData
} from './tracker.ts';

const full: DayLog = { subuh: true, dzuhur: true, ashar: true, maghrib: true, isya: true };
const today = new Date(2026, 10, 7); // Sabtu, 7 November 2026

function withDays(entries: [number, DayLog][], extra: Partial<TrackerData> = {}): TrackerData {
	const d = emptyTracker();
	for (const [ago, log] of entries) d.logs[dateKey(addDays(today, -ago))] = log;
	return { ...d, ...extra };
}

describe('streak', () => {
	it('kosong = 0', () => {
		expect(currentStreak(emptyTracker(), today)).toBe(0);
		expect(bestStreak(emptyTracker(), today)).toBe(0);
	});

	it('hari ini belum lengkap tidak memutus streak', () => {
		const d = withDays([[0, { subuh: true }], [1, full], [2, full], [3, full]]);
		expect(currentStreak(d, today)).toBe(3);
	});

	it('hari ini lengkap ikut dihitung', () => {
		expect(currentStreak(withDays([[0, full], [1, full]]), today)).toBe(2);
	});

	it('hari kemarin yang kurang satu salat memutus streak', () => {
		const { isya: _, ...noIsya } = full;
		const d = withDays([[1, full], [2, noIsya], [3, full]]);
		expect(currentStreak(d, today)).toBe(1);
		expect(bestStreak(d, today)).toBe(1);
	});

	it('hari yang tidak dicatat memutus streak', () => {
		const d = withDays([[1, full], [3, full], [4, full]]);
		expect(currentStreak(d, today)).toBe(1);
		expect(bestStreak(d, today)).toBe(2);
	});

	it('hari udzur dilewati tanpa memutus streak', () => {
		const d = withDays([[1, full], [4, full]], {
			udzurDays: [dateKey(addDays(today, -2)), dateKey(addDays(today, -3))]
		});
		expect(currentStreak(d, today)).toBe(2);
	});

	it('mode udzur lama yang masih aktif tetap melindungi hari-hari berikutnya', () => {
		const d = withDays([[1, full], [2, full]], { udzurSince: dateKey(today) });
		expect(currentStreak(d, addDays(today, 3))).toBe(2);
	});
});

describe('udzur per hari', () => {
	const k = dateKey(today);

	it('ketuk sekali jadi udzur, ketuk lagi batal', () => {
		const on = toggleUdzurDay(emptyTracker(), k, today);
		expect(on.udzurDays).toEqual([k]);
		expect(toggleUdzurDay(on, k, today).udzurDays).toEqual([]);
	});

	it('hanya hari yang dipilih yang berubah', () => {
		const kemarin = dateKey(addDays(today, -1));
		const d = toggleUdzurDay(emptyTracker(), kemarin, today);
		expect(d.udzurDays).toEqual([kemarin]);
		expect(currentStreak({ ...d, logs: { [dateKey(addDays(today, -2))]: full } }, today)).toBe(1);
	});

	it('centang salat tidak hilang saat hari ditandai udzur', () => {
		const d = toggleUdzurDay(withDays([[0, { subuh: true }]]), k, today);
		expect(d.logs[k]).toEqual({ subuh: true });
	});

	it('mode udzur lama dilebur: membatalkan hari ini mengakhiri rentangnya', () => {
		const start = addDays(today, -2);
		const d = toggleUdzurDay({ ...emptyTracker(), udzurSince: dateKey(start) }, k, today);
		expect(d.udzurSince).toBeNull();
		expect(d.udzurDays).toEqual([dateKey(start), dateKey(addDays(today, -1))]);
	});
});

describe('heatmap', () => {
	it('kolom terakhir memuat hari ini dengan Senin di baris pertama', () => {
		const cols = heatmap(withDays([[0, full]]), today, 4);
		expect(cols).toHaveLength(4);
		const last = cols[3];
		expect(last[0].date.getDay()).toBe(1);
		expect(last.find((c) => c.key === dateKey(today))!.value).toBe(5);
		expect(last[6].future).toBe(true);
	});
});

describe('pencatatan', () => {
	it('ketuk sekali tercatat, ketuk lagi batal, hari kosong dibuang', () => {
		const k = dateKey(today);
		const a = togglePrayer(emptyTracker(), k, 'subuh');
		expect(a.logs[k]).toEqual({ subuh: true });
		expect(togglePrayer(a, k, 'subuh').logs[k]).toBeUndefined();
	});

	it('konsistensi per salat dihitung sejak mulai mencatat', () => {
		const { subuh: _, ...noSubuh } = full;
		const r = consistency(withDays([[0, full], [1, noSubuh]]), today);
		expect(r.subuh).toBe(50);
		expect(r.isya).toBe(100);
	});
});

describe('kunci centang sebelum waktu salat', () => {
	const ashar = new Date(2026, 10, 7, 14, 57);

	it('belum masuk waktu: dikunci', () => {
		expect(canCheck(ashar, new Date(2026, 10, 7, 14, 56))).toBe(false);
	});

	it('sudah masuk atau lewat: bisa dicentang', () => {
		expect(canCheck(ashar, new Date(2026, 10, 7, 14, 57))).toBe(true);
		expect(canCheck(ashar, new Date(2026, 10, 8, 9, 0))).toBe(true);
	});

	it('centang yang sudah ada tetap bisa dibatalkan', () => {
		expect(canCheck(ashar, new Date(2026, 10, 7, 10, 0), true)).toBe(true);
	});

	it('jam belum siap: dikunci', () => {
		expect(canCheck(ashar, null)).toBe(false);
		expect(canCheck(null, new Date())).toBe(false);
	});
});
