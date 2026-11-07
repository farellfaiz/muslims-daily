/** Kunci tanggal lokal "YYYY-MM-DD" (bukan UTC, supaya pergantian hari ikut jam HP). */
export function dateKey(d: Date): string {
	const y = d.getFullYear();
	const m = String(d.getMonth() + 1).padStart(2, '0');
	const day = String(d.getDate()).padStart(2, '0');
	return `${y}-${m}-${day}`;
}

export function fromKey(key: string): Date {
	const [y, m, d] = key.split('-').map(Number);
	return new Date(y, m - 1, d);
}

export function addDays(d: Date, n: number): Date {
	const r = new Date(d);
	r.setDate(r.getDate() + n);
	return r;
}

const fmtLong = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
const fmtFull = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
const fmtMonth = new Intl.DateTimeFormat('id-ID', { month: 'short' });

export const formatLong = (d: Date) => fmtLong.format(d);
export const formatFull = (d: Date) => fmtFull.format(d);
export const formatMonthShort = (d: Date) => fmtMonth.format(d);

/** Jam gaya Indonesia: "04.02". */
export function formatTime(d: Date): string {
	return `${String(d.getHours()).padStart(2, '0')}.${String(d.getMinutes()).padStart(2, '0')}`;
}

/** Tanggal Hijriah (Umm al-Qura) dari Intl. Null bila browser tidak mendukung. */
export function formatHijri(d: Date): string | null {
	try {
		return new Intl.DateTimeFormat('id-ID-u-ca-islamic-umalqura', {
			day: 'numeric',
			month: 'long',
			year: 'numeric'
		}).format(d);
	} catch {
		return null;
	}
}

/** Label zona waktu Indonesia dari offset perangkat. Di luar Indonesia: kosong. */
export function tzLabel(d = new Date()): string {
	const off = -d.getTimezoneOffset();
	return off === 420 ? 'WIB' : off === 480 ? 'WITA' : off === 540 ? 'WIT' : '';
}

export function countdown(ms: number): string {
	const s = Math.max(0, Math.round(ms / 1000));
	const h = Math.floor(s / 3600);
	const m = Math.floor((s % 3600) / 60);
	const sec = s % 60;
	return [h, m, sec].map((x) => String(x).padStart(2, '0')).join(':');
}

