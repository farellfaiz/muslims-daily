import { describe, expect, it } from 'vitest';
import { addDays, dateKey } from './date.ts';
import {
	bestStreak,
	consistency,
	currentStreak,
	emptyTracker,
	heatmap,
	togglePrayer,
	toggleUdzur,
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

	it('mode udzur yang masih aktif melindungi hari-hari berikutnya', () => {
		const d = toggleUdzur(withDays([[1, full], [2, full]]), today);
		expect(currentStreak(d, addDays(today, 3))).toBe(2);
	});

	it('mematikan mode udzur menyimpan rentangnya sampai kemarin', () => {
		const off = toggleUdzur(toggleUdzur(emptyTracker(), today), addDays(today, 3));
		expect(off.udzurSince).toBeNull();
		expect(off.udzurDays).toEqual([0, 1, 2].map((i) => dateKey(addDays(today, i))));
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
