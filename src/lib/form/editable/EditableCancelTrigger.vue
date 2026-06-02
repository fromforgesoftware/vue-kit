<template>
	<EditableCancelTrigger
		:class="classes"
		:aria-label="ariaLabel"
		data-slot="editable-cancel-trigger"
	>
		<slot>Cancel</slot>
	</EditableCancelTrigger>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { EditableCancelTrigger } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { editableTriggerVariants, type EditableSize } from './editable.js';
import { editableSizeKey } from './context.js';

interface EditableCancelTriggerProps {
	/** Override the size inherited from the parent Editable. */
	size?: EditableSize;
	/** Accessible label for icon-only triggers. */
	ariaLabel?: string;
	class?: string;
}

const props = defineProps<EditableCancelTriggerProps>();

const inheritedSize = inject<Ref<EditableSize>>(editableSizeKey, ref<EditableSize>('default'));
const effectiveSize = computed<EditableSize>(() => props.size ?? inheritedSize.value);

const classes = computed(() =>
	cn(editableTriggerVariants({ intent: 'cancel', size: effectiveSize.value }), props.class),
);
</script>
