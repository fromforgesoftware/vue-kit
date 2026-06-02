<template>
	<AlertDialogAction data-slot="alert-dialog-action" :class="classes">
		<slot />
	</AlertDialogAction>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { AlertDialogAction } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { buttonVariants, type ButtonVariants } from '../button/button';
import { ALERT_DIALOG_VARIANT_KEY, type AlertDialogVariant } from './alert-dialog';

interface Props {
	variant?: ButtonVariants['variant'];
	size?: ButtonVariants['size'];
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: undefined,
	size: 'default',
});

const injectedVariant = inject(ALERT_DIALOG_VARIANT_KEY, ref<AlertDialogVariant>('default'));

const isDestructive = computed(
	() => injectedVariant.value === 'destructive' || injectedVariant.value === 'destructive-confirm',
);

const resolvedButtonVariant = computed(
	() => props.variant ?? (isDestructive.value ? 'destructive' : 'default'),
);

const classes = computed(() =>
	cn(buttonVariants({ variant: resolvedButtonVariant.value, size: props.size }), props.class),
);
</script>
