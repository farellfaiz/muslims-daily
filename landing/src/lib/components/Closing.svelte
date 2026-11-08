<script lang="ts">
	import { APP_URL } from '#lib/config.ts';
	import { live } from '#lib/live.svelte.ts';
	import { reveal } from '#lib/scroll.ts';
	import { countdown } from '#lib/sky.ts';
	import Icon from './Icon.svelte';
</script>

<section class="sec closing pattern on-sky" aria-labelledby="close-h">
	<div class="wrap inner rv" use:reveal>
		<img src="/icons/icon-192.png" alt="" width="84" height="84" />
		<h2 class="h2" id="close-h">Mulai dari salat berikutnya</h2>
		<p class="sub">Cocok juga buat yang baru mulai memperbaiki ibadah.</p>
		<p class="live" aria-live="off">
			{#if live.next && live.now}
				<span class="pulse" aria-hidden="true"></span>
				Menuju {live.next.name}
				<b class="num">{countdown(+live.next.at - +live.now)}</b>
				<span class="where">{live.place.name}</span>
			{:else}
				Jadwal salat dan doa harian dalam satu app
			{/if}
		</p>
		<div class="cta">
			<a class="btn primary" href={APP_URL}>Buka aplikasi <Icon name="arrow" size={18} /></a>
			<a class="btn ghost" href="#install">Cara install</a>
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
		width: 9px;
		height: 9px;
		border-radius: 50%;
		background: var(--peach);
		animation: pulse 2s ease-in-out infinite;
	}
	@keyframes pulse {
		50% {
			box-shadow: 0 0 0 6px rgba(229, 155, 120, 0.2);
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
