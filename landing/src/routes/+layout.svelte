<script lang="ts">
	import '@fontsource-variable/fraunces/opsz.css';
	import '@fontsource-variable/plus-jakarta-sans';
	import '../app.css';

	import { onMount } from 'svelte';
	import { startLang } from '#lib/i18n.svelte.ts';
	import { live } from '#lib/live.svelte.ts';

	let { children } = $props();

	onMount(() => {
		startLang();
		return live.start();
	});
</script>

{@render children()}
