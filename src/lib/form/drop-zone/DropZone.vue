<template>
	<div
		data-slot="drop-zone"
		role="button"
		tabindex="0"
		:aria-label="ariaLabel ?? 'Drop files or click to browse'"
		:aria-disabled="disabled || undefined"
		:class="cn(dropZoneVariants({ state: zoneState, size }), props.class)"
		@dragenter.prevent="onDragEnter"
		@dragover.prevent="onDragOver"
		@dragleave.prevent="onDragLeave"
		@drop.prevent="onDrop"
		@click="openPicker"
		@keydown.enter.prevent="openPicker"
		@keydown.space.prevent="openPicker"
	>
		<slot :is-dragging="isDragging" :open-picker="openPicker">
			<Icon :icon="Upload" size="sm" />
			<span data-slot="drop-zone-label">
				{{ isDragging ? 'Drop to upload' : label }}
			</span>
			<span v-if="hint" class="text-xs text-muted-foreground">{{ hint }}</span>
		</slot>
		<input
			ref="inputEl"
			type="file"
			class="sr-only"
			:accept="accept"
			:multiple="multiple"
			:disabled="disabled"
			@change="onChange"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Upload } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { dropZoneVariants } from './drop-zone.js';

interface DropZoneProps {
	accept?: string;
	multiple?: boolean;
	disabled?: boolean;
	size?: 'sm' | 'default' | 'lg';
	label?: string;
	hint?: string;
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<DropZoneProps>(), {
	accept: undefined,
	multiple: false,
	disabled: false,
	size: 'default',
	label: 'Drag a file here, or click to browse',
	hint: undefined,
	ariaLabel: undefined,
	class: undefined,
});

const emit = defineEmits<{
	drop: [files: File[]];
	change: [files: File[]];
}>();

const isDragging = ref(false);
const inputEl = ref<HTMLInputElement | null>(null);
let depth = 0;

const zoneState = computed(() => {
	if (props.disabled) return 'disabled';
	return isDragging.value ? 'hover' : 'idle';
});

function onDragEnter(): void {
	if (props.disabled) return;
	depth += 1;
	isDragging.value = true;
}

function onDragOver(): void {
	// keep `dragover` handler so the browser allows the drop event
}

function onDragLeave(): void {
	depth = Math.max(0, depth - 1);
	if (depth === 0) isDragging.value = false;
}

function onDrop(event: DragEvent): void {
	depth = 0;
	isDragging.value = false;
	if (props.disabled) return;
	const files = event.dataTransfer ? Array.from(event.dataTransfer.files) : [];
	emit('drop', files);
	emit('change', files);
}

function onChange(event: Event): void {
	const input = event.target as HTMLInputElement;
	const files = input.files ? Array.from(input.files) : [];
	emit('change', files);
}

function openPicker(): void {
	if (props.disabled) return;
	inputEl.value?.click();
}
</script>
