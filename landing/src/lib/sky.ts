import { CalculationMethod, Coordinates, Madhab, PrayerTimes } from 'adhan';

/*
  Potongan kecil dari logika aplikasinya (src/lib/prayer.ts dan Hero.svelte di root),
  cukup untuk menghidupkan langit di pintu hero: jadwal Kemenag RI, fase langit,
  salat berikutnya, dan busur siang atau malam.
*/

export type Phase = 'subuh' | 'dhuha' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
export const PHASES: Phase[] = ['subuh', 'dhuha', 'dzuhur', 'ashar', 'maghrib', 'isya'];

/** Gradien langit tiap waktu, sama dengan hero aplikasinya. `light` = teks putih di atasnya. */
export const SKY: Record<Phase, { top: string; mid: string; low: string; stars: number; light: boolean }> = {
	subuh: { top: '#34426E', mid: '#7F7BA6', low: '#F1B497', stars: 0.7, light: true },
	dhuha: { top: '#A7CAEA', mid: '#CFE2F3', low: '#F7E4D6', stars: 0, light: false },
	dzuhur: { top: '#93BFE8', mid: '#C3DBF1', low: '#E2EEF8', stars: 0, light: false },
	ashar: { top: '#A9C7E3', mid: '#E2CDB8', low: '#F3D2B4', stars: 0, light: false },
	maghrib: { top: '#4E5287', mid: '#B87C93', low: '#F2A07C', stars: 0.35, light: true },
	isya: { top: '#17253F', mid: '#26395E', low: '#3B5582', stars: 1, light: true }
};
export const skyGradient = (p: Phase) => {
	const s = SKY[p];
	return `linear-gradient(180deg, ${s.top} 0%, ${s.mid} 55%, ${s.low} 100%)`;
};

/**
 * Bintang digambar sebagai 3 gambar SVG statis, jadi yang dianimasikan cuma 3 lapisan,
 * bukan satu elemen per bintang. Posisinya deterministik supaya prerender dan browser sama.
 */
function starLayers(stars: { x: number; y: number; r: number; o: number }[]) {
	return [0, 1, 2].map((k) => {
		const dots = stars
			.filter((_, i) => i % 3 === k)
			.map((s) => `<circle cx='${s.x}%' cy='${s.y}%' r='${s.r}' fill-opacity='${s.o.toFixed(2)}'/>`)
			.join('');
		const svg = `<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='100%' fill='white'>${dots}</svg>`;
		return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
	});
}
export const DOOR_STARS = starLayers(
	Array.from({ length: 34 }, (_, i) => ({ x: (i * 37) % 100, y: (i * 53) % 62, r: 1, o: 0.4 + (i % 5) / 8 }))
);
export const FIELD_STARS = starLayers(
	Array.from({ length: 64 }, (_, i) => ({ x: (i * 61 + 7) % 100, y: ((i * 37) % 64) + 2, r: i % 5 === 0 ? 1.5 : 1, o: 1 }))
);

export interface Place {
	name: string;
	lat: number;
	lng: number;
	tz: string;
	zone: string;
}

/** Kota acuan per zona waktu Indonesia. Pengunjung dari luar Indonesia melihat Jakarta. */
const PLACES: Record<string, Place> = {
	'Asia/Jakarta': { name: 'Jakarta', lat: -6.2088, lng: 106.8456, tz: 'Asia/Jakarta', zone: 'WIB' },
	'Asia/Pontianak': { name: 'Pontianak', lat: -0.0263, lng: 109.3425, tz: 'Asia/Pontianak', zone: 'WIB' },
	'Asia/Makassar': { name: 'Makassar', lat: -5.1477, lng: 119.4327, tz: 'Asia/Makassar', zone: 'WITA' },
	'Asia/Jayapura': { name: 'Jayapura', lat: -2.5337, lng: 140.7181, tz: 'Asia/Jayapura', zone: 'WIT' }
};
export const DEFAULT_PLACE = PLACES['Asia/Jakarta'];

export function visitorPlace(): Place {
	try {
		return PLACES[Intl.DateTimeFormat().resolvedOptions().timeZone] ?? DEFAULT_PLACE;
	} catch {
		return DEFAULT_PLACE;
	}
}

export type PrayerKey = 'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya';
export type DayTimes = Record<PrayerKey | 'terbit', Date>;
const PRAYERS: { key: PrayerKey; name: string }[] = [
	{ key: 'subuh', name: 'Subuh' },
	{ key: 'dzuhur', name: 'Dzuhur' },
	{ key: 'ashar', name: 'Ashar' },
	{ key: 'maghrib', name: 'Maghrib' },
	{ key: 'isya', name: 'Isya' }
];

