<template>
	<th :class="classes" :scope="scope" data-slot="table-head">
		<slot />
	</th>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { tableHeadVariants, TABLE_DENSITY_KEY, type TableAlign, type TableDensity } from './table.js';

interface TableHeadProps {
	/** Override density for this header cell (defaults to the parent table's). */
	density?: TableDensity;
	/** Text alignment. Defaults to `left`. */
	align?: TableAlign;
	/** Native scope. Defaults to `col` since this is a column header. */
	scope?: 'col' | 'row' | 'colgroup' | 'rowgroup';
	class?: string;
}

const props = withDefaults(defineProps<TableHeadProps>(), {
	align: 'left',
	scope: 'col',
});

const densityFromTable = inject(TABLE_DENSITY_KEY, ref<TableDensity>('default'));
const density = computed(() => props.density ?? densityFromTable.value);

const classes = computed(() =>
	cn(tableHeadVariants({ density: density.value, align: props.align }), props.class),
);
</script>
