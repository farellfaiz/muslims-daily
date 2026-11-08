<script lang="ts">
	import Icon, { type IconName } from '#lib/components/Icon.svelte';
	import StarNum from '#lib/components/StarNum.svelte';
	import { trackerSummary } from '#lib/backup.ts';
	import { formatLong } from '#lib/date.ts';
	import { METHODS, PRAYERS } from '#lib/prayer.ts';
	import { backupMeta, settings, theme, tracker, type ThemeMode } from '#lib/state/app.svelte.ts';

	const s = $derived(settings.value);

	// Ringkasan pengaturan saat ini, ditampilkan sebagai subjudul tiap baris.
	const method = $derived(METHODS.find((m) => m.key === s.method)?.name ?? '');
	const adjusted = $derived(PRAYERS.filter((p) => s.adjust[p.key]));
	const adjustSum = $derived(
		adjusted.length
			? adjusted.map((p) => `${p.name} ${s.adjust[p.key]! > 0 ? '+' : '−'}${Math.abs(s.adjust[p.key]!)}`).join(', ')
			: 'Tanpa koreksi'
	);
	const lastBackup = $derived(backupMeta.value.lastAt ? new Date(backupMeta.value.lastAt) : null);
	const neverBackedUp = $derived(!lastBackup && trackerSummary(tracker.value).days > 0);

	const ROWS: { href: string; icon: IconName; title: string; sub: string; warn?: boolean }[] = $derived([
		{ href: '/lainnya/lokasi', icon: 'pin', title: 'Lokasi jadwal salat', sub: s.place === 'gps' ? 'Lokasi saya (GPS)' : s.label },
		{
			href: '/lainnya/metode',
			icon: 'sun',
			title: 'Metode perhitungan',
			sub: `${method} · Ashar ${s.madhab === 'hanafi' ? 'Hanafi' : "Syafi'i"}`
		},
		{ href: '/lainnya/koreksi', icon: 'sliders', title: 'Koreksi jadwal', sub: `${adjustSum} · imsak ${s.imsak} menit` },
		{
			href: '/lainnya/cadangan',
			icon: 'download',
			title: 'Cadangan data',
			sub: lastBackup ? `Terakhir ${formatLong(lastBackup)}` : 'Belum pernah dicadangkan',
			warn: neverBackedUp
		}
	]);

	const THEMES: [ThemeMode, string, 'device' | 'sun' | 'moon'][] = [
		['system', 'Device', 'device'],
		['light', 'Terang', 'sun'],
		['dark', 'Gelap', 'moon']
	];

	let creditsDlg: HTMLDialogElement | undefined = $state();
	const CREDITS = [
		['Pillars', 'Prayer Times & Qibla', 'Desain aplikasi ini terinspirasi darinya.'],
		['adhan', 'Pustaka perhitungan', 'Menghitung jadwal salat dan arah kiblat.']
	];

	const SOON = [
		["Al-Qur'an", 'Mushaf lengkap dengan terjemahan per kata'],
		['Notifikasi adzan', 'Pengingat waktu salat']
	];
</script>

<svelte:head><title>Lainnya · Muslims Daily</title></svelte:head>

<header class="page-head">
	<div class="label">Pengaturan</div>
	<h1>Lainnya</h1>
</header>

