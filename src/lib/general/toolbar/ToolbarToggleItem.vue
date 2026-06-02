<template>
	<ToolbarToggleItem :value="value" :class="classes" data-slot="toolbar-toggle-item">
		<slot />
	</ToolbarToggleItem>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { ToolbarToggleItem } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { toolbarToggleItemVariants, TOOLBAR_SIZE_KEY, type ToolbarSize } from './toolbar.js';

interface ToolbarToggleItemProps {
	/** Identifier used to mark this item as active. */
	value: string;
	class?: string;
}

const props = defineProps<ToolbarToggleItemProps>();

const size = inject<{ value: ToolbarSize } | undefined>(TOOLBAR_SIZE_KEY, undefined);

const classes = computed(() => cn(toolbarToggleItemVariants({ size: size?.value }), props.class));
</script>
