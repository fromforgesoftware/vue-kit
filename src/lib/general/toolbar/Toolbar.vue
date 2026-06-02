<template>
	<ToolbarRoot :orientation="orientation" :class="classes" data-slot="toolbar">
		<slot />
	</ToolbarRoot>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { ToolbarRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	toolbarVariants,
	TOOLBAR_VARIANT_KEY,
	TOOLBAR_SIZE_KEY,
	TOOLBAR_ORIENTATION_KEY,
	type ToolbarVariant,
	type ToolbarSize,
	type ToolbarOrientation,
} from './toolbar';

interface ToolbarProps {
	/** Layout axis. `vertical` stacks items in a column. */
	orientation?: ToolbarOrientation;
	/** Visual variant. */
	variant?: ToolbarVariant;
	/** Density tier for items inside. */
	size?: ToolbarSize;
	class?: string;
}

const props = withDefaults(defineProps<ToolbarProps>(), {
	orientation: 'horizontal',
	variant: 'default',
	size: 'default',
});

provide(TOOLBAR_VARIANT_KEY, toRef(props, 'variant'));
provide(TOOLBAR_SIZE_KEY, toRef(props, 'size'));
provide(TOOLBAR_ORIENTATION_KEY, toRef(props, 'orientation'));

const classes = computed(() =>
	cn(toolbarVariants({ variant: props.variant, orientation: props.orientation }), props.class),
);
</script>
