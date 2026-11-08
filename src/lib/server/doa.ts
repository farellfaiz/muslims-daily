/**
 * Akses ke data doa (NU Online + buku Kemenag RI). Hanya diimpor dari +page.server.ts sehingga teks
 * lengkap cukup disisipkan ke halaman yang membutuhkannya saat prerender, tidak ikut JavaScript aplikasi.
 */
import nuRaw from '#lib/data/doa.json';
import kemenagRaw from '#lib/data/doa-kemenag.json';
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
	type Part,
	type SourceKey
} from '#lib/data/doa.ts';

interface RawDoa {
	id: number;
	slug: string;
	category: string;
	title: string;
	parts: Part[];
	source: SourceKey;
	/** NU Online: keterangan sumber + tim di bawah garis "----" */
	description?: string;
	url?: string;
	/** Kemenag: keterangan dan halaman buku */
	note?: string;
	page?: number;
	ownText?: boolean;
}

type RawCategory = { slug: string; name: string };
const NU = nuRaw as { categories: RawCategory[]; doa: Omit<RawDoa, 'source'>[] };
const KEMENAG = kemenagRaw as { categories: RawCategory[]; doa: Omit<RawDoa, 'source'>[] };

/** Kategori baru dari buku Kemenag disisipkan setelah kategori NU yang paling dekat temanya. */
const INSERT_AFTER: Record<string, string> = {
	'doa-pagi-petang': 'doa-keseharian',
	'doa-al-quran': 'doa-para-nabi-di-al-quran',
	'doa-ampunan': 'doa-kualitas-diri'
};
const categories = [...NU.categories];
for (const c of KEMENAG.categories) {
	const at = categories.findIndex((x) => x.slug === INSERT_AFTER[c.slug]);
	categories.splice(at < 0 ? categories.length : at + 1, 0, c);
}

const DATA = {
	categories,
	doa: [
		...NU.doa.map((d) => ({ ...d, source: 'nu' as const })),
		...KEMENAG.doa.map((d) => ({ ...d, source: 'kemenag' as const }))
	] satisfies RawDoa[]
};

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
	const d: RawDoa | undefined = DATA.doa.find((x) => x.category === category && x.slug === slug);
	if (!d) return;
	return {
		id: d.id,
		slug: d.slug,
		category: d.category,
		title: d.title,
		parts: d.parts,
		source: d.source,
		url: d.url ?? null,
		page: d.page,
		ownText: d.ownText ?? false,
		words: wordsOf(d),
		...(d.source === 'nu' ? splitDescription(d.description ?? '') : { note: d.note ?? '', team: [] })
	};
}

export const ALL_PATHS = DATA.doa.map((d) => ({ kategori: d.category, slug: d.slug }));

/** Doa pendek berbacaan tunggal untuk kartu "doa hari ini". */
export const DAILY: DailyDoa[] = DATA.doa.flatMap((d: RawDoa) => {
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
