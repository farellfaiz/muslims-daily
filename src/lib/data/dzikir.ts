/**
 * Dzikir pagi dan petang.
 *
 * Aturan konten sama dengan kumpulan doa (lihat doa.ts dan docs/PRD.md bagian 7):
 * teks Arab diambil dari rujukan terbuka (bukan dari ingatan), setiap bacaan punya sumber,
 * terjemahan bacaan hadis dari Hisnul Muslim edisi Indonesia ("Kumpulan Do'a dari Al Qur'an & Sunnah",
 * alih bahasa H. Mahrus Ali, https://cdn.byenah.com/contents/8769/id-hisn-998.pdf, bab 27), dengan dua
 * salah ketik dibetulkan; lafaz petang memakai terjemahan pagi buku dengan kata waktunya disesuaikan
 * (buku hanya mencetak Arab versi sore); tahlil memakai terjemahan buku no. 72 tanpa frasa yang tidak
 * ada di lafaz ini. Terjemahan ayat (Ayat Kursi, tiga qul) dari Kemenag lewat data Al-Qur'an aplikasi.
 * Transliterasi disusun Muslims Daily.
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
		translation: "Allah, tidak ada tuhan selain Dia. Yang Mahahidup, Yang terus menerus mengurus (makhluk-Nya), tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang dihadapan mereka dan apa yang di belakang mereka, dan mereka tidak mengetahui sesuatu apa pun tentang ilmu-Nya melainkan apa yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi. Dan Dia tidak merasa berat memelihara keduanya, dan Dia Mahatinggi, Mahabesar."
	},
	// Al-Ikhlas, Al-Falaq, An-Nas dari https://api.alquran.cloud/v1/surah/{112,113,114}/quran-uthmani.
	// Satu kartu per surah; id 2 tetap untuk Al-Ikhlas supaya progres lama tidak bergeser.
	{
		id: 2,
		slug: 'al-ikhlas',
		title: 'Al-Ikhlas',
		count: 3,
		source: 'QS. Al-Ikhlas; HR. Abu Dawud no. 5082, Tirmidzi no. 3575',
		benefit: 'Al-Ikhlas, Al-Falaq, dan An-Nas dibaca masing-masing tiga kali pagi dan petang; ketiganya mencukupimu dari segala sesuatu.',
		verified: false,
		ref: 'https://api.alquran.cloud/v1/surah/112/quran-uthmani',
		arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿١﴾ ٱللَّهُ ٱلصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ﴿٤﴾',
		latin: "Bismillāhir-raḥmānir-raḥīm. Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.",
		translation: "Katakanlah (Muhammad), \"Dialah Allah, Yang Maha Esa. Allah tempat meminta segala sesuatu. (Allah) tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu yang setara dengan Dia.\""
	},
	{
		id: 20,
		slug: 'al-falaq',
		title: 'Al-Falaq',
		count: 3,
		source: 'QS. Al-Falaq; HR. Abu Dawud no. 5082, Tirmidzi no. 3575',
		verified: false,
		ref: 'https://api.alquran.cloud/v1/surah/113/quran-uthmani',
		arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾',
		latin: "Bismillāhir-raḥmānir-raḥīm. Qul a'ūdzu birabbil-falaq. Min syarri mā khalaq. Wa min syarri ghāsiqin idzā waqab. Wa min syarrin-naffātsāti fil-'uqad. Wa min syarri ḥāsidin idzā ḥasad.",
		translation: "Katakanlah, \"Aku berlindung kepada Tuhan yang menguasai subuh (fajar), dari kejahatan (makhluk yang) Dia ciptakan, dan dari kejahatan malam apabila telah gelap gulita, dan dari kejahatan (perempuan-perempuan) penyihir yang meniup pada buhul-buhul (talinya), dan dari kejahatan orang yang dengki apabila dia dengki.\""
	},
	{
		id: 21,
		slug: 'an-nas',
		title: 'An-Nas',
		count: 3,
		source: 'QS. An-Nas; HR. Abu Dawud no. 5082, Tirmidzi no. 3575',
		verified: false,
		ref: 'https://api.alquran.cloud/v1/surah/114/quran-uthmani',
		arabic: 'بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ﴿١﴾ مَلِكِ ٱلنَّاسِ ﴿٢﴾ إِلَٰهِ ٱلنَّاسِ ﴿٣﴾ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ﴿٤﴾ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ﴿٥﴾ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ﴿٦﴾',
		latin: "Bismillāhir-raḥmānir-raḥīm. Qul a'ūdzu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Alladzī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.",
		translation: "Katakanlah, \"Aku berlindung kepada Tuhannya manusia, Raja manusia, sembahan manusia, dari kejahatan (bisikan) setan yang bersembunyi, yang membisikkan (kejahatan) ke dalam dada manusia, dari (golongan) jin dan manusia.\""
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
		translation: "Kami telah memasuki waktu pagi, kerajaan milik Allah, segala puji bagi Allah. Tidak ada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian. Dia-lah yang Maha Kuasa atas segala sesuatu. Ya Tuhanku, aku mohon kepada-Mu kebaikan hari ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan hari ini dan kejahatan sesudahnya. Wahai Tuhan-ku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur.",
		petang: {
			arabic: 'أَمْسَيْنَا وَأَمْسَى الْمُلْكُ لِلَّهِ، وَالْحَمْدُ لِلَّهِ، لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ، رَبِّ أَسْأَلُكَ خَيْرَ مَا فِي هَذِهِ اللَّيْلَةِ وَخَيْرَ مَا بَعْدَهَا، وَأَعُوذُ بِكَ مِنْ شَرِّ مَا فِي هَذِهِ اللَّيْلَةِ وَشَرِّ مَا بَعْدَهَا، رَبِّ أَعُوذُ بِكَ مِنَ الْكَسَلِ وَسُوءِ الْكِبَرِ، رَبِّ أَعُوذُ بِكَ مِنْ عَذَابٍ فِي النَّارِ وَعَذَابٍ فِي الْقَبْرِ',
			latin: "Amsainā wa amsal-mulku lillāh, wal-ḥamdu lillāh, lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr, rabbi as'aluka khaira mā fī hādzihil-lailati wa khaira mā ba'dahā, wa a'ūdzu bika min syarri mā fī hādzihil-lailati wa syarri mā ba'dahā, rabbi a'ūdzu bika minal-kasali wa sū'il-kibar, rabbi a'ūdzu bika min 'adzābin fin-nāri wa 'adzābin fil-qabr.",
			translation: "Kami telah memasuki waktu sore, kerajaan milik Allah, segala puji bagi Allah. Tidak ada Tuhan yang berhak disembah selain Allah Yang Maha Esa, tiada sekutu bagi-Nya. Bagi-Nya kerajaan dan bagi-Nya pujian. Dia-lah yang Maha Kuasa atas segala sesuatu. Ya Tuhanku, aku mohon kepada-Mu kebaikan malam ini dan kebaikan sesudahnya. Aku berlindung kepada-Mu dari kejahatan malam ini dan kejahatan sesudahnya. Wahai Tuhan-ku, aku berlindung kepada-Mu dari kemalasan dan kejelekan di hari tua. Wahai Tuhanku, aku berlindung kepada-Mu dari siksaan di neraka dan siksaan di kubur."
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
		translation: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu sore. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu kebangkitan (bagi semua makhluk).",
		petang: {
			arabic: 'اللَّهُمَّ بِكَ أَمْسَيْنَا، وَبِكَ أَصْبَحْنَا، وَبِكَ نَحْيَى، وَبِكَ نَمُوتُ وَإِلَيْكَ الْمَصِيرُ',
			latin: 'Allāhumma bika amsainā, wa bika aṣbaḥnā, wa bika naḥyā, wa bika namūtu wa ilaikal-maṣīr.',
			translation: "Ya Allah, dengan rahmat dan pertolongan-Mu kami memasuki waktu sore, dan dengan rahmat dan pertolongan-Mu kami memasuki waktu pagi. Dengan rahmat dan pertolongan-Mu kami hidup dan dengan kehendak-Mu kami mati. Dan kepada-Mu tempat kembali (bagi semua makhluk)."
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
		translation: "Ya Allah, Engkau adalah Tuhanku, tiada Tuhan yang berhak disembah kecuali Engkau, Engkaulah yang menciptakan aku. Aku adalah hamba-Mu. Aku akan setia pada perjanjianku dengan-Mu semampuku. Aku berlindung kepada-Mu dari kejelekan yang aku perbuat. Aku mengakui nikmat-Mu kepadaku dan aku mengakui dosaku, oleh karena itu, ampunilah dosaku. Sesungguhnya tiada yang dapat mengampuni dosa kecuali Engkau."
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
		translation: "Ya Allah, sesungguhnya aku diwaktu pagi bersaksi kepada-Mu, malaikat yang memikul `Arasy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, sesungguhnya Engkau adalah Allah, tiada Tuhan yang berhak disembah kecuali Engkau Yang Maha Esa, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu.",
		petang: {
			arabic: 'اللَّهُمَّ إِنِّي أَمْسَيْتُ أُشْهِدُكَ، وَأُشْهِدُ حَمَلَةَ عَرْشِكَ، وَمَلاَئِكَتَكَ، وَجَمِيعَ خَلْقِكَ، أَنَّكَ أَنْتَ اللَّهُ لاَ إِلَهَ إِلاَّ أَنْتَ وَحْدَكَ لاَ شَرِيكَ لَكَ، وَأَنَّ مُحَمَّدًا عَبْدُكَ وَرَسُولُكَ',
			latin: "Allāhumma innī amsaitu usyhiduka, wa usyhidu ḥamalata 'arsyika, wa malā'ikataka, wa jamī'a khalqika, annaka antallāhu lā ilāha illā anta waḥdaka lā syarīka laka, wa anna muḥammadan 'abduka wa rasūluka.",
			translation: "Ya Allah, sesungguhnya aku diwaktu sore bersaksi kepada-Mu, malaikat yang memikul `Arasy-Mu, malaikat-malaikat dan seluruh makhluk-Mu, sesungguhnya Engkau adalah Allah, tiada Tuhan yang berhak disembah kecuali Engkau Yang Maha Esa, tiada sekutu bagi-Mu dan sesungguhnya Muhammad adalah hamba dan utusan-Mu."
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
		translation: "Ya Allah, nikmat yang kuterima atau diterima oleh seseorang diantara makhluk-Mu di pagi ini adalah dari-Mu. Maha Esa Engkau, tiada sekutu bagi-Mu. Bagi-Mu segala puji dan kepada-Mu panjatan syukur (dari seluruh makhluk-Mu).",
		petang: {
			arabic: 'اللَّهُمَّ مَا أَمْسَى بِي مِنْ نِعْمَةٍ أَوْ بِأَحَدٍ مِنْ خَلْقِكَ فَمِنْكَ وَحْدَكَ لاَ شَرِيكَ لَكَ، فَلَكَ الْحَمْدُ وَلَكَ الشُّكْرُ',
			latin: "Allāhumma mā amsā bī min ni'matin au bi'aḥadin min khalqika faminka waḥdaka lā syarīka laka, falakal-ḥamdu wa lakasy-syukru.",
			translation: "Ya Allah, nikmat yang kuterima atau diterima oleh seseorang diantara makhluk-Mu di sore ini adalah dari-Mu. Maha Esa Engkau, tiada sekutu bagi-Mu. Bagi-Mu segala puji dan kepada-Mu panjatan syukur (dari seluruh makhluk-Mu)."
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
		translation: "Ya Allah, selamatkan tubuh-ku (dari penyakit dan yang tidak aku inginkan). Ya Allah, selamatkan pendengaranku (dari penyakit dan maksiat atau sesuatu yang tidak aku inginkan). Ya Allah, selamatkan penglihatanku, tiada Tuhan (yang berhak disembah) kecuali Engkau. Ya Allah!, Sesungguhnya aku berlindung kepada-Mu dari kekufuran dan kefakiran. Aku berlindung kepada-Mu dari siksa kubur, tiada Tuhan (yang berhak disembah) kecuali Engkau."
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
		translation: "Ya Allah, sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan di dunia dan akhirat. Ya Allah sesungguhnya aku mohon kepada-Mu ampunan dan keselamatan: dalam agamaku, (kehidupan) duniaku, keluargaku, hartaku. Ya Allah tutuplah auratku (aib dan sesuatu yang tidak layak di lihat orang lain) dan berilah ketentraman di hatiku. Ya Allah, peliharalah aku dari arah depan, belakang, kanan, kiri dan atasku. Aku berlindung dengan kebesaran-Mu, agar aku tidak mendapat bahaya dari bawahku."
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
		translation: "Ya Allah, Yang Maha Mengetahui yang ghaib dan yang nyata. Wahai Tuhan Pencipta langit dan bumi, Tuhan segala sesuatu yang merajainya. Aku bersaksi bahwa tiada tuhan yang berhak disembah kecuali Engkau. Aku berlindung kepada-Mu dari kejahatan diriku, setan dan bala tentaranya, atau aku menjalankan kejelekan terhadap diriku atau mendorong orang Islam padanya."
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
		translation: "Dengan nama Allah yang bila disebut, segala sesuatu di bumi dan langit tidak akan berbahaya. Dialah Yang Maha Mengetahui."
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
		translation: "Aku rela Allah sebagai Tuhan-(ku), Islam sebagai agama-(ku) dan Muhammad ﷺ sebagai nabi-(ku)."
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
		translation: "Wahai Yang Maha Hidup dan Maha Terjaga, dengan rahmat-Mu aku minta pertolongan, perbaikilah segala urusanku dan jangan Engkau limpahkan (semua urusan) terhadap diriku walau sekejap mata."
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
		translation: "Diwaktu pagi kami memegang agama Islam, kalimat ikhlas, agama nabi kita, Muhammad ﷺ dan agama ayah kami, Ibrahim ‘alaihissalām, yang berdiri diatas jalan yang lurus, muslim dan tidak tergolong orang-orang musyrik.",
		petang: {
			arabic: 'أَمْسَيْنَا عَلَى فِطْرَةِ الْإِسْلاَمِ، وَعَلَى كَلِمَةِ الْإِخْلاَصِ، وَعَلَى دِينِ نَبِيِّنَا مُحَمَّدٍ صلى الله عليه وسلم، وَعَلَى مِلَّةِ أَبِينَا إِبْرَاهِيمَ، حَنِيفاً مُسْلِماً وَمَا كَانَ مِنَ الْمُشرِكِينَ',
			latin: "Amsainā 'alā fiṭratil-islām, wa 'alā kalimatil-ikhlāṣ, wa 'alā dīni nabiyyinā muḥammadin ṣallallāhu 'alaihi wa sallam, wa 'alā millati abīnā ibrāhīm, ḥanīfan musliman wa mā kāna minal-musyrikīn.",
			translation: "Diwaktu sore kami memegang agama Islam, kalimat ikhlas, agama nabi kita, Muhammad ﷺ dan agama ayah kami, Ibrahim ‘alaihissalām, yang berdiri diatas jalan yang lurus, muslim dan tidak tergolong orang-orang musyrik."
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
		translation: "Maha Suci Allah dan segala puji (bagi-Nya)."
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
		translation: "Tiada Tuhan yang berhak disembah selain Allah semata, tidak ada sekutu bagi-Nya, bagi-Nya kerajaan, bagi-Nya pujian, dan Dia berkuasa atas segala sesuatu."
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
		translation: "Maha Suci Allah, aku memuji-Nya sebanyak makhluk-Nya, sejauh kerelaan-Nya, seberat timbangan `Arasy-Nya dan sebanyak tinta tulisan kalimat-Nya."
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
		translation: "Aku berlindung dengan kalimat-kalimat Allah yang sempurna dari kejahatan apa yang Dia ciptakan."
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
		translation: "Cukup bagiku Allah (sebagai pelindung), tiada Tuhan (yang berhak disembah) kecuali Dia. Kepada-Nya aku bertawakkal dan Dia adalah Tuhan `Arasy yang Agung."
	}
];
