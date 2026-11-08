<script lang="ts">
	import { onMount, tick } from 'svelte';
	import { slide } from 'svelte/transition';
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import StarNum from '#lib/components/StarNum.svelte';
	import { forTime } from '#lib/data/dzikir.ts';
	import { SALAT, SOURCE_NAME, SOURCE_URL } from '#lib/data/salat.ts';
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
	import { PRAYERS, type PrayerKey } from '#lib/prayer.ts';
	import { clock, dzikirProgress, reading, schedule, toast } from '#lib/state/app.svelte.ts';

	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto('/'));

	/** Bentuk bersama untuk kartu bacaan, dari data setelah salat maupun pagi petang. */
	interface Item {
		id: number;
		title: string;
		count: number;
		arabic: string;
		latin: string;
		translation: string;
		group?: 'dzikir' | 'doa';
		source?: string;
		benefit?: string;
		note?: string;
		warn?: boolean;
		verified?: boolean;
	}

	// Pilihan bawaan mengikuti jam; bisa diganti manual. Tautan ?set=salat atau ?set=pagi-petang juga dihormati.
	let pickedSet = $state<DzikirSet | null>(null);
	let pickedPrayer = $state<PrayerKey | null>(null);
	let pickedTime = $state<'pagi' | 'petang' | null>(null);
	onMount(() => {
		const q = new URLSearchParams(location.search).get('set');
		if (q === 'salat' || q === 'pagi-petang') pickedSet = q;
	});

	const now = $derived(clock.now);
	const t = $derived(now ? schedule(now).today : null);
	const set = $derived<DzikirSet>(pickedSet ?? (now && t ? suggestedSet(now, t) : 'salat'));
	const last = $derived(now && t ? afterPrayer(now, t) : null);
	const prayer = $derived<PrayerKey>(pickedPrayer ?? last?.prayer ?? 'subuh');
	const time = $derived(pickedTime ?? (now && t ? pagiPetang(now, t) : 'pagi'));

	const session = $derived<Session>(set === 'salat' ? prayer : time);
	// Sesi setelah Isya yang berlanjut lewat tengah malam tetap memakai tanggal kemarin.
	const date = $derived(!now ? '' : set === 'salat' && last && prayer === last.prayer ? last.date : dateKey(now));

	const items = $derived<Item[]>(
		set === 'salat' ? SALAT : forTime(time).map((d) => ({ ...d, ...d.text, group: undefined }))
	);
	const n = $derived(counts(dzikirProgress.value, session, date));
	const done = $derived(doneCount(dzikirProgress.value, session, date, items));
	const allDone = $derived(items.length > 0 && done === items.length);
	const pct = $derived(items.length ? (done / items.length) * 100 : 0);
	const draft = $derived(set === 'pagi-petang' && items.some((d) => d.verified === false));
	const prayerName = $derived(PRAYERS.find((p) => p.key === prayer)!.name);
	const heading = $derived(set === 'salat' ? `Setelah ${prayerName}` : time === 'pagi' ? 'Pagi' : 'Petang');

	const opt = $derived(reading.value);
	const toggle = (k: 'lat' | 'tr') => (reading.value = { ...opt, [k]: !opt[k] });
	const resize = (delta: number) => (reading.value = { ...opt, size: Math.min(46, Math.max(22, opt.size + delta)) });

	// Journey: gambaran alur semua bacaan sesi ini. Tertutup bawaannya supaya tidak mendorong kartu bacaan terlalu jauh.
	let journeyOpen = $state(false);
	const nextId = $derived(items.find((d) => (n[d.id] ?? 0) < d.count)?.id);
	const groups = $derived(
		set === 'salat'
			? (['dzikir', 'doa'] as const).map((g) => ({ g, total: items.filter((d) => d.group === g).length }))
			: []
	);
	const flow = $derived(
		groups.length ? groups.map((x) => `${x.total} ${x.g}`).join(' lalu ') : `${items.length} dzikir ${time}`
	);
	const nextItem = $derived(items.find((d) => d.id === nextId));
	const jump = (id: number) => document.getElementById(`dz-${id}`)?.scrollIntoView({ behavior: 'smooth', block: 'start' });

	async function count(d: Item, i: number) {
		if (!date || (n[d.id] ?? 0) >= d.count) return;
		dzikirProgress.value = tap(dzikirProgress.value, session, date, d.id, d.count);
		if ((counts(dzikirProgress.value, session, date)[d.id] ?? 0) < d.count) {
			navigator.vibrate?.(8);
			return;
		}
		navigator.vibrate?.([20, 40, 20]);
		// Bacaan selesai: geser ke bacaan berikutnya yang belum selesai.
		await tick();
		const next = items.slice(i + 1).find((x) => (n[x.id] ?? 0) < x.count);
		const target = document.getElementById(next ? `dz-${next.id}` : 'dz-end');
		setTimeout(() => target?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 350);
	}

	function restart() {
		dzikirProgress.value = resetSession(dzikirProgress.value, session, date);
		window.scrollTo({ top: 0, behavior: 'smooth' });
		toast.say('Hitungan dimulai ulang');
	}
