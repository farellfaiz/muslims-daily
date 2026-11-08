<script lang="ts">
	import Icon from './Icon.svelte';
	import { install } from '#lib/state/install.svelte.ts';

	// Kunjungan pertama: perkenalan. Kunjungan kelima: pengingat untuk yang sudah sering mampir.
	const again = $derived(install.visits > 1);
	const cta = $derived(install.platform === 'prompt' ? 'Pasang' : 'Lihat caranya');
</script>

{#if install.offer}
	<aside class="card offer" aria-label="Pasang aplikasi">
		<img src="/icons/icon-192.png" alt="" width="44" height="44" />
		<div class="grow">
			<div class="t">{again ? 'Sudah lima kali mampir' : 'Pasang di layar utama'}</div>
			<p>
				{again
					? 'Pasang Muslims Daily supaya jadwal salat tinggal sekali ketuk.'
					: 'Jadwal salat tinggal sekali ketuk, tampil layar penuh, dan tetap jalan tanpa internet.'}
			</p>
			<button class="go press" onclick={() => install.ask()}>{cta}</button>
		</div>
		<button class="x press" aria-label="Nanti saja" onclick={() => install.dismiss()}><Icon name="x" size={16} /></button>
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