<nav class="card list" aria-label="Pengaturan jadwal dan data">
	{#each ROWS as r (r.href)}
		<a class="row press" href={r.href}>
			<span class="ico"><Icon name={r.icon} size={19} /></span>
			<span class="grow">
				<span class="rt">{r.title}</span>
				<span class="rs" class:warn={r.warn}>{r.sub}</span>
			</span>
			<span class="go"><Icon name="chevron" size={16} stroke={2.2} /></span>
		</a>
	{/each}
</nav>

<section class="card group">
	<div class="label">Tampilan</div>
	<div class="seg wide" role="group" aria-label="Tema tampilan">
		{#each THEMES as [m, name, icon] (m)}
			<button class="ti" aria-pressed={theme.value.mode === m} onclick={() => (theme.value = { mode: m })}><Icon name={icon} size={16} />{name}</button>
		{/each}
	</div>
	<p class="hint">Mode gelap nyaman untuk tahajud dan membaca doa di malam hari.</p>
</section>

<div class="sec-h"><h2>Segera hadir</h2></div>
<section class="card soon">
	{#each SOON as [t, d], i (t)}
		<div class="srow"><StarNum n={i + 1} /><div><div class="v">{t}</div><div class="sub">{d}</div></div></div>
	{/each}
</section>

<div class="sec-h"><h2>Tentang</h2></div>
<section class="card about">
	<img src="/icons/icon-192.png" alt="" width="56" height="56" />
	<div>
		<div class="v">Muslims Daily</div>
		<p class="sub">
			Aplikasi open source, gratis, tanpa iklan, dan tanpa akun. Semua catatan tersimpan di perangkatmu sendiri.
		</p>
	</div>
</section>
<button class="card credits-btn press" onclick={() => creditsDlg?.showModal()}>
	<Icon name="heart" size={18} />
	<span class="grow">Kredit</span>
	<Icon name="chevron" size={16} />
</button>

<dialog
	bind:this={creditsDlg}
	class="sheet"
	aria-labelledby="credits-title"
	onclick={(e) => e.target === creditsDlg && creditsDlg?.close()}
>
	<div class="sheet-in">
		<div class="sheet-h">
			<h2 id="credits-title">Kredit</h2>
			<button class="x press" aria-label="Tutup" onclick={() => creditsDlg?.close()}><Icon name="x" size={18} /></button>
		</div>
		{#each CREDITS as [name, kind, desc] (name)}
			<div class="crow">
				<div class="v">{name} <span class="kind">{kind}</span></div>
				<div class="sub">{desc}</div>
			</div>
		{/each}
	</div>
</dialog>

<style>
	.list {
		padding: 4px 0;
		margin-bottom: 12px;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 12px 14px 12px 16px;
		color: inherit;
		text-decoration: none;
		position: relative;
	}
	/* garis pemisah mulai setelah ikon, seperti daftar pengaturan di HP */
	.row + .row::before {
		content: '';
		position: absolute;
		top: 0;
		left: 66px;
		right: 0;
		border-top: 1px solid var(--line);
	}
	.row:active {
		background: var(--sunk);
	}
	.ico {
		width: 36px;
		height: 36px;
		flex: none;
		border-radius: 11px;
		display: grid;
		place-items: center;
		background: var(--navy-soft);
		color: var(--navy);
	}
	.rt {
		display: block;
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	.rs {
		display: block;
		margin-top: 2px;
		font-size: 12.5px;
		color: var(--ink2);
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.rs.warn {
		color: var(--peach-ink);
		font-weight: 600;
	}
	.go {
		display: inline-grid;
		color: var(--ink3);
	}
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.v {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	.sub {
		display: block;
		font-size: 12px;
		color: var(--ink2);
		margin-top: 2px;
		line-height: 1.5;
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 12px 0 0;
		line-height: 1.5;
	}
	.wide {
		display: flex;
		width: 100%;
		margin-top: 8px;
	}
	.wide button {
		flex: 1;
	}
	.ti {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
	}
	.soon {
		padding: 6px 16px;
	}
	.srow {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.srow:last-child {
		border-bottom: 0;
	}
	.about {
		display: flex;
		gap: 14px;
		align-items: center;
		padding: 16px;
	}
	.credits-btn {
		margin-top: 12px;
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		text-align: left;
		color: var(--navy);
		font-weight: 700;
		font-size: 14.5px;
	}
	.credits-btn .grow {
		color: var(--ink);
	}
	.credits-btn :global(svg:last-child) {
		color: var(--ink3);
	}
	.sheet {
		margin: auto auto 0;
		width: 100%;
		max-width: 430px;
		max-height: 80dvh;
		padding: 0;
		border: 0;
		border-radius: var(--r-lg) var(--r-lg) 0 0;
		background: var(--card);
		color: var(--ink);
		border-top: 1px solid var(--line-strong);
		box-shadow: 0 -10px 40px -20px var(--frame-shadow);
	}
	.sheet[open] {
		animation: sheet-up 0.32s var(--ease);
	}
	.sheet::backdrop {
		background: rgba(15, 26, 38, 0.45);
		animation: fade 0.25s var(--ease);
	}
	@keyframes sheet-up {
		from {
			transform: translateY(100%);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheet[open],
		.sheet::backdrop {
			animation: none;
		}
	}
	.sheet-in {
		padding: 18px 18px calc(22px + var(--safe-b));
	}
	.sheet-h {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-bottom: 6px;
	}
	.sheet-h h2 {
		margin: 0;
		font-family: var(--f-disp);
		font-weight: 500;
		font-size: 21px;
		letter-spacing: -0.02em;
	}
	.x {
		width: 36px;
		height: 36px;
		border-radius: 50%;
		background: var(--sunk);
		color: var(--ink2);
		display: grid;
		place-items: center;
	}
	.crow {
		padding: 12px 0;
		border-bottom: 1px solid var(--line);
	}
	.crow:last-child {
		border-bottom: 0;
	}
	.kind {
		font-weight: 500;
		font-size: 12px;
		color: var(--ink3);
		margin-left: 4px;
	}
	.about img {
		border-radius: 16px;
		flex: none;
	}
	.about p {
		margin: 2px 0 0;
	}
</style>
