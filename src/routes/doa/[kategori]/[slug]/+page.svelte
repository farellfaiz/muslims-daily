<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import KoleksiSheet from '#lib/components/KoleksiSheet.svelte';
	import { containing } from '#lib/koleksi.ts';
	import { withTransition as vt } from '#lib/transition.ts';
	import { dateKey } from '#lib/date.ts';
	import { isReading, SOURCES } from '#lib/data/doa.ts';
	import { clock, doaPrefs, reading, toast, type ReadingPrefs } from '#lib/state/app.svelte.ts';

	let { data } = $props();
	const doa = $derived(data.doa);
	const cat = $derived(data.category);
	const readings = $derived(doa.parts.filter(isReading));
	const src = $derived(SOURCES[doa.source]);
	const srcLine = $derived(
		doa.source === 'kemenag'
			? `${tr(SOURCES.kemenag.book, SOURCES.kemenag.bookEn)}${doa.page ? tr(`, hlm. ${doa.page}`, `, p. ${doa.page}`) : ''}`
			: `${src.name}, ${doa.url}`
	);

	// Tombol kembali: pakai riwayat bila datang dari dalam aplikasi, selain itu ke kategorinya.
	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto(`/doa/${cat.slug}`));

	const opt = $derived(reading.value);
	const isFav = $derived(doaPrefs.value.favs.includes(doa.id));
	const inKoleksi = $derived(containing(doaPrefs.value.koleksi, doa.id).length > 0);
	let koleksiOpen = $state(false);
	const todayKey = $derived(clock.now ? dateKey(clock.now) : '');
	const isRead = $derived(doaPrefs.value.readOn === todayKey && doaPrefs.value.read.includes(doa.id));

	let scrolled = $state(false);

	function toggle(k: 'lat' | 'tr') {
		vt(() => (reading.value = { ...opt, [k]: !opt[k] } as ReadingPrefs));
	}
	const resize = (delta: number) => (reading.value = { ...opt, size: Math.min(46, Math.max(22, opt.size + delta)) });

	function fav() {
		// simpan status lama dulu: isFav ($derived) langsung berisi nilai baru setelah doaPrefs ditulis
		const was = isFav;
		const p = doaPrefs.value;
		doaPrefs.value = { ...p, favs: was ? p.favs.filter((x) => x !== doa.id) : [...p.favs, doa.id] };
		toast.say(was ? tr('Dihapus dari favorit', 'Removed from favorites') : tr('Disimpan ke favorit', 'Saved to favorites'));
	}

	function markRead() {
		const was = isRead;
		const p = doaPrefs.value;
		const read = p.readOn === todayKey ? p.read : [];
		doaPrefs.value = { ...p, readOn: todayKey, read: was ? read.filter((x) => x !== doa.id) : [...read, doa.id] };
		if (!was) toast.say(tr('Alhamdulillah, tercatat', 'Alhamdulillah, marked as read'));
	}

	const shareText = $derived(
		[
			doa.title,
			...doa.parts.map((p) => (isReading(p) ? [p.arabic, p.latin, p.translation && `"${p.translation}"`].filter(Boolean).join('\n\n') : `— ${p.heading} —`)),
			`${tr('Sumber', 'Source')}: ${srcLine}`
		].join('\n\n')
	);

	async function copy() {
		try {
			await navigator.clipboard.writeText(shareText);
			toast.say(tr('Doa disalin', 'Dua copied'));
		} catch {
			toast.say(tr('Tidak bisa menyalin di browser ini', "Can't copy in this browser"));
		}
	}

	async function share() {
		if (!navigator.share) return copy();
		try {
			await navigator.share({ title: doa.title, text: shareText, url: location.href });
		} catch {
			/* dibatalkan pengguna */
		}
	}
</script>

<svelte:window onscroll={() => (scrolled = scrollY > 10)} />

<svelte:head>
	<title>{doa.title} · Muslims Daily</title>
	<meta name="description" content="{doa.title}: {readings[0]?.translation ?? ''}" />
</svelte:head>

