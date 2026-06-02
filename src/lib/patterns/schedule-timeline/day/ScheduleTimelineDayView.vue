<template>
	<!-- See WeekView for ARIA rationale. -->
	<div
		data-slot="schedule-timeline-day-view"
		:class="cn('flex flex-col w-full min-w-0 h-full overflow-hidden', props.class)"
		role="region"
		aria-label="Timeline schedule"
	>
		<ScheduleTimelineVirtualScroll
			ref="virtualScrollRef"
			:items="virtualItems"
			:estimate-size="estimateSizeFor"
			:load-more-threshold="loadMoreThreshold"
			:load-key="loadKey"
			@scroll="onScroll"
			@load-more="emit('load-more')"
		>
			<template v-if="$slots.empty" #empty>
				<slot name="empty" />
			</template>
			<template #prepend>
				<!-- Hour header is outside the scroll viewport so the vertical
             scrollbar only spans the rows below. Day view headers are not
             interactive (no `day-click` semantics on an hour cell). -->
				<ScheduleTimelineHeader
					:columns="hourColumns"
					:column-width="columnWidth"
					:employee-column-width="employeeColumnWidth"
					:scroll-offset="headerScrollLeft"
					:interactive="false"
				>
					<template #employee-header>
						<slot name="employee-header" />
					</template>
				</ScheduleTimelineHeader>
			</template>

			<template #default="{ item }">
				<template v-if="item.kind === 'department-header'">
					<div
						class="flex items-center h-10 border-b border-border/60 bg-background select-none w-fit"
						:style="{ minWidth: `${employeeColumnWidth + totalWidth}px` }"
					>
						<Button
							variant="ghost"
							class="sticky left-0 flex-shrink-0 justify-start gap-2 px-3 h-full rounded-none bg-background hover:bg-row-hover"
							:style="{
								width: `${employeeColumnWidth}px`,
								minWidth: `${employeeColumnWidth}px`,
								zIndex: Z.departmentHeaderSticky,
							}"
							:aria-expanded="!collapsedGroups.has(item.dept.id)"
							:aria-label="item.dept.name"
							@click="toggleGroup(item.dept.id)"
						>
							<Icon
								:icon="collapsedGroups.has(item.dept.id) ? ChevronRight : ChevronDown"
								size="sm"
								class="text-muted-foreground"
								aria-hidden="true"
							/>
							<Icon
								:icon="item.dept.icon ?? LayoutGrid"
								size="sm"
								class="text-muted-foreground"
								aria-hidden="true"
							/>
							<span class="text-sm font-semibold text-foreground truncate">
								{{ item.dept.name }}
							</span>
						</Button>
						<div
							class="ml-auto sticky right-0 flex-shrink-0 flex items-center gap-1 bg-background pr-1 h-full"
							:style="{ zIndex: Z.departmentHeaderSticky }"
						>
							<slot name="department-actions" :department="item.dept">
								<Button variant="ghost" size="icon-xs" aria-label="Edit department">
									<Icon :icon="Pencil" size="xs-sm" aria-hidden="true" />
								</Button>
								<Button variant="ghost" size="icon-xs" aria-label="Layout">
									<Icon :icon="LayoutGrid" size="xs-sm" aria-hidden="true" />
								</Button>
							</slot>
						</div>
					</div>
				</template>

				<template v-else-if="item.kind === 'department-row' || item.kind === 'flat-row'">
					<ScheduleTimelineDayRow
						:row="item.row"
						:date-str="selectedDateStr"
						:total-columns="totalColumns"
						:total-width="totalWidth"
						:column-width="columnWidth"
						:employee-column-width="employeeColumnWidth"
						:start-time-sec="startTimeSec"
						:stack-overlaps="props.stackOverlaps ?? false"
						:selected-set="selectedSet"
						:conflict-set="conflictSet"
						:row-class="props.rowClass"
						:formatted-date="formattedDate"
						:editable="props.editable"
						:active-segment-id="props.activeSegmentId"
						@employee-click="
							(id: string, e: MouseEvent | KeyboardEvent) => emit('employee-click', id, e)
						"
						@shift-contextmenu="onShiftContextMenu"
						@shift-click-internal="onShiftClickInternal"
						@shift-select="(id: string) => emit('shift-select', id, true)"
						@child-hover-enter="onChildHoverEnter"
						@child-hover-leave="onChildHoverLeave"
						@shift-resize="(e: ShiftResizeEvent) => emit('shift-resize', e)"
						@shift-move="(e: ShiftMoveEvent) => emit('shift-move', e)"
						@shift-reassign="(e) => emit('shift-reassign', e)"
						@shift-fill="(e) => emit('shift-fill', e)"
						@row-focus="(e) => emit('row-focus', e)"
						@shift-segment-update="(e: ShiftSegmentUpdateEvent) => emit('shift-segment-update', e)"
						@shift-segment-select="(e: ShiftSegmentSelectEvent) => emit('shift-segment-select', e)"
						@shift-bar-click="(e: ShiftBarClickEvent) => emit('shift-bar-click', e)"
						@shift-create="(e) => emit('shift-create', e)"
					>
						<template v-if="$slots['shift-wrapper']" #shift-wrapper="slotProps">
							<slot name="shift-wrapper" v-bind="slotProps" />
						</template>
						<template v-if="$slots['shift-toolbar']" #shift-toolbar="slotProps">
							<slot name="shift-toolbar" v-bind="slotProps" />
						</template>
					</ScheduleTimelineDayRow>
				</template>

				<template v-else-if="item.kind === 'department-legend'">
					<ScheduleTimelineLegend
						:items="item.dept.legend ?? []"
						:employee-column-width="employeeColumnWidth"
						:timeline-width="totalWidth"
					/>
				</template>
			</template>

			<!-- Single continuous "now" line, painted once across the full
           scroll height so row borders don't break it into segments. -->
			<template v-if="isToday && isNowInWindow" #overlay>
				<ScheduleTimelineNowIndicator :left="employeeColumnWidth + nowLineLeft" :time="nowText" />
			</template>
		</ScheduleTimelineVirtualScroll>
	</div>
