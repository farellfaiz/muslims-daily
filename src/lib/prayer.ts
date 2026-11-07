import { CalculationMethod, Coordinates, Madhab, PrayerTimes, type CalculationParameters } from 'adhan';

export type PrayerKey = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
export type MethodKey = 'kemenag' | 'mwl' | 'singapore' | 'ummalqura';
export type MadhabKey = 'syafii' | 'hanafi';
export type SkyPhase = 'subuh' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';

export const PRAYERS: { key: PrayerKey; name: string }[] = [
	{ key: 'subuh', name: 'Subuh' },
	{ key: 'dzuhur', name: 'Dzuhur' },
	{ key: 'ashar', name: 'Ashar' },
	{ key: 'maghrib', name: 'Maghrib' },
	{ key: 'isya', name: 'Isya' }
];

export const METHODS: { key: MethodKey; name: string; note: string }[] = [
	{ key: 'kemenag', name: 'Kemenag RI', note: 'Subuh 20°, Isya 18°, ihtiyat 2 menit' },
	{ key: 'singapore', name: 'MUIS Singapura', note: 'Subuh 20°, Isya 18°' },
	{ key: 'mwl', name: 'Muslim World League', note: 'Subuh 18°, Isya 17°' },
	{ key: 'ummalqura', name: 'Umm al-Qura', note: 'Dipakai di Arab Saudi' }
];

/**
 * Parameter hitung. Metode Kemenag tidak tersedia bawaan di adhan, jadi dirakit manual:
 * sudut Subuh 20° dan Isya 18°, lalu ihtiyat (pengaman) +2 menit seperti jadwal resmi.
 * Terbit dikurangi 2 menit supaya batas akhir Subuh juga aman.
 */
function params(method: MethodKey, madhab: MadhabKey): CalculationParameters {
	let p: CalculationParameters;
	switch (method) {
		case 'singapore':
			p = CalculationMethod.Singapore();
			break;
		case 'mwl':
			p = CalculationMethod.MuslimWorldLeague();
			break;
		case 'ummalqura':
			p = CalculationMethod.UmmAlQura();
			break;
		default:
			p = CalculationMethod.Other();
			p.fajrAngle = 20;
			p.ishaAngle = 18;
			p.methodAdjustments = { fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 };
	}
	p.madhab = madhab === 'hanafi' ? Madhab.Hanafi : Madhab.Shafi;
	return p;
}

export type DayTimes = Record<PrayerKey | 'terbit', Date>;

/** Koreksi manual dalam menit per salat (+ = lebih lambat), mis. supaya sama dengan jadwal masjid setempat. */
export type Adjust = Partial<Record<PrayerKey, number>>;
export const ADJUST_LIMIT = 30;

export function timesFor(
	date: Date,
	lat: number,
	lng: number,
	method: MethodKey,
	madhab: MadhabKey,
	adjust: Adjust = {}
): DayTimes {
	const p = params(method, madhab);
	const map = { subuh: 'fajr', dzuhur: 'dhuhr', ashar: 'asr', maghrib: 'maghrib', isya: 'isha' } as const;
	for (const [k, v] of Object.entries(adjust) as [PrayerKey, number][]) {
		if (!v) continue;
		const m = Math.max(-ADJUST_LIMIT, Math.min(ADJUST_LIMIT, Math.round(v)));
		p.adjustments[map[k]] += m;
	}
	const t = new PrayerTimes(new Coordinates(lat, lng), date, p);
	return { subuh: t.fajr, terbit: t.sunrise, dzuhur: t.dhuhr, ashar: t.asr, maghrib: t.maghrib, isya: t.isha };
}

/** Salat berikutnya dari "now". Setelah Isya, yang berikutnya Subuh besok. */
export function nextPrayer(now: Date, today: DayTimes, tomorrow: DayTimes): { key: PrayerKey; name: string; at: Date } {
	for (const p of PRAYERS) if (today[p.key] > now) return { ...p, at: today[p.key] };
	return { ...PRAYERS[0], at: tomorrow.subuh };
}

