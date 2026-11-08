<script lang="ts" module>
	// Ikon garis buatan sendiri (stroke 1.8, ujung bulat). Tidak memakai library ikon supaya bundel tetap kecil.
	const PATHS = {
		home: '<path d="M4 11l8-6.5 8 6.5V19a1 1 0 0 1-1 1h-4v-5h-6v5H5a1 1 0 0 1-1-1z"/>',
		grid: '<rect x="4" y="4" width="6" height="6" rx="1.5"/><rect x="14" y="4" width="6" height="6" rx="1.5"/><rect x="4" y="14" width="6" height="6" rx="1.5"/><rect x="14" y="14" width="6" height="6" rx="1.5"/>',
		bookmark: '<path d="M7 4h10a1 1 0 0 1 1 1v15l-6-3.5L6 20V5a1 1 0 0 1 1-1z"/>',
		dots: '<circle cx="6" cy="12" r="1.3"/><circle cx="12" cy="12" r="1.3"/><circle cx="18" cy="12" r="1.3"/>',
		pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
		star: '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8-4.3-4.1 5.9-.9z"/>',
		trophy: '<path d="M8 21h8M12 17v4M7 4h10v6a5 5 0 0 1-10 0z"/><path d="M7 6H4.5a.5.5 0 0 0-.5.5V8a3 3 0 0 0 3 3M17 6h2.5a.5.5 0 0 1 .5.5V8a3 3 0 0 1-3 3"/>',
		beads: '<circle cx="12" cy="3.4" r="1.3"/><circle cx="16.3" cy="5.2" r="1.3"/><circle cx="18.1" cy="9.5" r="1.3"/><circle cx="16.3" cy="13.8" r="1.3"/><circle cx="7.7" cy="13.8" r="1.3"/><circle cx="5.9" cy="9.5" r="1.3"/><circle cx="7.7" cy="5.2" r="1.3"/><ellipse cx="12" cy="15.9" rx="1.4" ry="1.8"/><path d="M12 17.7v1.6M12 19.3l-1.7 2.2M12 19.3v2.4M12 19.3l1.7 2.2"/>',
		book: '<path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"/><path d="M12 6v13.5"/>',
		compass: '<circle cx="12" cy="12" r="9"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
		search: '<circle cx="11" cy="11" r="6.5"/><path d="M20 20l-4-4"/>',
		cards: '<rect x="4" y="4" width="16" height="7" rx="2"/><rect x="4" y="13" width="16" height="7" rx="2"/>',
		list: '<path d="M9 6h11M9 12h11M9 18h11"/><circle cx="4.5" cy="6" r=".8"/><circle cx="4.5" cy="12" r=".8"/><circle cx="4.5" cy="18" r=".8"/>',
		heart: '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/>',
		back: '<path d="M15 5l-7 7 7 7"/>',
		chevron: '<path d="M9 5l7 7-7 7"/>',
		copy: '<rect x="8" y="8" width="12" height="12" rx="2"/><path d="M16 8V5a1 1 0 0 0-1-1H5a1 1 0 0 0-1 1v10a1 1 0 0 0 1 1h3"/>',
		share: '<path d="M12 15V4M8 8l4-4 4 4"/><path d="M5 13v6a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-6"/>',
		download: '<path d="M12 4v11M8 11l4 4 4-4"/><path d="M5 15v4a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-4"/>',
		restore: '<path d="M4 12a8 8 0 1 0 2.4-5.7L4 8.6"/><path d="M4 4v4.6h4.6"/><path d="M12 8v4l2.8 1.8"/>',
		plus: '<path d="M12 5v14M5 12h14"/>',
		minus: '<path d="M5 12h14"/>',
		check: '<path d="M5 12.5l4.5 4.5L19 7"/>',
		x: '<path d="M7 7l10 10M17 7L7 17"/>',
		bell: '<path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 1.5h-15z"/><path d="M10 20.5a2.2 2.2 0 0 0 4 0"/>',
		flag: '<path d="M5.5 21V4"/><path d="M5.5 4.5h11.5l-2.2 4 2.2 4H5.5"/>',
		info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
		device: '<rect x="7" y="3" width="10" height="18" rx="2.5"/><path d="M11 17.5h2"/>',
		sun: '<circle cx="12" cy="12" r="3.8"/><path d="M12 3v1.8M12 19.2V21M3 12h1.8M19.2 12H21M5.6 5.6l1.3 1.3M17.1 17.1l1.3 1.3M5.6 18.4l1.3-1.3M17.1 6.9l1.3-1.3"/>',
		moon: '<path d="M19.5 14.5A8 8 0 0 1 9.5 4.5a8 8 0 1 0 10 10z"/>',
		sliders: '<path d="M4 7h9M17 7h3M4 17h3M11 17h9"/><circle cx="15" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
		locate: '<circle cx="12" cy="12" r="3.5"/><path d="M12 3v3M12 18v3M3 12h3M18 12h3"/>',
		github: '<path d="M9 19c-4 1.3-4-2-6-2.5m12 4.5v-3.4a3 3 0 0 0-.8-2.3c2.7-.3 5.6-1.3 5.6-6a4.7 4.7 0 0 0-1.3-3.2 4.3 4.3 0 0 0-.1-3.2s-1-.3-3.4 1.3a11.6 11.6 0 0 0-6 0C6.6 2.6 5.6 2.9 5.6 2.9a4.3 4.3 0 0 0-.1 3.2A4.7 4.7 0 0 0 4.2 9.3c0 4.6 2.9 5.7 5.6 6a3 3 0 0 0-.8 2.3V21"/>'
	} as const;
	export type IconName = keyof typeof PATHS;
</script>

<script lang="ts">
	let { name, size = 20, stroke = 1.8 }: { name: IconName; size?: number; stroke?: number } = $props();
</script>

<!-- Ukuran lewat style inline supaya tidak kalah oleh aturan global `svg.i { width: 20px }`. -->
<svg class="i" viewBox="0 0 24 24" width={size} height={size} style:width="{size}px" style:height="{size}px" style:stroke-width={stroke} aria-hidden="true">
	{@html PATHS[name]}
</svg>
