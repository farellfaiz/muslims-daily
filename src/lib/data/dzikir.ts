/**
 * Dzikir pagi dan petang.
 *
 * Aturan konten sama dengan kumpulan doa (lihat doa.ts dan docs/PRD.md bagian 7):
 * teks Arab diambil dari rujukan terbuka (bukan dari ingatan), setiap bacaan punya sumber,
 * bacaan yang hadisnya dinilai lemah diberi `warn: true` dan keterangan jujur,
 * dan `verified` baru boleh true setelah dicek orang yang paham.
 */

export type DzikirTime = 'pagi' | 'petang';

export interface DzikirText {
	arabic: string;
	latin: string;
	translation: string;
}

export interface Dzikir extends DzikirText {
	id: number;
	slug: string;
	title: string;
	/** hanya dibaca di salah satu waktu; kosong = pagi dan petang */
	only?: DzikirTime;
	/** jumlah bacaan */
	count: number;
	/** lafaz khusus petang bila berbeda dari pagi (mis. aṣbaḥnā menjadi amsainā) */
	petang?: DzikirText;
	/** perawi dan nomor, mis. "HR. Muslim no. 2723" atau "QS. Al-Baqarah: 255" */
	source: string;
	/** keutamaan singkat menurut hadis sumbernya */
	benefit?: string;
	note?: string;
	/** sanad dinilai lemah atau ada catatan penting */
	warn?: boolean;
	verified: boolean;
	/** URL rujukan tempat teks Arab diambil */
	ref: string;
}

