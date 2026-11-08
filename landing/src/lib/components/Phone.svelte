<script lang="ts" module>
	export interface Shot {
		id: string;
		at: string;
		theme: string;
		alt: string;
	}
</script>

<script lang="ts">
	/*
		Bingkai HP berisi screenshot asli aplikasinya (static/screens, dibuat oleh scripts/screenshots.mjs).
		Jam di status bar sama dengan jam saat screenshot diambil. Bila ada beberapa layar,
		yang aktif masuk dari bawah dan menutup layar sebelumnya.
	*/
	let { shots, active = 0, eager = false }: { shots: Shot[]; active?: number; eager?: boolean } = $props();

	const clockOf = (at: string) => at.slice(11, 16).replace(':', '.');
</script>

<div class="phone">
	<div class="bezel">
		<div class="screen">
			{#each shots as s, i (s.id)}
				<figure class="shot" class:on={i === active} class:dark={s.theme === 'dark'}>
					<div class="bar" aria-hidden="true">
						<span class="time num">{clockOf(s.at)}</span>
						<span class="sys">
							<svg viewBox="0 0 18 12"><rect x="0" y="8" width="3" height="4" rx="1" /><rect x="5" y="5.5" width="3" height="6.5" rx="1" /><rect x="10" y="3" width="3" height="9" rx="1" /><rect x="15" y="0" width="3" height="12" rx="1" /></svg>
							<svg viewBox="0 0 16 12"><path d="M8 11.6l2.6-3a3.6 3.6 0 0 0-5.2 0zM3.5 6.3a6.4 6.4 0 0 1 9 0l1.6-1.8a8.8 8.8 0 0 0-12.2 0zM0 2.6l1.6 1.8a9.4 9.4 0 0 1 12.8 0L16 2.6a11.8 11.8 0 0 0-16 0z" /></svg>
							<svg viewBox="0 0 27 12"><rect x=".5" y=".5" width="22" height="11" rx="3.2" fill="none" stroke="currentColor" stroke-opacity=".45" /><rect x="2.3" y="2.3" width="15.5" height="7.4" rx="1.8" /><path d="M24.4 4v4a2 2 0 0 0 0-4z" opacity=".5" /></svg>
						</span>
					</div>
					<img
						src="/screens/{s.id}.webp"
						alt={s.alt}
						width="780"
						height="1594"
						loading={eager && i === 0 ? 'eager' : 'lazy'}
						decoding="async"
					/>
				</figure>
			{/each}
		</div>
		<div class="island" aria-hidden="true"></div>
	</div>
</div>

<style>
	.phone {
		container-type: inline-size;
		width: 100%;
	}
	.bezel {
		position: relative;
		padding: 3.3cqw;
		border-radius: 15.5cqw;
		background: #0e1720;
		box-shadow:
			inset 0 0 0 0.6cqw #26313d,
			inset 0 0 0 0.9cqw #0b1218,
			0 3cqw 6cqw -2cqw rgba(15, 26, 38, 0.25),
			0 18cqw 30cqw -12cqw rgba(15, 26, 38, 0.55);
	}
	/* tombol samping */
	.bezel::before,
	.bezel::after {
		content: '';
		position: absolute;
		width: 0.9cqw;
		border-radius: 1cqw;
		background: #1b2733;
	}
	.bezel::before {
		left: -0.7cqw;
		top: 30cqw;
		height: 26cqw;
		box-shadow: 0 32cqw 0 #1b2733;
	}
	.bezel::after {
		right: -0.7cqw;
		top: 44cqw;
		height: 40cqw;
	}
	.screen {
		position: relative;
		aspect-ratio: 390 / 844;
		border-radius: 12.2cqw;
		overflow: hidden;
		background: #faf6f1;
		isolation: isolate;
	}
	.shot {
		position: absolute;
		inset: 0;
		margin: 0;
		display: flex;
		flex-direction: column;
		background: #faf6f1;
		color: #22384f;
		opacity: 0;
		transform: translateY(4%);
		z-index: 0;
		transition:
			opacity 0.45s var(--ease) 0.45s,
			transform 0.7s var(--ease);
	}
	.shot.on {
		opacity: 1;
		transform: none;
		z-index: 1;
		transition:
			opacity 0.45s var(--ease),
			transform 0.7s var(--ease);
	}
	.shot.dark {
		background: #0f1a26;
		color: #e9eef4;
	}
	.bar {
		flex: none;
		height: 11.25cqw;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: 1.2cqw 7.5cqw 0 9cqw;
	}
	.time {
		font-size: 4.1cqw;
		font-weight: 700;
		letter-spacing: -0.01em;
	}
	.sys {
		display: flex;
		align-items: center;
		gap: 1.4cqw;
	}
	.sys svg {
		height: 3cqw;
		width: auto;
		fill: currentColor;
	}
	.sys svg:last-child {
		height: 3.2cqw;
	}
	img {
		flex: 1;
		width: 100%;
		height: auto;
		min-height: 0;
		object-fit: cover;
		object-position: top;
	}
	.island {
		position: absolute;
		left: 50%;
		top: 5.4cqw;
		width: 29cqw;
		height: 8.4cqw;
		margin-left: -14.5cqw;
		border-radius: 999px;
		background: #05090d;
	}
</style>