</template>

<script setup lang="ts">
import { computed, onMounted, onScopeDispose, shallowRef, toRef, watch } from 'vue';
import type { ClassValue } from 'clsx';
import { ForgeTime, EDateFormat, type ForgeDate } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../../helpers/cn.js';
import type {
	ChildHoverEvent,
	ScheduleTimelineDepartment,
	ScheduleTimelineEmployeeRow as ScheduleTimelineEmployeeRowData,
	ScheduleTimelineShift,
	ScheduleTimelineShiftChild,
	ShiftClickEvent,
	ShiftContextMenuEvent,
	ShiftResizeEvent,
	ShiftMoveEvent,
	ShiftSegmentUpdateEvent,
	ShiftSegmentSelectEvent,
	ShiftBarClickEvent,
} from '../schedule-timeline.js';
import {
	parseHHMMToSec,
	computeStackedRowHeight,
	selectionKey,
	ScheduleTimelineZ as Z,
} from '../utils.js';
import { useScheduleTimelineLayout } from '../useScheduleTimelineLayout.js';
import { useNowTick } from '../useNowTick.js';
import { ChevronDown, ChevronRight, LayoutGrid, Pencil } from '@lucide/vue';
import ScheduleTimelineLegend from '../shared/ScheduleTimelineLegend.vue';
import ScheduleTimelineNowIndicator from './ScheduleTimelineNowIndicator.vue';
import ScheduleTimelineVirtualScroll from '../shared/ScheduleTimelineVirtualScroll.vue';
import ScheduleTimelineHeader, {
	type ScheduleTimelineHeaderColumn,
} from '../shared/ScheduleTimelineHeader.vue';
import ScheduleTimelineDayRow from './ScheduleTimelineDayRow.vue';
import Button from '../../../general/button/Button.vue';
import Icon from '../../../general/icon/Icon.vue';

const props = withDefaults(
	defineProps<{
		departments?: ScheduleTimelineDepartment[];
		rows?: ScheduleTimelineEmployeeRowData[];
		selectedDate: ForgeDate;
		startTime?: string;
		endTime?: string;
		employeeColumnWidth?: number;
		minColumnWidth?: number;
		defaultCollapsed?: boolean;
		stackOverlaps?: boolean;
		selectedIds?: string[];
		/** Shift IDs flagged as conflicting (e.g., overlap on the same employee/date). */
		conflictIds?: string[];
		rowClass?: (row: ScheduleTimelineEmployeeRowData) => ClassValue;
		loadMoreThreshold?: number;
		loadKey?: string | number;
		/**
		 * Editor mode. When `true`, the default day-shift card surfaces
		 * drag-to-move, edge-resize, and segment drag; the view forwards
		 * `resize`, `bar-move`, `segment-update`, and `segment-select` events
		 * with the shift / employee / date context. Consumers using the
		 * `#shift-wrapper` slot retain full control regardless of this prop —
		 * but the slot scope now includes `editable` and `activeSegmentId` so
		 * the slot template can branch on edit state.
		 */
		editable?: boolean;
		/** Active segment id forwarded to each shift card while editable. */
		activeSegmentId?: string | null;
		/**
		 * Click-on-shift semantics:
		 * - `'open'` (default): plain click emits `shift-click`; Cmd/Ctrl-click
		 *   emits `shift-select` (multi-toggle).
		 * - `'toggle'`: plain click emits `shift-select` as a single-select
		 *   replacement; Cmd/Ctrl-click still emits `shift-select` for
		 *   multi-toggle. Use on edit pages where the click should select
		 *   instead of open a detail surface.
		 */
		selectionMode?: 'open' | 'toggle';
		class?: string;
	}>(),
	{
		startTime: '00:00',
		endTime: '00:00',
		employeeColumnWidth: 200,
		minColumnWidth: 60,
		defaultCollapsed: false,
		stackOverlaps: false,
		editable: false,
		activeSegmentId: undefined,
		selectionMode: 'open',
	},
);

