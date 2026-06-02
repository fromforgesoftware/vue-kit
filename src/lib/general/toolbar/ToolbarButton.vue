<template>
	<ToolbarButton :class="classes" data-slot="toolbar-button">
		<slot />
	</ToolbarButton>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { ToolbarButton } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { toolbarButtonVariants, TOOLBAR_SIZE_KEY, type ToolbarSize } from './toolbar.js';

interface ToolbarButtonProps {
	class?: string;
}

const props = defineProps<ToolbarButtonProps>();

const size = inject<{ value: ToolbarSize } | undefined>(TOOLBAR_SIZE_KEY, undefined);

const classes = computed(() => cn(toolbarButtonVariants({ size: size?.value }), props.class));
</script>
