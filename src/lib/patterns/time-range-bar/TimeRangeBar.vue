<template>
	<div ref="wrapperRef" data-slot="time-range-bar" :class="barWrapperClass">
		<!-- Bar + tooltips column (or row in vertical mode for ruler-on-the-side) -->
		<div :class="isVertical ? 'inline-flex flex-row-reverse items-stretch gap-1' : 'flex flex-col'">
			<!--
        The HoverCard wrapper is rendered for `bar` and `card` densities. The
        `pill` density skips it entirely — pill cells are too small for a
        meaningful popover and chrome-less hosts shouldn't pay for one they
        never use.

        When the consumer provides a `bar-hover` slot it wins (full content
        override). Otherwise the built-in default popover (time range +
        duration, segment list, legend pills, mini bar preview, plus the
        optional `bar-hover-actions` slot) renders automatically.
      -->
			<HoverCard :open-delay="500" :close-delay="200">
				<HoverCardTrigger as-child>
					<div
						class="relative"
						data-slot="time-range-bar-shell"
						:class="isVertical ? '' : 'w-full'"
					>
						<component :is="BarMarkup" />
						<!-- Gap edge markers — siblings of the masked bar so they stay visible at each cut boundary. -->
						<template v-if="!isPill && !isCard">
							<div
								v-for="edge in barGapEdges"
								:key="edge.id"
								data-slot="time-range-bar-gap-edge"
								:class="
									isVertical
										? 'absolute left-0 right-0 h-[1.5px] pointer-events-none z-[6]'
										: 'absolute top-0 bottom-0 w-[1.5px] pointer-events-none z-[6]'
								"
								:style="
									isVertical
										? { top: `${edge.offsetPct}%`, backgroundColor: gapEdgeColor }
										: { left: `${edge.offsetPct}%`, backgroundColor: gapEdgeColor }
								"
							/>
						</template>
					</div>
				</HoverCardTrigger>
				<HoverCardContent
					v-if="
						showHoverPopup &&
						!isDragging &&
						!isBarDragging &&
						!activeSegmentIdEffective &&
						barClickOffsetPct == null
					"
					side="bottom"
					:side-offset="4"
					class="w-72 p-0"
				>
					<slot
						v-if="$slots['bar-hover']"
						name="bar-hover"
						:start-time-sec="effectiveStartTimeSec"
						:duration-sec="effectiveDurationSec"
						:segments="segments"
						:format-time="ForgeTime.formatTimeOfDay"
					/>
					<div v-else data-slot="time-range-bar-default-hover" class="divide-y divide-border">
						<!-- Time range + duration -->
						<div class="px-3 py-2.5 flex items-center gap-2 text-xs text-muted-foreground">
							<span class="tabular-nums">
								{{ ForgeTime.formatTimeOfDay(effectiveStartTimeSec) }} –
								{{ ForgeTime.formatTimeOfDay(effectiveStartTimeSec + effectiveDurationSec) }}
							</span>
							<span class="font-medium text-foreground">
								{{ formatDuration(effectiveDurationSec) }}
							</span>
						</div>
						<!-- Children rows: icon + label + time range. Regular segments
                 first, then a sub-section for gaps. -->
						<div
							v-if="visibleSegments.length > 0 || visibleGaps.length > 0"
							class="px-3 py-2.5 space-y-1.5"
							data-slot="time-range-bar-default-hover-list"
						>
							<div
								v-for="seg in visibleSegments"
								:key="seg.id"
								class="flex items-center text-xs text-muted-foreground"
								data-slot="time-range-bar-default-hover-row"
							>
								<component :is="seg.icon" v-if="seg.icon" class="size-3 mr-1.5 opacity-70" />
								<span class="min-w-0 truncate">{{ seg.label }}</span>
								<span class="ml-auto flex-shrink-0 tabular-nums">
									{{ ForgeTime.formatTimeOfDay(effectiveStartTimeSec + seg.offsetSec) }} –
									{{
										ForgeTime.formatTimeOfDay(
											effectiveStartTimeSec + seg.offsetSec + seg.durationSec,
										)
									}}
								</span>
							</div>
							<!-- Gaps sub-section: muted, italic, dashed glyph to differentiate
                   from regular segments. Mirrors the schedule-timeline pattern. -->
							<div
								v-if="visibleGaps.length > 0"
								class="border-t border-border pt-1.5 space-y-1"
								data-slot="time-range-bar-default-hover-gaps"
							>
								<div
									v-for="gap in visibleGaps"
									:key="gap.id"
									class="flex items-center text-xs italic text-muted-foreground/80"
									data-slot="time-range-bar-default-hover-gap-row"
								>
									<span class="mr-1.5 opacity-60" aria-hidden="true">⌁</span>
									<span class="min-w-0 truncate">{{ gap.label || 'Gap' }}</span>
									<span class="ml-auto flex-shrink-0 tabular-nums">
										{{ ForgeTime.formatTimeOfDay(effectiveStartTimeSec + gap.offsetSec) }} –
										{{
											ForgeTime.formatTimeOfDay(
												effectiveStartTimeSec + gap.offsetSec + gap.durationSec,
											)
										}}
									</span>
								</div>
							</div>
						</div>
						<!-- Legend pills + mini bar preview share a section so the strip
                 sits flush under the pills with one outer divider above and
                 one below. Gaps are skipped from the pill row. -->
						<div v-if="visibleSegments.length > 0" class="px-3 py-2.5 space-y-2">
							<div class="flex flex-wrap gap-1.5" data-slot="time-range-bar-default-hover-tags">
								<span
									v-for="seg in visibleSegments"
									:key="seg.id"
									:class="[
										'text-[10px] font-medium rounded-full px-2 py-0.5',
										segmentVariantClasses[seg.variant].bg,
										segmentVariantClasses[seg.variant].text,
									]"
								>
									{{ seg.label }}
								</span>
							</div>
							<div
								class="relative h-3 rounded-sm overflow-hidden"
								:class="segmentVariantClasses[variant].bg"
								data-slot="time-range-bar-default-hover-strip"
							>
								<!-- Inner masked layer: track + segment fills. Gap regions get
                     cut here so the preview reflects the bar's visual cuts. -->
								<div
									class="absolute inset-0"
									:style="gapMaskStyle(segments, effectiveDurationSec || 1, false) ?? undefined"
								>
									<div
										v-for="seg in visibleSegments"
										:key="seg.id"
										class="absolute top-0 h-full rounded-sm"
										:class="segmentVariantClasses[seg.variant].bg"
										:style="{
											left: `${(seg.offsetSec / (effectiveDurationSec || 1)) * 100}%`,
											width: `${(seg.durationSec / (effectiveDurationSec || 1)) * 100}%`,
											filter: 'brightness(0.85)',
										}"
										data-slot="time-range-bar-default-hover-strip-segment"
									/>
								</div>
								<!-- Edge markers — siblings of the masked layer so they
                     stay visible on top at every cut boundary. -->
								<div
									v-for="edge in gapEdges(segments, effectiveDurationSec || 1)"
									:key="edge.id"
									data-slot="time-range-bar-default-hover-strip-gap-edge"
									class="absolute top-0 bottom-0 w-[1.5px] pointer-events-none z-[6]"
									:style="{ left: `${edge.offsetPct}%`, backgroundColor: gapEdgeColor }"
								/>
							</div>
						</div>
						<!-- Optional actions slot — consumers fill with buttons / extra controls -->
						<div
							v-if="$slots['bar-hover-actions']"
							class="px-3 py-2.5"
							data-slot="time-range-bar-default-hover-actions"
						>
							<slot
								name="bar-hover-actions"
								:start-time-sec="effectiveStartTimeSec"
								:duration-sec="effectiveDurationSec"
								:segments="segments"
							/>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>

			<!-- Time ruler — runs along the bar's time axis -->
			<div
				v-if="effectiveShowRuler"
				:class="isVertical ? 'relative w-8 h-full' : 'relative h-4 mt-0.5'"
			>
				<div
					v-for="tick in hourTicks"
					:key="tick.label"
					data-slot="time-range-bar-ruler-tick"
					:class="
						isVertical
							? 'absolute right-0 flex flex-row-reverse items-center gap-1 -translate-y-1/2'
							: 'absolute top-0 flex flex-col items-center -translate-x-1/2'
					"
					:style="isVertical ? { top: `${tick.percent}%` } : { left: `${tick.percent}%` }"
				>
					<div
						:class="
							isVertical ? 'w-1.5 h-px bg-muted-foreground/40' : 'w-px h-1.5 bg-muted-foreground/40'
						"
					/>
					<span
						:class="
							isCompactSize
								? 'text-[8px] text-muted-foreground leading-none'
								: 'text-[9px] text-muted-foreground leading-none'
						"
						>{{ tick.label }}</span
					>
				</div>
			</div>
		</div>

		<!-- Segment toolbar slot — positioned below the active segment -->
		<div
			v-if="
				!readonly &&
				!isCard &&
				!isPill &&
				$slots.toolbar &&
				activeSegmentIdEffective &&
				activeSegmentStyle
			"
			class="mt-1.5"
			:class="isCompact ? 'flex justify-center' : 'relative'"
		>
			<div
				:key="activeSegmentIdEffective ?? ''"
				:class="isCompact ? '' : 'absolute'"
				:style="isCompact ? undefined : activeSegmentStyle"
			>
				<slot name="toolbar" :segment="segments.find((s) => s.id === activeSegmentIdEffective)!" />
			</div>
		</div>

		<!-- Bar toolbar slot — positioned at the click point on the bar -->
		<div
			v-if="
				!readonly &&
				!isCard &&
				!isPill &&
				$slots['bar-toolbar'] &&
				barClickOffsetPct != null &&
				!activeSegmentIdEffective
			"
			class="mt-1.5"
			:class="isCompact ? 'flex justify-center' : 'relative'"
		>
			<div
				:class="isCompact ? '' : 'absolute'"
				:style="
					isCompact ? undefined : { left: `${barClickOffsetPct}%`, transform: 'translateX(-50%)' }
				"
			>
				<slot name="bar-toolbar" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
