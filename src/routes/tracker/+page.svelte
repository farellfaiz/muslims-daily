<script lang="ts">
	import Heatmap from '#lib/components/Heatmap.svelte';
	import { PRAYERS } from '#lib/prayer.ts';
	import { clock, toast, tracker } from '#lib/state/app.svelte.ts';
	import { bestStreak, consistency, currentStreak, heatmap, toggleUdzur } from '#lib/tracker.ts';

	const WEEKS = 26;

	// Statistik dihitung per hari, bukan per detik.
	const day = $derived(clock.now?.toDateString());
	const today = $derived(day ? new Date(day) : null);
	const streak = $derived(today ? currentStreak(tracker.value, today) : 0);
	const best = $derived(today ? bestStreak(tracker.value, today) : 0);
	const cols = $derived(today ? heatmap(tracker.value, today, WEEKS) : []);
	const rates = $derived(today ? consistency(tracker.value, today) : null);
	const empty = $derived(Object.keys(tracker.value.logs).length === 0);
	const udzurOn = $derived(tracker.value.udzurSince !== null);

	// Bar persentase tumbuh dari nol saat halaman dibuka.
	let grown = $state(false);
	$effect(() => {
		if (rates) requestAnimationFrame(() => (grown = true));
	});

	function udzur() {
		if (!today) return;
		tracker.value = toggleUdzur(tracker.value, today);
		toast.say(tracker.value.udzurSince ? 'Mode udzur aktif. Streak dijeda.' : 'Mode udzur nonaktif.');
	}
</script>

<svelte:head><title>Tracker salat · Muslims Daily</title></svelte:head>

<header class="page-head">
	<div class="label">Tracker salat</div>
	<h1>Istiqamah kamu</h1>
</header>

<section class="card big rise">
	<div class="n num disp">{streak}</div>
	<div>
		<div class="t">hari berturut-turut</div>
		<div class="s">
			{#if empty}
				Catat salat di Beranda. Hari dengan lima waktu lengkap menambah streak.
			{:else}
				Lima waktu tercatat setiap hari. Rekor terbaik <b class="num">{best}</b> hari.
			{/if}
		</div>
	</div>
</section>

<div class="sec-h"><h2>Jejak 6 bulan</h2><span class="label">Salat per hari</span></div>
<section class="card heat-card">
	{#if cols.length}
		<Heatmap {cols} />
	{/if}
</section>

<div class="sec-h"><h2>Konsistensi per salat</h2><span class="label">30 hari</span></div>
<section class="card bars">
	{#each PRAYERS as p (p.key)}
		{@const v = rates?.[p.key] ?? null}
		<div class="b">
			<span>{p.name}</span>
			<span class="t"><span style:width="{grown && v !== null ? v : 0}%"></span></span>
			<span class="num v">{v === null ? '-' : `${v}%`}</span>
		</div>
	{/each}
</section>

<section class="card udz">
	<div class="txt">
		<div class="t">Mode udzur</div>
		<div class="s">Jeda pencatatan saat haid atau nifas. Streak tidak putus.</div>
	</div>
	<button class="switch" class:on={udzurOn} role="switch" aria-checked={udzurOn} aria-label="Mode udzur" onclick={udzur}></button>
</section>

<style>
	.big {
		display: flex;
		align-items: center;
		gap: 16px;
		padding: 20px;
	}
	.big .n {
		font-weight: 400;
		font-size: 64px;
		line-height: 0.9;
		color: var(--navy);
		min-width: 0.6em;
	}
	.t {
		font-weight: 800;
		font-size: 15px;
	}
	.s {
		font-size: 12.5px;
		color: var(--ink2);
		margin-top: 3px;
		line-height: 1.5;
	}
	.heat-card {
		padding: 16px 14px 14px;
		overflow: hidden;
	}
	.bars {
		padding: 10px 16px;
	}
	.b {
		display: grid;
		grid-template-columns: 62px 1fr 40px;
		align-items: center;
		gap: 10px;
		font-size: 12.5px;
		font-weight: 700;
		padding: 7px 0;
	}
	.b .t {
		height: 8px;
		border-radius: 99px;
		background: var(--sunk);
		overflow: hidden;
	}
	.b .t span {
		display: block;
		height: 100%;
		border-radius: 99px;
		background: linear-gradient(90deg, var(--navy-2), var(--navy));
		transition: width 1s var(--ease);
	}
	.v {
		text-align: right;
	}
	.udz {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 16px;
		margin-top: 12px;
	}
	.udz .txt {
		flex: 1;
	}
	.udz .t {
		font-size: 14px;
	}
	.switch {
		width: 46px;
		height: 28px;
		border-radius: 99px;
		background: var(--sunk);
		position: relative;
		flex: none;
		transition: background 0.25s;
	}
	.switch::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 22px;
		height: 22px;
		border-radius: 50%;
		background: #fff;
		box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
		transition: transform 0.25s var(--ease);
	}
	.switch.on {
		background: var(--peach);
	}
	.switch.on::after {
		transform: translateX(18px);
	}
</style>
