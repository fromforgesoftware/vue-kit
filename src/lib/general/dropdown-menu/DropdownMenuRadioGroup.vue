<template>
	<DropdownMenuRadioGroup data-slot="dropdown-menu-radio-group" v-bind="forwarded">
		<slot />
	</DropdownMenuRadioGroup>
</template>

<script setup lang="ts">
import { DropdownMenuRadioGroup, useForwardPropsEmits } from 'reka-ui';

const props = defineProps<{
	modelValue?: string;
}>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const forwarded = useForwardPropsEmits(props, emit);
</script>