const emit = defineEmits<{
	'employee-click': [employeeId: string, event: MouseEvent | KeyboardEvent];
	'shift-contextmenu': [event: ShiftContextMenuEvent];
	'shift-click': [event: ShiftClickEvent];
	/**
	 * `additive` is `true` when the user held Cmd / Ctrl / Shift during
	 * the click — the OS-standard "extend my selection" modifiers. Plain
	 * click sets it to `false`, signalling a single-select replace.
	 * `range` is `true` only on Shift-click — the OS-standard "extend
	 * to anchor" gesture — so the consumer can resolve the anchor→target
	 * span itself (the pattern doesn't know row order). Cmd / Ctrl set
	 * `range: false`; both keep `additive: true`. Consumers that don't
	 * want range semantics can treat the flag as a noop.
	 */
	'shift-select': [shiftId: string, additive: boolean, range?: boolean];
	'child-hover': [event: ChildHoverEvent | null];
	'load-more': [];
	/** Edit-mode: a shift's left/right edge was dragged to resize. */
	'shift-resize': [payload: ShiftResizeEvent];
	/** Edit-mode: a shift's body was dragged to shift its start time. */
	'shift-move': [payload: ShiftMoveEvent];
	/** Edit-mode: a child segment inside a shift was moved or resized. */
	'shift-segment-update': [payload: ShiftSegmentUpdateEvent];
	/** Edit-mode: a child segment was clicked (selection candidate). */
	'shift-segment-select': [payload: ShiftSegmentSelectEvent];
	/** Edit-mode: the user clicked the bar surface (forwarded with `offsetSec`). */
	'shift-bar-click': [payload: ShiftBarClickEvent];
	/**
	 * Edit-mode: the user dragged out a new range on an empty part of a
	 * row's hour axis. Carries the row's employee + the dragged
	 * `startTimeSec` / `durationSec` so the consumer can materialise a
	 * new shift.
	 */
	'shift-create': [
		payload: { employeeId: string; dateStr: string; startTimeSec: number; durationSec: number },
	];
	/**
	 * Edit-mode: a move-drag ended over a different employee row (or
	 * different date in multi-day views). Consumers treat this as
	 * delete-original + create-at-target — see `ScheduleTimelineDayShift`'s
	 * `reassign` event for the rationale.
	 */
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
	/**
	 * Edit-mode: a fill-handle drag ended on a different employee row.
	 * Consumer clones the source into every editable row from source
	 * to target (inclusive of intermediates). `altKey` carries the
	 * release-time modifier for skip-vs-replace policy.
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
	/** Empty-row click. See `ScheduleTimelineDayRow` for full semantics. */
	'row-focus': [
		payload: {
			employeeId: string;
			dateStr: string;
			additive: boolean;
			range: boolean;
		},
	];
}>();

const hours = computed<number[]>(() => {
	const startSec = parseHHMMToSec(props.startTime);
	const start = Number.isFinite(startSec) ? Math.floor(startSec / 3600) : 0;
	const endSec = parseHHMMToSec(props.endTime);
	const endRaw = Number.isFinite(endSec) ? Math.floor(endSec / 3600) : 0;
	const end = props.endTime === '00:00' ? 24 : endRaw;
	const count = end <= start ? 24 - start + end : end - start;
	return Array.from({ length: count }, (_, i) => start + i);
});

const startTimeSec = computed<number>(() => {
	const v = parseHHMMToSec(props.startTime);
	return Number.isFinite(v) ? v : 0;
});

const totalColumns = computed(() => hours.value.length);

