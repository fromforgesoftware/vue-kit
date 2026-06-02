<template>
	<Teleport to="body">
		<div
			v-show="ctx.isVisible.value"
			data-slot="drawer-panel"
			:class="panelClasses"
			:style="panelStyle"
			role="dialog"
			:aria-modal="isActive ? 'true' : undefined"
			:aria-hidden="!isActive"
			:aria-label="computedAriaLabel"
			:aria-labelledby="ariaLabelledBy"
		>
			<slot />
			<button
				v-if="!hideCloseButton"
				:class="closeClasses"
				type="button"
				aria-label="Close"
				@click="onClose"
			>
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
			</button>
		</div>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, inject, provide, ref, onMounted, onUnmounted, useId } from 'vue';
import { cn } from '../../../helpers/cn.js';
import {
	drawerKey,
	drawerPanelKey,
	drawerPanelVariants,
	drawerCloseVariants,
	nestedDrawerKey,
	PANEL_PEEK_PX,
	PANEL_GAP_PX,
	TRANSITION_MS,
	type DrawerPanelVariants,
} from './drawer.js';
import { ROOT_PANEL } from './useDrawer.js';

interface DrawerPanelProps {
	/** Unique panel name. Omit for the root panel. */
	name?: string;
	/** Hide the close (X) button */
	hideCloseButton?: boolean;
	/** Width tier (left/right) or height tier (top/bottom). Default: md. */
	size?: DrawerPanelVariants['size'];
	class?: string;
	/** Accessible name when no DrawerTitle is rendered. */
	ariaLabel?: string;
}

const props = withDefaults(defineProps<DrawerPanelProps>(), {
	name: ROOT_PANEL,
	hideCloseButton: false,
	size: 'md',
});

const ctx = inject(drawerKey)!;
const nested = inject(nestedDrawerKey, null);

const SM_BREAKPOINT = 640;
const isMobile = ref(typeof window !== 'undefined' ? window.innerWidth < SM_BREAKPOINT : false);
let mobileQuery: MediaQueryList | null = null;

onMounted(() => {
	mobileQuery = window.matchMedia(`(max-width: ${SM_BREAKPOINT - 1}px)`);
	isMobile.value = mobileQuery.matches;
	const handler = (e: MediaQueryListEvent) => {
		isMobile.value = e.matches;
	};
	mobileQuery.addEventListener('change', handler);
	onUnmounted(() => mobileQuery?.removeEventListener('change', handler));
});

// Inside a nested Drawer, an unnamed root panel auto-adopts the host's
// auto-step name so the consumer's `<DrawerPanel>` becomes the side-step.
const panelName = computed(() => {
	if (nested && (props.name === undefined || props.name === ROOT_PANEL)) {
		return nested.stepName;
	}
	return props.name ?? ROOT_PANEL;
});
const stackIndex = computed(() => ctx.stack.value.indexOf(panelName.value));
const isInStack = computed(() => stackIndex.value >= 0);
const isActive = computed(() => stackIndex.value === ctx.stack.value.length - 1);
const depthFromTop = computed(() =>
	isInStack.value ? ctx.stack.value.length - 1 - stackIndex.value : 0,
);
const isEntering = computed(() => ctx.entering.value === panelName.value);
const isLeaving = computed(() => ctx.leaving.value === panelName.value);

const side = computed(() => ctx.side.value);

/**
 * Off-screen transform for the current side. The +16 px on desktop sides
 * accounts for the `top-4 / right-4 / left-4 / bottom-4` offset so the
 * panel slides past the edge of the visible area.
 */
function offScreenForSide(): string {
	if (isMobile.value) {
		switch (side.value) {
			case 'left':
				return 'translateX(-100%)';
			case 'top':
				return 'translateY(-100%)';
			case 'bottom':
				return 'translateY(100%)';
			default:
				return 'translateX(100%)';
		}
	}
	switch (side.value) {
		case 'left':
			return 'translateX(calc(-100% - 16px))';
		case 'top':
			return 'translateY(calc(-100% - 16px))';
		case 'bottom':
			return 'translateY(calc(100% + 16px))';
		default:
			return 'translateX(calc(100% + 16px))';
	}
}

/**
 * Compute inline styles to position each panel.
 *
 * Multi-step stacking (peek behaviour) only applies when side is left or
 * right. Top/bottom drawers don't stack — each push replaces the previous.
 */
const panelStyle = computed(() => {
	const d = depthFromTop.value;
	const stackLen = ctx.stack.value.length;
	const peekStep = PANEL_PEEK_PX + PANEL_GAP_PX;
	const offScreen = offScreenForSide();
	const base: Record<string, string | number> = {
		zIndex: isInStack.value ? 51 + (stackLen - d) : 49,
	};

	// Entering: snap to off-screen (no transition on first frame)
	if (isEntering.value) {
		base.transition = 'none';
		base.transform = offScreen;
		return base;
	}

	base.transition = `transform ${TRANSITION_MS}ms ease-in-out`;

	if (isLeaving.value || ctx.isClosing.value || !isInStack.value) {
		base.transform = offScreen;
		return base;
	}

	// Mobile: panels are full-screen, no peek/shift
	if (isMobile.value) {
		base.transform = 'translate(0, 0)';
		return base;
	}

	// Top / bottom: no peek stacking — last panel wins
	if (side.value === 'top' || side.value === 'bottom') {
		if (d === 0) {
			base.transform = 'translate(0, 0)';
		} else {
			base.transform = offScreen;
		}
		return base;
	}

	// Right / left: stacked panels with peek
	const isLeft = side.value === 'left';
	const sign = isLeft ? -1 : 1;
	if (d === 0) {
		const behind = stackLen - 1;
		if (behind === 0) {
			base.transform = 'translateX(0)';
		} else {
			// Shift away from the dock side to make room for peeking panel(s)
			base.transform = `translateX(${-sign * peekStep}px)`;
		}
		return base;
	}

	if (d === 1) {
		// Peek from the dock side
		base.transform = `translateX(calc(${sign * 100}% - ${sign * PANEL_PEEK_PX}px))`;
		return base;
	}

	// Depth 2+: fully hidden
	base.transform = offScreen;
	return base;
});

const panelClasses = computed(() =>
	cn(drawerPanelVariants({ side: side.value, size: props.size }), props.class),
);

const closeClasses = computed(() => cn(drawerCloseVariants()));

function onClose() {
	ctx.closeAll();
}

// Title coordination: DrawerTitle registers itself when present so the panel
// can switch from `aria-label` to `aria-labelledby` automatically. This keeps
// the dialog accessibility-compliant (axe rule: aria-dialog-name) without
// requiring consumers to wire ids manually.
const titleId = useId();
const titleRegistered = ref(false);
provide(drawerPanelKey, {
	titleId,
	registerTitle: () => {
		titleRegistered.value = true;
	},
	unregisterTitle: () => {
		titleRegistered.value = false;
	},
});

const ariaLabelledBy = computed(() => (titleRegistered.value ? titleId : undefined));
const computedAriaLabel = computed(() =>
	// Fall back to props.ariaLabel only when no DrawerTitle is present.
	titleRegistered.value ? undefined : props.ariaLabel,
);
</script>
