<script lang="ts">
	import { afterNavigate, goto } from '$app/navigation';
	import BackBar from '#lib/components/BackBar.svelte';
	import DoaList from '#lib/components/DoaList.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Sheet from '#lib/components/Sheet.svelte';
	import { NAME_MAX, remove, rename } from '#lib/koleksi.ts';
	import { doaPrefs, toast } from '#lib/state/app.svelte.ts';

	let { data } = $props();

	// Satu halaman statis untuk semua koleksi: id-nya di ?id=..., dibaca setelah halaman hidup
	// (koleksi hanya ada di perangkat, jadi tidak bisa dibuat halaman per koleksi saat build).
	let id = $state<string | null>(null);
	let mounted = $state(false);
	afterNavigate(() => {
		id = new URLSearchParams(location.search).get('id');
		mounted = true;
	});

	const list = $derived(doaPrefs.value.koleksi);
	const k = $derived(list.find((x) => x.id === id));
	const save = (koleksi: typeof list) => (doaPrefs.value = { ...doaPrefs.value, koleksi });

	let renameOpen = $state(false);
	let delOpen = $state(false);
	let name = $state('');
	function openRename() {
		name = k?.name ?? '';
		renameOpen = true;
	}
	function doRename(e: SubmitEvent) {
		e.preventDefault();
		if (!k || !name.trim()) return;
		save(rename(list, k.id, name));
		renameOpen = false;
		toast.say('Nama koleksi diganti');
	}
	function doDelete() {
		if (!k) return;
		const n = k.name;
		save(remove(list, k.id));
		delOpen = false;
		toast.say(`Koleksi ${n} dihapus`);
		goto('/doa', { replaceState: true });
	}
</script>

<svelte:head><title>{k ? `${k.name} · Koleksi` : 'Koleksi doa'} · Muslims Daily</title></svelte:head>

<BackBar fallback="/doa" />

{#if !mounted}
	<header class="page-head"><div class="label">Kumpulan doa</div><h1>Koleksi</h1></header>
{:else if k}
	<header class="page-head">
		<div class="label">Koleksi</div>
		<h1>{k.name}</h1>
		<div class="acts">
			<button class="press" onclick={openRename}><Icon name="sliders" size={15} />Ubah nama</button>
			<button class="press del" onclick={() => (delOpen = true)}><Icon name="x" size={15} />Hapus</button>
		</div>
	</header>

	<DoaList
		items={data.items}
		categories={data.categories}
		searchable={false}
		only={k.ids}
		empty="Koleksi ini masih kosong. Buka doa mana pun, lalu tap Koleksi buat menambahkannya ke sini."
	/>

	<Sheet bind:open={renameOpen} title="Ubah nama koleksi">
		<form class="ren" onsubmit={doRename}>
			<input bind:value={name} maxlength={NAME_MAX} aria-label="Nama koleksi" autocomplete="off" enterkeyhint="done" />
			<button class="primary press" type="submit" disabled={!name.trim()}>Simpan</button>
		</form>
	</Sheet>

	<Sheet bind:open={delOpen} title="Hapus koleksi?">
		<p class="ask">Koleksi <b>{k.name}</b> akan dihapus. Doa di dalamnya tetap ada di kumpulan doa.</p>
		<button class="danger press" onclick={doDelete}>Hapus koleksi</button>
		<button class="ghost press" onclick={() => (delOpen = false)}>Batal</button>
	</Sheet>
{:else}
	<header class="page-head">
		<div class="label">Kumpulan doa</div>
		<h1>Koleksi</h1>
	</header>
	{#if list.length}
		<div class="card rows">
			{#each list as x (x.id)}
				<a class="row press" href="/doa/koleksi?id={x.id}">
					<span class="grow">{x.name}</span>
					<span class="num n">{x.ids.length} doa</span>
					<Icon name="chevron" size={16} stroke={2.2} />
				</a>
			{/each}
		</div>
	{:else}
		<p class="empty">Belum ada koleksi. Buka doa mana pun, lalu tap Koleksi buat bikin yang pertama.</p>
	{/if}
{/if}

<style>
	.acts {
		display: flex;
		gap: 8px;
		margin-top: 12px;
	}
	.acts button {
		display: flex;
		align-items: center;
		gap: 6px;
		height: 34px;
		padding: 0 14px;
		border-radius: 999px;
		background: var(--sunk);
		color: var(--ink);
		font-size: 13px;
		font-weight: 700;
	}
	.acts .del {
		color: var(--peach-ink);
	}
	.ren {
		display: flex;
		gap: 8px;
	}
	.ren input {
		flex: 1;
		min-width: 0;
		height: 48px;
		padding: 0 14px;
		border-radius: 14px;
		border: 1px solid var(--line-strong);
		background: var(--card);
		font: inherit;
		font-size: 15px;
		color: var(--ink);
	}
	.primary,
	.danger,
	.ghost {
		height: 48px;
		padding: 0 20px;
		border-radius: 14px;
		font-weight: 700;
		font-size: 15px;
	}
	.primary {
		background: var(--navy);
		color: var(--on-navy);
	}
	.primary:disabled {
		opacity: 0.45;
	}
	.ask {
		margin: 0 2px 16px;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink2);
	}
	.danger,
	.ghost {
		width: 100%;
	}
	.danger {
		background: var(--peach-ink);
		color: #fff;
	}
	.ghost {
		margin-top: 8px;
		background: var(--sunk);
		color: var(--ink);
	}
	.rows {
		padding: 4px 0;
	}
	.row {
		display: flex;
		align-items: center;
		gap: 10px;
		padding: 14px 14px 14px 16px;
		color: var(--ink);
		font-weight: 700;
		font-size: 14.5px;
	}
	.row + .row {
		border-top: 1px solid var(--line);
	}
	.n {
		font-size: 12px;
		font-weight: 600;
		color: var(--ink3);
	}
	.grow {
		flex: 1;
		min-width: 0;
	}
	.empty {
		margin: 16px 4px;
		font-size: 14px;
		line-height: 1.55;
		color: var(--ink2);
	}
</style>
