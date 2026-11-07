<script lang="ts">
	import AdjustCard from '#lib/components/AdjustCard.svelte';
	import BackupCard from '#lib/components/BackupCard.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import StarNum from '#lib/components/StarNum.svelte';
	import { CITIES } from '#lib/cities.ts';
	import { SOURCE_NAME, SOURCE_URL } from '#lib/data/salat.ts';
	import { METHODS, type MadhabKey, type MethodKey } from '#lib/prayer.ts';
	import { settings, theme, toast, type ThemeMode } from '#lib/state/app.svelte.ts';

	const s = $derived(settings.value);
	let locating = $state(false);

	function pickCity(id: string) {
		const c = CITIES.find((x) => x.id === id);
		if (!c) return;
		settings.value = { ...s, place: c.id, label: c.name, lat: c.lat, lng: c.lng };
		toast.say(`Lokasi diganti ke ${c.name}`);
	}

	// Lokasi GPS hanya dipakai untuk menghitung jadwal di perangkat. Tidak dikirim ke mana pun.
	function useGps() {
		if (!navigator.geolocation) return toast.say('Browser ini tidak mendukung lokasi');
		locating = true;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				locating = false;
				const lat = Math.round(pos.coords.latitude * 1e4) / 1e4;
				const lng = Math.round(pos.coords.longitude * 1e4) / 1e4;
				settings.value = { ...s, place: 'gps', label: 'Lokasi saya', lat, lng };
				toast.say('Jadwal memakai lokasi kamu');
			},
			() => {
				locating = false;
				toast.say('Izin lokasi ditolak. Pilih kota dari daftar.');
			},
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
		);
	}

	const setMethod = (m: MethodKey) => (settings.value = { ...s, method: m });
	const setMadhab = (m: MadhabKey) => (settings.value = { ...s, madhab: m });

	const THEMES: [ThemeMode, string][] = [
		['system', 'Ikuti HP'],
		['light', 'Terang'],
		['dark', 'Gelap']
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

<section id="lokasi" class="card group">
	<div class="label">Lokasi jadwal salat</div>
	<div class="loc">
		<Icon name="pin" />
		<div class="grow">
			<div class="v">{s.label}</div>
			<div class="sub num">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
		</div>
	</div>
	<button class="btn press" onclick={useGps} disabled={locating}>
		<Icon name="locate" size={18} />{locating ? 'Mencari lokasi…' : 'Gunakan lokasi saya'}
	</button>
	<label class="field">
		<span class="label">Atau pilih kota</span>
		<select value={s.place === 'gps' ? '' : s.place} onchange={(e) => pickCity(e.currentTarget.value)}>
			{#if s.place === 'gps'}<option value="" disabled>Lokasi saya (GPS)</option>{/if}
			{#each CITIES as c (c.id)}<option value={c.id}>{c.name}</option>{/each}
		</select>
	</label>
	<p class="hint">Lokasi hanya dipakai menghitung jadwal di HP kamu. Tidak dikirim ke server mana pun.</p>
</section>

<section class="card group">
	<div class="label">Metode perhitungan</div>
	<div class="opts">
		{#each METHODS as m (m.key)}
			<button class="opt" aria-pressed={s.method === m.key} onclick={() => setMethod(m.key)}>
				<span class="radio"></span>
				<span class="grow"><span class="v">{m.name}</span><span class="sub">{m.note}</span></span>
			</button>
		{/each}
	</div>
	<div class="label mt">Waktu Ashar</div>
	<div class="seg wide" role="group" aria-label="Mazhab untuk waktu Ashar">
		<button aria-pressed={s.madhab === 'syafii'} onclick={() => setMadhab('syafii')}>Syafi'i</button>
		<button aria-pressed={s.madhab === 'hanafi'} onclick={() => setMadhab('hanafi')}>Hanafi</button>
	</div>
	<p class="hint">Pilihan Syafi'i juga sesuai untuk Maliki dan Hanbali. Hanafi membuat Ashar lebih lambat.</p>
</section>

<AdjustCard />

<section class="card group">
	<div class="label">Tampilan</div>
	<div class="seg wide" role="group" aria-label="Tema tampilan">
		{#each THEMES as [m, name] (m)}
			<button aria-pressed={theme.value.mode === m} onclick={() => (theme.value = { mode: m })}>{name}</button>
		{/each}
	</div>
	<p class="hint">Mode gelap nyaman untuk tahajud dan membaca doa di malam hari.</p>
</section>

<BackupCard />

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
<section class="card credits">
	<div class="label">Kredit</div>
	<p>Desain terinspirasi dari <b>Pillars</b> (Prayer Times &amp; Qibla).</p>
	<p>
		Dzikir dan doa setelah salat dari
		<a href={SOURCE_URL} target="_blank" rel="noopener">{SOURCE_NAME}</a>.
	</p>
	<p>Jadwal salat dan arah kiblat dihitung dengan pustaka <b>adhan</b>.</p>
</section>

<style>
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.loc {
		display: flex;
		align-items: center;
		gap: 12px;
		margin: 12px 0;
		color: var(--navy);
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
	.btn {
		width: 100%;
		height: 46px;
		border-radius: 14px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.btn:disabled {
		opacity: 0.6;
	}
	.field {
		display: block;
		margin-top: 14px;
	}
	select {
		display: block;
		width: 100%;
		margin-top: 6px;
		font: inherit;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		background: var(--sunk);
		border: 0;
		border-radius: 12px;
		height: 44px;
		padding: 0 12px;
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 12px 0 0;
		line-height: 1.5;
	}
	.opts {
		display: grid;
		gap: 6px;
		margin-top: 10px;
	}
	.opt {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: 12px;
		text-align: left;
		border: 1px solid var(--line);
		transition: all 0.2s var(--ease);
	}
	.opt[aria-pressed='true'] {
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
	.opt[aria-pressed='true'] .radio {
		border-color: var(--navy);
	}
	.opt[aria-pressed='true'] .radio::after {
		content: '';
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--navy);
	}
	.mt {
		margin-top: 16px;
	}
	.wide {
		display: flex;
		width: 100%;
		margin-top: 8px;
	}
	.wide button {
		flex: 1;
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
	.credits {
		margin-top: 12px;
		padding: 14px 16px;
	}
	.credits p {
		margin: 8px 0 0;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--ink2);
	}
	.credits b {
		color: var(--ink);
	}
	.credits a {
		color: var(--navy);
		font-weight: 700;
	}
	.about img {
		border-radius: 16px;
		flex: none;
	}
	.about p {
		margin: 2px 0 0;
	}
</style>
