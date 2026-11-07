import { browser } from '$app/env';

/**
 * State reaktif yang tersimpan di localStorage perangkat.
 * Semua data pengguna (catatan salat, favorit, pengaturan) hanya ada di HP-nya sendiri:
 * tanpa akun, tanpa server, tanpa pelacakan.
 *
 * Perubahan wajib lewat `value = ...` (ganti objek utuh), bukan mutasi dalam,
 * supaya setiap perubahan pasti tersimpan.
 */
export class Persisted<T> {
	#key: string;
	#value = $state() as T;

	constructor(key: string, initial: T) {
		this.#key = 'md:' + key;
		this.#value = initial;
		if (browser) {
			try {
				const raw = localStorage.getItem(this.#key);
				if (raw) this.#value = { ...initial, ...JSON.parse(raw) };
			} catch {
				/* storage diblokir (mode privat): pakai nilai awal */
			}
		}
	}

	get value(): T {
		return this.#value;
	}

	set value(v: T) {
		this.#value = v;
		if (browser) {
			try {
				localStorage.setItem(this.#key, JSON.stringify(v));
			} catch {
				/* penuh atau diblokir: state tetap jalan di memori */
			}
		}
	}
}
