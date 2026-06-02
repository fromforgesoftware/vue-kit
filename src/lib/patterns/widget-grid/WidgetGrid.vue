<template>
	<div
		ref="gridRef"
		:class="classes"
		:style="gridContainerStyle"
		role="region"
		aria-label="Dashboard widgets"
		data-slot="widget-grid"
	>
		<!-- Background overlay: 'grid' | 'dots' | 'rows' | 'columns' presets.
         'none' renders nothing — Grafana-style clean canvas. CSS background
         images are sized to one cell of the snap grid, so the pattern aligns
         with where panels actually land. -->
		<div
			v-if="background !== 'none'"
			class="absolute inset-0 pointer-events-none z-0"
			:style="backgroundStyle"
			aria-hidden="true"
			data-slot="widget-grid-background"
		/>

		<!-- Drag-target placeholder. Rendered only when `showPlaceholder` is on
         and an item is currently being dragged or resized. -->
		<div
			v-if="showPlaceholder && layoutConfig.dragging"
			:class="cn(widgetGridPlaceholderVariants())"
			:style="placeholderStyle"
			aria-hidden="true"
			data-slot="widget-grid-placeholder"
		/>

		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed, provide, reactive, watch, ref, onMounted, onUnmounted } from 'vue';
import { cn } from '../../../helpers/cn.js';
import {
	widgetGridVariants,
	widgetGridPlaceholderVariants,
	type GridItemPosition,
	type WidgetGridBackground,
} from './widget-grid.js';

interface Props {
	cols?: number;
	snapColumns?: number;
	margin?: number;
	draggable?: boolean;
	resizable?: boolean;
	totalRows?: number;
	minRowHeight?: number;
	minWidth?: string;
	items?: GridItemPosition[];
	background?: WidgetGridBackground;
	showPlaceholder?: boolean;
	disableDragScale?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	cols: 24,
	snapColumns: 4,
	margin: 0.5,
	draggable: false,
	resizable: false,
	totalRows: 20,
	minRowHeight: 1,
	minWidth: '1200px',
	items: () => [],
	background: 'none',
	showPlaceholder: false,
	disableDragScale: false,
});

const gridRef = ref<HTMLElement | null>(null);
const containerHeight = ref(0);
const dynamicRowHeight = ref(props.minRowHeight);
const dynamicTotalRows = ref(props.totalRows);
const gridItems = ref(props.items);

function updateDynamicRowHeight() {
	if (containerHeight.value > 0) {
		dynamicRowHeight.value = props.minRowHeight;
		// /16 assumes 1rem = 16px (Tailwind default); vue-grid-layout needs row units, not px.
		const availableHeight = containerHeight.value / 16;
		const rowsThatFit = Math.ceil(availableHeight / props.minRowHeight);
		dynamicTotalRows.value = Math.max(props.totalRows, rowsThatFit * 2);
	} else {
		dynamicRowHeight.value = props.minRowHeight;
		dynamicTotalRows.value = props.totalRows;
	}
}

const layoutConfig = reactive({
	cols: props.cols,
	snapColumns: props.snapColumns,
	rows: dynamicTotalRows,
	rowHeight: dynamicRowHeight,
	margin: props.margin,
	draggable: props.draggable,
	resizable: props.resizable,
	items: gridItems,
	// Updated by WidgetGridItem during pointer interactions; consumed by the
	// placeholder overlay below. Reset to null on drag/resize end.
	dragging: null as GridItemPosition | null,
	showPlaceholder: props.showPlaceholder,
	disableDragScale: props.disableDragScale,
});

watch(
	() => props.items,
	(newItems) => {
		gridItems.value = newItems;
	},
	{ deep: true, immediate: true },
);

watch(
	() => props.draggable,
	(v) => {
		layoutConfig.draggable = v;
	},
);

watch(
	() => props.resizable,
	(v) => {
		layoutConfig.resizable = v;
	},
);

watch(
	() => props.showPlaceholder,
	(v) => {
		layoutConfig.showPlaceholder = v;
	},
);

watch(
	() => props.disableDragScale,
	(v) => {
		layoutConfig.disableDragScale = v;
	},
);

watch(containerHeight, () => {
	updateDynamicRowHeight();
});

