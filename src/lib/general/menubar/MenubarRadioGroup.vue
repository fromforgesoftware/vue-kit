<template>
	<MenubarRadioGroup
		data-slot="menubar-radio-group"
		:model-value="modelValue"
		:class="classes"
		@update:model-value="emit('update:modelValue', $event as string)"
	>
		<slot />
	</MenubarRadioGroup>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarRadioGroup } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';

interface MenubarRadioGroupProps {
	modelValue?: string;
	class?: string;
}

const props = defineProps<MenubarRadioGroupProps>();

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const classes = computed(() => cn(props.class));
</script>
