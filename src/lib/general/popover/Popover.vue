<template>
	<PopoverRoot v-bind="forwarded">
		<slot />
	</PopoverRoot>
</template>

<script setup lang="ts">
import { PopoverRoot, useForwardPropsEmits } from 'reka-ui';

interface PopoverProps {
	open?: boolean;
	defaultOpen?: boolean;
	/**
	 * When true, focus is trapped and the rest of the page is inert.
	 * Default false — the page stays interactive while the popover is open.
	 */
	modal?: boolean;
}

const props = withDefaults(defineProps<PopoverProps>(), {
	open: undefined,
	defaultOpen: false,
	modal: false,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
