<template>
	<caption :class="classes" data-slot="table-caption">
		<slot />
	</caption>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { tableCaptionVariants } from './table.js';

interface TableCaptionProps {
	class?: string;
}

const props = defineProps<TableCaptionProps>();

const classes = computed(() => cn(tableCaptionVariants(), props.class));
</script>
