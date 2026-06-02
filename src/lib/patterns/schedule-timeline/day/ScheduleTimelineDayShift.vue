<template>
	<div
		ref="wrapperRef"
		data-shift-block
		:data-shift-id="shift.id"
		:data-employee-id="employeeId"
		:data-date="dateStr"
		:style="shiftStyle"
		role="button"
		tabindex="0"
		:aria-label="ariaLabel"
		:aria-pressed="selected"
		@contextmenu="onContextMenu"
		@click="onClick"
		@keydown="onKeydown"
		@pointerdown="onWrapperPointerDown"
	>
		<slot v-bind="slotScope">
			<HoverCard :open-delay="500" :close-delay="200">
				<HoverCardTrigger as-child>
					<div
						data-slot="schedule-day-shift-card"
						:style="cardStyle"
						:class="
							cn(
								'w-full h-full relative rounded-md overflow-hidden',
								!isInteractive && 'cursor-default',
								isInteractive && (dragPreview !== null ? 'cursor-grabbing' : 'cursor-grab'),
								shift.isLocked && 'cursor-not-allowed',
								shift.isDraft && 'opacity-70',
								shift.isDraft && '[&_[data-slot=time-range-bar-container]]:border-dashed',
								hasConflict && 'outline outline-2 -outline-offset-2 outline-destructive',
							)
						"
					>
						<!-- Locked overlay: diagonal-stripe pattern that paints over
                 the bar to communicate "read-only" at a glance. Sits
                 between the bar and the icon+label layer so the label
                 stays readable. Pointer-events-none so it doesn't
                 swallow hover events. -->
						<div
							v-if="shift.isLocked"
							class="absolute inset-0 pointer-events-none rounded-md z-[5]"
							:style="lockedStripeStyle"
						></div>
						<TimeRangeBar
							:duration-sec="effectiveDurationSec || 3600"
							:start-time-sec="0"
							:variant="shiftVariantToSegmentVariant(shift.variant)"
							:segments="shiftChildrenToSegments(effectiveShiftForSegments)"
							:show-labels="false"
							:show-ruler="false"
							:show-hover-popup="!editable"
							:readonly="!isInteractive"
							:editable="isInteractive"
							:resizable="false"
							:active-segment-id="isInteractive ? activeSegmentId : undefined"
							:selected="selected && !activeSegmentId"
							overlap="block"
							:stack-overlaps="true"
							:bar-height-px="CARD_HEIGHT"
							@segment-update="onInnerSegmentUpdate"
							@segment-select="onInnerSegmentSelect"
							@segment-preview="onInnerSegmentPreview"
							@click="onInnerBarClick"
						/>
						<div
							:class="
								cn(
									'absolute inset-0 flex items-center gap-1 px-2.5 text-2xs font-medium pointer-events-none',
									colors[shift.variant].text,
								)
							"
						>
							<Icon v-if="shift.icon" :icon="shift.icon" size="xs" class="opacity-70" />
							<div class="flex flex-col min-w-0 flex-1 py-1">
								<div class="flex items-center gap-1">
									<span class="font-semibold truncate">{{ shift.name }}</span>
									<span class="text-3xs flex-shrink-0"> ({{ effectiveDurationLabel }}) </span>
									<Lock v-if="shift.isLocked" class="size-3.5 flex-shrink-0" aria-label="Locked" />
								</div>
								<span class="text-3xs truncate"> {{ shift.time }}&ndash;{{ shiftEndTime }} </span>
							</div>
						</div>
					</div>
				</HoverCardTrigger>
				<HoverCardContent v-if="!hoverSuppressed" side="bottom" :side-offset="4" class="w-72 p-0">
					<div class="p-3 space-y-2.5">
						<div class="text-sm font-semibold text-foreground">{{ props.formattedDate }}</div>
						<div class="flex items-center gap-2 text-xs text-muted-foreground">
							<span>{{ shift.timeRange }}</span>
							<span class="font-medium text-foreground">{{ shift.name }}</span>
							<span
								v-if="shift.isDraft"
								class="text-3xs border border-dashed rounded px-1.5 py-0.5"
							>
								Draft
							</span>
						</div>
						<div v-if="visibleChildren.length" class="border-t border-border pt-2 space-y-1.5">
							<div
								v-for="(child, ci) in visibleChildren"
								:key="ci"
								class="flex items-center text-xs text-muted-foreground"
								@pointerenter="onChildHoverEnter(ci, child)"
								@pointerleave="onChildHoverLeave"
							>
								<span class="min-w-0 truncate">{{ child.label }}</span>
								<span class="ml-auto flex-shrink-0 tabular-nums">
									{{ childTimeRange(child) }}
								</span>
							</div>
						</div>
						<div v-if="gapChildren.length" class="border-t border-border pt-2 space-y-1.5">
							<div
								v-for="(gap, gi) in gapChildren"
								:key="gi"
								class="flex items-center text-xs font-medium text-muted-foreground"
							>
								<span>Gap</span>
								<span class="ml-auto flex-shrink-0 tabular-nums">
									{{ childTimeRange(gap) }}
								</span>
							</div>
						</div>
						<div
							v-if="childPills.length"
							class="border-t border-border pt-2 flex flex-wrap gap-1.5"
						>
							<span
								v-for="(pill, pi) in childPills"
								:key="pi"
								:class="
									cn(
										'text-3xs font-medium rounded-full px-2 py-0.5',
										colors[pill.variant].bg,
										colors[pill.variant].text,
									)
								"
							>
								{{ pill.label }}
							</span>
						</div>
						<div
							v-if="shift.durationSec"
							:class="cn('relative h-4 rounded-sm overflow-hidden', colors[shift.variant].bg)"
						>
							<div
								v-for="(child, ci) in shift.children ?? []"
								:key="ci"
								class="absolute top-0 h-full"
								:style="childStyle(child)"
							>
								<div
									v-if="child.type !== 'gap'"
									class="w-full h-full"
									:style="{ backgroundColor: variantTokenColor(child.variant) }"
								/>
							</div>
						</div>
					</div>
				</HoverCardContent>
			</HoverCard>
			<div
				v-for="edge in gapEdges"
				:key="edge.key"
				class="absolute top-0 w-[1.5px] h-[90%] mt-[2px] pointer-events-none"
				:style="{
					left: edge.left,
					zIndex: Z.shiftGapEdge,
					backgroundColor: variantTokenColor(shift.variant),
				}"
			/>
			<!-- Edge resize handles. Mirrors `TimeRangeBar`'s own bar-edge resize
           pattern: 8 px outer hit-zone (transparent, intercepts the
           pointer) wrapping a 4 px visible decorative bar that tints
           `bg-primary/30` while hovered or while the matching resize drag
           is in flight. Single tint state for hover + active matches the
           bar's `barEdgeHover ||  isBarDragging` rule — no `/50` step.
           `group` + `group-hover:` on the inner div so hovering anywhere
           in the 8 px zone lights up the visible 4 px handle. -->
			<template v-if="isInteractive">
				<div
					data-shift-edge="start"
					class="absolute inset-y-0 left-0 w-2 cursor-ew-resize group"
					:style="{ zIndex: Z.shiftEdgeHandle }"
				>
					<div
						:class="
							cn(
								'absolute inset-y-0 left-0 w-[4px] rounded-l-md transition-colors',
								activeDragKind === 'resize-start' ? 'bg-primary/30' : 'group-hover:bg-primary/30',
							)
						"
					/>
				</div>
				<div
					data-shift-edge="end"
					class="absolute inset-y-0 right-0 w-2 cursor-ew-resize group"
					:style="{ zIndex: Z.shiftEdgeHandle }"
				>
					<div
						:class="
							cn(
								'absolute inset-y-0 right-0 w-[4px] rounded-r-md transition-colors',
								activeDragKind === 'resize-end' ? 'bg-primary/30' : 'group-hover:bg-primary/30',
							)
						"
					/>
				</div>
				<!-- Fill handle: a small primary-tinted square at the
             bottom-right of a selected card. Pointer-down starts a
             vertical "fill down rows" drag — release commits a clone
             of this shift into every editable row crossed. The page
             owns the row-range computation; the handle just emits the
             target employee on release. Visible only on selected
             editable cards. -->
				<div
					v-if="selected"
					data-shift-fill-handle
					class="absolute bottom-0 right-0 size-2 cursor-crosshair rounded-sm bg-primary/70 hover:bg-primary translate-x-px translate-y-px"
					:style="{ zIndex: Z.shiftEdgeHandle + 1 }"
					@pointerdown="onFillHandlePointerDown"
				/>
			</template>
		</slot>
		<!-- Live drag tooltip. Mirrors the shift editor's `TimeRangeBar` drag
         label: a small dark chip floating above the card showing the
         current time range while the user is mid-drag. Teleported to
         `document.body` because the virtual-scroll container (and the
         day view) `overflow`-clip anything that extends above the top
         row, and `-top-7` on an in-tree element would disappear under
         that clip. Position is computed in viewport coords from the
         wrapper's `getBoundingClientRect()` whenever a drag preview
         updates — see `tooltipViewportStyle`. -->
		<Teleport to="body">
			<div
				v-if="dragTooltipLabel && tooltipViewportStyle"
				class="fixed px-1.5 py-0.5 rounded bg-foreground text-background text-[10px] font-medium whitespace-nowrap pointer-events-none"
				:style="tooltipViewportStyle"
			>
				{{ dragTooltipLabel }}
			</div>
			<!-- Landing-ghost: rendered only during a Y-locked move-drag over
           a *different* row. Translucent dashed primary outline so it
           reads as "this is where the shift will drop" without competing
           with the lifted source card or the toolbar. -->
			<div
				v-if="landingGhostStyle"
				class="fixed pointer-events-none rounded-md border border-dashed border-primary bg-primary/15"
				:style="landingGhostStyle"
			></div>
			<!-- Fill-drag landing-ghosts. Excel-style: paint one ghost per
           row in the fill range so the user can see the whole drop
           target as they drag. Same dashed-primary styling as the
           reassign ghost ("this is where it'll land"). -->
			<div
				v-for="(g, gi) in fillGhostStyles"
				:key="gi"
				class="fixed pointer-events-none rounded-md border border-dashed border-primary bg-primary/15"
				:style="g"
			></div>
		</Teleport>
		<!-- Per-shift toolbar slot. Rendered as a sibling of the card (still
         inside the absolute `data-shift-block` wrapper) so it escapes
         the card's `overflow-hidden` clipping but still scrolls with
         the shift along the hour axis.

         Positioning mirrors the shift editor's `TimeRangeBar` toolbars:
         - When `activeSegmentId` belongs to this shift, the toolbar
           anchors at the segment's horizontal centre (same as
           `activeSegmentStyle` in TimeRangeBar).
         - Otherwise (shift selected, no segment), it centers at 50 %.
         - `mt-1.5` (6 px) gap below the card matches TimeRangeBar's
           `mt-1.5` between bar and `#bar-toolbar`.

         `@pointerdown.stop` / `@click.stop` keep clicks on the toolbar's
         inputs / buttons from reaching the wrapper's drag/select
         handlers (which would otherwise start a shift-move drag and
         steal focus from inputs). -->
		<div
			v-if="$slots['shift-toolbar']"
			class="absolute top-full mt-1.5"
			:style="{
				left: `${toolbarLeftPct}%`,
				transform: 'translateX(-50%)',
				zIndex: Z.shiftToolbar,
			}"
			@pointerdown.stop
			@click.stop
		>
			<div class="w-max">
				<slot name="shift-toolbar" v-bind="slotScope" />
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch, type CSSProperties } from 'vue';
import { ForgeTime } from '@fromforgesoftware/ts-kit';
import { Lock } from '@lucide/vue';
import { cn } from '../../../../helpers/cn.js';
import Icon from '../../../general/icon/Icon.vue';
import HoverCard from '../../../general/hover-card/HoverCard.vue';
import HoverCardTrigger from '../../../general/hover-card/HoverCardTrigger.vue';
import HoverCardContent from '../../../general/hover-card/HoverCardContent.vue';
import TimeRangeBar from '../../time-range-bar/TimeRangeBar.vue';
import type {
	ScheduleTimelineShift,
	ScheduleTimelineShiftChild,
	ScheduleTimelineShiftVariant,
} from '../schedule-timeline.js';
import {
	shiftVariantClasses,
	shiftVariantToSegmentVariant,
	shiftChildrenToSegments,
} from '../schedule-timeline.js';
import {
	parseHHMMToSec,
	formatShiftDuration,
	variantTokenColor,
	ScheduleTimelineZ as Z,
	DAY_SHIFT_CARD_HEIGHT as CARD_HEIGHT,
	DAY_SHIFT_CARD_SPACING as CARD_SPACING,
	DAY_SHIFT_TOP_PADDING as TOP_PADDING,
} from '../utils.js';

