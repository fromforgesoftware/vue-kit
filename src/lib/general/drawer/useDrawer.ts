import { ref, nextTick, onUnmounted } from 'vue';
import type { DrawerContext, DrawerSide } from './drawer.js';
import { TRANSITION_MS } from './drawer.js';

const ROOT_PANEL = '__root__';

export function useDrawer(
	initialOpen = false,
	onUpdateOpen?: (value: boolean) => void,
	initialSide: DrawerSide = 'right',
): DrawerContext {
	const isOpen = ref(initialOpen);
	// When initialOpen is true, the drawer should start visible so consumers
	// using `default-open` or `:open="true"` see it without an explicit open() call.
	const isVisible = ref(initialOpen);
	const isClosing = ref(false);
	const stack = ref<string[]>([ROOT_PANEL]);
	const entering = ref<string | null>(null);
	const leaving = ref<string | null>(null);
	const side = ref<DrawerSide>(initialSide);

	function open() {
		// Mark root as entering so it renders off-screen first
		entering.value = ROOT_PANEL;
		stack.value = [ROOT_PANEL];
		isClosing.value = false;
		isVisible.value = true;
		isOpen.value = true;
		onUpdateOpen?.(true);
		// nextTick → rAF: paint at the off-screen start position before transitioning.
		// Without both, the open animation skips its first frame and snaps in.
		nextTick(() => {
			requestAnimationFrame(() => {
				entering.value = null;
			});
		});
	}

	function closeAll() {
		// Start close animation: panels will animate to off-screen positions
		isClosing.value = true;
		isOpen.value = false;
		onUpdateOpen?.(false);
		// After animation completes, hide DOM and reset
		setTimeout(() => {
			isVisible.value = false;
			isClosing.value = false;
			stack.value = [ROOT_PANEL];
			entering.value = null;
		}, TRANSITION_MS);
	}

	function pushStep(name: string) {
		if (!stack.value.includes(name)) {
			// Mark as entering so the panel renders at its start position
			entering.value = name;
			stack.value = [...stack.value, name];
			// Same nextTick → rAF guard as open() so multi-step push transitions
			// don't drop their first frame.
			nextTick(() => {
				requestAnimationFrame(() => {
					entering.value = null;
				});
			});
		}
	}

	function popStep() {
		if (stack.value.length > 1) {
			const panelToRemove = stack.value[stack.value.length - 1];
			// Mark as leaving so the panel animates off-screen
			leaving.value = panelToRemove;
			// After the animation completes, remove from the stack
			setTimeout(() => {
				stack.value = stack.value.filter((n) => n !== panelToRemove);
				leaving.value = null;
			}, TRANSITION_MS);
		} else {
			closeAll();
		}
	}

	function onKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape' && isOpen.value) {
			e.preventDefault();
			e.stopPropagation();
			popStep();
		}
	}

	if (typeof window !== 'undefined') {
		window.addEventListener('keydown', onKeydown);
		onUnmounted(() => {
			window.removeEventListener('keydown', onKeydown);
		});
	}

	return {
		isOpen,
		isVisible,
		isClosing,
		stack,
		entering,
		leaving,
		side,
		pushStep,
		popStep,
		closeAll,
		open,
	};
}

export { ROOT_PANEL };
