<template>
	<button
		data-slot="drawer-close"
		:class="classes"
		type="button"
		aria-label="Close"
		@click="onClick"
	>
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width="24"
			height="24"
			viewBox="0 0 24 24"
			fill="none"
			stroke="currentColor"
			stroke-width="2"
			stroke-linecap="round"
			stroke-linejoin="round"
			aria-hidden="true"
		>
			<path d="M18 6 6 18" />
			<path d="m6 6 12 12" />
		</svg>
		<span class="sr-only">Close</span>
	</button>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { drawerKey, drawerCloseVariants } from './drawer.js';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const ctx = inject(drawerKey)!;
const classes = computed(() => cn(drawerCloseVariants(), props.class));

function onClick() {
	ctx.closeAll();
}
</script>
