<script lang="ts">
	import type { Word } from '#lib/perKata.ts';

	/** Teks Arab per kata: kata Arab, transliterasi (opsional), dan artinya. Dibaca kanan ke kiri. */
	let { words, lat = true, size = 30 }: { words: Word[]; lat?: boolean; size?: number } = $props();
</script>

<div class="words" lang="ar" style:--arsize="{size}px">
	{#each words as w, k (k)}
		<span class="w">
			<span class="wa">{w[0]}</span>
			{#if lat && w[1]}<span class="wl" lang="id">{w[1]}</span>{/if}
			<span class="wt" lang="id">{w[2]}</span>
		</span>
	{/each}
</div>

<style>
	.words {
		display: flex;
		flex-wrap: wrap;
		direction: rtl;
		gap: 6px;
		margin-top: 12px;
	}
	.w {
		direction: ltr;
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		padding: 8px 9px 7px;
		border-radius: 12px;
		background: var(--paper);
		border: 1px solid var(--line);
		min-width: 64px;
		flex: 1 1 auto;
		max-width: 100%;
	}
	.wa {
		font-family: var(--f-ar);
		font-size: calc(var(--arsize) * 0.78);
		line-height: 1.6;
		direction: rtl;
	}
	.wl {
		font-size: 11px;
		font-style: italic;
		color: var(--navy);
		margin-top: 1px;
	}
	.wt {
		font-size: 11px;
		color: var(--ink2);
		margin-top: 3px;
		font-weight: 600;
		line-height: 1.35;
	}
</style>
