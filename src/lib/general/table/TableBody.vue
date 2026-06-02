<template>
	<tbody :class="classes" data-slot="table-body">
		<slot />
	</tbody>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { tableBodyVariants } from './table';

interface TableBodyProps {
	class?: string;
}

const props = defineProps<TableBodyProps>();

const classes = computed(() => cn(tableBodyVariants(), props.class));
</script>
