/**
 * Akses ke doa.json. Hanya diimpor dari +page.server.ts sehingga teks lengkap cukup disisipkan
 * ke halaman yang membutuhkannya saat prerender, tidak ikut JavaScript aplikasi.
 */
import raw from '#lib/data/doa.json';
import {
	doaHref,
	isReading,
	normalize,
	shortName,
	wordCount,
	type Category,
	type DailyDoa,
	type Doa,
	type DoaItem,
	type Part
} from '#lib/data/doa.ts';

interface RawDoa {
	id: number;
	slug: string;
	category: string;
	title: string;
	description: string;
	url: string;
	parts: Part[];
}

const DATA = raw as { categories: { slug: string; name: string }[]; doa: RawDoa[] };

const readingsOf = (d: RawDoa) => d.parts.filter(isReading);
const wordsOf = (d: RawDoa) => readingsOf(d).reduce((n, p) => n + wordCount(p.arabic), 0);

export const CATEGORIES: Category[] = DATA.categories.map((c) => ({
	...c,
	short: shortName(c.name),
	count: DATA.doa.filter((d) => d.category === c.slug).length
}));

export const categoryBySlug = (slug: string) => CATEGORIES.find((c) => c.slug === slug);

export const TOTAL = DATA.doa.length;

const clip = (s: string, n: number) => (s.length > n ? s.slice(0, s.lastIndexOf(' ', n) > 0 ? s.lastIndexOf(' ', n) : n) + ' …' : s);

export const ITEMS: DoaItem[] = DATA.doa.map((d) => {
	const r = readingsOf(d);
	const cat = categoryBySlug(d.category)!;
	return {
		id: d.id,
		slug: d.slug,
		category: d.category,
		title: d.title,
		preview: clip(r[0]?.arabic ?? '', 140),
		readings: r.length,
		words: wordsOf(d),
		search: normalize([d.title, cat.short, clip(r.map((p) => `${p.translation} ${p.latin}`).join(' '), 600)].join(' '))
	};
});

export const itemsIn = (category: string) => ITEMS.filter((d) => d.category === category);

/** Pisahkan keterangan sumber dari daftar tim penyusun (di bawah garis "----"). */
function splitDescription(desc: string) {
	const [note, team = ''] = desc.split(/\n-{3,}\n/);
	return {
		note: note.trim(),
		team: team
			.split('\n')
			.map((l) => l.trim())
			.filter(Boolean)
	};
}

export function getDoa(category: string, slug: string): Doa | undefined {
	const d = DATA.doa.find((x) => x.category === category && x.slug === slug);
	if (!d) return;
	return {
		id: d.id,
		slug: d.slug,
		category: d.category,
		title: d.title,
		parts: d.parts,
		url: d.url,
		words: wordsOf(d),
		...splitDescription(d.description)
	};
}

export const ALL_PATHS = DATA.doa.map((d) => ({ kategori: d.category, slug: d.slug }));

/** Doa pendek berbacaan tunggal untuk kartu "doa hari ini". */
export const DAILY: DailyDoa[] = DATA.doa.flatMap((d) => {
	const r = readingsOf(d);
	if (d.parts.length !== 1 || r.length !== 1 || !r[0].translation || wordCount(r[0].arabic) > 24) return [];
	return [
		{
			id: d.id,
			href: doaHref(d),
			category: categoryBySlug(d.category)!.short,
			title: d.title,
			arabic: r[0].arabic,
			translation: r[0].translation
		}
	];
});
