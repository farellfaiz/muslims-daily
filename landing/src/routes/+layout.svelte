<script lang="ts">
	import '@fontsource-variable/fraunces/opsz.css';
	import '@fontsource-variable/plus-jakarta-sans';
	import '../app.css';

	import { onMount } from 'svelte';
	import { live } from '#lib/live.svelte.ts';

	let { children } = $props();

	onMount(() => live.start());
</script>

{@render children()}
