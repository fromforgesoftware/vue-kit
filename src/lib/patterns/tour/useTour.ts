import { ref, computed, watch, onBeforeUnmount, type Ref, type ComputedRef, nextTick } from 'vue';
import type { TourStep } from './tour.js';

export interface UseTourOptions {
	steps: TourStep[];
	/** Called when tour finishes (done or skip) */
	onComplete?: (reason: 'done' | 'skip') => void;
}

export interface UseTourReturn {
	/** Whether the tour is currently active */
	isActive: Readonly<Ref<boolean>>;
	/** Current step index (0-based), -1 when inactive */
	currentIndex: Ref<number>;
	/** Current step object, or null when inactive */
	currentStep: ComputedRef<TourStep | null>;
	/** Total number of steps */
	totalSteps: ComputedRef<number>;
	/** The resolved DOM element for the current step target */
	targetElement: Readonly<Ref<HTMLElement | null>>;
	/** Bounding rect of the target element, reactive to scroll/resize */
	targetRect: Readonly<Ref<DOMRect | null>>;
	/** Start the tour from step 0 */
	start: () => void;
	/** Navigate to next step; finishes tour if on last step */
	next: () => void;
	/** Navigate to previous step (no-op on first step) */
	prev: () => void;
	/** Jump to a specific step by index */
	goTo: (index: number) => void;
	/** Exit the tour entirely */
	skip: () => void;
	/** Whether currently on the first step */
	isFirst: ComputedRef<boolean>;
	/** Whether currently on the last step */
	isLast: ComputedRef<boolean>;
}

export function useTour(options: UseTourOptions): UseTourReturn {
	const { steps, onComplete } = options;

	const currentIndex = ref(-1);
	const targetElement = ref<HTMLElement | null>(null);
	const targetRect = ref<DOMRect | null>(null);

	const isActive = computed(() => currentIndex.value >= 0);
	const currentStep = computed(() =>
		currentIndex.value >= 0 && currentIndex.value < steps.length ? steps[currentIndex.value] : null,
	);
	const totalSteps = computed(() => steps.length);
	const isFirst = computed(() => currentIndex.value === 0);
	const isLast = computed(() => currentIndex.value === steps.length - 1);

	let resizeObserver: ResizeObserver | null = null;
	let scrollHandler: (() => void) | null = null;

	function updateRect() {
		if (targetElement.value) {
			targetRect.value = targetElement.value.getBoundingClientRect();
		} else {
			targetRect.value = null;
		}
	}

	function cleanupObservers() {
		if (resizeObserver) {
			resizeObserver.disconnect();
			resizeObserver = null;
		}
		if (scrollHandler) {
			window.removeEventListener('scroll', scrollHandler, true);
			scrollHandler = null;
		}
	}

	function observeTarget(el: HTMLElement) {
		cleanupObservers();

		resizeObserver = new ResizeObserver(updateRect);
		resizeObserver.observe(el);

		scrollHandler = updateRect;
		window.addEventListener('scroll', scrollHandler, true);
	}

	function resolveTarget(step: TourStep): HTMLElement | null {
		const el = document.querySelector<HTMLElement>(step.target);
		if (!el) {
			console.warn(`[Tour] Target not found: "${step.target}". Skipping step.`);
			return null;
		}
		return el;
	}

	async function activateStep(index: number) {
		if (index < 0 || index >= steps.length) {
			end('done');
			return;
		}

		const step = steps[index];
		const el = resolveTarget(step);

		if (!el) {
			// Skip to next valid step in the direction we're going
			const direction = index > currentIndex.value ? 1 : -1;
			const nextIndex = index + direction;
			if (nextIndex >= 0 && nextIndex < steps.length) {
				await activateStep(nextIndex);
			} else {
				end('done');
			}
			return;
		}

		currentIndex.value = index;
		targetElement.value = el;
		updateRect();
		observeTarget(el);

		// nextTick: target may have just been rendered; wait for layout before scrolling.
		await nextTick();
		el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });

		// Run step's onActivate callback
		if (step.onActivate) {
			await step.onActivate();
		}
	}

	function end(reason: 'done' | 'skip') {
		currentIndex.value = -1;
		targetElement.value = null;
		targetRect.value = null;
		cleanupObservers();
		onComplete?.(reason);
	}

	function start() {
		activateStep(0);
	}

	function next() {
		if (isLast.value) {
			end('done');
		} else {
			activateStep(currentIndex.value + 1);
		}
	}

	function prev() {
		if (!isFirst.value) {
			activateStep(currentIndex.value - 1);
		}
	}

	function goTo(index: number) {
		activateStep(index);
	}

	function skip() {
		end('skip');
	}

	// Keyboard handling
	function handleKeydown(e: KeyboardEvent) {
		if (!isActive.value) return;

		switch (e.key) {
			case 'Escape':
				e.preventDefault();
				skip();
				break;
			case 'ArrowRight':
				e.preventDefault();
				next();
				break;
			case 'ArrowLeft':
				e.preventDefault();
				prev();
				break;
		}
	}

	watch(isActive, (active) => {
		if (active) {
			document.addEventListener('keydown', handleKeydown);
		} else {
			document.removeEventListener('keydown', handleKeydown);
		}
	});

	onBeforeUnmount(() => {
		document.removeEventListener('keydown', handleKeydown);
		cleanupObservers();
	});

	return {
		isActive,
		currentIndex,
		currentStep,
		totalSteps,
		targetElement,
		targetRect,
		start,
		next,
		prev,
		goTo,
		skip,
		isFirst,
		isLast,
	};
}
