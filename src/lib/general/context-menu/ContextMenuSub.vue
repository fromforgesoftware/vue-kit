<template>
	<ContextMenuSub v-bind="forwarded">
		<slot />
	</ContextMenuSub>
</template>

<script setup lang="ts">
import { ContextMenuSub, useForwardPropsEmits } from 'reka-ui';

interface ContextMenuSubProps {
	open?: boolean;
	defaultOpen?: boolean;
}

const props = defineProps<ContextMenuSubProps>();

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