/**
 * Time-bar visualisation with draggable / resizable child segments. Used for
 * shifts, schedules, and any "horizontal time block" UI. Drag has a keyboard
 * alternative (Arrow ± snap, Shift+Arrow for 5×) per WCAG SC 2.5.7.
 *
 * Chrome (time labels, hour ruler, hover-card popover, inline toolbars,
 * bar-resize handles) is opt-in. Pass the relevant props / slots to enable
 * each one. When all chrome is disabled, the component renders as a minimal
 * primitive suitable for "one bar per grid cell" layouts where the host owns
 * the time axis.
 *
 * @example
 * ```vue
 * <TimeRangeBar
 *   :duration-sec="28800"
 *   :start-time-sec="32400"
 *   :segments="segments"
 *   editable
 *   @segment-update="onUpdate"
 * />
 * ```
 */
import { ref, computed, toRef, onMounted, onUnmounted, watch, h, useSlots } from 'vue';
import {
	type Segment,
	type SegmentVariant,
	type SegmentUpdateEvent,
	type SegmentClickEvent,
	type RangeClickEvent,
	type RangeResizeEvent,
	segmentVariantClasses,
	generateHourTicks,
	computeSegmentLanes,
	nonGapSegments,
	gapSegments,
	gapMaskStyle,
	gapEdges,
} from './time-range-bar';
import { ForgeTime } from '@fromforgesoftware/ts-kit';
import { useSegmentDrag } from './useSegmentDrag';
import { cn } from '../../../helpers/cn';
import HoverCard from '../../general/hover-card/HoverCard.vue';
import HoverCardTrigger from '../../general/hover-card/HoverCardTrigger.vue';
import HoverCardContent from '../../general/hover-card/HoverCardContent.vue';

const props = withDefaults(
	defineProps<{
		/** Total bar duration in seconds */
		durationSec: number;
		/** Absolute start time in seconds for label formatting (e.g. 32400 for 09:00) */
		startTimeSec?: number;
		/** Child segments to render */
		segments?: Segment[];
		/** Snap grid in seconds */
		snapSec?: number;
		/** Minimum segment size in seconds */
		minSegmentSec?: number;
		/** Minimum bar duration in seconds (for bar resize) */
		minDurationSec?: number;
		/** Read-only compact mode */
		readonly?: boolean;
		/** Enable drag/resize interactions (ignored when readonly) */
		editable?: boolean;
		/** Allow resizing the bar itself from left/right edges */
		resizable?: boolean;
		/**
		 * Show the built-in hover popup on bar / card densities. Default
		 * `true` to preserve the existing shift-editor behaviour. Pass `false`
		 * to suppress the popup when the host has its own UI (e.g. an
		 * external toolbar that already shows the same data, like the
		 * schedule-timeline edit page).
		 */
		showHoverPopup?: boolean;
		/** Show time labels on bar edges */
		showLabels?: boolean;
		/** Bar background color variant */
		variant?: SegmentVariant;
		/**
		 * Currently selected segment id.
		 *
		 * Leave undefined to let the component track selection internally —
		 * clicking a segment selects it, clicking the bar deselects.
		 * Pass any value (including `null`) to take ownership: the parent owns
		 * the state and the component reflects whatever you pass.
		 */
		activeSegmentId?: string | null;
		/**
		 * Whether the bar itself is selected.
		 *
		 * Leave undefined to let the component track selection internally —
		 * clicking the bar surface selects it, clicking a segment deselects it.
		 * Pass any boolean to take ownership.
		 */
		selected?: boolean;
		/** Show hour ruler below bar */
		showRuler?: boolean;
		/** Whether the bar toolbar is actively open (controls bar selection outline) */
		toolbarActive?: boolean;
		/** Stack overlapping segments into separate lanes instead of rendering them on top of each other */
		stackOverlaps?: boolean;
		/**
		 * Bar orientation. `'horizontal'` lays time on the x-axis (the default
		 * shape, used by shift editors and day-view timelines). `'vertical'`
		 * flips the time axis to top→bottom — segments are positioned with
		 * top/height, drag math uses clientY, and ruler / labels run alongside
		 * the bar. Use `verticalHeightPx` to control the bar's vertical extent
		 * (default 320px).
		 */
		orientation?: 'horizontal' | 'vertical';
		/**
		 * Pixel height of the bar when `orientation="vertical"`. The horizontal
		 * analogue of `w-full` doesn't apply to vertical layout, so callers pin
		 * a concrete pixel height here. Defaults to 320.
		 */
		verticalHeightPx?: number;
		/**
		 * Visual shape preset.
		 *
		 * - `'bar'` (default): standard rendering — segments + ruler/labels/resize as opt-in.
		 * - `'card'`: card container that fills its parent width, fixed height. The
		 *   default `card-content` slot drives the text content (title, time
		 *   range, etc.). When `segments.length > 0`, a thin segment strip renders
		 *   at the bottom showing each segment as a colored block at its
		 *   proportional position. Read-only and selectable; ruler / labels /
		 *   resize / toolbars are ignored.
		 * - `'pill'`: NO time axis. Renders as a single rounded chip in `variant`
		 *   color, fixed pixel size, suitable for week/month grid cells. Segments
		 *   prop is ignored; ruler / labels / resize are forced off.
		 */
		density?: 'bar' | 'card' | 'pill';
		/**
		 * Scale within `density="bar"`. Defaults to `'default'`. `'compact'` halves
		 * the bar height (~20px), hides segment text, and shrinks ruler ticks.
		 * Ignored when `density` is `'card'` or `'pill'` (those are fixed-shape).
		 */
		size?: 'default' | 'compact';
		/**
		 * Pixel height of the card when `density="card"`. Defaults to 52.
		 */
		cardHeightPx?: number;
		/**
		 * Optional fixed cross-axis size (height for horizontal bars, width for
		 * vertical). When set, overrides the default lane-based growth so the
		 * bar stays this size even with `stackOverlaps` and multiple lanes —
		 * lanes still split the cross-axis but as percentages of this pinned
		 * value. Used by hosts that own the surrounding box height (e.g. the
		 * 40 px day-view shift card) and just want overlapping segments to
		 * visually stack inside that fixed box.
		 */
		barHeightPx?: number;
		/**
		 * Overlap rule between segments.
		 *
		 * - `'allow'` (default): every pair can overlap freely.
		 * - `'block'`: no pair can overlap, except segments with
		 *   `canOverlap: true` set on the segment itself.
		 * - `function`: custom predicate, return `true` to allow the overlap.
		 *
		 * Use `'block'` plus `Segment.canOverlap` to express the common
		 * "everything is blocking, except this one floating segment is free"
		 * rule without writing a predicate.
		 */
		overlap?: 'allow' | 'block' | ((dragged: Segment, other: Segment) => boolean);
	}>(),
	{
		startTimeSec: 0,
		segments: () => [],
		snapSec: 300,
		minSegmentSec: 300,
		minDurationSec: 1800,
		readonly: false,
		editable: true,
		resizable: false,
		showHoverPopup: true,
		showLabels: true,
		variant: 'blue',
		activeSegmentId: undefined,
		selected: undefined,
		showRuler: false,
		toolbarActive: undefined,
		stackOverlaps: false,
		orientation: 'horizontal',
		verticalHeightPx: 320,
		density: 'bar',
		size: 'default',
		cardHeightPx: 44,
		overlap: 'allow',
	},
);

