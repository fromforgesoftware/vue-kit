<template>
	<ToggleRoot
		v-bind="rootProps"
		:class="classes"
		data-slot="toggle"
		@update:model-value="emit('update:modelValue', $event)"
	>
		<slot />
	</ToggleRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Toggle as ToggleRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { toggleVariants, type ToggleVariants } from './toggle';

interface ToggleProps {
	modelValue?: boolean;
	defaultValue?: boolean;
	disabled?: boolean;
	name?: string;
	variant?: ToggleVariants['variant'];
	size?: ToggleVariants['size'];
	class?: string;
}

const props = withDefaults(defineProps<ToggleProps>(), {
	variant: 'default',
	size: 'default',
	disabled: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: boolean];
}>();

const classes = computed(() =>
	cn(toggleVariants({ variant: props.variant, size: props.size }), props.class),
);

// Compute the root props conditionally to avoid passing undefined values
const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		disabled: props.disabled,
	};
	if (props.modelValue !== undefined) {
		result.modelValue = props.modelValue;
	}
	if (props.defaultValue !== undefined) {
		result.defaultValue = props.defaultValue;
	}
	if (props.name !== undefined) {
		result.name = props.name;
	}
	return result;
});
</script>
