import { describe, expect, it } from 'vitest';
import { clean, cleanName, containing, create, merge, NAME_MAX, newId, remove, rename, toggle, type Koleksi } from './koleksi.ts';

const base: Koleksi[] = [
	{ id: 'a', name: 'Harian', ids: [1, 2] },
	{ id: 'b', name: 'Anak', ids: [2] }
];

describe('koleksi', () => {
	it('nama dirapikan dan dibatasi', () => {
		expect(cleanName('  Doa   pagi  ')).toBe('Doa pagi');
		expect(cleanName('x'.repeat(60))).toHaveLength(NAME_MAX);
		expect(cleanName('   ')).toBe('');
	});

	it('membuat koleksi, langsung berisi doa bila diberikan', () => {
		const r = create(base, ' Safar ', 7)!;
		expect(r.list).toHaveLength(3);
		expect(r.list.at(-1)).toEqual({ id: r.id, name: 'Safar', ids: [7] });
		expect(create(base, '  ')).toBeNull();
	});

	it('id baru tidak bentrok', () => {
		let n = 0;
		const rand = () => [0.111111, 0.111111, 0.222222][n++];
		const first = newId([], 1000, () => 0.111111);
		expect(newId([{ id: first, name: 'x', ids: [] }], 1000, rand)).not.toBe(first);
	});

	it('toggle memasukkan lalu mengeluarkan doa', () => {
		const once = toggle(base, 'b', 5);
		expect(once.find((k) => k.id === 'b')!.ids).toEqual([2, 5]);
		expect(toggle(once, 'b', 5).find((k) => k.id === 'b')!.ids).toEqual([2]);
		expect(once.find((k) => k.id === 'a')).toBe(base[0]);
	});

	it('ganti nama, hapus, dan cari koleksi yang memuat doa', () => {
		expect(rename(base, 'a', ' Pagi ')[0].name).toBe('Pagi');
		expect(rename(base, 'a', '  ')).toBe(base);
		expect(remove(base, 'a').map((k) => k.id)).toEqual(['b']);
		expect(containing(base, 2).map((k) => k.id)).toEqual(['a', 'b']);
		expect(containing(base, 9)).toEqual([]);
	});

	it('membersihkan data rusak', () => {
		expect(
			clean([
				{ id: 'a', name: ' X ', ids: [1, 1, 'z', 2.5, 3] },
				{ id: 'a', name: 'dobel', ids: [] },
				{ id: 'c', name: '', ids: [] },
				null,
				'teks'
			])
		).toEqual([{ id: 'a', name: 'X', ids: [1, 3] }]);
		expect(clean('bukan larik')).toEqual([]);
	});

	it('gabung dari backup tanpa kehilangan isi', () => {
		const m = merge(base, [
			{ id: 'b', name: 'Anak (lama)', ids: [4, 2] },
			{ id: 'c', name: 'Baru', ids: [9] }
		]);
		expect(m.map((k) => [k.id, k.name, k.ids])).toEqual([
			['a', 'Harian', [1, 2]],
			['b', 'Anak', [2, 4]],
			['c', 'Baru', [9]]
		]);
	});
});
