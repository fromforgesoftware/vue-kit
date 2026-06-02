<template>
	<label data-slot="file-input" :class="cn(fileInputVariants({ size, disabled }), props.class)">
		<Icon :icon="Upload" size="sm" class="shrink-0" />
		<span class="truncate" data-slot="file-input-label">{{ displayLabel }}</span>
		<input
			ref="inputEl"
			type="file"
			class="sr-only"
			:accept="accept"
			:multiple="multiple"
			:disabled="disabled"
			:aria-label="ariaLabel ?? buttonLabel"
			@change="onChange"
		/>
	</label>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Upload } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { fileInputVariants } from './file-input.js';

interface FileInputProps {
	modelValue?: File | File[] | null;
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	size?: 'sm' | 'default' | 'lg';
	buttonLabel?: string;
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<FileInputProps>(), {
	modelValue: null,
	accept: undefined,
	multiple: false,
	disabled: false,
	size: 'default',
	buttonLabel: 'Choose file',
	ariaLabel: undefined,
	class: undefined,
});

const emit = defineEmits<{
	'update:modelValue': [value: File | File[] | null];
	change: [files: File[]];
}>();

const inputEl = ref<HTMLInputElement | null>(null);

const displayLabel = computed(() => {
	const m = props.modelValue;
	if (!m) return props.buttonLabel;
	if (Array.isArray(m)) {
		if (m.length === 0) return props.buttonLabel;
		if (m.length === 1) return m[0].name;
		return `${m.length} files`;
	}
	return m.name;
});

function onChange(event: Event): void {
	const input = event.target as HTMLInputElement;
	const files = input.files ? Array.from(input.files) : [];
	emit('change', files);
	if (props.multiple) {
		emit('update:modelValue', files);
	} else {
		emit('update:modelValue', files[0] ?? null);
	}
}
</script>
