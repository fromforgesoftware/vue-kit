<template>
	<div data-slot="empty-state-action" :class="classes">
		<div class="flex-1">
			<p data-slot="empty-state-action-title" class="text-sm font-medium text-foreground">
				{{ title }}
			</p>
			<p
				v-if="description"
				data-slot="empty-state-action-description"
				class="text-xs text-muted-foreground"
			>
				{{ description }}
			</p>
		</div>
		<div v-if="$slots.default" data-slot="empty-state-action-controls">
			<slot />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { emptyStateActionCardVariants } from './empty-state.js';

interface EmptyStateActionProps {
	/** Action card title. */
	title: string;
	/** Optional description text. */
	description?: string;
	class?: string;
}

const props = defineProps<EmptyStateActionProps>();

const classes = computed(() => cn(emptyStateActionCardVariants(), props.class));
</script>
