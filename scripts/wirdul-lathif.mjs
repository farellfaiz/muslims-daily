// Unduh Wirdul Lathif (wirid pagi dan sore susunan al-Habib Abdullah al-Haddad) dari NU Online,
// sebagai versi kedua dzikir pagi petang.
//   node scripts/wirdul-lathif.mjs
//
// Hasil: src/lib/data/wirdulLathif.json
//   source  nama, tautan, keterangan naskah, dan tim penyalin dari NU Online
//   pagi    bacaan wirid pagi
//   petang  bacaan wirid sore
//
// Teks Arab, transliterasi, dan terjemahan disalin apa adanya dari NU Online. Yang diubah hanya:
// penanda jumlah ulangan ("×٣", "3x", "(3x)") diambil menjadi angka `count` lalu dibuang dari teks,
// rujukan ayat "(QS ...)" di akhir terjemahan dipindah ke `source`, dan baris judul pembuka
// (tanpa transliterasi) dilewati.
// Jangan menyunting teks secara manual: perbaiki di sumber lalu jalankan ulang skrip ini.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://quran.nu.or.id';
const PATH = '/wirid/wirid-harian';
const OUT = join(import.meta.dirname, '..', 'src', 'lib', 'data', 'wirdulLathif.json');
const UA = 'Mozilla/5.0 (compatible; muslims-daily-data-script)';
/** id dimulai dari sini agar progres tidak bentrok dengan dzikir versi Hisnul Muslim */
const ID_BASE = { pagi: 1000, petang: 2000 };

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(path, tries = 4) {
	for (let i = 1; ; i++) {
		try {
			const r = await fetch(BASE + path, { headers: { 'user-agent': UA } });
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			let out = '';
			const html = await r.text();
			for (const m of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) out += JSON.parse(m[1]);
			return out;
		} catch (e) {
			if (i >= tries) throw new Error(`${path}: ${e.message}`);
			await sleep(1000 * i);
		}
	}
}

/** Ambil nilai JSON utuh (objek atau larik) sesudah `"key":` (menghitung kurung, peka string). */
function valueAt(text, key) {
	const start = text.indexOf(`"${key}":`);
	if (start < 0) return null;
	const from = start + key.length + 3;
	let depth = 0;
	let str = false;
	for (let i = from; i < text.length; i++) {
		const c = text[i];
		if (str) {
			if (c === '\\') i++;
			else if (c === '"') str = false;
		} else if (c === '"') str = true;
		else if (c === '{' || c === '[') depth++;
		else if ((c === '}' || c === ']') && --depth === 0) return JSON.parse(text.slice(from, i + 1));
	}
	return null;
}

const clean = (s) => (s ?? '').replace(/\r\n/g, '\n').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim();
const AR_DIGIT = (s) => s.replace(/[٠-٩]/g, (d) => String('٠١٢٣٤٥٦٧٨٩'.indexOf(d)));

/** Jumlah ulangan di akhir teks: Arab "×٣", latin "3x", terjemahan "(3x)". */
function takeCount(arabic, latin, translation) {
	const ar = /\s*[×x]\s*([٠-٩0-9]+)\s*$/u.exec(arabic);
	const lt = /\s*\(?\s*([0-9]+)\s*[x×]\s*\)?\s*$/iu.exec(latin);
	const tr = /\s*\(\s*([0-9]+)\s*[x×]\s*\)/iu.exec(translation);
	const n = [ar && +AR_DIGIT(ar[1]), lt && +lt[1], tr && +tr[1]].filter(Boolean);
	if (new Set(n).size > 1) throw new Error(`jumlah ulangan tidak sama: ${n.join(', ')} di "${latin.slice(0, 40)}"`);
	return {
		count: n[0] ?? 1,
		arabic: ar ? arabic.slice(0, ar.index).trim() : arabic,
		latin: lt ? latin.slice(0, lt.index).trim() : latin,
		translation: tr ? (translation.slice(0, tr.index) + translation.slice(tr.index + tr[0].length)).trim() : translation
	};
}

const QS = /\s*\(QS\.?\s+([^)]+)\)\.?\s*$/;

/** Judul kartu: rujukan ayat (mis. "Al-Hashr: 22"), selain itu awal transliterasinya. */
function titleOf(latin, qs) {
	if (qs) return qs;
	const words = latin.replace(/\s+/g, ' ').split(' ');
	const head = words.slice(0, 4).join(' ').replace(/[.,;:]$/, '');
	return words.length > 4 ? `${head} …` : head;
}

const text = await page(PATH);
const sections = valueAt(text, 'sections');
if (!sections?.length) throw new Error(`${PATH}: data wirid tidak ditemukan`);

const out = {};
let source;
for (const time of ['pagi', 'petang']) {
	const slug = time === 'pagi' ? 'wirdul-lathif-pagi' : 'wirdul-lathif-sore';
	const s = sections.find((x) => x.slug === slug);
	if (!s?.content?.length) throw new Error(`${slug} tidak ditemukan`);
	const [note, team = ''] = clean(s.description).split(/\n-{3,}\n/);
	source ??= {
		name: 'NU Online',
		url: `${BASE}${PATH}/wirdul-lathif-pagi`,
		note: note.trim(),
		team: team.split('\n').map((l) => l.trim()).filter(Boolean),
		fetchedAt: new Date().toISOString().slice(0, 10)
	};
	out[time] = [];
	for (const p of s.content.toSorted((a, b) => a.order - b.order)) {
		const raw = { arabic: clean(p.arabic), latin: clean(p.transliteration), translation: clean(p.translate) };
		if (!raw.latin) continue; // judul pembuka "الورد اللطيف"
		const t = takeCount(raw.arabic, raw.latin, raw.translation);
		// rujukan ayat di akhir terjemahan dipindah ke `source`
		const m = QS.exec(t.translation);
		const qs = m?.[1].trim();
		out[time].push({
			id: ID_BASE[time] + p.order,
			title: titleOf(t.latin, qs),
			count: t.count,
			...(qs ? { source: `QS. ${qs}` } : {}),
			arabic: t.arabic,
			latin: t.latin,
			translation: m ? t.translation.slice(0, m.index).trim() : t.translation
		});
	}
	console.log(`${s.name}: ${out[time].length} bacaan`);
}

writeFileSync(OUT, JSON.stringify({ source, ...out }, null, '\t') + '\n');
console.log(`disimpan ke ${OUT}`);
