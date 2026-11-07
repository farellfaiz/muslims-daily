/**
 * Kumpulan doa.
 *
 * PENTING untuk kontributor: setiap doa WAJIB punya sumber yang jelas, dan teks Arab, transliterasi,
 * serta terjemahan harus dicek dari rujukan (mushaf Kemenag untuk ayat, kitab hadis untuk doa
 * ma'tsur) sebelum `verified` diubah menjadi true. Doa yang bukan dari Al-Qur'an atau hadis tetap
 * boleh dimuat, tetapi diberi `warn: true` dan keterangan sumber yang jujur.
 *
 * Status saat ini: SEMUA masih draf (belum diverifikasi), jangan dirilis ke publik apa adanya.
 */

export type Category = 'Salat' | 'Kebutuhan' | 'Waktu' | 'Aktivitas';
export const CATEGORIES: Category[] = ['Salat', 'Kebutuhan', 'Waktu', 'Aktivitas'];

/** [teks Arab, transliterasi, arti] per kata atau per frasa pendek */
export type Word = [ar: string, lat: string, arti: string];

interface DoaInput {
	id: number;
	slug: string;
	title: string;
	category: Category;
	source: string;
	note?: string;
	/** sumber bukan Al-Qur'an atau hadis */
	warn?: boolean;
	/** belum lengkap: hanya bagian awal doa */
	partial?: boolean;
	verified: boolean;
	words?: Word[];
	arabic?: string;
	latin?: string;
	translation: string;
}

export interface Doa extends DoaInput {
	arabic: string;
	latin: string;
	wordCount: number;
}

