<script lang="ts">
	import BackupCard from '#lib/components/BackupCard.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { tr } from '#lib/i18n.svelte.ts';
</script>

<SubPage
	title={tr('Cadangan data', 'Data backup')}
	sub={tr(
		'Simpan catatan salat, favorit, dan pengaturan ke file, lalu pulihkan di HP lain.',
		'Save your prayer log, favorites, and settings to a file, then restore them on another phone.'
	)}
>
	<BackupCard />
</SubPage>
