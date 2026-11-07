<script lang="ts">
	import { toast } from '#lib/state/app.svelte.ts';
</script>

<div class="toast" class:show={toast.show} role="status" aria-live="polite">{toast.msg}</div>

<style>
	.toast {
		position: fixed;
		left: 50%;
		bottom: calc(100px + var(--safe-b));
		transform: translate(-50%, 20px);
		opacity: 0;
		background: var(--ink);
		color: var(--paper);
		padding: 10px 16px;
		border-radius: 12px;
		font-size: 13px;
		font-weight: 600;
		transition: all 0.35s var(--ease);
		z-index: 30;
		pointer-events: none;
		max-width: calc(100% - 40px);
		text-align: center;
	}
	.show {
		opacity: 1;
		transform: translate(-50%, 0);
	}
</style>
