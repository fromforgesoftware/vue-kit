<template>
	<div data-slot="input-wrapper" :class="wrapperClasses">
		<span v-if="hasLeading" data-slot="input-leading" :class="leadingClasses">
			<slot name="leading" />
		</span>
		<input
			data-slot="input"
			:type="type"
			:value="modelValue"
			:disabled="disabled"
			:readonly="readonly"
			:required="required"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:class="inputClasses"
			v-bind="attrs"
			@input="onInput"
		/>
		<span v-if="hasTrailing" data-slot="input-trailing" :class="trailingClasses">
			<slot name="trailing" />
		</span>
	</div>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue';

// `inheritAttrs: false` so HTML attributes (id, name, autocomplete, placeholder…)
// land on the inner native `<input>`, not on the wrapper. Critical for
// `getByLabelText` / `for`/`id` association.
defineOptions({ inheritAttrs: false });
import { cn } from '../../../helpers/cn.js';
import {
	inputVariants,
	inputWrapperVariants,
	inputAffixVariants,
	type InputWrapperVariants,
} from './input.js';

interface InputProps {
	/** Visual style. `error` flips border/ring to destructive tones. */
	variant?: InputWrapperVariants['variant'];
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: InputWrapperVariants['size'];
	/** v-model binding. */
	modelValue?: string | number;
	/** Native input type. Defaults to `text`. */
	type?: string;
	/** Disabled state. Sets `disabled` and styles the wrapper. */
	disabled?: boolean;
	/** Read-only state. Allows selection/copy but blocks input. */
	readonly?: boolean;
	/** Required attribute. Pair with a `Label` that has `required`. */
	required?: boolean;
	/** Convenience for `aria-invalid="true"` + error variant. Prefer this over `variant="error"`. */
	error?: boolean;
	/** id of the element(s) describing the input — error or hint text. */
	describedBy?: string;
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
	class?: string;
	/** Extra classes on the inner native input. */
	inputClass?: string;
}

const props = withDefaults(defineProps<InputProps>(), {
	variant: 'default',
	size: 'default',
	type: 'text',
	disabled: false,
	readonly: false,
	required: false,
	error: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const attrs = useAttrs();

const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

const wrapperClasses = computed(() =>
	cn(inputWrapperVariants({ variant: effectiveVariant.value, size: props.size }), props.class),
);

const inputClasses = computed(() =>
	cn(
		inputVariants({
			size: props.size,
			hasLeading: !!hasLeading.value,
			hasTrailing: !!hasTrailing.value,
			inputType: props.type === 'file' ? 'file' : 'default',
		}),
		props.inputClass,
	),
);

const leadingClasses = computed(() =>
	cn(inputAffixVariants({ side: 'leading', size: props.size })),
);
const trailingClasses = computed(() =>
	cn(inputAffixVariants({ side: 'trailing', size: props.size })),
);

const slots = defineSlots<{
	leading?: () => unknown;
	trailing?: () => unknown;
}>();

const hasLeading = computed(() => !!slots.leading);
const hasTrailing = computed(() => !!slots.trailing);

function onInput(event: Event) {
	const target = event.target as HTMLInputElement;
	emit('update:modelValue', target.value);
}
</script>
