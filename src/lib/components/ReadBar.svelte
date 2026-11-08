<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import Icon from './Icon.svelte';
	import { reading } from '#lib/state/app.svelte.ts';

	/**
	 * Bilah atas layar baca: kembali, Latin, Terjemahan, Per kata, dan ukuran huruf Arab.
	 * Pilihan disimpan bersama (md:reading), jadi sama di Dzikir dan Al-Qur'an.
	 */
	let { fallback = '/' }: { fallback?: string } = $props();

	// Kembali ke halaman sebelumnya bila datang dari dalam aplikasi; bila dibuka langsung, ke `fallback`.
	let cameFromApp = $state(false);
	afterNavigate(({ from }) => (cameFromApp = !!from));
	const back = () => (cameFromApp ? history.back() : goto(fallback));

	const opt = $derived(reading.value);
	const toggle = (k: 'lat' | 'tr' | 'wbw') => (reading.value = { ...opt, [k]: !opt[k] });
	const resize = (delta: number) => (reading.value = { ...opt, size: Math.min(46, Math.max(22, opt.size + delta)) });
</script>

<div class="bar">
	<button class="back press" aria-label="Kembali" onclick={back}><Icon name="back" /></button>
	<div class="opts" role="group" aria-label="Pilihan tampilan bacaan">
		<button class="opt" aria-pressed={opt.lat} onclick={() => toggle('lat')}>Latin</button>
		<button class="opt" aria-pressed={opt.tr} onclick={() => toggle('tr')}>Terjemahan</button>
		<button class="opt" aria-pressed={opt.wbw} onclick={() => toggle('wbw')}>Per kata</button>
		<span class="fs">
			<button aria-label="Perkecil huruf Arab" onclick={() => resize(-3)}>A−</button>
			<button aria-label="Perbesar huruf Arab" onclick={() => resize(3)} class="big">A+</button>
		</span>
	</div>
</div>

<style>
	.bar {
		display: flex;
		align-items: center;
		gap: 8px;
		padding-top: 18px;
	}
	.back {
		width: 40px;
		height: 40px;
		flex: none;
		border-radius: 14px;
		display: grid;
		place-items: center;
		background: var(--card);
		box-shadow: var(--shadow);
		border: 1px solid var(--line);
	}
	.opts {
		display: flex;
		align-items: center;
		gap: 5px;
		flex: 1;
		min-width: 0;
		/* layar sangat sempit (320px): tombol bisa digeser, tidak merusak tata letak */
		overflow-x: auto;
		scrollbar-width: none;
	}
	.opt {
		height: 30px;
		padding: 0 9px;
		white-space: nowrap;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 700;
		color: var(--ink2);
		border: 1px solid var(--line-strong);
		transition: all 0.25s var(--ease);
	}
	.opt[aria-pressed='true'] {
		background: var(--navy);
		border-color: var(--navy);
		color: var(--on-navy);
	}
	.fs {
		margin-left: auto;
		display: inline-flex;
		gap: 2px;
	}
	.fs button {
		width: 27px;
		height: 30px;
		border-radius: 10px;
		font-weight: 800;
		font-size: 12px;
		color: var(--ink2);
	}
	.fs .big {
		font-size: 14px;
	}
</style>