/** Metode Kemenag RI: Subuh 20°, Isya 18°, ihtiyat 2 menit (bawaan aplikasinya). */
function kemenag() {
	const p = CalculationMethod.Other();
	p.fajrAngle = 20;
	p.ishaAngle = 18;
	p.methodAdjustments = { fajr: 2, sunrise: -2, dhuhr: 2, asr: 2, maghrib: 2, isha: 2 };
	p.madhab = Madhab.Shafi;
	return p;
}

/** Tanggal kalender di zona waktu kota (bukan zona waktu perangkat). */
const dayFmt = new Map<string, Intl.DateTimeFormat>();
function ymd(now: Date, tz: string): [number, number, number] {
	let f = dayFmt.get(tz);
	if (!f) dayFmt.set(tz, (f = new Intl.DateTimeFormat('en-US', { timeZone: tz, year: 'numeric', month: 'numeric', day: 'numeric' })));
	const get = (type: string) => Number(f!.formatToParts(now).find((p) => p.type === type)!.value);
	return [get('year'), get('month'), get('day')];
}

function timesOn(y: number, m: number, d: number, place: Place): DayTimes {
	const t = new PrayerTimes(new Coordinates(place.lat, place.lng), new Date(y, m - 1, d), kemenag());
	return { subuh: t.fajr, terbit: t.sunrise, dzuhur: t.dhuhr, ashar: t.asr, maghrib: t.maghrib, isya: t.isha };
}

let cached: { key: string; value: { yesterday: DayTimes; today: DayTimes; tomorrow: DayTimes } } | null = null;

/** Jadwal kemarin, hari ini, dan besok. Dihitung ulang hanya saat tanggal atau kota berganti. */
export function schedule(now: Date, place: Place) {
	const [y, m, d] = ymd(now, place.tz);
	const key = `${y}-${m}-${d}|${place.name}`;
	if (cached?.key !== key) {
		cached = {
			key,
			value: { yesterday: timesOn(y, m, d - 1, place), today: timesOn(y, m, d, place), tomorrow: timesOn(y, m, d + 1, place) }
		};
	}
	return cached.value;
}

export function skyPhase(now: Date, t: DayTimes): Phase {
	if (now < t.subuh) return 'isya';
	if (now < t.terbit) return 'subuh';
	if (now < t.dzuhur) return 'dhuha';
	if (now < t.ashar) return 'dzuhur';
	if (now < t.maghrib) return 'ashar';
	if (now < t.isya) return 'maghrib';
	return 'isya';
}

export function nextPrayer(now: Date, today: DayTimes, tomorrow: DayTimes) {
	for (const p of PRAYERS) if (today[p.key] > now) return { ...p, at: today[p.key] };
	return { ...PRAYERS[0], at: tomorrow.subuh };
}

export interface ArcPoint {
	label: string;
	at: Date;
	kind: 'prayer' | 'marker';
	place?: 'below' | 'right';
}
export interface Arc {
	mode: 'day' | 'night';
	start: Date;
	end: Date;
	points: ArcPoint[];
	lastThird?: { from: Date; to: Date };
}

/** Busur siang (Subuh sampai Isya) atau malam (Isya sampai Subuh), seperti hero aplikasinya. */
export function heroArc(now: Date, yesterday: DayTimes, today: DayTimes, tomorrow: DayTimes): Arc {
	if (now >= today.subuh && now < today.isya) {
		return {
			mode: 'day',
			start: today.subuh,
			end: today.isya,
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
	const evening = now >= today.isya ? today : yesterday;
	const dawn = now >= today.isya ? tomorrow.subuh : today.subuh;
	const night = +dawn - +evening.maghrib;
	const midnight = new Date(+evening.maghrib + night / 2);
	const thirdFrom = new Date(+dawn - night / 3);
	return {
		mode: 'night',
		start: evening.isya,
		end: dawn,
		lastThird: { from: thirdFrom, to: dawn },
		points: [
			{ label: 'Isya', at: evening.isya, kind: 'prayer' },
			{ label: 'Tengah malam', at: midnight, kind: 'marker', place: 'below' },
			{ label: '1/3 akhir', at: thirdFrom, kind: 'marker', place: 'below' },
			{ label: 'Subuh', at: dawn, kind: 'prayer' }
		]
	};
}

const timeFmt = new Map<string, Intl.DateTimeFormat>();
export function formatTime(d: Date, tz: string): string {
	let f = timeFmt.get(tz);
	if (!f) timeFmt.set(tz, (f = new Intl.DateTimeFormat('id-ID', { hour: '2-digit', minute: '2-digit', hourCycle: 'h23', timeZone: tz })));
	return f.format(d);
}

export function countdown(ms: number): string {
	const s = Math.max(0, Math.floor(ms / 1000));
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${pad(Math.floor(s / 3600))}:${pad(Math.floor((s % 3600) / 60))}:${pad(s % 60)}`;
}
