<script lang="ts">
	import { addDays, dateKey, formatTime, tzLabel } from '#lib/date.ts';
	import { PRAYERS, nextPrayer, type DayTimes, type PrayerKey } from '#lib/prayer.ts';
	import { settings, timesForDay, tracker, toast } from '#lib/state/app.svelte.ts';
	import { canCheck, isComplete, isUdzur, togglePrayer } from '#lib/tracker.ts';
	import Icon from './Icon.svelte';

	let { now, today, tomorrow }: { now: Date | null; today: DayTimes | null; tomorrow: DayTimes | null } = $props();

	/**
	 * Pemilih hari: 0 = hari ini, -1 = kemarin, dst. Tidak bisa maju melewati hari ini
	 * (salat yang belum terjadi di hari esok tidak dicatat). Mundur dibatasi satu tahun.
	 */
	const MAX_BACK = 365;
	let offset = $state(0);
	let dir = $state<1 | -1>(1);

	const todayKey = $derived(now ? dateKey(now) : '');
	const day = $derived(now ? addDays(new Date(now.toDateString()), offset) : null);
	const key = $derived(day ? dateKey(day) : '');
	const log = $derived(key ? (tracker.value.logs[key] ?? {}) : {});
	const udzur = $derived(key ? isUdzur(tracker.value, key, todayKey) : false);

	// Jadwal hari yang dipilih. Hari ini memakai jadwal yang sudah dihitung beranda.
	const times = $derived.by(() => {
		if (offset === 0 || !day) return today;
		return timesForDay(day, settings.value);
	});

	const fmtDay = new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long' });
	const label = $derived(offset === 0 ? 'Hari ini' : offset === -1 ? 'Kemarin' : day ? fmtDay.format(day) : '');
	const sub = $derived(offset >= -1 && day ? fmtDay.format(day) : `${-offset} hari lalu`);
	const done5 = $derived(PRAYERS.filter((p) => log[p.key]).length);

	// "Berikutnya" hanya untuk hari ini, dan hanya bila salat itu masih hari ini (lewat Isya = Subuh besok).
	const nextKey = $derived.by(() => {
		if (offset !== 0 || !now || !today || !tomorrow) return null;
		const n = nextPrayer(now, today, tomorrow);
		return n.at.toDateString() === now.toDateString() ? n.key : null;
	});

	function go(step: 1 | -1) {
		const to = offset + step;
		if (to > 0 || to < -MAX_BACK) return;
		dir = step;
		offset = to;
	}

	let burst = $state<PrayerKey | null>(null);

	// Salat yang sudah masuk waktunya bebas dicentang kapan saja (orang sering baru ingat mencatat
	// setelah salat, atau keesokan harinya). Yang belum masuk waktunya dikunci.
	const locked = (p: PrayerKey) => !canCheck(times?.[p], now, !!log[p]);

	function tap(p: PrayerKey) {
		if (!key) return;
		if (locked(p)) {
			const at = times?.[p];
			const name = PRAYERS.find((x) => x.key === p)!.name;
			toast.say(at ? `Waktu ${name} belum masuk. Masuk pukul ${formatTime(at)}.` : `Waktu ${name} belum masuk.`);
			return;
		}
		const was = isComplete(tracker.value.logs[key]);
		tracker.value = togglePrayer(tracker.value, key, p);
		if (tracker.value.logs[key]?.[p]) {
			burst = p;
			setTimeout(() => (burst = null), 650);
		}
		if (!was && isComplete(tracker.value.logs[key]))
			toast.say(offset === 0 ? 'Lima waktu lengkap hari ini. Streak bertambah.' : 'Lima waktu lengkap. Streak diperbarui.');
	}

	// Geser kiri/kanan di kartu untuk ganti hari (HP).
	let startX = 0;
	let startY = 0;
	const onStart = (e: TouchEvent) => {
		startX = e.touches[0].clientX;
		startY = e.touches[0].clientY;
	};
	const onEnd = (e: TouchEvent) => {
		const dx = e.changedTouches[0].clientX - startX;
		const dy = e.changedTouches[0].clientY - startY;
		if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) go(dx > 0 ? -1 : 1);
	};
</script>

