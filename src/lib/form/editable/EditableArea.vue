<template>
	<EditableArea :class="classes" data-slot="editable-area">
		<slot />
		<Icon
			v-if="showEditIcon && !isEditing"
			:icon="Pencil"
			size="xs"
			class="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground opacity-0 transition-opacity pointer-events-none group-hover/editable-area:opacity-100 group-focus-within/editable-area:opacity-100"
			aria-hidden="true"
			data-slot="editable-edit-affordance"
		/>
		<template v-if="showSaveCancel">
			<EditableCancelTrigger size="sm" aria-label="Cancel" class="h-7 min-w-7 px-1.5">
				<Icon :icon="X" size="xs-sm" />
			</EditableCancelTrigger>
			<EditableSubmitTrigger size="sm" aria-label="Save" class="h-7 min-w-7 px-1.5">
				<Icon :icon="Check" size="xs-sm" />
			</EditableSubmitTrigger>
		</template>
	</EditableArea>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { EditableArea, injectEditableRootContext } from 'reka-ui';
import { Pencil, Check, X } from '@lucide/vue';
import { cn } from '../../../helpers/cn.js';
import Icon from '../../general/icon/Icon.vue';
import EditableCancelTrigger from './EditableCancelTrigger.vue';
import EditableSubmitTrigger from './EditableSubmitTrigger.vue';

interface EditableAreaProps {
	/**
	 * When true, render a small pencil icon at the right edge of the area on
	 * hover or focus-within. The icon is decorative (`pointer-events-none`) —
	 * the existing click-to-edit behaviour on the preview still drives editing.
	 * Hidden automatically while the field is in edit mode and when the parent
	 * `Editable` is `disabled` or `readonly`.
	 */
	showEditIcon?: boolean;
	/**
	 * When true, render compact icon-only Cancel (X) and Save (✓) triggers
	 * inline with the input. Reka hides them automatically outside edit mode.
	 * Pair with `submitMode="enter"` (or `"none"`) on the parent `Editable` so
	 * the Cancel button doesn't race a blur-save.
	 */
	showSaveCancel?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<EditableAreaProps>(), {
	showEditIcon: false,
	showSaveCancel: false,
});

const rootContext = injectEditableRootContext();
const isEditing = computed(() => rootContext.isEditing.value);

// Inline-flex so a Preview and Input can stack in the same horizontal slot
// without reflowing when the user activates edit mode. `min-w-0` lets the
// inner control truncate inside narrow containers. `group/editable-area` is
// always added so consumers can target it from CSS without enabling the icon.
const classes = computed(() =>
	cn('group/editable-area relative inline-flex w-full min-w-0 items-center gap-2', props.class),
);
</script>