function updateContainerHeight() {
	if (gridRef.value) {
		const rect = gridRef.value.getBoundingClientRect();
		const viewportHeight = window.innerHeight;
		const availableHeight = viewportHeight - rect.top;
		containerHeight.value = Math.max(availableHeight, 400);
	}
}

onMounted(() => {
	updateContainerHeight();
	updateDynamicRowHeight();
	window.addEventListener('resize', updateContainerHeight);
});

onUnmounted(() => {
	window.removeEventListener('resize', updateContainerHeight);
});

provide('layoutConfig', layoutConfig);

// In edit mode (draggable/resizable) or whenever a background preset is on,
// expand the container to the full `totalRows` so the drag surface and the
// background overlay reach every reachable row — not just the area covered
// by the current panels. View mode without a background keeps the compact
// height (just enough to fit the panels), so it doesn't push following
// content down with empty space.
const expandToFullGrid = computed(
	() => props.draggable || props.resizable || props.background !== 'none',
);

const actualGridHeight = computed(() => {
	const items = gridItems.value ?? [];
	const maxItemBottom = items.length ? Math.max(...items.map((item) => item.y + item.h), 0) : 0;
	const rows = expandToFullGrid.value
		? Math.max(maxItemBottom, dynamicTotalRows.value)
		: maxItemBottom;
	if (rows === 0) return '10rem';
	return `${rows * dynamicRowHeight.value}rem`;
});

const gridContainerStyle = computed(() => ({
	height: actualGridHeight.value,
}));

const classes = computed(() => cn(widgetGridVariants(), props.class));

// Backgrounds render via CSS `background-image` rather than per-line divs —
// this gives a true graph-paper fill (pattern repeats across every cell) and
// stays cheap regardless of grid size. Pattern colour follows
// `--color-primary` via `oklch(from …)` opacity adjustment, the same trick
// `Skeleton` uses.
const backgroundStyle = computed(() => {
	const bg = props.background;
	if (bg === 'none') return undefined;

	const colPct = 100 / props.cols;
	const snapPct = 100 / props.snapColumns;
	const rowSize = `${dynamicRowHeight.value}rem`;
	const fine = 'oklch(from var(--color-primary) l c h / 0.10)';
	const accent = 'oklch(from var(--color-primary) l c h / 0.24)';
	const dot = 'oklch(from var(--color-primary) l c h / 0.45)';

	if (bg === 'dots') {
		// React-Flow-style fine dot grid: one 1.5 px dot per (column × row)
		// cell. Higher alpha than the line patterns so dots actually read on
		// typical card backgrounds.
		return {
			backgroundImage: `radial-gradient(circle, ${dot} 1.5px, transparent 1.5px)`,
			backgroundSize: `${colPct}% ${rowSize}`,
			backgroundPosition: '0 0',
		} as Record<string, string>;
	}

	// 'grid' — fine cell lines (every column × every row) overlaid with
	// accent crosshatching at every snap step. Four layered gradients,
	// ordered top→bottom of the stack for clean cross intersections.
	return {
		backgroundImage: [
			`linear-gradient(to right, ${accent} 1px, transparent 1px)`,
			`linear-gradient(to bottom, ${accent} 1px, transparent 1px)`,
			`linear-gradient(to right, ${fine} 1px, transparent 1px)`,
			`linear-gradient(to bottom, ${fine} 1px, transparent 1px)`,
		].join(', '),
		backgroundSize: [
			`${snapPct}% 100%`,
			`100% calc(${rowSize} * ${props.snapColumns})`,
			`${colPct}% 100%`,
			`100% ${rowSize}`,
		].join(', '),
	} as Record<string, string>;
});

// Position the drop-target ghost at the dragged item's current snap target.
// Mirrors WidgetGridItem's `itemStyle` so the placeholder lines up exactly
// with where the item will land on release.
const placeholderStyle = computed(() => {
	const d = layoutConfig.dragging;
	if (!d) return undefined;
	return {
		left: `${d.x * (100 / props.cols)}%`,
		top: `${d.y * dynamicRowHeight.value}rem`,
		width: `${d.w * (100 / props.cols)}%`,
		height: `${d.h * dynamicRowHeight.value}rem`,
	} as Record<string, string>;
});
</script>