<div class="card list" class:udzur data-tour="catatan" role="group" aria-label="Catatan salat per hari" ontouchstart={onStart} ontouchend={onEnd}>
	<div class="days">
		<button class="arrow press" aria-label="Hari sebelumnya" onclick={() => go(-1)} disabled={offset <= -MAX_BACK}>
			<Icon name="back" size={18} />
		</button>
		<div class="day" aria-live="polite">
			<div class="dl">{label}</div>
			<div class="ds">
				{#if offset !== 0}{sub}{:else}{day ? fmtDay.format(day) : ' '}{/if}
				<span class="dot"></span><span class="num">{done5}/5</span>
			</div>
		</div>
		<button class="arrow press" aria-label="Hari berikutnya" onclick={() => go(1)} disabled={offset >= 0}>
			<Icon name="chevron" size={18} />
		</button>
	</div>

	{#if udzur}
		<p class="udz">Hari udzur. Pencatatan dijeda dan streak kamu aman.</p>
	{/if}

	{#key key}
		<div class="rows" style:--from="{dir * 24}px">
			{#each PRAYERS as p (p.key)}
				{@const done = !!log[p.key]}
				{@const lock = now !== null && locked(p.key)}
				<button
					class="row"
					class:next={p.key === nextKey && !done}
					class:done
					class:lock
					aria-pressed={done}
					aria-disabled={lock}
					onclick={() => tap(p.key)}
				>
					<span class="txt">
						<span class="nm">{p.name}</span>
						<span class="tm num">{times ? `${formatTime(times[p.key])} ${now ? tzLabel(now) : ''}` : '--.--'}</span>
					</span>
					{#if done}<span class="tag">Sudah salat</span>{:else if p.key === nextKey}<span class="tag soon">Berikutnya</span>{/if}
					<span class="chk" aria-hidden="true">
						<Icon name="check" size={16} stroke={2.6} />
						{#if burst === p.key}
							<span class="burst">
								{#each Array(8) as _, i (i)}
									<i style:--x="{Math.cos((i * Math.PI) / 4) * 26}px" style:--y="{Math.sin((i * Math.PI) / 4) * 26}px"></i>
								{/each}
							</span>
						{/if}
					</span>
				</button>
			{/each}
		</div>
	{/key}

	{#if offset !== 0}
		<button class="back-today" onclick={() => ((dir = 1), (offset = 0))}>Kembali ke hari ini</button>
	{/if}
</div>

<style>
	.list {
		padding: 6px;
		overflow: hidden;
	}
	.days {
		display: flex;
		align-items: center;
		gap: 8px;
		padding: 6px 4px 10px;
		border-bottom: 1px solid var(--line);
		margin-bottom: 4px;
	}
	.arrow {
		width: 38px;
		height: 38px;
		flex: none;
		border-radius: 12px;
		display: grid;
		place-items: center;
		background: var(--sunk);
		color: var(--navy);
		transition: opacity 0.2s;
	}
	.arrow:disabled {
		opacity: 0.3;
		cursor: default;
	}
	.day {
		flex: 1;
		text-align: center;
		min-width: 0;
	}
	.dl {
		font-family: var(--f-disp);
		font-size: 17px;
		font-weight: 500;
		letter-spacing: -0.01em;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ds {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 6px;
		font-size: 11.5px;
		font-weight: 600;
		color: var(--ink2);
		margin-top: 1px;
	}
	.dot {
		width: 3px;
		height: 3px;
		border-radius: 50%;
		background: var(--ink3);
	}
	.udz {
		margin: 6px 8px 8px;
		padding: 10px 12px;
		border-radius: 12px;
		background: var(--peach-soft);
		color: var(--peach-ink);
		font-size: 12.5px;
		font-weight: 600;
	}
	.udzur .rows {
		opacity: 0.45;
		pointer-events: none;
	}
	.rows {
		animation: slide 0.32s var(--ease) both;
	}
	@keyframes slide {
		from {
			opacity: 0;
			transform: translateX(var(--from));
		}
	}
	.row {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 12px 10px;
		border-radius: 14px;
		text-align: left;
		transition: background 0.25s;
	}
	.row + .row {
		border-top: 1px dashed var(--line);
	}
	.row.next {
		background: var(--navy-soft);
		border-top-color: transparent;
	}
	.txt {
		flex: 1;
		display: flex;
		flex-direction: column;
	}
	.nm {
		font-weight: 700;
		font-size: 14.5px;
	}
	.tm {
		font-size: 12px;
		color: var(--ink2);
	}
	.tag {
		font-size: 11px;
		font-weight: 800;
		padding: 3px 8px;
		border-radius: 999px;
		background: var(--navy-soft);
		color: var(--navy);
		animation: pop 0.3s var(--ease);
	}
	.tag.soon {
		background: var(--card);
	}
	.chk {
		position: relative;
		width: 34px;
		height: 34px;
		flex: none;
		border-radius: 50%;
		border: 1.6px solid var(--line-strong);
		display: grid;
		place-items: center;
		color: transparent;
		transition: all 0.3s var(--ease);
	}
	/* Belum masuk waktu: lingkaran putus-putus dan redup, tanda belum bisa dicentang. */
	.lock .chk {
		border-style: dashed;
		opacity: 0.5;
	}
	.lock:not(.next) .nm {
		color: var(--ink2);
	}
	.done .chk {
		background: var(--navy);
		border: 1.6px solid var(--navy);
		color: var(--on-navy);
	}
	.burst {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}
	.burst i {
		position: absolute;
		left: 50%;
		top: 50%;
		width: 5px;
		height: 5px;
		margin: -2.5px;
		background: var(--peach);
		transform: rotate(45deg);
		animation: bst 0.6s var(--ease) forwards;
	}
	@keyframes bst {
		to {
			transform: translate(var(--x), var(--y)) rotate(45deg) scale(0.2);
			opacity: 0;
		}
	}
	.back-today {
		display: block;
		margin: 6px auto 6px;
		padding: 8px 14px;
		border-radius: 999px;
		font-size: 12px;
		font-weight: 800;
		color: var(--navy);
		background: var(--sunk);
	}
</style>
