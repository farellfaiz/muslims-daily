import { describe, expect, it } from 'vitest';
import { toNuLatin, type WordTr } from './latinNu.ts';

// kata dari data quran.com (static/data/quran)
const w = (...pairs: string[]): WordTr[] => {
	const out: WordTr[] = [];
	for (let i = 0; i < pairs.length; i += 2) out.push([pairs[i], pairs[i + 1]]);
	return out;
};

describe('latin gaya NU', () => {
	it('huruf, mad, dan artikel bersambung', () => {
		const ayat = w('رَبَّنَآ', 'rabbanā', 'ءَاتِنَا', 'ātinā', 'فِى', 'fī', 'ٱلدُّنْيَا', "l-dun'yā", 'حَسَنَةًۭ', 'ḥasanatan', 'وَقِنَا', 'waqinā', 'عَذَابَ', 'ʿadhāba', 'ٱلنَّارِ', 'l-nāri');
		expect(toNuLatin(ayat, true)).toBe('rabbanâ âtinâ fid-dunyâ ḫasanatan waqinâ ‘adzâban-nâr');
	});

	it('hamzah washal dilebur, hamzah qath\'i dipisah', () => {
		expect(toNuLatin(w('فَٱغْفِرْ', "fa-igh'fir"), false)).toBe('faghfir');
		expect(toNuLatin(w('وَإِن', 'wa-in'), false)).toBe('wa in');
	});

	it('artikel di awal bacaan dan lafaz Allah', () => {
		expect(toNuLatin(w('ٱلظَّٰلِمِينَ', 'l-ẓālimīna'), true)).toBe('adh-dhâlimîn');
		expect(toNuLatin(w('حَسْبِىَ', 'ḥasbiya', 'ٱللَّهُ', 'l-lahu'), false)).toBe('ḫasbiyallâhu');
		expect(toNuLatin(w('ٱللَّهُمَّ', 'l-lahuma'), false)).toBe('Allâhumma');
	});

	it('diftong', () => {
		expect(toNuLatin(w('ٱلْقَوْمِ', 'l-qawmi'), false)).toBe('al-qaumi');
		expect(toNuLatin(w('مَعَ', 'maʿa', 'ٱلْأَبْرَارِ', 'l-abrāri'), true)).toBe('ma‘al-abrâr');
		expect(toNuLatin(w('عَلَيْنَا', 'ʿalaynā'), false)).toBe('‘alainâ');
	});
});
