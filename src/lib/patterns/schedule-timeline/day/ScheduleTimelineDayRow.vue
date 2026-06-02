<template>
	<div
		data-slot="schedule-timeline-employee-row"
		:data-employee-id="row.employee.id"
		:data-date="dateStr"
		:class="[
			'flex items-stretch border-b border-border/60 hover:bg-row-hover transition-colors w-fit',
			extraClass,
		]"
		:style="{ minHeight: `${rowHeight}px` }"
	>
		<div
			data-slot="schedule-timeline-employee-cell"
			role="button"
			tabindex="0"
			:aria-label="row.employee.name"
			class="sticky left-0 flex-shrink-0 flex items-center gap-2.5 bg-background border-r border-border/60 px-3 py-2 hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			:style="{
				width: `${employeeColumnWidth}px`,
				minWidth: `${employeeColumnWidth}px`,
				zIndex: Z.departmentHeaderSticky,
			}"
			@click="onRowClick"
			@keydown="onCellKeydown"
		>
			<Avatar
				:src="row.employee.avatarUrl"
				:name="row.employee.name"
				size="sm"
				class="flex-shrink-0"
			/>
			<div class="flex flex-col min-w-0 flex-1">
				<div class="flex items-center gap-1.5">
					<span class="text-sm font-medium text-foreground truncate leading-tight">
						{{ row.employee.name }}
					</span>
					<!-- Row-level conflict indicator: yellow triangle when any
               shift on this row is in the page's `conflictSet`. The
               per-shift outline already paints the conflicting cards;
               this is the row-level glance so the user spots the row
               even when scrolled away horizontally from the conflicting
               shifts. Inlined (rather than a script-side computed) so
               an HMR template-only refresh can't end up referencing a
               stale instance proxy. -->
					<AlertTriangle
						v-if="shifts.some((s) => conflictSet?.has(s.id))"
						class="size-3.5 flex-shrink-0 text-amber-500"
						aria-label="Row contains conflicting shifts"
					/>
				</div>
				<ScheduleTimelineEmployeeMeta :employee="row.employee" />
			</div>
		</div>
		<div
			ref="rowBodyRef"
			data-slot="schedule-timeline-day-row-body"
			class="relative"
			:class="editable ? 'cursor-crosshair' : ''"
			:style="{ width: `${totalWidth}px`, minWidth: `${totalWidth}px` }"
			@pointerdown="onBodyPointerDown"
			@click="onBodyClick"
		>
			<div class="absolute inset-0 flex pointer-events-none">
				<div
					v-for="i in totalColumns"
					:key="i"
					class="h-full border-r border-border/40 flex-shrink-0"
					:style="{ width: `${columnWidth}px` }"
				/>
			</div>
			<!-- Drag-to-create preview: a translucent ghost rendered in the
           same px space as real shift cards. Only visible while the user
           is dragging out a new range. The committing path emits
           `shift-create` on pointer-up. -->
			<div
				v-if="createPreview"
				class="absolute pointer-events-none rounded-md border border-dashed border-primary bg-primary/15"
				:style="{
					left: `${createPreview.leftPx}px`,
					width: `${createPreview.widthPx}px`,
					top: `4px`,
					height: '40px',
				}"
			></div>
			<ScheduleTimelineDayShift
				v-for="(shift, idx) in shifts"
				:key="shift.id"
				:shift="shift"
				:shifts="shifts"
				:idx="idx"
				:lane="lanesByShift.get(shift.id) ?? 0"
				:total-columns="totalColumns"
				:total-width="totalWidth"
				:column-width="columnWidth"
				:start-time-sec="startTimeSec"
				:stack-overlaps="stackOverlaps"
				:employee-id="row.employee.id"
				:date-str="dateStr"
				:selected="props.selectedSet?.has(shift.id) ?? false"
				:has-any-selection="hasAnySelection"
				:has-conflict="props.conflictSet?.has(shift.id) ?? false"
				:formatted-date="formattedDate"
				:editable="editable"
				:active-segment-id="activeSegmentId"
				@contextmenu="(p) => emit('shift-contextmenu', p)"
				@click-internal="(p) => emit('shift-click-internal', p)"
				@keyboard-select="(id) => emit('shift-select', id)"
				@child-hover-enter="(p) => emit('child-hover-enter', p)"
				@child-hover-leave="emit('child-hover-leave')"
				@resize="(p) => emit('shift-resize', p)"
				@move="(p) => emit('shift-move', p)"
				@reassign="(p) => emit('shift-reassign', p)"
				@fill="(p) => emit('shift-fill', p)"
				@segment-update="(p) => emit('shift-segment-update', p)"
				@segment-select="(p) => emit('shift-segment-select', p)"
				@bar-click="(p) => emit('shift-bar-click', p)"
			>
				<template v-if="$slots['shift-wrapper']" #default="slotProps">
					<slot name="shift-wrapper" v-bind="slotProps" />
				</template>
				<template v-if="$slots['shift-toolbar']" #shift-toolbar="slotProps">
					<slot name="shift-toolbar" v-bind="slotProps" />
				</template>
			</ScheduleTimelineDayShift>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import type { ClassValue } from 'clsx';
