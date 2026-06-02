<template>
	<div
		ref="lineRef"
		data-slot="schedule-timeline-now-indicator"
		class="absolute top-0 bottom-0 z-10 cursor-help -translate-x-1/2 transition-[width] bg-destructive"
		:class="[hovered ? 'w-[4px]' : 'w-[2px]']"
		:style="{ left: `${left}px` }"
		role="img"
		:aria-label="`Current time ${time}`"
		:title="time"
		@mouseenter="onEnter"
		@mousemove="updatePillPosition"
		@mouseleave="hovered = false"
	/>
	<!-- Teleported + position:fixed so the pill can render above the line's
       top edge, escaping the scroll container's overflow clip. -->
	<Teleport v-if="hovered && pillPos" to="body">
		<div
			class="fixed z-50 px-1.5 py-0.5 rounded text-2xs font-semibold text-destructive-foreground bg-destructive tabular-nums whitespace-nowrap shadow-sm pointer-events-none -translate-x-1/2 -translate-y-full"
			:style="{ left: `${pillPos.x}px`, top: `${pillPos.y}px` }"
			aria-hidden="true"
		>
			{{ time }}
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { ref } from 'vue';

defineProps<{
	left: number;
	time: string;
}>();

const lineRef = ref<HTMLElement | null>(null);
const hovered = ref(false);
const pillPos = ref<{ x: number; y: number } | null>(null);

function updatePillPosition() {
	const rect = lineRef.value?.getBoundingClientRect();
	if (!rect) return;
	pillPos.value = { x: rect.left + rect.width / 2, y: rect.top };
}

function onEnter() {
	hovered.value = true;
	updatePillPosition();
}
</script>