const props = withDefaults(
	defineProps<{
		shift: ScheduleTimelineShift;
		/** Sibling shifts on the same day (exposed to the #shift-wrapper slot). */
		shifts: ScheduleTimelineShift[];
		/** This shift's index within `shifts`. */
		idx: number;
		/** Vertical lane assigned by the row (single source of truth for stacking). */
		lane: number;
		totalColumns: number;
		totalWidth: number;
		columnWidth: number;
		/** The day's start, in seconds-of-day (replaces per-call parsing). */
		startTimeSec: number;
		stackOverlaps: boolean;
		employeeId: string;
		dateStr: string;
		/** Selected from parent (computed by parent from `selectedIds`). */
		selected: boolean;
		/**
		 * True when the timeline has any active selection — any shift selected
		 * or any segment active. Used to suppress hover popups on non-selected
		 * shifts so the user's focus stays on the selected item. The owner-shift
		 * case (this shift selected, or its segment active) is already covered
		 * by `selected` / `activeSegmentId`; this prop covers every other shift.
		 */
		hasAnySelection?: boolean;
		/**
		 * Conflict flag from parent (computed by parent from `conflictIds`).
		 * When `true`, the card paints a destructive outline so the user
		 * can spot overlapping / invalid shifts at a glance.
		 */
		hasConflict?: boolean;
		/** Formatted date for the hover card header. */
		formattedDate: string;
		/**
		 * Enable editing for the default-content shift card. When `true` the
		 * card surfaces drag-to-move (wrapper-level, uses the parent timeline's
		 * `columnWidth`), edge-resize (delegated to the inner `TimeRangeBar`),
		 * and segment drag. Emits `resize`, `move`, `segment-update`, and
		 * `segment-select`. Has no effect when the consumer overrides the
		 * `#shift-wrapper` slot — the slot owns the entire shift surface in
		 * that case. Default `false`.
		 */
		editable?: boolean;
		/**
		 * Active segment id forwarded to the inner `TimeRangeBar` when
		 * `editable` is true. Parent-owned so the page can drive selection from
		 * an external toolbar.
		 */
		activeSegmentId?: string | null;
		/**
		 * Snap grid (seconds) for the wrapper-level shift move drag. Default
		 * 300 (5 minutes). Only used when `editable` is true.
		 */
		snapSec?: number;
	}>(),
	{
		stackOverlaps: false,
		selected: false,
		hasAnySelection: false,
		hasConflict: false,
		lane: 0,
		editable: false,
		activeSegmentId: undefined,
		snapSec: 300,
	},
);