import Avatar from '../../../general/avatar/Avatar.vue';
import ScheduleTimelineEmployeeMeta from '../shared/ScheduleTimelineEmployeeMeta.vue';
import ScheduleTimelineDayShift from './ScheduleTimelineDayShift.vue';
import type {
	ScheduleTimelineEmployeeRow as ScheduleTimelineEmployeeRowData,
	ScheduleTimelineShift,
	ScheduleTimelineShiftChild,
	ShiftResizeEvent,
	ShiftMoveEvent,
	ShiftSegmentUpdateEvent,
	ShiftSegmentSelectEvent,
	ShiftBarClickEvent,
} from '../schedule-timeline';
import { computeShiftLanes, computeStackedRowHeight, ScheduleTimelineZ as Z } from '../utils';
import { AlertTriangle } from '@lucide/vue';

const MIN_ROW_HEIGHT = 56;

const props = withDefaults(
	defineProps<{
		row: ScheduleTimelineEmployeeRowData;
		dateStr: string;
		totalColumns: number;
		totalWidth: number;
		columnWidth: number;
		employeeColumnWidth: number;
		startTimeSec: number;
		stackOverlaps: boolean;
		/** Pre-computed selection set (lifted from the view) so each row doesn't
		 *  rebuild it from `selectedIds`. */
		selectedSet?: Set<string>;
		/** Pre-computed conflict set — same lift-from-the-view pattern. */
		conflictSet?: Set<string>;
		rowClass?: (row: ScheduleTimelineEmployeeRowData) => ClassValue;
		formattedDate: string;
		/** Forward edit mode to each shift card. */
		editable?: boolean;
		/** Forward the active segment id to each shift card. */
		activeSegmentId?: string | null;
	}>(),
	{
		stackOverlaps: false,
		editable: false,
		activeSegmentId: undefined,
	},
);

const emit = defineEmits<{
	'employee-click': [employeeId: string, event: MouseEvent | KeyboardEvent];
	'shift-contextmenu': [
		payload: {
			e: MouseEvent;
			shiftId: string;
			employeeId: string;
			meta?: Record<string, unknown>;
		},
	];
	'shift-click-internal': [
		payload: { e: MouseEvent; shift: ScheduleTimelineShift; employeeId: string },
	];
	'shift-select': [shiftId: string];
	'child-hover-enter': [
		payload: {
			shiftId: string;
			employeeId: string;
			ci: number;
			child: ScheduleTimelineShiftChild;
		},
	];
	'child-hover-leave': [];
	'shift-resize': [payload: ShiftResizeEvent];
	'shift-move': [payload: ShiftMoveEvent];
	'shift-reassign': [
		payload: {
			shiftId: string;
			fromEmployeeId: string;
			fromDateStr: string;
			toEmployeeId: string;
			toDateStr: string;
			startTimeSec: number;
		},
	];
	'shift-fill': [
		payload: {
			shiftId: string;
			fromEmployeeId: string;
			toEmployeeId: string;
			dateStr: string;
			altKey: boolean;
		},
	];
	/**
	 * Edit-mode: the user clicked an empty patch of this row's hour
	 * grid. `additive` / `range` mirror the chord semantics used for
	 * shift clicks (Cmd / Ctrl → toggle, Shift → range). Doesn't fire
	 * on shift-card clicks or on drag-creates.
	 */
	'row-focus': [
		payload: {
			employeeId: string;
			dateStr: string;
			additive: boolean;
			range: boolean;
		},
	];
	'shift-segment-update': [payload: ShiftSegmentUpdateEvent];
	'shift-segment-select': [payload: ShiftSegmentSelectEvent];
	'shift-bar-click': [payload: ShiftBarClickEvent];
	/**
	 * Edit-mode: the user dragged out a new range on this row's hour
	 * axis. Fires once on pointer-up if the drag covered enough distance
	 * to read as intentional. The consumer is responsible for creating
	 * the shift (e.g., via `useScheduleEdits.addShift`). The pattern
	 * doesn't materialise it itself.
	 */
	'shift-create': [
		payload: { employeeId: string; dateStr: string; startTimeSec: number; durationSec: number },
	];
}>();

