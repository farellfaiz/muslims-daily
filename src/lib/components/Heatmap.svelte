<script lang="ts">
	import { formatLong, formatMonthShort } from '#lib/date.ts';
	import { PRAYERS } from '#lib/prayer.ts';
	import type { HeatCell } from '#lib/tracker.ts';
	import Icon from './Icon.svelte';

	let { cols }: { cols: HeatCell[][] } = $props();

	// Kotak terpilih (bawaan: hari ini). Dicari ulang dari `cols` supaya ikut berubah saat catatan diperbarui.
	let pickedKey = $state<string | null>(null);
	const cells = $derived(cols.flat().filter((c) => !c.future));
	const picked = $derived(cells.find((c) => c.key === pickedKey) ?? cells.at(-1) ?? null);

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
					onclick={() => (pickedKey = c.key)}
				></button>
			{/if}
		{/each}
	{/each}
</div>
<div class="foot">
	<div class="legend">Sedikit <i class="l0"></i><i class="l1"></i><i class="l2"></i><i class="l3"></i><i class="l4"></i><i class="l5"></i> Lengkap</div>
	<div class="legend"><i class="lh"></i> Udzur</div>
</div>
{#if picked}
	<div class="tip" aria-live="polite">
		<div class="th">
			<b>{formatLong(picked.date)}</b>
			{#if picked.udzur}
				<span class="pill udz">Udzur</span>
			{:else}
				<span class="pill num" class:full={picked.value === 5}>{picked.value}/5</span>
			{/if}
		</div>
		<div class="five" class:muted={picked.udzur}>
			{#each PRAYERS as p (p.key)}
				{@const done = !!picked.log[p.key]}
				<span class="pr" class:done>
					<span class="dot"><Icon name={done ? 'check' : 'x'} size={13} stroke={done ? 2.8 : 2} /></span>
					<span class="pn">{p.name}</span>
				</span>
			{/each}
		</div>
	</div>
{/if}

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
		padding: 12px;
		border-radius: 14px;
		background: var(--sunk);
		font-size: 12.5px;
	}
	.th {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 8px;
		margin-bottom: 10px;
	}
	.pill {
		font-size: 11px;
		font-weight: 800;
		padding: 3px 9px;
		border-radius: 999px;
		background: var(--card);
		color: var(--ink2);
	}
	.pill.full {
		background: var(--navy);
		color: #fff;
	}
	.pill.udz {
		background: var(--peach-soft);
		color: var(--peach-ink);
	}
	/* Lima indikator salat: bulatan centang navy bila sudah, silang tipis bila belum. */
	.five {
		display: grid;
		grid-template-columns: repeat(5, 1fr);
		gap: 4px;
	}
	.five.muted {
		opacity: 0.45;
	}
	.pr {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 5px;
	}
	.pr .dot {
		width: 30px;
		height: 30px;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: var(--card);
		border: 1.5px dashed var(--line-strong);
		color: var(--ink3);
		transition: all 0.25s var(--ease);
	}
	.pr.done .dot {
		background: var(--navy);
		border: 1.5px solid var(--navy);
		color: #fff;
		animation: pop 0.3s var(--ease);
	}
	.pn {
		font-size: 10.5px;
		font-weight: 700;
		color: var(--ink3);
	}
	.pr.done .pn {
		color: var(--ink);
	}
</style>
