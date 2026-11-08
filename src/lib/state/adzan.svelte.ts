import { formatTime } from '#lib/date.ts';
import { alertTag, alertText, alertsFor, defaultAdzanPrefs, dueAlerts, notifSupport, type AdzanPrefs, type Alert, type NotifSupport } from '#lib/adzan.ts';
import { detectPlatform } from '#lib/install.ts';
import type { PrayerKey } from '#lib/prayer.ts';
import { Persisted } from './persisted.svelte.ts';
import { schedule, settings, toast } from './app.svelte.ts';

export const adzanPrefs = new Persisted<AdzanPrefs>('adzan', defaultAdzanPrefs());

/** Jam diperiksa sesering ini. Browser memperlambatnya jadi sekitar semenit sekali saat di latar. */
const TICK = 15_000;

/**
 * Pengelola notifikasi adzan: izin browser, sakelar, dan penjadwal yang memunculkan notifikasi
 * saat waktu salat masuk.
 */
class Adzan {
	/** false selama prerender */
	ready = $state(false);
	support = $state<NotifSupport>('unsupported');
	permission = $state<NotificationPermission>('default');
	#timer: ReturnType<typeof setInterval> | undefined;
	/** pemeriksaan terakhir; notifikasi sebelum aplikasi dibuka tidak dimunculkan */
	#last = new Date();

	get prefs() {
		return adzanPrefs.value;
	}
	/** benar-benar akan memunculkan notifikasi */
	get active() {
		return this.support === 'ok' && this.permission === 'granted' && this.prefs.enabled;
	}

	start() {
		const nav = navigator as Navigator & { standalone?: boolean };
		const standalone = matchMedia('(display-mode: standalone)').matches || nav.standalone === true;
		const ios = detectPlatform(navigator.userAgent, navigator.maxTouchPoints) === 'ios';
		this.support = notifSupport('Notification' in window, 'serviceWorker' in navigator, ios, standalone);
		this.permission = this.support === 'ok' ? Notification.permission : 'default';
		this.ready = true;

		this.#last = new Date();
		this.#timer = setInterval(() => this.check(), TICK);
		// Kembali ke aplikasi: periksa segera, dan izin mungkin diubah dari pengaturan browser.
		const onVisible = () => {
			if (this.support === 'ok') this.permission = Notification.permission;
			this.check();
		};
		document.addEventListener('visibilitychange', onVisible);
		return () => {
			clearInterval(this.#timer);
			document.removeEventListener('visibilitychange', onVisible);
		};
	}

	/** Munculkan notifikasi yang jatuh tempo sejak pemeriksaan terakhir. */
	check() {
		const now = new Date();
		const from = this.#last;
		this.#last = now;
		if (!this.active) return;
		// Rentang bisa melewati tengah malam, jadi jadwal kemarin dan hari ini sama-sama diperiksa.
		const { yesterday, today } = schedule(now);
		const all = [...alertsFor(yesterday, this.prefs), ...alertsFor(today, this.prefs)];
		for (const a of dueAlerts(all, from, now)) void this.#show(a);
	}

	async #show(a: Alert) {
		const { title, body } = alertText(a, settings.value.label, this.prefs.before);
		await notify(title, body, alertTag(a));
	}

	/** Minta izin lalu nyalakan. Harus dari ketukan pengguna. */
	async enable() {
		if (this.support !== 'ok') return;
		if (Notification.permission !== 'granted') this.permission = await Notification.requestPermission();
		if (this.permission === 'granted') {
			adzanPrefs.value = { ...this.prefs, enabled: true };
			this.#last = new Date();
			toast.say('Notifikasi adzan aktif');
		} else if (this.permission === 'denied') {
			toast.say('Izin notifikasi ditolak browser');
		}
	}

	disable() {
		adzanPrefs.value = { ...this.prefs, enabled: false };
	}

	toggle(key: PrayerKey) {
		adzanPrefs.value = { ...this.prefs, on: { ...this.prefs.on, [key]: !this.prefs.on[key] } };
	}

	setBefore(min: number) {
		adzanPrefs.value = { ...this.prefs, before: min };
	}

	/** Notifikasi contoh, supaya pengguna tahu tampilannya dan izinnya benar-benar jalan. */
	async test() {
		const now = new Date();
		const { today, tomorrow } = schedule(now);
		const plain = { ...this.prefs, enabled: true, before: 0 };
		const next = [...alertsFor(today, plain), ...alertsFor(tomorrow, plain)].find((a) => a.at > now);
		const ok = await notify(
			'Notifikasi adzan aktif',
			next ? `Berikutnya ${next.name} pukul ${formatTime(next.at)} · ${settings.value.label}` : 'Notifikasi muncul saat waktu salat masuk.',
			'adzan-test'
		);
		if (!ok) toast.say('Notifikasi tidak bisa dimunculkan');
	}
}

/** Lewat service worker bila ada (wajib di Android), selain itu langsung dari halaman. */
async function notify(title: string, body: string, tag: string): Promise<boolean> {
	const opts: NotificationOptions & { renotify?: boolean; vibrate?: number[] } = {
		body,
		tag,
		icon: '/icons/icon-192.png',
		badge: '/icons/icon-192.png',
		lang: 'id',
		vibrate: [200, 100, 200],
		data: { url: '/' }
	};
	try {
		const reg = await navigator.serviceWorker?.getRegistration();
		if (reg) {
			await reg.showNotification(title, opts);
			return true;
		}
		new Notification(title, opts);
		return true;
	} catch {
		return false;
	}
}

export const adzan = new Adzan();

/** Untuk subjudul baris di Lainnya. */
export function adzanSummary(): string {
	if (!adzan.ready) return '';
	if (adzan.support === 'ios-install') return 'Pasang di layar utama dulu';
	if (adzan.support === 'unsupported') return 'Tidak didukung browser ini';
	if (adzan.permission === 'denied') return 'Izin ditolak browser';
	if (!adzan.active) return 'Mati';
	const on = Object.values(adzan.prefs.on).filter(Boolean).length;
	const before = adzan.prefs.before ? ` · ${adzan.prefs.before} menit sebelumnya` : '';
	return on === 5 ? `Kelima waktu${before}` : on === 0 ? 'Semua waktu dimatikan' : `${on} waktu${before}`;
}
