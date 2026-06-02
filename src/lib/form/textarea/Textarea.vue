<template>
	<textarea
		ref="textareaEl"
		data-slot="textarea"
		:value="modelValue"
		:class="classes"
		:disabled="disabled"
		:readonly="readonly"
		:required="required"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:rows="rows"
		v-bind="attrs"
		@input="onInput"
	/>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, useAttrs, watch } from 'vue';
import { cn } from '../../../helpers/cn';
import { textareaVariants, type TextareaVariants } from './textarea';

interface TextareaProps {
	/** Visual style. Prefer the `error` boolean prop. */
	variant?: TextareaVariants['variant'];
	/** Density. Controls min-height and padding. */
	size?: TextareaVariants['size'];
	/** v-model binding. */
	modelValue?: string;
	/** Disabled state. */
	disabled?: boolean;
	/** Read-only state. */
	readonly?: boolean;
	/** Required attribute. */
	required?: boolean;
	/** Sets `aria-invalid="true"` and the error variant. */
	error?: boolean;
	/** id of the element(s) describing this textarea — error or hint text. */
	describedBy?: string;
	/** Native `rows` attribute. Use with `autoResize` off. */
	rows?: number;
	/** Auto-grow vertically as the user types — disables manual resize. */
	autoResize?: boolean;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<TextareaProps>(), {
	variant: 'default',
	size: 'default',
	disabled: false,
	readonly: false,
	required: false,
	error: false,
	autoResize: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const attrs = useAttrs();
const textareaEl = ref<HTMLTextAreaElement | null>(null);

const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

const classes = computed(() =>
	cn(
		textareaVariants({
			variant: effectiveVariant.value,
			size: props.size,
			autoResize: props.autoResize,
		}),
		props.class,
	),
);

function autosize() {
	if (!props.autoResize || !textareaEl.value) return;
	const el = textareaEl.value;
	el.style.height = 'auto';
	el.style.height = `${el.scrollHeight}px`;
}

function onInput(event: Event) {
	const target = event.target as HTMLTextAreaElement;
	emit('update:modelValue', target.value);
	if (props.autoResize) autosize();
}

watch(
	() => props.modelValue,
	() => {
		if (props.autoResize) nextTick(autosize);
	},
);

onMounted(() => {
	if (props.autoResize) autosize();
});
</script>