/** Suasana langit di hero, mengikuti waktu salat sungguhan. */
export function skyPhase(now: Date, t: DayTimes): SkyPhase {
	if (now < t.subuh) return 'isya';
	if (now < t.terbit) return 'subuh';
	if (now < t.dzuhur) return 'dhuha';
	if (now < t.ashar) return 'dzuhur';
	if (now < t.maghrib) return 'ashar';
	if (now < t.isya) return 'maghrib';
	return 'isya';
}

export interface ArcPoint {
	label: string;
	at: Date;
	/** 'prayer' = titik penuh (waktu salat), 'marker' = titik outline (penanda, bukan salat) */
	kind: 'prayer' | 'marker';
	/** posisi label (bawaan: di atas titik); diatur supaya tidak bertumpuk dengan titik tetangga yang berdekatan */
	place?: 'below' | 'right';
}

export interface HeroArc {
	mode: 'day' | 'night';
	start: Date;
	end: Date;
	points: ArcPoint[];
	/** Malam: rentang sepertiga malam terakhir (disorot di busur). */
	lastThird?: { from: Date; to: Date };
	imsak?: Date;
	midnight?: Date;
	terbit?: Date;
	maghrib?: Date;
}

/** Jarak imsak sebelum Subuh, mengikuti kebiasaan jadwal imsakiyah di Indonesia (bisa diatur pengguna). */
export const IMSAK_MINUTES = 10;
export const IMSAK_OPTIONS = [5, 10, 15] as const;

/**
 * Busur di hero punya dua mode:
 * - Siang (Subuh sampai Isya): Subuh, Terbit, Dzuhur, Ashar, Maghrib, Isya.
 * - Malam (Isya sampai Subuh): Isya, tengah malam, awal sepertiga malam terakhir, Subuh.
 *
 * Malam dihitung dari Maghrib sampai Subuh (pendapat jumhur), lalu dibagi tiga.
 * Sepertiga terakhir adalah waktu terbaik qiyamul lail, dan sahur sebaiknya diakhirkan menjelang imsak.
 */
export function heroArc(
	now: Date,
	yesterday: DayTimes,
	today: DayTimes,
	tomorrow: DayTimes,
	imsakMinutes: number = IMSAK_MINUTES
): HeroArc {
	if (now >= today.subuh && now < today.isya) {
		return {
			mode: 'day',
			start: today.subuh,
			end: today.isya,
			terbit: today.terbit,
			maghrib: today.maghrib,
			points: [
				{ label: 'Subuh', at: today.subuh, kind: 'prayer' },
				{ label: 'Terbit', at: today.terbit, kind: 'marker', place: 'right' },
				{ label: 'Dzuhur', at: today.dzuhur, kind: 'prayer' },
				{ label: 'Ashar', at: today.ashar, kind: 'prayer' },
				{ label: 'Maghrib', at: today.maghrib, kind: 'prayer' },
				{ label: 'Isya', at: today.isya, kind: 'prayer' }
			]
		};
	}
	// Malam: setelah Isya hari ini (sampai Subuh besok), atau dini hari sebelum Subuh (dari Isya kemarin).
	const evening = now >= today.isya ? today : yesterday;
	const dawn = now >= today.isya ? tomorrow.subuh : today.subuh;
	const night = +dawn - +evening.maghrib;
	const midnight = new Date(+evening.maghrib + night / 2);
	const thirdFrom = new Date(+dawn - night / 3);
	const imsak = new Date(+dawn - imsakMinutes * 60e3);
	return {
		mode: 'night',
		start: evening.isya,
		end: dawn,
		lastThird: { from: thirdFrom, to: dawn },
		imsak,
		midnight,
		points: [
			{ label: 'Isya', at: evening.isya, kind: 'prayer' },
			{ label: 'Tengah malam', at: midnight, kind: 'marker', place: 'below' },
			{ label: '1/3 akhir', at: thirdFrom, kind: 'marker', place: 'below' },
			{ label: 'Subuh', at: dawn, kind: 'prayer' }
		]
	};
}