const emit = defineEmits<{
	contextmenu: [
		payload: {
			e: MouseEvent;
			shiftId: string;
			employeeId: string;
			meta?: Record<string, unknown>;
		},
	];
	'click-internal': [payload: { e: MouseEvent; shift: ScheduleTimelineShift; employeeId: string }];
	'keyboard-select': [shiftId: string];
	'child-hover-enter': [
		payload: {
			shiftId: string;
			employeeId: string;
			ci: number;
			child: ScheduleTimelineShiftChild;
		},
	];
	'child-hover-leave': [];
	/** Edit-mode: bar edge-resize commit. */
	resize: [
		payload: {
			shiftId: string;
			employeeId: string;
			dateStr: string;
			startTimeSec: number;
			durationSec: number;
			children: ScheduleTimelineShiftChild[];
		},
	];
	/** Edit-mode: wrapper-level drag commit — the card slid along the hour grid (duration unchanged). */
	move: [payload: { shiftId: string; employeeId: string; dateStr: string; startTimeSec: number }];
	/** Edit-mode: a child segment was moved or resized. */
	'segment-update': [
		payload: {
			shiftId: string;
			employeeId: string;
			dateStr: string;
			segmentId: string;
			offsetSec: number;
			durationSec: number;
		},
	];
	/** Edit-mode: a child segment was clicked (selection candidate). */
	'segment-select': [
		payload: { shiftId: string; employeeId: string; dateStr: string; segmentId: string | null },
	];
	/**
	 * Edit-mode: bar surface was clicked. Carries the click's `offsetSec`
	 * within the shift's own duration so the page can drive both the shift
	 * toolbar's horizontal position AND the "Add period" placement off the
	 * same point — mirrors the shift editor's `onBarClick` / `addChild`
	 * pairing.
	 */
	'bar-click': [
		payload: { shiftId: string; employeeId: string; dateStr: string; offsetSec: number },
	];
	/**
	 * Edit-mode (day view): a move-drag ended over a different employee
	 * row (or different date in multi-day views). The consumer should
	 * treat this as delete-original + create-at-target — the timeline
	 * pattern doesn't reassign in-place because the bulk save endpoint
	 * doesn't carry a `move` op.
	 */
	reassign: [
		payload: {
			shiftId: string;
			fromEmployeeId: string;
			fromDateStr: string;
			toEmployeeId: string;
			toDateStr: string;
			startTimeSec: number;
		},
	];
	/**
	 * Edit-mode (day view): the user drag-filled the source shift down
	 * to `toEmployeeId`. The consumer is responsible for cloning the
	 * source into every row from the source's row to the target row
	 * (inclusive of the intermediates) — the pattern only knows the
	 * source + target, not the row order. `altKey` carries the modifier
	 * state at release so the consumer can pick a "skip occupied /
	 * replace occupied" policy.
	 */
	fill: [
		payload: {
			shiftId: string;
			fromEmployeeId: string;
			toEmployeeId: string;
			dateStr: string;
			altKey: boolean;
		},
	];
}>();

const colors = shiftVariantClasses;

// `editable` is the master switch the page passes in; `isInteractive`
// also folds in per-shift `isLocked`. Anything that would mutate the
// shift (wrapper drag, edge resize, segment drag, segment select,
// keyboard nudge) gates on `isInteractive` instead of `editable`. The
// hover popup and read-only chrome stay tied to `editable` so locked
// shifts still surface their info on hover in edit mode.
const isInteractive = computed<boolean>(() => props.editable && !props.shift.isLocked);

const layer = computed<number>(() => (props.stackOverlaps ? props.lane : 0));

// Live preview during drag. `null` outside a drag; otherwise carries the
// in-flight wall-clock start + duration AND a re-anchored children array so
// the inner `TimeRangeBar` can keep child segments visually glued to their
// hour positions (rather than redistribute proportionally inside a fixed
// container). On commit we emit `move` or `resize` upward and the parent's
// re-render with the new `shift.time` / `durationSec` / `children` lands the
// card at the committed position.
interface DragPreview {
	startSec: number;
	durationSec: number;
	children: ScheduleTimelineShiftChild[];
	/**
	 * Vertical pointer offset while a move-drag is in flight. Drives the
	 * body-teleported ghost so the user sees the shift "lift off" and
	 * track the pointer across rows. `null` during resize-edge drags.
	 */
	yOffsetPx?: number;
	/**
	 * Employee row the pointer is currently hovering over (resolved via
	 * hit-test on each pointer-move tick). Used by `onWrapperPointerUp` to
	 * decide between a same-row `move` and a cross-row `reassign`.
	 */
	targetEmployeeId?: string | null;
	/** Same for dateStr — multi-day views (week/month) would change date too. */
	targetDateStr?: string | null;
	/**
	 * The target row's body element captured at hit-test time. Used to
	 * project the landing-ghost into viewport coords so it renders inside
	 * the destination row even though our wrapper still belongs to the
	 * source row. Cleared when the pointer is back over the source row
	 * (no landing ghost needed there — the lifted card already covers it).
	 */
	targetRowBodyEl?: HTMLElement | null;
}
const dragPreview = ref<DragPreview | null>(null);

// Live preview while a child segment is being dragged inside the inner
// `TimeRangeBar`. The bar only fires `segment-update` on commit, but it
// also fires per-tick `segment-preview` events with the in-flight values.
// We park them here so `effectiveShiftForSegments` can paint the toolbar
// with live numbers — matching the shift editor's UX where the time-range
// field in `#toolbar` mirrors the drag.
interface SegmentPreview {
	segmentId: string;
	offsetSec: number;
	durationSec: number;
}
const segmentDragPreview = ref<SegmentPreview | null>(null);

function onInnerSegmentPreview(p: SegmentPreview | null) {
	segmentDragPreview.value = p;
}

// Effective values used by both `shiftStyle` (outer layout) and the inner
// `TimeRangeBar` (segment positioning). When no drag is in flight, these
// fall back to the committed shift data.
const effectiveStartSec = computed(() => {
	const base = parseHHMMToSec(props.shift.time);
	return dragPreview.value?.startSec ?? (Number.isFinite(base) ? base : 0);
});
const effectiveDurationSec = computed(
	() => dragPreview.value?.durationSec ?? props.shift.durationSec ?? 0,
);
const effectiveShiftForSegments = computed<ScheduleTimelineShift>(() => {
	// Start from wrapper-level drag preview when present, else committed shift.
	let working: ScheduleTimelineShift = dragPreview.value
		? { ...props.shift, children: dragPreview.value.children }
		: props.shift;
	// Layer the in-flight segment drag on top so the toolbar — which reads
	// `shift.children[idx]` from the slot scope — reflects the live values
	// mid-drag rather than the committed snapshot.
	const segPrev = segmentDragPreview.value;
	if (segPrev) {
		const prefix = `${props.shift.id}-child-`;
		if (segPrev.segmentId.startsWith(prefix)) {
			const idx = Number(segPrev.segmentId.slice(prefix.length));
			const base = working.children ?? [];
			if (Number.isInteger(idx) && idx >= 0 && base[idx]) {
				const next = base.slice();
				next[idx] = {
					...next[idx],
					offsetSec: segPrev.offsetSec,
					durationSec: segPrev.durationSec,
				};
				working = { ...working, children: next };
			}
		}
	}
	return working;
});

