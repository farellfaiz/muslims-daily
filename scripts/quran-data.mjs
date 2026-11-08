// Unduh data Al-Qur'an dari quran.com lalu simpan sebagai file statis.
//   node scripts/quran-data.mjs          semua data
//   node scripts/quran-data.mjs --juz    hanya juz.json
//
// Hasil:
//   static/data/surat.json        daftar 114 surat (kecil, ikut precache)
//   static/data/juz.json          30 juz: [surat, ayat awal, ayat akhir] per bagian (kecil, ikut precache)
//   static/data/quran/<n>.json    isi tiap surat: teks Utsmani per kata, transliterasi,
//                                 arti per kata, dan terjemahan Kemenag per ayat
//                                 (diunduh saat surat dibuka, lalu disimpan untuk offline)
//
// Sumber: api.quran.com v4. Teks Utsmani dan arti per kata bahasa Indonesia dari quran.com,
// terjemahan ayat: Kementerian Agama RI (resource 33). Jangan menyunting teks Arab secara manual.

import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const API = 'https://api.quran.com/api/v4';
const TRANSLATION = 33; // Indonesian Islamic Affairs Ministry (Kemenag)
const OUT = join(import.meta.dirname, '..', 'static', 'data');

async function get(url, tries = 4) {
	for (let i = 1; ; i++) {
		try {
			const r = await fetch(url, { headers: { accept: 'application/json' } });
			if (!r.ok) throw new Error(`HTTP ${r.status}`);
			return await r.json();
		} catch (e) {
			if (i >= tries) throw new Error(`${url}: ${e.message}`);
			await new Promise((res) => setTimeout(res, 800 * i));
		}
	}
}

/** buang tag catatan kaki (<sup foot_note=..>1</sup>) dan tag lain */
const clean = (s) =>
	s
		.replace(/<sup[^>]*>.*?<\/sup>/g, '')
		.replace(/<[^>]+>/g, '')
		.replace(/\s+/g, ' ')
		.trim();

async function surah(n) {
	const ayat = [];
	for (let page = 1; ; page++) {
		const q = new URLSearchParams({
			language: 'id',
			words: 'true',
			word_fields: 'text_uthmani',
			translations: String(TRANSLATION),
			per_page: '50',
			page: String(page)
		});
		const j = await get(`${API}/verses/by_chapter/${n}?${q}`);
		for (const v of j.verses) {
			const words = v.words.filter((w) => w.char_type_name === 'word');
			const t = v.translations.find((x) => x.resource_id === TRANSLATION);
			if (!t) throw new Error(`terjemahan ${v.verse_key} tidak ada`);
			ayat.push({
				t: clean(t.text),
				w: words.map((w) => [w.text_uthmani, w.transliteration?.text ?? '', clean(w.translation?.text ?? '')])
			});
		}
		if (!j.pagination.next_page) break;
	}
	return ayat;
}

// ---- juz: API mengembalikan entri ganda, ambil satu per nomor juz ----
const { juzs } = await get(`${API}/juzs`);
const byNo = new Map();
for (const z of juzs) byNo.set(z.juz_number, z.verse_mapping);
if (byNo.size !== 30) throw new Error(`jumlah juz ${byNo.size}`);
const juz = [...byNo]
	.sort((a, b) => a[0] - b[0])
	.map(([j, map]) => ({
		j,
		s: Object.entries(map)
			.map(([n, range]) => [Number(n), ...range.split('-').map(Number)])
			.sort((a, b) => a[0] - b[0])
	}));
mkdirSync(OUT, { recursive: true });
writeFileSync(join(OUT, 'juz.json'), JSON.stringify(juz));
console.log('juz.json: 30 juz');
// --juz: cukup juz.json, tidak mengunduh ulang 114 surat
if (!process.argv.includes('--juz')) await all();

async function all() {
	const { chapters } = await get(`${API}/chapters?language=id`);
	if (chapters.length !== 114) throw new Error(`jumlah surat ${chapters.length}`);

	const list = chapters.map((c) => ({
		n: c.id,
		nama: c.name_simple,
		arab: c.name_arabic,
		arti: c.translated_name.name,
		ayat: c.verses_count,
		tempat: c.revelation_place === 'makkah' ? 'Makkiyah' : 'Madaniyah'
	}));

	mkdirSync(join(OUT, 'quran'), { recursive: true });
	writeFileSync(join(OUT, 'surat.json'), JSON.stringify(list));

	// beberapa surat sekaligus, tidak membanjiri API
	let next = 0;
	let words = 0;
	async function worker() {
		while (next < list.length) {
			const s = list[next++];
			const ayat = await surah(s.n);
			if (ayat.length !== s.ayat) throw new Error(`${s.nama}: ${ayat.length} ayat, seharusnya ${s.ayat}`);
			words += ayat.reduce((a, v) => a + v.w.length, 0);
			writeFileSync(join(OUT, 'quran', `${s.n}.json`), JSON.stringify({ n: s.n, ayat }));
			process.stdout.write(`${s.n} `);
		}
	}
	await Promise.all(Array.from({ length: 4 }, worker));
	console.log(`\nselesai: 114 surat, ${list.reduce((a, s) => a + s.ayat, 0)} ayat, ${words} kata`);
}
