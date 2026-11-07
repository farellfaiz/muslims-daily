/**
 * Jalankan perubahan tampilan dengan View Transitions bila tersedia.
 *
 * Pengaman: browser baru memanggil callback transisi saat frame berikutnya digambar. Bila halaman
 * sedang tidak digambar (tab di latar, jendela tertutup), callback bisa tertunda lama dan UI terasa
 * macet. Karena itu perubahan tetap dijalankan paling lambat setelah `maxWait` ms.
 */
export function withTransition(fn: () => void, maxWait = 200): void {
	if (typeof document === 'undefined' || !document.startViewTransition) return fn();
	let done = false;
	const run = () => {
		if (done) return;
		done = true;
		fn();
	};
	const timer = setTimeout(run, maxWait);
	quiet(
		document.startViewTransition(() => {
			clearTimeout(timer);
			run();
		})
	);
}

/** Transisi yang dilewati browser (tab di latar, navigasi cepat) menolak promise-nya; itu wajar, bukan error. */
export function quiet(t: ViewTransition): void {
	const noop = () => {};
	t.ready.catch(noop);
	t.finished.catch(noop);
	t.updateCallbackDone.catch(noop);
}