// Last bar-surface click offset (within the shift's own duration). Drives
// both the toolbar position AND the "Add period" placement so a new
// segment lands at the click point — same pattern the shift editor uses
// (`addMenuOffsetSec` + TimeRangeBar's internal `barClickOffsetPct`).
const clickOffsetSec = ref<number | null>(null);

function onInnerBarClick(e: { offsetSec: number; event: MouseEvent }) {
	clickOffsetSec.value = e.offsetSec;
	// Forward up so the page can use this offset when the user invokes
	// "Add period" from the shift toolbar — same coupling the shift editor
	// has between `onBarClick` and `addChild`.
	emit('bar-click', {
		shiftId: props.shift.id,
		employeeId: props.employeeId,
		dateStr: props.dateStr,
		offsetSec: e.offsetSec,
	});
}

// Reset the click offset when the shift loses selection so the next
// selection cycle starts at a known state. Without this, an old click
// offset would re-appear if the user re-selected this shift via another
// path (e.g. clicking a segment that promotes the shift to selected).
watch(
	() => props.selected,
	(next) => {
		if (!next) clickOffsetSec.value = null;
	},
);

// Live drag tooltip. Shows "HH:mm – HH:mm" centred above the relevant
// region while a wrapper-level shift drag (move / resize-start /
// resize-end) is in flight, OR while a child segment is being dragged
// inside the inner `TimeRangeBar`. Returns `null` outside any drag so
// the chip stays hidden. The shift editor renders an equivalent tooltip
// internally; we mirror it here because the timeline's shift-level drag
// is wrapper-level (not driven by `TimeRangeBar`'s own bar resize).
const dragTooltipLabel = computed<string | null>(() => {
	const startAbs = shiftStartSecAbs();
	if (dragPreview.value) {
		const s = dragPreview.value.startSec;
		const e = dragPreview.value.startSec + dragPreview.value.durationSec;
		return `${ForgeTime.formatTimeOfDay(s)} – ${ForgeTime.formatTimeOfDay(e)}`;
	}
	const segPrev = segmentDragPreview.value;
	if (segPrev) {
		const s = startAbs + segPrev.offsetSec;
		const e = s + segPrev.durationSec;
		return `${ForgeTime.formatTimeOfDay(s)} – ${ForgeTime.formatTimeOfDay(e)}`;
	}
	return null;
});

// Tooltip horizontal anchor (percent of the card width).
//  - Whole-shift move / resize: centre over the card (the bar itself
//    is the chip's reference).
//  - Inner segment drag: centre at the segment's preview midpoint so
//    the chip tracks the segment as it slides.
const dragTooltipLeftPct = computed<number>(() => {
	const segPrev = segmentDragPreview.value;
	if (segPrev && !dragPreview.value) {
		const total = effectiveDurationSec.value || 1;
		return ((segPrev.offsetSec + segPrev.durationSec / 2) / total) * 100;
	}
	return 50;
});

// Wrapper DOM ref + viewport-space tooltip position. `getBoundingClientRect`
// isn't reactive, so we recompute it whenever any of the drag-preview refs
// move — the read inside this computed registers them as deps, the watch
// below force-bumps `tooltipTick` once the DOM has actually applied the
// new shiftStyle so the rect is current.
const wrapperRef = ref<HTMLElement | null>(null);
const tooltipTick = ref(0);

const tooltipViewportStyle = computed<Record<string, string> | null>(() => {
	// Touch the previews + tick so the computed reruns on every drag move.
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	dragPreview.value;
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	segmentDragPreview.value;
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	tooltipTick.value;
	const el = wrapperRef.value;
	if (!el) return null;
	if (!dragTooltipLabel.value) return null;
	const rect = el.getBoundingClientRect();
	const left = rect.left + (rect.width * dragTooltipLeftPct.value) / 100;
	// 6 px gap above the wrapper, matching `mt-1.5` on the toolbar wrapper
	// below the card. Chip height is roughly 18 px so a 28 px top offset
	// matches the shift editor's `-top-7` placement above the bar.
	const top = rect.top - 28;
	return {
		left: `${left}px`,
		top: `${top}px`,
		transform: 'translateX(-50%)',
		zIndex: '50',
	};
});

watch(
	[dragPreview, segmentDragPreview],
	async () => {
		await nextTick();
		tooltipTick.value++;
	},
	{ deep: true },
);

// Landing-ghost: while a Y-locked move-drag is in flight over a
// **different** row, paint a translucent rectangle at the candidate
// drop position in the target row so the user can see where the shift
// will land. Teleported to body because the source-row wrapper has no
// reach into a sibling row's DOM. Reads `getBoundingClientRect()` of
// the target row's body element to project the source-card's left/width
// into the target row's vertical space.
const landingGhostStyle = computed<Record<string, string> | null>(() => {
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	tooltipTick.value;
	const preview = dragPreview.value;
	if (!preview) return null;
	const body = preview.targetRowBodyEl;
	if (!body) return null;
	const rect = body.getBoundingClientRect();
	// Match the source card's hour-grid math: offset within the row from
	// the row's start-of-day to the shift's start.
	let offsetSec = preview.startSec - props.startTimeSec;
	if (offsetSec < 0) offsetSec += 86_400;
	const leftWithinRow = (offsetSec / 3600) * props.columnWidth;
	const widthPx = (preview.durationSec / 3600) * props.columnWidth;
	return {
		left: `${rect.left + leftWithinRow}px`,
		top: `${rect.top + TOP_PADDING}px`,
		width: `${Math.max(widthPx, 20)}px`,
		height: `${CARD_HEIGHT}px`,
		zIndex: '40',
	};
});

