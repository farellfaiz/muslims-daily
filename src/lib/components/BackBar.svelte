<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { tr } from '#lib/i18n.svelte.ts';

	/** Tombol kembali: pakai riwayat bila datang dari dalam aplikasi, selain itu ke `fallback`. */
	let { fallback }: { fallback: string } = $props();

	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto(fallback));
</script>

<div class="bar">
	<button class="back press" aria-label={tr('Kembali', 'Back')} onclick={back}><Icon name="back" /></button>
</div>

<style>
	.bar {
		padding-top: 18px;
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
</style>
