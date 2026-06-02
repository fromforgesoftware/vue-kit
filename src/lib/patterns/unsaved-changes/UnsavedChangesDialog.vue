<template>
	<AlertDialog data-slot="unsaved-changes-dialog" :open="open">
		<AlertDialogContent :class="$props.class">
			<AlertDialogHeader>
				<div>
					<AlertDialogTitle>{{ title }}</AlertDialogTitle>
					<AlertDialogDescription class="mt-1">{{ description }}</AlertDialogDescription>
				</div>
			</AlertDialogHeader>
			<AlertDialogFooter>
				<AlertDialogCancel data-slot="unsaved-changes-cancel" @click="emit('cancel')">
					{{ cancelText }}
				</AlertDialogCancel>
				<AlertDialogAction
					data-slot="unsaved-changes-confirm"
					:variant="confirmVariant"
					@click="emit('confirm')"
				>
					{{ confirmText }}
				</AlertDialogAction>
			</AlertDialogFooter>
		</AlertDialogContent>
	</AlertDialog>
</template>

<script setup lang="ts">
import AlertDialog from '../../general/alert-dialog/AlertDialog.vue';
import AlertDialogContent from '../../general/alert-dialog/AlertDialogContent.vue';
import AlertDialogHeader from '../../general/alert-dialog/AlertDialogHeader.vue';
import AlertDialogFooter from '../../general/alert-dialog/AlertDialogFooter.vue';
import AlertDialogTitle from '../../general/alert-dialog/AlertDialogTitle.vue';
import AlertDialogDescription from '../../general/alert-dialog/AlertDialogDescription.vue';
import AlertDialogAction from '../../general/alert-dialog/AlertDialogAction.vue';
import AlertDialogCancel from '../../general/alert-dialog/AlertDialogCancel.vue';
import type { ButtonVariants } from '../../general/button/button.js';

interface Props {
	/** Controlled open state. Bind to the composable's isDialogOpen. */
	open: boolean;
	/** Dialog title. */
	title?: string;
	/** Dialog description text. */
	description?: string;
	/** Confirm button text (e.g. "Discard changes"). */
	confirmText?: string;
	/** Cancel button text (e.g. "Continue"). */
	cancelText?: string;
	/** Confirm button variant. */
	confirmVariant?: ButtonVariants['variant'];
	class?: string;
}

withDefaults(defineProps<Props>(), {
	title: 'Discard unsaved changes?',
	description: 'If you leave now, your changes will be lost.',
	confirmText: 'Discard changes',
	cancelText: 'Continue',
	confirmVariant: 'destructive',
});

const emit = defineEmits<{
	/** User confirmed navigation (wants to leave). */
	confirm: [];
	/** User cancelled navigation (wants to stay). */
	cancel: [];
}>();
</script>
