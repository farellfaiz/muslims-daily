/**
 * Buat gambar pratinjau link (og.png, 1200x630) dari hero landing page.
 *
 * Cara pakai:  npm run build && npm run og
 * Hasilnya ditulis ke static/og.png (untuk build berikutnya) dan build/og.png (langsung terpakai).
 *
 * Tidak butuh server: Chrome headless membaca file dari folder build lewat request interception.
 * Jam dipalsukan ke waktu Maghrib di Jakarta supaya langit di pintu selalu sama.
 */
import { copyFileSync, existsSync, readFileSync } from 'node:fs';
import { dirname, extname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const build = join(root, 'build');
if (!existsSync(join(build, 'index.html'))) throw new Error('Folder build belum ada. Jalankan npm run build dulu.');

const chrome = [
	process.env.CHROME_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].find((p) => p && existsSync(p));
if (!chrome) throw new Error('Chrome atau Edge tidak ditemukan. Atur CHROME_PATH.');

const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.woff2': 'font/woff2',
	'.json': 'application/json'
};
const AT = new Date('2026-11-08T18:05:00+07:00').getTime();

const browser = await puppeteer.launch({ executablePath: chrome, headless: true, args: ['--hide-scrollbars'] });
try {
	const page = await browser.newPage();
	await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
	await page.emulateTimezone('Asia/Jakarta');
	await page.evaluateOnNewDocument((fixed) => {
		const RealDate = Date;
		const offset = fixed - RealDate.now();
		globalThis.Date = class extends RealDate {
			constructor(...a) {
				if (a.length) super(...a);
				else super(RealDate.now() + offset);
			}
			static now() {
				return RealDate.now() + offset;
			}
		};
	}, AT);
	await page.setRequestInterception(true);
	page.on('request', (req) => {
		const u = new URL(req.url());
		if (u.host !== 'landing.local') return req.abort();
		let file = join(build, decodeURIComponent(u.pathname));
		if (u.pathname.endsWith('/')) file = join(file, 'index.html');
		if (!existsSync(file)) return req.respond({ status: 404, body: '' });
		req.respond({ status: 200, contentType: TYPES[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
	});
	await page.goto('http://landing.local/', { waitUntil: 'networkidle0' });
	// Pratinjau link cukup judul dan pintunya: navigasi, tombol, dan petunjuk scroll disembunyikan.
	await page.addStyleTag({ content: 'nav, .cue, .note, .cta { display: none !important; }' });
	await page.evaluate(() => document.fonts.ready);
	await new Promise((r) => setTimeout(r, 2000));
	const out = join(root, 'static/og.png');
	await page.screenshot({ path: out });
	copyFileSync(out, join(build, 'og.png'));
	console.log('ok ->', out);
} finally {
	await browser.close();
}