const emit = defineEmits<{
	'segment-click': [event: SegmentClickEvent];
	'segment-update': [event: SegmentUpdateEvent];
	click: [event: RangeClickEvent];
	resize: [event: RangeResizeEvent];
	/**
	 * Live in-flight resize. Fires on every pointer-move tick while the bar
	 * is being dragged from one of its edges, before the commit `resize`
	 * event. Use this to show a live tooltip or to mirror the preview into
	 * a sibling toolbar.
	 */
	'resize-preview': [event: RangeResizeEvent | null];
	'segment-select': [id: string | null];
	'segment-hover': [segment: Segment | null];
	'bar-select': [selected: boolean];
	/**
	 * Live in-flight segment drag. Fires every pointer-move tick while a
	 * segment is being moved or resized inside the bar. Carries the
	 * preview's `offsetSec` / `durationSec`. Fires once more with `null`
	 * when the drag ends so consumers can clear any preview state.
	 */
	'segment-preview': [event: SegmentUpdateEvent | null];
}>();

const slots = useSlots();
const containerRef = ref<HTMLElement | null>(null);
const wrapperRef = ref<HTMLElement | null>(null);

/**
 * Internal-fallback selection state used when the host doesn't pass
 * `activeSegmentId`. When the prop is provided, the parent owns the value
 * and this internal ref is ignored. `activeSegmentIdEffective` is what the
 * rest of the component reads / writes.
 */
const internalActiveSegmentId = ref<string | null>(null);
const hasExternalActiveSegmentId = computed(() => props.activeSegmentId !== undefined);
const activeSegmentIdEffective = computed(() =>
	hasExternalActiveSegmentId.value ? props.activeSegmentId : internalActiveSegmentId.value,
);
function setActiveSegmentId(id: string | null) {
	if (!hasExternalActiveSegmentId.value) internalActiveSegmentId.value = id;
}

const internalBarSelected = ref(false);
const hasExternalSelected = computed(() => props.selected !== undefined);
const barSelectedEffective = computed(() =>
	hasExternalSelected.value ? props.selected : internalBarSelected.value,
);
function setBarSelected(value: boolean) {
	if (!hasExternalSelected.value) internalBarSelected.value = value;
}

// Track segment widths so labels can be hidden when the segment gets too narrow.

const segmentWidths = ref<Map<string, number>>(new Map());
let resizeObserver: ResizeObserver | null = null;

// Below 60px the segment label truncates to ellipsis only — drop it instead.
const MIN_LABEL_WIDTH_PX = 60;

function shouldShowLabel(segmentId: string): boolean {
	return (segmentWidths.value.get(segmentId) ?? 0) >= MIN_LABEL_WIDTH_PX;
}

function observeSegments() {
	if (!containerRef.value) return;
	resizeObserver?.disconnect();
	resizeObserver = new ResizeObserver((entries) => {
		for (const entry of entries) {
			const id = (entry.target as HTMLElement).dataset.segmentId;
			if (id) {
				segmentWidths.value.set(id, entry.contentRect.width);
			}
		}
	});
	const els = containerRef.value.querySelectorAll('[data-segment-id]');
	els.forEach((el) => resizeObserver!.observe(el));
}

function onDocumentPointerDown(e: PointerEvent) {
	if (!wrapperRef.value) return;
	const target = e.target as HTMLElement | null;
	if (!target) return;
	if (wrapperRef.value.contains(target)) return;
	// Skip portaled UI surfaces (Reka UI / Radix DropdownMenu, Popover,
	// HoverCard, Dialog, etc. render their content outside the wrapper).
	// Without this guard, picking an item inside a #toolbar dropdown would
	// dismiss the very selection that opened it.
	if (
		target.closest(
			'[role="menu"],[role="menuitem"],[role="dialog"],[role="listbox"],[data-reka-popper-content-wrapper],[data-radix-popper-content-wrapper]',
		)
	) {
		return;
	}
	if (activeSegmentIdEffective.value !== null) {
		setActiveSegmentId(null);
		emit('segment-select', null);
	}
	if (barSelectedEffective.value) {
		setBarSelected(false);
		emit('bar-select', false);
	}
	barClickOffsetPct.value = null;
}

onMounted(() => {
	// rAF: ResizeObserver needs the segment DOM laid out before it can measure widths.
	requestAnimationFrame(observeSegments);
	observeContainerWidth();
	document.addEventListener('pointerdown', onDocumentPointerDown);
});

onUnmounted(() => {
	resizeObserver?.disconnect();
	containerResizeObserver?.disconnect();
	document.removeEventListener('pointerdown', onDocumentPointerDown);
});

watch(
	() => props.segments.length,
	() => {
		requestAnimationFrame(observeSegments);
	},
);

// Card density has no time-axis to flip — its body is text + a horizontal
// strip — so vertical orientation is meaningless there. Force horizontal
// layout when `density === 'card'` regardless of the `orientation` prop.
const isVertical = computed(() => props.orientation === 'vertical' && props.density !== 'card');
const isPill = computed(() => props.density === 'pill');
const isCard = computed(() => props.density === 'card');
// `size: 'compact'` only applies in bar density. Card / pill ignore size.
const isCompactSize = computed(() => props.density === 'bar' && props.size === 'compact');
// Card and pill share read-only / non-resizable / no chrome behaviour.
const isReadonlyDensity = computed(() => isPill.value || isCard.value);

const isEditable = computed(() => !props.readonly && props.editable && !isReadonlyDensity.value);
// Pill / card modes have no time axis, so bar-resize edges are meaningless there too.
const isBarResizable = computed(
	() => isEditable.value && props.resizable && !isReadonlyDensity.value,
);
// Resizing the bar is meaningless without a time anchor, so the ruler is
// forced on whenever the user can drag the bar edges. Pill / card modes have no axis.
const effectiveShowRuler = computed(
	() => !isReadonlyDensity.value && (props.showRuler || isBarResizable.value),
);
const effectiveShowLabels = computed(() => !isReadonlyDensity.value && props.showLabels);

