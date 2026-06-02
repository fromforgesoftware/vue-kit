<template>
	<div :class="wrapperClasses" data-slot="table-wrapper">
		<table :class="tableClasses" data-slot="table">
			<slot />
		</table>
	</div>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { cn } from '../../../helpers/cn';
import {
	tableVariants,
	tableWrapperVariants,
	TABLE_DENSITY_KEY,
	TABLE_STICKY_HEADER_KEY,
	type TableDensity,
	type TableSurface,
} from './table';

interface TableProps {
	/** Padding/typography density. Propagates to <TableHead> and <TableCell>. */
	density?: TableDensity;
	/** Wrapper visual treatment. `card` adds a bordered, rounded surface. */
	surface?: TableSurface;
	/** Render the header sticky to the wrapper's scroll viewport. */
	stickyHeader?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<TableProps>(), {
	density: 'default',
	surface: 'none',
	stickyHeader: false,
});

provide(TABLE_DENSITY_KEY, toRef(props, 'density'));
provide(TABLE_STICKY_HEADER_KEY, toRef(props, 'stickyHeader'));

const wrapperClasses = computed(() => cn(tableWrapperVariants({ surface: props.surface })));
const tableClasses = computed(() => cn(tableVariants(), props.class));
</script>
