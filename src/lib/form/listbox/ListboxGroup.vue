<template>
	<ListboxGroup data-slot="listbox-group" :class="classes">
		<slot />
	</ListboxGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ListboxGroup } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { listboxGroupVariants } from './listbox';

interface ListboxGroupProps {
	class?: string;
}

const props = defineProps<ListboxGroupProps>();

const classes = computed(() => cn(listboxGroupVariants(), props.class));
</script>
