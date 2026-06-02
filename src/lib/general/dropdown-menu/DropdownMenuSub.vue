<template>
	<DropdownMenuSub v-bind="forwarded">
		<slot />
	</DropdownMenuSub>
</template>

<script setup lang="ts">
import { DropdownMenuSub, useForwardPropsEmits } from 'reka-ui';

interface DropdownMenuSubProps {
	open?: boolean;
	defaultOpen?: boolean;
}

const props = defineProps<DropdownMenuSubProps>();

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
