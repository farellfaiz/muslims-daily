<script lang="ts">
	import { APP_HOST } from '#lib/config.ts';
	import { reveal } from '#lib/scroll.ts';
	import Icon, { type IconName } from './Icon.svelte';

	const GUIDES: { name: string; browser: string; icon: IconName; steps: { icon: IconName; text: string }[] }[] = [
		{
			name: 'Android',
			browser: 'Chrome',
			icon: 'device',
			steps: [
				{ icon: 'compass', text: `Buka ${APP_HOST} di Chrome.` },
				{ icon: 'kebab', text: 'Tap menu titik tiga di pojok kanan atas.' },
				{ icon: 'addSquare', text: 'Pilih Install app atau Add to Home screen.' }
			]
		},
		{
			name: 'iPhone',
			browser: 'Safari',
			icon: 'device',
			steps: [
				{ icon: 'compass', text: `Buka ${APP_HOST} di Safari.` },
				{ icon: 'share', text: 'Tap tombol Share di bar bawah.' },
				{ icon: 'addSquare', text: 'Pilih Add to Home Screen, lalu Add.' }
			]
		}
	];
</script>

<section id="install" class="sec install pattern on-sky" aria-labelledby="install-h">
	<div class="wrap">
		<div class="sec-head rv" use:reveal>
			<span class="label">Install</span>
			<h2 class="h2" id="install-h">Install ke home screen, nggak perlu Play Store</h2>
			<p class="lead">
				Muslims Daily itu PWA, app berbasis web yang bisa di-install tanpa Play Store atau App Store. Ukurannya kecil dan
				update-nya jalan sendiri.
			</p>
		</div>

		<div class="guides">
			{#each GUIDES as g, gi (g.name)}
				<article class="guide rv" use:reveal style:--d="{gi * 100}ms">
					<header>
						<span class="ico"><Icon name={g.icon} size={22} /></span>
						<div>
							<h3>{g.name}</h3>
							<p>via {g.browser}</p>
						</div>
					</header>
					<ol>
						{#each g.steps as st, i (i)}
							<li>
								<span class="star" aria-hidden="true">
									<svg viewBox="0 0 34 34"
										><g fill="none" stroke="currentColor" stroke-width="1"
											><rect x="8" y="8" width="18" height="18" rx="1.5" /><rect
												x="8"
												y="8"
												width="18"
												height="18"
												rx="1.5"
												transform="rotate(45 17 17)"
											/></g
										></svg
									>
									<b class="num">{i + 1}</b>
								</span>
								<span class="step">{st.text}</span>
								<span class="hint"><Icon name={st.icon} size={18} /></span>
							</li>
						{/each}
					</ol>
				</article>
			{/each}
		</div>
		<p class="desk rv" use:reveal>
			<Icon name="laptop" size={18} /> Di laptop juga bisa: klik ikon install di address bar Chrome atau Edge.
		</p>
	</div>
</section>

<style>
	.guides {
		display: grid;
		gap: 16px;
	}
	.guide {
		padding: 26px 24px 18px;
		border-radius: var(--r-lg);
		background: var(--card);
		border: 1px solid var(--line);
		box-shadow: var(--shadow);
	}
	header {
		display: flex;
		align-items: center;
		gap: 14px;
		padding-bottom: 18px;
		border-bottom: 1px dashed var(--line-strong);
	}
	.ico {
		display: grid;
		place-items: center;
		width: 46px;
		height: 46px;
		border-radius: 14px;
		background: var(--navy-soft);
		color: var(--navy);
	}
	h3 {
		margin: 0;
		font-family: var(--f-disp);
		font-weight: 500;
		font-size: 26px;
		letter-spacing: -0.02em;
		line-height: 1.1;
	}
	header p {
		margin: 2px 0 0;
		font-size: 13.5px;
		font-weight: 600;
		color: var(--ink2);
	}
	ol {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		align-items: center;
		gap: 14px;
		padding: 14px 0;
	}
	li + li {
		border-top: 1px solid var(--line);
	}
	.star {
		position: relative;
		width: 34px;
		height: 34px;
		flex: none;
		display: grid;
		place-items: center;
		color: var(--peach);
	}
	.star svg {
		position: absolute;
		inset: 0;
	}
	.star b {
		position: relative;
		font-size: 12px;
		font-weight: 800;
		color: var(--navy);
	}
	.step {
		flex: 1;
		font-size: 15.5px;
		line-height: 1.5;
		font-weight: 600;
	}
	.hint {
		display: grid;
		place-items: center;
		width: 36px;
		height: 36px;
		border-radius: 11px;
		background: var(--sunk);
		color: var(--ink2);
		flex: none;
	}
	.desk {
		display: flex;
		align-items: center;
		gap: 10px;
		margin: 26px 0 0;
		font-size: 14.5px;
		font-weight: 600;
		color: var(--ink2);
	}
	@media (min-width: 820px) {
		.guides {
			grid-template-columns: 1fr 1fr;
		}
	}
</style>
