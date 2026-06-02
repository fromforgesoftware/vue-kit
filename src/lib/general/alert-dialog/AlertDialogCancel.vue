<template>
	<AlertDialogCancel data-slot="alert-dialog-cancel" :class="classes">
		<slot />
	</AlertDialogCancel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { AlertDialogCancel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { buttonVariants, type ButtonVariants } from '../button/button';

interface Props {
	variant?: ButtonVariants['variant'];
	size?: ButtonVariants['size'];
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'outline',
	size: 'default',
});

const classes = computed(() =>
	cn(buttonVariants({ variant: props.variant, size: props.size }), props.class),
);
</script>
