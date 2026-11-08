/**
 * Ambil screenshot asli aplikasi untuk landing page.
 *
 * Cara pakai:
 *   (cd .. && npm run build)        build aplikasinya dulu
 *   npm run screens                 -> membaca langsung folder ../build, tanpa server
 *   npm run screens -- ../build tracker              (hanya satu layar)
 *   npm run screens -- http://localhost:5174         (atau dari server yang sudah jalan)
 *
 * Tidak mengunduh browser: memakai Chrome atau Edge yang sudah terpasang
 * (atur CHROME_PATH bila letaknya lain).
 *
 * Setiap layar dibuka di HP virtual 390x797 (2x), zona waktu WIB, jam dipalsukan sesuai
 * `at` di src/lib/screens.json, lalu localStorage diisi data contoh (catatan salat,
 * progres dzikir, posisi baca) supaya layar terlihat seperti sedang dipakai.
 */
import { existsSync, mkdirSync, readFileSync } from 'node:fs';
import { dirname, extname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer-core';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const { screens } = JSON.parse(readFileSync(join(root, 'src/lib/screens.json'), 'utf8'));
const out = join(root, 'static/screens');
mkdirSync(out, { recursive: true });

const src = process.argv[2] ?? join(root, '../build');
const fromDir = !/^https?:/.test(src);
const dir = fromDir ? resolve(src) : '';
if (fromDir && !existsSync(join(dir, 'index.html')))
	throw new Error(`Build aplikasi tidak ada di ${dir}. Jalankan npm run build di folder root.`);
const base = fromDir ? 'http://app.local' : src.replace(/\/$/, '');
const TYPES = {
	'.html': 'text/html; charset=utf-8',
	'.js': 'text/javascript',
	'.css': 'text/css',
	'.json': 'application/json',
	'.png': 'image/png',
	'.webp': 'image/webp',
	'.svg': 'image/svg+xml',
	'.woff2': 'font/woff2',
	'.webmanifest': 'application/manifest+json'
};
/** Layani request ke http://app.local dari folder build (rute prerender tersimpan sebagai <rute>.html). */
function serve(req) {
	const u = new URL(req.url());
	if (u.host !== 'app.local') return req.abort();
	const p = decodeURIComponent(u.pathname);
	const file = [join(dir, p), join(dir, p + '.html'), join(dir, p, 'index.html')].find(
		(f) => extname(f) && existsSync(f)
	);
	if (!file) return req.respond({ status: 404, contentType: 'text/plain', body: 'not found' });
	req.respond({ status: 200, contentType: TYPES[extname(file)] ?? 'application/octet-stream', body: readFileSync(file) });
}
const only = process.argv[3];

const chrome = [
	process.env.CHROME_PATH,
	'C:/Program Files/Google/Chrome/Application/chrome.exe',
	'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
	'/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
	'/usr/bin/google-chrome',
	'/usr/bin/chromium'
].find((p) => p && existsSync(p));
if (!chrome) throw new Error('Chrome atau Edge tidak ditemukan. Atur CHROME_PATH.');

const PRAYERS = ['subuh', 'dzuhur', 'ashar', 'maghrib', 'isya'];

/** Tanggal kalender (YYYY-MM-DD) n hari sebelum tanggal ISO, tanpa urusan zona waktu. */
function dayKey(iso, back) {
	const [y, m, d] = iso.slice(0, 10).split('-').map(Number);
	const t = new Date(Date.UTC(y, m - 1, d - back));
	return t.toISOString().slice(0, 10);
}

/** Acak tapi selalu sama setiap kali dijalankan (mulberry32). */
function rng(seed) {
	return () => {
		seed = (seed + 0x6d2b79f5) | 0;
		let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

/**
 * Catatan salat contoh: streak 23 hari, rekor 41 hari, sisanya bervariasi seperti pemakaian nyata.
 * `today` = salat hari ini yang sudah dicentang (yang belum masuk waktunya memang terkunci di app).
 */
function trackerFor(at, today) {
	const rand = rng(1448);
	const logs = {};
	const full = () => Object.fromEntries(PRAYERS.map((p) => [p, true]));
	const some = (n) => Object.fromEntries(PRAYERS.filter((_, i) => i < n).map((p) => [p, true]));
	for (let back = 1; back <= 200; back++) {
		let log;
		if (back <= 23) log = full();
		else if (back === 24) log = some(3);
		else if (back <= 65) log = full();
		else if (back === 66) log = some(4);
		else {
			const r = rand();
			log = r < 0.68 ? full() : r < 0.9 ? some(3 + Math.floor(rand() * 2)) : some(Math.floor(rand() * 3));
		}
		if (Object.keys(log).length) logs[dayKey(at, back)] = log;
	}
	if (today.length) logs[dayKey(at, 0)] = Object.fromEntries(today.map((p) => [p, true]));
	return { logs, udzurDays: [], udzurSince: null };
}

/** Data tambahan per layar. */
const EXTRA = {
	'beranda-subuh': { today: ['subuh'] },
	'dzikir-pagi': {
		today: ['subuh'],
		// Tiga belas bacaan pertama selesai, Radhitu billah (3x) baru sekali: penghitungnya terlihat setengah jalan.
		storage: (at) => ({
			dzikir: {
				pagi: {
					date: at.slice(0, 10),
					n: { 1: 1, 2: 3, 20: 3, 21: 3, 3: 1, 4: 1, 5: 1, 6: 4, 7: 1, 8: 3, 9: 1, 10: 1, 11: 3, 12: 1 }
				}
			}
		}),
		scrollTo: '#dz-12'
	},
	tracker: { today: ['subuh', 'dzuhur'] },
	doa: { today: ['subuh', 'dzuhur', 'ashar'] },
	quran: { today: ['subuh', 'dzuhur', 'ashar', 'maghrib'], storage: () => ({ quran: { s: 67, a: 1 } }) },
	'beranda-malam': { today: [] },
	kiblat: { today: ['subuh', 'dzuhur'] },
	koreksi: {
		today: ['subuh', 'dzuhur'],
		storage: () => ({
			settings: {
				place: 'jakarta',
				label: 'Jakarta',
				lat: -6.2088,
				lng: 106.8456,
				method: 'kemenag',
				madhab: 'syafii',
				adjust: { maghrib: 2 },
				imsak: 10
			}
		})
	},
	'doa-kategori': { today: ['subuh', 'dzuhur', 'ashar'] }
};

/** Dijalankan di halaman sebelum skrip app mana pun: jam palsu + isi localStorage. */
function prepare(fixedMs, entries) {
	try {
		// Splash hanya sekali per sesi: tandai sudah tampil supaya tidak tertangkap di screenshot.
		sessionStorage.setItem('md:splash', '1');
	} catch {
		/* abaikan */
	}
	const RealDate = Date;
	const offset = fixedMs - RealDate.now();
	class FakeDate extends RealDate {
		constructor(...a) {
			if (a.length) super(...a);
			else super(RealDate.now() + offset);
		}
		static now() {
			return RealDate.now() + offset;
		}
	}
	globalThis.Date = FakeDate;
	try {
		for (const [k, v] of entries) localStorage.setItem(k, v);
	} catch {
		/* halaman tanpa storage (about:blank) */
	}
}

const browser = await puppeteer.launch({
	executablePath: chrome,
	headless: true,
	args: ['--hide-scrollbars', '--force-color-profile=srgb', '--lang=id-ID']
});

try {
	for (const s of screens) {
		if (only && s.id !== only) continue;
		const extra = EXTRA[s.id] ?? {};
		const fixed = new Date(s.at).getTime();
		const store = {
			theme: { mode: s.theme },
			visits: { visits: 3, lastSeen: fixed, dismissedAt: 0, installed: true },
			tour: { offered: true, done: true },
			lang: { code: 'id' },
			tracker: trackerFor(s.at, extra.today ?? []),
			...(extra.storage?.(s.at) ?? {})
		};
		const entries = Object.entries(store).map(([k, v]) => ['md:' + k, JSON.stringify(v)]);

		const page = await browser.newPage();
		await page.setViewport({ width: 390, height: 797, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
		await page.emulateTimezone('Asia/Jakarta');
		// Matikan animasi supaya hasil tidak tertangkap di tengah transisi.
		await page.emulateMediaFeatures([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
		await page.evaluateOnNewDocument(prepare, fixed, entries);
		if (fromDir) {
			await page.setRequestInterception(true);
			page.on('request', serve);
		}
		await page.goto(base + s.path, { waitUntil: 'networkidle2', timeout: 60_000 });
		await page.evaluate(() => document.fonts.ready);
		if (extra.scrollTo) {
			await page.evaluate((sel) => {
				const el = document.querySelector(sel);
				if (el) window.scrollTo(0, el.getBoundingClientRect().top + window.scrollY - 16);
			}, extra.scrollTo);
		}
		await new Promise((r) => setTimeout(r, 1200));
		const file = join(out, `${s.id}.webp`);
		await page.screenshot({ path: file, type: 'webp', quality: 82 });
		console.log('ok', s.id, '->', file);
		await page.close();
	}
} finally {
	await browser.close();
}
