<template>
	<ContextMenuRoot v-bind="forwarded">
		<slot />
	</ContextMenuRoot>
</template>

<script setup lang="ts">
import { ContextMenuRoot, useForwardPropsEmits } from 'reka-ui';

interface ContextMenuProps {
	/**
	 * The modality of the context menu. When set to true, interaction with
	 * outside elements will be disabled and only menu content will be visible to screen readers.
	 */
	modal?: boolean;
}

const props = withDefaults(defineProps<ContextMenuProps>(), {
	modal: true,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
