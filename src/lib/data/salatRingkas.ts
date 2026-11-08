/**
 * Dzikir setelah salat, versi ringkas: dzikir yang sahih dari hadis, mengikuti bab
 * "dzikir setelah salam" dalam Hisnul Muslim (Sa'id bin Ali Al-Qahthani), tanpa bacaan
 * khusus Subuh atau Maghrib.
 *
 * Berkas ini DIBUAT OTOMATIS oleh scripts/salat-ringkas.mjs: teks Arab dipotong dari teks hadis (fawazahmed0/hadith-api,
 * lihat `ref`) dan dari teks Al-Qur'an di dzikir.ts. Jangan menyunting teks Arab di sini secara manual.
 * Latin dan terjemahan disusun dan masih perlu dicek orang yang paham (verified: false).
 */
import type { SalatItem } from './salat.ts';

export const SALAT_RINGKAS: SalatItem[] = [
	{
		"id": 101,
		"slug": "istighfar",
		"title": "Istighfar",
		"group": "dzikir",
		"count": 3,
		"source": "HR. Muslim no. 591",
		"note": "Al-Auza'i (perawi hadis) menjelaskan cara istighfarnya: mengucapkan \"astaghfirullāh\".",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim/1334.json",
		"arabic": "أَسْتَغْفِرُ اللَّهَ",
		"latin": "Astaghfirullāh.",
		"translation": "Aku memohon ampun kepada Allah.",
		"verified": false
	},
	{
		"id": 102,
		"slug": "antas-salam",
		"title": "Allāhumma antas-salām",
		"group": "dzikir",
		"count": 1,
		"source": "HR. Muslim no. 591",
		"note": "Dalam riwayat lain (HR. Muslim no. 592) dengan tambahan \"yā\": tabārakta yā dzal-jalāli wal-ikrām.",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim/1334.json",
		"arabic": "اللَّهُمَّ أَنْتَ السَّلاَمُ وَمِنْكَ السَّلاَمُ تَبَارَكْتَ ذَا الْجَلاَلِ وَالإِكْرَامِ",
		"latin": "Allāhumma antas-salām wa minkas-salām, tabārakta dzal-jalāli wal-ikrām.",
		"translation": "Ya Allah, Engkaulah As-Salām (Yang Maha Sejahtera), dan dari-Mu keselamatan. Mahaberkah Engkau, wahai Pemilik keagungan dan kemuliaan.",
		"verified": false
	},
	{
		"id": 103,
		"slug": "la-mania",
		"title": "Tidak ada yang dapat menghalangi pemberian-Mu",
		"group": "dzikir",
		"count": 1,
		"source": "HR. Bukhari no. 844, Muslim no. 593",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim/1338.json",
		"arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ اللَّهُمَّ لاَ مَانِعَ لِمَا أَعْطَيْتَ وَلاَ مُعْطِيَ لِمَا مَنَعْتَ وَلاَ يَنْفَعُ ذَا الْجَدِّ مِنْكَ الْجَدُّ",
		"latin": "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr. Allāhumma lā māni'a limā a'ṭaita wa lā mu'ṭiya limā mana'ta wa lā yanfa'u dzal-jaddi minkal-jadd.",
		"translation": "Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu. Ya Allah, tidak ada yang dapat menghalangi apa yang Engkau berikan, tidak ada yang dapat memberi apa yang Engkau tahan, dan kekayaan orang yang kaya tidak bermanfaat baginya di hadapan-Mu.",
		"verified": false
	},
	{
		"id": 104,
		"slug": "tasbih",
		"title": "Tasbih",
		"group": "dzikir",
		"count": 33,
		"source": "HR. Bukhari no. 843, Muslim no. 597",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/843.json",
		"arabic": "سُبْحَانَ اللَّهِ",
		"latin": "Subḥānallāh.",
		"translation": "Mahasuci Allah.",
		"verified": false
	},
	{
		"id": 105,
		"slug": "tahmid",
		"title": "Tahmid",
		"group": "dzikir",
		"count": 33,
		"source": "HR. Bukhari no. 843, Muslim no. 597",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/843.json",
		"arabic": "الْحَمْدُ لِلَّهِ",
		"latin": "Alḥamdulillāh.",
		"translation": "Segala puji bagi Allah.",
		"verified": false
	},
	{
		"id": 106,
		"slug": "takbir",
		"title": "Takbir",
		"group": "dzikir",
		"count": 33,
		"source": "HR. Bukhari no. 843, Muslim no. 597",
		"note": "Ada juga riwayat takbir 34 kali (HR. Muslim no. 596) tanpa tahlil penutup.",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-bukhari/843.json",
		"arabic": "اللَّهُ أَكْبَرُ",
		"latin": "Allāhu akbar.",
		"translation": "Allah Mahabesar.",
		"verified": false
	},
	{
		"id": 107,
		"slug": "tamam-al-miah",
		"title": "Penutup seratus",
		"group": "dzikir",
		"count": 1,
		"source": "HR. Muslim no. 597",
		"benefit": "Siapa membaca tasbih, tahmid, dan takbir 33 kali lalu menutupnya dengan ini, diampuni kesalahannya walau sebanyak buih di lautan.",
		"ref": "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions/ara-muslim/1352.json",
		"arabic": "لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَىْءٍ قَدِيرٌ",
		"latin": "Lā ilāha illallāhu waḥdahū lā syarīka lah, lahul-mulku wa lahul-ḥamdu wa huwa 'alā kulli syai'in qadīr.",
		"translation": "Tiada tuhan selain Allah semata, tiada sekutu bagi-Nya. Milik-Nya kerajaan dan milik-Nya segala puji, dan Dia Mahakuasa atas segala sesuatu.",
		"verified": false
	},
	{
		"title": "Ayat Kursi",
		"ref": "https://api.alquran.cloud/v1/ayah/2:255/quran-uthmani",
		"arabic": "ٱللَّهُ لَآ إِلَٰهَ إِلَّا هُوَ ٱلْحَىُّ ٱلْقَيُّومُ ۚ لَا تَأْخُذُهُۥ سِنَةٌۭ وَلَا نَوْمٌۭ ۚ لَّهُۥ مَا فِى ٱلسَّمَٰوَٰتِ وَمَا فِى ٱلْأَرْضِ ۗ مَن ذَا ٱلَّذِى يَشْفَعُ عِندَهُۥٓ إِلَّا بِإِذْنِهِۦ ۚ يَعْلَمُ مَا بَيْنَ أَيْدِيهِمْ وَمَا خَلْفَهُمْ ۖ وَلَا يُحِيطُونَ بِشَىْءٍۢ مِّنْ عِلْمِهِۦٓ إِلَّا بِمَا شَآءَ ۚ وَسِعَ كُرْسِيُّهُ ٱلسَّمَٰوَٰتِ وَٱلْأَرْضَ ۖ وَلَا يَـُٔودُهُۥ حِفْظُهُمَا ۚ وَهُوَ ٱلْعَلِىُّ ٱلْعَظِيمُ",
		"latin": "Allāhu lā ilāha illā huwal-ḥayyul-qayyūm, lā ta'khudzuhū sinatun wa lā naum, lahū mā fis-samāwāti wa mā fil-arḍ, man dzal-ladzī yasyfa'u 'indahū illā bi'idznih, ya'lamu mā baina aidīhim wa mā khalfahum, wa lā yuḥīṭūna bisyai'in min 'ilmihī illā bimā syā', wasi'a kursiyyuhus-samāwāti wal-arḍ, wa lā ya'ūduhū ḥifẓuhumā, wa huwal-'aliyyul-'aẓīm.",
		"translation": "Allah, tidak ada tuhan selain Dia, Yang Mahahidup lagi terus-menerus mengurus makhluk-Nya. Dia tidak mengantuk dan tidak tidur. Milik-Nya apa yang ada di langit dan apa yang ada di bumi. Tidak ada yang dapat memberi syafaat di sisi-Nya tanpa izin-Nya. Dia mengetahui apa yang ada di hadapan mereka dan apa yang ada di belakang mereka, sedangkan mereka tidak mengetahui sedikit pun dari ilmu-Nya kecuali yang Dia kehendaki. Kursi-Nya meliputi langit dan bumi, dan Dia tidak merasa berat menjaga keduanya. Dialah Yang Mahatinggi lagi Mahaagung.",
		"id": 108,
		"slug": "ayat-kursi",
		"group": "quran",
		"count": 1,
		"source": "QS. Al-Baqarah: 255; HR. An-Nasa'i ('Amal al-Yaum wal-Lailah no. 100)",
		"benefit": "Siapa membacanya setiap selesai salat, tidak ada yang menghalanginya masuk surga selain kematian. Disahihkan Al-Albani (Ash-Shahihah no. 972).",
		"verified": false
	},
	{
		"title": "Al-Ikhlas",
		"ref": "https://api.alquran.cloud/v1/surah/112/quran-uthmani",
		"arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ هُوَ ٱللَّهُ أَحَدٌ ﴿١﴾ ٱللَّهُ ٱلصَّمَدُ ﴿٢﴾ لَمْ يَلِدْ وَلَمْ يُولَدْ ﴿٣﴾ وَلَمْ يَكُن لَّهُۥ كُفُوًا أَحَدٌۢ ﴿٤﴾",
		"latin": "Bismillāhir-raḥmānir-raḥīm. Qul huwallāhu aḥad. Allāhuṣ-ṣamad. Lam yalid wa lam yūlad. Wa lam yakun lahū kufuwan aḥad.",
		"translation": "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, Dialah Allah Yang Maha Esa. Allah tempat bergantung segala sesuatu. Dia tidak beranak dan tidak pula diperanakkan. Dan tidak ada sesuatu pun yang setara dengan Dia.",
		"id": 109,
		"slug": "al-ikhlas",
		"group": "quran",
		"count": 1,
		"countFor": {
			"subuh": 3,
			"maghrib": 3
		},
		"source": "QS. Al-Ikhlas; HR. Abu Dawud no. 1523",
		"note": "Dibaca sekali setiap selesai salat; setelah Subuh dan Maghrib tiga kali (Hisnul Muslim).",
		"verified": false
	},
	{
		"title": "Al-Falaq",
		"ref": "https://api.alquran.cloud/v1/surah/113/quran-uthmani",
		"arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلْفَلَقِ ﴿١﴾ مِن شَرِّ مَا خَلَقَ ﴿٢﴾ وَمِن شَرِّ غَاسِقٍ إِذَا وَقَبَ ﴿٣﴾ وَمِن شَرِّ ٱلنَّفَّٰثَٰتِ فِى ٱلْعُقَدِ ﴿٤﴾ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ ﴿٥﴾",
		"latin": "Bismillāhir-raḥmānir-raḥīm. Qul a'ūdzu birabbil-falaq. Min syarri mā khalaq. Wa min syarri ghāsiqin idzā waqab. Wa min syarrin-naffātsāti fil-'uqad. Wa min syarri ḥāsidin idzā ḥasad.",
		"translation": "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, aku berlindung kepada Tuhan yang menguasai subuh, dari kejahatan makhluk yang Dia ciptakan, dari kejahatan malam apabila telah gelap gulita, dari kejahatan para peniup pada buhul-buhul (penyihir), dan dari kejahatan orang yang dengki apabila ia mendengki.",
		"id": 110,
		"slug": "al-falaq",
		"group": "quran",
		"count": 1,
		"countFor": {
			"subuh": 3,
			"maghrib": 3
		},
		"source": "QS. Al-Falaq; HR. Abu Dawud no. 1523",
		"verified": false
	},
	{
		"title": "An-Nas",
		"ref": "https://api.alquran.cloud/v1/surah/114/quran-uthmani",
		"arabic": "بِسْمِ ٱللَّهِ ٱلرَّحْمَٰنِ ٱلرَّحِيمِ قُلْ أَعُوذُ بِرَبِّ ٱلنَّاسِ ﴿١﴾ مَلِكِ ٱلنَّاسِ ﴿٢﴾ إِلَٰهِ ٱلنَّاسِ ﴿٣﴾ مِن شَرِّ ٱلْوَسْوَاسِ ٱلْخَنَّاسِ ﴿٤﴾ ٱلَّذِى يُوَسْوِسُ فِى صُدُورِ ٱلنَّاسِ ﴿٥﴾ مِنَ ٱلْجِنَّةِ وَٱلنَّاسِ ﴿٦﴾",
		"latin": "Bismillāhir-raḥmānir-raḥīm. Qul a'ūdzu birabbin-nās. Malikin-nās. Ilāhin-nās. Min syarril-waswāsil-khannās. Alladzī yuwaswisu fī ṣudūrin-nās. Minal-jinnati wan-nās.",
		"translation": "Dengan nama Allah Yang Maha Pengasih lagi Maha Penyayang. Katakanlah, aku berlindung kepada Tuhan manusia, Raja manusia, sembahan manusia, dari kejahatan pembisik yang bersembunyi, yang membisikkan kejahatan ke dalam dada manusia, dari golongan jin dan manusia.",
		"id": 111,
		"slug": "an-nas",
		"group": "quran",
		"count": 1,
		"countFor": {
			"subuh": 3,
			"maghrib": 3
		},
		"source": "QS. An-Nas; HR. Abu Dawud no. 1523",
		"verified": false
	}
];
