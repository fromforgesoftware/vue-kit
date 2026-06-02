<template>
	<tfoot :class="classes" data-slot="table-footer">
		<slot />
	</tfoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { tableFooterVariants } from './table';

interface TableFooterProps {
	class?: string;
}

const props = defineProps<TableFooterProps>();

const classes = computed(() => cn(tableFooterVariants(), props.class));
</script>