// Fill-drag ghosts. Excel-style — paint one rectangle per row that
// will receive a clone, so the user sees the whole fill range while
// dragging. Walks the DOM to find rows between source and target
// (inclusive of target, exclusive of source) and projects each row's
// body rect into viewport coords. Source-position math is identical
// because fill clones the shift at the same time on every target row.
const fillGhostStyles = computed<Array<Record<string, string>>>(() => {
	// eslint-disable-next-line @typescript-eslint/no-unused-expressions
	tooltipTick.value;
	const targetEmp = fillTargetEmployeeId.value;
	if (!targetEmp || targetEmp === props.employeeId) return [];
	const sourceRow = wrapperRef.value?.closest(
		'[data-slot="schedule-timeline-employee-row"]',
	) as HTMLElement | null;
	const targetBody = fillTargetRowBodyEl.value;
	const targetRow = targetBody?.closest(
		'[data-slot="schedule-timeline-employee-row"]',
	) as HTMLElement | null;
	if (!sourceRow || !targetRow) return [];
	// DOM order = visual row order. Slice between the two and drop the
	// source row itself — it's the active card, not a fill target.
	const allRows = Array.from(
		document.querySelectorAll('[data-slot="schedule-timeline-employee-row"]'),
	) as HTMLElement[];
	const sourceIdx = allRows.indexOf(sourceRow);
	const targetIdx = allRows.indexOf(targetRow);
	if (sourceIdx === -1 || targetIdx === -1) return [];
	const [lo, hi] = sourceIdx < targetIdx ? [sourceIdx, targetIdx] : [targetIdx, sourceIdx];
	const baseStart = shiftStartSecAbs();
	let offsetSec = baseStart - props.startTimeSec;
	if (offsetSec < 0) offsetSec += 86_400;
	const leftWithinRow = (offsetSec / 3600) * props.columnWidth;
	const widthPx = ((props.shift.durationSec ?? 0) / 3600) * props.columnWidth;
	const ghosts: Array<Record<string, string>> = [];
	for (let i = lo; i <= hi; i++) {
		const row = allRows[i];
		if (row === sourceRow) continue;
		const body = row.querySelector(
			'[data-slot="schedule-timeline-day-row-body"]',
		) as HTMLElement | null;
		if (!body) continue;
		const bodyRect = body.getBoundingClientRect();
		ghosts.push({
			left: `${bodyRect.left + leftWithinRow}px`,
			top: `${bodyRect.top + TOP_PADDING}px`,
			width: `${Math.max(widthPx, 20)}px`,
			height: `${CARD_HEIGHT}px`,
			zIndex: '40',
		});
	}
	return ghosts;
});

// Horizontal anchor for the toolbar slot wrapper, in percent of the shift
// card's width.
// 1. Segment active on this shift → anchor at the segment's centre (same
//    math TimeRangeBar uses for `activeSegmentStyle`).
// 2. Shift selected with a recorded click offset → anchor at the click x
//    (mirrors `barClickOffsetPct` in the shift editor).
// 3. Otherwise centre under the bar (50 %).
const toolbarLeftPct = computed<number>(() => {
	const segId = props.activeSegmentId;
	const totalDur = effectiveDurationSec.value;
	if (segId && totalDur > 0) {
		const prefix = `${props.shift.id}-child-`;
		if (segId.startsWith(prefix)) {
			const idx = Number(segId.slice(prefix.length));
			const child = effectiveShiftForSegments.value.children?.[idx];
			if (child) {
				return ((child.offsetSec + child.durationSec / 2) / totalDur) * 100;
			}
		}
	}
	if (clickOffsetSec.value !== null && totalDur > 0) {
		return (clickOffsetSec.value / totalDur) * 100;
	}
	return 50;
});

// Suppress the hover popup whenever the timeline has any selection. The
// owner-shift case (this shift selected, or active segment belongs to it)
// is the obvious one — the inline toolbar is the source of truth there. We
// also suppress on every *other* shift in the timeline while any selection
// exists, so the user's attention stays on the selected item instead of
// being pulled around by competing hover popovers.
//
// Note: Reka's `HoverCard` `open` prop is documented as initial state
// only, so binding it doesn't force-close the popup mid-life. We gate
// `HoverCardContent` with `v-if` on this flag instead — the trigger keeps
// working for the default (non-selected) path, the content is just
// removed from the tree when suppression is in effect.
const hoverSuppressed = computed<boolean>(() => {
	if (props.selected) return true;
	if (props.activeSegmentId?.startsWith(`${props.shift.id}-child-`)) return true;
	if (props.hasAnySelection) return true;
	return false;
});

const shiftStyle = computed<CSSProperties>(() => {
	const time = props.shift.time;
	const baselineDuration = props.shift.durationSec;
	if (!time || !baselineDuration) return {};
	if (!Number.isFinite(parseHHMMToSec(time))) return {};

	let offsetSec = effectiveStartSec.value - props.startTimeSec;
	if (offsetSec < 0) offsetSec += 86_400;
	const left = (offsetSec / 3600) * props.columnWidth;
	const width = (effectiveDurationSec.value / 3600) * props.columnWidth;
	// Vertical drag offset — applied only mid move-drag so the card visually
	// "lifts off" and tracks the pointer across rows. The card stays
	// anchored to its row's relative div (so left/width math still works on
	// the same hour grid), but `top` follows the pointer's Y delta until
	// pointer-up. Row clipping is the day view's `overflow-hidden`, so the
	// card stays visible within the scroll body's bounds.
	const yOffset = dragPreview.value?.yOffsetPx ?? 0;
	const top = TOP_PADDING + layer.value * (CARD_HEIGHT + CARD_SPACING) + yOffset;
	const style: CSSProperties = {
		position: 'absolute',
		left: `${left}px`,
		width: `${Math.max(width, 20)}px`,
		top: `${top}px`,
		height: `${CARD_HEIGHT}px`,
	};
	// During an in-flight drag the lifted card is under the pointer; that
	// makes `document.elementFromPoint` return the card itself, not the
	// row beneath, and the hit-test for target-row resolution sees only
	// the source row. Disable pointer events on the wrapper so the cursor
	// passes through to the row under it. Document-level pointermove /
	// pointerup listeners keep firing regardless.
	if (dragPreview.value) {
		style.pointerEvents = 'none';
	}
	// Lift only the shift that is actually showing a toolbar. Using
	// `props.activeSegmentId` here was a bug: it's the page-wide value
	// passed to every shift, so any active segment lifted *every* wrapper
	// to the same `z=9`, they all tied, and the later DOM sibling
	// repainted over the selected one's toolbar. `selected` is per-shift
	// (true only for the actual single-selected one) and `onShiftSegmentSelect`
	// always promotes the shift to selected before setting the active
	// segment, so checking selection alone covers both cases.
	if (dragPreview.value !== null) {
		style.zIndex = String(Z.shiftDragging);
	} else if (props.selected) {
		style.zIndex = String(Z.shiftToolbar);
	}
	return style;
});

const visibleChildren = computed<ScheduleTimelineShiftChild[]>(
	() => props.shift.children?.filter((c) => c.type !== 'gap') ?? [],
);

const gapChildren = computed<ScheduleTimelineShiftChild[]>(
	() => props.shift.children?.filter((c) => c.type === 'gap') ?? [],
);

// Combined inline style for the card. Folds in the gap-mask (the
// existing "cut" effect for off-time gaps) AND a desaturating filter
// when the shift is locked so the entire bar reads as dimmer/muted.
// Keeps `gapMaskStyle` standalone too because the read-only timeline
// view still consumes it.
const cardStyle = computed<CSSProperties>(() => {
	const style: CSSProperties = { ...(gapMaskStyle.value ?? {}) };
	if (props.shift.isLocked) {
		style.filter = 'saturate(0.35)';
	}
	return style;
});

// 4 px diagonal-stripe pattern at ~12 % black. Subtle enough to leave
// the bar's variant colour readable, distinctive enough to register as
// "this is locked" at a glance. Plain rgba so we don't need to thread
// theme tokens through an alpha-channel oklch().
const lockedStripeStyle = computed<CSSProperties>(() => ({
	backgroundImage: 'repeating-linear-gradient(45deg, rgba(0,0,0,0.12) 0 4px, transparent 4px 8px)',
}));