</script>

<svelte:head>
	<title>Dzikir · Muslims Daily</title>
	<meta name="description" content="Dzikir dan doa setelah salat, serta dzikir pagi dan petang, dengan penghitung." />
</svelte:head>

<div class="bar">
	<button class="back press" aria-label="Kembali" onclick={back}><Icon name="back" /></button>
	<div class="opts" role="group" aria-label="Pilihan tampilan bacaan">
		<button class="opt" aria-pressed={opt.lat} onclick={() => toggle('lat')}>Latin</button>
		<button class="opt" aria-pressed={opt.tr} onclick={() => toggle('tr')}>Terjemahan</button>
		<span class="fs">
			<button aria-label="Perkecil huruf Arab" onclick={() => resize(-3)}>A−</button>
			<button aria-label="Perbesar huruf Arab" onclick={() => resize(3)} class="big">A+</button>
		</span>
	</div>
</div>

<header class="page-head">
	<div class="label">Dzikir</div>
	<h1>{heading}</h1>
</header>

<div class="seg wide" role="group" aria-label="Jenis dzikir">
	<button aria-pressed={set === 'salat'} onclick={() => (pickedSet = 'salat')}>Setelah salat</button>
	<button aria-pressed={set === 'pagi-petang'} onclick={() => (pickedSet = 'pagi-petang')}>Pagi &amp; petang</button>
</div>

