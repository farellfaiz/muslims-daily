<script lang="ts">
	import Icon from '#lib/components/Icon.svelte';
	import SubPage from '#lib/components/SubPage.svelte';
	import { BEFORE_OPTIONS, nextAlert } from '#lib/adzan.ts';
	import { formatTime, tzLabel } from '#lib/date.ts';
	import { prayerName, tr } from '#lib/i18n.svelte.ts';
	import { PRAYERS } from '#lib/prayer.ts';
	import { adzan } from '#lib/state/adzan.svelte.ts';
	import { clock, schedule } from '#lib/state/app.svelte.ts';
	import { install } from '#lib/state/install.svelte.ts';

	const prefs = $derived(adzan.prefs);
	const times = $derived(clock.now ? schedule(clock.now) : null);
	const next = $derived(clock.now && times && adzan.active ? nextAlert(clock.now, times.today, times.tomorrow, prefs) : null);
	const onCount = $derived(PRAYERS.filter((p) => prefs.on[p.key]).length);

	function master() {
		if (adzan.active) adzan.disable();
		else void adzan.enable();
	}
</script>

<SubPage
	title={tr('Notifikasi adzan', 'Adhan notifications')}
	sub={tr(
		'Pemberitahuan saat waktu salat masuk. Atur sendiri waktu mana yang ingin diingatkan.',
		'A heads-up when each prayer time begins. Choose which prayers you want reminders for.'
	)}
