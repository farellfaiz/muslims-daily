/**
 * Ubah transliterasi per kata quran.com ("fī l-dun'yā ḥasanatan") ke gaya transliterasi
 * NU Online yang dipakai doa lain ("fid-dunyâ ḫasanatan"), supaya latin di kumpulan doa seragam.
 *
 * Dipakai scripts/doa-kemenag.mjs untuk doa dari ayat. Aturannya sengaja sederhana:
 * - huruf: ā ī ū -> â î û, ḥ -> ḫ, ʿ -> ‘, sh -> sy, dh -> dz, th -> ts, ṣ -> sh, ḍ -> dl, ṭ -> th, ẓ -> dh
 * - diftong: aw -> au, ay -> ai (bila tidak diikuti vokal)
 * - pemisah suku ' dibuang (dun'yā -> dunyâ)
 * - artikel "l-" digabung ke kata sebelumnya, huruf syamsiyah diasimilasi (mina l-ẓālimīna -> minadh-dhâlimîna)
 * - hamzah washal setelah wa/fa (wa-ittabaʿū) dilebur (wattaba‘û); hamzah qath'i tetap dipisah (wa in)
 * - akhir ayat dibaca waqaf: harakat dan tanwin terakhir dibuang (l-nāri -> nâr)
 */

/** [teks Arab, transliterasi quran.com] */
export type WordTr = [ar: string, tr: string];

const ALIF_WASLA = 'ٱ';

/** huruf syamsiyah dalam ejaan NU (setelah konversi), terpanjang dulu */
const SUN = ['ts', 'dz', 'sy', 'sh', 'dl', 'th', 'dh', 't', 'd', 'r', 'z', 's', 'l', 'n'];

function letters(s: string): string {
	return s
		.replace(/'/g, '')
		.replace(/sh/g, 'sy')
		.replace(/dh/g, 'dz')
		.replace(/th/g, 'ts')
		.replace(/ṣ/g, 'sh')
		.replace(/ḍ/g, 'dl')
		.replace(/ṭ/g, 'th')
		.replace(/ẓ/g, 'dh')
		.replace(/ḥ/g, 'ḫ')
		.replace(/Ḥ/g, 'Ḫ')
		.replace(/ʿ/g, '‘')
		.replace(/ā/g, 'â')
		.replace(/ī/g, 'î')
		.replace(/ū/g, 'û')
		.replace(/a([wy])(?![aiuâîûwy])/g, (_, c) => (c === 'w' ? 'au' : 'ai'));
}

const shorten = (s: string) => s.replace(/â$/, 'a').replace(/î$/, 'i').replace(/û$/, 'u');

/** Satu kata quran.com -> gaya NU, tanpa urusan sambung-menyambung antarkata. */
function word([ar, tr]: WordTr): string {
	let t = tr;
	// awalan wa-/fa-/bi- + hamzah washal: vokal penyambung hilang (wa-ittabaʿū -> wattabaʿū)
	if (!t.startsWith('l-')) t = t.replace(/^([a-z]+)-[aiu]/, (m, pre) => (ar.includes(ALIF_WASLA) ? pre : `${pre} ${m.slice(pre.length + 1)}`));
	return letters(t);
}

/** Ubah deretan kata (satu ayat atau potongannya). `ayatEnd` = kata terakhir adalah akhir ayat. */
export function toNuLatin(words: WordTr[], ayatEnd: boolean): string {
	const out: string[] = [];
	for (const w of words) {
		const t = word(w);
		const art = /^l-(.+)$/.exec(t);
		if (!art) {
			out.push(t);
			continue;
		}
		const rest = art[1];
		// lafaz Allah: mina l-lahi -> minallâhi
		if (/لل[ً-ٰٟ]*ه/.test(w[0]) && rest.startsWith('lah')) {
			const tail = rest.slice(3).replace(/^uma$/, 'umma');
			out.push(out.length ? `${shorten(out.pop()!)}llâh${tail}` : `Allâh${tail}`);
			continue;
		}
		// artikel tersambung ke kata sebelumnya: fî l-dunyâ -> fid-dunyâ, mina l-qaumi -> minal-qaumi;
		// di awal bacaan berdiri sendiri: adh-dhâlimîn, al-qaumi
		const sun = SUN.find((x) => rest.startsWith(x) && !/^[aiuâîû]/.test(rest));
		const head = out.length ? shorten(out.pop()!) : 'a';
		out.push(`${head}${sun ?? 'l'}-${rest}`);
	}
	let s = out.join(' ');
	if (ayatEnd) s = s.replace(/(un|in|an)$/, (m) => (m === 'an' ? 'â' : '')).replace(/([^aiuâîû])[aiu]$/, '$1');
	return s;
}
