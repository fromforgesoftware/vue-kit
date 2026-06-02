<template>
	<div data-slot="dialog-footer" :class="classes">
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { dialogFooterVariants } from './dialog';

interface Props {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(dialogFooterVariants(), props.class));
</script>