/** Stays true briefly after any drag ends to suppress the click event that follows pointerup */
const justFinishedDrag = ref(false);

function markDragFinished() {
	justFinishedDrag.value = true;
	// rAF: click fires after pointerup; clear the flag only after the click
	// handler has had a chance to read it.
	requestAnimationFrame(() => {
		justFinishedDrag.value = false;
	});
}

// Track previous preview so we can detect transitions and only emit on
// value change (avoids spamming consumers on every pointer-move when the
// snapped values didn't actually move). `null` represents "no preview".
let lastSegmentPreviewKey: string | null = null;
function emitSegmentPreview(
	p: { segmentId: string; offsetSec: number; durationSec: number } | null,
) {
	const key = p ? `${p.segmentId}:${p.offsetSec}:${p.durationSec}` : null;
	if (key === lastSegmentPreviewKey) return;
	lastSegmentPreviewKey = key;
	emit('segment-preview', p);
}

const { startMove, startResize, isDragging, dragPreview, getEffectivePosition } = useSegmentDrag({
	containerRef,
	durationSec: toRef(() => props.durationSec),
	// Gap segments are purely visual cuts — they don't drag, don't block
	// overlap, and don't participate in any drag math. Filter them out before
	// handing the list to the composable so its internals stay untouched.
	segments: toRef(() => nonGapSegments(props.segments)),
	snapSec: toRef(() => props.snapSec),
	minSegmentSec: toRef(() => props.minSegmentSec),
	overlap: toRef(() => props.overlap),
	orientation: toRef(() => props.orientation),
	onUpdate: (event) => {
		markDragFinished();
		emit('segment-update', event);
	},
	onEnd: () => {
		markDragFinished();
		emitSegmentPreview(null);
	},
});

// Forward in-flight segment drag previews to consumers so they can show
// a live tooltip and mirror the preview into sibling toolbars. The
// composable only fires `onUpdate` on commit — `dragPreview` is the
// per-tick value, so we watch it here.
watch(
	dragPreview,
	(p) => {
		if (!p) {
			emitSegmentPreview(null);
			return;
		}
		emitSegmentPreview({
			segmentId: p.segmentId,
			offsetSec: p.offsetSec,
			durationSec: p.durationSec,
		});
	},
	{ deep: true },
);

// Bar resize: left/right edges change startTimeSec / durationSec respectively.

interface BarDragState {
	/** 'left'/'right' for horizontal, 'top'/'bottom' for vertical (mapped onto same start/end semantics) */
	edge: 'start' | 'end';
	startCoord: number;
	wrapperSizePx: number;
	/** Full 24h range in seconds — the px-to-sec ratio reference */
	fullRangeSec: number;
	originalStartTimeSec: number;
	originalDurationSec: number;
}

const barDragState = ref<BarDragState | null>(null);
const barDragPreview = ref<{ startTimeSec: number; durationSec: number } | null>(null);
const isBarDragging = ref(false);

const effectiveStartTimeSec = computed(
	() => barDragPreview.value?.startTimeSec ?? props.startTimeSec,
);
const effectiveDurationSec = computed(() => barDragPreview.value?.durationSec ?? props.durationSec);

const barDragTimeLabel = computed(() => {
	if (!barDragPreview.value) return null;
	const start = barDragPreview.value.startTimeSec;
	const end = start + barDragPreview.value.durationSec;
	return `${ForgeTime.formatTimeOfDay(start)} – ${ForgeTime.formatTimeOfDay(end)}`;
});

function onBarResizePointerDown(e: PointerEvent, edge: 'start' | 'end') {
	if (!isBarResizable.value) return;
	e.preventDefault();
	e.stopPropagation();

	const rect = containerRef.value?.getBoundingClientRect();
	const sizePx = (isVertical.value ? rect?.height : rect?.width) ?? 1;

	barDragState.value = {
		edge,
		startCoord: isVertical.value ? e.clientY : e.clientX,
		wrapperSizePx: sizePx,
		fullRangeSec: props.durationSec,
		originalStartTimeSec: props.startTimeSec,
		originalDurationSec: props.durationSec,
	};

	document.addEventListener('pointermove', onBarResizeMove);
	document.addEventListener('pointerup', onBarResizeUp);
}

function onBarResizeMove(e: PointerEvent) {
	const state = barDragState.value;
	if (!state) return;
	isBarDragging.value = true;

	const snap = props.snapSec;
	const coord = isVertical.value ? e.clientY : e.clientX;
	const dCoord = coord - state.startCoord;
	const deltaSec = Math.round(((dCoord / state.wrapperSizePx) * state.fullRangeSec) / snap) * snap;

	let newStart = state.originalStartTimeSec;
	let newDuration = state.originalDurationSec;

	if (state.edge === 'start') {
		newStart = state.originalStartTimeSec + deltaSec;
		newStart = Math.max(
			0,
			Math.min(
				newStart,
				state.originalStartTimeSec + state.originalDurationSec - props.minDurationSec,
			),
		);
		newDuration = state.originalDurationSec - (newStart - state.originalStartTimeSec);
	} else {
		newDuration = state.originalDurationSec + deltaSec;
		newDuration = Math.max(props.minDurationSec, newDuration);
		newDuration = Math.min(newDuration, 86400 - state.originalStartTimeSec);
	}

	barDragPreview.value = { startTimeSec: newStart, durationSec: newDuration };
	emit('resize-preview', { startTimeSec: newStart, durationSec: newDuration });
}

function onBarResizeUp() {
	document.removeEventListener('pointermove', onBarResizeMove);
	document.removeEventListener('pointerup', onBarResizeUp);

	const state = barDragState.value;
	const preview = barDragPreview.value;

	barDragState.value = null;
	barDragPreview.value = null;
	isBarDragging.value = false;
	markDragFinished();
	emit('resize-preview', null);

	if (!state || !preview) return;
	if (
		preview.startTimeSec === state.originalStartTimeSec &&
		preview.durationSec === state.originalDurationSec
	) {
		return;
	}

	emit('resize', {
		startTimeSec: preview.startTimeSec,
		durationSec: preview.durationSec,
	});
}

// Track container width to switch the ruler into a compact layout when narrow.

const containerWidth = ref(0);
const isCompact = computed(() => containerWidth.value > 0 && containerWidth.value < 500);

let containerResizeObserver: ResizeObserver | null = null;

function observeContainerWidth() {
	containerResizeObserver?.disconnect();
	if (!wrapperRef.value) return;
	containerResizeObserver = new ResizeObserver((entries) => {
		containerWidth.value = entries[0]?.contentRect.width ?? 0;
	});
	containerResizeObserver.observe(wrapperRef.value);
}

// Stacked lanes let overlapping segments render side-by-side instead of clobbering each other.

// Regular (non-gap) segments — gaps are purely visual cuts in the bar's
// track, they don't render as colored blocks and don't participate in
// drag / overlap / lane computation.
const visibleSegments = computed(() => nonGapSegments(props.segments));
const visibleGaps = computed(() => gapSegments(props.segments));

const segmentLanes = computed(() =>
	props.stackOverlaps ? computeSegmentLanes(visibleSegments.value) : new Map<string, number>(),
);
const laneCount = computed(() => {
	if (!props.stackOverlaps) return 1;
	let max = 0;
	for (const lane of segmentLanes.value.values()) {
		if (lane + 1 > max) max = lane + 1;
	}
	return Math.max(max, 1);
});

/**
 * CSS mask gradient that "cuts" the bar at every gap segment's position.
 * Returns `undefined` when there are no gaps so the inline style can be
 * omitted entirely. Mirrors the schedule-timeline DayView's `gapMaskStyle`.
 */
