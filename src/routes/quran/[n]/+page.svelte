<script lang="ts">
	import { tick } from 'svelte';
	import { afterNavigate } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import ReadBar from '#lib/components/ReadBar.svelte';
	import Words from '#lib/components/Words.svelte';
	import { BISMILLAH, arabicNum, hasBismillah, juzOf, juzStarts } from '#lib/quran.ts';
	import { quranLast, reading } from '#lib/state/app.svelte.ts';

	let { data } = $props();

	const opt = $derived(reading.value);
	const s = $derived(data.surat);
	const ayat = $derived(data.isi?.ayat ?? []);
	const texts = $derived(ayat.map((v) => v.w.map((w) => w[0]).join(' ')));
	const latins = $derived(ayat.map((v) => v.w.map((w) => w[1]).join(' ')));
	// juz yang dimulai di tengah surat ini, untuk penanda di antara ayat
	const starts = $derived(juzStarts(data.juz, s.n));
	const firstJuz = $derived(juzOf(data.juz, s.n, 1));
	const lastJuz = $derived(juzOf(data.juz, s.n, s.ayat));

	// Ayat yang sedang dibaca (garis baca di sepertiga atas layar) dan progres gulir surat ini.
	let current = $state(1);
	let progress = $state(0);
	$effect(() => {
		if (!list) return;
		const el = list;
		let raf = 0;
		const measure = () => {
			raf = 0;
			const r = el.getBoundingClientRect();
			const span = r.height - innerHeight * 0.6;
			progress = span > 0 ? Math.min(1, Math.max(0, -r.top / span)) : 1;
		};
		const onScroll = () => (raf ||= requestAnimationFrame(measure));
		measure();
		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', onScroll, { passive: true });
		return () => {
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', onScroll);
			cancelAnimationFrame(raf);
		};
	});

	// Lompat ke ayat tertentu dari bilah atas.
	let jumping = $state(false);
	let jumpValue = $state('');
	let jumpInput: HTMLInputElement | undefined = $state();
	async function openJump() {
		jumping = !jumping;
		jumpValue = '';
		await tick();
		jumpInput?.focus();
	}
	function submitJump(e: SubmitEvent) {
		e.preventDefault();
		const a = Number(jumpValue);
		if (!Number.isInteger(a) || a < 1 || a > s.ayat) return;
		jumping = false;
		history.replaceState(history.state, '', `#a${a}`);
		goToAyat(a);
	}

	/**
	 * Gulir langsung (bukan smooth) ke ayat, diulang setelah tata letak tenang:
	 * ayat di luar layar belum dirender (content-visibility) sehingga tingginya baru perkiraan.
	 */
	function goToAyat(a: number) {
		const go = () => document.getElementById(`a${a}`)?.scrollIntoView({ block: 'start', behavior: 'instant' });
		go();
		requestAnimationFrame(() => requestAnimationFrame(go));
		setTimeout(go, 300);
		current = a;
	}

	// Terakhir dibaca: ayat teratas yang sedang terlihat, disimpan sedikit tertunda supaya tidak menulis tiap gulir.
	let list: HTMLElement | undefined = $state();
	$effect(() => {
		if (!list || !ayat.length) return;
		const n = s.n;
		let timer: ReturnType<typeof setTimeout>;
		const io = new IntersectionObserver(
			(entries) => {
				const seen = entries.filter((e) => e.isIntersecting).map((e) => Number((e.target as HTMLElement).dataset.a));
				if (!seen.length) return;
				const a = Math.min(...seen);
				current = a;
				clearTimeout(timer);
				timer = setTimeout(() => {
					if (quranLast.value.s !== n || quranLast.value.a !== a) quranLast.value = { s: n, a };
				}, 600);
			},
			// garis baca: sepertiga atas layar
			{ rootMargin: '0px 0px -66% 0px' }
		);
		for (const el of list.querySelectorAll('[data-a]')) io.observe(el);
		return () => {
			io.disconnect();
			clearTimeout(timer);
		};
	});

	// Lompat ke #a<nomor> (dari "Lanjutkan membaca", daftar juz, atau pencarian) setelah navigasi selesai.
	afterNavigate(async ({ to }) => {
		const m = to?.url.hash.match(/^#a(\d+)$/);
		if (!m) return;
		await tick();
		goToAyat(Number(m[1]));
	});
</script>

<svelte:head>
	<title>{s.nama} · Al-Qur'an · Muslims Daily</title>
	<meta name="description" content="Surat {s.nama} ({s.arti}), {s.ayat} ayat, dengan terjemahan dan arti per kata." />
</svelte:head>

<ReadBar fallback="/quran" />

<header class="card head">
	<div class="arab" lang="ar">{s.arab}</div>
	<h1 class="disp">{s.nama}</h1>
	<div class="meta">{s.arti} · <span class="num">{s.ayat}</span> ayat · {s.tempat} · Juz <span class="num">{firstJuz}{lastJuz !== firstJuz ? `–${lastJuz}` : ''}</span></div>
	{#if data.isi && hasBismillah(s.n)}
		<p class="bism" lang="ar" style:font-size="{opt.size}px">{BISMILLAH}</p>
	{/if}
</header>

{#if !data.isi}
	<section class="card offline">
		<Icon name="info" size={22} />
		<p>Surat ini belum tersimpan di HP. Sambungkan internet sekali untuk membukanya, setelah itu bisa dibaca offline.</p>
	</section>
{:else}
	<!-- Bilah lengket: ayat saat ini, lompat ke ayat, dan garis progres gulir. -->
	<div class="sticky">
		<div class="st">
			<span class="sn">{s.nama}</span>
			<span class="sa">Ayat <span class="num">{current}</span><span class="of num">/{s.ayat}</span></span>
			<button class="jb press" aria-expanded={jumping} onclick={openJump}>Ke ayat</button>
		</div>
		{#if jumping}
			<form class="jf" onsubmit={submitJump}>
				<input
					bind:this={jumpInput}
					bind:value={jumpValue}
					type="number"
					inputmode="numeric"
					min="1"
					max={s.ayat}
					placeholder="1 sampai {s.ayat}"
					aria-label="Nomor ayat"
					onkeydown={(e) => e.key === 'Escape' && (jumping = false)}
				/>
				<button class="go press" type="submit">Buka</button>
			</form>
		{/if}
		<div class="pb" aria-hidden="true"><span style:transform="scaleX({progress})"></span></div>
	</div>

	<section class="card verses" bind:this={list}>
		{#each ayat as v, i (i)}
			{#if starts.has(i + 1) && i > 0}
				<div class="juz" role="separator"><span>Juz <span class="num">{starts.get(i + 1)}</span></span></div>
			{/if}
			<article class="ay" id="a{i + 1}" data-a={i + 1}>
				<div class="no num" aria-label="Ayat {i + 1}">{s.n}:{i + 1}</div>
				{#if opt.wbw}
					<Words words={v.w} lat={opt.lat} size={opt.size} />
				{:else}
					<p class="ar" lang="ar" style:font-size="{opt.size}px">
						{texts[i]} <span class="end">﴿{arabicNum(i + 1)}﴾</span>
					</p>
					{#if opt.lat}<p class="lat">{latins[i]}</p>{/if}
				{/if}
				{#if opt.tr}<p class="tr">{v.t}</p>{/if}
			</article>
		{/each}
	</section>
	{#if opt.wbw || opt.lat}
		<p class="src">Transliterasi dan arti per kata dari quran.com.</p>
	{/if}
{/if}

<nav class="pager" aria-label="Surat lain">
	{#if data.prev}
		<a class="card pg press" href="/quran/{data.prev.n}">
			<span class="flip"><Icon name="chevron" size={16} stroke={2.2} /></span>
			<span><span class="label">Sebelumnya</span><span class="pn">{data.prev.nama}</span></span>
		</a>
	{:else}<span></span>{/if}
	{#if data.next}
		<a class="card pg next press" href="/quran/{data.next.n}">
			<span><span class="label">Berikutnya</span><span class="pn">{data.next.nama}</span></span>
			<Icon name="chevron" size={16} stroke={2.2} />
		</a>
	{/if}
</nav>

<style>
	.head {
		margin-top: 16px;
		padding: 20px 18px 18px;
		text-align: center;
	}
	.arab {
		font-family: var(--f-ar);
		font-size: 30px;
		line-height: 1.5;
		color: var(--navy);
	}
	h1 {
		margin: 2px 0 0;
		font-size: 26px;
		font-weight: 500;
		letter-spacing: -0.02em;
	}
	.meta {
		margin-top: 4px;
		font-size: 12.5px;
		color: var(--ink2);
	}
	.bism {
		margin: 16px 0 0;
		padding-top: 14px;
		border-top: 1px solid var(--line);
		font-family: var(--f-ar);
		line-height: 1.9;
		direction: rtl;
	}
	.offline {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		margin-top: 12px;
		padding: 16px;
		color: var(--peach-ink);
	}
	.offline p {
		margin: 0;
		font-size: 13px;
		line-height: 1.55;
		color: var(--ink2);
	}
	.sticky {
		position: sticky;
		top: 0;
		z-index: 5;
		margin: 12px -16px 0;
		padding: 8px 16px 0;
		background: var(--paper-glass);
		backdrop-filter: blur(12px);
		-webkit-backdrop-filter: blur(12px);
	}
	.st {
		display: flex;
		align-items: center;
		gap: 10px;
		min-height: 36px;
	}
	.sn {
		flex: 1;
		min-width: 0;
		font-weight: 700;
		font-size: 14px;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.sa {
		font-size: 12.5px;
		font-weight: 700;
		color: var(--navy);
	}
	.of {
		color: var(--ink3);
		font-weight: 600;
	}
	.jb {
		height: 30px;
		padding: 0 11px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		color: var(--navy);
		background: var(--navy-soft);
	}
	.jb[aria-expanded='true'] {
		background: var(--navy);
		color: var(--on-navy);
	}
	.jf {
		display: flex;
		gap: 8px;
		padding: 6px 0 4px;
	}
	.jf input {
		flex: 1;
		min-width: 0;
		height: 40px;
		padding: 0 12px;
		border: 0;
		border-radius: 12px;
		background: var(--card);
		box-shadow: inset 0 0 0 1.5px var(--line-strong);
		font: inherit;
		font-size: 16px;
		color: var(--ink);
	}
	.jf input:focus {
		outline: 0;
		box-shadow: inset 0 0 0 1.5px var(--navy);
	}
	.go {
		height: 40px;
		padding: 0 16px;
		border-radius: 12px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
		font-size: 13.5px;
	}
	.pb {
		height: 3px;
		margin: 8px -16px 0;
		background: var(--line);
	}
	.pb span {
		display: block;
		height: 100%;
		background: var(--peach);
		transform-origin: left;
		transition: transform 0.12s linear;
	}
	.juz {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 0 2px;
		border-top: 1px solid var(--line);
		font-size: 11px;
		font-weight: 800;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		color: var(--peach-ink);
	}
	.juz::before,
	.juz::after {
		content: '';
		flex: 1;
		height: 1px;
		background: var(--peach-line);
	}
	.juz + .ay {
		border-top: 0;
	}
	.verses {
		margin-top: 12px;
		padding: 2px 16px;
	}
	.ay {
		padding: 14px 0 16px;
		border-top: 1px solid var(--line);
		/* di bawah bilah lengket */
		scroll-margin-top: 64px;
		/* surat panjang: ayat di luar layar tidak dirender sampai digulir */
		content-visibility: auto;
		contain-intrinsic-size: auto 180px;
	}
	.ay:first-child {
		border-top: 0;
	}
	.no {
		display: inline-block;
		padding: 2px 8px;
		border-radius: 999px;
		background: var(--sunk);
		font-size: 11px;
		font-weight: 700;
		color: var(--navy);
	}
	.ar {
		margin: 10px 0 0;
		font-family: var(--f-ar);
		line-height: 2.1;
		direction: rtl;
		text-align: right;
	}
	.end {
		color: var(--peach-ink);
		white-space: nowrap;
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
		line-height: 1.65;
		color: var(--ink2);
	}
	.src {
		margin: 10px 4px 0;
		font-size: 11.5px;
		color: var(--ink3);
		text-align: center;
	}
	.pager {
		display: grid;
		grid-template-columns: 1fr 1fr;
		gap: 10px;
		margin-top: 14px;
	}
	.pg {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 12px 14px;
		color: var(--ink3);
		text-decoration: none;
	}
	.pg.next {
		grid-column: 2;
		justify-content: flex-end;
		text-align: right;
	}
	.flip {
		display: inline-flex;
		transform: rotate(180deg);
	}
	.pg .label {
		display: block;
	}
	.pn {
		display: block;
		margin-top: 2px;
		font-size: 13.5px;
		font-weight: 700;
		color: var(--ink);
	}
</style>
