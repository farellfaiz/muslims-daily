<script lang="ts">
	import { tr } from '#lib/i18n.svelte.ts';
	import Icon from './Icon.svelte';
	import Sheet from './Sheet.svelte';
	import { create, has, NAME_MAX, toggle } from '#lib/koleksi.ts';
	import { doaPrefs, toast } from '#lib/state/app.svelte.ts';

	/** Lembar "Simpan ke koleksi" untuk satu doa: centang koleksi yang ada, atau buat yang baru. */
	let { open = $bindable(false), doaId }: { open?: boolean; doaId: number } = $props();

	const list = $derived(doaPrefs.value.koleksi);
	let name = $state('');
	let adding = $state(false);
	let input = $state<HTMLInputElement>();

	// Belum punya koleksi: langsung tampilkan kolom nama.
	$effect(() => {
		if (open) adding = list.length === 0;
	});
	$effect(() => {
		if (adding && open) input?.focus();
	});

	const save = (koleksi: typeof list) => (doaPrefs.value = { ...doaPrefs.value, koleksi });

	function flip(id: string) {
		const k = list.find((x) => x.id === id)!;
		const inside = has(k, doaId);
		save(toggle(list, id, doaId));
		toast.say(inside ? tr(`Dikeluarkan dari ${k.name}`, `Removed from ${k.name}`) : tr(`Disimpan ke ${k.name}`, `Saved to ${k.name}`));
	}

	function make(e: SubmitEvent) {
		e.preventDefault();
		const r = create(list, name, doaId);
		if (!r) return input?.focus();
		save(r.list);
		const made = r.list.at(-1)!.name;
		toast.say(tr(`Disimpan ke ${made}`, `Saved to ${made}`));
		name = '';
		adding = false;
	}
</script>

<Sheet bind:open title={tr('Simpan ke koleksi', 'Save to collection')}>
	{#if list.length}
		<div class="opts">
			{#each list as k (k.id)}
				{@const on = has(k, doaId)}
				<button class="opt press" role="checkbox" aria-checked={on} onclick={() => flip(k.id)}>
					<span class="box" class:on>{#if on}<Icon name="check" size={14} stroke={2.8} />{/if}</span>
					<span class="grow">
						<span class="kn">{k.name}</span>
						<span class="ks num">{tr(`${k.ids.length} doa`, `${k.ids.length} ${k.ids.length === 1 ? 'dua' : 'duas'}`)}</span>
					</span>
				</button>
			{/each}
		</div>
	{/if}

	{#if adding}
		<form class="new" onsubmit={make}>
			<label class="label" for="koleksi-nama">{tr('Nama koleksi baru', 'New collection name')}</label>
			<div class="row">
				<input
					id="koleksi-nama"
					bind:this={input}
					bind:value={name}
					maxlength={NAME_MAX}
					placeholder={tr('Mis. Doa harian anak', 'E.g. Duas for kids')}
					autocomplete="off"
					enterkeyhint="done"
				/>
				<button class="mk press" type="submit" disabled={!name.trim()}>{tr('Buat', 'Create')}</button>
			</div>
		</form>
	{:else}
		<button class="add press" onclick={() => (adding = true)}><Icon name="plus" size={18} />{tr('Koleksi baru', 'New collection')}</button>
	{/if}
	<p class="hint">{tr('Koleksi cuma tersimpan di HP ini dan ikut file backup.', 'Collections are saved only on this phone and included in your backup file.')}</p>
</Sheet>

<style>
	.opts {
		display: flex;
		flex-direction: column;
		gap: 6px;
		margin-bottom: 12px;
	}
	.opt {
		display: flex;
		align-items: center;
		gap: 12px;
		width: 100%;
		padding: 12px 14px;
		border-radius: 16px;
		background: var(--sunk);
		text-align: left;
	}
	.box {
		width: 24px;
		height: 24px;
		flex: none;
		border-radius: 8px;
		border: 1.8px solid var(--line-strong);
		display: grid;
		place-items: center;
		color: var(--on-navy);
		transition: background 0.2s;
	}
	.box.on {
		background: var(--navy);
		border-color: var(--navy);
	}
	.grow {
		flex: 1;
		min-width: 0;
		display: flex;
		flex-direction: column;
	}
	.kn {
		font-weight: 700;
		font-size: 14.5px;
		color: var(--ink);
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}
	.ks {
		font-size: 12px;
		color: var(--ink3);
	}
	.add {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		width: 100%;
		height: 48px;
		border-radius: 16px;
		border: 1.5px dashed var(--line-strong);
		color: var(--navy);
		font-weight: 700;
		font-size: 14px;
	}
	.new .label {
		display: block;
		margin: 0 2px 8px;
	}
	.row {
		display: flex;
		gap: 8px;
	}
	input {
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
	input:focus {
		outline: 2px solid var(--navy);
		outline-offset: -1px;
	}
	.mk {
		height: 48px;
		padding: 0 20px;
		border-radius: 14px;
		background: var(--navy);
		color: var(--on-navy);
		font-weight: 700;
	}
	.mk:disabled {
		opacity: 0.45;
	}
	.hint {
		margin: 12px 2px 4px;
		font-size: 12px;
		color: var(--ink3);
		text-align: center;
	}
</style>
