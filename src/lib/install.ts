/**
 * Aturan murni untuk ajakan "pasang di layar utama". Tanpa akses DOM supaya bisa dites.
 */

/**
 * Cara memasang yang tersedia di browser ini.
 * - prompt: browser punya dialog pasang bawaan (Chrome, Edge, Samsung Internet)
 * - ios: iPhone/iPad, lewat tombol Bagikan lalu "Tambah ke Layar Utama"
 * - inapp: browser di dalam aplikasi lain (Instagram, Facebook, TikTok, dll.), tidak bisa memasang
 * - manual: browser lain, lewat menu browser
 */
export type InstallPlatform = 'prompt' | 'ios' | 'inapp' | 'manual';

const IN_APP = /FBAN|FBAV|FB_IAB|Instagram|Line\/|musical_ly|BytedanceWebview|Snapchat|; wv\)/i;

export function detectPlatform(ua: string, maxTouchPoints = 0, hasPrompt = false): InstallPlatform {
	if (IN_APP.test(ua)) return 'inapp';
	if (hasPrompt) return 'prompt';
	// iPadOS mengaku sebagai Mac; bedanya hanya di layar sentuh.
	if (/iPhone|iPad|iPod/.test(ua) || (/Macintosh/.test(ua) && maxTouchPoints > 1)) return 'ios';
	return 'manual';
}

export interface VisitState {
	/** jumlah kunjungan sejauh ini */
	visits: number;
	/** waktu terakhir aplikasi terlihat (ms) */
	lastSeen: number;
	/** kunjungan ke berapa ajakan terakhir ditutup (0 = belum pernah) */
	dismissedAt: number;
	/** sudah pernah dipasang dari browser ini */
	installed: boolean;
}

export const emptyVisits = (): VisitState => ({ visits: 0, lastSeen: 0, dismissedAt: 0, installed: false });

/** Jeda minimal antara dua kunjungan. Lebih singkat dari ini dianggap kunjungan yang sama. */
export const VISIT_GAP = 30 * 60 * 1000;

/** Kunjungan saat ajakan pasang ditawarkan. */
export const OFFER_AT = [1, 5];

/** Catat aplikasi terlihat pada `now`; menambah kunjungan bila sudah lama tidak dibuka. */
export function touchVisit(s: VisitState, now: number): VisitState {
	const fresh = now - s.lastSeen >= VISIT_GAP;
	return { ...s, visits: fresh ? s.visits + 1 : s.visits, lastSeen: now };
}

/** Kartu ajakan muncul di kunjungan pertama dan kelima, sampai ditutup pada kunjungan itu. */
export function shouldOffer(s: VisitState): boolean {
	return !s.installed && OFFER_AT.includes(s.visits) && s.dismissedAt !== s.visits;
}
