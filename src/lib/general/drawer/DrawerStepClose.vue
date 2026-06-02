<template>
	<span
		data-slot="drawer-step-close"
		role="button"
		tabindex="0"
		@click="onClick"
		@keydown="onKeydown"
	>
		<slot />
	</span>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { drawerKey } from './drawer.js';

const ctx = inject(drawerKey)!;

function onClick() {
	ctx.popStep();
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		ctx.popStep();
	}
}
</script>