const hourColumns = computed<ScheduleTimelineHeaderColumn[]>(() =>
	hours.value.map((h) => ({
		// `date` is required by the shared type; for hour rows we synthesise
		// a stable per-hour key. Day view never emits `day-click` from here.
		date: `hour-${h}`,
		label: ForgeTime.formatTimeOfDay(h * 3600),
	})),
);
const selectedDateStr = computed(() => props.selectedDate.toISODate());
const formattedDate = computed(() => props.selectedDate.format(EDateFormat.Pretty));
const { now } = useNowTick();
const isToday = computed(() => props.selectedDate.isSame(now.value, 'day'));
// Retain Set identity when `selectedIds` is the same content but a fresh
// array reference (consumers commonly pass `[...ids]` each render). Hash by
// length + first/last id rather than full `join('|')` so the dep doesn't
// allocate O(n) per parent render with large selections.
const selectedSet = shallowRef<Set<string>>(new Set(props.selectedIds ?? []));
watch(
	() => selectionKey(props.selectedIds),
	() => {
		selectedSet.value = new Set(props.selectedIds ?? []);
	},
);
// Same identity-stabilising trick for `conflictIds` — consumers often
// pass a freshly-built array; we don't want a full Set rebuild on each
// parent render if the content didn't change.
const conflictSet = shallowRef<Set<string>>(new Set(props.conflictIds ?? []));
watch(
	() => selectionKey(props.conflictIds),
	() => {
		conflictSet.value = new Set(props.conflictIds ?? []);
	},
);

const {
	virtualScrollRef,
	columnWidth,
	headerScrollLeft,
	collapsedGroups,
	hasGroups,
	flatRows,
	onScroll,
	toggleGroup,
} = useScheduleTimelineLayout({
	departments: toRef(props, 'departments'),
	rows: toRef(props, 'rows'),
	employeeColumnWidth: toRef(props, 'employeeColumnWidth'),
	minColumnWidth: toRef(props, 'minColumnWidth'),
	columnCount: totalColumns,
	defaultCollapsed: toRef(props, 'defaultCollapsed'),
	initialColumnWidth: 60,
});

const totalWidth = computed(() => totalColumns.value * columnWidth.value);

// `nowOffsetHours` is `null` when current time falls outside the day-view
// window (e.g. window 06:00–04:00, now=05:00 — outside the 22h span). The
// wrap-around offset alone is ambiguous; we compare against the real
// `[start, end)` span in seconds so windows crossing midnight resolve
// correctly.
const nowOffsetHours = computed<number | null>(() => {
	const startSec = startTimeSec.value;
	const nowSec = now.value.hour * 3600 + now.value.minute * 60;
	const windowSec = hours.value.length * 3600;
	let deltaSec = nowSec - startSec;
	if (deltaSec < 0) deltaSec += 86_400;
	if (deltaSec >= windowSec) return null;
	return deltaSec / 3600;
});
const isNowInWindow = computed(() => nowOffsetHours.value !== null);
const nowLineLeft = computed(() => (nowOffsetHours.value ?? 0) * columnWidth.value);
const nowText = computed(() =>
	ForgeTime.formatTimeOfDay((now.value.hour * 60 + now.value.minute) * 60),
);

onMounted(() => {
	// ResizeObserver fires its first measurement in a microtask after mount —
	// wait for that before reading `columnWidth`, otherwise we'd scroll using
	// the initial 60px placeholder. `requestAnimationFrame` lands after the
	// observer's initial dispatch on every browser we support.
	requestAnimationFrame(() => scrollToEarliest());
});

// Toggling stacking changes per-row heights (1 → N lanes). The virtualizer's
// estimateSize remembers the old number until rows recycle, so force a
// remeasure to reflect the new layout immediately.
watch(
	() => props.stackOverlaps,
	() => virtualScrollRef.value?.measure?.(),
);

function shiftsForDate(row: ScheduleTimelineEmployeeRowData): ScheduleTimelineShift[] {
	return row.days[selectedDateStr.value]?.shifts ?? [];
}

const MIN_ROW_HEIGHT = 56;

// Initial estimate only — the virtualizer measures the real height from
// the DOM once each row mounts (DayRow owns the authoritative compute).
function getRowHeight(row: ScheduleTimelineEmployeeRowData): number {
	if (!props.stackOverlaps) return MIN_ROW_HEIGHT;
	const shifts = shiftsForDate(row);
	if (shifts.length <= 1) return MIN_ROW_HEIGHT;
	return computeStackedRowHeight(Math.min(shifts.length, 3), MIN_ROW_HEIGHT);
}