const barGapMaskStyle = computed(() =>
	gapMaskStyle(props.segments, effectiveDurationSec.value, isVertical.value),
);

/**
 * Percentage positions of each gap-edge marker (one at the start and one
 * at the end of every gap), relative to the bar's time axis.
 */
const barGapEdges = computed(() => gapEdges(props.segments, effectiveDurationSec.value));

/**
 * Solid variant color for gap edge markers — resolved from the
 * `--time-range-bar-{variant}` CSS token used by the bar's `bar` class.
 */
const variantTokenName: Record<SegmentVariant, string> = {
	green: '--time-range-bar-green',
	purple: '--time-range-bar-purple',
	blue: '--time-range-bar-blue',
	amber: '--time-range-bar-amber',
	red: '--time-range-bar-red',
	gray: '--time-range-bar-gray',
};

const gapEdgeColor = computed(() => `oklch(var(${variantTokenName[props.variant]}))`);

const barClasses = computed(() => {
	const v = segmentVariantClasses[props.variant];
	return cn(v.bg, v.border, 'border');
});

// Default hover-card duration formatter — matches ShiftBar's `formatDuration`
// semantics: `28800` -> `"8h"`, `27900` -> `"7h 45m"`, `1800` -> `"30m"`.
function formatDuration(durationSec: number): string {
	const totalMinutes = Math.round(durationSec / 60);
	const hours = Math.floor(totalMinutes / 60);
	const minutes = totalMinutes % 60;
	if (hours === 0) return `${minutes}m`;
	if (minutes === 0) return `${hours}h`;
	return `${hours}h ${minutes}m`;
}

const hourTicks = computed(() => {
	if (!effectiveShowRuler.value) return [];
	return generateHourTicks(
		effectiveStartTimeSec.value,
		effectiveDurationSec.value,
		isCompact.value,
	);
});

const dragTimeLabel = computed(() => {
	const preview = dragPreview.value;
	if (!preview) return null;
	const startSec = effectiveStartTimeSec.value + preview.offsetSec;
	const endSec = startSec + preview.durationSec;
	return `${ForgeTime.formatTimeOfDay(startSec)} – ${ForgeTime.formatTimeOfDay(endSec)}`;
});

const dragTooltipStyle = computed(() => {
	const preview = dragPreview.value;
	if (!preview) return {};
	const centerPct =
		((preview.offsetSec + preview.durationSec / 2) / effectiveDurationSec.value) * 100;
	return isVertical.value ? { top: `${centerPct}%` } : { left: `${centerPct}%` };
});

function segmentStyle(segment: Segment, index: number) {
	const { offsetSec, durationSec } = getEffectivePosition(segment, index);
	const totalDuration = effectiveDurationSec.value;

	// During bar resize from the start edge, adjust segment offsets so they
	// stay anchored to their absolute time position instead of shifting with
	// the bar.
	const startDelta = effectiveStartTimeSec.value - props.startTimeSec;
	const adjustedOffset = offsetSec - startDelta;

	const startPct = (adjustedOffset / totalDuration) * 100;
	const sizePct = (durationSec / totalDuration) * 100;

	const style: Record<string, string> = isVertical.value
		? { top: `${startPct}%`, height: `${sizePct}%` }
		: { left: `${startPct}%`, width: `${sizePct}%` };

	// Lane-based positioning for overlapping segments. The lane axis is
	// perpendicular to the time axis: vertical bar → lanes go side-by-side
	// (left/width), horizontal bar → lanes stack (top/height).
	if (props.stackOverlaps) {
		const lanes = laneCount.value;
		const lane = segmentLanes.value.get(segment.id) ?? 0;
		const laneSizePct = 100 / lanes;
		if (isVertical.value) {
			style.left = `${lane * laneSizePct}%`;
			style.width = `calc(${laneSizePct}% - 2px)`;
			style.marginLeft = '1px';
		} else {
			style.top = `${lane * laneSizePct}%`;
			style.height = `calc(${laneSizePct}% - 2px)`;
			style.marginTop = '1px';
		}
	}

	return style;
}

// 8px hit zone for bar-edge resize: balances touch usability vs accidentally
// resizing when the user meant to grab a segment near the edge.
const BAR_EDGE_PX = 8;

const barEdgeHover = ref<'start' | 'end' | null>(null);

function detectBarEdge(e: MouseEvent): 'start' | 'end' | null {
	if (!isBarResizable.value) return null;
	const rect = containerRef.value?.getBoundingClientRect();
	if (!rect) return null;

	if (isVertical.value) {
		const relY = e.clientY - rect.top;
		if (relY <= BAR_EDGE_PX) return 'start';
		if (relY >= rect.height - BAR_EDGE_PX) return 'end';
		return null;
	}

	const relX = e.clientX - rect.left;
	if (relX <= BAR_EDGE_PX) return 'start';
	if (relX >= rect.width - BAR_EDGE_PX) return 'end';
	return null;
}

function onBarPointerMove(e: PointerEvent) {
	if (isDragging.value || isBarDragging.value) return;
	barEdgeHover.value = detectBarEdge(e);
}

function onBarPointerLeave() {
	barEdgeHover.value = null;
}

function onBarPointerDown(e: PointerEvent) {
	if (props.readonly || !isEditable.value) return;

	// If on edge, start bar resize instead of anything else
	const edge = detectBarEdge(e);
	if (edge && isBarResizable.value) {
		onBarResizePointerDown(e, edge);
		return;
	}
}

function onBarClick(e: MouseEvent) {
	if (props.readonly || isDragging.value || isBarDragging.value || justFinishedDrag.value) return;
	// Pill / card densities bypass the editable check — the surface is a
	// clickable cell even when there's no segment editing flow to drive.
	if (!isPill.value && !isCard.value && !isEditable.value) return;

	const target = e.target as HTMLElement;
	if (target.closest('[data-segment]')) return;

	// Don't emit click if we just finished a bar resize
	const edge = detectBarEdge(e);
	if (edge && isBarResizable.value) return;

	const rect = containerRef.value?.getBoundingClientRect();
	if (!rect) return;

	const relX = e.clientX - rect.left;
	const offsetSec =
		Math.round(((relX / rect.width) * props.durationSec) / props.snapSec) * props.snapSec;

	// Only track the click-to-add preview offset when a `bar-toolbar` slot is
	// provided — otherwise the outline + slot wrapper would render with no
	// content for hosts that just want the bar-click event.
	if (slots['bar-toolbar']) {
		barClickOffsetPct.value = (relX / rect.width) * 100;
	}
	// Bar surface click clears any selected segment and selects the bar itself
	// by default; a host that owns selection via the `selected` prop gets the
	// events and decides for itself.
	if (activeSegmentIdEffective.value !== null) {
		setActiveSegmentId(null);
		emit('segment-select', null);
	}
	if (!barSelectedEffective.value) {
		setBarSelected(true);
		emit('bar-select', true);
	}
	emit('click', { offsetSec, event: e });
}

function onSegmentClick(e: MouseEvent, segment: Segment, index: number) {
	if (props.readonly || isDragging.value) return;
	e.stopPropagation();

	const el = e.currentTarget as HTMLElement;
	const rect = el.getBoundingClientRect();

	barClickOffsetPct.value = null;
	if (barSelectedEffective.value) {
		setBarSelected(false);
		emit('bar-select', false);
	}
	setActiveSegmentId(segment.id);
	emit('segment-select', segment.id);
	emit('segment-click', { segment, index, rect });
}

function onSegmentPointerDown(e: PointerEvent, segment: Segment, index: number) {
	if (!isEditable.value) return;
	startMove(e, segment, index);
}

function onResizePointerDown(
	e: PointerEvent,
	segment: Segment,
	index: number,
	edge: 'left' | 'right',
) {
	if (!isEditable.value) return;
	startResize(e, segment, index, edge);
}