<div class="chips" role="group" aria-label={set === 'salat' ? 'Setelah salat apa' : 'Waktu dzikir'}>
	{#if set === 'salat'}
		{#each PRAYERS as p (p.key)}
			<button class="chip" aria-pressed={prayer === p.key} onclick={() => (pickedPrayer = p.key)}>{p.name}</button>
		{/each}
	{:else}
		<button class="chip" aria-pressed={time === 'pagi'} onclick={() => (pickedTime = 'pagi')}>Pagi</button>
		<button class="chip" aria-pressed={time === 'petang'} onclick={() => (pickedTime = 'petang')}>Petang</button>
	{/if}
</div>

<section class="card journey" aria-labelledby="journey-h">
	<button class="jh" aria-expanded={journeyOpen} aria-controls="journey-list" onclick={() => (journeyOpen = !journeyOpen)}>
		<span class="grow">
			<span class="label" id="journey-h">Journey</span>
			<span class="jt">{flow}</span>
		</span>
		<span class="jtoggle">{journeyOpen ? 'Tutup' : 'Lihat alur'}<span class="chev" class:up={journeyOpen}><Icon name="chevron" size={14} stroke={2.2} /></span></span>
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

	{#if journeyOpen}
		<ol id="journey-list" class="steps" transition:slide={{ duration: 280 }}>
			{#each items as d, i (d.id)}
				{@const ok = (n[d.id] ?? 0) >= d.count}
				{#if d.group && d.group !== items[i - 1]?.group}
					<li class="sg">{d.group === 'dzikir' ? 'Dzikir' : 'Doa'}</li>
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
	{:else if nextItem}
		<button class="jnext" onclick={() => jump(nextItem.id)}>
			<span class="label">{done === 0 ? 'Mulai dari' : 'Berikutnya'}</span>
			<span class="sname">{nextItem.title}</span>
			{#if nextItem.count > 1}<span class="scount num">{nextItem.count}×</span>{/if}
		</button>
	{/if}
</section>

<section class="card prog" class:full={allDone}>
	<span class="orb {set === 'salat' ? 'arch' : time}" aria-hidden="true"></span>
	<div class="grow">
		<div class="pt"><span class="num">{done}</span> dari <span class="num">{items.length}</span> bacaan</div>
		<div class="track"><span style:width="{pct}%"></span></div>
		<div class="ps">
			{#if set === 'salat'}Dzikir lalu doa, selepas salat {prayerName}
			{:else if time === 'pagi'}Dibaca setelah Subuh sampai sebelum Ashar
			{:else}Dibaca setelah Ashar sampai malam{/if}
		</div>
	</div>
	{#if done > 0}
		<button class="redo press" onclick={restart} aria-label="Mulai ulang hitungan">Ulang</button>
	{/if}
</section>

{#if draft}
	<p class="draft"><span class="dot"></span>Konten masih draf, belum diverifikasi. Cek dengan guru atau kitab rujukan.</p>
{/if}

{#each items as d, i (d.id)}
	{@const c = n[d.id] ?? 0}
	{@const ok = c >= d.count}
	{#if d.group && d.group !== items[i - 1]?.group}
		<div class="sec-h"><h2>{d.group === 'dzikir' ? 'Dzikir' : 'Doa'}</h2></div>
	{/if}
	<article class="card dz" class:ok id="dz-{d.id}">
		<div class="dh">
			<StarNum n={i + 1} />
			<h3 class="disp">{d.title}</h3>
			{#if d.count > 1}<span class="times num">{d.count}×</span>{/if}
		</div>

		<p class="ar" style:font-size="{opt.size}px">{d.arabic}</p>
		{#if opt.lat}<p class="lat">{d.latin}</p>{/if}
		{#if opt.tr}<p class="tr">{d.translation}</p>{/if}

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

		<button
			class="counter"
			class:ok
			aria-label={ok ? `${d.title} selesai` : `Hitung ${d.title}, ${c} dari ${d.count}`}
			onclick={() => count(d, i)}
		>
			{#if ok}
				<Icon name="check" size={18} stroke={2.4} />Selesai
			{:else if d.count === 1}
				<span class="ct">Ketuk bila sudah dibaca</span>
			{:else if d.count <= 10}
				<span class="pips">
					{#each Array(d.count) as _, k (k)}<span class="pip" class:on={k < c}></span>{/each}
				</span>
				<span class="ct">{c === 0 ? 'Ketuk tiap selesai membaca' : `${c} dari ${d.count}`}</span>
			{:else}
				<span class="big num">{c}</span><span class="ct">dari {d.count}, ketuk tiap bacaan</span>
			{/if}
			{#if d.count > 10 && !ok}<span class="fill" style:width="{(c / d.count) * 100}%"></span>{/if}
		</button>
	</article>
{/each}

<div id="dz-end" class="end">
	{#if allDone}
		<div class="card fin">
			<span class="badge"><Icon name="check" size={26} stroke={2.4} /></span>
			<div class="disp ft">Alhamdulillah</div>
			<p>{set === 'salat' ? `Dzikir dan doa setelah ${prayerName} selesai.` : `Dzikir ${time} hari ini selesai.`}</p>
			<button class="ghost press" onclick={restart}>Mulai ulang</button>
		</div>
	{/if}
</div>

{#if set === 'salat'}
	<p class="credit">
		Teks dari <a href={SOURCE_URL} target="_blank" rel="noopener">{SOURCE_NAME}</a>.
	</p>
{/if}

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 10px;
		padding-top: 18px;
	}
	.back {
		width: 40px;
		height: 40px;
		flex: none;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
	}
	.opts {
		display: flex;
		align-items: center;
		gap: 6px;
		flex: 1;
		min-width: 0;
	}
	.opt {
		height: 30px;
		padding: 0 11px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink2);
		border: 1px solid var(--line-strong);
		transition: all 0.25s var(--ease);
	}
	.opt[aria-pressed='true'] {
		background: var(--navy);
		border-color: var(--navy);
		color: var(--on-navy);
	}
	.fs {
		margin-left: auto;
		display: inline-flex;
		gap: 2px;
	}
	.fs button {
		width: 32px;
		height: 30px;
		border-radius: 10px;
		font-weight: 800;
		font-size: 12px;
		color: var(--ink2);
	}
	.fs .big {
		font-size: 14px;
	}
	.page-head {
		padding-top: 16px;
		padding-bottom: 12px;
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
	.chev {
		display: inline-flex;
		transform: rotate(90deg);
		transition: transform 0.25s var(--ease);
	}
	.chev.up {
		transform: rotate(-90deg);
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
	.draft {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 12px 2px 4px;
		font-size: 12px;
		font-weight: 600;
		color: var(--peach-ink);
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--peach);
		flex: none;
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
		font-size: 12px;
		font-weight: 800;
		color: var(--peach-ink);
		background: var(--peach-soft);
		padding: 4px 10px;
		border-radius: 999px;
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
	.counter {
		position: relative;
		overflow: hidden;
		width: 100%;
		min-height: 56px;
		margin-top: 14px;
		border-radius: 16px;
		background: var(--sunk);
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 10px;
		font-weight: 700;
		font-size: 13px;
		color: var(--navy);
		transition:
			background 0.3s var(--ease),
			transform 0.12s var(--ease);
		touch-action: manipulation;
		user-select: none;
	}
	.counter:active:not(.ok) {
		transform: scale(0.98);
	}
	.counter.ok {
		background: var(--peach-soft);
		color: var(--peach-ink);
	}
	.counter > :not(.fill) {
		position: relative;
		z-index: 1;
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
	.ct {
		font-size: 12.5px;
		color: var(--ink2);
		font-weight: 600;
	}
	.big {
		font-family: var(--f-disp);
		font-size: 26px;
		font-weight: 500;
	}
	.end {
		scroll-margin-top: 16px;
		min-height: 1px;
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
