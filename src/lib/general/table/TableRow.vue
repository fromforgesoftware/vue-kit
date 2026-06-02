<template>
	<tr :class="classes" :data-state="selected ? 'selected' : undefined" data-slot="table-row">
		<slot />
	</tr>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { tableRowVariants } from './table.js';

interface TableRowProps {
	/** Stronger hover styling + pointer cursor for clickable rows. */
	interactive?: boolean;
	/** Mark the row visually as selected (sets `data-state="selected"`). */
	selected?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<TableRowProps>(), {
	interactive: false,
	selected: false,
});

const classes = computed(() =>
	cn(tableRowVariants({ interactive: props.interactive }), props.class),
);
</script>
