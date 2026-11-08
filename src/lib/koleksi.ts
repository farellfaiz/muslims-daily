/**
 * Koleksi doa pribadi: kumpulan doa yang dikelompokkan sendiri oleh pengguna, mis. "Doa harian anak".
 * Disimpan di perangkat bersama preferensi doa (md:doa) dan ikut file backup.
 * Fungsi di sini murni (tanpa DOM) supaya bisa dites.
 */

export interface Koleksi {
	id: string;
	name: string;
	/** id doa, urut sesuai kapan ditambahkan */
	ids: number[];
}

export const NAME_MAX = 40;

/** Nama dirapikan: spasi berlebih dibuang, dipotong ke NAME_MAX. Kosong = tidak sah. */
export const cleanName = (s: string) => s.replace(/\s+/g, ' ').trim().slice(0, NAME_MAX).trim();

/** id pendek yang unik di antara koleksi yang ada */
export function newId(existing: Koleksi[], now = Date.now(), rand = Math.random): string {
	const taken = new Set(existing.map((k) => k.id));
	let id = '';
	do id = now.toString(36) + rand().toString(36).slice(2, 6);
	while (taken.has(id));
	return id;
}

/** Tambah koleksi baru (opsional langsung berisi satu doa). Nama dobel tetap boleh. */
export function create(list: Koleksi[], name: string, firstDoa?: number, now = Date.now()): { list: Koleksi[]; id: string } | null {
	const clean = cleanName(name);
	if (!clean) return null;
	const id = newId(list, now);
	return { list: [...list, { id, name: clean, ids: firstDoa == null ? [] : [firstDoa] }], id };
}

export const has = (k: Koleksi, doaId: number) => k.ids.includes(doaId);

/** Masukkan doa ke koleksi atau keluarkan bila sudah ada. */
export function toggle(list: Koleksi[], id: string, doaId: number): Koleksi[] {
	return list.map((k) => (k.id !== id ? k : { ...k, ids: has(k, doaId) ? k.ids.filter((x) => x !== doaId) : [...k.ids, doaId] }));
}

export function rename(list: Koleksi[], id: string, name: string): Koleksi[] {
	const clean = cleanName(name);
	if (!clean) return list;
	return list.map((k) => (k.id === id ? { ...k, name: clean } : k));
}

export const remove = (list: Koleksi[], id: string) => list.filter((k) => k.id !== id);

/** Koleksi yang memuat doa ini. */
export const containing = (list: Koleksi[], doaId: number) => list.filter((k) => has(k, doaId));

/** Bersihkan data dari penyimpanan atau file backup: buang yang rusak, id doa dobel, id koleksi dobel. */
export function clean(raw: unknown): Koleksi[] {
	if (!Array.isArray(raw)) return [];
	const seen = new Set<string>();
	const out: Koleksi[] = [];
	for (const r of raw) {
		if (!r || typeof r !== 'object') continue;
		const { id, name, ids } = r as Record<string, unknown>;
		const n = typeof name === 'string' ? cleanName(name) : '';
		if (typeof id !== 'string' || !id || seen.has(id) || !n) continue;
		seen.add(id);
		const nums = Array.isArray(ids) ? ids.filter((x): x is number => Number.isInteger(x)) : [];
		out.push({ id, name: n, ids: [...new Set(nums)] });
	}
	return out;
}

/**
 * Gabung koleksi dari backup ke yang sudah ada: koleksi dengan id sama digabung isinya
 * (doa yang sudah ada tetap di depan), koleksi baru ditambahkan di belakang.
 */
export function merge(current: Koleksi[], incoming: Koleksi[]): Koleksi[] {
	const byId = new Map(current.map((k) => [k.id, k]));
	const out = current.map((k) => {
		const other = incoming.find((x) => x.id === k.id);
		return other ? { ...k, ids: [...new Set([...k.ids, ...other.ids])] } : k;
	});
	for (const k of incoming) if (!byId.has(k.id)) out.push(k);
	return out;
}
