<template>
	<AlertDialogDescription data-slot="alert-dialog-description" :class="classes">
		<slot />
	</AlertDialogDescription>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertDialogDescription, type AlertDialogDescriptionProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { alertDialogDescriptionVariants } from './alert-dialog';

interface Props extends AlertDialogDescriptionProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(alertDialogDescriptionVariants(), props.class));
</script>
