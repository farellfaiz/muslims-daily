<script lang="ts">
	import Icon from './Icon.svelte';
	import {
		BackupError,
		backupFileName,
		makeBackup,
		mergeTracker,
		parseBackup,
		trackerSummary,
		type ParsedBackup
	} from '#lib/backup.ts';
	import { formatFull, fromKey } from '#lib/date.ts';
	import { isEn, lang, locale, tr } from '#lib/i18n.svelte.ts';
	import { adzanPrefs } from '#lib/state/adzan.svelte.ts';
	import { merge as mergeKoleksi } from '#lib/koleksi.ts';
	import { backupMeta, doaPrefs, dzikirPrefs, quranLast, reading, settings, theme, toast, tracker } from '#lib/state/app.svelte.ts';

	const sum = $derived(trackerSummary(tracker.value));
	const favs = $derived(doaPrefs.value.favs.length);
	const last = $derived(backupMeta.value.lastAt ? new Date(backupMeta.value.lastAt) : null);

	let input: HTMLInputElement;
	let pending = $state<ParsedBackup | null>(null);
	const pSum = $derived(pending ? trackerSummary(pending.tracker) : null);

	function save() {
		const now = new Date();
		const data = makeBackup(
			{
				settings: settings.value,
				tracker: tracker.value,
				doa: doaPrefs.value,
				reading: reading.value,
				prefs: {
					quran: quranLast.value,
					dzikir: dzikirPrefs.value,
					adzan: adzanPrefs.value,
					lang: lang.value.code,
					theme: theme.value.mode
				}
			},
			now
		);
		const url = URL.createObjectURL(new Blob([JSON.stringify(data, null, 1)], { type: 'application/json' }));
		const a = document.createElement('a');
		a.href = url;
		a.download = backupFileName(now);
		document.body.append(a);
		a.click();
		a.remove();
		setTimeout(() => URL.revokeObjectURL(url), 1000);
		backupMeta.value = { lastAt: now.toISOString() };
		toast.say(tr('Cadangan disimpan', 'Backup saved'));
	}

	async function pick(e: Event & { currentTarget: HTMLInputElement }) {
		const file = e.currentTarget.files?.[0];
		e.currentTarget.value = ''; // supaya file yang sama bisa dipilih lagi
		if (!file) return;
		if (file.size > 5_000_000) return toast.say(tr('File terlalu besar untuk cadangan', 'This file is too big to be a backup'));
		try {
			pending = parseBackup(await file.text());
		} catch (err) {
			toast.say(err instanceof BackupError ? (isEn() ? err.en : err.message) : tr('File tidak bisa dibaca', "Couldn't read the file"));
		}
	}

	function restore() {
		if (!pending) return;
		const p = pending;
		tracker.value = mergeTracker(tracker.value, p.tracker);
		if (p.settings) settings.value = p.settings;
		if (p.reading) reading.value = p.reading;
		if (p.doa) {
			const cur = doaPrefs.value;
			doaPrefs.value = { ...cur, view: p.doa.view, sort: p.doa.sort, favs: [...new Set([...cur.favs, ...p.doa.favs])], koleksi: mergeKoleksi(cur.koleksi, p.doa.koleksi) };
		}
		const x = p.prefs;
		if (x.quran) quranLast.value = x.quran;
		if (x.dzikir) dzikirPrefs.value = x.dzikir;
		if (x.adzan) adzanPrefs.value = x.adzan;
		if (x.lang) lang.value = { code: x.lang };
		if (x.theme) theme.value = { mode: x.theme };
		pending = null;
		toast.say(tr('Data dipulihkan', 'Data restored'));
	}
</script>

