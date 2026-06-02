<template>
	<AlertDialogTitle data-slot="alert-dialog-title" :class="classes">
		<slot />
	</AlertDialogTitle>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertDialogTitle, type AlertDialogTitleProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { alertDialogTitleVariants } from './alert-dialog';

interface Props extends AlertDialogTitleProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(alertDialogTitleVariants(), props.class));
</script>
