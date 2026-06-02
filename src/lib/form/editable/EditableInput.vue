<template>
	<EditableInput :class="classes" data-slot="editable-input" />
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { EditableInput } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { editableInputVariants, type EditableSize } from './editable.js';
import { editableSizeKey } from './context.js';

interface EditableInputProps {
	/** Override the size inherited from the parent Editable. */
	size?: EditableSize;
	class?: string;
}

const props = defineProps<EditableInputProps>();

const inheritedSize = inject<Ref<EditableSize>>(editableSizeKey, ref<EditableSize>('default'));
const effectiveSize = computed<EditableSize>(() => props.size ?? inheritedSize.value);

const classes = computed(() =>
	cn(editableInputVariants({ size: effectiveSize.value }), props.class),
);
</script>
