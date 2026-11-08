// Susun doa dari buku "Kumpulan Doa Sehari-hari" (Kementerian Agama RI, cetakan III, 2013)
// menjadi file data yang dibaca bersama doa NU Online.
//   node scripts/doa-kemenag.mjs
//
// Masukan: scripts/data/doa-kemenag.src.json (disusun tangan dari buku)
//   - bacaan non-Qur'an: teks Arab disalin dari halaman buku; transliterasi dan terjemahan disusun
//     Muslims Daily (bukan salinan terjemahan buku) dan disebut begitu di keterangan sumbernya
//   - bacaan Qur'an ditulis sebagai rujukan { quran: "2:201" } atau { quran: "5:114", fromWord, toWord }
//     dan teksnya diambil dari static/data/quran (teks Utsmani, transliterasi quran.com yang diubah ke gaya NU lewat src/lib/latinNu.ts,
//     terjemahan Kemenag), bukan diketik ulang
//   - doa yang sudah ada di NU Online tidak dimasukkan agar tidak dobel
// Hasil: src/lib/data/doa-kemenag.json

import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { toNuLatin } from '../src/lib/latinNu.ts';

const ROOT = join(import.meta.dirname, '..');
const SRC = join(ROOT, 'scripts', 'data', 'doa-kemenag.src.json');
const OUT = join(ROOT, 'src', 'lib', 'data', 'doa-kemenag.json');
const NU = JSON.parse(readFileSync(join(ROOT, 'src', 'lib', 'data', 'doa.json'), 'utf8'));

/** id doa Kemenag dimulai dari sini agar tidak bentrok dengan id NU Online (favorit memakai id). */
const ID_BASE = 10000;

const NEW_CATEGORIES = [
	{ slug: 'doa-al-quran', name: "Doa dari Al-Qur'an" },
	{ slug: 'doa-ampunan', name: 'Doa Ampunan & Taubat' },
	{ slug: 'doa-pagi-petang', name: 'Doa Pagi & Petang' }
];
const KNOWN = new Set([...NU.categories, ...NEW_CATEGORIES].map((c) => c.slug));

const surat = new Map();
const loadSurat = (n) => {
	if (!surat.has(n)) surat.set(n, JSON.parse(readFileSync(join(ROOT, 'static', 'data', 'quran', `${n}.json`), 'utf8')));
	return surat.get(n);
};

const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arabicNum = (n) => String(n).replace(/\d/g, (d) => AR_DIGITS[+d]);
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
const quote = (s) => `“${s.trim().replace(/^[“"]|[”"]$/g, '').replace(/[,;:]$/, '.')}”`;

/** { quran: "3:193-194", fromWord?, toWord?, translation? } -> bacaan Arab/Latin/terjemahan */
function quranPart(p) {
	const m = /^(\d+):(\d+)(?:-(\d+))?$/.exec(p.quran);
	if (!m) throw new Error(`rujukan Qur'an tidak dikenal: ${p.quran}`);
	const [n, a1, a2] = [+m[1], +m[2], +(m[3] ?? m[2])];
	const s = loadSurat(n);
	const partial = p.fromWord != null || p.toWord != null;
	if (partial && a1 !== a2) throw new Error(`${p.quran}: fromWord/toWord hanya untuk satu ayat`);
	const arabic = [];
	const latin = [];
	const tr = [];
	for (let a = a1; a <= a2; a++) {
		const ayat = s.ayat[a - 1];
		if (!ayat) throw new Error(`${p.quran}: ayat ${a} tidak ada`);
		let words = ayat.w;
		const from = p.fromWord ?? 1;
		const to = p.toWord ?? words.length;
		if (from < 1 || to > words.length || from > to) throw new Error(`${p.quran}: rentang kata ${from}-${to} dari ${words.length}`);
		words = words.slice(from - 1, to).map((w) => [...w]);
		// Potongan yang dimulai di tengah ayat: tasydid idgham di huruf pertama (رَّبَّنَا) hanya ada
		// karena tersambung dengan kata sebelumnya; saat dibaca sebagai awal doa dibuang (رَبَّنَا).
		if (a === a1 && from > 1) words[0][0] = words[0][0].replace(/^(\p{L}[ً-ِْ-ٟ]*)ّ/u, '$1');
		arabic.push(words.map((w) => w[0]).join(' ') + (to === ayat.w.length ? ` ﴿${arabicNum(a)}﴾` : ''));
		// latin per kata quran.com diubah ke gaya NU Online supaya seragam dengan doa lain
		latin.push(toNuLatin(words.map((w) => [w[0], w[1]]), to === ayat.w.length));
		tr.push(ayat.t);
	}
	if (partial && !p.translation) throw new Error(`${p.quran}: potongan ayat wajib punya translation`);
	return { arabic: arabic.join(' '), latin: cap(latin.join(' ')), translation: quote(p.translation ?? tr.join(' ')) };
}

