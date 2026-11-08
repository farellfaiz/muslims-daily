import { describe, expect, it } from 'vitest';
import { BISMILLAH, arabicNum, hasBismillah, juzOf, juzStarts, parseJump, searchSurat, type Juz, type Surat, type SuratData } from './quran.ts';
import juzRaw from '../../static/data/juz.json';
import fatihah from '../../static/data/quran/1.json';
import raw from '../../static/data/surat.json';

const list = raw as Surat[];
const juz = juzRaw as Juz[];

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

describe('juz', () => {
	it('30 juz menutup semua ayat tanpa celah', () => {
		expect(juz.map((z) => z.j)).toEqual(Array.from({ length: 30 }, (_, i) => i + 1));
		const total = juz.reduce((a, z) => a + z.s.reduce((b, [, f, t]) => b + t - f + 1, 0), 0);
		expect(total).toBe(6236);
	});

	it('awal juz di dalam surat', () => {
		// Juz 1 dimulai di Al-Fatihah, jadi Al-Baqarah hanya memuat awal juz 2 dan 3
		expect([...juzStarts(juz, 1)]).toEqual([[1, 1]]);
		expect([...juzStarts(juz, 2)]).toEqual([
			[142, 2],
			[253, 3]
		]);
		expect(juzStarts(juz, 112).size).toBe(0);
	});

	it('juz sebuah ayat', () => {
		expect(juzOf(juz, 2, 255)).toBe(3);
		expect(juzOf(juz, 36, 1)).toBe(22);
		expect(juzOf(juz, 114, 6)).toBe(30);
	});
});

describe('lompat ke ayat', () => {
	const jump = (q: string) => {
		const r = parseJump(list, q);
		return r && `${r.surat.n}:${r.ayat}`;
	};

	it('nomor surat dan ayat', () => {
		expect(jump('2:255')).toBe('2:255');
		expect(jump('2 255')).toBe('2:255');
		expect(jump('18.10')).toBe('18:10');
	});

	it('nama surat dan ayat', () => {
		expect(jump('baqarah 255')).toBe('2:255');
		expect(jump('al-kahfi:10')).toBe('18:10');
		expect(jump('yasin 1')).toBe('36:1');
	});

	it('bukan lompatan', () => {
		expect(jump('2:300')).toBeNull(); // Al-Baqarah hanya 286 ayat
		expect(jump('baqarah')).toBeNull();
		expect(jump('36')).toBeNull();
		expect(jump('xyz 5')).toBeNull();
	});
});
