<template>
	<button data-slot="drawer-back" :class="classes" type="button" @click="onClick">
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
			<path d="m15 18-6-6 6-6" />
		</svg>
		<slot>Back</slot>
	</button>
</template>

<script setup lang="ts">
import { inject, computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { drawerKey, drawerBackVariants } from './drawer.js';

interface Props {
	class?: string;
}

const props = defineProps<Props>();
const ctx = inject(drawerKey)!;
const classes = computed(() => cn(drawerBackVariants(), props.class));

function onClick() {
	ctx.popStep();
}
</script>
