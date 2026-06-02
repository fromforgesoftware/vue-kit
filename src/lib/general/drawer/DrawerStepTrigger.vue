<template>
	<span
		data-slot="drawer-step-trigger"
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
import { drawerKey } from './drawer';

interface Props {
	/** The name of the panel to push onto the stack */
	step: string;
}

const props = defineProps<Props>();
const ctx = inject(drawerKey)!;

function onClick() {
	ctx.pushStep(props.step);
}

function onKeydown(e: KeyboardEvent) {
	if (e.key === 'Enter' || e.key === ' ') {
		e.preventDefault();
		ctx.pushStep(props.step);
	}
}
</script>
