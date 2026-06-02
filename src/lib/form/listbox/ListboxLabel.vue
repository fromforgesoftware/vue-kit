<template>
	<ListboxGroupLabel data-slot="listbox-label" :class="classes">
		<slot />
	</ListboxGroupLabel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ListboxGroupLabel } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { listboxLabelVariants } from './listbox.js';

interface ListboxLabelProps {
	class?: string;
}

const props = defineProps<ListboxLabelProps>();

const classes = computed(() => cn(listboxLabelVariants(), props.class));
</script>
