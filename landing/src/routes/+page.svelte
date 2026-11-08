<script lang="ts">
	import Closing from '#lib/components/Closing.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import Install from '#lib/components/Install.svelte';
	import Journey from '#lib/components/Journey.svelte';
	import More from '#lib/components/More.svelte';
	import Nav from '#lib/components/Nav.svelte';
	import OpenSource from '#lib/components/OpenSource.svelte';
	import Privacy from '#lib/components/Privacy.svelte';
	import { SITE_URL } from '#lib/config.ts';

	const title = 'Muslims Daily: teman ibadah dari Subuh sampai Isya';
	const description =
		"Jadwal salat, catatan salat, doa, dzikir, Al-Qur'an, dan kiblat dalam satu aplikasi. Ringan, tanpa akun, tanpa iklan, dan tetap jalan tanpa internet.";
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href="{SITE_URL}/" />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="id_ID" />
	<meta property="og:site_name" content="Muslims Daily" />
	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content="{SITE_URL}/" />
	<meta property="og:image" content="{SITE_URL}/og.png" />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Nav />
<main>
	<Journey />
	<Privacy />
	<More />
	<Install />
	<OpenSource />
	<Closing />
</main>
<Footer />
