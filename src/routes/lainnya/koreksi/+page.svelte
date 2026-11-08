<script lang="ts">
	import AdjustCard from '#lib/components/AdjustCard.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { tr } from '#lib/i18n.svelte.ts';
</script>

<SubPage
	title={tr('Koreksi jadwal', 'Time adjustments')}
	sub={tr(
		'Geser per menit bila jadwal masjid di dekatmu sedikit berbeda.',
		"Shift times minute by minute if your local mosque's schedule is a little different."
	)}
>
	<AdjustCard />
</SubPage>
