<script lang="ts">
	import LocationForm from '#lib/components/LocationForm.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { tr } from '#lib/i18n.svelte.ts';
</script>

<SubPage
	title={tr('Lokasi jadwal salat', 'Prayer times location')}
	sub={tr('Jadwal salat dan arah kiblat dihitung dari titik ini.', 'Prayer times and the qibla direction are calculated from this point.')}
>
<section class="card group">
	<div class="label">{tr('Lokasi sekarang', 'Current location')}</div>
	<LocationForm />
</section>
</SubPage>

<style>
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
</style>
