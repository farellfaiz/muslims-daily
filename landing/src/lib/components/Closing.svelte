<script lang="ts">
	import { APP_URL } from '#lib/config.ts';
	import { prayerName, tr } from '#lib/i18n.svelte.ts';
	import { live } from '#lib/live.svelte.ts';
	import { reveal } from '#lib/scroll.ts';
	import { countdown } from '#lib/sky.ts';
	import Icon from './Icon.svelte';
</script>

<section class="sec closing pattern on-sky" aria-labelledby="close-h">
	<div class="wrap inner rv" use:reveal>
		<img src="/icons/icon-192.png" alt="" width="84" height="84" />
		<h2 class="h2" id="close-h">{tr('Mulai dari salat berikutnya', 'Start with your next prayer')}</h2>
		<p class="sub">{tr('Buat kamu yang sedang belajar istiqamah.', 'For anyone learning to stay consistent.')}</p>
		<p class="live" aria-live="off">
			{#if live.next && live.now}
				<span class="pulse" aria-hidden="true"></span>
				{tr('Menuju', 'Until')} {prayerName(live.next.key)}
				<b class="num">{countdown(+live.next.at - +live.now)}</b>
				<span class="where">{live.place.name}</span>
			{:else}
				{tr('Jadwal salat dan doa harian dalam satu app', 'Prayer times and daily duas in one app')}
			{/if}
		</p>
		<div class="cta">
			<a class="btn primary" href={APP_URL}>{tr('Buka aplikasi', 'Open app')} <Icon name="arrow" size={18} /></a>
			<a class="btn ghost" href="#install">{tr('Cara install', 'How to install')}</a>
		</div>
	</div>
</section>

<style>
	.closing {
		text-align: center;
	}
	.inner {
		display: flex;
		flex-direction: column;
		align-items: center;
	}
	img {
		border-radius: 22px;
		box-shadow: var(--shadow-lg);
		margin-bottom: 28px;
	}
	.h2 {
		max-width: 760px;
	}
	.sub {
		margin: 14px 0 0;
		font-size: 16px;
		color: var(--ink2);
	}
	.live {
		display: inline-flex;
		align-items: center;
		flex-wrap: wrap;
		justify-content: center;
		gap: 8px;
		margin: 22px 0 0;
		padding: 10px 18px;
		border-radius: 999px;
		background: var(--card);
		box-shadow: var(--shadow);
		font-size: 14.5px;
		font-weight: 700;
		color: var(--ink2);
	}
	.live b {
		color: var(--ink);
		font-size: 16px;
	}
	.where {
		padding-left: 8px;
		border-left: 1px solid var(--line-strong);
		font-weight: 600;
	}
	.pulse {
		position: relative;
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--peach);
	}
	/* Lingkaran terpisah: transform dan opacity jalan di GPU, box-shadow tidak. */
	.pulse::after {
		content: '';
		position: absolute;
		inset: 0;
		border-radius: 50%;
		background: var(--peach);
		animation: pulse 2s ease-out infinite;
	}
	@keyframes pulse {
		from {
			opacity: 0.35;
		}
		to {
			opacity: 0;
			transform: scale(2.4);
		}
	}
	.cta {
		display: flex;
		flex-wrap: wrap;
		justify-content: center;
		gap: 10px;
		margin-top: 30px;
	}
</style>
