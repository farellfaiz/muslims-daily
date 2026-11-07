<script lang="ts">
	import { formatLong, formatMonthShort } from '#lib/date.ts';
	import type { HeatCell } from '#lib/tracker.ts';

	let { cols }: { cols: HeatCell[][] } = $props();
	let picked = $state<HeatCell | null>(null);

	// Label bulan muncul di kolom pertama tiap bulan baru.
	const months = $derived(
		cols.map((c, i) => {
			const m = c[0].date.getMonth();
			return i === 0 || cols[i - 1][0].date.getMonth() !== m ? formatMonthShort(c[0].date) : '';
		})
	);

	const level = (c: HeatCell) => (c.udzur ? 'lh' : `l${c.value}`);
	const title = (c: HeatCell) =>
		c.udzur ? `${formatLong(c.date)}: udzur` : `${formatLong(c.date)}: ${c.value} dari 5 salat`;
</script>

<div class="months" style:grid-template-columns="repeat({cols.length},1fr)" aria-hidden="true">
	{#each months as m, i (i)}<span>{m}</span>{/each}
</div>
<div class="heat" style:grid-template-columns="repeat({cols.length},1fr)" role="grid" aria-label="Jejak salat per hari">
	{#each cols as col, w (w)}
		{#each col as c (c.key)}
			{#if c.future}
				<i class="future"></i>
			{:else}
				<button
					class={level(c)}
					class:on={picked?.key === c.key}
					style:animation-delay="{w * 18}ms"
					title={title(c)}
					aria-label={title(c)}
					onclick={() => (picked = c)}
				></button>
			{/if}
		{/each}
	{/each}
</div>
<div class="foot">
	<div class="legend">Sedikit <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><i class="l5"></i> Lengkap</div>
	<div class="legend"><i class="lh"></i> Udzur</div>
</div>
<div class="tip" aria-live="polite">
	{#if picked}
		<b>{formatLong(picked.date)}</b><br />
		{#if picked.udzur}
			Mode udzur aktif, tidak dihitung.
		{:else}
			{picked.value === 5 ? 'Lima waktu lengkap.' : `${picked.value} dari 5 salat tercatat.`}
		{/if}
	{:else}
		Ketuk satu kotak untuk melihat catatan hari itu.
	{/if}
</div>

<style>
	.months {
		display: grid;
		font-size: 10px;
		color: var(--ink3);
		font-weight: 700;
		margin-bottom: 6px;
		white-space: nowrap;
	}
	.heat {
		display: grid;
		grid-auto-flow: column;
		grid-template-rows: repeat(7, 1fr);
		gap: 3px;
	}
	.heat > * {
		width: 100%;
		aspect-ratio: 1;
		border-radius: 3px;
	}
	.heat button {
		opacity: 0;
		animation: pop 0.4s var(--ease) forwards;
	}
	.heat button.on,
	.heat button:hover {
		outline: 1.5px solid var(--ink);
		outline-offset: 1px;
	}
	.l0 {
		background: #e9eef3;
	}
	.l1 {
		background: #cfe0f0;
	}
	.l2 {
		background: #a6c4e0;
	}
	.l3 {
		background: #7399be;
	}
	.l4 {
		background: #4d7097;
	}
	.l5 {
		background: #2b4664;
	}
	.lh {
		background: repeating-linear-gradient(45deg, #f3d3c2 0 3px, var(--peach-soft) 3px 6px);
	}
	.foot {
		display: flex;
		justify-content: space-between;
		align-items: center;
		margin-top: 12px;
	}
	.legend {
		display: flex;
		align-items: center;
		gap: 4px;
		font-size: 10.5px;
		color: var(--ink2);
		font-weight: 600;
	}
	.legend i {
		width: 11px;
		height: 11px;
		border-radius: 3px;
		display: inline-block;
	}
	.tip {
		margin-top: 12px;
		padding: 10px 12px;
		border-radius: 12px;
		background: var(--sunk);
		font-size: 12.5px;
		min-height: 42px;
		line-height: 1.5;
	}
</style>
