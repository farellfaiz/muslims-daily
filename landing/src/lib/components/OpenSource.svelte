<script lang="ts">
	import { REPO_URL } from '#lib/config.ts';
	import { reveal } from '#lib/scroll.ts';
	import Icon from './Icon.svelte';

	// Aturan konten dari README repo (bagian "Kontribusi konten doa dan dzikir").
	const RULES = [
		{ title: 'Wajib ada sumber', text: 'Ayat: nama surah dan nomor ayat. Hadis: siapa perawinya.' },
		{ title: 'Cek dari rujukan', text: 'Mushaf Kemenag, kitab hadis, atau Hisnul Muslim. Bukan dari ingatan.' },
		{ title: 'Jujur soal derajat', text: "Doa yang bukan dari Al-Qur'an atau hadis boleh masuk, asal keterangannya jujur." }
	];
</script>

<section id="kode" class="sec oss" aria-labelledby="oss-h">
	<div class="wrap grid">
		<div class="text rv" use:reveal>
			<span class="label">Open source</span>
			<h2 class="h2" id="oss-h">Kodenya terbuka, sumber doanya jelas</h2>
			<p class="lead">
				Semua kodenya ada di GitHub dengan lisensi MIT. Untuk konten ibadah aturannya ketat: teks Arab diambil dari
				rujukan, bukan dari ingatan, dan tiap bacaan wajib ada sumbernya.
			</p>
			<p class="lead">Mau bantu cek bacaan atau benerin bug? Pull request-nya ditunggu.</p>
			<div class="cta">
				<a class="btn primary" href={REPO_URL}><Icon name="github" size={18} /> Lihat di GitHub</a>
			</div>
		</div>

		<figure class="doc rv" use:reveal style:--d="120ms">
			<figcaption>
				<span class="dots" aria-hidden="true"><i></i><i></i><i></i></span>
				<span class="file num">README.md</span>
			</figcaption>
			<div class="body">
				<p class="label">Aturan konten doa & dzikir</p>
				<ol>
					{#each RULES as r, i (r.title)}
						<li>
							<span class="n num">{i + 1}</span>
							<div>
								<b>{r.title}</b>
								<span>{r.text}</span>
							</div>
						</li>
					{/each}
				</ol>
			</div>
		</figure>
	</div>
</section>

<style>
	.oss {
		background: var(--paper);
	}
	.grid {
		display: grid;
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
	.doc {
		margin: 0;
		border-radius: var(--r-lg);
		background: var(--card);
		border: 1px solid var(--line);
		box-shadow: var(--shadow-lg);
		overflow: hidden;
	}
	figcaption {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 18px;
		border-bottom: 1px solid var(--line);
		background: var(--sunk);
	}
	.dots {
		display: flex;
		gap: 6px;
	}
	.dots i {
		width: 10px;
		height: 10px;
		border-radius: 50%;
		background: var(--line-strong);
	}
	.file {
		font-size: 13px;
		font-weight: 700;
		color: var(--ink2);
	}
	.body {
		padding: 24px 24px 10px;
	}
	.body .label {
		margin: 0 0 8px;
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		gap: 16px;
		padding: 16px 0;
	}
	li + li {
		border-top: 1px dashed var(--line-strong);
	}
	.n {
		flex: none;
		display: grid;
		place-items: center;
		width: 30px;
		height: 30px;
		border-radius: 50%;
		background: var(--peach-soft);
		color: var(--peach-ink);
		font-size: 13px;
		font-weight: 800;
	}
	li b {
		display: block;
		font-size: 16px;
	}
	li span {
		display: block;
		margin-top: 3px;
		font-size: 14.5px;
		line-height: 1.55;
		color: var(--ink2);
	}
	@media (min-width: 960px) {
		.grid {
			grid-template-columns: 1fr 1fr;
			gap: 80px;
		}
	}
</style>
