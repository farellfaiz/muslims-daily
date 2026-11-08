/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />

/**
 * Service worker Muslims Daily (strategi buildSW).
 *
 * Isinya sama dengan yang dulu dibuat otomatis oleh generateSW: seluruh aplikasi disimpan untuk
 * offline, cache lama dibersihkan, dan isi surat Al-Qur'an disimpan saat dibuka. Ditulis sendiri
 * supaya bisa menangani ketukan notifikasi adzan.
 */
import { clientsClaim } from '@vite-pwa/workbox-swkit/core';
import { ExpirationPlugin } from '@vite-pwa/workbox-swkit/expiration';
import { cleanupOutdatedCaches, createHandlerBoundToURL, precacheAndRoute } from '@vite-pwa/workbox-swkit/precaching';
import { NavigationRoute, registerRoute } from '@vite-pwa/workbox-swkit/routing';
import { CacheFirst } from '@vite-pwa/workbox-swkit/strategies';

declare const self: ServiceWorkerGlobalScope & { __WB_MANIFEST: Array<string | { url: string; revision: string | null }> };

// Pembaruan langsung aktif (registerType autoUpdate): halaman dimuat ulang diam-diam oleh pwa-register.
self.skipWaiting();
clientsClaim();

// Daftar file diisi saat build (globPatterns di vite.config.ts).
// Query diabaikan saat mencocokkan: /dzikir?set=salat, /doa/semua?cari, /doa/koleksi?id=... tetap
// mendapat halamannya sendiri dari cache. Tanpa ini, URL ber-query jatuh ke kerangka beranda ('/')
// dan halaman yang dibuka langsung atau saat offline malah menampilkan beranda.
precacheAndRoute(self.__WB_MANIFEST, { cleanURLs: true, ignoreURLParametersMatching: [/.*/] });
cleanupOutdatedCaches();

// Semua halaman jalan offline lewat kerangka aplikasi.
registerRoute(new NavigationRoute(createHandlerBoundToURL('/')));

// Isi surat Al-Qur'an (1,3 MB) tidak di-precache; disimpan saat surat dibuka.
registerRoute(
	({ url }) => url.pathname.startsWith('/data/quran/'),
	new CacheFirst({ cacheName: 'quran-surat', plugins: [new ExpirationPlugin({ maxEntries: 120 })] })
);

// Ketuk notifikasi adzan: pakai jendela aplikasi yang sudah terbuka, atau buka baru.
self.addEventListener('notificationclick', (event) => {
	event.notification.close();
	const path = (event.notification.data as { url?: string } | null)?.url ?? '/';
	const target = new URL(path, self.location.origin).href;
	event.waitUntil(
		(async () => {
			const windows = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
			const open = windows.find((c) => new URL(c.url).origin === self.location.origin);
			if (open) {
				await open.focus();
				if (open.url !== target) await open.navigate(target).catch(() => undefined);
				return;
			}
			await self.clients.openWindow(target);
		})()
	);
});
