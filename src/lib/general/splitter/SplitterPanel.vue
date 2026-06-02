<template>
	<SplitterPanel
		:id="id"
		:default-size="defaultSize"
		:min-size="minSize"
		:max-size="maxSize"
		:collapsible="collapsible"
		:class="classes"
		data-slot="splitter-panel"
		@collapse="$emit('collapse')"
		@expand="$emit('expand')"
	>
		<slot />
	</SplitterPanel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SplitterPanel } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { splitterPanelVariants, type SplitterPanelSurface } from './splitter.js';

interface SplitterPanelProps {
	id?: string;
	/** Initial percentage size (0–100). Reka enforces totals across siblings. */
	defaultSize?: number;
	/** Minimum percentage size — drag/keyboard resize stops here. */
	minSize?: number;
	/** Maximum percentage size. */
	maxSize?: number;
	/** Allow the panel to collapse to 0 when dragged below `min-size`. */
	collapsible?: boolean;
	/** Visual treatment — `none` is the default. `card` renders a bordered surface. */
	surface?: SplitterPanelSurface;
	class?: string;
}

const props = withDefaults(defineProps<SplitterPanelProps>(), {
	defaultSize: undefined,
	minSize: undefined,
	maxSize: undefined,
	collapsible: false,
	surface: 'none',
});

defineEmits<{
	collapse: [];
	expand: [];
}>();

const classes = computed(() => cn(splitterPanelVariants({ surface: props.surface }), props.class));
</script>
