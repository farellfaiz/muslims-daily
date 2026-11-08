<script lang="ts">
	import Heatmap from '#lib/components/Heatmap.svelte';
	import Flame from '#lib/components/Flame.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { PRAYERS } from '#lib/prayer.ts';
	import { clock, toast, tracker } from '#lib/state/app.svelte.ts';
	import { bestStreak, consistency, currentStreak, heatmap, toggleUdzur } from '#lib/tracker.ts';
	import { prayerName, tr } from '#lib/i18n.svelte.ts';

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

	// Konsistensi per salat disembunyikan secara bawaan; bar tumbuh dari nol saat dibuka.
	let showRates = $state(false);
	let grown = $state(false);
	$effect(() => {
		if (showRates && rates) requestAnimationFrame(() => requestAnimationFrame(() => (grown = true)));
		else grown = false;
	});

	function udzur() {
		if (!today) return;
		tracker.value = toggleUdzur(tracker.value, today);
		toast.say(
			tracker.value.udzurSince
				? tr('Mode udzur aktif. Streak dijeda.', 'Excused days on. Your streak is paused.')
				: tr('Mode udzur nonaktif.', 'Excused days off.')
		);
	}
</script>

<svelte:head><title>{tr('Tracker salat', 'Prayer tracker')} · Muslims Daily</title></svelte:head>

<header class="page-head">
	<div class="label">{tr('Tracker salat', 'Prayer tracker')}</div>
	<h1>{tr('Istiqamah kamu', 'Your consistency')}</h1>
</header>

<section class="card big rise" class:lit={streak > 0}>
	<div class="main">
		<!-- Api dan angka satu kelompok yang rapat; jarak ke teks tetap lega. -->
		<div class="count">
			<span class="flame"><Flame size={50} lit={streak > 0} /></span>
			<div class="n num disp">{streak}</div>
		</div>
		<div class="grow">
			<div class="t">{tr('hari berturut-turut', 'day streak')}</div>
			<div class="s">
				{empty
					? tr(
							'Catat salat di Beranda. Hari dengan lima waktu lengkap menambah streak.',
							'Log your prayers on Home. Every day with all five prayers adds to your streak.'
						)
					: tr('Lima waktu tercatat setiap hari.', 'All five prayers logged every day.')}
			</div>
		</div>
	</div>
	<div class="best">
		<span class="medal" aria-hidden="true"><Icon name="trophy" size={16} /></span>
		<span class="bl">{tr('Rekor terbaik', 'Best streak')}</span>
		<span class="badge num" class:record={best > 0 && streak >= best}>
			{best}
			{tr('hari', best === 1 ? 'day' : 'days')}{best > 0 && streak >= best ? tr(' · sedang berjalan', ' · ongoing') : ''}
		</span>
	</div>
</section>

<div class="sec-h">
	<h2>{tr('Jejak 6 bulan', 'Last 6 months')}</h2>
	<span class="label">{tr('Salat per hari', 'Prayers per day')}</span>
</div>
<section class="card heat-card">
	{#if cols.length}
		<Heatmap {cols} />
	{/if}
</section>

<button class="sec-h fold" aria-expanded={showRates} aria-controls="rates" onclick={() => (showRates = !showRates)}>
	<h2>{tr('Konsistensi per salat', 'Consistency by prayer')}</h2>
	<span class="label">{tr('30 hari', '30 days')} <span class="chev"><Icon name="chevron" size={14} stroke={2.2} /></span></span>
</button>
{#if showRates}
	<section class="card bars" id="rates">
		{#each PRAYERS as p (p.key)}
			{@const v = rates?.[p.key] ?? null}
			<div class="b">
				<span>{prayerName(p.key)}</span>
				<span class="t"><span style:width="{grown && v !== null ? v : 0}%"></span></span>
				<span class="num v">{v === null ? '-' : `${v}%`}</span>
			</div>
		{/each}
	</section>
{/if}

<section class="card udz">
	<div class="txt">
		<div class="t">{tr('Mode udzur', 'Excused days')}</div>
		<div class="s">
			{tr(
				'Jeda pencatatan saat haid atau nifas. Streak tidak putus.',
				"Pause logging during your period or postpartum bleeding. Your streak won't break."
			)}
		</div>
	</div>
	<button
		class="switch"
		class:on={udzurOn}
		role="switch"
		aria-checked={udzurOn}
		aria-label={tr('Mode udzur', 'Excused days')}
		onclick={udzur}
	></button>
</section>

<style>
	.big {
		padding: 18px 18px 14px;
	}
	.main {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.count {
		display: flex;
		align-items: center;
		gap: 1px;
		flex: none;
	}
	/* Api setinggi dan sewarna angka streak, bergoyang pelan saat streak berjalan. */
	.flame {
		color: var(--navy);
		margin-top: -4px;
	}
	.lit .flame :global(svg) {
		transform-origin: 50% 90%;
		animation: flicker 2.4s ease-in-out infinite;
	}
	@keyframes flicker {
		0%,
		100% {
			transform: scale(1) rotate(0deg);
		}
		30% {
			transform: scale(1.06, 0.97) rotate(-2deg);
		}
		60% {
			transform: scale(0.97, 1.04) rotate(1.5deg);
		}
	}
	.big .n {
		font-weight: 400;
		font-size: 58px;
		line-height: 0.9;
		color: var(--navy);
		min-width: 0.6em;
	}
	.best {
		display: flex;
		align-items: center;
		gap: 10px;
		margin-top: 14px;
		padding-top: 12px;
		border-top: 1px dashed var(--line);
	}
	.medal {
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 10px;
		display: grid;
		place-items: center;
		background: var(--gold-soft);
		color: var(--gold);
	}
	.bl {
		flex: 1;
		font-size: 13px;
		font-weight: 700;
		color: var(--ink2);
	}
	.badge {
		font-size: 12px;
		font-weight: 800;
		padding: 5px 11px;
		border-radius: 999px;
		background: var(--navy-soft);
		color: var(--navy);
		white-space: nowrap;
	}
	.badge.record {
		background: var(--gold-soft);
		color: var(--gold-ink);
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
	.fold {
		width: calc(100% - 4px);
		text-align: left;
	}
	.fold .label {
		display: inline-flex;
		align-items: center;
		gap: 4px;
	}
	.chev {
		display: inline-grid;
		transition: transform 0.3s var(--ease);
	}
	.fold[aria-expanded='true'] .chev {
		transform: rotate(90deg);
	}
	.bars {
		padding: 10px 16px;
		animation: rise 0.3s var(--ease) both;
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
		background: var(--knob);
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
