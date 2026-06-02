<template>
	<Dialog :open="open" :default-open="defaultOpen" @update:open="emit('update:open', $event)">
		<DialogContent :size="props.size" class="overflow-hidden p-0" hide-close-button>
			<!--
        Reka stamps aria-labelledby/describedby onto the dialog content; if no
        DialogTitle/Description is rendered, the references resolve to empty
        elements (axe: aria-dialog-name). We supply visually-hidden defaults
        so the palette always has an accessible name.
      -->
			<VisuallyHidden>
				<DialogTitle>{{ title }}</DialogTitle>
				<DialogDescription>{{ description }}</DialogDescription>
			</VisuallyHidden>
			<slot />
		</DialogContent>
	</Dialog>
</template>

<script setup lang="ts">
import { VisuallyHidden, DialogTitle, DialogDescription } from 'reka-ui';
import Dialog from '../../general/dialog/Dialog.vue';
import DialogContent from '../../general/dialog/DialogContent.vue';
import type { DialogSize } from '../../general/dialog/dialog.js';

interface CommandPaletteDialogProps {
	open?: boolean;
	defaultOpen?: boolean;
	size?: DialogSize;
	/** Accessible name announced when the palette opens. */
	title?: string;
	/** Accessible description supplementing the title. */
	description?: string;
}

const props = withDefaults(defineProps<CommandPaletteDialogProps>(), {
	size: 'default',
	title: 'Command palette',
	description: 'Search commands and navigate the application.',
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();
</script>
