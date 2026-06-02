<template>
	<RadioGroupRoot
		data-slot="radio-group"
		:model-value="modelValue"
		:default-value="defaultValue"
		:disabled="disabled"
		:required="required"
		:name="name"
		:orientation="orientation"
		:loop="loop"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="classes"
		@update:model-value="emit('update:modelValue', $event as string)"
	>
		<slot />
	</RadioGroupRoot>
</template>

<script setup lang="ts">
import { computed, provide } from 'vue';
import { RadioGroupRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { radioGroupVariants, type RadioOrientation, type RadioSize } from './radio.js';

interface RadioGroupProps {
	/** v-model binding for the selected value. */
	modelValue?: string;
	/** Initial uncontrolled value. */
	defaultValue?: string;
	/** Disable all items in the group. */
	disabled?: boolean;
	/** Required attribute (native form validation). */
	required?: boolean;
	/** Sets `aria-invalid="true"` on the group root. */
	error?: boolean;
	/** id of the element(s) describing this group — error or hint text. */
	describedBy?: string;
	/** Native form `name` attribute. */
	name?: string;
	/** Layout direction for the items. */
	orientation?: RadioOrientation;
	/** Density. Propagates to all child RadioGroupItems via provide. */
	size?: RadioSize;
	/** Whether arrow-key nav loops past the last/first item. */
	loop?: boolean;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<RadioGroupProps>(), {
	modelValue: undefined,
	defaultValue: undefined,
	disabled: false,
	required: false,
	error: false,
	orientation: 'vertical',
	size: 'default',
	loop: true,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const classes = computed(() =>
	cn(radioGroupVariants({ orientation: props.orientation }), props.class),
);

// Items read the size + error from context so consumers don't have to repeat
// the prop on every <RadioGroupItem>. Items can still override per-item.
provide(
	'radioGroupSize',
	computed(() => props.size),
);
provide(
	'radioGroupError',
	computed(() => props.error),
);
</script>
