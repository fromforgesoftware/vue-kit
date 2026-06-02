<template>
	<EmptyState
		data-slot="forbidden-state"
		:icon="resolvedIcon"
		:illustration="resolvedIllustration"
		:title="resolvedTitle"
		:description="resolvedDescription"
		:size="size"
		:tone="tone"
		:class="props.class"
	>
		<slot />
	</EmptyState>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import EmptyState from '../empty-state/EmptyState.vue';
import { FORBIDDEN_STATE_PRESETS, type ForbiddenStateProps } from './forbidden-state.js';

const props = withDefaults(defineProps<ForbiddenStateProps>(), {
	variant: 'forbidden',
	size: 'lg',
	tone: 'default',
});

const preset = computed(() => FORBIDDEN_STATE_PRESETS[props.variant ?? 'forbidden']);

const resolvedIcon = computed(() => props.icon ?? preset.value.icon);
const resolvedIllustration = computed(() => props.illustration ?? preset.value.illustration);
const resolvedTitle = computed(() => props.title ?? preset.value.title);
const resolvedDescription = computed(() => props.description ?? preset.value.description);
</script>
