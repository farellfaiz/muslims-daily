<script lang="ts">
	import Icon from './Icon.svelte';
	import { install } from '#lib/state/install.svelte.ts';
	import { tr } from '#lib/i18n.svelte.ts';

	// Kunjungan pertama: perkenalan. Kunjungan kelima: pengingat untuk yang sudah sering mampir.
	const again = $derived(install.visits > 1);
	const cta = $derived(install.platform === 'prompt' ? tr('Pasang', 'Install') : tr('Lihat caranya', 'Show me how'));
</script>

{#if install.offer}
	<aside class="card offer" aria-label={tr('Pasang aplikasi', 'Install the app')}>
		<img src="/icons/icon-192.png" alt="" width="44" height="44" />
		<div class="grow">
			<div class="t">{again ? tr('Sudah lima kali mampir', "You've stopped by five times") : tr('Pasang di layar utama', 'Add to your home screen')}</div>
			<p>
				{again
					? tr(
							'Pasang Muslims Daily supaya jadwal salat tinggal sekali ketuk.',
							'Install Muslims Daily and your prayer times are one tap away.'
						)
					: tr(
							'Jadwal salat tinggal sekali ketuk, tampil layar penuh, dan tetap jalan tanpa internet.',
							'Prayer times one tap away, full screen, and it still works offline.'
						)}
			</p>
			<button class="go press" onclick={() => install.ask()}>{cta}</button>
		</div>
		<button class="x press" aria-label={tr('Nanti saja', 'Not now')} onclick={() => install.dismiss()}><Icon name="x" size={16} /></button>
	</aside>
{/if}

<style>
	.offer {
		display: flex;
		gap: 12px;
		align-items: flex-start;
		padding: 14px 12px 14px 14px;
		margin-top: 14px;
		background: var(--navy-soft);
		border-color: transparent;
		box-shadow: none;
		animation: rise 0.4s var(--ease);
	}
	img {
		border-radius: 12px;
		flex: none;
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.t {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
	}
	p {
		margin: 2px 0 10px;
		font-size: 12.5px;
		line-height: 1.5;
		color: var(--ink2);
	}
	.go {
		height: 34px;
		padding: 0 16px;
		border-radius: 999px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
		font-size: 13px;
	}
	.x {
		width: 30px;
		height: 30px;
		flex: none;
		border-radius: 50%;
		display: grid;
		place-items: center;
		color: var(--ink2);
	}
	@keyframes rise {
		from {
			opacity: 0;
			transform: translateY(8px);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.offer {
			animation: none;
		}
	}
</style>
