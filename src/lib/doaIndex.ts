import type { Category, DailyDoa, DoaItem } from './data/doa.ts';

/**
 * Pemuat data doa bersama di browser. Tiap file diunduh sekali per sesi; service worker menyimpannya
 * untuk offline. Bila gagal (offline sebelum pernah tersimpan), percobaan berikutnya mengunduh ulang.
 */
export interface DoaIndex {
	items: DoaItem[];
	categories: Category[];
}

function once<T>(url: string): () => Promise<T> {
	let p: Promise<T> | null = null;
	return () =>
		(p ??= fetch(url).then((r) => {
			if (!r.ok) throw new Error(`${url}: ${r.status}`);
			return r.json() as Promise<T>;
		})).catch((e) => {
			p = null;
			throw e;
		});
}

export const loadDoaIndex = once<DoaIndex>('/data/doa-items.json');
export const loadDaily = once<DailyDoa[]>('/data/daily.json');
