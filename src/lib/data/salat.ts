/**
 * Dzikir dan doa setelah salat fardu, versi Al-Azhar (susunan Syifa Budi).
 * Versi lain yang bisa dipilih pengguna: salatRingkas.ts (lihat #lib/salatVersi.ts).
 *
 * Teks Arab, latin, dan terjemahan diambil apa adanya dari "Dzikir & Doa Setelah Sholat"
 * (SOURCE_URL), kumpulan susunan pemilik proyek. Perubahan dari sumber hanya:
 * judul doa ayat ("QS. 3:8") diganti awal bacaannya dan nomor ayat dipindah ke `source`.
 * Untuk memperbarui, ubah sumbernya lalu salin ulang di sini; jangan menulis teks Arab dari ingatan.
 */

export const SOURCE_URL = 'https://farellfaiz.github.io/dzikr-and-duas/';
export const SOURCE_NAME = 'Dzikir & Doa Setelah Sholat';

export interface SalatItem {
	id: number;
	slug: string;
	title: string;
	/** dzikir (dibaca berhitung), doa, atau bacaan Al-Qur'an */
	group: 'dzikir' | 'doa' | 'quran';
	count: number;
	/** jumlah bacaan yang berbeda untuk salat tertentu, mis. tiga kali setelah Subuh dan Maghrib */
	countFor?: Partial<Record<'subuh' | 'dzuhur' | 'ashar' | 'maghrib' | 'isya', number>>;
	/** rujukan: nomor hadis atau ayat */
	source?: string;
	benefit?: string;
	note?: string;
	/** false = susunan latin/terjemahan belum dicek orang yang paham */
	verified?: boolean;
	/** URL rujukan tempat teks Arab diambil */
	ref?: string;
	arabic: string;
	latin: string;
	translation: string;
}

