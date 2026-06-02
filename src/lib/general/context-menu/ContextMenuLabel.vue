<template>
	<ContextMenuLabel data-slot="context-menu-label" :class="classes">
		<slot />
	</ContextMenuLabel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ContextMenuLabel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { contextMenuLabelVariants } from './context-menu';

interface ContextMenuLabelProps {
	/** When true, the label is visually indented. */
	inset?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<ContextMenuLabelProps>(), {
	inset: false,
});

const classes = computed(() => cn(contextMenuLabelVariants({ inset: props.inset }), props.class));
</script>
