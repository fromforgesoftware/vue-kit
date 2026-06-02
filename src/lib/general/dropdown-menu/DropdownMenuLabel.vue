<template>
	<DropdownMenuLabel data-slot="dropdown-menu-label" :class="classes">
		<slot />
	</DropdownMenuLabel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DropdownMenuLabel } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { dropdownMenuLabelVariants } from './dropdown-menu.js';

interface DropdownMenuLabelProps {
	/** When true, the label is visually indented to align with checkbox/radio items. */
	inset?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<DropdownMenuLabelProps>(), {
	inset: false,
});

const classes = computed(() => cn(dropdownMenuLabelVariants({ inset: props.inset }), props.class));
</script>