<section class="card group">
	<div class="stats">
		<div class="stat">
			<span class="n num">{sum.days}</span><span class="u">{tr('hari tercatat', sum.days === 1 ? 'day logged' : 'days logged')}</span>
		</div>
		<div class="stat">
			<span class="n num">{sum.prayers}</span><span class="u">{tr('salat', sum.prayers === 1 ? 'prayer' : 'prayers')}</span>
		</div>
		<div class="stat">
			<span class="n num">{favs}</span><span class="u">{tr('doa favorit', favs === 1 ? 'favorite dua' : 'favorite duas')}</span>
		</div>
	</div>

	<div class="last" class:warn={!last && sum.days > 0}>
		<span class="dot"></span>
		{#if last}{tr('Terakhir dicadangkan', 'Last backed up')} {formatFull(last, locale())}{:else}{tr('Belum pernah dicadangkan', 'Never backed up')}{/if}
	</div>

	{#if pending && pSum}
		<div class="confirm" role="dialog" aria-label={tr('Pulihkan cadangan', 'Restore backup')}>
			<div class="ct">
				{pending.exportedAt
					? tr(`Cadangan ${formatFull(pending.exportedAt, locale())}`, `Backup from ${formatFull(pending.exportedAt, locale())}`)
					: tr('Cadangan tanpa tanggal', 'Undated backup')}
			</div>
			<div class="cs">
				<span class="num">{pSum.days}</span>
				{tr('hari', pSum.days === 1 ? 'day' : 'days')}, <span class="num">{pSum.prayers}</span>
				{tr('salat', pSum.prayers === 1 ? 'prayer' : 'prayers')}{#if pSum.first}, {tr('sejak', 'since')}
					{formatFull(fromKey(pSum.first), locale())}{/if}
			</div>
			<ul>
				<li>
					<Icon name="check" size={15} />{tr(
						'Catatan salat digabung, tidak ada centang yang hilang',
						'Prayer logs are merged, so no check marks are lost'
					)}
				</li>
				{#if Object.keys(pending.prefs).length}
					<li>
						<Icon name="check" size={15} />{tr(
							"Posisi baca Al-Qur'an, pengaturan dzikir dan adzan, bahasa, serta tema ikut dipulihkan",
							'Quran reading position, dhikr and adhan settings, language, and theme are restored too'
						)}
					</li>
				{/if}
				{#if pending.settings}
					<li><Icon name="pin" size={15} />{tr('Lokasi diganti ke', 'Location changes to')} {pending.settings.place === 'gps' ? tr('Lokasi saya', 'My location') : pending.settings.label}</li>
				{/if}
			</ul>
			<div class="row">
				<button class="btn ghost press" onclick={() => (pending = null)}>{tr('Batal', 'Cancel')}</button>
				<button class="btn press" onclick={restore}>{tr('Pulihkan', 'Restore')}</button>
			</div>
		</div>
	{:else}
		<div class="row">
			<button class="btn press" onclick={save}><Icon name="download" size={18} />{tr('Simpan', 'Save')}</button>
			<button class="btn ghost press" onclick={() => input.click()}><Icon name="restore" size={18} />{tr('Pulihkan', 'Restore')}</button>
		</div>
	{/if}
	<input bind:this={input} type="file" accept="application/json,.json" onchange={pick} hidden />

	<p class="hint">
		{tr(
			'Data hanya ada di HP ini. Simpan file cadangan ke Drive atau kirim ke diri sendiri supaya riwayat tidak hilang saat ganti HP.',
			"Your data only lives on this phone. Save the backup file to Drive or send it to yourself so your history isn't lost when you switch phones."
		)}
	</p>
</section>

<style>
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
	.stats {
		display: grid;
		grid-template-columns: repeat(3, 1fr);
		gap: 8px;
		margin: 12px 0 10px;
	}
	.stat {
		background: var(--sunk);
		border-radius: 14px;
		padding: 10px 12px;
		display: flex;
		flex-direction: column;
		gap: 2px;
	}
	.n {
		font-family: var(--f-disp);
		font-size: 22px;
		font-weight: 600;
		color: var(--navy);
		line-height: 1.1;
	}
	.u {
		font-size: 11.5px;
		color: var(--ink2);
	}
	.last {
		display: flex;
		align-items: center;
		gap: 8px;
		font-size: 12.5px;
		color: var(--ink2);
		margin-bottom: 12px;
	}
	.dot {
		width: 7px;
		height: 7px;
		border-radius: 50%;
		background: var(--navy);
		opacity: 0.5;
		flex: none;
	}
	.last.warn {
		color: var(--peach-ink);
	}
	.last.warn .dot {
		background: var(--peach);
		opacity: 1;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	.btn {
		flex: 1;
		height: 46px;
		border-radius: 14px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
		font-size: 14px;
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
	}
	.btn.ghost {
		background: transparent;
		color: var(--navy);
		border: 1.4px solid var(--line-strong);
	}
	.confirm {
		border: 1.4px solid var(--navy);
		background: var(--navy-soft);
		border-radius: 16px;
		padding: 14px;
		animation: rise 0.28s var(--ease);
	}
	.ct {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	.cs {
		font-size: 12.5px;
		color: var(--ink2);
		margin-top: 2px;
	}
	ul {
		list-style: none;
		padding: 0;
		margin: 10px 0 12px;
		display: grid;
		gap: 6px;
	}
	li {
		display: flex;
		gap: 8px;
		align-items: center;
		font-size: 12.5px;
		color: var(--ink);
	}
	li :global(svg) {
		color: var(--navy);
		flex: none;
	}
	.confirm .btn.ghost {
		background: var(--card);
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 12px 0 0;
		line-height: 1.5;
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(6px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.confirm {
			animation: none;
		}
	}
</style>