// WCAG SC 2.5.7: keyboard alternative to drag — Arrow ± snap, Shift+Arrow for 5×.
// Plus +/- to grow/shrink, Enter/Space to select, Escape to deselect.

function onSegmentKeyDown(event: KeyboardEvent, segment: Segment, index: number): void {
	if (!isEditable.value) return;
	const mult = event.shiftKey ? 5 : 1;
	const step = props.snapSec * mult;

	// In vertical mode, ArrowDown moves the segment along the time axis (positive
	// offset) and ArrowUp moves backwards. In horizontal mode, ArrowRight/Left
	// perform the equivalent action.
	const forwardKey = isVertical.value ? 'ArrowDown' : 'ArrowRight';
	const backwardKey = isVertical.value ? 'ArrowUp' : 'ArrowLeft';

	if (event.key === forwardKey) {
		event.preventDefault();
		const maxOffset = props.durationSec - segment.durationSec;
		const newOffset = Math.max(0, Math.min(segment.offsetSec + step, maxOffset));
		emit('segment-update', {
			segmentId: segment.id,
			offsetSec: newOffset,
			durationSec: segment.durationSec,
		});
	} else if (event.key === backwardKey) {
		event.preventDefault();
		const maxOffset = props.durationSec - segment.durationSec;
		const newOffset = Math.max(0, Math.min(segment.offsetSec - step, maxOffset));
		emit('segment-update', {
			segmentId: segment.id,
			offsetSec: newOffset,
			durationSec: segment.durationSec,
		});
	} else if (event.key === '+' || event.key === '=') {
		event.preventDefault();
		emit('segment-update', {
			segmentId: segment.id,
			offsetSec: segment.offsetSec,
			durationSec: Math.min(props.durationSec - segment.offsetSec, segment.durationSec + step),
		});
	} else if (event.key === '-' || event.key === '_') {
		event.preventDefault();
		emit('segment-update', {
			segmentId: segment.id,
			offsetSec: segment.offsetSec,
			durationSec: Math.max(props.minSegmentSec, segment.durationSec - step),
		});
	} else if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		const rect = (event.currentTarget as HTMLElement).getBoundingClientRect();
		if (barSelectedEffective.value) {
			setBarSelected(false);
			emit('bar-select', false);
		}
		setActiveSegmentId(segment.id);
		emit('segment-click', { segment, index, rect });
		emit('segment-select', segment.id);
	} else if (event.key === 'Escape') {
		event.preventDefault();
		setActiveSegmentId(null);
		emit('segment-select', null);
		if (barSelectedEffective.value) {
			setBarSelected(false);
			emit('bar-select', false);
		}
	}
}

const hoveredSegment = ref<Segment | null>(null);

function onSegmentHoverEnter(segment: Segment) {
	if (isDragging.value || isBarDragging.value) return;
	hoveredSegment.value = segment;
	emit('segment-hover', segment);
}

function onSegmentHoverLeave() {
	hoveredSegment.value = null;
	emit('segment-hover', null);
}

function hoveredSegmentTimeLabel(segment: Segment, index: number): string {
	const { offsetSec, durationSec } = getEffectivePosition(segment, index);
	const startSec = effectiveStartTimeSec.value + offsetSec;
	const endSec = startSec + durationSec;
	const durationMin = Math.round(durationSec / 60);
	return `${ForgeTime.formatTimeOfDay(startSec)} – ${ForgeTime.formatTimeOfDay(endSec)} (${durationMin}min)`;
}

const barClickOffsetPct = ref<number | null>(null);

// Clear bar selection when parent signals the bar toolbar is no longer active
watch(
	() => props.toolbarActive,
	(active) => {
		if (active === false) {
			barClickOffsetPct.value = null;
		}
	},
);

const activeSegmentStyle = computed(() => {
	if (!activeSegmentIdEffective.value) return null;
	// Index resolved against `visibleSegments` so it matches what the drag
	// composable stored in its preview — gap entries shift the full-list
	// index and would defeat `getEffectivePosition`'s identity check.
	const segment = visibleSegments.value.find((s) => s.id === activeSegmentIdEffective.value);
	if (!segment) return null;
	const idx = visibleSegments.value.indexOf(segment);
	const { offsetSec, durationSec } = getEffectivePosition(segment, idx);
	const totalDuration = effectiveDurationSec.value;
	const start = (offsetSec / totalDuration) * 100;
	const size = (durationSec / totalDuration) * 100;
	const center = start + size / 2;
	// In vertical mode the toolbar still flows below the bar; we keep the
	// horizontal-style anchoring (`left + translateX`) since the toolbar
	// wrapper is rendered as a sibling of the bar (not aligned to its
	// vertical axis). Hosts targetting vertical bars typically build their
	// own toolbar layout — the `activeSegmentStyle` helper is best-effort.
	return { left: `${center}%`, transform: 'translateX(-50%)' };
});

const hoveredTooltipStyle = computed(() => {
	if (!hoveredSegment.value) return {};
	const idx = visibleSegments.value.indexOf(hoveredSegment.value);
	const { offsetSec, durationSec } = getEffectivePosition(hoveredSegment.value, idx);
	const totalDuration = effectiveDurationSec.value;
	const centerPct = ((offsetSec + durationSec / 2) / totalDuration) * 100;
	return isVertical.value ? { top: `${centerPct}%` } : { left: `${centerPct}%` };
});

const barCursorClass = computed(() => {
	if (props.readonly || !isEditable.value) return '';
	if (barEdgeHover.value) return isVertical.value ? 'cursor-ns-resize' : 'cursor-ew-resize';
	return 'cursor-pointer';
});

/**
 * Bar size along the cross-axis (height for horizontal, width for vertical).
 * Defaults to 40px; halved when `size="compact"` (within `density="bar"`).
 * When `stackOverlaps` adds lanes the cross-axis grows by
 * `LANE_HEIGHT_PX * lanes + 8` to make room.
 *
 * Pill density renders a fixed 18×64 chip and ignores all of the above.
 */
const BASE_HEIGHT_PX = 40;
const COMPACT_HEIGHT_PX = 20;
const LANE_HEIGHT_PX = 32;
const PILL_WIDTH_PX = 64;
const PILL_HEIGHT_PX = 18;

const barCrossAxisPx = computed(() => {
	if (props.barHeightPx !== undefined) return props.barHeightPx;
	const lanes = laneCount.value;
	const base = isCompactSize.value ? COMPACT_HEIGHT_PX : BASE_HEIGHT_PX;
	if (!props.stackOverlaps || lanes <= 1) return base;
	return LANE_HEIGHT_PX * lanes + 8;
});

const barSizeStyle = computed(() => {
	if (isPill.value) {
		// Pill fills its container width but caps at PILL_WIDTH_PX so it doesn't
		// sprawl into wider parents. Height stays fixed.
		return { width: '100%', maxWidth: `${PILL_WIDTH_PX}px`, height: `${PILL_HEIGHT_PX}px` };
	}
	if (isCard.value) {
		// Card grows with content; cardHeightPx acts as a minimum so cards
		// without segments still feel substantial.
		return { minHeight: `${props.cardHeightPx}px` };
	}
	if (isVertical.value) {
		// Time runs vertically: pin the time-axis (height) to verticalHeightPx
		// and the cross-axis (width) to the lane-derived size.
		return { height: `${props.verticalHeightPx}px`, width: `${barCrossAxisPx.value}px` };
	}
	return { height: `${barCrossAxisPx.value}px` };
});

const barWrapperClass = computed(() => {
	// Vertical mode lays the bar + ruler/labels alongside each other; horizontal
	// keeps the original column flow.
	if (isVertical.value) return 'inline-flex flex-row items-stretch select-none gap-1';
	return 'w-full select-none';
});

