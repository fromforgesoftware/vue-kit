<template>
	<EditablePreview :class="classes" data-slot="editable-preview" />
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { EditablePreview } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { editablePreviewVariants, type EditableSize } from './editable.js';
import { editableSizeKey } from './context.js';

interface EditablePreviewProps {
	/** Override the size inherited from the parent Editable. */
	size?: EditableSize;
	class?: string;
}

const props = defineProps<EditablePreviewProps>();

const inheritedSize = inject<Ref<EditableSize>>(editableSizeKey, ref<EditableSize>('default'));
const effectiveSize = computed<EditableSize>(() => props.size ?? inheritedSize.value);

const classes = computed(() =>
	cn(editablePreviewVariants({ size: effectiveSize.value }), props.class),
);
</script>
