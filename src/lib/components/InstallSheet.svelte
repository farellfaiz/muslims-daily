<script lang="ts">
	import Icon from './Icon.svelte';
	import StarNum from './StarNum.svelte';
	import { trackerSummary } from '#lib/backup.ts';
	import { tracker } from '#lib/state/app.svelte.ts';
	import { install } from '#lib/state/install.svelte.ts';

	let dlg: HTMLDialogElement | undefined = $state();
	const p = $derived(install.platform);
	// Di iPhone, aplikasi terpasang punya penyimpanan sendiri, terpisah dari Safari.
	const hasData = $derived(trackerSummary(tracker.value).days > 0);

	$effect(() => {
		if (!dlg) return;
		if (install.sheet && !dlg.open) dlg.showModal();
		else if (!install.sheet && dlg.open) dlg.close();
	});

	const close = () => (install.sheet = false);

	// Toast tertutup lembar ini (dialog selalu di lapisan teratas), jadi status salin ada di tombolnya.
	let copied = $state('');
	async function copyLink() {
		try {
			await navigator.clipboard.writeText(location.origin);
			copied = 'Tautan disalin';
		} catch {
			copied = location.origin.replace(/^https?:\/\//, '');
		}
	}
</script>

<dialog
	bind:this={dlg}
	class="sheet"
	aria-labelledby="install-title"
	onclose={close}
	onclick={(e) => e.target === dlg && close()}
>
	<div class="sheet-in">
		<div class="sheet-h">
			<h2 id="install-title">{p === 'inapp' ? 'Buka di browser dulu' : 'Pasang di layar utama'}</h2>
			<button class="x press" aria-label="Tutup" onclick={close}><Icon name="x" size={18} /></button>
		</div>

		{#if p === 'inapp'}
			<p class="lead">
				Kamu sedang membuka Muslims Daily dari dalam aplikasi lain. Dari sini aplikasi belum bisa dipasang.
			</p>
			<ol>
				<li><StarNum n={1} /><span>Ketuk menu <b>⋯</b> atau <b>⋮</b> di pojok layar.</span></li>
				<li><StarNum n={2} /><span>Pilih <b>Buka di browser</b> (Safari atau Chrome).</span></li>
				<li><StarNum n={3} /><span>Di browser, buka menu <b>Lainnya</b> lalu ketuk <b>Pasang di layar utama</b>.</span></li>
			</ol>
			<button class="btn ghost press" onclick={copyLink}>
				<Icon name={copied ? 'check' : 'copy'} size={17} />{copied || 'Salin tautan'}
			</button>
		{:else}
			<ul class="perks">
				<li><Icon name="check" size={15} />Sekali ketuk dari layar utama, tampil layar penuh</li>
				<li><Icon name="check" size={15} />Tetap jalan tanpa internet</li>
				{#if p === 'ios'}
					<li><Icon name="check" size={15} />Catatan salat tidak dihapus Safari walau lama tidak dibuka</li>
				{/if}
			</ul>

			{#if p === 'ios'}
				<ol>
					<li>
						<StarNum n={1} />
						<span>Ketuk tombol <b>Bagikan</b> <span class="ic"><Icon name="share" size={15} /></span> di bilah bawah Safari (di Chrome ada di kanan atas).</span>
					</li>
					<li><StarNum n={2} /><span>Gulir ke bawah, pilih <b>Tambah ke Layar Utama</b>.</span></li>
					<li><StarNum n={3} /><span>Ketuk <b>Tambah</b>. Ikon Muslims Daily muncul di layar utama.</span></li>
				</ol>
				{#if hasData}
					<p class="note">
						<Icon name="info" size={16} />
						<span>
							Di iPhone, aplikasi yang dipasang mulai dengan catatan kosong. Simpan
							<a href="/lainnya/cadangan" onclick={close}>cadangan</a> dulu di sini, lalu pulihkan dari aplikasinya.
						</span>
					</p>
				{/if}
			{:else}
				<ol>
					<li><StarNum n={1} /><span>Buka menu browser, biasanya <b>⋮</b> atau <b>⋯</b> di pojok atas.</span></li>
					<li>
						<StarNum n={2} />
						<span>Pilih <b>Pasang aplikasi</b>, <b>Instal</b>, atau <b>Tambahkan ke layar utama</b>.</span>
					</li>
					<li><StarNum n={3} /><span>Ikuti konfirmasinya. Ikon muncul di layar utama.</span></li>
				</ol>
				<p class="hint">Kalau pilihan itu tidak ada, mungkin aplikasi sudah terpasang. Cari ikonnya di layar utama.</p>
			{/if}
		{/if}
	</div>
</dialog>

<style>
	.sheet {
		margin: auto auto 0;
		width: 100%;
		max-width: 430px;
		max-height: 86dvh;
		padding: 0;
		border: 0;
		border-radius: var(--r-lg) var(--r-lg) 0 0;
		background: var(--card);
		color: var(--ink);
		border-top: 1px solid var(--line-strong);
		box-shadow: 0 -10px 40px -20px var(--frame-shadow);
	}
	.sheet[open] {
		animation: sheet-up 0.32s var(--ease);
	}
	.sheet::backdrop {
		background: rgba(15, 26, 38, 0.45);
		animation: fade 0.25s var(--ease);
	}
	@keyframes sheet-up {
		from {
			transform: translateY(100%);
		}
	}
	@keyframes fade {
		from {
			opacity: 0;
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.sheet[open],
		.sheet::backdrop {
			animation: none;
		}
	}
	.sheet-in {
		padding: 18px 18px calc(22px + var(--safe-b));
	}
	.sheet-h {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 12px;
		margin-bottom: 10px;
	}
	.sheet-h h2 {
		margin: 0;
		font-family: var(--f-disp);
		font-weight: 500;
		font-size: 21px;
		letter-spacing: -0.02em;
	}
	.x {
		width: 36px;
		height: 36px;
		flex: none;
		border-radius: 50%;
		background: var(--sunk);
		color: var(--ink2);
		display: grid;
		place-items: center;
	}
	.lead {
		margin: 0 0 6px;
		font-size: 13.5px;
		line-height: 1.55;
		color: var(--ink2);
	}
	.perks {
		list-style: none;
		margin: 0 0 6px;
		padding: 12px 14px;
		border-radius: 14px;
		background: var(--sunk);
		display: grid;
		gap: 7px;
	}
	.perks li {
		display: flex;
		gap: 8px;
		align-items: flex-start;
		font-size: 12.5px;
		line-height: 1.45;
	}
	.perks :global(svg) {
		color: var(--navy);
		flex: none;
		margin-top: 1px;
	}
	ol {
		list-style: none;
		padding: 0;
		margin: 6px 0 4px;
	}
	ol li {
		display: flex;
		gap: 12px;
		align-items: center;
		padding: 9px 0;
		font-size: 14px;
		line-height: 1.5;
		border-bottom: 1px solid var(--line);
	}
	ol li:last-child {
		border-bottom: 0;
	}
	ol li :global(.star) {
		flex: none;
	}
	.ic {
		display: inline-grid;
		vertical-align: -3px;
		color: var(--navy);
	}
	.note {
		display: flex;
		gap: 10px;
		margin: 10px 0 0;
		padding: 12px 14px;
		border-radius: 14px;
		background: var(--peach-soft);
		color: var(--peach-ink);
		font-size: 12.5px;
		line-height: 1.5;
	}
	.note :global(svg) {
		flex: none;
		margin-top: 1px;
	}
	.note a {
		color: inherit;
		font-weight: 700;
	}
	.hint {
		font-size: 12px;
		color: var(--ink3);
		margin: 8px 0 0;
		line-height: 1.5;
	}
	.btn {
		width: 100%;
		height: 46px;
		margin-top: 12px;
		border-radius: 14px;
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
</style>
