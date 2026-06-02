<template>
	<DialogPortal>
		<DialogOverlay />
		<DialogContent
			data-slot="dialog-content"
			:class="classes"
			:style="{ transform: sheetTransform, transition: sheetTransition }"
			:force-mount="forceMount"
			:trap-focus="trapFocus"
			:disable-outside-pointer-events="disableOutsidePointerEvents"
			:aria-label="ariaLabel"
			@escape-key-down="emit('escapeKeyDown', $event)"
			@pointer-down-outside="emit('pointerDownOutside', $event)"
			@focus-outside="emit('focusOutside', $event)"
			@interact-outside="emit('interactOutside', $event)"
			@open-auto-focus="emit('openAutoFocus', $event)"
			@close-auto-focus="emit('closeAutoFocus', $event)"
		>
			<!-- Mobile drag handle (visible only on bottom-sheet < 640 px) -->
			<div
				v-if="!hideDragHandle"
				data-slot="dialog-drag-handle"
				class="hidden max-sm:flex justify-center py-2 cursor-grab active:cursor-grabbing shrink-0 touch-none"
				aria-hidden="true"
				@pointerdown="onHandlePointerDown"
				@pointermove="onHandlePointerMove"
				@pointerup="onHandlePointerUp"
				@pointercancel="onHandlePointerUp"
			>
				<div class="h-1 w-8 rounded-full bg-muted-foreground/30" />
			</div>

			<slot />

			<DialogClose v-if="!hideCloseButton" ref="closeButtonRef" :class="closeClasses">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					width="24"
					height="24"
					viewBox="0 0 24 24"
					fill="none"
					stroke="currentColor"
					stroke-width="2"
					stroke-linecap="round"
					stroke-linejoin="round"
					aria-hidden="true"
				>
					<path d="M18 6 6 18" />
					<path d="m6 6 12 12" />
				</svg>
				<span class="sr-only">Close</span>
			</DialogClose>
		</DialogContent>
	</DialogPortal>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { DialogContent, DialogPortal, DialogClose } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { dialogContentVariants, dialogCloseVariants, type DialogContentVariants } from './dialog';
import DialogOverlay from './DialogOverlay.vue';

interface Props {
	class?: string;
	size?: DialogContentVariants['size'];
	/** When true, applies p-6 padding to the content shell. Use only when not composing Header / Body / Footer. */
	padded?: DialogContentVariants['padded'];
	hideCloseButton?: boolean;
	/** Disable the mobile drag-to-dismiss handle (visible only at < 640 px). */
	hideDragHandle?: boolean;
	forceMount?: boolean;
	trapFocus?: boolean;
	disableOutsidePointerEvents?: boolean;
	/** ARIA label when no DialogTitle is rendered (rare — required by reka-ui for assistive tech). */
	ariaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
	size: 'default',
	padded: false,
	hideCloseButton: false,
	hideDragHandle: false,
});

const emit = defineEmits<{
	escapeKeyDown: [event: KeyboardEvent];
	pointerDownOutside: [event: Event];
	focusOutside: [event: Event];
	interactOutside: [event: Event];
	openAutoFocus: [event: Event];
	closeAutoFocus: [event: Event];
}>();

const classes = computed(() =>
	cn(dialogContentVariants({ size: props.size, padded: props.padded }), props.class),
);
const closeClasses = computed(() => cn(dialogCloseVariants()));

// 100px drag-to-dismiss threshold for the mobile bottom-sheet — matches
// iOS/Material conventions; below this the sheet snaps back.
const DISMISS_THRESHOLD = 100;
const closeButtonRef = ref<InstanceType<typeof DialogClose> | null>(null);
const dragY = ref(0);
const dragging = ref(false);
let startY = 0;

function onHandlePointerDown(e: PointerEvent) {
	dragging.value = true;
	startY = e.clientY;
	dragY.value = 0;
	(e.target as HTMLElement).setPointerCapture(e.pointerId);
}

function onHandlePointerMove(e: PointerEvent) {
	if (!dragging.value) return;
	const delta = e.clientY - startY;
	dragY.value = Math.max(0, delta); // only allow dragging down
}

function onHandlePointerUp() {
	if (!dragging.value) return;
	dragging.value = false;
	if (dragY.value >= DISMISS_THRESHOLD) {
		// Click the close button to dismiss via reka-ui's DialogClose
		const el = closeButtonRef.value?.$el as HTMLElement | undefined;
		el?.click();
	}
	dragY.value = 0;
}

const sheetTransform = computed(() =>
	dragY.value > 0 ? `translateY(${dragY.value}px)` : undefined,
);

const sheetTransition = computed(() => (dragging.value ? 'none' : 'transform 200ms ease-out'));
</script>
