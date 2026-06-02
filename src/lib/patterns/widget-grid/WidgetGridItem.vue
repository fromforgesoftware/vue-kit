<template>
	<div
		ref="itemRef"
		:class="classes"
		:style="itemStyle"
		:data-i="i"
		:aria-roledescription="isDraggable ? 'draggable' : undefined"
		data-slot="widget-grid-item"
		@mousedown.prevent="onMouseDown"
	>
		<slot />
		<Button
			v-if="isResizable"
			variant="ghost"
			class="absolute bottom-0 right-0 h-5 w-5 cursor-se-resize text-muted-foreground p-0 hover:bg-transparent flex items-end justify-end pr-0.5 pb-0.5"
			aria-label="Resize widget"
			data-slot="widget-grid-resize-handle"
			@mousedown.stop.prevent="onResizeStart"
		>
			<svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
				<path
					d="M9 1L1 9M9 5L5 9M9 9L9 9"
					stroke="currentColor"
					stroke-width="1.5"
					stroke-linecap="round"
				/>
			</svg>
		</Button>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref, onMounted, onUnmounted, watch } from 'vue';
import { cn } from '../../../helpers/cn';
import Button from '../../general/button/Button.vue';
import {
	widgetGridItemVariants,
	type GridLayoutConfig,
	type GridItemPosition,
} from './widget-grid';

interface Props {
	i: string | number;
	x: number;
	y: number;
	w: number;
	h: number;
	// Minimum size (in column / row units) the user can resize down to.
	// Independent of `snapColumns` — set this for the *floor*, set
	// `snapColumns` for the *step*. Together they let you have, say, free
	// 1-col movement with a guaranteed `minW=4` panel.
	minW?: number;
	minH?: number;
	zIndex?: number;
	allItems?: GridItemPosition[];
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	x: 0,
	y: 0,
	w: 1,
	h: 1,
	minW: 1,
	minH: 1,
	zIndex: 1,
	allItems: () => [],
});

const emit = defineEmits<{
	moved: [event: GridItemPosition];
	resized: [event: GridItemPosition];
}>();

const itemRef = ref<HTMLElement | null>(null);
const isDragging = ref(false);
const isResizing = ref(false);
const startX = ref(0);
const startY = ref(0);
const startWidth = ref(0);
const startHeight = ref(0);
const startItemX = ref(0);
const startItemY = ref(0);
// `currentX/Y/W/H` track the *snap target* — the grid-aligned cell the panel
// will land in on release. The placeholder reads them via `layoutConfig.dragging`.
const currentX = ref(props.x);
const currentY = ref(props.y);
const currentW = ref(props.w);
const currentH = ref(props.h);
// Pixel offset of the rendered panel from its drag-start snap position.
// Only non-zero during an active interaction; reset on `mouseup`. This is
// what makes the panel follow the cursor smoothly while the placeholder
// (driven by `currentX/Y/W/H`) shows where it'll snap to.
const dragOffset = ref({ dx: 0, dy: 0 });
const resizeOffset = ref({ dw: 0, dh: 0 });

const layoutConfig = inject('layoutConfig') as GridLayoutConfig;

const isDraggable = computed(() => layoutConfig.draggable);
const isResizable = computed(() => layoutConfig.resizable);

const availableRows = computed(() => layoutConfig.rows || 20);

const currentRowHeight = computed((): number => {
	const rh = layoutConfig.rowHeight as number | { value: number };
	const v = typeof rh === 'object' && rh !== null && 'value' in rh ? rh.value : (rh as number);
	return v || 1;
});

// Movement snap step driven by `snapColumns`: the panel jumps in units of
// `cols / snapColumns` so layouts stay aligned to the visual accent grid.
// `bestSnap` below relaxes this to 1-col precision when the snapped target
// won't fit — that lets users slide into gaps smaller than the snap step.
const snapSize = computed(() => layoutConfig.cols / (layoutConfig.snapColumns || 4));

// Relative snap: rounds `value` to the nearest `start ± snap × n`. Keeps
// non-grid-aligned start positions (e.g. a `w=8` panel on a 6-col snap grid)
// reachable instead of forcing them onto the absolute snap multiples on the
// first pixel of movement.
function snapFrom(start: number, value: number, snap: number): number {
	return start + Math.round((value - start) / snap) * snap;
}

