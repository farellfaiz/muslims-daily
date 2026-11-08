// Susun src/lib/data/salatRingkas.ts (dzikir setelah salat, versi ringkas).
//   node scripts/salat-ringkas.mjs
//
// Teks Arab TIDAK diketik: dipotong dari teks hadis (fawazahmed0/hadith-api, diunduh per hadis)
// dan dari teks Al-Qur'an yang sudah ada di src/lib/data/dzikir.ts. Latin, terjemahan,
// dan keterangan ditulis di skrip ini; ubah di sini lalu jalankan ulang.
import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const repo = path.join(import.meta.dirname, '..');
const { DZIKIR } = await import(pathToFileURL(path.join(repo, 'src/lib/data/dzikir.ts')).href);

const API = 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions';
/** teks hadis, dengan pengecekan nomor kitab standar (arabicnumber) */
async function hadith(book, n, nomor) {
	const r = await fetch(`${API}/ara-${book}/${n}.json`);
	if (!r.ok) throw new Error(`${book} ${n}: HTTP ${r.status}`);
	const h = (await r.json()).hadiths[0];
	if (String(h.arabicnumber).split('.')[0] !== String(nomor)) throw new Error(`${book} ${n} bukan no. ${nomor}`);
	// buang tanda arah teks (RLM/LRM) yang ada di sumber
	return h.text.replace(/[\u200e\u200f]/g, '').normalize('NFC');
}
/** potong teks dari `from` sampai akhir `to` (keduanya ada di teks sumber apa adanya) */
const cut = (text, from, to) => {
	from = from.normalize('NFC');
	to = to?.normalize('NFC');
	const a = text.indexOf(from);
	if (a < 0) throw new Error(`awal tidak ketemu: ${from}`);
	if (!to) return text.slice(a, a + from.length);
	const b = text.indexOf(to, a);
	if (b < 0) throw new Error(`akhir tidak ketemu: ${to}`);
	return text
		.slice(a, b + to.length)
		.replace(/\s*،\s*/g, ' ')
		.replace(/\s+/g, ' ')
		.trim();
};
const m591 = await hadith('muslim', 1334, 591); // Tsauban
const m593 = await hadith('muslim', 1338, 593); // Al-Mughirah
const b843 = await hadith('bukhari', 843, 843); // lafaz tasbih
const m597 = await hadith('muslim', 1352, 597); // Abu Hurairah
const quran = (id) => DZIKIR.find((d) => d.id === id);