export const SALAT: SalatItem[] = [
	{
		id: 1,
		slug: 'istighfar',
		title: 'Istighfar',
		group: 'dzikir',
		count: 3,
		arabic: 'أَسْتَغْفِرُ اللهَ الْعَظِيمَ',
		latin: "Astaghfirullāhal 'aẓīm",
		translation: 'Aku memohon ampun kepada Allah Yang Maha Agung.'
	},
	{
		id: 2,
		slug: 'tahlil-dan-salam',
		title: 'Tahlil & Salam',
		group: 'dzikir',
		count: 1,
		arabic:
			'اللهُ لَا إِلَهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ وَأَتُوبُ إِلَيْهِ ۞ اللَّهُمَّ أَنْتَ السَّلَامُ وَمِنْكَ السَّلَامُ تَبَارَكْتَ يَا ذَا الْجَلَالِ وَالْإِكْرَامِ',
		latin:
			'Allāhul lā ilāha illā huwal ḥayyul qayyūm wa atūbu ilaih. Allāhumma antas salām wa minkas salām, tabārakta yā dzal jalāli wal ikrām',
		translation:
			'Allah, tiada Tuhan selain Dia, Yang Maha Hidup lagi Maha Berdiri Sendiri; aku bertaubat kepada-Nya. Ya Allah, Engkaulah As-Salām dan dari-Mu segala keselamatan; Maha Berkah Engkau wahai Pemilik Keagungan dan Kemuliaan.'
	},
	{
		id: 3,
		slug: 'tasbih',
		title: 'Tasbih',
		group: 'dzikir',
		count: 33,
		arabic: 'سُبْحَانَ اللهِ',
		latin: 'Subḥānallāh',
		translation: 'Maha Suci Allah.'
	},
	{
		id: 4,
		slug: 'tahmid',
		title: 'Tahmid',
		group: 'dzikir',
		count: 33,
		arabic: 'اَلْحَمْدُ لِلَّهِ',
		latin: 'Alḥamdulillāh',
		translation: 'Segala puji bagi Allah.'
	},
	{
		id: 5,
		slug: 'takbir',
		title: 'Takbir',
		group: 'dzikir',
		count: 33,
		arabic: 'اَللهُ أَكْبَرُ',
		latin: 'Allāhu akbar',
		translation: 'Allah Maha Besar.'
	},
	{
		id: 6,
		slug: 'penutup-dzikir',
		title: 'Penutup Dzikir',
		group: 'dzikir',
		count: 1,
		arabic:
			'اللهُ أَكْبَرُ كَبِيرًا وَالْحَمْدُ لِلَّهِ كَثِيرًا وَسُبْحَانَ اللهِ بُكْرَةً وَأَصِيلًا ۞ لَا إِلَهَ إِلَّا اللهُ وَحْدَهُ لَا شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ ۞ لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللهِ',
		latin:
			"Allāhu akbar kabīran, walḥamdulillāhi katsīran, wa subḥānallāhi bukratan wa aṣīlā. Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul mulku walahul ḥamdu wa huwa 'alā kulli syai'in qadīr. Lā ḥawla walā quwwata illā billāh",
		translation:
			'Allah Maha Besar dengan segala kebesaran, segala puji yang banyak bagi Allah, Maha Suci Allah di pagi dan petang. Tiada Tuhan selain Allah semata, tiada sekutu bagi-Nya; milik-Nya segala kerajaan dan segala puji, Dia Maha Kuasa atas segala sesuatu. Tiada daya dan kekuatan kecuali dengan pertolongan Allah.'
	},
	{
		id: 7,
		slug: 'hamdallah-pembuka',
		title: 'Hamdallah Pembuka',
		group: 'doa',
		count: 1,
		arabic: 'اَلْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
		latin: "Alḥamdulillāhi rabbil 'ālamīn",
		translation: 'Segala puji bagi Allah, Tuhan semesta alam.'
	},
	{
		id: 8,
		slug: 'pujian-hamdan',
		title: 'Pujian (Hamdan)',
		group: 'doa',
		count: 1,
		arabic: 'حَمْدًا يُوَافِي نِعَمَهُ وَيُكَافِئُ مَزِيدَهُ',
		latin: "Hamdan yuwāfī ni'amahū wayukāfi'u mazīdah",
		translation: 'Pujian yang sepadan dengan nikmat-Nya dan setara dengan tambahan karunia-Nya.'
	},
	{
		id: 9,
		slug: 'pujian-lanjutan',
		title: 'Pujian Lanjutan',
		group: 'doa',
		count: 1,
		arabic: 'يَا رَبَّنَا لَكَ الْحَمْدُ كَمَا يَنْبَغِي لِجَلَالِ وَجْهِكَ وَعَظِيمِ سُلْطَانِكَ',
		latin: "Yā rabbanā lakal hamdu kamā yanbaghī lijalāli wajhika wa 'aẓīmi sulṭānik",
		translation:
			'Wahai Tuhan kami, hanya bagi-Mu segala puji, sebagaimana layak bagi keagungan wajah-Mu dan kebesaran kekuasaan-Mu.'
	},
	{
		id: 10,
		slug: 'shalawat',
		title: 'Shalawat',
		group: 'doa',
		count: 1,
		arabic: 'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ',
		latin: "Allāhumma ṣalli 'alā Muḥammadin wa 'alā āli Muḥammad",
		translation: 'Ya Allah, limpahkanlah shalawat kepada Muhammad dan kepada keluarga Muhammad.'
	},
	{
		id: 11,
		slug: 'doa-maghfirah',
		title: 'Doa Maghfirah',
		group: 'doa',
		count: 1,
		arabic:
			'اللَّهُمَّ اغْفِرْ لَنَا ذُنُوبَنَا وَلِوَالِدِينَا وَارْحَمْهُمْ كَمَا رَبَّوْنَا صِغَارًا',
		latin:
			"Allāhummaghfir lanā dzunūbanā wa liwālidīnā warḥamhum kamā rabbaunā ṣighārā",
		translation:
			'Ya Allah, ampunilah dosa-dosa kami dan dosa orang tua kami, dan sayangilah mereka sebagaimana mereka mendidik kami sewaktu kecil.'
	},
	{
		id: 12,
		slug: 'doa-dzikir-dan-ibadah',
		title: 'Doa Dzikir & Ibadah',
		group: 'doa',
		count: 1,
		arabic: 'اللَّهُمَّ أَعِنَّا عَلَى ذِكْرِكَ وَشُكْرِكَ وَحُسْنِ عِبَادَتِكَ',
		latin: "Allāhumma a'innā 'alā dzikrika wa syukrika wa ḥusni 'ibādatik",
		translation:
			'Ya Allah, bantulah kami untuk senantiasa mengingat-Mu, bersyukur kepada-Mu, dan beribadah dengan sebaik-baiknya kepada-Mu.'
	},
	{
		id: 13,
		slug: 'doa-haq-dan-batil',
		title: 'Doa Haq & Batil',
		group: 'doa',
		count: 1,
		arabic:
			'اللَّهُمَّ أَرِنَا الْحَقَّ حَقًّا وَارْزُقْنَا اتِّبَاعَهُ وَأَرِنَا الْبَاطِلَ بَاطِلًا وَارْزُقْنَا اجْتِنَابَهُ',
		latin: "Allāhumma arinal ḥaqqa ḥaqqan warzuqnat tibā'ah wa arinal bāṭila bāṭilan warzuqnaj tinābah",
		translation:
			'Ya Allah, tunjukkanlah kepada kami yang haq itu sebagai haq dan anugerahilah kami kekuatan untuk mengikutinya, serta tunjukkanlah kepada kami yang batil itu sebagai batil dan anugerahilah kami kemampuan untuk menjauhinya.'
	},
	{
		id: 14,
		slug: 'doa-keselamatan',
		title: 'Doa Keselamatan',
		group: 'doa',
		count: 1,
		arabic:
			'اللَّهُمَّ إِنَّا نَسْأَلُكَ سَلَامَةً فِي الدِّينِ وَعَافِيَةً فِي الْجَسَدِ وَزِيَادَةً فِي الْعِلْمِ وَبَرَكَةً فِي الرِّزْقِ وَتَوْبَةً قَبْلَ الْمَوْتِ وَرَحْمَةً عِنْدَ الْمَوْتِ وَمَغْفِرَةً بَعْدَ الْمَوْتِ',
		latin:
			"Allāhumma innā nas'aluka salāmatan fid dīn wa 'āfiyatan fil jasad wa ziyādatan fil 'ilm wa barakatan fir rizqi wa tawbatan qablal mawt wa raḥmatan 'indal mawt wa maghfiratan ba'dal mawt",
		translation:
			'Ya Allah, kami memohon kepada-Mu keselamatan dalam agama, kesehatan pada badan, pertambahan dalam ilmu, keberkahan dalam rezeki, taubat sebelum kematian, rahmat ketika kematian, dan ampunan setelah kematian.'
	},
	{
		id: 15,
		slug: 'doa-sakaratul-maut',
		title: 'Doa Sakaratul Maut',
		group: 'doa',
		count: 1,
		arabic:
			'اللَّهُمَّ هَوِّنْ عَلَيْنَا فِي سَكَرَاتِ الْمَوْتِ وَالنَّجَاةَ مِنَ النَّارِ وَالْعَفْوَ عِنْدَ الْحِسَابِ',
		latin: "Allāhumma hawwin 'alainā fī sakarātil mawt wan najāta minan nāri wal 'afwa 'indal ḥisāb",
		translation:
			'Ya Allah, ringankanlah sakaratul maut bagi kami, berikanlah keselamatan dari api neraka, dan berikanlah ampunan di hari hisab.'
	},
	{
		id: 16,
		slug: 'doa-perlindungan',
		title: 'Doa Perlindungan',
		group: 'doa',
		count: 1,
		arabic:
			'اللَّهُمَّ إِنَّا نَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ وَنَعُوذُ بِكَ مِنَ الْعَجْزِ وَالْكَسَلِ وَنَعُوذُ بِكَ مِنَ الْجُبْنِ وَالْبُخْلِ وَنَعُوذُ بِكَ مِنْ غَلَبَةِ الدَّيْنِ وَقَهْرِ الرِّجَالِ',
		latin:
			"Allāhumma innā na'ūdzubika minal hammi wal ḥazan wa na'ūdzubika minal 'ajzi wal kasal wa na'ūdzubika minal jubni wal bukhl wa na'ūdzubika min ghalabatid daini wa qahrir rijāl",
		translation:
			'Ya Allah, kami berlindung kepada-Mu dari rasa gelisah dan kesedihan, dari kelemahan dan kemalasan, dari sikap pengecut dan kikir, serta dari lilitan utang dan tekanan orang-orang.'
	},
	{
		id: 17,
		slug: 'doa-ishlah',
		title: 'Doa Ishlah',
		group: 'doa',
		count: 1,
		arabic:
			'اللَّهُمَّ أَصْلِحْ لَنَا دِينَنَا الَّذِي هُوَ عِصْمَةُ أَمْرِنَا وَأَصْلِحْ لَنَا دُنْيَانَا الَّتِي فِيهَا مَعَاشُنَا وَأَصْلِحْ لَنَا آخِرَتَنَا الَّتِي إِلَيْهَا مَعَادُنَا وَاجْعَلِ الْحَيَاةَ زِيَادَةً لَنَا فِي كُلِّ خَيْرٍ وَاجْعَلِ الْمَوْتَ رَاحَةً لَنَا مِنْ كُلِّ شَرٍّ',
		latin:
			"Allāhumma aṣliḥ lanā dīnanal ladzī huwa 'iṣmatu amrinā wa aṣliḥ lanā dunyānal latī fīhā ma'āsyanā wa aṣliḥ lanā ākhiratanal latī ilaihā ma'ādunā waj'alil ḥayāta ziyādatan lanā fī kulli khair waj'alil mawta rāḥatan lanā min kulli syarr",
		translation:
			'Ya Allah, perbaikilah agama kami yang merupakan pelindung urusan kami, perbaikilah dunia kami yang di dalamnya terdapat kehidupan kami, perbaikilah akhirat kami yang ke sanalah tempat kembali kami, jadikanlah kehidupan sebagai tambahan kebaikan dalam segala hal, dan jadikanlah kematian sebagai ketenangan dari segala keburukan.'
	},
	{
		id: 18,
		slug: 'rabbana-la-tuzigh-qulubana',
		title: 'Rabbanā lā tuzigh qulūbanā',
		group: 'doa',
		count: 1,
		source: "QS. Ali 'Imrān: 8",
		arabic:
			'رَبَّنَا لَا تُزِغْ قُلُوبَنَا بَعْدَ إِذْ هَدَيْتَنَا وَهَبْ لَنَا مِنْ لَدُنْكَ رَحْمَةً إِنَّكَ أَنْتَ الْوَهَّابُ',
		latin: "Rabbanā lā tuzigh qulūbanā ba'da idz hadaytanā wa hab lanā min ladunka raḥmatan innaka antal wahhāb",
		translation:
			'Wahai Tuhan kami, janganlah Engkau palingkan hati-hati kami setelah Engkau memberikan petunjuk kepada kami, dan anugerahkanlah kepada kami rahmat dari sisi-Mu; sesungguhnya Engkau Maha Pemberi.'
	},
	{
		id: 19,
		slug: 'rabbana-zalamna-anfusana',
		title: 'Rabbanā ẓalamnā anfusanā',
		group: 'doa',
		count: 1,
		source: "QS. Al-A'rāf: 23",
		arabic: 'رَبَّنَا ظَلَمْنَا أَنْفُسَنَا وَإِنْ لَمْ تَغْفِرْ لَنَا وَتَرْحَمْنَا لَنَكُونَنَّ مِنَ الْخَاسِرِينَ',
		latin: 'Rabbanā ẓalamnā anfusanā wa in lam taghfir lanā wa tarḥamnā lanakūnannaminal khāsirīn',
		translation:
			'Wahai Tuhan kami, kami telah mendzalimi diri kami sendiri; apabila Engkau tidak mengampuni kami dan tidak merahmati kami, niscaya kami termasuk orang-orang yang merugi.'
	},
	{
		id: 20,
		slug: 'rabbana-atina',
		title: 'Rabbanā ātinā',
		group: 'doa',
		count: 1,
		source: 'QS. Al-Baqarah: 201',
		arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ',
		latin: "Rabbanā ātinā fid dunyā ḥasanatan wa fil ākhirati ḥasanatan wa qinā 'adzāban nār",
		translation:
			'Wahai Tuhan kami, berikanlah kepada kami kebaikan di dunia dan kebaikan di akhirat, serta jagalah kami dari siksa api neraka.'
	},
	{
		id: 21,
		slug: 'shalawat-penutup',
		title: 'Shalawat Penutup',
		group: 'doa',
		count: 1,
		arabic: 'وَصَلَّى اللهُ عَلَى مُحَمَّدٍ وَعَلَى آلِهِ وَصَحْبِهِ وَسَلَّمَ',
		latin: "Wa ṣallallāhu 'alā Muḥammadin wa 'alā ālihi wa ṣaḥbihi wa sallam",
		translation: 'Semoga shalawat dan salam Allah tercurahkan kepada Muhammad, kepada keluarganya, dan para sahabatnya.'
	},
	{
		id: 22,
		slug: 'hamdallah-penutup',
		title: 'Hamdallah Penutup',
		group: 'doa',
		count: 1,
		arabic: 'وَالْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ',
		latin: "Walḥamdulillāhi rabbil 'ālamīn",
		translation: 'Dan segala puji bagi Allah, Tuhan semesta alam.'
	}
];