export const DZIKIR: Dzikir[] = [
	{
		id: 1,
		slug: 'ayat-kursi',
		title: 'Ayat Kursi',
		count: 1,
		source: 'QS. Al-Baqarah: 255',
		note: "Dibaca setelah ta'awudz (a'ūdzu billāhi minasy-syaiṭānir-rajīm).",
		verified: false,
		ref: 'https://api.alquran.cloud/v1/ayah/2:255/quran-uthmani',
		arabic: 'ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ',
		latin: "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudzuhū sinatun wa lā naum, lahū mā fis-samāwāti wa mā fil-arḍ, man dzal-ladzī yasyfa'u 'indahū illā bi'idznih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'in min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm.",
		translation: 'Allah, tidak ada tuhan selain Dia, Yang Mahahidup lagi terus-menerus mengurus makhluk-Nya. Dia tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, sedangkan mereka tidak mengetahui sedikit pun dari ilmu-Nya kecuali yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat menjaga keduanya. Dialah Yang Mahatinggi lagi Mahaagung.'
	},
	// Al-Falaq dan An-Nas dari https://api.alquran.cloud/v1/surah/113/quran-uthmani dan .../114/quran-uthmani
	{
		id: 2,
		slug: 'tiga-surah',
		title: 'Tiga surah perlindungan',
		count: 3,
		source: 'QS. Al-Ikhlas, Al-Falaq, An-Nas; HR. Abu Dawud no. 5082, Tirmidzi no. 3575',
		benefit: 'Dibaca tiga kali pagi dan petang, ketiganya mencukupimu dari segala sesuatu.',
		verified: false,
		ref: 'https://api.alquran.cloud/v1/surah/112/quran-uthmani',
		arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿١﴾ ٱللَّهُ ٱلصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ﴿٤﴾\nبِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾\nبِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ﴿١﴾ مَلِكِ ٱلنَّاسِ ﴿٢﴾ إِلَٰهِ ٱلنَّاسِ ﴿٣﴾ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ﴿٤﴾ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ﴿٥﴾ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ﴿٦﴾',
		latin: "Bismillāhir-raḥmānir-raḥīm. Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.\nBismillāhir-raḥmānir-raḥīm. Qul a'ūdzu birabbil-falaq. Min syarri mā khalaq. Wa min syarri ghāsiqin idzā waqab. Wa min syarrin-naffātsāti fil-'uqad. Wa min syarri ḥāsidin idzā ḥasad.\nBismillāhir-raḥmānir-raḥīm. Qul a'ūdzu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Alladzī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.",
		translation: 'Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, Dialah Allah Yang Maha Esa. Allah tempat bergantung segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu pun yang setara dengan Dia.\nDengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk yang Dia ciptakan, dari kejahatan malam apabila telah gelap gulita, dari kejahatan para peniup pada buhul-buhul (penyihir), dan dari kejahatan orang yang dengki apabila ia mendengki.\nDengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, aku berlindung kepada Tuhan manusia, Raja manusia, sembahan manusia, dari kejahatan pembisik yang bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.'
	},
	// lafaz petang dari HR. Muslim no. 2723 (https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim/6908.json), koma ditambahkan
	{
		id: 3,
		slug: 'ashbahna-al-mulk',
		title: 'Kami memasuki pagi, kerajaan milik Allah',
		count: 1,
		source: 'HR. Muslim no. 2723',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'أَصْبَحْنَا وَأَصْبَحَ الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذَا الْيَوْمِ وَخَيرَ مَا بَعْدَهُ، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذَا الْيَوْمِ وَشَرِّ مَا بَعْدَهُ، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
		latin: "Aṣbaḥnā wa aṣbaḥal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr, rabbi as'aluka khaira mā fī hādzal-yaumi wa khaira mā ba'dah, wa a'ūdzu bika min syarri mā fī hādzal-yaumi wa syarri mā ba'dah, rabbi a'ūdzu bika minal-kasali wa sū'il-kibar, rabbi a'ūdzu bika min 'adzābin fin-nāri wa 'adzābin fil-qabr.",
		translation: 'Kami memasuki waktu pagi dan kerajaan pun milik Allah. Segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu. Wahai Tuhanku, aku memohon kepada-Mu kebaikan hari ini dan kebaikan sesudahnya, dan aku berlindung kepada-Mu dari keburukan hari ini dan keburukan sesudahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan keburukan masa tua. Wahai Tuhanku, aku berlindung kepada-Mu dari azab di neraka dan azab di kubur.',
		petang: {
			arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
			latin: "Amsainā wa amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr, rabbi as'aluka khaira mā fī hādzihil-lailati wa khaira mā ba'dahā, wa a'ūdzu bika min syarri mā fī hādzihil-lailati wa syarri mā ba'dahā, rabbi a'ūdzu bika minal-kasali wa sū'il-kibar, rabbi a'ūdzu bika min 'adzābin fin-nāri wa 'adzābin fil-qabr.",
			translation: 'Kami memasuki waktu petang dan kerajaan pun milik Allah. Segala puji bagi Allah. Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu. Wahai Tuhanku, aku memohon kepada-Mu kebaikan malam ini dan kebaikan sesudahnya, dan aku berlindung kepada-Mu dari keburukan malam ini dan keburukan sesudahnya. Wahai Tuhanku, aku berlindung kepada-Mu dari kemalasan dan keburukan masa tua. Wahai Tuhanku, aku berlindung kepada-Mu dari azab di neraka dan azab di kubur.'
		}
	},
	// lafaz petang dari HR. Ibnu Majah no. 3868 (https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-ibnmajah/3868.json), ejaan نَحْيَى sesuai sumber
	{
		id: 4,
		slug: 'bika-ashbahna',
		title: 'Dengan-Mu kami memasuki pagi',
		count: 1,
		source: 'HR. Abu Dawud no. 5068, Tirmidzi no. 3391, Ibnu Majah no. 3868',
		note: 'Riwayat-riwayat berbeda pada penutupnya (an-nusyūr atau al-maṣīr). Di sini mengikuti susunan Hisnul Muslim: pagi ditutup an-nusyūr, petang ditutup al-maṣīr.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'اللَّهُمَّ بِكَ أَصْبَحْنَا، وَبِكَ أَمْسَيْنَا، وَبِكَ نَحْيَا، وَبِكَ نَمُوتُ وَإِلَيْكَ النُّشُورُ',
		latin: 'Allāhumma bika aṣbaḥnā, wa bika amsainā, wa bika naḥyā, wa bika namūtu wa ilaikan-nusyūr.',
		translation: 'Ya Allah, dengan-Mu kami memasuki waktu pagi dan dengan-Mu kami memasuki waktu petang. Dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu kami dibangkitkan.',
		petang: {
			arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَى، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
			latin: 'Allāhumma bika amsainā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu wa ilaikal-maṣīr.',
			translation: 'Ya Allah, dengan-Mu kami memasuki waktu petang dan dengan-Mu kami memasuki waktu pagi. Dengan-Mu kami hidup, dengan-Mu kami mati, dan kepada-Mu tempat kembali.'
		}
	},
	{
		id: 5,
		slug: 'sayyidul-istighfar',
		title: 'Sayyidul istighfar',
		count: 1,
		source: 'HR. Bukhari no. 6306',
		benefit: 'Siapa membacanya dengan yakin di siang hari lalu wafat sebelum petang, atau di malam hari lalu wafat sebelum pagi, ia termasuk penghuni surga.',
		verified: false,
		ref: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/6306.json',
		arabic: 'اللَّهُمَّ أَنْتَ رَبِّي، لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَىَّ وَأَبُوءُ لَكَ بِذَنْبِي، فَاغْفِرْ لِي، فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ',
		latin: "Allāhumma anta rabbī, lā ilāha illā anta, khalaqtanī wa ana 'abduka, wa ana 'alā 'ahdika wa wa'dika mastaṭa'tu, a'ūdzu bika min syarri mā ṣana'tu, abū'u laka bini'matika 'alayya wa abū'u laka bidzanbī, faghfir lī, fa innahū lā yaghfirudz-dzunūba illā anta.",
		translation: 'Ya Allah, Engkau Tuhanku, tiada tuhan selain Engkau. Engkau menciptakanku dan aku hamba-Mu. Aku berada di atas perjanjian dan janji-Mu semampuku. Aku berlindung kepada-Mu dari keburukan perbuatanku. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku kepada-Mu, maka ampunilah aku. Sungguh tiada yang mengampuni dosa selain Engkau.'
	},
	// lafaz petang: أَصْبَحْتُ diganti أَمْسَيْتُ sesuai keterangan Hisnul Muslim; bentuk berharakat dari HR. Abu Dawud no. 5067
	{
		id: 6,
		slug: 'usyhiduka',
		title: 'Mempersaksikan Allah dan para malaikat',
		count: 4,
		source: 'HR. Abu Dawud no. 5069 dan 5078',
		benefit: 'Siapa membacanya empat kali, Allah membebaskannya dari neraka.',
		note: "Sanadnya diperselisihkan: Al-Albani menilainya lemah (daif), sedangkan Zubair Ali Zai menilainya hasan, begitu pula Syu'aib Al-Arna'uth untuk riwayat no. 5078. Dimuat karena tercantum dalam Hisnul Muslim.",
		warn: true,
		verified: false,
		ref: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-abudawud/5078.json',
		arabic: 'اللَّهُمَّ إِنِّي أَصْبَحْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
		latin: "Allāhumma innī aṣbaḥtu usyhiduka, wa usyhidu ḥamalata 'arsyika, wa malā'ikataka, wa jamī'a khalqika, annaka antallāhu lā ilāha illā anta waḥdaka lā syarīka laka, wa anna muḥammadan 'abduka wa rasūluka.",
		translation: "Ya Allah, sungguh di pagi ini aku mempersaksikan Engkau, para pemikul 'Arsy-Mu, para malaikat-Mu, dan seluruh makhluk-Mu, bahwa Engkaulah Allah, tiada tuhan selain Engkau semata, tiada sekutu bagi-Mu, dan bahwa Muhammad adalah hamba dan utusan-Mu.",
		petang: {
			arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
			latin: "Allāhumma innī amsaitu usyhiduka, wa usyhidu ḥamalata 'arsyika, wa malā'ikataka, wa jamī'a khalqika, annaka antallāhu lā ilāha illā anta waḥdaka lā syarīka laka, wa anna muḥammadan 'abduka wa rasūluka.",
			translation: "Ya Allah, sungguh di petang ini aku mempersaksikan Engkau, para pemikul 'Arsy-Mu, para malaikat-Mu, dan seluruh makhluk-Mu, bahwa Engkaulah Allah, tiada tuhan selain Engkau semata, tiada sekutu bagi-Mu, dan bahwa Muhammad adalah hamba dan utusan-Mu."
		}
	},
	// lafaz petang: أَصْبَحَ diganti أَمْسَى sesuai keterangan Hisnul Muslim; bentuk berharakat dari HR. Muslim no. 2723
	{
		id: 7,
		slug: 'ma-ashbaha-bi',
		title: 'Semua nikmat dari Allah',
		count: 1,
		source: 'HR. Abu Dawud no. 5073',
		benefit: 'Siapa membacanya di pagi hari telah menunaikan syukur harinya, dan siapa membacanya di petang hari telah menunaikan syukur malamnya.',
		note: "Dinilai lemah (daif) oleh Al-Albani, Syu'aib Al-Arna'uth, dan Zubair Ali Zai. Tambahan \"atau pada salah seorang makhluk-Mu\" tidak ada dalam lafaz Abu Dawud; lafaz di sini mengikuti Hisnul Muslim.",
		warn: true,
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'اللَّهُمَّ مَا أَصْبَحَ بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
		latin: "Allāhumma mā aṣbaḥa bī min ni'matin au bi'aḥadin min khalqika faminka waḥdaka lā syarīka laka, falakal-ḥamdu wa lakasy-syukru.",
		translation: 'Ya Allah, nikmat apa pun yang ada padaku atau pada salah seorang makhluk-Mu di pagi ini, semuanya dari-Mu semata, tiada sekutu bagi-Mu. Maka bagi-Mu segala puji dan bagi-Mu segala syukur.',
		petang: {
			arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
			latin: "Allāhumma mā amsā bī min ni'matin au bi'aḥadin min khalqika faminka waḥdaka lā syarīka laka, falakal-ḥamdu wa lakasy-syukru.",
			translation: 'Ya Allah, nikmat apa pun yang ada padaku atau pada salah seorang makhluk-Mu di petang ini, semuanya dari-Mu semata, tiada sekutu bagi-Mu. Maka bagi-Mu segala puji dan bagi-Mu segala syukur.'
		}
	},
	{
		id: 8,
		slug: 'afini-fi-badani',
		title: 'Memohon kesehatan badan, pendengaran, penglihatan',
		count: 3,
		source: 'HR. Abu Dawud no. 5090',
		note: 'Sanadnya dinilai hasan oleh Al-Albani, sedangkan Zubair Ali Zai menilainya lemah.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'اللَّهُمَّ عَافِنِي فِي بَدَنِي، اللَّهُمَّ عَافِنِي فِي سَمْعِي، اللَّهُمَّ عَافِنِي فِي بَصَرِي، لاَ إِلَهَ إِلاَّ أَنْتَ. اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْكُفْرِ، وَالفَقْرِ، وَأَعُوذُ بِكَ مِنْ عَذَابِ القَبْرِ، لاَ إِلَهَ إِلاَّ أَنْتَ',
		latin: "Allāhumma 'āfinī fī badanī, allāhumma 'āfinī fī sam'ī, allāhumma 'āfinī fī baṣarī, lā ilāha illā anta. Allāhumma innī a'ūdzu bika minal-kufri wal-faqr, wa a'ūdzu bika min 'adzābil-qabr, lā ilāha illā anta.",
		translation: 'Ya Allah, sehatkanlah badanku. Ya Allah, sehatkanlah pendengaranku. Ya Allah, sehatkanlah penglihatanku. Tiada tuhan selain Engkau. Ya Allah, aku berlindung kepada-Mu dari kekufuran dan kefakiran, dan aku berlindung kepada-Mu dari azab kubur. Tiada tuhan selain Engkau.'
	},
	{
		id: 9,
		slug: 'al-afwa-wal-afiyah',
		title: 'Memohon ampunan dan keselamatan',
		count: 1,
		source: 'HR. Abu Dawud no. 5074, Ibnu Majah no. 3871',
		note: "Menurut Waki' (salah satu perawinya), dicelakakan dari bawah maksudnya ditelan bumi.",
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي الدُّنْيَا وَالآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي، وَمَالِي، اللَّهُمَّ اسْتُرْ عَوْرَاتِي، وَآمِنْ رَوْعَاتِي، اللَّهُمَّ احْفَظْنِي مِنْ بَينِ يَدَيَّ، وَمِنْ خَلْفِي، وَعَنْ يَمِينِي، وَعَنْ شِمَالِي، وَمِنْ فَوْقِي، وَأَعُوذُ بِعَظَمَتِكَ أَنْ أُغْتَالَ مِنْ تَحْتِي',
		latin: "Allāhumma innī as'alukal-'afwa wal-'āfiyata fid-dunyā wal-ākhirah, allāhumma innī as'alukal-'afwa wal-'āfiyata fī dīnī wa dunyāya wa ahlī wa mālī, allāhummastur 'aurātī, wa āmin rau'ātī, allāhummaḥfaẓnī min baini yadayya, wa min khalfī, wa 'an yamīnī, wa 'an syimālī, wa min fauqī, wa a'ūdzu bi'aẓamatika an ughtāla min taḥtī.",
		translation: 'Ya Allah, aku memohon kepada-Mu ampunan dan keselamatan di dunia dan akhirat. Ya Allah, aku memohon kepada-Mu ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku. Ya Allah, tutupilah aib-aibku dan tenteramkanlah rasa takutku. Ya Allah, jagalah aku dari depan, dari belakang, dari kanan, dari kiri, dan dari atasku. Aku berlindung dengan keagungan-Mu agar tidak dicelakakan dari arah bawahku.'
	},
	{
		id: 10,
		slug: 'alimal-ghaib',
		title: 'Berlindung dari keburukan diri dan setan',
		count: 1,
		source: 'HR. Tirmidzi no. 3392 dan 3529, Abu Dawud no. 5067',
		note: 'Dalam hadis juga diperintahkan dibaca menjelang tidur. Kata وَشَرَكِهِ (syarakihī, jeratnya) juga diriwayatkan وَشِرْكِهِ (syirkihī, ajakannya kepada syirik). Bagian akhir (wa an aqtarifa ...) ada dalam riwayat Tirmidzi no. 3529.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'اللَّهُمَّ عَالِمَ الغَيْبِ وَالشَّهَادَةِ فَاطِرَ السَّمَوَاتِ وَالْأَرْضِ، رَبَّ كُلِّ شَيْءٍ وَمَلِيكَهُ، أَشْهَدُ أَنْ لاَ إِلَهَ إِلاَّ أَنْتَ، أَعُوذُ بِكَ مِنْ شَرِّ نَفْسِي، وَمِنْ شَرِّ الشَّيْطانِ وَشَرَكِهِ، وَأَنْ أَقْتَرِفَ عَلَى نَفْسِي سُوءاً، أَوْ أَجُرَّهُ إِلَى مُسْلِمٍ',
		latin: "Allāhumma 'ālimal-ghaibi wasy-syahādati fāṭiras-samāwāti wal-arḍ, rabba kulli syai'in wa malīkah, asyhadu an lā ilāha illā anta, a'ūdzu bika min syarri nafsī, wa min syarrisy-syaiṭāni wa syarakih, wa an aqtarifa 'alā nafsī sū'an, au ajurrahū ilā muslim.",
		translation: 'Ya Allah, Yang Mengetahui yang gaib dan yang nyata, Pencipta langit dan bumi, Tuhan dan Penguasa segala sesuatu. Aku bersaksi bahwa tiada tuhan selain Engkau. Aku berlindung kepada-Mu dari keburukan diriku, dari keburukan setan dan jeratnya, dan dari berbuat keburukan terhadap diriku sendiri atau menimpakannya kepada seorang muslim.'
	},
	{
		id: 11,
		slug: 'bismillah-la-yadhurru',
		title: 'Dengan nama Allah yang tak ada bahaya bersama nama-Nya',
		count: 3,
		source: 'HR. Abu Dawud no. 5088, Tirmidzi no. 3388',
		benefit: 'Siapa membacanya tiga kali di petang hari tidak akan ditimpa musibah mendadak sampai pagi, dan bila dibaca di pagi hari tidak ditimpa musibah mendadak sampai petang.',
		verified: false,
		ref: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-abudawud/5088.json',
		arabic: 'بِسْمِ اللَّهِ الَّذِي لاَ يَضُرُّ مَعَ اسْمِهِ شَىْءٌ فِي الأَرْضِ وَلاَ فِي السَّمَاءِ وَهُوَ السَّمِيعُ الْعَلِيمُ',
		latin: "Bismillāhil-ladzī lā yaḍurru ma'asmihī syai'un fil-arḍi wa lā fis-samā'i wa huwas-samī'ul-'alīm.",
		translation: 'Dengan nama Allah yang bersama nama-Nya tidak ada sesuatu pun di bumi maupun di langit yang dapat membahayakan. Dialah Yang Maha Mendengar lagi Maha Mengetahui.'
	},
	{
		id: 12,
		slug: 'radhitu-billah',
		title: 'Rida kepada Allah, Islam, dan Nabi Muhammad',
		count: 3,
		source: 'HR. Tirmidzi no. 3389, Abu Dawud no. 5072, Ibnu Majah no. 3870',
		benefit: 'Allah pasti akan membuatnya rida pada hari kiamat.',
		note: "Dinilai lemah (daif) oleh Al-Albani dan Ahmad Syakir, dinilai hasan oleh Basyar 'Awwad Ma'ruf dan Zubair Ali Zai. Lafaz Abu Dawud berbentuk jamak (raḍīnā) dan memakai rasūlan. Hitungan tiga kali mengikuti Hisnul Muslim.",
		warn: true,
		verified: false,
		ref: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-ibnmajah/3870.json',
		arabic: 'رَضِيتُ بِاللَّهِ رَبًّا، وَبِالإِسْلاَمِ دِينًا، وَبِمُحَمَّدٍ نَبِيًّا',
		latin: 'Raḍītu billāhi rabban, wa bil-islāmi dīnan, wa bimuḥammadin nabiyyā.',
		translation: 'Aku rida Allah sebagai Tuhanku, Islam sebagai agamaku, dan Muhammad sebagai nabiku.'
	},
	{
		id: 13,
		slug: 'ya-hayyu-ya-qayyum',
		title: 'Wahai Yang Mahahidup, Yang terus mengurus',
		count: 1,
		source: "HR. An-Nasa'i (As-Sunan Al-Kubra) dan Al-Hakim",
		note: 'Al-Hakim menilainya sahih, Al-Albani menilai sanadnya hasan.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'يَا حَيُّ يَا قَيُّومُ بِرَحْمَتِكَ أَسْتَغيثُ أَصْلِحْ لِي شَأْنِيَ كُلَّهُ وَلاَ تَكِلْنِي إِلَى نَفْسِي طَرْفَةَ عَيْنٍ',
		latin: "Yā ḥayyu yā qayyūmu biraḥmatika astaghīts, aṣliḥ lī sya'niya kullahū wa lā takilnī ilā nafsī ṭarfata 'ain.",
		translation: 'Wahai Yang Mahahidup, wahai Yang terus-menerus mengurus makhluk-Nya, dengan rahmat-Mu aku memohon pertolongan. Perbaikilah seluruh urusanku dan jangan Engkau serahkan aku kepada diriku sendiri walau sekejap mata.'
	},
	// lafaz petang: أَصْبَحْنا diganti أَمْسَيْنَا sesuai keterangan Hisnul Muslim; bentuk berharakat dari HR. Muslim no. 2723
	{
		id: 14,
		slug: 'fitratil-islam',
		title: 'Di atas fitrah Islam',
		count: 1,
		source: 'HR. Ahmad',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'أَصْبَحْنا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشرِكِينَ',
		latin: "Aṣbaḥnā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā ibrāhīm, ḥanīfan musliman wa mā kāna minal-musyrikīn.",
		translation: "Di pagi ini kami berada di atas fitrah Islam, di atas kalimat ikhlas, di atas agama nabi kami Muhammad shallallahu 'alaihi wa sallam, dan di atas millah bapak kami Ibrahim yang lurus lagi berserah diri, dan dia bukan termasuk orang-orang musyrik.",
		petang: {
			arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشرِكِينَ',
			latin: "Amsainā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā ibrāhīm, ḥanīfan musliman wa mā kāna minal-musyrikīn.",
			translation: "Di petang ini kami berada di atas fitrah Islam, di atas kalimat ikhlas, di atas agama nabi kami Muhammad shallallahu 'alaihi wa sallam, dan di atas millah bapak kami Ibrahim yang lurus lagi berserah diri, dan dia bukan termasuk orang-orang musyrik."
		}
	},
	{
		id: 15,
		slug: 'subhanallah-100',
		title: 'Tasbih seratus kali',
		count: 100,
		source: 'HR. Muslim no. 2692',
		benefit: 'Tidak ada yang datang pada hari kiamat membawa amalan yang lebih utama, kecuali orang yang membaca seperti itu atau lebih banyak.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
		latin: 'Subḥānallāhi wa biḥamdih.',
		translation: 'Mahasuci Allah dan aku memuji-Nya.'
	},
	{
		id: 16,
		slug: 'tahlil-10',
		title: 'Tahlil sepuluh kali',
		count: 10,
		source: 'HR. Abu Dawud no. 5077, Ibnu Majah no. 3867',
		benefit: 'Dibaca sekali di pagi hari pun pahalanya seperti memerdekakan seorang budak keturunan Ismail, ditulis sepuluh kebaikan, dihapus sepuluh keburukan, diangkat sepuluh derajat, dan terjaga dari setan sampai petang.',
		note: 'Hisnul Muslim menyebut sepuluh kali, atau sekali bila sedang malas. Ada juga keutamaan membacanya seratus kali dalam sehari (HR. Bukhari no. 3293).',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ، وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ',
		latin: "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu, wa huwa 'alā kulli syai'in qadīr.",
		translation: 'Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu.'
	},
	{
		id: 17,
		slug: 'adada-khalqihi',
		title: 'Tasbih sebanyak makhluk-Nya',
		only: 'pagi',
		count: 3,
		source: 'HR. Muslim no. 2726',
		benefit: 'Empat kalimat ini, dibaca tiga kali, lebih berat timbangannya daripada dzikir yang dibaca sejak subuh hingga duha.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ، عَدَدَ خَلْقِهِ، وَرِضَا نَفْسِهِ، وَزِنَةَ عَرْشِهِ، وَمِدَادَ كَلِمَاتِهِ',
		latin: "Subḥānallāhi wa biḥamdih, 'adada khalqih, wa riḍā nafsih, wa zinata 'arsyih, wa midāda kalimātih.",
		translation: "Mahasuci Allah dan aku memuji-Nya, sebanyak jumlah makhluk-Nya, sesuai rida-Nya, seberat 'Arsy-Nya, dan sebanyak tinta kalimat-Nya."
	},
	{
		id: 18,
		slug: 'kalimatillah-tammat',
		title: 'Berlindung dengan kalimat Allah yang sempurna',
		only: 'petang',
		count: 3,
		source: 'HR. Muslim no. 2709, Tirmidzi no. 3604',
		benefit: 'Siapa membacanya tiga kali di petang hari tidak akan dicelakakan sengatan binatang berbisa pada malam itu.',
		verified: false,
		ref: 'https://www.hisnmuslim.com/api/ar/27.json',
		arabic: 'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّاتِ مِنْ شَرِّ مَا خَلَقَ',
		latin: "A'ūdzu bikalimātillāhit-tāmmāti min syarri mā khalaq.",
		translation: 'Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari keburukan makhluk yang Dia ciptakan.'
	},
	{
		id: 19,
		slug: 'hasbiyallah',
		title: 'Cukuplah Allah bagiku',
		count: 7,
		source: 'HR. Abu Dawud no. 5081 (mauquf pada Abu Darda)',
		benefit: 'Menurut atsar ini, Allah akan mencukupi apa yang ia risaukan.',
		note: "Dalam riwayat Abu Dawud ini adalah perkataan Abu Darda (mauquf), bukan sabda Nabi. Penilaiannya berbeda jauh: Al-Albani menilainya palsu (maudu'), sedangkan Zubair Ali Zai menilai sanadnya hasan.",
		warn: true,
		verified: false,
		ref: 'https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-abudawud/5081.json',
		arabic: 'حَسْبِيَ اللَّهُ لاَ إِلَهَ إِلاَّ هُوَ عَلَيْهِ تَوَكَّلْتُ وَهُوَ رَبُّ الْعَرْشِ الْعَظِيمِ',
		latin: "Ḥasbiyallāhu lā ilāha illā huwa, 'alaihi tawakkaltu, wa huwa rabbul-'arsyil-'aẓīm.",
		translation: "Cukuplah Allah bagiku, tiada tuhan selain Dia. Kepada-Nya aku bertawakal, dan Dia adalah Tuhan pemilik 'Arsy yang agung."
	}
];

/** Bacaan untuk satu waktu, dengan lafaz yang sudah disesuaikan. */
export function forTime(time: DzikirTime): (Dzikir & { text: DzikirText })[] {
	return DZIKIR.filter((d) => !d.only || d.only === time).map((d) => ({
		...d,
		text: time === 'petang' && d.petang ? d.petang : { arabic: d.arabic, latin: d.latin, translation: d.translation }
	}));
}
