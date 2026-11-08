<script lang="ts" module>
	export interface PickerOption {
		value: string;
		label: string;
		/** teks kecil di bawah label, opsional */
		sub?: string;
	}

	let uid = 0;
	/** huruf kecil tanpa tanda baca dan diakritik, supaya "yogya" cocok dengan "Yogyakarta" */
	const fold = (s: string) =>
		s
			.normalize('NFD')
			.replace(/[̀-ͯ]/g, '')
			.toLowerCase()
			.replace(/[^a-z0-9]+/g, ' ')
			.trim();
</script>

<script lang="ts">
	import { tick } from 'svelte';
	import Icon from './Icon.svelte';
	import { tr } from '#lib/i18n.svelte.ts';

	/**
	 * Dropdown kustom pengganti <select>. Daftar pilihan baru dirender saat dibuka,
	 * jadi tidak menambah DOM saat tertutup. Pencarian memakai kunci yang sudah dilipat sekali per daftar.
	 */
	let {
		options,
		value,
		onchange,
		label,
		placeholder,
		searchable = false,
		searchPlaceholder,
		size = 'md'
	}: {
		options: PickerOption[];
		value: string;
		onchange: (value: string) => void;
		/** nama untuk pembaca layar */
		label: string;
		placeholder?: string;
		searchable?: boolean;
		searchPlaceholder?: string;
		size?: 'md' | 'sm';
	} = $props();

	const ph = $derived(placeholder ?? tr('Pilih', 'Choose'));
	const searchPh = $derived(searchPlaceholder ?? tr('Cari', 'Search'));

	const id = `pk${++uid}`;
	let open = $state(false);
	let query = $state('');
	let active = $state(0);
	let root: HTMLDivElement | undefined = $state();
	let input: HTMLInputElement | undefined = $state();
	let list: HTMLUListElement | undefined = $state();

	const keys = $derived(options.map((o) => fold(`${o.label} ${o.sub ?? ''}`)));
	const shown = $derived.by(() => {
		const q = fold(query);
		if (!q) return options;
		// awalan kata lebih dulu, baru yang mengandung di tengah
		const starts: PickerOption[] = [];
		const has: PickerOption[] = [];
		options.forEach((o, i) => {
			const k = keys[i];
			if (k.startsWith(q) || k.includes(` ${q}`)) starts.push(o);
			else if (k.includes(q)) has.push(o);
		});
		return starts.concat(has);
	});
	const current = $derived(options.find((o) => o.value === value));

	async function show() {
		open = true;
		query = '';
		active = Math.max(0, options.findIndex((o) => o.value === value));
		await tick();
		(searchable ? input : list)?.focus();
		scrollActive('center');
	}

	function hide(refocus = true) {
		open = false;
		if (refocus) root?.querySelector<HTMLButtonElement>('.trigger')?.focus();
	}

	function choose(o: PickerOption) {
		if (o.value !== value) onchange(o.value);
		hide();
	}

	function scrollActive(block: ScrollLogicalPosition = 'nearest') {
		list?.querySelector(`#${id}-o${active}`)?.scrollIntoView({ block });
	}

	function onkey(e: KeyboardEvent) {
		const last = shown.length - 1;
		if (e.key === 'ArrowDown') active = Math.min(last, active + 1);
		else if (e.key === 'ArrowUp') active = Math.max(0, active - 1);
		else if (e.key === 'Home' && !searchable) active = 0;
		else if (e.key === 'End' && !searchable) active = last;
		else if (e.key === 'Enter') {
			if (shown[active]) choose(shown[active]);
		} else if (e.key === 'Escape' || e.key === 'Tab') {
			if (e.key === 'Escape') e.stopPropagation();
			return hide(e.key === 'Escape');
		} else return;
		e.preventDefault();
		tick().then(() => scrollActive());
	}

	// tutup bila ketuk di luar
	$effect(() => {
		if (!open) return;
		const away = (e: PointerEvent) => !root?.contains(e.target as Node) && hide(false);
		document.addEventListener('pointerdown', away);
		return () => document.removeEventListener('pointerdown', away);
	});
</script>