// Two-tier snap used for drag X and resize W. First tries the coarse
// `snapColumns`-driven snap (preserves the configured breakpoints); if that
// position collides, falls back to a per-column position aligned to the
// cursor. Returns `null` when neither candidate fits, in which case the
// caller leaves the value unchanged for this frame.
function bestSnap(
	start: number,
	raw: number,
	snap: number,
	min: number,
	max: number,
	fits: (v: number) => boolean,
): number | null {
	const clamp = (v: number) => Math.max(min, Math.min(v, max));
	const snapped = clamp(snapFrom(start, raw, snap));
	if (fits(snapped)) return snapped;
	const fine = clamp(Math.round(raw));
	if (fits(fine)) return fine;
	return null;
}

function checkCollision(
	x1: number,
	y1: number,
	w1: number,
	h1: number,
	x2: number,
	y2: number,
	w2: number,
	h2: number,
): boolean {
	return x1 < x2 + w2 && x1 + w1 > x2 && y1 < y2 + h2 && y1 + h1 > y2;
}

function wouldCollide(newX: number, newY: number, newW: number, newH: number): boolean {
	const items = props.allItems || [];
	for (const item of items) {
		if (String(item.i) === String(props.i)) continue;
		if (checkCollision(newX, newY, newW, newH, item.x, item.y, item.w, item.h)) return true;
	}
	return false;
}

// When `showPlaceholder` is on, the panel renders at `(start position in
// cells) + (cursor delta in px)` so it tracks the cursor 1:1 (Grafana / React
// Grid Layout style). The placeholder, fed by `currentX/Y/W/H`, shows where
// it'll snap to. With placeholder off, we keep the original behaviour: the
// panel jumps directly to each snap target as you drag.
const colPct = computed(() => 100 / layoutConfig.cols);
const smoothFollow = computed(() => layoutConfig.showPlaceholder);

const itemStyle = computed(() => {
	const interacting = isDragging.value || isResizing.value;
	const useSmooth = smoothFollow.value && interacting;
	const baseX = useSmooth && isDragging.value ? startItemX.value : currentX.value;
	const baseY = useSmooth && isDragging.value ? startItemY.value : currentY.value;
	const baseW = useSmooth && isResizing.value ? startWidth.value : currentW.value;
	const baseH = useSmooth && isResizing.value ? startHeight.value : currentH.value;

	const left =
		useSmooth && isDragging.value
			? `calc(${baseX * colPct.value}% + ${dragOffset.value.dx}px)`
			: `${baseX * colPct.value}%`;
	const top =
		useSmooth && isDragging.value
			? `calc(${baseY * currentRowHeight.value}rem + ${dragOffset.value.dy}px)`
			: `${baseY * currentRowHeight.value}rem`;
	const width =
		useSmooth && isResizing.value
			? `calc(${baseW * colPct.value}% + ${resizeOffset.value.dw}px)`
			: `${baseW * colPct.value}%`;
	const height =
		useSmooth && isResizing.value
			? `calc(${baseH * currentRowHeight.value}rem + ${resizeOffset.value.dh}px)`
			: `${baseH * currentRowHeight.value}rem`;

	return {
		left,
		top,
		width,
		height,
		zIndex: interacting ? 50 : props.zIndex,
	} as Record<string, string | number>;
});

const classes = computed(() =>
	cn(
		widgetGridItemVariants({
			editable: isDraggable.value,
			dragging: isDragging.value || isResizing.value,
			scaleOnDrag: !layoutConfig.disableDragScale,
		}),
		props.class,
	),
);

onMounted(() => {
	currentX.value = props.x;
	currentY.value = props.y;
	currentW.value = props.w;
	currentH.value = props.h;
});

watch(
	() => props.x,
	(v) => {
		currentX.value = Math.max(0, Math.min(v, layoutConfig.cols - currentW.value));
	},
);
watch(
	() => props.y,
	(v) => {
		currentY.value = Math.max(0, Math.min(v, availableRows.value - currentH.value));
	},
);
watch(
	() => props.w,
	(v) => {
		currentW.value = Math.max(1, Math.min(v, layoutConfig.cols - currentX.value));
	},
);
watch(
	() => props.h,
	(v) => {
		currentH.value = Math.max(1, Math.min(v, availableRows.value - currentY.value));
	},
);

watch([availableRows, () => layoutConfig.cols], () => {
	const maxX = layoutConfig.cols - currentW.value;
	const maxY = availableRows.value - currentH.value;
	if (currentX.value > maxX) currentX.value = Math.max(0, maxX);
	if (currentY.value > maxY) currentY.value = Math.max(0, maxY);
});