// Day view positions cards by `time` + `durationSec`. A shift missing either
// can't be placed and would otherwise render as an `(0,0)` absolute box
// overlapping the sticky employee cell — drop it here.
const shifts = computed<ScheduleTimelineShift[]>(() => {
	const all = props.row.days[props.dateStr]?.shifts ?? [];
	return all.filter((s) => !!s.time && !!s.durationSec);
});

const extraClass = computed(() => (props.rowClass ? props.rowClass(props.row) : undefined));

// Suppress hover popups on every shift in the timeline while any selection
// is active. We compute this once per row from the pre-lifted `selectedSet`
// plus the active segment id and forward the boolean to each shift card,
// rather than have each card re-derive it. Selection-owner shifts are
// already covered by `selected` / `activeSegmentId`; this flag covers the
// rest.
const hasAnySelection = computed<boolean>(
	() => (props.selectedSet?.size ?? 0) > 0 || !!props.activeSegmentId,
);

// Single source of truth for lane assignment within a row: drives both
// row height and each shift card's vertical placement, avoiding the
// O(N²) recompute that a per-shift `computeShiftLanes` causes.
const laneInfo = computed(() => {
	if (shifts.value.length === 0 || !props.stackOverlaps) {
		return { lanes: new Map<string, number>(), layers: 0 };
	}
	return computeShiftLanes(shifts.value);
});

const lanesByShift = computed(() => laneInfo.value.lanes);

const rowHeight = computed<number>(() => {
	if (shifts.value.length === 0 || !props.stackOverlaps) return MIN_ROW_HEIGHT;
	return computeStackedRowHeight(laneInfo.value.layers, MIN_ROW_HEIGHT);
});

function onRowClick(e: MouseEvent) {
	emit('employee-click', props.row.employee.id, e);
}

function onCellKeydown(e: KeyboardEvent) {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	e.preventDefault();
	emit('employee-click', props.row.employee.id, e);
}

// ── Drag-to-create a new shift on the hour axis ─────────────────────────────
// Only active in `editable` mode. The row's relative body div catches
// pointerdown on empty space (clicks on a shift card bail out because the
// card's wrapper sits in front and consumes the event for its own drag
// flow). We track px on `clientX`, project to seconds via `columnWidth`,
// snap to the 5-minute grid, and render a translucent ghost in the same
// space as real cards. `shift-create` only fires once the user crosses
// `DRAG_THRESHOLD_PX` AND the resulting duration clears `MIN_DURATION_SEC`
// — saves us from `clientX-equal` zero-width creates on a stray click.

const rowBodyRef = ref<HTMLElement | null>(null);
const SNAP_SEC = 300; // 5 min — matches `TimeRangeBar.snapSec`.
const DRAG_THRESHOLD_PX = 5;
const MIN_DURATION_SEC = 1800; // 30 min — matches `TimeRangeBar.minDurationSec`.

interface CreateDragState {
	pointerId: number;
	startClientX: number;
	startSecAbs: number;
	hasMoved: boolean;
}
let createDragState: CreateDragState | null = null;
const createPreview = ref<{
	leftPx: number;
	widthPx: number;
	startSec: number;
	durationSec: number;
} | null>(null);