const gapMaskStyle = computed<CSSProperties | undefined>(() => {
	const gaps = gapChildren.value;
	if (!gaps.length || !props.shift.durationSec) return undefined;
	const parentDuration = props.shift.durationSec;
	const sorted = [...gaps].sort((a, b) => a.offsetSec - b.offsetSec);
	const feather = 0.15;
	const stops: string[] = [];
	let lastEnd = 0;
	// Stops must be monotonically non-decreasing and in [0, 100]; clamp both
	// sides so feather overshoot or a gap starting at offsetSec=0 (which
	// would produce a negative stop) doesn't yield an invalid gradient.
	for (const gap of sorted) {
		const gapStart = (gap.offsetSec / parentDuration) * 100;
		const gapEnd = ((gap.offsetSec + gap.durationSec) / parentDuration) * 100;
		const blackEnd = Math.max(lastEnd, Math.min(100, gapStart - feather));
		const transStart = Math.max(blackEnd, Math.min(100, gapStart + feather));
		const transEnd = Math.max(transStart, Math.min(100, gapEnd - feather));
		stops.push(`black ${lastEnd}%`, `black ${blackEnd}%`);
		stops.push(`transparent ${transStart}%`, `transparent ${transEnd}%`);
		lastEnd = Math.max(transEnd, Math.min(100, gapEnd + feather));
	}
	stops.push(`black ${lastEnd}%`, `black 100%`);
	const gradient = `linear-gradient(to right, ${stops.join(', ')})`;
	return { maskImage: gradient, WebkitMaskImage: gradient };
});

const gapEdges = computed<{ key: string; left: string }[]>(() => {
	const gaps = gapChildren.value;
	if (!gaps.length || !props.shift.durationSec) return [];
	const edges: { key: string; left: string }[] = [];
	// Key by child index so two gaps with the same offsetSec don't collide.
	for (let i = 0; i < gaps.length; i++) {
		const gap = gaps[i];
		const startPct = (gap.offsetSec / props.shift.durationSec) * 100;
		const endPct = ((gap.offsetSec + gap.durationSec) / props.shift.durationSec) * 100;
		edges.push({ key: `${i}-s`, left: `${startPct}%` });
		edges.push({ key: `${i}-e`, left: `${endPct}%` });
	}
	return edges;
});

const effectiveDurationLabel = computed<string>(() => {
	if (!props.shift.durationSec) return '';
	const gapSec = gapChildren.value.reduce((s, c) => s + c.durationSec, 0);
	return formatShiftDuration(props.shift.durationSec - gapSec);
});

const shiftEndTime = computed<string>(() => {
	if (!props.shift.time || !props.shift.durationSec) return '';
	return ForgeTime.endTime(props.shift.time, props.shift.durationSec);
});

function childTimeRange(child: ScheduleTimelineShiftChild): string {
	const parentStartSec = parseHHMMToSec(props.shift.time);
	if (!Number.isFinite(parentStartSec)) return '';
	return ForgeTime.formatSecRange(
		parentStartSec + child.offsetSec,
		parentStartSec + child.offsetSec + child.durationSec,
	);
}

function childStyle(child: ScheduleTimelineShiftChild): CSSProperties {
	const parentDurationSec = props.shift.durationSec ?? 0;
	if (parentDurationSec <= 0) return {};
	const leftPct = (child.offsetSec / parentDurationSec) * 100;
	const widthPct = (child.durationSec / parentDurationSec) * 100;
	return { left: `${leftPct}%`, width: `${widthPct}%` };
}

const childPills = computed<{ label: string; variant: ScheduleTimelineShiftVariant }[]>(() => {
	const seen = new Set<string>();
	const pills: { label: string; variant: ScheduleTimelineShiftVariant }[] = [];
	for (const child of props.shift.children ?? []) {
		if (child.type === 'gap') continue;
		if (seen.has(child.type)) continue;
		seen.add(child.type);
		pills.push({ label: child.label ?? child.type, variant: child.variant });
	}
	return pills;
});

function onContextMenu(e: MouseEvent) {
	// Stop bubbling so the row's outer onClick doesn't also fire on right-click.
	e.stopPropagation();
	emit('contextmenu', {
		e,
		shiftId: props.shift.id,
		employeeId: props.employeeId,
		meta: props.shift.meta,
	});
}

function onClick(e: MouseEvent) {
	// Shift-level interaction; don't bubble to the row.
	e.stopPropagation();
	// If we just finished a drag, swallow the click — the drag already
	// committed via `move` and we don't want it to double as a select.
	if (justFinishedDrag.value) {
		justFinishedDrag.value = false;
		return;
	}
	emit('click-internal', { e, shift: props.shift, employeeId: props.employeeId });
}

// ── Drag-to-move / -resize (wrapper-level) ──────────────────────────────────
// Move + edge-resize both live at the day-shift level (not inside
// `TimeRangeBar`) because only the wrapper knows the parent timeline's
// `columnWidth` — the hour-grid px/sec ratio that the inner bar's
// 0-anchored axis can't see. During drag we update the card's `left` /
// `width` directly (via `shiftStyle`), and we also feed the live duration
// + re-anchored children into the inner bar so segments stay glued to
// their wall-clock position rather than redistributing inside a
// changing-size container. On pointer-up we emit `move` or `resize` with
// absolute wall-clock values and clear the preview.

// 5 px before we treat pointer-down as the start of a drag rather than a
// click. Anything smaller fires too eagerly on a steady finger.
const DRAG_THRESHOLD_PX = 5;
// Floor for edge-resize so a user can't crush a shift to zero width by
// accident. Matches `TimeRangeBar.minDurationSec` for consistency.
const MIN_DURATION_SEC = 1800;

type DragKind = 'move' | 'resize-start' | 'resize-end';

interface ShiftDragState {
	kind: DragKind;
	startClientX: number;
	/**
	 * Pointer's original client-Y, plus the wrapper's original viewport
	 * top, so a move-drag can lift the card vertically and track the
	 * pointer across rows. Vertical drag is move-kind only; edge-resize
	 * ignores Y.
	 */
	startClientY: number;
	originalWrapperTopPx: number;
	originalStartSec: number;
	originalDurationSec: number;
	originalChildren: ScheduleTimelineShiftChild[];
	pointerId: number;
	/** True once movement crossed `DRAG_THRESHOLD_PX` — gate emits until then. */
	hasMoved: boolean;
	/**
	 * Dominant-axis lock decided on the first significant move-drag tick.
	 * `'x'` = horizontal time-nudge only (no row change, no vertical lift).
	 * `'y'` = vertical row-reassign only (no time change). `null` for
	 * resize-edge drags — those are always horizontal. Decided once and
	 * never re-evaluated, so the user can't accidentally "ratchet" between
	 * axes mid-drag by zig-zagging.
	 */
	axis: 'x' | 'y' | null;
}

let dragState: ShiftDragState | null = null;
// Reactive mirror of `dragState.kind` so the template can light up the
// matching edge handle while a drag is in flight (the pointer may wander
// off the 8 px zone, and CSS :hover alone can't hold the visual).
const activeDragKind = ref<DragKind | null>(null);
const justFinishedDrag = ref(false);