const items = [
	{
		id: 101,
		slug: 'istighfar',
		title: 'Istighfar',
		group: 'dzikir',
		count: 3,
		source: 'HR. Muslim no. 591',
		note: 'Al-Auza\'i (perawi hadis) menjelaskan cara istighfarnya: mengucapkan "astaghfirullāh".',
		ref: `${API}/ara-muslim/1334.json`,
		arabic: cut(m591, 'أَسْتَغْفِرُ اللَّهَ'),
		latin: 'Astaghfirullāh.',
		translation: 'Aku memohon ampun kepada Allah.'
	},
	{
		id: 102,
		slug: 'antas-salam',
		title: 'Allāhumma antas-salām',
		group: 'dzikir',
		count: 1,
		source: 'HR. Muslim no. 591',
		note: 'Dalam riwayat lain (HR. Muslim no. 592) dengan tambahan "yā": tabārakta yā dzal-jalāli wal-ikrām.',
		ref: `${API}/ara-muslim/1334.json`,
		arabic: cut(m591, 'اللَّهُمَّ أَنْتَ السَّلاَمُ', 'وَالإِكْرَامِ'),
		latin: 'Allāhumma antas-salām wa minkas-salām, tabārakta dzal-jalāli wal-ikrām.',
		translation: 'Ya Allah, Engkaulah As-Salām (Yang Maha Sejahtera), dan dari-Mu keselamatan. Mahaberkah Engkau, wahai Pemilik keagungan dan kemuliaan.'
	},
	{
		id: 103,
		slug: 'la-mania',
		title: 'Tidak ada yang dapat menghalangi pemberian-Mu',
		group: 'dzikir',
		count: 1,
		source: 'HR. Bukhari no. 844, Muslim no. 593',
		ref: `${API}/ara-muslim/1338.json`,
		arabic: cut(m593, 'لاَ إِلَهَ إِلاَّ اللَّهُ', 'مِنْكَ الْجَدُّ'),
		latin:
			"Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Allāhumma lā māni'a limā a'ṭaita wa lā mu'ṭiya limā mana'ta wa lā yanfa'u dzal-jaddi minkal-jadd.",
		translation:
			'Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu. Ya Allah, tidak ada yang dapat menghalangi apa yang Engkau berikan, tidak ada yang dapat memberi apa yang Engkau tahan, dan kekayaan orang yang kaya tidak bermanfaat baginya di hadapan-Mu.'
	},
	{
		id: 104,
		slug: 'tasbih',
		title: 'Tasbih',
		group: 'dzikir',
		count: 33,
		source: 'HR. Bukhari no. 843, Muslim no. 597',
		ref: `${API}/ara-bukhari/843.json`,
		arabic: cut(b843, 'سُبْحَانَ اللَّهِ'),
		latin: 'Subḥānallāh.',
		translation: 'Mahasuci Allah.'
	},
	{
		id: 105,
		slug: 'tahmid',
		title: 'Tahmid',
		group: 'dzikir',
		count: 33,
		source: 'HR. Bukhari no. 843, Muslim no. 597',
		ref: `${API}/ara-bukhari/843.json`,
		arabic: cut(b843, 'الْحَمْدُ لِلَّهِ'),
		latin: 'Alḥamdulillāh.',
		translation: 'Segala puji bagi Allah.'
	},
	{
		id: 106,
		slug: 'takbir',
		title: 'Takbir',
		group: 'dzikir',
		count: 33,
		source: 'HR. Bukhari no. 843, Muslim no. 597',
		note: 'Ada juga riwayat takbir 34 kali (HR. Muslim no. 596) tanpa tahlil penutup.',
		ref: `${API}/ara-bukhari/843.json`,
		arabic: cut(b843, 'اللَّهُ أَكْبَرُ'),
		latin: 'Allāhu akbar.',
		translation: 'Allah Mahabesar.'
	},
	{
		id: 107,
		slug: 'tamam-al-miah',
		title: 'Penutup seratus',
		group: 'dzikir',
		count: 1,
		source: 'HR. Muslim no. 597',
		benefit: 'Siapa membaca tasbih, tahmid, dan takbir 33 kali lalu menutupnya dengan ini, diampuni kesalahannya walau sebanyak buih di lautan.',
		ref: `${API}/ara-muslim/1352.json`,
		arabic: cut(m597, 'لاَ إِلَهَ إِلاَّ اللَّهُ', 'قَدِيرٌ'),
		latin: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr.",
		translation: 'Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu.'
	},
	{
		...pick(quran(1)),
		id: 108,
		slug: 'ayat-kursi',
		group: 'quran',
		count: 1,
		source: "QS. Al-Baqarah: 255; HR. An-Nasa'i ('Amal al-Yaum wal-Lailah no. 100)",
		benefit: 'Siapa membacanya setiap selesai salat, tidak ada yang menghalanginya masuk surga selain kematian. Disahihkan Al-Albani (Ash-Shahihah no. 972).'
	},
	...[2, 20, 21].map((qid, k) => ({
		...pick(quran(qid)),
		id: 109 + k,
		slug: ['al-ikhlas', 'al-falaq', 'an-nas'][k],
		group: 'quran',
		count: 1,
		countFor: { subuh: 3, maghrib: 3 },
		source: `${quran(qid).source.split(';')[0]}; HR. Abu Dawud no. 1523`,
		note: k === 0 ? 'Dibaca sekali setiap selesai salat; setelah Subuh dan Maghrib tiga kali (Hisnul Muslim).' : undefined
	}))
];

function pick(d) {
	return { title: d.title, ref: d.ref, arabic: d.arabic, latin: d.latin, translation: d.translation };
}

const head = `/**
 * Dzikir setelah salat, versi ringkas: dzikir yang sahih dari hadis, mengikuti bab
 * "dzikir setelah salam" dalam Hisnul Muslim (Sa'id bin Ali Al-Qahthani), tanpa bacaan
 * khusus Subuh atau Maghrib.
 *
 * Berkas ini DIBUAT OTOMATIS oleh scripts/salat-ringkas.mjs: teks Arab dipotong dari teks hadis (fawazahmed0/hadith-api,
 * lihat \`ref\`) dan dari teks Al-Qur'an di dzikir.ts. Jangan menyunting teks Arab di sini secara manual.
 * Latin dan terjemahan disusun dan masih perlu dicek orang yang paham (verified: false).
 */
import type { SalatItem } from './salat.ts';

export const SALAT_RINGKAS: SalatItem[] = `;
const body = JSON.stringify(
	items.map((d) => Object.fromEntries(Object.entries({ ...d, verified: false }).filter(([, v]) => v !== undefined))),
	null,
	'\t'
);
fs.writeFileSync(path.join(repo, 'src/lib/data/salatRingkas.ts'), head + body + ';\n', 'utf8');
for (const d of items) console.log(d.id, d.count, d.arabic.length > 70 ? d.arabic.slice(0, 70) + '…' : d.arabic);
