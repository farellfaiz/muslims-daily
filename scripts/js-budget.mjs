// Cek anggaran JavaScript per halaman. Jalankan setelah `npm run build`:
//   node scripts/js-budget.mjs
//
// Untuk tiap halaman dihitung JS gzip yang benar-benar diunduh saat halaman itu dibuka:
// entri aplikasi + layout + kode halaman + semua impor statisnya. Gagal (exit 1) bila
// halaman terberat melewati anggaran. Total semua halaman ikut dicetak sebagai pantauan.

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

const BUDGET_KB = 100;
const root = path.join(import.meta.dirname, '..');
const client = path.join(root, '.svelte-kit/output/client');
const nodesDir = path.join(root, '.svelte-kit/generated/build/client-optimized/nodes');
if (!fs.existsSync(path.join(client, '.vite/manifest.json'))) {
	console.error('Belum ada hasil build. Jalankan `npm run build` dulu.');
	process.exit(1);
}

const m = JSON.parse(fs.readFileSync(path.join(client, '.vite/manifest.json'), 'utf8'));
const gzCache = new Map();
const gz = (f) => {
	if (!gzCache.has(f)) gzCache.set(f, zlib.gzipSync(fs.readFileSync(path.join(client, f))).length);
	return gzCache.get(f);
};
const kb = (b) => (b / 1024).toFixed(1);
const nodeKey = (n) => Object.keys(m).find((k) => k.endsWith(`client-optimized/nodes/${n}.js`));
const entry = Object.keys(m).filter((k) => /client-optimized\/(app|start)\.js$/.test(k));

/** semua file JS yang ikut diunduh dari kunci-kunci manifest ini (impor statis) */
function files(keys) {
	const seen = new Set();
	const go = (k) => {
		if (!k || seen.has(k) || !m[k]) return;
		seen.add(k);
		for (const i of m[k].imports ?? []) go(i);
	};
	keys.forEach(go);
	return new Set([...seen].map((k) => m[k].file).filter((f) => f.endsWith('.js')));
}
const sum = (set) => [...set].reduce((a, f) => a + gz(f), 0);

const shared = files([...entry, nodeKey(0)]);
const pages = [];
for (const f of fs.readdirSync(nodesDir)) {
	const n = f.replace('.js', '');
	if (n === '0' || n === '1') continue; // layout dan halaman error
	const src = fs.readFileSync(path.join(nodesDir, f), 'utf8').match(/src\/routes\/([^"']*)\/?\+page/);
	const route = '/' + (src?.[1] ?? `node ${n}`).replace(/\/$/, '');
	pages.push({ route, bytes: sum(files([...entry, nodeKey(0), nodeKey(n)])) });
}
pages.sort((a, b) => b.bytes - a.bytes);

let total = 0;
const walk = (d) =>
	fs.readdirSync(d, { withFileTypes: true }).forEach((e) => {
		const q = path.join(d, e.name);
		if (e.isDirectory()) walk(q);
		else if (q.endsWith('.js')) total += zlib.gzipSync(fs.readFileSync(q)).length;
	});
walk(path.join(client, '_app'));

console.log(`Bagian bersama (semua halaman): ${kb(sum(shared))} KB`);
console.log('Halaman terberat:');
for (const p of pages.slice(0, 5)) console.log(`  ${kb(p.bytes).padStart(6)} KB  ${p.route}`);
console.log(`Total semua halaman (pantauan): ${kb(total)} KB`);

const worst = pages[0];
if (worst.bytes / 1024 > BUDGET_KB) {
	console.error(`\nMelewati anggaran: ${worst.route} ${kb(worst.bytes)} KB > ${BUDGET_KB} KB`);
	process.exit(1);
}
console.log(`\nAman: halaman terberat ${kb(worst.bytes)} KB dari anggaran ${BUDGET_KB} KB.`);