const barShellClass = computed(() => {
	// Pill: fixed-size, no `w-full`. Vertical: width is fixed by barSizeStyle, no `w-full`.
	if (isPill.value || isVertical.value) return '';
	// Card always fills its parent width.
	return 'w-full';
});

/**
 * The bar markup is rendered via a render function (rather than inline in
 * the template) so the same DOM can be reused both as a HoverCardTrigger
 * child (when a `bar-hover` slot is provided) and as a stand-alone element
 * (when not). Inlining would require duplicating the template.
 */
const BarMarkup = () => {
	// Pill density renders a minimal chip with no segments / ruler / labels.
	// It's still selectable (click → bar-select) and emits click events, so
	// hosts can wire it as a clickable cell.
	if (isPill.value) {
		return h(
			'div',
			{
				ref: (el: unknown) => {
					containerRef.value = el as HTMLElement | null;
				},
				'data-slot': 'time-range-bar-container',
				'data-density': 'pill',
				class: [
					'inline-block rounded-full border transition-all',
					barClasses.value,
					props.readonly ? '' : 'cursor-pointer',
					barSelectedEffective.value
						? 'outline outline-2 -outline-offset-2 outline-primary/50'
						: '',
				],
				style: barSizeStyle.value,
				onClick: onBarClick,
			},
			// No segments, no ruler — pill is purely a colored chip.
			[],
		);
	}

	// Card density renders a full-width fixed-height card whose body is owned
	// by the consumer via the `card-content` slot. When segments are provided,
	// a thin strip at the bottom shows their proportional positions. The card
	// is read-only but selectable at the bar level.
	if (isCard.value) {
		const variantClasses = segmentVariantClasses[props.variant];
		const totalDuration = props.durationSec || 1;

		// Strip: a `h-2 rounded-sm` outer with a semi-transparent track tinted
		// by the bar variant and child blocks overlaid in their own variant at
		// full saturation. Gap segments contribute to the strip's mask + edge
		// markers but never render as a colored block.
		const stripVisibleSegments = nonGapSegments(props.segments);
		const stripMask = gapMaskStyle(props.segments, totalDuration, false);
		const stripEdges = gapEdges(props.segments, totalDuration);
		const stripChildren = [
			h('div', {
				'data-slot': 'time-range-bar-card-strip-track',
				class: ['absolute inset-0 rounded-sm opacity-60', variantClasses.bar],
			}),
			...stripVisibleSegments.map((segment) =>
				h('div', {
					key: segment.id,
					'data-slot': 'time-range-bar-card-strip-segment',
					'data-segment-id': segment.id,
					class: ['absolute top-0 bottom-0 rounded-sm', segmentVariantClasses[segment.variant].bar],
					style: {
						left: `${(segment.offsetSec / totalDuration) * 100}%`,
						width: `${(segment.durationSec / totalDuration) * 100}%`,
					},
				}),
			),
		];

		return h(
			'div',
			{
				ref: (el: unknown) => {
					containerRef.value = el as HTMLElement | null;
				},
				'data-slot': 'time-range-bar-card',
				'data-density': 'card',
				class: [
					'relative flex flex-col rounded-md border px-2 py-1.5 leading-tight transition-colors select-none',
					barShellClass.value,
					variantClasses.bg,
					variantClasses.text,
					variantClasses.border,
					props.readonly ? '' : 'cursor-pointer',
					barSelectedEffective.value
						? 'outline outline-2 -outline-offset-2 outline-primary/50'
						: '',
				],
				style: barSizeStyle.value,
				onClick: onBarClick,
			},
			[
				// Card body — owned by the consumer via the `card-content` scoped slot.
				slots['card-content']
					? slots['card-content']({
							startTimeSec: props.startTimeSec,
							durationSec: props.durationSec,
							segments: props.segments,
							formatTime: ForgeTime.formatTimeOfDay,
							formatDuration,
							variant: props.variant,
						})
					: null,
				// Row 3: proportional segment strip — only rendered when segments are
				// provided. Gap segments cut the strip's track + segments via a CSS
				// mask; thin edge markers render on top to keep the cut boundary
				// visible.
				props.segments.length > 0
					? h(
							'div',
							{
								'data-slot': 'time-range-bar-card-strip',
								class: 'relative w-full overflow-hidden rounded-sm h-2 mt-1',
							},
							[
								h(
									'div',
									{
										'data-slot': 'time-range-bar-card-strip-mask',
										class: 'absolute inset-0',
										style: stripMask ?? undefined,
									},
									stripChildren,
								),
								...stripEdges.map((edge) =>
									h('div', {
										key: edge.id,
										'data-slot': 'time-range-bar-card-strip-gap-edge',
										class: 'absolute top-0 bottom-0 w-[1.5px] pointer-events-none z-[6]',
										style: { left: `${edge.offsetPct}%`, backgroundColor: gapEdgeColor.value },
									}),
								),
							],
						)
					: null,
			],
		);
	}

	const labelTextClass = segmentVariantClasses[props.variant].text;
	const labelSizeClass = isCompactSize.value ? 'text-[9px]' : 'text-[10px]';

	return h(
		'div',
		{
			ref: (el: unknown) => {
				containerRef.value = el as HTMLElement | null;
			},
			'data-slot': 'time-range-bar-container',
			'data-density': props.density,
			'data-orientation': props.orientation,
			class: [
				'relative rounded-md overflow-visible transition-[shadow,height,width]',
				barShellClass.value,
				barClasses.value,
				barCursorClass.value,
				barSelectedEffective.value ||
				(barClickOffsetPct.value != null && !activeSegmentIdEffective.value)
					? 'outline outline-2 -outline-offset-2 outline-primary/50'
					: '',
			],
			// Apply the gap mask on the outer container — its bg color, border
			// and inner segments all get visually "cut" at every gap. Edge
			// markers are appended as siblings of this container in the template
			// wrapper (outside the mask) so the cut boundary stays visible.
			style: { ...barSizeStyle.value, ...(barGapMaskStyle.value ?? {}) },
			onClick: onBarClick,
			onPointermove: onBarPointerMove,
			onPointerleave: onBarPointerLeave,
			onPointerdown: onBarPointerDown,
		},
		[
			// Bar edge resize highlights — top/bottom in vertical, left/right in horizontal.
			isBarResizable.value
				? h('div', {
						'data-slot': isVertical.value
							? 'time-range-bar-resize-top'
							: 'time-range-bar-resize-left',
						class: [
							isVertical.value
								? 'absolute top-0 left-0 right-0 h-[4px] rounded-t-md transition-colors pointer-events-none z-10'
								: 'absolute left-0 top-0 bottom-0 w-[4px] rounded-l-md transition-colors pointer-events-none z-10',
							barEdgeHover.value === 'start' ||
							(isBarDragging.value && barDragState.value?.edge === 'start')
								? 'bg-primary/30'
								: '',
						],
					})
				: null,
			isBarResizable.value
				? h('div', {
						'data-slot': isVertical.value
							? 'time-range-bar-resize-bottom'
							: 'time-range-bar-resize-right',
						class: [
							isVertical.value
								? 'absolute bottom-0 left-0 right-0 h-[4px] rounded-b-md transition-colors pointer-events-none z-10'
								: 'absolute right-0 top-0 bottom-0 w-[4px] rounded-r-md transition-colors pointer-events-none z-10',
							barEdgeHover.value === 'end' ||
							(isBarDragging.value && barDragState.value?.edge === 'end')
								? 'bg-primary/30'
								: '',
						],
					})
				: null,

			// Time labels on bar edges — start at top (vertical) or left (horizontal),
			// end at bottom (vertical) or right (horizontal).
			effectiveShowLabels.value
				? h(
						'div',
						{
							class: isVertical.value
								? 'absolute inset-0 flex flex-col justify-between items-center py-1 pointer-events-none'
								: 'absolute inset-0 flex items-center justify-between px-2 pointer-events-none',
						},
						[
							h(
								'span',
								{ class: [`${labelSizeClass} font-medium`, labelTextClass] },
								ForgeTime.formatTimeOfDay(effectiveStartTimeSec.value),
							),
							h(
								'span',
								{ class: [`${labelSizeClass} font-medium`, labelTextClass] },
								ForgeTime.formatTimeOfDay(effectiveStartTimeSec.value + effectiveDurationSec.value),
							),
						],
					)
				: null,

			// Segments wrapper — clips children that overflow during bar resize.
			// We iterate `visibleSegments` so gaps don't render as colored blocks
			// and so indices line up with the drag composable's filtered list.
			h(
				'div',
				{ class: 'absolute inset-0 overflow-hidden rounded-md pointer-events-none' },
				props.readonly
					? visibleSegments.value.map((segment, i) =>
							h(
								'div',
								{
									key: segment.id,
									'data-slot': 'segment',
									'data-segment-id': segment.id,
									class: cn(
										'absolute rounded-[5px] border flex items-center justify-center opacity-50',
										!props.stackOverlaps
											? isVertical.value
												? 'left-[1px] w-[calc(100%-2px)]'
												: 'top-[1px] h-[calc(100%-2px)]'
											: '',
										segmentVariantClasses[segment.variant].bg,
										segmentVariantClasses[segment.variant].border,
									),
									style: segmentStyle(segment, i),
									title: segment.label,
								},
								segment.icon ? [h(segment.icon, { class: 'size-3 opacity-80' })] : [],
							),
						)
					: visibleSegments.value.map((segment, i) =>
							h(
								'div',
								{
									key: segment.id,
									'data-segment': '',
									'data-slot': 'segment',
									'data-segment-id': segment.id,
									tabindex: isEditable.value ? 0 : -1,
									role: 'slider',
									'aria-label': segment.label ?? 'Segment',
									'aria-valuemin': '0',
									'aria-valuemax': props.durationSec,
									'aria-valuenow': segment.offsetSec,
									'aria-orientation': isVertical.value ? 'vertical' : 'horizontal',
									class: [
										// `transition` (the Tailwind preset) covers color, bg,
										// border, opacity, shadow, transform, filter — but NOT
										// `left` / `width` / `top` / `height`. We don't want
										// those to animate because the segment's position
										// recomputes on every pointer-move tick during a bar
										// resize (the parent bar's `durationSec` changes →
										// segment percentages change). With `transition-all`,
										// each tick re-arms a 150 ms ease chase and the
										// segment visibly lags the pointer (read by the user
										// as "every move repaints the breaks"). Hover /
										// selection / drag-state visuals still transition.
										'absolute flex items-center gap-1 rounded-sm border transition overflow-hidden pointer-events-auto',
										!props.stackOverlaps
											? isVertical.value
												? 'left-0 right-0'
												: 'top-0 bottom-0'
											: '',
										segmentVariantClasses[segment.variant].bg,
										segmentVariantClasses[segment.variant].border,
										segmentVariantClasses[segment.variant].text,
										isVertical.value ? 'justify-center' : 'px-1.5',
										isEditable.value ? 'cursor-grab hover:shadow-md hover:brightness-95' : '',
										activeSegmentIdEffective.value === segment.id
											? 'outline outline-2 -outline-offset-2 outline-primary/50'
											: '',
										isDragging.value && dragPreview.value?.segmentId === segment.id
											? 'cursor-grabbing opacity-80'
											: '',
										'focus-visible:outline-2 focus-visible:outline-primary focus-visible:outline-offset-1',
									],
									style: segmentStyle(segment, i),
									onClick: (e: MouseEvent) => onSegmentClick(e, segment, i),
									onPointerdown: (e: PointerEvent) => {
										e.stopPropagation();
										onSegmentPointerDown(e, segment, i);
									},
									onPointerenter: () => onSegmentHoverEnter(segment),
									onPointerleave: () => onSegmentHoverLeave(),
									onKeydown: (e: KeyboardEvent) => onSegmentKeyDown(e, segment, i),
								},
								[
									// Start-edge resize handle (left in horizontal, top in vertical)
									isEditable.value
										? h('div', {
												'data-slot': isVertical.value
													? 'segment-resize-top'
													: 'segment-resize-left',
												class: isVertical.value
													? 'absolute top-0 left-0 right-0 h-[4px] cursor-ns-resize rounded-t hover:bg-primary/30 transition-colors'
													: 'absolute left-0 top-0 bottom-0 w-[4px] cursor-ew-resize rounded-l hover:bg-primary/30 transition-colors',
												onPointerdown: (e: PointerEvent) => {
													e.stopPropagation();
													onResizePointerDown(e, segment, i, 'left');
												},
											})
										: null,
									segment.icon ? h(segment.icon, { class: 'size-3.5 shrink-0 opacity-80' }) : null,
									// Label is hidden in compact density regardless of width.
									!isCompactSize.value && segment.label && shouldShowLabel(segment.id)
										? h(
												'span',
												{ class: 'text-[10px] font-medium truncate leading-none' },
												segment.label,
											)
										: null,
									slots.segment ? slots.segment({ segment }) : null,
									isEditable.value
										? h('div', {
												'data-slot': isVertical.value
													? 'segment-resize-bottom'
													: 'segment-resize-right',
												class: isVertical.value
													? 'absolute bottom-0 left-0 right-0 h-[4px] cursor-ns-resize rounded-b hover:bg-primary/30 transition-colors'
													: 'absolute right-0 top-0 bottom-0 w-[4px] cursor-ew-resize rounded-r hover:bg-primary/30 transition-colors',
												onPointerdown: (e: PointerEvent) => {
													e.stopPropagation();
													onResizePointerDown(e, segment, i, 'right');
												},
											})
										: null,
								],
							),
						),
			),

			// Hover tooltip — rendered outside the clip wrapper so it's visible above the bar
			hoveredSegment.value &&
			!isDragging.value &&
			!isBarDragging.value &&
			activeSegmentIdEffective.value !== hoveredSegment.value.id &&
			!props.readonly
				? h(
						'div',
						{
							class: [
								'absolute px-1.5 py-0.5 rounded bg-foreground text-background text-[10px] font-medium whitespace-nowrap pointer-events-none z-50',
								isVertical.value
									? '-left-2 -translate-x-full -translate-y-1/2'
									: '-top-7 -translate-x-1/2',
							],
							style: hoveredTooltipStyle.value,
						},
						hoveredSegmentTimeLabel(
							hoveredSegment.value,
							visibleSegments.value.indexOf(hoveredSegment.value),
						),
					)
				: null,

			// Drag time tooltip for child segments
			isDragging.value && dragTimeLabel.value
				? h(
						'div',
						{
							class: [
								'absolute px-1.5 py-0.5 rounded bg-foreground text-background text-[10px] font-medium whitespace-nowrap pointer-events-none z-50',
								isVertical.value
									? '-left-2 -translate-x-full -translate-y-1/2'
									: '-top-7 -translate-x-1/2',
							],
							style: dragTooltipStyle.value,
						},
						dragTimeLabel.value,
					)
				: null,

			// Drag time tooltip for bar resize
			isBarDragging.value && barDragTimeLabel.value
				? h(
						'div',
						{
							class: [
								'absolute px-1.5 py-0.5 rounded bg-foreground text-background text-[10px] font-medium whitespace-nowrap pointer-events-none z-50',
								isVertical.value
									? '-left-2 top-1/2 -translate-x-full -translate-y-1/2'
									: '-top-7 left-1/2 -translate-x-1/2',
							],
						},
						barDragTimeLabel.value,
					)
				: null,
		],
	);
};
</script>
