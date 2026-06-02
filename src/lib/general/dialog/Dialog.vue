<template>
	<DialogRoot v-bind="forwarded">
		<slot />
	</DialogRoot>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue';
import { DialogRoot, useForwardPropsEmits } from 'reka-ui';
import { DIALOG_VARIANT_KEY, type DialogVariant } from './dialog.js';

interface DialogProps {
	open?: boolean;
	defaultOpen?: boolean;
	modal?: boolean;
	/** Visual variant */
	variant?: DialogVariant;
}

const props = withDefaults(defineProps<DialogProps>(), {
	defaultOpen: false,
	modal: true,
	variant: 'default',
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

provide(DIALOG_VARIANT_KEY, toRef(props, 'variant'));

const forwarded = useForwardPropsEmits(props, emit);
</script>
