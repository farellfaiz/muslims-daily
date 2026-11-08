<script lang="ts">
	import { REPO_URL } from '#lib/config.ts';
	import { reveal } from '#lib/scroll.ts';
	import Icon from './Icon.svelte';

	const CLONE = `git clone ${REPO_URL}`;
</script>

<section id="kode" class="sec oss" aria-labelledby="oss-h">
	<div class="wrap grid">
		<div class="text rv" use:reveal>
			<span class="label">Open source</span>
			<h2 class="h2" id="oss-h">Kodenya terbuka</h2>
			<p class="lead">Semua kodenya ada di GitHub dengan lisensi MIT. Bisa dibaca, dijalankan sendiri, atau dipakai untuk proyekmu.</p>
			<p class="lead">Mau bantu cek bacaan atau benerin bug? <span class="nw">Pull request-nya</span> ditunggu.</p>
			<div class="cta">
				<a class="btn primary" href={REPO_URL}><Icon name="github" size={18} /> Lihat di GitHub</a>
			</div>
		</div>

		<figure class="term rv" use:reveal style:--d="120ms">
			<figcaption>
				<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
				<span class="file">Terminal</span>
			</figcaption>
			<pre><code><span class="p">$</span> {CLONE}
<span class="p">$</span> cd muslims-daily
<span class="p">$</span> npm install
<span class="p">$</span> npm run dev</code></pre>
		</figure>
	</div>
</section>

<style>
	.oss {
		background: var(--paper);
	}
	.grid {
		display: grid;
		grid-template-columns: minmax(0, 1fr);
		gap: 48px;
		align-items: center;
	}
	.text .label {
		display: block;
		margin-bottom: 14px;
	}
	.text .lead {
		margin-top: 18px;
	}
	.cta {
		margin-top: 28px;
	}
	.term {
		min-width: 0;
		margin: 0;
		border-radius: var(--r-lg);
		background: #17253f;
		color: #e9eef4;
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}
	figcaption {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px;
		border-bottom: 1px solid rgba(190, 212, 236, 0.12);
	}
	.dots {
		display: flex;
		gap: 6px;
	}
	.dots i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: rgba(190, 212, 236, 0.25);
	}
	.file {
		font-size: 13px;
		font-weight: 700;
		color: #a9b8c8;
	}
	pre {
		margin: 0;
		padding: 22px 24px 26px;
		white-space: pre-wrap;
		overflow-wrap: anywhere;
		font-family: ui-monospace, SFMono-Regular, Consolas, 'Liberation Mono', monospace;
		font-size: clamp(13px, 1.15vw, 15px);
		line-height: 2;
	}
	.p {
		color: #f1b493;
		user-select: none;
	}
	@media (min-width: 960px) {
		.grid {
			grid-template-columns: 1fr 1fr;
			gap: 80px;
		}
	}
</style>
