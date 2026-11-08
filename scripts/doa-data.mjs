// Unduh kumpulan doa dari NU Online (quran.nu.or.id/doa) lalu simpan sebagai file data.
//   node scripts/doa-data.mjs
//
// Hasil: src/lib/data/doa.json
//   categories  kategori sesuai urutan di NU Online (slug, nama)
//   doa         setiap doa: judul, kategori, keterangan sumber dari NU Online, dan bacaan
//               (bisa lebih dari satu) berisi teks Arab, transliterasi, dan terjemahan,
//               diselingi subjudul ({ heading }) pada doa yang panjang
//
// Teks Arab, transliterasi, terjemahan, dan keterangan sumber disalin apa adanya dari NU Online.
// Jangan menyunting teks Arab secara manual: perbaiki di sumber lalu jalankan ulang skrip ini.

import { writeFileSync } from 'node:fs';
import { join } from 'node:path';

const BASE = 'https://quran.nu.or.id';
const OUT = join(import.meta.dirname, '..', 'src', 'lib', 'data', 'doa.json');
const UA = 'Mozilla/5.0 (compatible; muslims-daily-data-script)';

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function page(path, tries = 4) {
	for (let i = 1; ; i++) {
		try {
			const r = await fetch(BASE + path, { headers: { 'user-agent': UA } });
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			return flight(await r.text());
		} catch (e) {
			if (i >= tries) throw new Error(`${path}: ${e.message}`);
			await sleep(1000 * i);
		}
	}
}

/** Gabungkan data React Server Components yang disisipkan Next.js di HTML. */
function flight(html) {
	let out = '';
	for (const m of html.matchAll(/self\.__next_f\.push\(\[1,("(?:[^"\\]|\\.)*")\]\)/g)) out += JSON.parse(m[1]);
	return out;
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

const ARABIC = /[؀-ۿ]/;

/**
 * Satu baris konten NU Online. Baris tanpa transliterasi yang bukan teks Arab (mis. "Ijab Ayah
 * Mempelai Wanita") atau berupa label Arab pendek seperti "الدعاء" adalah subjudul.
 */
function part(p) {
	const arabic = clean(p.arabic);
	const latin = clean(p.transliteration);
	const translation = clean(p.translate);
	if (!latin && (!ARABIC.test(arabic) || arabic.split(/\s+/).length <= 2)) return { heading: translation || arabic };
	return { arabic, latin, translation };
}

const index = await page('/doa');
// Kartu kategori di halaman depan: {"href":"/doa/doa-ilmu",...,"title":"Doa Ilmu"}
const cats = new Map(
	[...index.matchAll(/"href":"\/doa\/([a-z0-9-]+)","prefetch":false,"className":"[^"]*","title":"([^"]+)"/g)].map((m) => [m[1], m[2]])
);
console.log(`${cats.size} kategori`);

const categories = [];
const doa = [];

for (const [cat, name] of cats) {
	await sleep(300);
	// Halaman kategori sudah memuat semua doa di dalamnya beserta bacaannya.
	const text = await page(`/doa/${cat}`);
	const sections = valueAt(text, 'sections');
	if (!sections?.length) throw new Error(`/doa/${cat}: data kategori tidak ditemukan`);
	for (const v of sections.toSorted((a, b) => a.order - b.order)) {
		if (!v.content?.length) throw new Error(`/doa/${cat}/${v.slug}: tanpa bacaan`);
		doa.push({
			id: v.id,
			slug: v.slug,
			category: cat,
			title: v.name.trim(),
			description: clean(v.description),
			url: `${BASE}/doa/${cat}/${v.slug}`,
			parts: v.content
				.toSorted((a, b) => a.order - b.order)
				.map(part)
		});
	}
	categories.push({ slug: cat, name: name.trim() });
	console.log(`  ${name} · ${sections.length} doa`);
}

const ids = new Set();
for (const d of doa) {
	if (ids.has(d.id)) throw new Error(`id ganda: ${d.id}`);
	ids.add(d.id);
}

writeFileSync(
	OUT,
	JSON.stringify(
		{ source: { name: 'NU Online', url: `${BASE}/doa`, fetchedAt: new Date().toISOString().slice(0, 10) }, categories, doa },
		null,
		'\t'
	) + '\n'
);
console.log(`${doa.length} doa disimpan ke ${OUT}`);
