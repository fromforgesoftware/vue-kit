<template>
	<div
		data-slot="schedule-timeline"
		:class="
			cn(
				'flex flex-col w-full min-w-0 overflow-hidden bg-background rounded-lg border border-border',
				props.class,
			)
		"
	>
		<component
			:is="viewComponent"
			:departments="departments"
			:rows="rows"
			:selected-date="selectedDate"
			:date-range="dateRange"
			:start-time="startTime"
			:end-time="endTime"
			:employee-column-width="employeeColumnWidth"
			:min-column-width="viewMinColumnWidth"
			:default-collapsed="defaultCollapsed"
			:stack-overlaps="stackOverlaps"
			:selected-ids="selectedIds"
			:conflict-ids="conflictIds"
			:row-class="rowClass"
			:load-more-threshold="loadMoreThreshold"
			:load-key="loadKey"
			:editable="editable"
			:active-segment-id="activeSegmentId"
			:selection-mode="selectionMode"
			@day-click="emit('day-click', $event)"
			@employee-click="
				(id: string, e?: MouseEvent | KeyboardEvent) => emit('employee-click', id, e)
			"
			@shift-contextmenu="emit('shift-contextmenu', $event)"
			@shift-click="emit('shift-click', $event)"
			@shift-select="
				(id: string, additive: boolean, range?: boolean) =>
					emit('shift-select', id, additive, range)
			"
			@child-hover="(e: ChildHoverEvent | null) => emit('child-hover', e)"
			@load-more="emit('load-more')"
			@shift-resize="(e: ShiftResizeEvent) => emit('shift-resize', e)"
			@shift-move="(e: ShiftMoveEvent) => emit('shift-move', e)"
			@shift-reassign="(e: ShiftReassignEvent) => emit('shift-reassign', e)"
			@shift-fill="emit('shift-fill', $event)"
			@row-focus="emit('row-focus', $event)"
			@shift-segment-update="(e: ShiftSegmentUpdateEvent) => emit('shift-segment-update', e)"
			@shift-segment-select="(e: ShiftSegmentSelectEvent) => emit('shift-segment-select', e)"
			@shift-bar-click="(e: ShiftBarClickEvent) => emit('shift-bar-click', e)"
			@shift-create="emit('shift-create', $event)"
		>
			<template v-if="$slots['shift-wrapper']" #shift-wrapper="slotProps">
				<slot name="shift-wrapper" v-bind="slotProps" />
			</template>

			<template v-if="$slots['shift-toolbar']" #shift-toolbar="slotProps">
				<slot name="shift-toolbar" v-bind="slotProps" />
			</template>

			<template v-if="$slots.empty" #empty>
				<slot name="empty" />
			</template>

			<template #employee-header>
				<div
					v-if="!hasGroups"
					data-slot="schedule-timeline-employee-header"
					class="flex items-center justify-between w-full gap-1"
				>
					<span class="text-2xs font-medium text-muted-foreground"> Employee </span>
					<div class="flex items-center gap-0.5 flex-shrink-0">
						<slot name="header-actions" />
					</div>
				</div>
			</template>

			<template #employee-actions>
				<slot name="header-actions" />
			</template>

			<template #department-actions="slotProps">
				<slot name="department-actions" v-bind="slotProps" />
			</template>
		</component>
	</div>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import type { ClassValue } from 'clsx';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import { useResponsive } from '../../../composables/useResponsive.js';
import { cn } from '../../../helpers/cn.js';

const { isMobile } = useResponsive();
import type {
	ChildHoverEvent,
	ScheduleTimelineDepartment,
	ScheduleTimelineEmployeeRow,
	ScheduleTimelineView,
	ShiftClickEvent,
	ShiftContextMenuEvent,
	ShiftResizeEvent,
	ShiftMoveEvent,
	ShiftReassignEvent,
	ShiftSegmentUpdateEvent,
	ShiftSegmentSelectEvent,
	ShiftBarClickEvent,
} from './schedule-timeline.js';
import ScheduleTimelineWeekView from './week/ScheduleTimelineWeekView.vue';
import ScheduleTimelineDayView from './day/ScheduleTimelineDayView.vue';
import ScheduleTimelineMonthView from './month/ScheduleTimelineMonthView.vue';

