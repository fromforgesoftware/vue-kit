<template>
	<div data-slot="dialog-body" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { dialogBodyVariants } from './dialog';

interface Props {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(dialogBodyVariants(), props.class));
</script>
