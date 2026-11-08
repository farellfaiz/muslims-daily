<script lang="ts">
	import { onMount, tick } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ReadBar from '#lib/components/ReadBar.svelte';
	import Words from '#lib/components/Words.svelte';
	import StarNum from '#lib/components/StarNum.svelte';
	import { forTime } from '#lib/dzikirTime.ts';
	import Sheet from '#lib/components/Sheet.svelte';
	import {
		GROUP_LABEL,
		GROUP_LABEL_EN,
		PAGI_VERSI,
		SALAT_VERSI,
		TASBIH_SLUGS,
		type DzikirPrefs
	} from '#lib/salatVersi.ts';
	import { isEn, prayerName as nameOf, tr } from '#lib/i18n.svelte.ts';
	import { loadPerKata, perKataKey, type PerKata } from '#lib/perKata.ts';
	import { dateKey } from '#lib/date.ts';
	import {
		afterPrayer,
		counts,
		doneCount,
		pagiPetang,
		resetSession,
		suggestedSet,
		tap,
		type DzikirSet,
		type Session
	} from '#lib/dzikirProgress.ts';
	import type { PrayerKey } from '#lib/prayer.ts';
	import { clock, dzikirPrefs, dzikirProgress, reading, schedule, toast } from '#lib/state/app.svelte.ts';
	import type { WirdulData } from '../data/wirdul.json/+server.ts';

	let { data } = $props();

	/** Bentuk bersama untuk kartu bacaan, dari data setelah salat maupun pagi petang. */
	interface Item {
		id: number;
		/** kunci data arti per kata */
		key: string;
		title: string;
		count: number;
		arabic: string;
		latin: string;
		translation: string;
		group?: 'dzikir' | 'doa' | 'quran';
		source?: string;
		benefit?: string;
		note?: string;
		warn?: boolean;
		verified?: boolean;
	}

	// Pilihan bawaan mengikuti jam; bisa diganti manual. Tautan ?set=salat atau ?set=pagi-petang juga dihormati.
	let pickedSet = $state<DzikirSet | null>(null);
	let pickedTime = $state<'pagi' | 'petang' | null>(null);
	onMount(() => {
		const q = new URLSearchParams(location.search).get('set');
		if (q === 'salat' || q === 'pagi-petang') pickedSet = q;
	});

	const now = $derived(clock.now);
	const t = $derived(now ? schedule(now).today : null);
	const set = $derived<DzikirSet>(pickedSet ?? (now && t ? suggestedSet(now, t) : 'salat'));
	const last = $derived(now && t ? afterPrayer(now, t) : null);
	// salat terakhir yang sudah masuk; dini hari masih terhitung setelah Isya kemarin
	const prayer = $derived<PrayerKey>(last?.prayer ?? 'subuh');
	const time = $derived(pickedTime ?? (now && t ? pagiPetang(now, t) : 'pagi'));

	const session = $derived<Session>(set === 'salat' ? prayer : time);
	// Sesi setelah Isya yang berlanjut lewat tengah malam tetap memakai tanggal kemarin.
	const date = $derived(!now ? '' : set === 'salat' && last ? last.date : dateKey(now));

	// Pengaturan (versi, jumlah tasbih, getar, geser otomatis) di lembar sendiri. Pilihan diingat.
	const prefs = $derived(dzikirPrefs.value);
	const versi = $derived(prefs.salat);
	const pagiVersi = $derived(prefs.pagi);
	const setPref = <K extends keyof DzikirPrefs>(k: K, v: DzikirPrefs[K]) => (dzikirPrefs.value = { ...prefs, [k]: v });
	let settingsOpen = $state(false);
	// Wirdul Lathif diunduh terpisah, baru saat versi ini dipilih (disimpan service worker untuk offline).
	let wirdul = $state<WirdulData | null>(null);
	$effect(() => {
		if (pagiVersi !== 'wirdul' || wirdul) return;
		fetch('/data/wirdul.json')
			.then((r) => (r.ok ? (r.json() as Promise<WirdulData>) : Promise.reject(new Error(String(r.status)))))
			.then(
				(d) => (wirdul = d),
				() => {
					toast.say(tr('Wirdul Lathif gagal dimuat. Coba lagi saat online.', 'Could not load Wirdul Lathif. Try again when online.'));
				}
			);
	});
	const salatList = $derived(versi === 'ringkas' ? data.salatRingkas : data.salat);
	/** jumlah bacaan sesudah pengaturan: tasbih 33 atau 11, surah tiga kali setelah Subuh dan Maghrib */
	const countOf = (d: (typeof salatList)[number]) =>
		TASBIH_SLUGS.includes(d.slug) && d.count === 33 ? prefs.tasbih : (d.countFor?.[prayer] ?? d.count);

	const items = $derived<Item[]>(
		set === 'salat'
			? salatList.map((d) => ({ ...d, count: countOf(d), key: perKataKey('salat', d.id) }))
			: pagiVersi === 'wirdul'
				? (wirdul?.[time] ?? []).map((d) => ({ ...d, key: `wirdul:${d.id}` }))
				: forTime(data.dzikir, time).map((d) => ({
						...d,
						...d.text,
						group: undefined,
						key: perKataKey('dzikir', d.id, time === 'petang' && !!d.petang)
					}))
	);
	const n = $derived(counts(dzikirProgress.value, session, date));
	const done = $derived(doneCount(dzikirProgress.value, session, date, items));
	const allDone = $derived(items.length > 0 && done === items.length);
	const pct = $derived(items.length ? (done / items.length) * 100 : 0);
	const prayerName = $derived(nameOf(prayer));
	// "pagi" / "morning", dipakai di tengah kalimat
	const timeWord = $derived(time === 'pagi' ? tr('pagi', 'morning') : tr('petang', 'evening'));
	const heading = $derived(
		set === 'salat'
			? tr(`Setelah ${prayerName}`, `After ${prayerName}`)
			: time === 'pagi'
				? tr('Pagi', 'Morning')
				: tr('Petang', 'Evening')
	);

	const opt = $derived(reading.value);

	// Journey: gambaran alur semua bacaan sesi ini; daftar lengkapnya dibuka di lembar bawah.
	let journeyOpen = $state(false);
	const nextId = $derived(items.find((d) => (n[d.id] ?? 0) < d.count)?.id);
	// kelompok bacaan sesuai urutan kemunculannya, mis. 6 dzikir lalu 16 doa
	const groups = $derived(
		[...new Set(items.map((d) => d.group).filter((g) => !!g))].map((g) => ({
			g: g!,
			total: items.filter((d) => d.group === g).length
		}))
	);
	const gl = $derived(isEn() ? GROUP_LABEL_EN : GROUP_LABEL);
	const then = $derived(tr(' lalu ', ', then '));
	const flow = $derived(
		groups.length
			? groups.map((x) => `${x.total} ${gl[x.g][1]}`).join(then)
			: tr(`${items.length} dzikir ${timeWord}`, `${items.length} ${timeWord} dhikr`)
	);
	// "Dzikir lalu doa" atau "Dzikir lalu bacaan Al-Qur'an", sesuai versi
	const order = $derived(groups.map((x, k) => (k === 0 ? gl[x.g][0] : gl[x.g][1])).join(then));
	const nextItem = $derived(items.find((d) => d.id === nextId));
	const jump = (id: number) => {
		journeyOpen = false;
		activeId = id;
		lockUntil = performance.now() + 1000;
		document.getElementById(`dz-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	};

	// Arti per kata: file terpisah, baru diunduh saat pertama kali dinyalakan. Hanya ditampilkan untuk
	// ayat Al-Qur'an (arti per kata quran.com); bacaan hadis belum punya sumber arti per kata yang terbuka.
	let perKata = $state<PerKata | null>(null);
	let perKataFailed = $state(false);
	$effect(() => {
		if (!opt.wbw || perKata) return;
		perKataFailed = false;
		loadPerKata().then(
			(d) => (perKata = d),
			() => {
				perKataFailed = true;
				toast.say(
					tr(
						'Arti per kata gagal dimuat. Coba lagi saat online.',
						"Couldn't load word-by-word meanings. Try again when you're online."
					)
				);
			}
		);
	});

	// Bacaan aktif untuk tombol hitung mengambang: kartu yang sedang berada di tengah layar.
	// Sebelum ada kartu yang lewat garis itu, pakai bacaan pertama yang belum selesai.
	let activeId = $state<number | null>(null);
	// Sesaat setelah geser otomatis, abaikan pelacak gulir: kartu tujuan yang pendek bisa saja
	// tidak menyentuh pita tengah, dan kartu di bawahnya jangan sampai ikut terpilih.
	let lockUntil = 0;
	$effect(() => {
		void items;
		const io = new IntersectionObserver(
			(entries) => {
				if (performance.now() < lockUntil) return;
				const hit = entries.filter((e) => e.isIntersecting).at(-1);
				if (hit) activeId = Number((hit.target as HTMLElement).dataset.id);
			},
			// pita tipis di sekitar tengah layar, sedikit di atas tombol
			{ rootMargin: '-35% 0px -50% 0px' }
		);
		for (const el of document.querySelectorAll('.dz[data-id]')) io.observe(el);
		return () => io.disconnect();
	});
	const firstOpen = $derived(items.find((d) => (n[d.id] ?? 0) < d.count));
	const active = $derived(items.find((d) => d.id === activeId) ?? firstOpen);
	const activeIdx = $derived(active ? items.indexOf(active) : -1);
	const activeC = $derived(active ? (n[active.id] ?? 0) : 0);
	const activeOk = $derived(!!active && activeC >= active.count);

	/** Ketuk tombol mengambang: hitung bacaan aktif, atau bila sudah selesai, pindah ke bacaan berikutnya. */
	function tapActive() {
		if (!active) return;
		if (!activeOk) return count(active, activeIdx);
		goNext(activeIdx);
	}

	function goNext(i: number) {
		const next = items.slice(i + 1).find((x) => (n[x.id] ?? 0) < x.count) ?? items.find((x) => (n[x.id] ?? 0) < x.count);
		if (next) activeId = next.id;
		lockUntil = performance.now() + 1000;
		const target = document.getElementById(next ? `dz-${next.id}` : 'dz-end');
		target?.scrollIntoView({ behavior: 'smooth', block: 'start' });
	}

	async function count(d: Item, i: number) {
		if (!date || (n[d.id] ?? 0) >= d.count) return;
		// tetap pada bacaan ini sampai pindah sendiri, supaya "Selesai" sempat terlihat
		activeId = d.id;
		dzikirProgress.value = tap(dzikirProgress.value, session, date, d.id, d.count);
		const vibrate = (p: number | number[]) => prefs.haptic && navigator.vibrate?.(p);
		if ((counts(dzikirProgress.value, session, date)[d.id] ?? 0) < d.count) {
			vibrate(8);
			return;
		}
		vibrate([20, 40, 20]);
		// Bacaan selesai: sebentar tampilkan "Selesai", lalu (bila diaktifkan) geser ke bacaan berikutnya.
		await tick();
		if (prefs.autoNext) setTimeout(() => goNext(i), 450);
	}

	function restart() {
		dzikirProgress.value = resetSession(dzikirProgress.value, session, date);
		window.scrollTo({ top: 0, behavior: 'smooth' });
		toast.say(tr('Hitungan dimulai ulang', 'Count reset'));
	}
</script>

<svelte:head>
	<title>{tr('Dzikir', 'Dhikr')} · Muslims Daily</title>
	<meta
		name="description"
		content={tr(
			'Dzikir dan doa setelah salat, serta dzikir pagi dan petang, dengan penghitung.',
			'Dhikr and duas after prayer, plus morning and evening dhikr, with a counter.'
		)}
	/>
</svelte:head>

<ReadBar />

<header class="page-head">
	<div class="grow">
		<div class="label">{tr('Dzikir', 'Dhikr')}</div>
		<h1>{heading}</h1>
	</div>
	<button class="gear press" aria-label={tr('Pengaturan dzikir', 'Dhikr settings')} onclick={() => (settingsOpen = true)}>
		<Icon name="sliders" size={20} />
	</button>
</header>

<div class="seg wide" role="group" aria-label={tr('Jenis dzikir', 'Dhikr type')} data-tour="dzikir">
	<button aria-pressed={set === 'salat'} onclick={() => (pickedSet = 'salat')}>{tr('Setelah salat', 'After prayer')}</button>
	<button aria-pressed={set === 'pagi-petang'} onclick={() => (pickedSet = 'pagi-petang')}
		>{tr('Pagi & petang', 'Morning & evening')}</button
	>
</div>

{#if set === 'pagi-petang'}
	<div class="chips" role="group" aria-label={tr('Waktu dzikir', 'Dhikr time')}>
		<button class="chip" aria-pressed={time === 'pagi'} onclick={() => (pickedTime = 'pagi')}>{tr('Pagi', 'Morning')}</button>
		<button class="chip" aria-pressed={time === 'petang'} onclick={() => (pickedTime = 'petang')}
			>{tr('Petang', 'Evening')}</button
		>
	</div>
{:else}
	<div class="gap"></div>
{/if}

<section class="card journey" aria-labelledby="journey-h">
	<button class="jh" aria-haspopup="dialog" onclick={() => (journeyOpen = true)}>
		<span class="grow">
			<span class="label" id="journey-h">Journey</span>
			<span class="jt">{flow}</span>
		</span>
		<span class="jtoggle">{tr('Lihat alur', 'See all')}<Icon name="chevron" size={14} stroke={2.2} /></span>
	</button>

	<div class="strip" aria-hidden="true">
		{#each items as d (d.id)}
			<span
				class="seg-{d.group ?? 'dzikir'}"
				class:done={(n[d.id] ?? 0) >= d.count}
				class:now={d.id === nextId}
			></span>
		{/each}
	</div>

	{#if nextItem}
		<button class="jnext" onclick={() => jump(nextItem.id)}>
			<span class="label">{done === 0 ? tr('Mulai dari', 'Start with') : tr('Berikutnya', 'Up next')}</span>
			<span class="sname">{nextItem.title}</span>
			{#if nextItem.count > 1}<span class="scount num">{nextItem.count}×</span>{/if}
		</button>
	{/if}
</section>

<Sheet bind:open={journeyOpen} title="Journey">
	<p class="sheet-sub">
		{flow} · <span class="num">{done}</span>
		{tr('dari', 'of')} <span class="num">{items.length}</span>
		{tr('selesai', 'done')}
	</p>
	<ol class="steps">
		{#each items as d, i (d.id)}
			{@const ok = (n[d.id] ?? 0) >= d.count}
			{#if d.group && d.group !== items[i - 1]?.group}
				<li class="sg">{gl[d.group][0]}</li>
			{/if}
			<li>
				<button class="step" class:ok class:now={d.id === nextId} onclick={() => jump(d.id)}>
					<span class="node">{#if ok}<Icon name="check" size={12} stroke={2.8} />{:else}<span class="num">{i + 1}</span>{/if}</span>
					<span class="sname">{d.title}</span>
					{#if d.count > 1}<span class="scount num">{d.count}×</span>{/if}
				</button>
			</li>
		{/each}
	</ol>
</Sheet>

<Sheet bind:open={settingsOpen} title={tr('Pengaturan dzikir', 'Dhikr settings')}>
	<div class="set-sec">
		<div class="label">{tr('Versi dzikir setelah salat', 'After-prayer dhikr version')}</div>
		<div class="vopts">
			{#each SALAT_VERSI as v (v.value)}
				<button class="vopt" aria-pressed={versi === v.value} onclick={() => setPref('salat', v.value)}>
					<span class="radio"></span>
					<span class="grow"
						><span class="vl">{tr(v.label, v.labelEn)}</span><span class="vs">{tr(v.sub, v.subEn)}</span></span
					>
				</button>
			{/each}
		</div>
	</div>

	<div class="set-sec">
		<div class="label">{tr('Versi dzikir pagi & petang', 'Morning & evening dhikr version')}</div>
		<div class="vopts">
			{#each PAGI_VERSI as v (v.value)}
				<button class="vopt" aria-pressed={pagiVersi === v.value} onclick={() => setPref('pagi', v.value)}>
					<span class="radio"></span>
					<span class="grow"
						><span class="vl">{tr(v.label, v.labelEn)}</span><span class="vs">{tr(v.sub, v.subEn)}</span></span
					>
				</button>
			{/each}
		</div>
	</div>

	<div class="set-sec">
		<div class="label">Tasbih, tahmid, takbir</div>
		<div class="seg wide" role="group" aria-label={tr('Jumlah tasbih, tahmid, takbir', 'Tasbih, tahmid, takbir count')}>
			<button aria-pressed={prefs.tasbih === 33} onclick={() => setPref('tasbih', 33)}
				><span class="num">33</span>× {tr('masing-masing', 'each')}</button
			>
			<button aria-pressed={prefs.tasbih === 11} onclick={() => setPref('tasbih', 11)}
				><span class="num">11</span>× {tr('masing-masing', 'each')}</button
			>
		</div>
		<p class="set-hint">
			{tr(
				'33 kali masing-masing (HR. Muslim 597) paling umum. 11 kali masing-masing, totalnya 33, adalah penjelasan Suhail dalam HR. Muslim 595.',
				"33 times each (Muslim 597) is the most common. 11 times each, 33 in total, is Suhail's explanation in Muslim 595."
			)}
		</p>
	</div>

	<div class="set-sec">
		<button class="sw" role="switch" aria-checked={prefs.haptic} onclick={() => setPref('haptic', !prefs.haptic)}>
			<span class="grow"
				><span class="vl">{tr('Getar tiap ketukan', 'Vibrate on each tap')}</span><span class="vs"
					>{tr(
						'Getar halus saat menghitung, lebih panjang saat selesai',
						'A light buzz while counting, a longer one when done'
					)}</span
				></span
			>
			<span class="knob"></span>
		</button>
		<button class="sw" role="switch" aria-checked={prefs.autoNext} onclick={() => setPref('autoNext', !prefs.autoNext)}>
			<span class="grow"
				><span class="vl">{tr('Geser ke bacaan berikutnya', 'Move to the next reading')}</span><span class="vs"
					>{tr('Otomatis setelah satu bacaan selesai', 'Automatically, once a reading is done')}</span
				></span
			>
			<span class="knob"></span>
		</button>
	</div>
</Sheet>

<section class="card prog" class:full={allDone}>
	<span class="orb {set === 'salat' ? 'arch' : time}" aria-hidden="true"></span>
	<div class="grow">
		<div class="pt">
			<span class="num">{done}</span>
			{tr('dari', 'of')} <span class="num">{items.length}</span>
			{tr('bacaan', 'readings')}
		</div>
		<div class="track"><span style:width="{pct}%"></span></div>
		<div class="ps">
			{#if set === 'salat'}{tr(`${order}, selepas salat ${prayerName}`, `${order}, after ${prayerName}`)}
			{:else if time === 'pagi'}{tr('Dibaca setelah Subuh sampai sebelum Ashar', 'Read from Fajr until before Asr')}
			{:else}{tr('Dibaca setelah Ashar sampai malam', 'Read from Asr into the night')}{/if}
		</div>
	</div>
	{#if done > 0}
		<button class="redo press" onclick={restart}>{tr('Mulai ulang', 'Start over')}</button>
	{/if}
</section>


{#each items as d, i (d.id)}
	{@const c = n[d.id] ?? 0}
	{@const ok = c >= d.count}
	{@const pkAll = opt.wbw ? perKata?.[d.key] : undefined}
	{@const pk = pkAll?.src === 'quran' ? pkAll : undefined}
	{#if d.group && d.group !== items[i - 1]?.group}
		<div class="sec-h"><h2>{gl[d.group][0]}</h2></div>
	{/if}
	<article class="card dz" class:ok class:on={active?.id === d.id && !allDone} id="dz-{d.id}" data-id={d.id}>
		<div class="dh">
			<StarNum n={i + 1} />
			<h3 class="disp">{d.title}</h3>
			{#if ok}
				<span class="times done"><Icon name="check" size={13} stroke={2.6} />{tr('Selesai', 'Done')}</span>
			{:else if c > 0}
				<span class="times num">{c}/{d.count}</span>
			{:else if d.count > 1}
				<span class="times num">{d.count}×</span>
			{/if}
		</div>

		{#if pk}
			<Words words={pk.w} lat={opt.lat} size={opt.size} />
			<p class="wsrc">{tr('Arti per kata dari quran.com', 'Word-by-word meanings from quran.com')}</p>
			{#if opt.tr}<p class="tr">{d.translation}</p>{/if}
		{:else}
			<p class="ar" style:font-size="{opt.size}px">{d.arabic}</p>
			{#if opt.wbw && !perKata && !perKataFailed}<p class="wsrc">
					{tr('Memuat arti per kata…', 'Loading word-by-word meanings…')}
				</p>{/if}
			{#if opt.lat}<p class="lat">{d.latin}</p>{/if}
			{#if opt.tr}<p class="tr">{d.translation}</p>{/if}
		{/if}

		{#if d.source || d.benefit}
			<div class="meta">
				{#if d.source}<span class="src">{d.source}</span>{/if}
				{#if d.benefit}<span class="ben">{d.benefit}</span>{/if}
			</div>
		{/if}
		{#if d.warn && d.note}
			<p class="warn"><Icon name="info" size={15} />{d.note}</p>
		{:else if d.note}
			<p class="note">{d.note}</p>
		{/if}

	</article>
{/each}

{#if active && !allDone}
	<div class="fab-wrap">
		<button
			class="fab"
			class:ok={activeOk}
			aria-label={activeOk
				? tr(`${active.title} selesai. Ketuk untuk bacaan berikutnya`, `${active.title} done. Tap for the next reading`)
				: tr(`Hitung ${active.title}, ${activeC} dari ${active.count}`, `Count ${active.title}, ${activeC} of ${active.count}`)}
			onclick={tapActive}
		>
			{#if active.count > 10 && !activeOk}<span class="fill" style:width="{(activeC / active.count) * 100}%"></span>{/if}
			<span class="fno num">{activeIdx + 1}</span>
			<span class="fmain">
				<span class="fti">{active.title}</span>
				<span class="fsub">
					{#if activeOk}{tr('Selesai · ketuk untuk lanjut', 'Done · tap to continue')}
					{:else if active.count === 1}{tr('Ketuk bila sudah dibaca', "Tap once you've read it")}
					{:else if activeC === 0}{tr('Ketuk tiap selesai membaca', 'Tap each time you finish')}
					{:else}<span class="num">{activeC}</span> {tr('dari', 'of')} <span class="num">{active.count}</span>{/if}
				</span>
			</span>
			<span class="fct">
				{#if activeOk}
					<Icon name="check" size={22} stroke={2.4} />
				{:else if active.count === 1}
					<span class="pip"></span>
				{:else if active.count <= 10}
					<span class="pips">
						{#each Array(active.count) as _, k (k)}<span class="pip" class:on={k < activeC}></span>{/each}
					</span>
				{:else}
					<span class="big num">{activeC}</span>
				{/if}
			</span>
		</button>
	</div>
{/if}

<div id="dz-end" class="end">
	{#if allDone}
		<div class="card fin">
			<span class="badge"><Icon name="check" size={26} stroke={2.4} /></span>
			<div class="disp ft">Alhamdulillah</div>
			<p>
				{set === 'salat'
					? tr(`Dzikir dan doa setelah ${prayerName} selesai.`, `Dhikr and duas after ${prayerName}, all done.`)
					: tr(`Dzikir ${timeWord} hari ini selesai.`, `Today's ${timeWord} dhikr, all done.`)}
			</p>
			<button class="ghost press" onclick={restart}>{tr('Mulai ulang', 'Start over')}</button>
		</div>
	{/if}
</div>

{#if set === 'salat'}
	<p class="credit">
		{#if versi === 'ringkas'}
			{tr(
				"Disusun dari bab dzikir setelah salam dalam Hisnul Muslim. Teks Arab dari Sahih Bukhari, Sahih Muslim, dan Al-Qur'an.",
				"Compiled from the after-salam dhikr chapter of Hisnul Muslim. Arabic text from Sahih Bukhari, Sahih Muslim, and the Qur'an."
			)}
		{:else}
			{tr('Versi Al-Azhar (Syifa Budi). Teks dari', 'Al-Azhar version (Syifa Budi). Text from')}
			<a href={data.source.url} target="_blank" rel="noopener">{data.source.name}</a>.
		{/if}
	</p>
{:else if pagiVersi === 'wirdul'}
	{#if wirdul}<p class="credit">
		{tr(
			'Wirdul Lathif susunan al-Habib Abdullah al-Haddad. Teks Arab, transliterasi, dan terjemahan dari',
			'Wirdul Lathif, compiled by al-Habib Abdullah al-Haddad. Arabic text, transliteration, and translation from'
		)}
		<a href={wirdul.source.url} target="_blank" rel="noopener">{wirdul.source.name}</a>
		({wirdul.source.team.join('; ')}).
	</p>{/if}
{:else}
	<p class="credit">
		{tr(
			"Susunan Hisnul Muslim. Teks Arab dari hisnmuslim.com dan Al-Qur'an; terjemahan dari Hisnul Muslim edisi Indonesia; transliterasi disusun Muslims Daily.",
			"Arranged as in Hisnul Muslim. Arabic text from hisnmuslim.com and the Qur'an; translation from the Indonesian edition of Hisnul Muslim; transliteration by Muslims Daily."
		)}
	</p>
{/if}

<style>
	.page-head {
		display: flex;
		align-items: flex-end;
		gap: 12px;
		padding-top: 16px;
		padding-bottom: 12px;
	}
	.page-head .grow {
		flex: 1;
		min-width: 0;
	}
	.gear {
		width: 42px;
		height: 42px;
		flex: none;
		margin-bottom: 2px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		color: var(--navy);
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
	}
	.gap {
		height: 12px;
	}
	.sheet-sub {
		margin: 0 0 6px;
		font-size: 13px;
		color: var(--ink2);
	}
	.set-sec {
		padding: 14px 0;
		border-top: 1px solid var(--line);
	}
	.set-sec:first-of-type {
		border-top: 0;
		padding-top: 6px;
	}
	.set-sec .label {
		margin-bottom: 8px;
	}
	.vopts {
		display: grid;
		gap: 6px;
	}
	.vopt {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: 12px;
		text-align: left;
		border: 1px solid var(--line);
		transition: all 0.2s var(--ease);
	}
	.vopt[aria-pressed='true'] {
		border-color: var(--navy);
		background: var(--navy-soft);
	}
	.radio {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1.6px solid var(--line-strong);
		flex: none;
		display: grid;
		place-items: center;
	}
	.vopt[aria-pressed='true'] .radio {
		border-color: var(--navy);
	}
	.vopt[aria-pressed='true'] .radio::after {
		content: '';
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--navy);
	}
	.vl {
		display: block;
		font-weight: 700;
		font-size: 14px;
		color: var(--ink);
	}
	.vs {
		display: block;
		margin-top: 2px;
		font-size: 12px;
		line-height: 1.45;
		color: var(--ink2);
	}
	.set-hint {
		margin: 10px 0 0;
		font-size: 12px;
		line-height: 1.5;
		color: var(--ink3);
	}
	.sw {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 8px 0;
		text-align: left;
	}
	.knob {
		position: relative;
		width: 44px;
		height: 26px;
		flex: none;
		border-radius: 999px;
		background: var(--line-strong);
		transition: background 0.2s var(--ease);
	}
	.knob::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--knob);
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.25);
		transition: transform 0.2s var(--ease);
	}
	.sw[aria-checked='true'] .knob {
		background: var(--navy);
	}
	.sw[aria-checked='true'] .knob::after {
		transform: translateX(18px);
	}
	.wide {
		display: flex;
		width: 100%;
	}
	.wide button {
		flex: 1;
	}
	.chips {
		display: flex;
		gap: 6px;
		margin: 10px 0 12px;
		overflow-x: auto;
		scrollbar-width: none;
	}
	.chip {
		flex: 1;
		height: 32px;
		padding: 0 8px;
		border-radius: 999px;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--ink2);
		border: 1px solid var(--line-strong);
		white-space: nowrap;
		transition: all 0.25s var(--ease);
	}
	.chip[aria-pressed='true'] {
		background: var(--ink);
		border-color: var(--ink);
		color: var(--paper);
	}
	.journey {
		padding: 14px 16px 12px;
		margin-bottom: 12px;
	}
	.jh {
		display: flex;
		align-items: center;
		gap: 10px;
		width: 100%;
		text-align: left;
	}
	.jh .label {
		display: block;
	}
	.jt {
		display: block;
		margin-top: 3px;
		font-weight: 700;
		font-size: 14px;
		color: var(--ink);
	}
	.jtoggle {
		display: inline-flex;
		align-items: center;
		gap: 2px;
		font-size: 12px;
		font-weight: 700;
		color: var(--navy);
		flex: none;
	}
	/* satu ruas per bacaan: biru untuk dzikir, peach untuk doa */
	.strip {
		display: flex;
		gap: 3px;
		margin-top: 12px;
	}
	.strip span {
		flex: 1;
		height: 7px;
		border-radius: 999px;
		background: var(--navy-soft);
		transition: background 0.3s var(--ease);
	}
	.strip .seg-doa {
		background: var(--peach-soft);
	}
	.strip .seg-quran {
		background: var(--gold-soft);
	}
	.strip .seg-quran.done {
		background: var(--gold);
	}
	.strip .seg-dzikir.done {
		background: var(--navy);
	}
	.strip .seg-doa.done {
		background: var(--peach);
	}
	.strip .now {
		box-shadow: inset 0 0 0 1.5px var(--ink2);
	}
	.jnext {
		display: flex;
		align-items: center;
		gap: 8px;
		width: 100%;
		margin-top: 10px;
		text-align: left;
	}
	.jnext .label {
		flex: none;
	}
	.sname {
		flex: 1;
		min-width: 0;
		font-size: 13px;
		font-weight: 600;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.scount {
		flex: none;
		font-size: 11.5px;
		font-weight: 700;
		color: var(--peach-ink);
	}
	.steps {
		list-style: none;
		margin: 10px 0 0;
		padding: 0;
	}
	.sg {
		font-size: 10.5px;
		font-weight: 800;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--ink3);
		padding: 10px 0 4px;
	}
	.step {
		position: relative;
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 7px 0;
		text-align: left;
	}
	/* garis penghubung antar langkah */
	.step::before {
		content: '';
		position: absolute;
		left: 10.5px;
		top: -7px;
		bottom: -7px;
		width: 1.5px;
		background: var(--line-strong);
		z-index: 0;
	}
	.steps li:first-child .step::before,
	.sg + li .step::before {
		top: 50%;
	}
	.steps li:last-child .step::before {
		bottom: 50%;
	}
	.node {
		position: relative;
		z-index: 1;
		width: 22px;
		height: 22px;
		flex: none;
		border-radius: 50%;
		display: grid;
		place-items: center;
		font-size: 10.5px;
		font-weight: 800;
		color: var(--ink3);
		background: var(--card);
		border: 1.5px solid var(--line-strong);
	}
	.step.ok .node {
		background: var(--navy);
		border-color: var(--navy);
		color: var(--on-navy);
	}
	.step.ok .sname {
		color: var(--ink3);
	}
	.step.now .node {
		border-color: var(--peach);
		color: var(--peach-ink);
		box-shadow: 0 0 0 4px var(--peach-soft);
	}
	.step.now .sname {
		font-weight: 800;
	}
	.prog {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 16px;
		transition: box-shadow 0.4s var(--ease);
	}
	.prog.full {
		box-shadow:
			0 0 0 2px var(--peach),
			var(--shadow);
	}
	.orb {
		width: 34px;
		height: 34px;
		border-radius: 50%;
		flex: none;
		background: var(--peach-sun);
		box-shadow: 0 0 0 7px var(--peach-soft);
	}
	.orb.petang {
		background: var(--sunk);
		box-shadow:
			inset -9px -3px 0 var(--navy),
			0 0 0 7px var(--navy-soft);
	}
	/* setelah salat: lengkung pintu kecil seperti ikon */
	.orb.arch {
		border-radius: 50% 50% 6px 6px / 60% 60% 6px 6px;
		background: var(--arch);
		box-shadow: 0 0 0 7px var(--navy-soft);
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.pt {
		font-weight: 700;
		font-size: 14px;
	}
	.track {
		height: 6px;
		border-radius: 999px;
		background: var(--sunk);
		margin: 7px 0 6px;
		overflow: hidden;
	}
	.track span {
		display: block;
		height: 100%;
		border-radius: inherit;
		background: var(--navy);
		transition: width 0.5s var(--ease);
	}
	.full .track span {
		background: var(--peach);
	}
	.ps {
		font-size: 11.5px;
		color: var(--ink3);
	}
	.redo {
		font-size: 12px;
		font-weight: 700;
		color: var(--navy);
		padding: 6px 10px;
		border-radius: 10px;
		background: var(--navy-soft);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--peach);
		flex: none;
	}
	.wsrc {
		display: flex;
		align-items: center;
		gap: 6px;
		margin: 8px 2px 0;
		font-size: 11.5px;
		color: var(--ink3);
	}
	.dz {
		margin-top: 12px;
		padding: 16px 16px 14px;
		scroll-margin-top: 16px;
		transition: opacity 0.4s var(--ease);
	}
	.dz.ok {
		opacity: 0.62;
	}
	.dh {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.dh h3 {
		flex: 1;
		margin: 0;
		font-size: 17px;
		font-weight: 500;
		letter-spacing: -0.01em;
	}
	.times {
		display: inline-flex;
		align-items: center;
		gap: 4px;
		font-size: 12px;
		font-weight: 800;
		color: var(--peach-ink);
		background: var(--peach-soft);
		padding: 4px 10px;
		border-radius: 999px;
	}
	.times.done {
		color: var(--navy);
		background: var(--navy-soft);
	}
	/* kartu yang sedang dihitung tombol mengambang */
	.dz.on {
		box-shadow:
			0 0 0 1.5px var(--navy-2),
			var(--shadow);
	}
	.fab-wrap {
		position: fixed;
		z-index: 19;
		/* ditengahkan dengan margin, bukan transform, supaya tidak bentrok dengan animasi masuk */
		left: 0;
		right: 0;
		margin: 0 auto;
		bottom: calc(14px + var(--nav-h) + 10px + var(--safe-b));
		width: calc(min(430px, 100%) - 28px);
		animation: rise 0.35s var(--ease) both;
	}
	.fab {
		position: relative;
		overflow: hidden;
		width: 100%;
		min-height: 64px;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 16px 10px 12px;
		border-radius: 20px;
		background: var(--card);
		border: 1px solid var(--line);
		box-shadow: 0 16px 36px -14px var(--nav-shadow);
		text-align: left;
		color: var(--navy);
		transition:
			background 0.3s var(--ease),
			transform 0.12s var(--ease);
		touch-action: manipulation;
		user-select: none;
		-webkit-tap-highlight-color: transparent;
	}
	.fab:active:not(.ok) {
		transform: scale(0.98);
	}
	.fab.ok {
		background: var(--peach-wash);
		border-color: var(--peach-line);
	}
	.fab > :not(.fill) {
		position: relative;
		z-index: 1;
	}
	.fno {
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 10px;
		display: grid;
		place-items: center;
		background: var(--navy-soft);
		font-size: 12px;
		font-weight: 800;
	}
	.fmain {
		flex: 1;
		min-width: 0;
	}
	.fti {
		display: block;
		font-weight: 700;
		font-size: 13.5px;
		color: var(--ink);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.fsub {
		display: block;
		margin-top: 1px;
		font-size: 12px;
		font-weight: 600;
		color: var(--ink2);
	}
	.fab.ok .fsub,
	.fab.ok .fct {
		color: var(--peach-ink);
	}
	.fct {
		flex: none;
		display: flex;
		align-items: center;
	}
	.ar {
		margin: 14px 0 4px;
		white-space: pre-line;
	}
	.lat {
		margin: 8px 0 0;
		font-size: 13.5px;
		line-height: 1.6;
		font-style: italic;
		color: var(--navy);
	}
	.tr {
		margin: 8px 0 0;
		font-size: 14px;
		line-height: 1.6;
		color: var(--ink);
	}
	.meta {
		display: flex;
		flex-direction: column;
		gap: 2px;
		margin-top: 12px;
		padding-top: 10px;
		border-top: 1px dashed var(--line-strong);
	}
	.src {
		font-size: 12px;
		font-weight: 700;
		color: var(--ink2);
	}
	.ben {
		font-size: 12px;
		color: var(--ink3);
		line-height: 1.5;
	}
	.warn,
	.note {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		margin: 10px 0 0;
		font-size: 12px;
		line-height: 1.5;
	}
	.warn {
		padding: 9px 11px;
		border-radius: 12px;
		background: var(--peach-wash);
		border: 1px solid var(--peach-line);
		color: var(--peach-ink);
	}
	.warn :global(svg) {
		margin-top: 1px;
	}
	.note {
		color: var(--ink3);
	}
	.fill {
		position: absolute;
		left: 0;
		top: 0;
		bottom: 0;
		background: var(--navy-soft);
		transition: width 0.25s var(--ease);
	}
	.pips {
		display: flex;
		gap: 5px;
	}
	.pip {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		border: 1.6px solid var(--navy);
		transition:
			background 0.2s,
			transform 0.2s var(--ease);
	}
	.pip.on {
		background: var(--navy);
		transform: scale(1.1);
	}
	.big {
		font-family: var(--f-disp);
		font-size: 26px;
		font-weight: 500;
	}
	.end {
		scroll-margin-top: 16px;
		/* ruang supaya kartu terakhir tidak tertutup tombol mengambang */
		min-height: 84px;
	}
	.fin {
		margin-top: 14px;
		padding: 24px 18px;
		text-align: center;
		animation: rise 0.45s var(--ease) both;
	}
	.badge {
		display: inline-grid;
		place-items: center;
		width: 54px;
		height: 54px;
		border-radius: 50%;
		background: var(--peach-soft);
		color: var(--peach-ink);
		animation: pop 0.4s var(--ease) both;
	}
	.ft {
		font-size: 22px;
		margin-top: 10px;
	}
	.fin p {
		margin: 4px 0 14px;
		font-size: 13.5px;
		color: var(--ink2);
	}
	.ghost {
		height: 40px;
		padding: 0 18px;
		border-radius: 12px;
		border: 1.4px solid var(--line-strong);
		font-weight: 700;
		font-size: 13px;
		color: var(--navy);
	}
	.credit {
		margin: 18px 2px 0;
		font-size: 12px;
		color: var(--ink3);
		text-align: center;
	}
	.credit a {
		color: var(--navy);
		font-weight: 700;
	}
	@media (prefers-reduced-motion: reduce) {
		.fin,
		.badge {
			animation: none;
		}
	}
</style>