function onWrapperPointerDown(e: PointerEvent) {
	if (!isInteractive.value) return;
	if (e.button !== 0) return;
	// Segment drags stop propagation inside `useSegmentDrag`. If the event
	// bubbles up here, the pointer is on the card body or one of our edge
	// hit-zones — never on a segment.
	const target = e.target as HTMLElement | null;
	if (target?.closest('[data-segment]')) return;

	const edgeAttr = target?.closest('[data-shift-edge]')?.getAttribute('data-shift-edge');
	const kind: DragKind =
		edgeAttr === 'start' ? 'resize-start' : edgeAttr === 'end' ? 'resize-end' : 'move';

	const wrapperRect = wrapperRef.value?.getBoundingClientRect();
	dragState = {
		kind,
		startClientX: e.clientX,
		startClientY: e.clientY,
		originalWrapperTopPx: wrapperRect?.top ?? 0,
		originalStartSec: shiftStartSecAbs(),
		originalDurationSec: props.shift.durationSec ?? 0,
		originalChildren: props.shift.children ?? [],
		pointerId: e.pointerId,
		hasMoved: false,
		// Resize-edge drags are always horizontal; move drags decide their
		// axis lock on the first significant move tick.
		axis: kind === 'move' ? null : 'x',
	};
	activeDragKind.value = kind;
	document.addEventListener('pointermove', onWrapperPointerMove);
	document.addEventListener('pointerup', onWrapperPointerUp);
}

function onWrapperPointerMove(e: PointerEvent) {
	if (!dragState) return;
	const dxPx = e.clientX - dragState.startClientX;
	const dyPx = e.clientY - dragState.startClientY;
	if (
		!dragState.hasMoved &&
		Math.abs(dxPx) < DRAG_THRESHOLD_PX &&
		Math.abs(dyPx) < DRAG_THRESHOLD_PX
	) {
		return;
	}
	dragState.hasMoved = true;
	// Decide the axis lock on the first significant tick. Whichever axis
	// dominated the initial movement wins, and the drag stays on that
	// axis for the rest of the gesture — no free-form diagonal drag.
	if (dragState.kind === 'move' && dragState.axis === null) {
		dragState.axis = Math.abs(dxPx) > Math.abs(dyPx) ? 'x' : 'y';
	}

	// 1 hour of time === `columnWidth` px on the parent grid, so seconds-per-px
	// is `3600 / columnWidth`. Snap to `snapSec` to stay on the grid.
	const snap = Math.max(1, props.snapSec);
	const rawDeltaSec = (dxPx / props.columnWidth) * 3600;
	let deltaSec = Math.round(rawDeltaSec / snap) * snap;

	const { kind, axis, originalStartSec, originalDurationSec, originalChildren } = dragState;

	if (kind === 'move') {
		// X-axis lock: classic time nudge along the same row. Suppress the
		// vertical lift entirely and pin the target row to the current row
		// so the pointer-up handler emits `move`, not `reassign`.
		if (axis === 'x') {
			const minDelta = -originalStartSec;
			const maxDelta = 86_400 - originalDurationSec - originalStartSec;
			deltaSec = Math.max(minDelta, Math.min(maxDelta, deltaSec));
			dragPreview.value = {
				startSec: originalStartSec + deltaSec,
				durationSec: originalDurationSec,
				children: originalChildren,
				yOffsetPx: 0,
				targetEmployeeId: props.employeeId,
				targetDateStr: props.dateStr,
			};
			return;
		}

		// Y-axis lock: row reassign. Time stays at the original start (no X
		// nudge piggybacks); the card lifts and tracks the pointer until
		// pointer-up. Hit-test the row under the cursor each tick so the
		// commit handler knows the target, and capture the row's body
		// element so we can paint a "landing here" ghost.
		let targetEmployeeId: string | null = props.employeeId;
		let targetDateStr: string | null = props.dateStr;
		let targetRowBodyEl: HTMLElement | null = null;
		const hit = document.elementFromPoint(e.clientX, e.clientY);
		const rowEl = hit?.closest(
			'[data-slot="schedule-timeline-employee-row"]',
		) as HTMLElement | null;
		if (rowEl?.dataset.employeeId) {
			targetEmployeeId = rowEl.dataset.employeeId;
			if (rowEl.dataset.date) targetDateStr = rowEl.dataset.date;
			// Body is the relative-positioned sibling next to the sticky
			// employee cell. The row stamps a known data-slot on it so we
			// don't have to guess the DOM shape.
			targetRowBodyEl = rowEl.querySelector(
				'[data-slot="schedule-timeline-day-row-body"]',
			) as HTMLElement | null;
		}
		// No landing-ghost for the source row — the lifted card itself
		// already shows the candidate position there.
		const sameRow = targetEmployeeId === props.employeeId && targetDateStr === props.dateStr;
		dragPreview.value = {
			startSec: originalStartSec,
			durationSec: originalDurationSec,
			children: originalChildren,
			yOffsetPx: dyPx,
			targetEmployeeId,
			targetDateStr,
			targetRowBodyEl: sameRow ? null : targetRowBodyEl,
		};
		return;
	}

	if (kind === 'resize-start') {
		// Left-edge drag. Positive dx → bar shrinks from the left, start moves
		// right; negative dx → bar grows leftward. Children re-anchor so they
		// hold their wall-clock position relative to the day grid (offsetSec is
		// measured from the new start, so it shifts by `-deltaSec`).
		//
		// We intentionally DON'T filter out children whose new offset would
		// fall outside [0, newDuration]. `shiftChildrenToSegments` keys
		// segments by their index in the children array, so dropping any child
		// shifts every later segment's id and Vue mutates DOM nodes in place
		// with the wrong content — the user reads this as "all segments
		// repainting" when a break crosses the bar edge. The bar's
		// `overflow-hidden` clips out-of-range segments visually for free,
		// and `onWrapperPointerUp` filters before emitting so the consumer
		// never persists out-of-range offsets.
		const minDelta = -originalStartSec;
		const maxDelta = originalDurationSec - MIN_DURATION_SEC;
		deltaSec = Math.max(minDelta, Math.min(maxDelta, deltaSec));
		const newStart = originalStartSec + deltaSec;
		const newDuration = originalDurationSec - deltaSec;
		const adjustedChildren = originalChildren.map((c) => ({
			...c,
			offsetSec: c.offsetSec - deltaSec,
		}));
		dragPreview.value = {
			startSec: newStart,
			durationSec: newDuration,
			children: adjustedChildren,
		};
		return;
	}

	// 'resize-end': right-edge drag. Start stays put; only duration changes.
	// Children's offsetSec is relative to the (unchanged) start so it stays
	// identical — pass `originalChildren` straight through. Stable indices,
	// no remount churn near the edge.
	const minDelta = MIN_DURATION_SEC - originalDurationSec;
	const maxDelta = 86_400 - originalStartSec - originalDurationSec;
	deltaSec = Math.max(minDelta, Math.min(maxDelta, deltaSec));
	const newDuration = originalDurationSec + deltaSec;
	dragPreview.value = {
		startSec: originalStartSec,
		durationSec: newDuration,
		children: originalChildren,
	};
}

