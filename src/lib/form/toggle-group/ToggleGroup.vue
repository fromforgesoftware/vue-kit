<template>
	<ToggleGroupRoot
		v-bind="rootProps"
		:class="classes"
		data-slot="toggle-group"
		@update:model-value="emit('update:modelValue', $event as string | string[])"
	>
		<slot />
	</ToggleGroupRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ToggleGroupRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { toggleGroupVariants, type ToggleGroupVariants } from './toggle-group';

interface ToggleGroupProps {
	/**
	 * The controlled value. For `type="single"` this is a string; for
	 * `type="multiple"` this is `string[]`.
	 */
	modelValue?: string | string[];
	/** Initial uncontrolled value. */
	defaultValue?: string | string[];
	/** Single- or multi-select. */
	type?: 'single' | 'multiple';
	/** When true, no item can be interacted with. */
	disabled?: boolean;
	/** Layout direction; arrow keys navigate along this axis. */
	orientation?: ToggleGroupVariants['orientation'];
	/** Loop arrow-key navigation back to the start at the end. */
	loop?: boolean;
	/** Native form `name` attribute (rendered as a hidden input). */
	name?: string;
	/** Required attribute (native form validation). */
	required?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<ToggleGroupProps>(), {
	type: 'single',
	disabled: false,
	orientation: 'horizontal',
	loop: true,
	required: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string | string[]];
}>();

const classes = computed(() =>
	cn(toggleGroupVariants({ orientation: props.orientation }), props.class),
);

// Reka's ToggleGroupRoot enforces controlled-vs-uncontrolled by the presence
// of `modelValue` / `defaultValue`. Forward only what's defined to keep its
// internal state machine in the right mode.
const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		type: props.type,
		disabled: props.disabled,
		orientation: props.orientation,
		loop: props.loop,
		required: props.required,
	};
	if (props.modelValue !== undefined) result.modelValue = props.modelValue;
	if (props.defaultValue !== undefined) result.defaultValue = props.defaultValue;
	if (props.name !== undefined) result.name = props.name;
	return result;
});
</script>
