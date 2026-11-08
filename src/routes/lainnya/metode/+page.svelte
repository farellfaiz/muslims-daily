<script lang="ts">
	import SubPage from '#lib/components/SubPage.svelte';
	import { isEn, tr } from '#lib/i18n.svelte.ts';
	import { METHODS, type MadhabKey, type MethodKey } from '#lib/prayer.ts';
	import { settings } from '#lib/state/app.svelte.ts';

	const s = $derived(settings.value);
	const setMethod = (m: MethodKey) => (settings.value = { ...s, method: m });
	const setMadhab = (m: MadhabKey) => (settings.value = { ...s, madhab: m });
</script>

<SubPage
	title={tr('Metode perhitungan', 'Calculation method')}
	sub={tr(
		'Sudut matahari yang dipakai menghitung Subuh dan Isya, serta cara menghitung Ashar.',
		'The sun angles used for Fajr and Isha, and how Asr is calculated.'
	)}
>
<section class="card group">
	<div class="label">{tr('Metode', 'Method')}</div>
	<div class="opts">
		{#each METHODS as m (m.key)}
			<button class="opt" aria-pressed={s.method === m.key} onclick={() => setMethod(m.key)}>
				<span class="radio"></span>
				<span class="grow"><span class="v">{m.name}</span><span class="sub">{isEn() ? m.noteEn : m.note}</span></span>
			</button>
		{/each}
	</div>
	<div class="label mt">{tr('Waktu Ashar', 'Asr time')}</div>
	<div class="seg wide" role="group" aria-label={tr('Mazhab untuk waktu Ashar', 'School of thought for Asr')}>
		<button aria-pressed={s.madhab === 'syafii'} onclick={() => setMadhab('syafii')}>Syafi'i</button>
		<button aria-pressed={s.madhab === 'hanafi'} onclick={() => setMadhab('hanafi')}>Hanafi</button>
	</div>
	<p class="hint">
		{tr(
			"Pilihan Syafi'i juga sesuai untuk Maliki dan Hanbali. Hanafi membuat Ashar lebih lambat.",
			"The Syafi'i option also fits Maliki and Hanbali. Hanafi makes Asr later."
		)}
	</p>
</section>
</SubPage>

<style>
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.v {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	.sub {
		display: block;
		font-size: 12px;
		color: var(--ink2);
		margin-top: 2px;
		line-height: 1.5;
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 12px 0 0;
		line-height: 1.5;
	}
	.opts {
		display: grid;
		gap: 6px;
		margin-top: 10px;
	}
	.opt {
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 10px 12px;
		border-radius: 12px;
		text-align: left;
		border: 1px solid var(--line);
		transition: all 0.2s var(--ease);
	}
	.opt[aria-pressed='true'] {
		border-color: var(--navy);
		background: var(--navy-soft);
	}
	.radio {
		width: 18px;
		height: 18px;
		border-radius: 50%;
		border: 1.6px solid var(--line-strong);
		flex: none;
		display: grid;
		place-items: center;
	}
	.opt[aria-pressed='true'] .radio {
		border-color: var(--navy);
	}
	.opt[aria-pressed='true'] .radio::after {
		content: '';
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--navy);
	}
	.mt {
		margin-top: 16px;
	}
	.wide {
		display: flex;
		width: 100%;
		margin-top: 8px;
	}
	.wide button {
		flex: 1;
	}
</style>
