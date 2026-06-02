<template>
	<SplitterGroup
		:id="id"
		:direction="direction"
		:auto-save-id="autoSaveId"
		:class="classes"
		data-slot="splitter"
	>
		<slot />
	</SplitterGroup>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { SplitterGroup } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { splitterVariants, SPLITTER_DIRECTION_KEY, type SplitterDirection } from './splitter.js';

interface SplitterProps {
	id?: string;
	/** Layout axis. `horizontal` arranges panels side-by-side, `vertical` stacks them. */
	direction?: SplitterDirection;
	/**
	 * Optional storage key — when supplied, Reka persists panel sizes to localStorage.
	 * Each `<Splitter>` instance on a page must use a distinct id (otherwise they'd
	 * share the same persisted layout). Convention: `trading-bot:splitter:<page-id>`.
	 */
	autoSaveId?: string;
	class?: string;
}

const props = withDefaults(defineProps<SplitterProps>(), {
	direction: 'horizontal',
});

// Make direction available to <SplitterResizeHandle> for sensible defaults.
provide(SPLITTER_DIRECTION_KEY, toRef(props, 'direction'));

const classes = computed(() => cn(splitterVariants({ direction: props.direction }), props.class));
</script>