<div class="dhead" class:scrolled>
	<div class="bar">
		<button class="back press" aria-label={tr('Kembali', 'Back')} onclick={back}><Icon name="back" /></button>
		<a class="label grow catl" href="/doa/{cat.slug}">{cat.short}</a>
		<button class="fav" class:on={isFav} aria-label={tr('Favorit', 'Favorite')} aria-pressed={isFav} onclick={fav}><Icon name="heart" /></button>
	</div>
	<div class="opts" role="group" aria-label={tr('Pilihan tampilan bacaan', 'Reading display options')}>
		<button class="opt" aria-pressed={opt.lat} onclick={() => toggle('lat')}>Latin</button>
		<button class="opt" aria-pressed={opt.tr} onclick={() => toggle('tr')}>{tr('Terjemahan', 'Translation')}</button>
		<span class="fs">
			<button aria-label={tr('Perkecil huruf Arab', 'Smaller Arabic text')} onclick={() => resize(-3)}>A−</button>
			<button aria-label={tr('Perbesar huruf Arab', 'Larger Arabic text')} onclick={() => resize(3)} class="big">A+</button>
		</span>
	</div>
</div>

<h1 class="disp title rise">{doa.title}</h1>
<div class="meta">
	{#if readings.length > 1}<span class="num">{tr(`${readings.length} bacaan`, `${readings.length} readings`)}</span><span class="dot"></span>{/if}
	<span>{src.name}</span>
</div>

<article class="card reading" style:--arsize="{opt.size}px">
	{#each doa.parts as p, i (i)}
		{#if isReading(p)}
			<section class="part">
				<p class="ar" lang="ar">{p.arabic}</p>
				{#if opt.lat && p.latin}
					<div class="block"><div class="label">{tr('Transliterasi', 'Transliteration')}</div><p class="lat">{p.latin}</p></div>
				{/if}
				{#if opt.tr && p.translation}
					<div class="block"><div class="label">{tr('Terjemahan', 'Translation')}</div><p class="tr">{p.translation}</p></div>
				{/if}
			</section>
		{:else}
			<h2 class="sub disp">{p.heading}</h2>
		{/if}
	{/each}
</article>

<aside class="card source">
	<Icon name="info" />
	<div class="grow">
		<div class="label">{tr('Sumber & keterangan', 'Source & notes')}</div>
		{#if doa.note}<p class="note">{doa.note}</p>{/if}
		{#if doa.team.length}
			<ul class="team">
				{#each doa.team as t (t)}<li>{t}</li>{/each}
			</ul>
		{/if}
		{#if doa.url}
			<a class="ext" href={doa.url} target="_blank" rel="noopener">{tr(`Dari ${src.name} · lihat aslinya`, `From ${src.name} · see the original`)}</a>
		{:else}
			<p class="book">{tr(`Dari buku ${srcLine}`, `From the book ${srcLine}`)}</p>
		{/if}
	</div>
</aside>

<div class="actions">
	<button class="press" onclick={copy}><Icon name="copy" />{tr('Salin', 'Copy')}</button>
	<button class="press" onclick={share}><Icon name="share" />{tr('Bagikan', 'Share')}</button>
	<button class="press" class:on={inKoleksi} onclick={() => (koleksiOpen = true)}>
		<Icon name={inKoleksi ? 'check' : 'plus'} />{inKoleksi ? tr('Di koleksi', 'In collection') : tr('Koleksi', 'Collection')}
	</button>
</div>
<button class="done press" class:ok={isRead} onclick={markRead}>
	<Icon name="check" stroke={2.4} />
	{isRead ? tr('Sudah dibaca hari ini', 'Read today') : tr('Tandai sudah dibaca', 'Mark as read')}
</button>

<KoleksiSheet bind:open={koleksiOpen} doaId={doa.id} />

<style>
	.dhead {
		position: sticky;
		top: 0;
		z-index: 5;
		margin: 0 -18px;
		padding: 14px 18px 10px;
		background: var(--paper-glass);
		backdrop-filter: blur(14px);
		-webkit-backdrop-filter: blur(14px);
		border-bottom: 1px solid transparent;
		transition: border-color 0.2s;
	}
	.dhead.scrolled {
		border-color: var(--line);
	}
	.bar {
		display: flex;
		align-items: center;
		gap: 10px;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.catl {
		text-decoration: none;
	}
	.back {
		width: 40px;
		height: 40px;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
	}
	.fav {
		width: 40px;
		height: 40px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: var(--ink3);
		transition:
			transform 0.25s var(--ease),
			color 0.25s;
	}
	.fav.on {
		color: var(--rose);
	}
	.fav.on :global(svg) {
		fill: var(--rose);
	}
	.fav:active {
		transform: scale(1.25);
	}
	.opts {
		display: flex;
		gap: 5px;
		flex-wrap: wrap;
		margin-top: 12px;
		align-items: center;
	}
	.opt {
		height: 32px;
		padding: 0 11px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		display: inline-flex;
		align-items: center;
		gap: 6px;
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
		align-items: center;
		background: var(--sunk);
		border-radius: 999px;
		height: 32px;
	}
	.fs button {
		width: 32px;
		height: 32px;
		font-weight: 800;
		font-size: 12px;
	}
	.fs .big {
		font-size: 15px;
	}
	.title {
		font-weight: 500;
		font-size: 30px;
		line-height: 1.1;
		letter-spacing: -0.025em;
		margin: 14px 0 8px;
	}
	.meta {
		display: flex;
		align-items: center;
		flex-wrap: wrap;
		gap: 8px;
		font-size: 11.5px;
		color: var(--ink2);
		font-weight: 600;
	}
	.dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--ink3);
	}
	.reading {
		padding: 6px 18px;
		margin-top: 16px;
	}
	.part {
		padding: 18px 0;
	}
	.part + .part {
		border-top: 1px solid var(--line);
	}
	.reading .ar {
		font-size: var(--arsize);
		margin: 0;
		white-space: pre-line;
	}
	.sub {
		margin: 0;
		padding: 18px 0 2px;
		font-size: 17px;
		font-weight: 500;
		color: var(--peach-ink);
		letter-spacing: -0.01em;
	}
	.sub + .part {
		padding-top: 8px;
	}
	.part + .sub {
		border-top: 1px solid var(--line);
	}
	.block {
		margin-top: 16px;
		padding-top: 14px;
		border-top: 1px dashed var(--line);
		animation: rise 0.35s var(--ease) both;
	}
	.lat {
		font-style: italic;
		color: var(--navy);
		font-size: 15px;
		line-height: 1.75;
		margin: 6px 0 0;
		white-space: pre-line;
	}
	.tr {
		font-size: 15px;
		line-height: 1.75;
		margin: 6px 0 0;
		white-space: pre-line;
	}
	.source {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		padding: 14px 16px;
		margin-top: 12px;
		color: var(--navy);
	}
	.note {
		font-size: 13px;
		color: var(--ink);
		margin: 5px 0 0;
		line-height: 1.6;
		white-space: pre-line;
	}
	.team {
		list-style: none;
		padding: 0;
		margin: 8px 0 0;
		font-size: 11.5px;
		color: var(--ink2);
		line-height: 1.6;
	}
	.book {
		margin: 10px 0 0;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--navy);
		line-height: 1.5;
	}
	.ext {
		display: inline-block;
		margin-top: 10px;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--navy);
	}
	.actions {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin-top: 12px;
	}
	.actions button {
		height: 54px;
		border-radius: 16px;
		background: var(--card);
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
		font-size: 11.5px;
		font-weight: 700;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 3px;
		color: var(--ink2);
	}
	.actions button.on {
		background: var(--navy-soft);
		border-color: transparent;
		color: var(--navy);
	}
	.done {
		width: 100%;
		height: 54px;
		margin-top: 12px;
		border-radius: 18px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 800;
		font-size: 15px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		box-shadow: 0 14px 30px -14px var(--frame-shadow);
		transition: background 0.3s var(--ease);
	}
	.done.ok {
		background: var(--peach);
	}
</style>