const slugify = (s) =>
	s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/['’‘`]/g, '')
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

const src = JSON.parse(readFileSync(SRC, 'utf8'));
const used = new Set(NU.doa.map((d) => `${d.category}/${d.slug}`));
const doa = [];
for (const [i, d] of src.doa.entries()) {
	if (d.dupOf) continue;
	if (!KNOWN.has(d.category)) throw new Error(`${d.title}: kategori ${d.category} tidak dikenal`);
	let slug = slugify(d.title);
	if (used.has(`${d.category}/${slug}`)) slug += '-kemenag';
	if (used.has(`${d.category}/${slug}`)) throw new Error(`slug dobel: ${d.category}/${slug}`);
	used.add(`${d.category}/${slug}`);

	const parts = d.parts.map((p) => {
		if ('heading' in p) return { heading: p.heading };
		if ('quran' in p) return { ...quranPart(p), quran: true };
		if (!p.arabic?.trim()) throw new Error(`${d.title}: bacaan tanpa teks Arab`);
		return { arabic: p.arabic.trim(), latin: (p.latin ?? '').trim(), translation: p.translation ? quote(p.translation.trim()) : '' };
	});
	if (!parts.some((p) => 'arabic' in p)) throw new Error(`${d.title}: tidak ada bacaan`);
	const ownText = parts.some((p) => 'arabic' in p && !p.quran);
	const onlyQuran = parts.every((p) => !('arabic' in p) || p.quran);

	const lines = [];
	if (d.ref) lines.push(`Rujukan: ${d.ref}.`.replace(/\.\.$/, '.'));
	else if (!onlyQuran) lines.push('Buku tidak mencantumkan rujukan hadis atau kitab untuk doa ini.');
	if (d.note) lines.push(d.note);
	if (onlyQuran) lines.push("Teks ayat, transliterasi, dan terjemahan Kemenag diambil dari data Al-Qur'an aplikasi ini.");
	else if (ownText) lines.push('Teks Arab disalin dari buku. Transliterasi dan terjemahan disusun Muslims Daily.');

	doa.push({
		id: ID_BASE + i + 1,
		slug,
		category: d.category,
		title: d.title,
		page: d.bookPage,
		ownText,
		note: lines.join('\n\n'),
		parts: parts.map(({ quran, ...p }) => p)
	});
}

writeFileSync(
	OUT,
	JSON.stringify(
		{
			source: {
				name: 'Kemenag RI',
				title: 'Kumpulan Doa Sehari-hari',
				publisher: 'Direktorat Penerangan Agama Islam, Ditjen Bimas Islam, Kementerian Agama RI',
				edition: 'Cetakan III, November 2013',
				isbn: '978-979-17700-7-1'
			},
			categories: NEW_CATEGORIES,
			doa
		},
		null,
		'\t'
	) + '\n'
);
console.log(`${doa.length} doa (${src.doa.length - doa.length} dilewati karena sudah ada di NU Online atau fitur dzikir) -> ${OUT}`);
