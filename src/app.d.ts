// Lihat https://svelte.dev/docs/kit/types#app.d.ts
declare global {
	namespace App {}
	interface Window {
		/** dipanggil saat aplikasi siap; splash di app.html lalu menutup diri */
		__splashDone?: () => void;
		/** splash sudah hilang (atau tidak ditampilkan sesi ini); event 'splash:gone' juga dikirim */
		__splashGone?: boolean;
	}
}

export {};
