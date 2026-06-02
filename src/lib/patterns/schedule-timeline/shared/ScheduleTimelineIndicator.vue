<template>
	<!-- Swap: diagonal arrows -->
	<svg
		v-if="type === 'swap'"
		aria-hidden="true"
		class="size-3 shrink-0 opacity-70"
		viewBox="0 0 12 12"
		fill="none"
		stroke="currentColor"
		stroke-width="1.5"
	>
		<path d="M2 8L6 4M6 4H3M6 4V7" />
		<path d="M10 4L6 8M6 8H9M6 8V5" />
	</svg>
	<!-- Covering: triangle -->
	<svg
		v-else-if="type === 'covering'"
		aria-hidden="true"
		class="size-3 shrink-0 opacity-70"
		viewBox="0 0 12 12"
		fill="currentColor"
	>
		<path d="M6 2L10.5 10H1.5L6 2Z" />
	</svg>
	<!-- Sick: dot -->
	<span
		v-else-if="type === 'sick'"
		aria-hidden="true"
		class="size-2 rounded-full bg-destructive inline-block shrink-0"
	/>
</template>

<script setup lang="ts">
import type { ScheduleTimelineLegendIndicator } from '../schedule-timeline.js';

defineProps<{ type: ScheduleTimelineLegendIndicator }>();
</script>
