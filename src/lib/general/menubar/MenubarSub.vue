<template>
	<MenubarSub v-bind="forwarded">
		<slot />
	</MenubarSub>
</template>

<script setup lang="ts">
import { MenubarSub, useForwardPropsEmits } from 'reka-ui';

interface MenubarSubProps {
	open?: boolean;
	defaultOpen?: boolean;
}

const props = defineProps<MenubarSubProps>();

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
