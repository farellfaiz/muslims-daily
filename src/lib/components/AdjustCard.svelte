<script lang="ts">
	import Icon from './Icon.svelte';
	import { formatTime } from '#lib/date.ts';
	import { ADJUST_LIMIT, IMSAK_OPTIONS, PRAYERS, type PrayerKey } from '#lib/prayer.ts';
	import { clock, settings, timesForDay } from '#lib/state/app.svelte.ts';

	const s = $derived(settings.value);

	// Jam hari ini sesudah koreksi, supaya bisa langsung dicocokkan dengan jadwal masjid.
	const day = $derived(clock.now?.toDateString());
	const times = $derived(day ? timesForDay(new Date(day), s) : null);

	const changed = $derived(PRAYERS.filter((p) => s.adjust[p.key]));

	function fmt(v: number) {
		return `${v > 0 ? '+' : '−'}${Math.abs(v)}`;
	}

	function step(k: PrayerKey, d: 1 | -1) {
		const v = Math.max(-ADJUST_LIMIT, Math.min(ADJUST_LIMIT, (s.adjust[k] ?? 0) + d));
		const adjust = { ...s.adjust };
		if (v) adjust[k] = v;
		else delete adjust[k];
		settings.value = { ...s, adjust };
	}

	const reset = () => (settings.value = { ...s, adjust: {} });
	const setImsak = (m: number) => (settings.value = { ...s, imsak: m });
</script>

<section class="card group">
	<div class="label">Per salat, hari ini</div>
	{#each PRAYERS as p (p.key)}
		{@const v = s.adjust[p.key] ?? 0}
		<div class="row">
			<div class="grow">
				<div class="v">{p.name}</div>
				<div class="t num">{times ? formatTime(times[p.key]) : '--.--'}</div>
			</div>
			<div class="stepper">
				<button aria-label="{p.name} 1 menit lebih awal" disabled={v <= -ADJUST_LIMIT} onclick={() => step(p.key, -1)}>
					<Icon name="minus" size={16} stroke={2.2} />
				</button>
				<span class="num val" class:on={v !== 0}>{v === 0 ? '0' : fmt(v)}</span>
				<button aria-label="{p.name} 1 menit lebih lambat" disabled={v >= ADJUST_LIMIT} onclick={() => step(p.key, 1)}>
					<Icon name="plus" size={16} stroke={2.2} />
				</button>
			</div>
		</div>
	{/each}
	{#if changed.length}
		<button class="reset press" onclick={reset}>Kembalikan semua ke 0</button>
	{/if}
</section>

<section class="card group">
	<div class="label">Imsak</div>
	<div class="seg wide" role="group" aria-label="Menit imsak sebelum Subuh">
		{#each IMSAK_OPTIONS as m (m)}
			<button aria-pressed={s.imsak === m} onclick={() => setImsak(m)}>{m} menit</button>
		{/each}
	</div>
	<p class="hint">Jarak imsak sebelum Subuh. Kebanyakan jadwal imsakiyah di Indonesia memakai 10 menit.</p>
</section>

<style>
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 9px 0;
		border-bottom: 1px solid var(--line);
	}
	.row:last-of-type {
		border-bottom: 0;
	}
	.v {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	.t {
		font-size: 12px;
		color: var(--ink2);
		margin-top: 1px;
	}
	.stepper {
		display: flex;
		align-items: center;
		background: var(--sunk);
		border-radius: 12px;
		padding: 3px;
	}
	.stepper button {
		width: 34px;
		height: 32px;
		border-radius: 9px;
		display: grid;
		place-items: center;
		color: var(--navy);
		transition: background 0.2s var(--ease);
	}
	.stepper button:active:not(:disabled) {
		background: var(--card);
	}
	.stepper button:disabled {
		opacity: 0.35;
	}
	.val {
		min-width: 36px;
		text-align: center;
		font-size: 13px;
		font-weight: 700;
		color: var(--ink3);
	}
	.val.on {
		color: var(--navy);
	}
	.reset {
		margin-top: 8px;
		font-size: 12.5px;
		font-weight: 700;
		color: var(--peach-ink);
	}
	.wide {
		display: flex;
		width: 100%;
		margin-top: 8px;
	}
	.wide button {
		flex: 1;
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 12px 0 0;
		line-height: 1.5;
	}
</style>
