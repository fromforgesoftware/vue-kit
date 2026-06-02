<template>
	<AlertDialogPortal>
		<AlertDialogOverlay />
		<AlertDialogContent
			data-slot="alert-dialog-content"
			:class="classes"
			:force-mount="forceMount"
			:trap-focus="trapFocus"
			:disable-outside-pointer-events="disableOutsidePointerEvents"
			:aria-label="ariaLabel"
			@escape-key-down="emit('escapeKeyDown', $event)"
			@pointer-down-outside="emit('pointerDownOutside', $event)"
			@focus-outside="emit('focusOutside', $event)"
			@interact-outside="emit('interactOutside', $event)"
			@open-auto-focus="handleOpenAutoFocus"
			@close-auto-focus="emit('closeAutoFocus', $event)"
		>
			<!-- destructive-confirm variant: full layout from props -->
			<template v-if="isDestructiveConfirm">
				<AlertDialogHeader>
					<div>
						<AlertDialogTitle>{{ resolvedTitle }}</AlertDialogTitle>
						<AlertDialogDescription class="mt-1">{{ resolvedDescription }}</AlertDialogDescription>
					</div>
				</AlertDialogHeader>

				<Alert v-if="warning" :variant="warningVariant">
					<Icon :icon="TriangleAlert" size="sm" />
					<AlertTitle>Warning</AlertTitle>
					<AlertDescription>
						<!-- eslint-disable-next-line vue/no-v-html -- warning prop is consumer-provided HTML by design -->
						<span v-html="warning" />
					</AlertDescription>
				</Alert>

				<slot />

				<div v-if="confirmValue" class="flex flex-col gap-2">
					<!-- eslint-disable-next-line vue/no-v-html -- confirmLabel is consumer-provided HTML by design -->
					<p class="text-sm text-foreground" v-html="resolvedConfirmLabel" />
					<div :class="alertDialogConfirmInputVariants()">
						<Icon :icon="Trash2" size="sm" :class="alertDialogConfirmInputIconVariants()" />
						<input
							v-model="confirmInput"
							type="text"
							data-slot="alert-dialog-confirm-input"
							:placeholder="resolvedConfirmPlaceholder"
							:class="alertDialogConfirmInputFieldVariants()"
						/>
					</div>
				</div>

				<AlertDialogFooter>
					<AlertDialogCancel @click="emit('cancel')">
						{{ resolvedCancelText }}
					</AlertDialogCancel>
					<AlertDialogAction :disabled="isConfirmDisabled" @click="emit('confirm')">
						{{ resolvedConfirmText }}
					</AlertDialogAction>
				</AlertDialogFooter>
			</template>
			<!-- default / destructive variant: slot-based composition -->
			<slot v-else />
		</AlertDialogContent>
	</AlertDialogPortal>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { AlertDialogContent, AlertDialogPortal } from 'reka-ui';
import { TriangleAlert, Trash2 } from '@lucide/vue';
import { cn } from '../../../helpers/cn.js';
import {
	alertDialogContentVariants,
	alertDialogConfirmInputVariants,
	alertDialogConfirmInputFieldVariants,
	alertDialogConfirmInputIconVariants,
	ALERT_DIALOG_VARIANT_KEY,
	type AlertDialogContentVariants,
	type AlertDialogVariant,
} from './alert-dialog.js';
import AlertDialogOverlay from './AlertDialogOverlay.vue';
import AlertDialogTitle from './AlertDialogTitle.vue';
import AlertDialogDescription from './AlertDialogDescription.vue';
import AlertDialogHeader from './AlertDialogHeader.vue';
import AlertDialogFooter from './AlertDialogFooter.vue';
import AlertDialogAction from './AlertDialogAction.vue';
import AlertDialogCancel from './AlertDialogCancel.vue';
import Alert from '../alert/Alert.vue';
import AlertTitle from '../alert/AlertTitle.vue';
import AlertDescription from '../alert/AlertDescription.vue';
import Icon from '../icon/Icon.vue';

interface Props {
	class?: string;
	size?: AlertDialogContentVariants['size'];
	forceMount?: boolean;
	trapFocus?: boolean;
	disableOutsidePointerEvents?: boolean;
	/** Dialog title — used by destructive-confirm variant */
	title?: string;
	/** Dialog description — used by destructive-confirm variant */
	description?: string;
	/** Warning message (supports HTML) — used by destructive-confirm variant */
	warning?: string;
	/** Alert variant for the warning banner — used by destructive-confirm variant */
	warningVariant?: 'default' | 'info' | 'warning' | 'destructive' | 'success';
	/** Entity name the user must type to confirm — used by destructive-confirm variant */
	confirmValue?: string;
	/** Label above the confirm input. {name} is replaced with confirmValue. */
	confirmLabel?: string;
	/** Placeholder for the confirm input. */
	confirmPlaceholder?: string;
	/** Confirm button text — used by destructive-confirm variant */
	confirmText?: string;
	/** Cancel button text — used by destructive-confirm variant */
	cancelText?: string;
	/** Accessible name when no AlertDialogTitle is provided. */
	ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
	size: 'default',
	warningVariant: 'destructive',
});

const resolvedTitle = computed(() => props.title ?? 'Delete');
const resolvedDescription = computed(
	() => props.description ?? 'Confirm this action. This cannot be undone.',
);
const resolvedConfirmText = computed(() => props.confirmText ?? 'Delete');
const resolvedCancelText = computed(() => props.cancelText ?? 'Cancel');

const emit = defineEmits<{
	escapeKeyDown: [event: KeyboardEvent];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	interactOutside: [event: Event];
	openAutoFocus: [event: Event];
	closeAutoFocus: [event: Event];
	/** Emitted when the user confirms in destructive-confirm variant */
	confirm: [];
	/** Emitted when the user cancels in destructive-confirm variant */
	cancel: [];
}>();

const injectedVariant = inject(ALERT_DIALOG_VARIANT_KEY, ref<AlertDialogVariant>('default'));
const isDestructiveConfirm = computed(() => injectedVariant.value === 'destructive-confirm');

const classes = computed(() => cn(alertDialogContentVariants({ size: props.size }), props.class));

// Confirm input state for destructive-confirm variant
const confirmInput = ref('');

const isConfirmDisabled = computed(() => {
	if (!props.confirmValue) return false;
	return confirmInput.value !== props.confirmValue;
});

const resolvedConfirmLabel = computed(() => {
	if (props.confirmLabel) {
		return props.confirmLabel.replace('{name}', `<b>${props.confirmValue ?? ''}</b>`);
	}
	if (props.confirmValue) {
		return `Type <b>${props.confirmValue}</b> to confirm deletion.`;
	}
	return '';
});

const resolvedConfirmPlaceholder = computed(
	() => props.confirmPlaceholder ?? (props.confirmValue ? `Enter ${props.confirmValue}` : ''),
);

function handleOpenAutoFocus(event: Event) {
	confirmInput.value = '';
	emit('openAutoFocus', event);
}
</script>
