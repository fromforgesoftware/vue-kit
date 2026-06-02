<template>
	<AlertDialogRoot v-bind="forwarded">
		<slot />
	</AlertDialogRoot>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { AlertDialogRoot, useForwardPropsEmits } from 'reka-ui';
import { ALERT_DIALOG_VARIANT_KEY, type AlertDialogVariant } from './alert-dialog.js';

interface AlertDialogProps {
	open?: boolean;
	defaultOpen?: boolean;
	/** Visual variant — propagated to AlertDialogAction and AlertDialogCancel */
	variant?: AlertDialogVariant;
}

const props = withDefaults(defineProps<AlertDialogProps>(), {
	defaultOpen: false,
	variant: 'default',
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

provide(ALERT_DIALOG_VARIANT_KEY, toRef(props, 'variant'));

const rootProps = computed(() => ({
	open: props.open,
	defaultOpen: props.defaultOpen,
}));

const forwarded = useForwardPropsEmits(rootProps, emit);
</script>
