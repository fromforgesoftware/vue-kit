<template>
	<DialogDescription data-slot="dialog-description" :class="classes">
		<slot />
	</DialogDescription>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DialogDescription, type DialogDescriptionProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { dialogDescriptionVariants } from './dialog';

interface Props extends DialogDescriptionProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(dialogDescriptionVariants(), props.class));
</script>
