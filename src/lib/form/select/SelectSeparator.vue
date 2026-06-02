<template>
	<SelectSeparator data-slot="select-separator" :class="classes" />
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SelectSeparator } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { selectSeparatorVariants } from './select';

interface SelectSeparatorProps {
	class?: string;
}

const props = defineProps<SelectSeparatorProps>();

const classes = computed(() => cn(selectSeparatorVariants(), props.class));
</script>
