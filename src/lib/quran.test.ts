import { describe, expect, it } from 'vitest';
import { BISMILLAH, arabicNum, hasBismillah, searchSurat, type Surat, type SuratData } from './quran.ts';
import fatihah from '../../static/data/quran/1.json';
import raw from '../../static/data/surat.json';

const list = raw as Surat[];

describe('daftar surat', () => {
	it('114 surat, 6236 ayat', () => {
		expect(list).toHaveLength(114);
		expect(list.map((s) => s.n)).toEqual(Array.from({ length: 114 }, (_, i) => i + 1));
		expect(list.reduce((a, s) => a + s.ayat, 0)).toBe(6236);
	});
});

describe('cari surat', () => {
	const names = (q: string) => searchSurat(list, q).map((s) => s.nama);

	it('nomor', () => {
		expect(names('2')[0]).toBe('Al-Baqarah');
		expect(names('114')).toEqual(['An-Nas']);
	});

	it('ejaan longgar', () => {
		expect(names('baqarah')[0]).toBe('Al-Baqarah');
		expect(names('al baqoroh')[0]).toBe('Al-Baqarah');
		expect(names('yasin')[0]).toBe('Ya-Sin');
		expect(names('yaasiin')[0]).toBe('Ya-Sin');
		expect(names('kahfi')[0]).toBe('Al-Kahf');
		expect(names('taubah')[0]).toBe('At-Tawbah');
		expect(names('alfatihah')[0]).toBe('Al-Fatihah');
		expect(names('nas')[0]).toBe('An-Nas');
	});

	it('arti nama', () => {
		expect(names('sapi')).toContain('Al-Baqarah');
	});

	it('kosong = semua', () => {
		expect(searchSurat(list, '  ')).toHaveLength(114);
	});
});

describe('bantuan', () => {
	it('angka Arab', () => expect(arabicNum(286)).toBe('٢٨٦'));
	it('basmalah sama dengan Al-Fatihah ayat 1', () => {
		expect((fatihah as SuratData).ayat[0].w.map((w) => w[0]).join(' ')).toBe(BISMILLAH);
	});
	it('surat tanpa basmalah terpisah', () => {
		expect(hasBismillah(1)).toBe(false);
		expect(hasBismillah(9)).toBe(false);
		expect(hasBismillah(2)).toBe(true);
	});
});