<div class="picker {size}" class:open bind:this={root}>
	<button
		type="button"
		class="trigger"
		aria-haspopup="listbox"
		aria-expanded={open}
		aria-controls="{id}-list"
		aria-label="{label}: {current?.label ?? ph}"
		onclick={() => (open ? hide() : show())}
	>
		<span class="cur" class:ph={!current}>{current?.label ?? ph}</span>
		<span class="chev" class:up={open}><Icon name="chevron" size={size === 'sm' ? 13 : 15} stroke={2.2} /></span>
	</button>

	{#if open}
		<div class="panel">
			{#if searchable}
				<label class="search">
					<Icon name="search" size={16} />
					<input
						bind:this={input}
						bind:value={query}
						type="search"
						role="combobox"
						aria-expanded="true"
						aria-controls="{id}-list"
						aria-activedescendant={shown.length ? `${id}-o${active}` : undefined}
						aria-autocomplete="list"
						aria-label="{searchPh} {label.toLowerCase()}"
						placeholder={searchPh}
						autocomplete="off"
						spellcheck="false"
						onkeydown={onkey}
						oninput={() => (active = 0)}
					/>
				</label>
			{/if}
			<ul
				bind:this={list}
				id="{id}-list"
				role="listbox"
				aria-label={label}
				tabindex="-1"
				aria-activedescendant={!searchable && shown.length ? `${id}-o${active}` : undefined}
				onkeydown={searchable ? undefined : onkey}
			>
				{#each shown as o, i (o.value)}
					<li
						id="{id}-o{i}"
						role="option"
						aria-selected={o.value === value}
						class:active={i === active}
						onpointerenter={() => (active = i)}
						onclick={() => choose(o)}
						onkeydown={() => {}}
					>
						<span class="ol">
							{o.label}
							{#if o.sub}<span class="os">{o.sub}</span>{/if}
						</span>
						{#if o.value === value}<Icon name="check" size={16} stroke={2.4} />{/if}
					</li>
				{:else}
					<li class="empty" role="presentation">{tr(`Tidak ada yang cocok dengan “${query}”`, `Nothing matches “${query}”`)}</li>
				{/each}
			</ul>
		</div>
	{/if}
</div>

<style>
	.picker {
		position: relative;
	}
	/* kartu punya lapisan sendiri (animasi masuk), jadi kartu yang memuat dropdown terbuka diangkat ke atas kartu lain */
	.picker.open,
	:global(.card:has(.picker.open)) {
		position: relative;
		z-index: 40;
	}
	.trigger {
		width: 100%;
		display: flex;
		align-items: center;
		gap: 8px;
		height: 44px;
		padding: 0 12px 0 14px;
		border-radius: 12px;
		background: var(--sunk);
		color: var(--ink);
		font-size: 14px;
		font-weight: 600;
		text-align: left;
		transition: box-shadow 0.2s var(--ease);
	}
	.trigger[aria-expanded='true'] {
		box-shadow: 0 0 0 1.5px var(--navy);
	}
	.sm .trigger {
		width: auto;
		height: 34px;
		padding: 0 9px 0 11px;
		border-radius: 10px;
		font-size: 12px;
		font-weight: 700;
	}
	.cur {
		flex: 1;
		min-width: 0;
		white-space: nowrap;
		overflow: hidden;
		text-overflow: ellipsis;
	}
	.ph {
		color: var(--ink3);
	}
	.chev {
		display: inline-flex;
		color: var(--ink2);
		transform: rotate(90deg);
		transition: transform 0.25s var(--ease);
	}
	.chev.up {
		transform: rotate(-90deg);
	}
	.panel {
		position: absolute;
		z-index: 30;
		top: calc(100% + 6px);
		left: 0;
		right: 0;
		background: var(--card);
		border: 1px solid var(--line);
		border-radius: 14px;
		box-shadow: 0 18px 40px -16px var(--frame-shadow);
		overflow: hidden;
		transform-origin: top center;
		animation: pop 0.18s var(--ease);
	}
	.sm .panel {
		right: auto;
		min-width: 190px;
	}
	@keyframes pop {
		from {
			opacity: 0;
			transform: translateY(-4px) scale(0.98);
		}
	}
	@media (prefers-reduced-motion: reduce) {
		.panel {
			animation: none;
		}
	}
	.search {
		display: flex;
		align-items: center;
		gap: 8px;
		margin: 8px;
		padding: 0 10px;
		height: 38px;
		border-radius: 10px;
		background: var(--sunk);
		color: var(--ink3);
	}
	.search input {
		flex: 1;
		min-width: 0;
		border: 0;
		outline: 0;
		background: none;
		font: inherit;
		font-size: 16px; /* 16px supaya iOS tidak memperbesar halaman saat fokus */
		color: var(--ink);
	}
	.search input::-webkit-search-cancel-button {
		display: none;
	}
	ul {
		list-style: none;
		margin: 0;
		padding: 4px;
		max-height: 264px;
		overflow-y: auto;
		overscroll-behavior: contain;
		outline: 0;
	}
	.search + ul {
		padding-top: 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 8px;
		min-height: 42px;
		padding: 6px 10px;
		border-radius: 9px;
		font-size: 14px;
		font-weight: 600;
		color: var(--ink);
		cursor: pointer;
		/* lewati render baris di luar layar */
		content-visibility: auto;
		contain-intrinsic-size: auto 42px;
	}
	.sm li {
		min-height: 38px;
		font-size: 13px;
	}
	li.active {
		background: var(--sunk);
	}
	li[aria-selected='true'] {
		color: var(--navy);
		font-weight: 700;
	}
	.ol {
		flex: 1;
		min-width: 0;
	}
	.os {
		display: block;
		font-size: 11.5px;
		font-weight: 500;
		color: var(--ink3);
	}
	li.empty {
		cursor: default;
		color: var(--ink3);
		font-weight: 500;
		font-size: 13px;
		justify-content: center;
	}
</style>
