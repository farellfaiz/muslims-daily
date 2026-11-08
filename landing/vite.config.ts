import adapter from '@sveltejs/adapter-static';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';

// Landing page muslimsdaily.id: satu halaman, di-prerender jadi file statis.
// Proyek ini terpisah dari aplikasinya (folder root) supaya bisa di-deploy sendiri,
// mis. Vercel atau Cloudflare Pages dengan Root Directory = landing.
export default defineConfig({
	plugins: [sveltekit({ adapter: adapter() })]
});
