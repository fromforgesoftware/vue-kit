<template>
	<EditableSubmitTrigger
		:class="classes"
		:aria-label="ariaLabel"
		data-slot="editable-submit-trigger"
	>
		<slot>Save</slot>
	</EditableSubmitTrigger>
</template>

<script setup lang="ts">
import { computed, inject, ref, type Ref } from 'vue';
import { EditableSubmitTrigger } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { editableTriggerVariants, type EditableSize } from './editable';
import { editableSizeKey } from './context';

interface EditableSubmitTriggerProps {
	/** Override the size inherited from the parent Editable. */
	size?: EditableSize;
	/** Accessible label for icon-only triggers. */
	ariaLabel?: string;
	class?: string;
}

const props = defineProps<EditableSubmitTriggerProps>();

const inheritedSize = inject<Ref<EditableSize>>(editableSizeKey, ref<EditableSize>('default'));
const effectiveSize = computed<EditableSize>(() => props.size ?? inheritedSize.value);

const classes = computed(() =>
	cn(editableTriggerVariants({ intent: 'submit', size: effectiveSize.value }), props.class),
);
</script>
