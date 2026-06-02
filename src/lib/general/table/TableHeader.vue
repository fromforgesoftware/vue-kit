<template>
	<thead :class="classes" data-slot="table-header">
		<slot />
	</thead>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { cn } from '../../../helpers/cn';
import { tableHeaderVariants, TABLE_STICKY_HEADER_KEY } from './table';

interface TableHeaderProps {
	/** Force sticky-header on or off, overriding the parent <Table>'s value. */
	sticky?: boolean;
	class?: string;
}

const props = defineProps<TableHeaderProps>();

const stickyFromTable = inject(TABLE_STICKY_HEADER_KEY, ref(false));
const sticky = computed(() => (props.sticky === undefined ? stickyFromTable.value : props.sticky));

const classes = computed(() => cn(tableHeaderVariants({ sticky: sticky.value }), props.class));
</script>
