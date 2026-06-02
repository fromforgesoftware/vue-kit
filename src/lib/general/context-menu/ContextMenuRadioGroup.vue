<template>
	<ContextMenuRadioGroup data-slot="context-menu-radio-group" v-bind="forwarded">
		<slot />
	</ContextMenuRadioGroup>
</template>

<script setup lang="ts">
import { ContextMenuRadioGroup, useForwardPropsEmits } from 'reka-ui';

const props = defineProps<{
	modelValue?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