function scrollToEarliest() {
	const container = virtualScrollRef.value?.getScrollElement();
	if (!container) return;

	let earliestSec = Infinity;
	const allRows = props.departments ? props.departments.flatMap((d) => d.rows) : (props.rows ?? []);
	for (const row of allRows) {
		for (const shift of shiftsForDate(row)) {
			const sec = parseHHMMToSec(shift.time);
			if (Number.isFinite(sec) && sec < earliestSec) earliestSec = sec;
		}
	}
	if (earliestSec === Infinity) return;

	const startHour = startTimeSec.value / 3600;
	const scrollToHour = Math.max(0, Math.floor(earliestSec / 3600) - 1);
	let offset = scrollToHour - startHour;
	if (offset < 0) offset += 24;
	container.scrollLeft = offset * columnWidth.value;
}

function onShiftContextMenu(payload: {
	e: MouseEvent;
	shiftId: string;
	employeeId: string;
	meta?: Record<string, unknown>;
}) {
	payload.e.preventDefault();
	emit('shift-contextmenu', {
		shiftId: payload.shiftId,
		employeeId: payload.employeeId,
		dateStr: selectedDateStr.value,
		x: payload.e.clientX,
		y: payload.e.clientY,
		meta: payload.meta,
	});
}

function onShiftClickInternal(payload: {
	e: MouseEvent;
	shift: ScheduleTimelineShift;
	employeeId: string;
}) {
	// Cmd/Ctrl-click and Shift-click both fire shift-select (regardless
	// of mode). Cmd/Ctrl is OS-standard "toggle one", Shift is OS-standard
	// "extend selection to anchor". We mark both as `additive: true` for
	// backwards compatibility, and pass `range: true` only for Shift so the
	// consumer can resolve the anchor→target span itself (the pattern
	// doesn't own row order — only the page does). Plain click fires
	// shift-select only in `toggle` mode; in `open` mode it emits
	// shift-click for the legacy detail-surface path.
	const range = payload.e.shiftKey;
	const additive = payload.e.ctrlKey || payload.e.metaKey || range;
	if (additive || props.selectionMode === 'toggle') {
		emit('shift-select', payload.shift.id, additive, range);
		return;
	}
	emit('shift-click', {
		shiftId: payload.shift.id,
		employeeId: payload.employeeId,
		dateStr: selectedDateStr.value,
		x: payload.e.clientX,
		y: payload.e.clientY,
		meta: payload.shift.meta,
	});
}

let childHoverTimer: ReturnType<typeof setTimeout> | null = null;

function onChildHoverEnter(payload: {
	shiftId: string;
	employeeId: string;
	ci: number;
	child: ScheduleTimelineShiftChild;
}) {
	childHoverTimer = setTimeout(() => {
		emit('child-hover', {
			shiftId: payload.shiftId,
			employeeId: payload.employeeId,
			dateStr: selectedDateStr.value,
			childIndex: payload.ci,
			childType: payload.child.type,
		});
	}, 400);
}

function onChildHoverLeave() {
	if (childHoverTimer) {
		clearTimeout(childHoverTimer);
		childHoverTimer = null;
	}
	emit('child-hover', null);
}

// Virtualization may unmount the row between the 400ms enter delay and the
// fire, so cancel any pending timer when this scope is disposed to avoid
// emitting `child-hover` after teardown.
onScopeDispose(() => {
	if (childHoverTimer) {
		clearTimeout(childHoverTimer);
		childHoverTimer = null;
	}
});

type VirtualItem =
	| { kind: 'department-header'; dept: ScheduleTimelineDepartment }
	| {
			kind: 'department-row';
			dept: ScheduleTimelineDepartment;
			row: ScheduleTimelineEmployeeRowData;
	  }
	| { kind: 'department-legend'; dept: ScheduleTimelineDepartment }
	| { kind: 'flat-row'; row: ScheduleTimelineEmployeeRowData };

const virtualItems = computed<VirtualItem[]>(() => {
	const out: VirtualItem[] = [];
	if (hasGroups.value) {
		for (const dept of props.departments ?? []) {
			out.push({ kind: 'department-header', dept });
			if (collapsedGroups.value.has(dept.id)) continue;
			for (const row of dept.rows) out.push({ kind: 'department-row', dept, row });
			if (dept.legend?.length) out.push({ kind: 'department-legend', dept });
		}
	} else {
		for (const row of flatRows.value) out.push({ kind: 'flat-row', row });
	}
	return out;
});

function estimateSizeFor(index: number): number {
	const item = virtualItems.value[index];
	if (!item) return 56;
	switch (item.kind) {
		case 'department-header':
			return 40;
		case 'department-row':
		case 'flat-row':
			return getRowHeight(item.row);
		case 'department-legend':
			return 32;
	}
}
</script>
