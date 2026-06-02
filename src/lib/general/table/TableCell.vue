<template>
	<td :class="classes" data-slot="table-cell">
		<slot />
	</td>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { cn } from '../../../helpers/cn';
import { tableCellVariants, TABLE_DENSITY_KEY, type TableAlign, type TableDensity } from './table';

interface TableCellProps {
	/** Override density for this cell. Defaults to the parent table's density. */
	density?: TableDensity;
	/** Text alignment. Defaults to `left`. */
	align?: TableAlign;
	/** Render numbers with `tabular-nums` for column alignment. */
	numeric?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<TableCellProps>(), {
	align: 'left',
	numeric: false,
});

const densityFromTable = inject(TABLE_DENSITY_KEY, ref<TableDensity>('default'));
const density = computed(() => props.density ?? densityFromTable.value);

const classes = computed(() =>
	cn(
		tableCellVariants({
			density: density.value,
			align: props.align,
			numeric: props.numeric,
		}),
		props.class,
	),
);
</script>
