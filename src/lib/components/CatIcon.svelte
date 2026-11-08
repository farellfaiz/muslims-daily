<script lang="ts" module>
	// Ikon garis untuk tiap kategori doa NU Online, digambar sendiri dengan gaya yang sama
	// seperti Icon.svelte (24x24, garis 1.8). Kategori baru tanpa ikon memakai ikon buku.
	const PATHS: Record<string, string> = {
		'doa-keseharian': '<path d="M4 11l8-6.5 8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z"/><path d="M10 20v-4.5a2 2 0 0 1 4 0V20"/>',
		'doa-rezeki': '<path d="M12 20V9"/><path d="M12 9c0-2.5 2-4.5 4.5-4.5 0 2.5-2 4.5-4.5 4.5zM12 9C12 6.5 10 4.5 7.5 4.5 7.5 7 9.5 9 12 9z"/><path d="M12 14.5c0-2.2 1.8-4 4-4 0 2.2-1.8 4-4 4zM12 14.5c0-2.2-1.8-4-4-4 0 2.2 1.8 4 4 4z"/>',
		'doa-tolak-bala': '<path d="M12 3.5l7 2.6v5.2c0 4.4-3 7.7-7 9.2-4-1.5-7-4.8-7-9.2V6.1z"/><path d="M9 12l2.2 2.2L15.5 10"/>',
		'doa-kesehatan': '<path d="M12 20s-7-4.4-7-10a4 4 0 0 1 7-2.6A4 4 0 0 1 19 10c0 5.6-7 10-7 10z"/><path d="M7.5 12h2.5l1.2-2 1.6 4 1.2-2h2.5"/>',
		'doa-perjalanan': '<circle cx="12" cy="12" r="8.5"/><path d="M15.5 8.5l-2 5-5 2 2-5z"/>',
		'doa-ilmu': '<path d="M4 5.5C6.5 4 9.5 4 12 6c2.5-2 5.5-2 8-.5V19c-2.5-1.5-5.5-1.5-8 .5-2.5-2-5.5-2-8-.5z"/><path d="M12 6v13.5"/>',
		'doa-waktu-tertentu': '<path d="M18.5 14.5A7 7 0 0 1 9.5 5.5a7 7 0 1 0 9 9z"/><path d="M17 4v3M15.5 5.5h3"/>',
		'doa-kualitas-diri': '<path d="M12 3.5l2 5.3 5.5.4-4.2 3.6 1.3 5.4L12 15.3l-4.6 2.9 1.3-5.4-4.2-3.6 5.5-.4z"/>',
		'doa-pernikahan-rumah-tangga': '<circle cx="9" cy="14" r="5"/><circle cx="15" cy="14" r="5"/><path d="M10.5 5.5L12 4l1.5 1.5L12 7z"/>',
		'doa-hamil-dan-persalinan': '<circle cx="12" cy="8" r="3.5"/><path d="M5.5 20a6.5 6.5 0 0 1 13 0"/><path d="M10.6 7.8h.01M13.4 7.8h.01"/>',
		'doa-wudhu': '<path d="M12 3.5s6 6.4 6 10.5a6 6 0 0 1-12 0c0-4.1 6-10.5 6-10.5z"/><path d="M9.2 14.5a2.8 2.8 0 0 0 2.8 2.8"/>',
		'doa-para-nabi-di-al-quran': '<path d="M7 4h9.5a2.5 2.5 0 0 1 0 5H7"/><path d="M7 4a2.5 2.5 0 0 0 0 5v8.5a2.5 2.5 0 0 0 2.5 2.5H17"/><path d="M17 9v8.5a2.5 2.5 0 0 0 2.5 2.5"/><path d="M10 13h4"/>',
		'doa-baca-al-quran': '<path d="M4 9.5c2.7-1 5.3-.7 8 1.5 2.7-2.2 5.3-2.5 8-1.5v8c-2.7-1-5.3-.7-8 1.5-2.7-2.2-5.3-2.5-8-1.5z"/><path d="M5 21l7-3 7 3"/><path d="M12 3.5l1.2 2.3L12 8l-1.2-2.2z"/>',
		'doa-shalat': '<path d="M5 20V11a7 7 0 0 1 14 0v9"/><path d="M3.5 20h17"/><path d="M9.5 20v-5a2.5 2.5 0 0 1 5 0v5"/><path d="M12 4V2.5"/>',
		'doa-haji-umrah': '<path d="M4 8l8-3.5L20 8v9.5L12 21l-8-3.5z"/><path d="M4 8l8 3.5L20 8M12 11.5V21"/><path d="M4 11.5l8 3.5 8-3.5"/>',
		'doa-pagi-petang': '<path d="M3.5 17h17"/><path d="M7 17a5 5 0 0 1 10 0"/><path d="M12 5v2.5M5.6 9.6l1.8 1.8M18.4 9.6l-1.8 1.8"/><path d="M8 20.5h8"/>',
		'doa-al-quran': '<path d="M5 4.5h10.5a3.5 3.5 0 0 1 3.5 3.5v11.5H8.5A3.5 3.5 0 0 1 5 16z"/><path d="M5 16a3.5 3.5 0 0 1 3.5-3.5H19"/><path d="M12 6.5l.9 1.8 2 .3-1.45 1.4.35 2-1.8-.95-1.8.95.35-2L9.1 8.6l2-.3z"/>',
		'doa-ampunan': '<path d="M4.5 12a7.5 7.5 0 1 0 2.2-5.3"/><path d="M4.5 4v3.5H8"/><path d="M12 15.5s-3-1.8-3-3.8a1.6 1.6 0 0 1 3-.8 1.6 1.6 0 0 1 3 .8c0 2-3 3.8-3 3.8z"/>',
		'doa-kematian': '<path d="M18 4c-7.5.5-12 4.5-12 11 0 1.7.6 3.3 1.5 4.5"/><path d="M18 4c1 8-3 14-10.5 15.5"/><path d="M6 20l5-6"/>'
	};
	const BOOK = PATHS['doa-ilmu'];
</script>

<script lang="ts">
	let { slug, size = 22 }: { slug: string; size?: number } = $props();
</script>

<svg class="i" viewBox="0 0 24 24" width={size} height={size} style:width="{size}px" style:height="{size}px" aria-hidden="true">
	{@html PATHS[slug] ?? BOOK}
</svg>
