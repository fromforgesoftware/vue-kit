<template>
	<ToolbarSeparator :class="classes" data-slot="toolbar-separator" />
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { ToolbarSeparator } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import {
	toolbarSeparatorVariants,
	TOOLBAR_ORIENTATION_KEY,
	type ToolbarOrientation,
} from './toolbar.js';

interface ToolbarSeparatorProps {
	class?: string;
}

const props = defineProps<ToolbarSeparatorProps>();

const orientation = inject<{ value: ToolbarOrientation } | undefined>(
	TOOLBAR_ORIENTATION_KEY,
	undefined,
);

// Separator orientation is the inverse of toolbar orientation:
// horizontal toolbar → vertical separator (bar) and vice versa.
const separatorOrientation = computed<ToolbarOrientation>(() =>
	orientation?.value === 'vertical' ? 'vertical' : 'horizontal',
);

const classes = computed(() =>
	cn(toolbarSeparatorVariants({ orientation: separatorOrientation.value }), props.class),
);
</script>