function publishDragging() {
	layoutConfig.dragging = {
		i: props.i,
		x: currentX.value,
		y: currentY.value,
		w: currentW.value,
		h: currentH.value,
	};
}

function onMouseDown(e: MouseEvent) {
	if (!isDraggable.value || isResizing.value) return;
	isDragging.value = true;
	startX.value = e.clientX;
	startY.value = e.clientY;
	startItemX.value = currentX.value;
	startItemY.value = currentY.value;
	dragOffset.value = { dx: 0, dy: 0 };
	publishDragging();
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
}

function onMouseMove(e: MouseEvent) {
	if (!isDragging.value && !isResizing.value) return;
	const gridContainer = itemRef.value?.parentElement;
	if (!gridContainer) return;
	const rect = gridContainer.getBoundingClientRect();
	const deltaX = e.clientX - startX.value;
	const deltaY = e.clientY - startY.value;

	if (isDragging.value) {
		// Visual: panel follows cursor in pixels.
		dragOffset.value = { dx: deltaX, dy: deltaY };

		// Snap target (logical position the panel will occupy on release).
		const colWidth = rect.width / layoutConfig.cols;
		const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const rowHeight = currentRowHeight.value * remInPixels;
		const rawX = startItemX.value + deltaX / colWidth;
		const rawY = startItemY.value + deltaY / rowHeight;
		const maxX = layoutConfig.cols - currentW.value;
		const maxY = availableRows.value - currentH.value;
		const boundedY = Math.max(0, Math.min(Math.round(rawY), maxY));
		const xResult = bestSnap(
			startItemX.value,
			rawX,
			snapSize.value,
			0,
			maxX,
			(x) => !wouldCollide(x, boundedY, currentW.value, currentH.value),
		);
		if (xResult !== null) {
			currentX.value = xResult;
			currentY.value = boundedY;
		}
		publishDragging();
	} else if (isResizing.value) {
		// Visual: panel grows/shrinks with cursor in pixels.
		resizeOffset.value = { dw: deltaX, dh: deltaY };

		// Snap target size.
		const colWidth = rect.width / layoutConfig.cols;
		const remInPixels = parseFloat(getComputedStyle(document.documentElement).fontSize);
		const rowHeight = currentRowHeight.value * remInPixels;
		const rawW = startWidth.value + deltaX / colWidth;
		const rawH = startHeight.value + deltaY / rowHeight;
		const maxW = layoutConfig.cols - currentX.value;
		const maxH = availableRows.value - currentY.value;
		const boundedH = Math.max(props.minH, Math.min(Math.round(rawH), maxH));
		const wResult = bestSnap(
			startWidth.value,
			rawW,
			snapSize.value,
			props.minW,
			maxW,
			(w) => !wouldCollide(currentX.value, currentY.value, w, boundedH),
		);
		if (wResult !== null) {
			currentW.value = wResult;
			currentH.value = boundedH;
		}
		publishDragging();
	}
}

function onMouseUp() {
	if (isDragging.value) {
		isDragging.value = false;
		dragOffset.value = { dx: 0, dy: 0 };
		emit('moved', {
			i: props.i,
			x: currentX.value,
			y: currentY.value,
			w: currentW.value,
			h: currentH.value,
		});
	} else if (isResizing.value) {
		isResizing.value = false;
		resizeOffset.value = { dw: 0, dh: 0 };
		emit('resized', {
			i: props.i,
			x: currentX.value,
			y: currentY.value,
			w: currentW.value,
			h: currentH.value,
		});
	}
	layoutConfig.dragging = null;
	document.removeEventListener('mousemove', onMouseMove);
	document.removeEventListener('mouseup', onMouseUp);
}

function onResizeStart(e: MouseEvent) {
	if (!isResizable.value || isDragging.value) return;
	isResizing.value = true;
	startX.value = e.clientX;
	startY.value = e.clientY;
	startWidth.value = currentW.value;
	startHeight.value = currentH.value;
	resizeOffset.value = { dw: 0, dh: 0 };
	publishDragging();
	document.addEventListener('mousemove', onMouseMove);
	document.addEventListener('mouseup', onMouseUp);
}

onUnmounted(() => {
	document.removeEventListener('mousemove', onMouseMove);
	document.removeEventListener('mouseup', onMouseUp);
});
</script>