const props = withDefaults(
	defineProps<{
		/** Active view mode */
		view?: ScheduleTimelineView;
		/** Department sections with employee rows (grouped mode) */
		departments?: ScheduleTimelineDepartment[];
		/** Flat employee rows without departments (ungrouped mode) */
		rows?: ScheduleTimelineEmployeeRow[];
		/** Currently selected date */
		selectedDate: ForgeDate;
		/** Custom date range override (week/month) */
		dateRange?: { from: ForgeDate; to: ForgeDate };
		/** Day view start hour (default "00:00" = midnight) */
		startTime?: string;
		/** Day view end hour (default "00:00" = full 24h) */
		endTime?: string;
		/** Width of the employee column (default 200) */
		employeeColumnWidth?: number;
		/** Minimum width per column (default varies by view) */
		minColumnWidth?: number;
		/** Start departments collapsed */
		defaultCollapsed?: boolean;
		/**
		 * Day view only: when true, time-overlapping shifts are stacked into
		 * separate vertical lanes (greedy lane assignment by start time). When
		 * false (default), all shifts collapse onto a single lane and overlap
		 * visually. Other views ignore this flag.
		 */
		stackOverlaps?: boolean;
		/** Selected shift IDs for multi-select highlight */
		selectedIds?: string[];
		/**
		 * Conflict shift IDs. Each id paints a destructive outline on its
		 * card so the user sees overlapping / invalid shifts at a glance.
		 * Computation lives in the consumer (the pattern doesn't know which
		 * pair of shifts counts as a conflict) — overlapping time windows
		 * on the same employee / date is the obvious case, but consumers
		 * can layer on max-hours / missing-break / business rules too.
		 */
		conflictIds?: string[];
		/**
		 * Optional callback to attach extra classes to each employee row's
		 * outer container (e.g. selection ring in edit-mode pages). All three
		 * views honour this.
		 */
		rowClass?: (row: ScheduleTimelineEmployeeRow) => ClassValue;
		/**
		 * Infinite scroll: when set, emits `load-more` once the user scrolls
		 * within this many rows of the end. Leave unset to disable.
		 */
		loadMoreThreshold?: number;
		/**
		 * Opaque token that re-arms the `load-more` latch when the dataset is
		 * logically replaced (filter change, sort change). Without it, a filter
		 * swap that happens to yield the same `items.length` won't refire
		 * `load-more`.
		 */
		loadKey?: string | number;
		/**
		 * Edit mode (day view only in v1). When `true`, each shift card surfaces
		 * drag-to-move, edge-resize, and segment drag, and emits the four
		 * `shift-resize` / `shift-move` / `shift-segment-update` /
		 * `shift-segment-select` events with the shift / employee / date
		 * context. Week and month views ignore this prop. The `#shift-wrapper`
		 * slot scope now exposes `editable` so consumer-owned shift content can
		 * branch on edit state.
		 */
		editable?: boolean;
		/** Currently active segment id (forwarded to each editable shift card). */
		activeSegmentId?: string | null;
		/**
		 * Click-on-shift semantics:
		 * - `'open'` (default): plain click emits `shift-click` (the existing
		 *   "open a detail surface" path); Cmd/Ctrl-click emits `shift-select`
		 *   for multi-toggle selection.
		 * - `'toggle'`: plain click emits `shift-select` as a single-select
		 *   replacement; Cmd/Ctrl-click still emits `shift-select` for
		 *   multi-toggle. The `shift-click` event does not fire in this mode.
		 *
		 * Use `'toggle'` on edit pages that want a plain click to select the
		 * shift for an external toolbar instead of opening a detail view.
		 */
		selectionMode?: 'open' | 'toggle';
		/** Additional CSS classes */
		class?: string;
	}>(),
	{
		view: 'week',
		startTime: '00:00',
		endTime: '00:00',
		employeeColumnWidth: 200,
		defaultCollapsed: false,
		editable: false,
		activeSegmentId: undefined,
		selectionMode: 'open',
	},
);

// Dev-mode contract check: callers must pass either `departments` (grouped)
// or `rows` (flat), never both. Departments takes precedence; warn so the
// silent-ignore branch is loud during development.
watch(
	() => [props.departments?.length ?? 0, props.rows?.length ?? 0] as const,
	([deptCount, rowCount]) => {
		if (deptCount > 0 && rowCount > 0) {
			console.warn(
				'[ScheduleTimeline] `departments` and `rows` are mutually exclusive; `departments` takes precedence and `rows` is ignored.',
			);
		}
	},
	{ immediate: true },
);

