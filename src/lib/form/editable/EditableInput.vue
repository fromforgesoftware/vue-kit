<template>
	<EditableInput :class="classes" data-slot="editable-input" />
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { EditableInput } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { editableInputVariants, type EditableSize } from './editable';
import { editableSizeKey } from './context';

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
