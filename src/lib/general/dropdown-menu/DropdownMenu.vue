<template>
	<DropdownMenuRoot v-bind="forwarded">
		<slot />
	</DropdownMenuRoot>
</template>

<script setup lang="ts">
import { DropdownMenuRoot, useForwardPropsEmits } from 'reka-ui';

interface DropdownMenuProps {
	/**
	 * The controlled open state of the dropdown menu.
	 */
	open?: boolean;
	/**
	 * The open state of the dropdown menu when it is initially rendered.
	 */
	defaultOpen?: boolean;
	/**
	 * The modality of the dropdown menu. When set to true, interaction with
	 * outside elements will be disabled and only menu content will be visible to screen readers.
	 */
	modal?: boolean;
}

const props = withDefaults(defineProps<DropdownMenuProps>(), {
	defaultOpen: false,
	modal: true,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
