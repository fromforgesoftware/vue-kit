<template>
	<EditableEditTrigger :class="classes" :aria-label="ariaLabel" data-slot="editable-edit-trigger">
		<slot>Edit</slot>
	</EditableEditTrigger>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { EditableEditTrigger } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { editableTriggerVariants, type EditableSize } from './editable';
import { editableSizeKey } from './context';

interface EditableEditTriggerProps {
	/** Override the size inherited from the parent Editable. */
	size?: EditableSize;
	/** Accessible label for icon-only triggers. */
	ariaLabel?: string;
	class?: string;
}

const props = defineProps<EditableEditTriggerProps>();

const inheritedSize = inject<Ref<EditableSize>>(editableSizeKey, ref<EditableSize>('default'));
const effectiveSize = computed<EditableSize>(() => props.size ?? inheritedSize.value);

const classes = computed(() =>
	cn(editableTriggerVariants({ intent: 'edit', size: effectiveSize.value }), props.class),
);
</script>
