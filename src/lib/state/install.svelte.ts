import { detectPlatform, emptyVisits, shouldOffer, touchVisit, type InstallPlatform, type VisitState } from '#lib/install.ts';
import { Persisted } from './persisted.svelte.ts';
import { toast } from './app.svelte.ts';

/** Event pasang dari Chrome/Edge. Belum ada di tipe bawaan TypeScript. */
interface BeforeInstallPromptEvent extends Event {
	prompt(): Promise<void>;
	userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

declare global {
	interface Window {
		/** ditangkap skrip kecil di app.html, sebelum aplikasi selesai dimuat */
		__installPrompt?: BeforeInstallPromptEvent;
	}
}

const visits = new Persisted<VisitState>('visits', emptyVisits());

/**
 * Status "pasang di layar utama": apakah sudah terpasang, cara memasang di browser ini,
 * dan kapan kartu ajakan ditampilkan.
 */
class Install {
	/** false selama prerender; komponen menunggu ini supaya tidak berkedip */
	ready = $state(false);
	/** sedang dibuka sebagai aplikasi terpasang (layar penuh) */
	standalone = $state(false);
	platform = $state<InstallPlatform>('manual');
	/** lembar panduan sedang terbuka */
	sheet = $state(false);
	#prompt: BeforeInstallPromptEvent | null = null;

	get visits() {
		return visits.value.visits;
	}
	get installed() {
		return this.standalone || visits.value.installed;
	}
	get offer() {
		return this.ready && !this.standalone && shouldOffer(visits.value);
	}

	start() {
		const nav = navigator as Navigator & { standalone?: boolean };
		const standalone = matchMedia('(display-mode: standalone)');
		this.standalone = standalone.matches || nav.standalone === true;
		if (this.standalone && !visits.value.installed) visits.value = { ...visits.value, installed: true };

		const detect = () => (this.platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints, !!this.#prompt));
		this.#prompt = window.__installPrompt ?? null;
		detect();

		const onPrompt = (e: Event) => {
			e.preventDefault(); // tahan bilah bawaan Chrome; ditawarkan lewat tombol kita sendiri
			this.#prompt = e as BeforeInstallPromptEvent;
			detect();
		};
		const onInstalled = () => {
			this.#prompt = null;
			this.sheet = false;
			visits.value = { ...visits.value, installed: true };
			detect();
			toast.say('Terpasang. Buka dari layar utama');
		};
		const onMode = () => (this.standalone = standalone.matches);
		// Kunjungan dihitung saat dibuka dan saat kembali ke tab setelah lama ditinggal.
		const touch = () => {
			if (document.visibilityState === 'visible') visits.value = touchVisit(visits.value, Date.now());
		};
		const leave = () => {
			if (document.visibilityState === 'hidden') visits.value = { ...visits.value, lastSeen: Date.now() };
		};

		touch();
		this.ready = true;
		window.addEventListener('beforeinstallprompt', onPrompt);
		window.addEventListener('appinstalled', onInstalled);
		standalone.addEventListener('change', onMode);
		document.addEventListener('visibilitychange', touch);
		document.addEventListener('visibilitychange', leave);
		return () => {
			window.removeEventListener('beforeinstallprompt', onPrompt);
			window.removeEventListener('appinstalled', onInstalled);
			standalone.removeEventListener('change', onMode);
			document.removeEventListener('visibilitychange', touch);
			document.removeEventListener('visibilitychange', leave);
		};
	}

	/** Tombol "Pasang": dialog bawaan bila ada, selain itu lembar panduan. */
	async ask() {
		const p = this.#prompt;
		if (!p) return void (this.sheet = true);
		await p.prompt();
		const { outcome } = await p.userChoice;
		// Event hanya bisa dipakai sekali; Chrome mengirim yang baru bila masih bisa dipasang.
		this.#prompt = null;
		this.platform = detectPlatform(navigator.userAgent, navigator.maxTouchPoints, false);
		if (outcome === 'dismissed') this.dismiss();
	}

	/** Tutup kartu ajakan untuk kunjungan ini. */
	dismiss() {
		visits.value = { ...visits.value, dismissedAt: visits.value.visits };
	}
}

export const install = new Install();
