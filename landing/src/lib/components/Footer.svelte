<script lang="ts">
	import { APP_URL, REPO_URL } from '#lib/config.ts';
</script>

<footer>
	<div class="wrap row">
		<div class="brand">
			<img src="/icons/icon-192.png" alt="" width="36" height="36" />
			<div>
				<b class="disp">Muslims Daily</b>
				<p>Dibuat oleh Farell Faiz Firmansyah. Open source, lisensi MIT.</p>
			</div>
		</div>
		<nav aria-label="Tautan footer">
			<a href={APP_URL}>App</a>
			<a href="#privasi">Privasi</a>
			<a href="#install">Install</a>
			<a href={REPO_URL}>GitHub</a>
		</nav>
	</div>
	<div class="wrap credit">
		<p>
			Desain terinspirasi dari Pillars. Jadwal salat dan arah kiblat dihitung pakai
			<a href="https://github.com/batoulapps/adhan-js">adhan</a>. Doa dari
			<a href="https://quran.nu.or.id/doa">NU Online</a>, teks Al-Qur'an dari quran.com dengan terjemahan Kemenag RI.
		</p>
	</div>
</footer>

<style>
	footer {
		padding: 44px 0 40px;
		background: var(--paper);
		border-top: 1px solid var(--line);
	}
	.row {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 24px;
	}
	.brand {
		display: flex;
		align-items: center;
		gap: 14px;
	}
	.brand img {
		border-radius: 10px;
	}
	.brand b {
		font-size: 19px;
	}
	.brand p {
		margin: 2px 0 0;
		font-size: 13.5px;
		color: var(--ink2);
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 6px 22px;
	}
	nav a {
		font-size: 14px;
		font-weight: 700;
		text-decoration: none;
		color: var(--ink2);
	}
	nav a:hover {
		color: var(--ink);
	}
	.credit {
		margin-top: 28px;
		padding-top: 22px;
		border-top: 1px dashed var(--line-strong);
	}
	.credit p {
		margin: 0;
		max-width: 760px;
		font-size: 13px;
		line-height: 1.65;
		color: var(--ink2);
	}
	.credit a {
		color: var(--ink2);
	}
</style>