>
	{#if !adzan.ready}
		<section class="card group"><p class="hint top">{tr('Memuat…', 'Loading…')}</p></section>
	{:else if adzan.support === 'ios-install'}
		<section class="card group warn-card">
			<div class="v">{tr('Pasang aplikasinya dulu', 'Install the app first')}</div>
			<p class="sub">
				{tr(
					'Di iPhone dan iPad, notifikasi hanya bisa untuk aplikasi yang sudah dipasang di layar utama. Pasang dulu, lalu buka Muslims Daily dari layar utama dan kembali ke halaman ini.',
					'On iPhone and iPad, notifications only work for apps installed on the home screen. Install it first, then open Muslims Daily from your home screen and come back to this page.'
				)}
			</p>
			<button class="cta press" onclick={() => install.ask()}><Icon name="device" size={17} />{tr('Cara memasang', 'How to install')}</button>
		</section>
	{:else if adzan.support === 'unsupported'}
		<section class="card group warn-card">
			<div class="v">{tr('Browser ini belum mendukung notifikasi', "This browser doesn't support notifications yet")}</div>
			<p class="sub">
				{tr(
					'Coba buka Muslims Daily di Chrome, Edge, Firefox, atau Safari terbaru.',
					'Try opening Muslims Daily in the latest Chrome, Edge, Firefox, or Safari.'
				)}
			</p>
		</section>
	{:else}
		<section class="card group">
			<button class="master" role="switch" aria-checked={adzan.active} onclick={master} disabled={adzan.permission === 'denied'}>
				<span class="ico" class:on={adzan.active}><Icon name="bell" size={19} /></span>
				<span class="grow">
					<span class="v">{tr('Notifikasi adzan', 'Adhan notifications')}</span>
					<span class="sub">
						{#if adzan.permission === 'denied'}
							{tr('Izin ditolak browser', 'Blocked by the browser')}
						{:else if !adzan.active}
							{tr('Mati', 'Off')}
						{:else if next}
							{tr(
								`Berikutnya ${next.kind === 'before' ? `pengingat ${next.name}` : next.name} pukul ${formatTime(next.at)}`,
								`Next: ${next.kind === 'before' ? `${prayerName(next.key)} reminder` : prayerName(next.key)} at ${formatTime(next.at)}`
							)}
						{:else}
							{tr('Semua waktu dimatikan', 'All prayers turned off')}
						{/if}
					</span>
				</span>
				<span class="sw" aria-hidden="true"></span>
			</button>
			{#if adzan.permission === 'denied'}
				<p class="hint warn">
					{tr(
						'Browser memblokir notifikasi untuk situs ini. Buka pengaturan situs di browser (ikon gembok di bilah alamat), izinkan Notifikasi, lalu kembali ke sini.',
						'Your browser is blocking notifications for this site. Open the site settings (the lock icon in the address bar), allow Notifications, then come back here.'
					)}
				</p>
			{:else if adzan.permission === 'default' && !prefs.enabled}
				<p class="hint">
					{tr(
						'Saat dinyalakan, browser akan meminta izin menampilkan notifikasi.',
						'When you turn this on, your browser will ask for permission to show notifications.'
					)}
				</p>
			{/if}
		</section>

		<section class="card list" class:off={!adzan.active} aria-label={tr('Notifikasi per waktu salat', 'Notifications per prayer')}>
			<div class="label lh">{tr('Per waktu salat', 'Per prayer')} · {onCount}/5</div>
			{#each PRAYERS as p (p.key)}
				<button class="row" role="switch" aria-checked={prefs.on[p.key]} disabled={!adzan.active} onclick={() => adzan.toggle(p.key)}>
					<span class="grow">
						<span class="v">{prayerName(p.key)}</span>
						<span class="sub num">
							{times ? `${formatTime(times.today[p.key])} ${clock.now ? tzLabel(clock.now) : ''}` : '--.--'}
							{#if adzan.active && !prefs.on[p.key]}· {tr('tanpa notifikasi', 'no notification')}{/if}
						</span>
					</span>
					<span class="sw" aria-hidden="true"></span>
				</button>
			{/each}
		</section>

		<section class="card group" class:off={!adzan.active}>
			<div class="label">{tr('Pengingat sebelum adzan', 'Reminder before adhan')}</div>
			<div class="seg wide" role="group" aria-label={tr('Pengingat sebelum adzan', 'Reminder before adhan')}>
				{#each BEFORE_OPTIONS as m (m)}
					<button aria-pressed={prefs.before === m} disabled={!adzan.active} onclick={() => adzan.setBefore(m)}>
						{m === 0 ? tr('Tidak', 'None') : tr(`${m} mnt`, `${m} min`)}
					</button>
				{/each}
			</div>
			<p class="hint">
				{tr(
					'Notifikasi tambahan sebelum waktu salat, untuk bersiap dan berwudhu. Berlaku untuk waktu yang dinyalakan.',
					'An extra notification before the prayer time, so you can get ready and make wudu. Applies to the prayers you turned on.'
				)}
			</p>
		</section>

		{#if adzan.active}
			<button class="card test press" onclick={() => adzan.test()}>
				<Icon name="bell" size={18} />
				<span class="grow">{tr('Coba kirim notifikasi', 'Send a test notification')}</span>
				<Icon name="chevron" size={16} />
			</button>
		{/if}

		<p class="note">
			<Icon name="info" size={15} />
			<span>
				{tr(
					'Muslims Daily tanpa server, jadi notifikasi disiapkan oleh HP-mu sendiri. Notifikasi muncul selama aplikasi masih terbuka atau berjalan di latar. Bila aplikasi ditutup paksa atau HP menghemat baterai dengan ketat, notifikasi bisa terlewat.',
					"Muslims Daily has no server, so your phone prepares the notifications itself. They show up while the app is open or running in the background. If the app is force closed or your phone saves battery aggressively, a notification can be missed."
				)}
				{#if !install.standalone}{tr(
						'Memasang aplikasi di layar utama membuatnya lebih andal.',
						'Installing the app to your home screen makes it more reliable.'
					)}{/if}
			</span>
		</p>
	{/if}
</SubPage>

<style>
	.group {
		padding: 16px;
		margin-bottom: 12px;
	}
	.list {
		padding: 12px 0 4px;
		margin-bottom: 12px;
	}
	.lh {
		padding: 0 16px 4px;
	}
	.off {
		opacity: 0.5;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.v {
		display: block;
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
	.hint.top {
		margin: 0;
	}
	.hint.warn {
		color: var(--peach-ink);
		font-weight: 600;
	}
	.warn-card .sub {
		margin-top: 6px;
	}
	.cta {
		margin-top: 12px;
		display: inline-flex;
		align-items: center;
		gap: 8px;
		padding: 10px 14px;
		border-radius: 12px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
		font-size: 13px;
	}
	.master,
	.row {
		display: flex;
		width: 100%;
		align-items: center;
		gap: 14px;
		text-align: left;
		color: inherit;
	}
	.master:disabled,
	.row:disabled {
		cursor: default;
	}
	.row {
		padding: 11px 16px;
		position: relative;
	}
	.row + .row::before {
		content: '';
		position: absolute;
		top: 0;
		left: 16px;
		right: 0;
		border-top: 1px solid var(--line);
	}
	.row:not(:disabled):active {
		background: var(--sunk);
	}
	.ico {
		width: 36px;
		height: 36px;
		flex: none;
		border-radius: 11px;
		display: grid;
		place-items: center;
		background: var(--sunk);
		color: var(--ink2);
		transition: all 0.25s var(--ease);
	}
	.ico.on {
		background: var(--navy-soft);
		color: var(--navy);
	}
	/* sakelar */
	.sw {
		position: relative;
		flex: none;
		width: 44px;
		height: 26px;
		border-radius: 999px;
		background: var(--line-strong);
		transition: background 0.25s var(--ease);
	}
	.sw::after {
		content: '';
		position: absolute;
		top: 3px;
		left: 3px;
		width: 20px;
		height: 20px;
		border-radius: 50%;
		background: var(--card);
		box-shadow: 0 1px 3px rgba(15, 26, 38, 0.25);
		transition: transform 0.25s var(--ease);
	}
	[aria-checked='true'] > .sw {
		background: var(--navy);
	}
	[aria-checked='true'] > .sw::after {
		transform: translateX(18px);
	}
	.wide {
		display: flex;
		width: 100%;
		margin-top: 8px;
	}
	.wide button {
		flex: 1;
	}
	.test {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 12px;
		padding: 14px 16px;
		margin-bottom: 12px;
		text-align: left;
		color: var(--navy);
		font-weight: 700;
		font-size: 14.5px;
	}
	.test .grow {
		color: var(--ink);
	}
	.note {
		display: flex;
		gap: 8px;
		margin: 4px 4px 0;
		font-size: 12px;
		line-height: 1.55;
		color: var(--ink3);
	}
	.note :global(svg) {
		margin-top: 2px;
	}
</style>
