<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from '#lib/components/Icon.svelte';
	import { withTransition } from '#lib/transition.ts';
	import { dateKey } from '#lib/date.ts';
	import { clock, doaPrefs, reading, toast, type ReadingPrefs } from '#lib/state/app.svelte.ts';

	let { data } = $props();
	const doa = $derived(data.doa);

	// Tombol kembali: pakai riwayat bila datang dari dalam aplikasi, selain itu ke daftar doa.
	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto('/doa'));

	const opt = $derived(reading.value);
	const isFav = $derived(doaPrefs.value.favs.includes(doa.id));
	const todayKey = $derived(clock.now ? dateKey(clock.now) : '');
	const isRead = $derived(doaPrefs.value.readOn === todayKey && doaPrefs.value.read.includes(doa.id));

	let scrolled = $state(false);
	let marked = $state(new Set<number>());

	const vt = withTransition;

	function toggle(k: 'lat' | 'tr' | 'wbw') {
		vt(() => (reading.value = { ...opt, [k]: !opt[k] } as ReadingPrefs));
	}
	const resize = (delta: number) =>
		(reading.value = { ...opt, size: Math.min(46, Math.max(22, opt.size + delta)) });

	function fav() {
		const p = doaPrefs.value;
		doaPrefs.value = { ...p, favs: isFav ? p.favs.filter((x) => x !== doa.id) : [...p.favs, doa.id] };
		toast.say(isFav ? 'Dihapus dari favorit' : 'Disimpan ke favorit');
	}

	function markRead() {
		const p = doaPrefs.value;
		const read = p.readOn === todayKey ? p.read : [];
		doaPrefs.value = {
			...p,
			readOn: todayKey,
			read: isRead ? read.filter((x) => x !== doa.id) : [...read, doa.id]
		};
		if (!isRead) toast.say('Alhamdulillah, tercatat');
	}

	const shareText = $derived(`${doa.title}\n\n${doa.arabic}\n\n${doa.latin}\n\n"${doa.translation}"\n(${doa.source})`);

	async function copy() {
		try {
			await navigator.clipboard.writeText(shareText);
			toast.say('Doa disalin');
		} catch {
			toast.say('Tidak bisa menyalin di browser ini');
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

	function mark(i: number) {
		const s = new Set(marked);
		if (s.has(i)) s.delete(i);
		else s.add(i);
		marked = s;
	}
</script>

<svelte:window onscroll={() => (scrolled = scrollY > 10)} />

<svelte:head>
	<title>{doa.title} · Muslims Daily</title>
	<meta name="description" content="{doa.title}: {doa.translation}" />
</svelte:head>

<div class="dhead" class:scrolled>
	<div class="bar">
		<button class="back press" aria-label="Kembali" onclick={back}><Icon name="back" /></button>
		<span class="label grow">{doa.category}</span>
		<button class="fav" class:on={isFav} aria-label="Favorit" aria-pressed={isFav} onclick={fav}><Icon name="heart" /></button>
	</div>
	<div class="opts" role="group" aria-label="Pilihan tampilan bacaan">
		<button class="opt" aria-pressed={opt.lat} onclick={() => toggle('lat')}>Latin</button>
		<button class="opt" aria-pressed={opt.tr} onclick={() => toggle('tr')}>Terjemahan</button>
		<button class="opt" aria-pressed={opt.wbw} onclick={() => toggle('wbw')}>Per kata</button>
		<span class="fs">
			<button aria-label="Perkecil huruf Arab" onclick={() => resize(-3)}>A−</button>
			<button aria-label="Perbesar huruf Arab" onclick={() => resize(3)} class="big">A+</button>
		</span>
	</div>
</div>

<h1 class="disp title rise">{doa.title}</h1>
<div class="meta">
	<span class="num">{doa.wordCount} kata</span><span class="dot"></span><span>{doa.source.split(',')[0]}</span>
	{#if !doa.verified}<span class="dot"></span><span class="draft">Draf, belum diverifikasi</span>{/if}
</div>

<article class="card reading" style:--arsize="{opt.size}px">
	{#if opt.wbw && doa.words}
		<div class="label head">Per kata · ketuk untuk menandai</div>
		<div class="words" lang="ar">
			{#each doa.words as w, i (i)}
				<button class="w" class:on={marked.has(i)} style:animation-delay="{i * 35}ms" onclick={() => mark(i)} aria-pressed={marked.has(i)}>
					<span class="wa">{w[0]}</span>
					{#if opt.lat}<span class="wl" lang="id">{w[1]}</span>{/if}
					{#if opt.tr}<span class="wt" lang="id">{w[2]}</span>{/if}
				</button>
			{/each}
		</div>
		{#if opt.tr}
			<div class="block"><div class="label">Terjemahan utuh</div><p class="tr">{doa.translation}</p></div>
		{/if}
	{:else}
		<p class="ar" lang="ar">{doa.arabic}</p>
		{#if opt.wbw && !doa.words}
			<div class="block"><div class="label">Per kata</div><p class="tr muted">Arti per kata untuk doa ini belum tersedia.</p></div>
		{/if}
		{#if opt.lat}
			<div class="block"><div class="label">Transliterasi</div><p class="lat">{doa.latin}</p></div>
		{/if}
		{#if opt.tr}
			<div class="block"><div class="label">Terjemahan</div><p class="tr">{doa.translation}</p></div>
		{/if}
	{/if}
	{#if doa.partial}
		<p class="partial">Ditampilkan bagian awal doa.</p>
	{/if}
</article>

<aside class="card source" class:warn={doa.warn}>
	<Icon name="info" />
	<div>
		<div class="label">Sumber</div>
		<div class="src">{doa.source}</div>
		{#if doa.note}<div class="note">{doa.note}</div>{/if}
		{#if doa.warn}<div class="note w">Boleh diamalkan sebagai doa umum, tetapi tidak disandarkan kepada Nabi ﷺ.</div>{/if}
	</div>
</aside>

<div class="actions">
	<button class="press" onclick={copy}><Icon name="copy" />Salin</button>
	<button class="press" onclick={share}><Icon name="share" />Bagikan</button>
	<button class="press" onclick={() => toast.say('Koleksi pribadi segera hadir')}><Icon name="plus" />Koleksi</button>
</div>
<button class="done press" class:ok={isRead} onclick={markRead}>
	<Icon name="check" stroke={2.4} />
	{isRead ? 'Sudah dibaca hari ini' : 'Tandai sudah dibaca'}
</button>

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
	.draft {
		color: var(--peach-ink);
	}
	.reading {
		padding: 22px 18px;
		margin-top: 16px;
	}
	.reading .ar {
		font-size: var(--arsize);
		margin: 0;
	}
	.head {
		margin-bottom: 12px;
	}
	.block {
		margin-top: 18px;
		padding-top: 16px;
		border-top: 1px dashed var(--line);
		animation: rise 0.35s var(--ease) both;
	}
	.lat {
		font-style: italic;
		color: var(--navy);
		font-size: 15px;
		line-height: 1.75;
		margin: 6px 0 0;
	}
	.tr {
		font-size: 15px;
		line-height: 1.75;
		margin: 6px 0 0;
	}
	.muted {
		color: var(--ink2);
	}
	.partial {
		margin: 14px 0 0;
		font-size: 12px;
		color: var(--ink3);
	}
	.words {
		display: flex;
		flex-wrap: wrap;
		direction: rtl;
		gap: 8px;
	}
	.w {
		direction: ltr;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 10px 10px 9px;
		border-radius: 14px;
		background: var(--paper);
		border: 1px solid var(--line);
		min-width: 72px;
		flex: 1 1 auto;
		max-width: 100%;
		transition: all 0.25s var(--ease);
		animation: pop 0.35s var(--ease) both;
	}
	.w:hover {
		border-color: var(--navy-2);
	}
	.w.on {
		background: var(--navy-soft);
		border-color: var(--navy);
	}
	.wa {
		font-family: var(--f-ar);
		font-size: calc(var(--arsize) * 0.8);
		line-height: 1.6;
		direction: rtl;
	}
	.wl {
		font-size: 11.5px;
		font-style: italic;
		color: var(--navy);
		margin-top: 2px;
	}
	.wt {
		font-size: 11.5px;
		color: var(--ink2);
		margin-top: 3px;
		font-weight: 600;
		line-height: 1.35;
	}
	.source {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		padding: 14px 16px;
		margin-top: 12px;
		color: var(--navy);
	}
	.source.warn {
		background: var(--peach-wash);
		border-color: var(--peach-line);
		color: var(--peach-ink);
	}
	.src {
		font-size: 14px;
		font-weight: 700;
		margin-top: 3px;
		color: var(--ink);
	}
	.warn .src {
		color: var(--peach-ink);
	}
	.note {
		font-size: 12.5px;
		color: var(--ink2);
		margin-top: 3px;
		line-height: 1.5;
	}
	.note.w {
		color: var(--peach-ink);
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
