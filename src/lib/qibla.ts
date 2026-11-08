import { Coordinates, Qibla } from 'adhan';

/** Ka'bah, Masjidil Haram. */
export const KAABA = { lat: 21.4225, lng: 39.8262 };

/** Arah kiblat dalam derajat dari utara sejati, searah jarum jam (lingkaran besar). */
export function qiblaBearing(lat: number, lng: number): number {
	return Qibla(new Coordinates(lat, lng));
}

/** Jarak lingkaran besar ke Ka'bah dalam kilometer. */
export function distanceKm(lat: number, lng: number): number {
	const R = 6371;
	const rad = Math.PI / 180;
	const dLat = (KAABA.lat - lat) * rad;
	const dLng = (KAABA.lng - lng) * rad;
	const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat * rad) * Math.cos(KAABA.lat * rad) * Math.sin(dLng / 2) ** 2;
	return 2 * R * Math.asin(Math.sqrt(a));
}

const WINDS = ['utara', 'timur laut', 'timur', 'tenggara', 'selatan', 'barat daya', 'barat', 'barat laut'];
const WINDS_EN = ['north', 'northeast', 'east', 'southeast', 'south', 'southwest', 'west', 'northwest'];

/** Nama arah mata angin (8 arah), bawaan bahasa Indonesia; `en` untuk bahasa Inggris. */
export function windName(deg: number, en = false): string {
	return (en ? WINDS_EN : WINDS)[Math.round(norm(deg) / 45) % 8];
}

export const norm = (deg: number) => ((deg % 360) + 360) % 360;

/** Selisih terpendek b terhadap a, -180 sampai 180 (positif = b di kanan a). */
export function angleDiff(a: number, b: number): number {
	const d = norm(b - a);
	return d > 180 ? d - 360 : d;
}

/** Perataan sudut untuk kompas yang gemetar; aman saat melewati 0°/360°. */
export function smoothAngle(prev: number | null, next: number, k = 0.25): number {
	if (prev === null) return norm(next);
	return norm(prev + angleDiff(prev, next) * k);
}

/** Dianggap menghadap kiblat bila selisih di bawah batas ini. */
export const ALIGN_DEG = 4;

export interface OrientationLike {
	alpha: number | null;
	absolute?: boolean;
	webkitCompassHeading?: number;
	webkitCompassAccuracy?: number;
}

/**
 * Arah hadap HP (derajat dari utara) dari event orientasi.
 * - iOS: webkitCompassHeading sudah berupa arah kompas.
 * - Android: alpha absolut berputar berlawanan jarum jam, jadi arah = 360 - alpha,
 *   lalu dikoreksi sudut layar bila HP sedang mendatar (landscape).
 * Null bila event tidak membawa arah absolut.
 */
export function headingFrom(e: OrientationLike, screenAngle = 0): number | null {
	if (typeof e.webkitCompassHeading === 'number' && !Number.isNaN(e.webkitCompassHeading)) {
		return norm(e.webkitCompassHeading + screenAngle);
	}
	if (e.alpha === null || e.absolute === false) return null;
	return norm(360 - e.alpha + screenAngle);
}
