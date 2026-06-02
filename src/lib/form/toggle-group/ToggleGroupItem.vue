<template>
	<ToggleGroupItem
		:value="value"
		:disabled="disabled"
		:class="classes"
		data-slot="toggle-group-item"
	>
		<slot />
	</ToggleGroupItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ToggleGroupItem } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { toggleVariants, type ToggleVariants } from '../toggle/toggle.js';

interface ToggleGroupItemProps {
	/** Identifier used by the parent group to track selection. */
	value: string;
	/** When true, prevents interaction with this single item. */
	disabled?: boolean;
	/** Visual style. Inherits from sibling items via the shared CVA. */
	variant?: ToggleVariants['variant'];
	/** Density. Pair with the same size on every item to keep the row even. */
	size?: ToggleVariants['size'];
	class?: string;
}

const props = withDefaults(defineProps<ToggleGroupItemProps>(), {
	disabled: false,
	variant: 'default',
	size: 'default',
});

const classes = computed(() =>
	cn(toggleVariants({ variant: props.variant, size: props.size }), props.class),
);
</script>