function onWrapperPointerUp() {
	document.removeEventListener('pointermove', onWrapperPointerMove);
	document.removeEventListener('pointerup', onWrapperPointerUp);

	const state = dragState;
	dragState = null;
	activeDragKind.value = null;
	const preview = dragPreview.value;
	dragPreview.value = null;

	if (!state || !state.hasMoved || !preview) return;

	// Cross-row drop: the pointer ended over a different employee row (or
	// different date in multi-day views). The consumer interprets this as
	// delete-here + create-there, so the time component piggy-backs on the
	// same payload — a vertical drag with a horizontal nudge re-places the
	// shift at the dragged time as well.
	const targetEmp = preview.targetEmployeeId ?? props.employeeId;
	const targetDate = preview.targetDateStr ?? props.dateStr;
	const movedRow = targetEmp !== props.employeeId || targetDate !== props.dateStr;

	if (
		!movedRow &&
		preview.startSec === state.originalStartSec &&
		preview.durationSec === state.originalDurationSec
	) {
		return;
	}

	justFinishedDrag.value = true;

	if (state.kind === 'move' && movedRow) {
		emit('reassign', {
			shiftId: props.shift.id,
			fromEmployeeId: props.employeeId,
			fromDateStr: props.dateStr,
			toEmployeeId: targetEmp,
			toDateStr: targetDate,
			startTimeSec: preview.startSec,
		});
		return;
	}

	if (state.kind === 'move') {
		emit('move', {
			shiftId: props.shift.id,
			employeeId: props.employeeId,
			dateStr: props.dateStr,
			startTimeSec: preview.startSec,
		});
		return;
	}
	// Filter at commit: the preview keeps every child in the array (so
	// segment indices stay stable and Vue doesn't shuffle DOM nodes), but
	// the consumer expects an array that fits inside the new bar window.
	const cleanChildren = preview.children.filter(
		(c) => c.offsetSec >= 0 && c.offsetSec + c.durationSec <= preview.durationSec,
	);
	emit('resize', {
		shiftId: props.shift.id,
		employeeId: props.employeeId,
		dateStr: props.dateStr,
		startTimeSec: preview.startSec,
		durationSec: preview.durationSec,
		children: cleanChildren,
	});
}

function onKeydown(e: KeyboardEvent) {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	e.preventDefault();
	e.stopPropagation();
	if (e.shiftKey || e.metaKey || e.ctrlKey) {
		emit('keyboard-select', props.shift.id);
		return;
	}
	const synthetic = new MouseEvent('click', { bubbles: false, clientX: 0, clientY: 0 });
	emit('click-internal', { e: synthetic, shift: props.shift, employeeId: props.employeeId });
}

// ── Drag-to-fill (Excel-style) ──────────────────────────────────────────────
// Pointer-down on the bottom-right fill handle starts a vertical
// drag that paints a landing ghost on the row under the cursor each
// tick and, on release, emits `fill` so the page can clone this shift
// into every editable row from the source down (or up) to the target.
//
// We keep this drag separate from the wrapper move/reassign drag so
// the axis-lock logic doesn't interfere — fill is always Y-axis-only,
// and we don't want it to spawn `move` or `reassign` events.

interface FillDragState {
	pointerId: number;
	hasMoved: boolean;
}
let fillDragState: FillDragState | null = null;
const fillTargetEmployeeId = ref<string | null>(null);
const fillTargetRowBodyEl = ref<HTMLElement | null>(null);

// Bump `tooltipTick` when the fill target changes so the ghost-style
// computeds (which read `tooltipTick` to force a `getBoundingClientRect`
// recompute on each pointer tick) re-evaluate. Kept as a separate
// `watch` here — not folded into the earlier drag-preview watch — so
// the source `fillTargetEmployeeId` is declared before the watcher's
// closure references it (avoids a TDZ ReferenceError at setup time).
watch(fillTargetEmployeeId, async () => {
	await nextTick();
	tooltipTick.value++;
});

function onFillHandlePointerDown(e: PointerEvent) {
	if (!isInteractive.value) return;
	if (e.button !== 0) return;
	e.preventDefault();
	e.stopPropagation();
	fillDragState = { pointerId: e.pointerId, hasMoved: false };
	document.addEventListener('pointermove', onFillPointerMove);
	document.addEventListener('pointerup', onFillPointerUp);
}

function onFillPointerMove(e: PointerEvent) {
	if (!fillDragState) return;
	fillDragState.hasMoved = true;
	const hit = document.elementFromPoint(e.clientX, e.clientY);
	const rowEl = hit?.closest('[data-slot="schedule-timeline-employee-row"]') as HTMLElement | null;
	if (rowEl?.dataset.employeeId) {
		fillTargetEmployeeId.value = rowEl.dataset.employeeId;
		fillTargetRowBodyEl.value = rowEl.querySelector(
			'[data-slot="schedule-timeline-day-row-body"]',
		) as HTMLElement | null;
	} else {
		fillTargetEmployeeId.value = null;
		fillTargetRowBodyEl.value = null;
	}
}

function onFillPointerUp(e: PointerEvent) {
	document.removeEventListener('pointermove', onFillPointerMove);
	document.removeEventListener('pointerup', onFillPointerUp);
	const state = fillDragState;
	const targetEmp = fillTargetEmployeeId.value;
	fillDragState = null;
	fillTargetEmployeeId.value = null;
	fillTargetRowBodyEl.value = null;
	if (!state || !state.hasMoved || !targetEmp) return;
	// No-op when the user releases over the source row — fill needs a
	// direction (up or down) to make sense.
	if (targetEmp === props.employeeId) return;
	emit('fill', {
		shiftId: props.shift.id,
		fromEmployeeId: props.employeeId,
		toEmployeeId: targetEmp,
		dateStr: props.dateStr,
		altKey: e.altKey,
	});
}

function onChildHoverEnter(ci: number, child: ScheduleTimelineShiftChild) {
	emit('child-hover-enter', {
		shiftId: props.shift.id,
		employeeId: props.employeeId,
		ci,
		child,
	});
}

function onChildHoverLeave() {
	emit('child-hover-leave');
}

// Edit-mode forwarders. The inner TimeRangeBar uses a zero-anchored time
// axis (startTimeSec=0), so its emitted `startTimeSec` is an offset *within*
// the shift's own duration. Day-view shifts are positioned against the
// row's hour axis, so we translate back to wall-clock seconds before
// emitting upward.

function shiftStartSecAbs(): number {
	const sec = parseHHMMToSec(props.shift.time);
	return Number.isFinite(sec) ? sec : 0;
}

function onInnerSegmentUpdate(e: { segmentId: string; offsetSec: number; durationSec: number }) {
	emit('segment-update', {
		shiftId: props.shift.id,
		employeeId: props.employeeId,
		dateStr: props.dateStr,
		segmentId: e.segmentId,
		offsetSec: e.offsetSec,
		durationSec: e.durationSec,
	});
}

function onInnerSegmentSelect(id: string | null) {
	emit('segment-select', {
		shiftId: props.shift.id,
		employeeId: props.employeeId,
		dateStr: props.dateStr,
		segmentId: id,
	});
}

const ariaLabel = computed(() => `${props.shift.name} ${props.shift.timeRange}`.trim());

const slotScope = computed(() => ({
	// Slot consumers (per-shift toolbar) see the **committed** shift — same
	// reference as `props.shift`. Live drag previews stay internal to the
	// card (bar visualisation + the floating tooltip handle that). Mirrors
	// the shift editor: its `#toolbar` slot also reads from committed
	// children, not from in-flight drag state.
	shift: props.shift,
	shifts: props.shifts,
	idx: props.idx,
	dateStr: props.dateStr,
	employeeId: props.employeeId,
	style: shiftStyle.value,
	dataAttrs: {
		'data-shift-block': '',
		'data-shift-id': props.shift.id,
		'data-employee-id': props.employeeId,
		'data-date': props.dateStr,
	},
	ariaLabel: ariaLabel.value,
	selected: props.selected,
	editable: props.editable,
	activeSegmentId: props.activeSegmentId,
}));
</script>