const INPUT: DoaInput[] = [
	{
		id: 1,
		slug: 'setelah-salat-fardu',
		title: 'Doa setelah salat fardu',
		category: 'Salat',
		source: 'HR. Muslim',
		verified: false,
		words: [
			['اللَّهُمَّ', 'Allāhumma', 'Ya Allah'],
			['أَنْتَ', 'anta', 'Engkau'],
			['السَّلَامُ', 'as-salām', 'Maha Pemberi keselamatan'],
			['وَمِنْكَ', 'wa minka', 'dan dari-Mu'],
			['السَّلَامُ', 'as-salām', 'keselamatan'],
			['تَبَارَكْتَ', 'tabārakta', 'Mahaberkah Engkau'],
			['يَا', 'yā', 'wahai'],
			['ذَا الْجَلَالِ', 'dzal-jalāli', 'Pemilik keagungan'],
			['وَالْإِكْرَامِ', 'wal-ikrām', 'dan kemuliaan']
		],
		translation:
			'Ya Allah, Engkaulah As-Salām dan dari-Mu keselamatan. Mahaberkah Engkau, wahai Pemilik keagungan dan kemuliaan.'
	},
	{
		id: 2,
		slug: 'setelah-salat-duha',
		title: 'Doa setelah salat duha',
		category: 'Salat',
		source: 'Amalan ulama, tidak ditemukan dalam kitab hadis',
		warn: true,
		partial: true,
		verified: false,
		arabic: 'اللَّهُمَّ إِنَّ الضُّحَاءَ ضُحَاؤُكَ وَالْبَهَاءَ بَهَاؤُكَ وَالْجَمَالَ جَمَالُكَ',
		latin: "Allāhumma innaḍ-ḍuḥā'a ḍuḥā'uka wal-bahā'a bahā'uka wal-jamāla jamāluka",
		translation:
			'Ya Allah, sesungguhnya waktu duha adalah waktu-Mu, keagungan adalah keagungan-Mu, dan keindahan adalah keindahan-Mu.'
	},
	{
		id: 3,
		slug: 'sayyidul-istighfar',
		title: 'Sayyidul istighfar',
		category: 'Waktu',
		source: 'HR. Bukhari',
		note: 'Dibaca pagi dan petang.',
		verified: false,
		words: [
			['اللَّهُمَّ أَنْتَ رَبِّي', 'Allāhumma anta rabbī', 'Ya Allah, Engkau Tuhanku'],
			['لَا إِلَهَ إِلَّا أَنْتَ', 'lā ilāha illā anta', 'tiada tuhan selain Engkau'],
			['خَلَقْتَنِي', 'khalaqtanī', 'Engkau menciptakanku'],
			['وَأَنَا عَبْدُكَ', "wa ana 'abduka", 'dan aku hamba-Mu'],
			['وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ', "wa ana 'alā 'ahdika wa wa'dika", 'aku di atas perjanjian dan janji-Mu'],
			['مَا اسْتَطَعْتُ', "mastaṭa'tu", 'semampuku'],
			['أَعُوذُ بِكَ', "a'ūdzu bika", 'aku berlindung kepada-Mu'],
			['مِنْ شَرِّ مَا صَنَعْتُ', "min syarri mā ṣana'tu", 'dari keburukan perbuatanku'],
			['أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ', "abū'u laka bini'matika 'alayya", 'aku mengakui nikmat-Mu kepadaku'],
			['وَأَبُوءُ بِذَنْبِي', "wa abū'u bidzanbī", 'dan aku mengakui dosaku'],
			['فَاغْفِرْ لِي', 'faghfir lī', 'maka ampunilah aku'],
			['فَإِنَّهُ لَا يَغْفِرُ الذُّنُوبَ', 'fa innahū lā yaghfirudz-dzunūba', 'sungguh tiada yang mengampuni dosa'],
			['إِلَّا أَنْتَ', 'illā anta', 'selain Engkau']
		],
		translation:
			'Ya Allah, Engkau Tuhanku, tiada tuhan selain Engkau. Engkau menciptakanku dan aku hamba-Mu. Aku di atas perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, maka ampunilah aku. Sungguh tiada yang mengampuni dosa selain Engkau.'
	},
	{
		id: 4,
		slug: 'dimudahkan-urusan',
		title: 'Doa dimudahkan urusan',
		category: 'Kebutuhan',
		source: 'QS. Taha: 25 sampai 26',
		verified: false,
		words: [
			['رَبِّ', 'Rabbi', 'Ya Tuhanku'],
			['اشْرَحْ', 'isyraḥ', 'lapangkanlah'],
			['لِي', 'lī', 'untukku'],
			['صَدْرِي', 'ṣadrī', 'dadaku'],
			['وَيَسِّرْ', 'wa yassir', 'dan mudahkanlah'],
			['لِي', 'lī', 'untukku'],
			['أَمْرِي', 'amrī', 'urusanku']
		],
		translation: 'Ya Tuhanku, lapangkanlah dadaku, dan mudahkanlah untukku urusanku.'
	},
	{
		id: 5,
		slug: 'tambahan-ilmu',
		title: 'Doa tambahan ilmu',
		category: 'Kebutuhan',
		source: 'QS. Taha: 114',
		verified: false,
		words: [
			['رَبِّ', 'Rabbi', 'Ya Tuhanku'],
			['زِدْنِي', 'zidnī', 'tambahkanlah kepadaku'],
			['عِلْمًا', "'ilmā", 'ilmu']
		],
		translation: 'Ya Tuhanku, tambahkanlah ilmu kepadaku.'
	},
	{
		id: 6,
		slug: 'kebaikan-dunia-akhirat',
		title: 'Doa kebaikan dunia dan akhirat',
		category: 'Kebutuhan',
		source: 'QS. Al-Baqarah: 201',
		verified: false,
		words: [
			['رَبَّنَا', 'Rabbanā', 'Ya Tuhan kami'],
			['آتِنَا', 'ātinā', 'berilah kami'],
			['فِي الدُّنْيَا', 'fid-dunyā', 'di dunia'],
			['حَسَنَةً', 'ḥasanah', 'kebaikan'],
			['وَفِي الْآخِرَةِ', 'wa fil-ākhirati', 'dan di akhirat'],
			['حَسَنَةً', 'ḥasanah', 'kebaikan'],
			['وَقِنَا', 'wa qinā', 'dan lindungilah kami'],
			['عَذَابَ', "'adzāba", 'dari azab'],
			['النَّارِ', 'an-nār', 'neraka']
		],
		translation:
			'Ya Tuhan kami, berilah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari azab neraka.'
	},
	{
		id: 7,
		slug: 'memohon-kesembuhan',
		title: 'Doa memohon kesembuhan',
		category: 'Kebutuhan',
		source: 'HR. Bukhari dan Muslim',
		partial: true,
		verified: false,
		words: [
			['اللَّهُمَّ', 'Allāhumma', 'Ya Allah'],
			['رَبَّ النَّاسِ', 'rabban-nās', 'Tuhan manusia'],
			['أَذْهِبِ', 'adzhibi', 'hilangkanlah'],
			['الْبَأْسَ', "al-ba's", 'penyakit ini'],
			['اشْفِ', 'isyfi', 'sembuhkanlah'],
			['أَنْتَ الشَّافِي', 'antasy-syāfī', 'Engkaulah Yang Maha Menyembuhkan'],
			['لَا شِفَاءَ', "lā syifā'a", 'tiada kesembuhan'],
			['إِلَّا شِفَاؤُكَ', "illā syifā'uka", 'selain kesembuhan-Mu']
		],
		translation:
			'Ya Allah, Tuhan manusia, hilangkanlah penyakit ini. Sembuhkanlah, Engkaulah Yang Maha Menyembuhkan, tiada kesembuhan selain kesembuhan-Mu.'
	},
	{
		id: 8,
		slug: 'sebelum-tidur',
		title: 'Doa sebelum tidur',
		category: 'Waktu',
		source: 'HR. Bukhari',
		verified: false,
		words: [
			['بِاسْمِكَ', 'Bismika', 'Dengan nama-Mu'],
			['اللَّهُمَّ', 'Allāhumma', 'ya Allah'],
			['أَمُوتُ', 'amūtu', 'aku mati'],
			['وَأَحْيَا', 'wa aḥyā', 'dan aku hidup']
		],
		translation: 'Dengan nama-Mu ya Allah, aku mati dan aku hidup.'
	},
	{
		id: 9,
		slug: 'keluar-rumah',
		title: 'Doa keluar rumah',
		category: 'Aktivitas',
		source: 'HR. Abu Dawud dan Tirmidzi',
		verified: false,
		words: [
			['بِسْمِ اللهِ', 'Bismillāhi', 'Dengan nama Allah'],
			['تَوَكَّلْتُ', 'tawakkaltu', 'aku bertawakal'],
			['عَلَى اللهِ', "'alallāh", 'kepada Allah'],
			['لَا حَوْلَ', 'lā ḥaula', 'tiada daya'],
			['وَلَا قُوَّةَ', 'wa lā quwwata', 'dan tiada kekuatan'],
			['إِلَّا بِاللهِ', 'illā billāh', 'kecuali dengan Allah']
		],
		translation:
			'Dengan nama Allah, aku bertawakal kepada Allah. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.'
	}
];

export const DOA: Doa[] = INPUT.map((d) => {
	const arabic = d.arabic ?? d.words!.map((w) => w[0]).join(' ');
	const latin = d.latin ?? d.words!.map((w) => w[1]).join(' ');
	return { ...d, arabic, latin, wordCount: arabic.split(/\s+/).length };
});

export const bySlug = (slug: string) => DOA.find((d) => d.slug === slug);

/** Pencarian toleran ejaan: dhuha = duha = dluha, syifa = sifa. */
export function normalize(s: string): string {
	return s
		.toLowerCase()
		.normalize('NFD')
		.replace(/[̀-ͯ]/g, '')
		.replace(/dh|dl|dz/g, 'd')
		.replace(/sy/g, 's')
		.replace(/[^a-z0-9 ]/g, '');
}

export const searchText = (d: Doa) => normalize([d.title, d.category, d.translation, d.latin, d.source].join(' '));

/** Doa pilihan berganti setiap hari, sama untuk semua orang di hari yang sama. */
export function doaOfTheDay(date: Date): Doa {
	const dayNumber = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 864e5);
	const pool = DOA.filter((d) => !d.warn);
	return pool[dayNumber % pool.length];
}