function pxToSec(px: number): number {
	return (px / props.columnWidth) * 3600;
}
function snap(sec: number): number {
	return Math.round(sec / SNAP_SEC) * SNAP_SEC;
}

function onBodyPointerDown(e: PointerEvent) {
	if (!props.editable) return;
	if (e.button !== 0) return;
	// Clicks on a shift card belong to the card (move / resize / select).
	// The data attribute is added by `ScheduleTimelineDayShift`'s wrapper.
	const target = e.target as HTMLElement | null;
	if (target?.closest('[data-shift-block]')) return;
	const body = rowBodyRef.value;
	if (!body) return;
	const rect = body.getBoundingClientRect();
	const offsetPx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
	const startSecAbs = snap(props.startTimeSec + pxToSec(offsetPx));
	createDragState = {
		pointerId: e.pointerId,
		startClientX: e.clientX,
		startSecAbs,
		hasMoved: false,
	};
	document.addEventListener('pointermove', onBodyPointerMove);
	document.addEventListener('pointerup', onBodyPointerUp);
}

function onBodyPointerMove(e: PointerEvent) {
	const state = createDragState;
	if (!state) return;
	if (!state.hasMoved && Math.abs(e.clientX - state.startClientX) < DRAG_THRESHOLD_PX) return;
	state.hasMoved = true;
	const body = rowBodyRef.value;
	if (!body) return;
	const rect = body.getBoundingClientRect();
	const offsetPx = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
	const currentSecAbs = snap(props.startTimeSec + pxToSec(offsetPx));
	const lo = Math.min(state.startSecAbs, currentSecAbs);
	const hi = Math.max(state.startSecAbs, currentSecAbs);
	const durationSec = Math.max(0, hi - lo);
	// Clamp into 24h. `startTimeSec` is the row's window start; the bar
	// axis runs `[startTimeSec, startTimeSec + 24h)`, so the preview can't
	// extend past the visible edge.
	const leftSec = lo - props.startTimeSec;
	const leftPx = (leftSec / 3600) * props.columnWidth;
	const widthPx = (durationSec / 3600) * props.columnWidth;
	createPreview.value = { leftPx, widthPx, startSec: lo, durationSec };
}

// Flag set after a successful create-drag so the synthetic click that
// browsers sometimes fire on pointerup can be swallowed before it reaches
// the page-level body wrapper (whose `@click="clearSelection"` would
// otherwise wipe the freshly-selected new shift).
let justCreated = false;

function onBodyPointerUp() {
	document.removeEventListener('pointermove', onBodyPointerMove);
	document.removeEventListener('pointerup', onBodyPointerUp);
	const state = createDragState;
	const preview = createPreview.value;
	createDragState = null;
	createPreview.value = null;
	if (!state || !state.hasMoved || !preview) return;
	if (preview.durationSec < MIN_DURATION_SEC) return;
	justCreated = true;
	emit('shift-create', {
		employeeId: props.row.employee.id,
		dateStr: props.dateStr,
		startTimeSec: preview.startSec,
		durationSec: preview.durationSec,
	});
}

function onBodyClick(e: MouseEvent) {
	// Swallow the click that follows a drag-create so the page-level
	// body wrapper's `clearSelection` doesn't undo the auto-select.
	if (justCreated) {
		justCreated = false;
		e.stopPropagation();
		return;
	}
	// Empty-row click → tell the page this is the focused row so a
	// follow-up Cmd-V pastes here, and so the page can manage a
	// parallel "selected rows" set for bulk row-level actions (add
	// shift, apply template) on blank days. We pass the modifiers so
	// the page can branch single-select / Cmd-toggle / Shift-range
	// the same way it does for shifts. `e.stopPropagation()` so the
	// page-level body click doesn't fire `clearSelection` and wipe
	// the row selection we just set.
	e.stopPropagation();
	emit('row-focus', {
		employeeId: props.row.employee.id,
		dateStr: props.dateStr,
		additive: e.ctrlKey || e.metaKey || e.shiftKey,
		range: e.shiftKey,
	});
}
</script>
