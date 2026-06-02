<template>
	<SelectLabel data-slot="select-label" :class="classes">
		<slot />
	</SelectLabel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { SelectLabel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { selectLabelVariants } from './select';

interface SelectLabelProps {
	class?: string;
}

const props = defineProps<SelectLabelProps>();

const classes = computed(() => cn(selectLabelVariants(), props.class));
</script>
