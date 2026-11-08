<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Picker from '#lib/components/Picker.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { CITIES } from '#lib/cities.ts';
	import { settings, toast } from '#lib/state/app.svelte.ts';

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

	const cityOptions = CITIES.map((c) => ({ value: c.id, label: c.name }));
</script>

<SubPage title="Lokasi jadwal salat" sub="Jadwal salat dan arah kiblat dihitung dari titik ini.">
<section class="card group">
	<div class="label">Lokasi sekarang</div>
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
	<div class="field">
		<span class="label">Atau pilih kota</span>
		<Picker
			label="Kota"
			options={cityOptions}
			value={s.place === 'gps' ? '' : s.place}
			placeholder="Lokasi saya (GPS)"
			searchable
			searchPlaceholder="Cari kota"
			onchange={pickCity}
		/>
	</div>
	<p class="hint">Lokasi hanya dipakai menghitung jadwal di HP kamu. Tidak dikirim ke server mana pun.</p>
</section>
</SubPage>

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
	.field .label {
		display: block;
		margin-bottom: 6px;
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 12px 0 0;
		line-height: 1.5;
	}
</style>
