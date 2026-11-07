import adapter from '@sveltejs/adapter-static';
import { withPwa } from '@vite-pwa/sveltekit';
import { defineConfig } from 'vite';

// SvelteKit 3: konfigurasi kit tinggal di sini (svelte.config.js sudah tidak dipakai).
// withPwa membungkus plugin sveltekit() sekaligus memasang service worker + manifest.
export default defineConfig({
	plugins: [
		withPwa(
			{
				// Semua halaman di-prerender jadi file statis: cepat dibuka, bisa di-host di mana saja
				// (Vercel, Cloudflare Pages, GitHub Pages) tanpa server.
				adapter: adapter({ fallback: '404.html' })
			},
			{
				strategies: 'generateSW',
				base: '/',
				scope: '/',
				registerType: 'autoUpdate',
				injectRegister: false,
				manifest: {
					name: 'Muslims Daily',
					short_name: 'Muslims Daily',
					description: 'Jadwal salat, tracker salat, dan kumpulan doa harian. Ringan dan bisa offline.',
					lang: 'id',
					start_url: '/',
					scope: '/',
					display: 'standalone',
					orientation: 'portrait',
					background_color: '#FAF6F1',
					theme_color: '#FAF6F1',
					categories: ['lifestyle', 'education', 'books'],
					icons: [
						{ src: '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
						{ src: '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
						{ src: '/icons/maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
					],
					shortcuts: [
						{ name: 'Tracker salat', url: '/tracker', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] },
						{ name: 'Kumpulan doa', url: '/doa', icons: [{ src: '/icons/icon-192.png', sizes: '192x192' }] }
					]
				},
				generateSW: {
					// Seluruh aplikasi (termasuk font dan semua doa) di-precache: setelah sekali dibuka,
					// semuanya jalan tanpa internet.
					globPatterns: ['**/*.{js,css,html,svg,png,webp,woff2,json}'],
					// Subset Vietnam hanya diunduh browser bila memang dibutuhkan, tidak perlu disimpan offline.
					globIgnores: ['**/*vietnamese*'],
					navigateFallback: '/',
					cleanupOutdatedCaches: true
				}
			}
		)
	]
});