const viewComponent = computed(() => {
	switch (props.view) {
		case 'day':
			return ScheduleTimelineDayView;
		case 'month':
			return ScheduleTimelineMonthView;
		case 'week':
		default:
			return ScheduleTimelineWeekView;
	}
});

const viewMinColumnWidth = computed(() => {
	if (props.minColumnWidth !== undefined) return props.minColumnWidth;
	// On mobile we shrink the minimum so a phone viewport can render usable
	// density and rely on horizontal scroll. The sticky employee column keeps
	// the row identifier anchored.
	const mobile = isMobile.value;
	switch (props.view) {
		case 'day':
			return mobile ? 48 : 80;
		case 'month':
			return mobile ? 28 : 36;
		case 'week':
		default:
			return mobile ? 80 : 140;
	}
});

const emit = defineEmits<{
	'day-click': [date: string];
	'employee-click': [employeeId: string, event?: MouseEvent | KeyboardEvent];
	'shift-contextmenu': [event: ShiftContextMenuEvent];
	'shift-click': [event: ShiftClickEvent];
	/**
	 * Fired when the user selects a shift via plain click (in toggle mode),
	 * Cmd/Ctrl-click, or Shift-click. `additive` is `true` when any
	 * "extend selection" modifier was held; `range` is `true` only on
	 * Shift-click — the OS-standard "extend to anchor" gesture — so the
	 * consumer can resolve the anchor→target span itself (the pattern
	 * doesn't own row order). Plain click in toggle mode sends both
	 * `additive: false` and `range: false`, signalling "replace selection".
	 */
	'shift-select': [shiftId: string, additive: boolean, range?: boolean];
	'child-hover': [event: ChildHoverEvent | null];
	'load-more': [];
	/** Edit-mode (day view): a shift's left/right edge was dragged to resize. */
	'shift-resize': [payload: ShiftResizeEvent];
	/** Edit-mode (day view): a shift's body was dragged to shift its start time. */
	'shift-move': [payload: ShiftMoveEvent];
	/** Edit-mode (day view): a child segment was moved or resized. */
	'shift-segment-update': [payload: ShiftSegmentUpdateEvent];
	/** Edit-mode (day view): a child segment was clicked (selection candidate). */
	'shift-segment-select': [payload: ShiftSegmentSelectEvent];
	/**
	 * Edit-mode (day view): the bar surface was clicked at `offsetSec`.
	 * Use this to anchor any per-shift toolbar at the click x and to
	 * place "Add period" segments at the click point — same coupling the
	 * shift-template editor uses internally between `onBarClick` and
	 * `addChild`.
	 */
	'shift-bar-click': [payload: ShiftBarClickEvent];
	/**
	 * Edit-mode (day view): the user dragged out a new shift range on an
	 * empty part of a row's hour axis. Carries enough placement context
	 * for the consumer to materialise it (e.g., `useScheduleEdits.addShift`).
	 */
	'shift-create': [
		payload: { employeeId: string; dateStr: string; startTimeSec: number; durationSec: number },
	];
	/**
	 * Edit-mode (day view): a move-drag ended over a different employee
	 * row. Consumers treat this as delete-original + create-at-target —
	 * the bulk save endpoint doesn't carry a `move` op, so we collapse
	 * the gesture into the two ops it already supports.
	 */
	'shift-reassign': [payload: ShiftReassignEvent];
	/**
	 * Edit-mode (day view): a fill-handle drag ended on a different
	 * row. Consumer clones the source into every editable row from
	 * source to target (inclusive). `altKey` carries the modifier so
	 * the consumer can pick a skip-vs-replace policy for occupied rows.
	 */
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
	 * Edit-mode: the user clicked an empty row body. `additive` and
	 * `range` mirror the shift-select chord semantics so consumers can
	 * build row multi-selection (Cmd / Ctrl toggle, Shift range).
	 */
	'row-focus': [
		payload: {
			employeeId: string;
			dateStr: string;
			additive: boolean;
			range: boolean;
		},
	];
}>();

const hasGroups = computed(() => (props.departments?.length ?? 0) > 0);
</script>
