<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import Picker from '#lib/components/Picker.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { CITIES } from '#lib/cities.ts';
	import { tr } from '#lib/i18n.svelte.ts';
	import { settings, toast } from '#lib/state/app.svelte.ts';

	const s = $derived(settings.value);
	let locating = $state(false);
	function pickCity(id: string) {
		const c = CITIES.find((x) => x.id === id);
		if (!c) return;
		settings.value = { ...s, place: c.id, label: c.name, lat: c.lat, lng: c.lng };
		toast.say(tr(`Lokasi diganti ke ${c.name}`, `Location changed to ${c.name}`));
	}

	// Lokasi GPS hanya dipakai untuk menghitung jadwal di perangkat. Tidak dikirim ke mana pun.
	function useGps() {
		if (!navigator.geolocation) return toast.say(tr('Browser ini tidak mendukung lokasi', "This browser doesn't support location"));
		locating = true;
		navigator.geolocation.getCurrentPosition(
			(pos) => {
				locating = false;
				const lat = Math.round(pos.coords.latitude * 1e4) / 1e4;
				const lng = Math.round(pos.coords.longitude * 1e4) / 1e4;
				settings.value = { ...s, place: 'gps', label: 'Lokasi saya', lat, lng };
				toast.say(tr('Jadwal memakai lokasi kamu', 'Prayer times now use your location'));
			},
			() => {
				locating = false;
				toast.say(tr('Izin lokasi ditolak. Pilih kota dari daftar.', 'Location access was denied. Pick a city from the list.'));
			},
			{ enableHighAccuracy: false, timeout: 10000, maximumAge: 3600000 }
		);
	}

	const cityOptions = CITIES.map((c) => ({ value: c.id, label: c.name }));
</script>

<SubPage
	title={tr('Lokasi jadwal salat', 'Prayer times location')}
	sub={tr('Jadwal salat dan arah kiblat dihitung dari titik ini.', 'Prayer times and the qibla direction are calculated from this point.')}
>
<section class="card group">
	<div class="label">{tr('Lokasi sekarang', 'Current location')}</div>
	<div class="loc">
		<Icon name="pin" />
		<div class="grow">
			<div class="v">{s.place === 'gps' ? tr('Lokasi saya', 'My location') : s.label}</div>
			<div class="sub num">{s.lat.toFixed(4)}, {s.lng.toFixed(4)}</div>
		</div>
	</div>
	<button class="btn press" onclick={useGps} disabled={locating}>
		<Icon name="locate" size={18} />{locating ? tr('Mencari lokasi…', 'Finding your location…') : tr('Gunakan lokasi saya', 'Use my location')}
	</button>
	<div class="field">
		<span class="label">{tr('Atau pilih kota', 'Or pick a city')}</span>
		<Picker
			label={tr('Kota', 'City')}
			options={cityOptions}
			value={s.place === 'gps' ? '' : s.place}
			placeholder={tr('Lokasi saya (GPS)', 'My location (GPS)')}
			searchable
			searchPlaceholder={tr('Cari kota', 'Search cities')}
			onchange={pickCity}
		/>
	</div>
	<p class="hint">
		{tr(
			'Lokasi hanya dipakai menghitung jadwal di HP kamu. Tidak dikirim ke server mana pun.',
			'Your location is only used to calculate prayer times on your phone. It is never sent to any server.'
		)}
	</p>
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
