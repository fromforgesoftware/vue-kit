<template>
	<!-- See WeekView for ARIA rationale: a generic region instead of role="grid". -->
	<div
		data-slot="schedule-timeline-month-view"
		:class="cn('flex flex-col h-full overflow-hidden', props.class)"
		role="region"
		aria-label="Timeline schedule"
	>
		<ScheduleTimelineHeader
			:columns="headerColumns"
			:column-width="columnWidth"
			:employee-column-width="employeeColumnWidth"
			:scroll-offset="headerScrollLeft"
			dense
			@day-click="emit('day-click', $event)"
		>
			<template #employee-header>
				<div class="flex items-center justify-between gap-2 w-full">
					<slot name="employee-header">
						<span class="text-2xs font-medium text-muted-foreground"> Employee </span>
					</slot>
					<Button
						v-if="expandableEmployeeIds.length > 0"
						variant="link"
						size="xs"
						class="shrink-0"
						:title="allRowsExpanded ? 'Collapse all rows' : 'Expand all rows'"
						@click="allRowsExpanded ? collapseAllRows() : expandAllRows()"
					>
						{{ allRowsExpanded ? 'Collapse all' : 'Expand all' }}
					</Button>
				</div>
			</template>
		</ScheduleTimelineHeader>

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
			<template #default="{ item }">
				<template v-if="item.kind === 'department-header'">
					<div
						data-slot="schedule-timeline-department-header"
						:data-department-id="item.dept.id"
						class="flex items-center h-9 w-fit border-b border-border/60 bg-background select-none"
						:style="{ minWidth: `${employeeColumnWidth + totalWidth}px` }"
					>
						<Button
							variant="ghost"
							class="sticky left-0 flex-shrink-0 justify-start gap-2 bg-background px-2 h-full rounded-none"
							:style="{
								width: `${employeeColumnWidth}px`,
								minWidth: `${employeeColumnWidth}px`,
								zIndex: Z.header,
							}"
							:aria-expanded="!collapsedGroups.has(item.dept.id)"
							:aria-label="item.dept.name"
							@click="toggleGroup(item.dept.id)"
						>
							<Icon
								:icon="collapsedGroups.has(item.dept.id) ? ChevronRight : ChevronDown"
								size="xs-sm"
								class="text-muted-foreground"
								aria-hidden="true"
							/>
							<Icon
								:icon="item.dept.icon ?? LayoutGrid"
								size="xs-sm"
								class="text-muted-foreground"
								aria-hidden="true"
							/>
							<span class="text-xs font-semibold text-foreground truncate">
								{{ item.dept.name }}
							</span>
						</Button>
						<div
							class="ml-auto sticky right-0 flex-shrink-0 flex items-center gap-1 bg-background pr-1 h-full"
							:style="{ zIndex: Z.header }"
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
					<ScheduleTimelineMonthRow
						:row="item.row"
						:date-columns="dateColumns"
						:column-width="columnWidth"
						:employee-column-width="employeeColumnWidth"
						:is-expanded="expandedRows.has(item.row.employee.id)"
						:selected-set="selectedSet"
						:class="rowClass ? rowClass(item.row) : undefined"
						@employee-click="
							(id: string, e: MouseEvent | KeyboardEvent) => emit('employee-click', id, e)
						"
						@toggle-expand="toggleRowExpand"
						@shift-click="onShiftClick"
						@shift-select="(id: string) => emit('shift-select', id, true)"
						@shift-contextmenu="onShiftContextMenu"
					>
						<template v-if="$slots['shift-wrapper']" #shift-wrapper="slotProps">
							<slot name="shift-wrapper" v-bind="slotProps" />
						</template>
					</ScheduleTimelineMonthRow>
				</template>

				<template v-else-if="item.kind === 'department-legend'">
					<ScheduleTimelineLegend
						:items="item.dept.legend ?? []"
						:employee-column-width="employeeColumnWidth"
						:timeline-width="totalWidth"
					/>
				</template>
			</template>
		</ScheduleTimelineVirtualScroll>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, shallowRef, toRef, watch } from 'vue';
import type { ClassValue } from 'clsx';
import { EDateFormat, type ForgeDate } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../../helpers/cn.js';
import type {
	ScheduleTimelineDepartment,
	ScheduleTimelineEmployeeRow as ScheduleTimelineEmployeeRowData,
	ScheduleTimelineShift,
	ShiftClickEvent,
	ShiftContextMenuEvent,
} from '../schedule-timeline.js';
import { ChevronDown, ChevronRight, LayoutGrid, Pencil } from '@lucide/vue';
import ScheduleTimelineLegend from '../shared/ScheduleTimelineLegend.vue';
import ScheduleTimelineVirtualScroll from '../shared/ScheduleTimelineVirtualScroll.vue';
import ScheduleTimelineHeader, {
	type ScheduleTimelineHeaderColumn,
} from '../shared/ScheduleTimelineHeader.vue';
import ScheduleTimelineMonthRow from './ScheduleTimelineMonthRow.vue';
import Button from '../../../general/button/Button.vue';
import Icon from '../../../general/icon/Icon.vue';
import {
	buildDayRange,
	getDayCell,
	getMonthOverflow,
	isWeekendDay,
	selectionKey,
	ScheduleTimelineZ as Z,
} from '../utils.js';
import { useScheduleTimelineLayout } from '../useScheduleTimelineLayout.js';
import { useDayTick } from '../useNowTick.js';

const props = withDefaults(
	defineProps<{
		departments?: ScheduleTimelineDepartment[];
		rows?: ScheduleTimelineEmployeeRowData[];
		selectedDate: ForgeDate;
		dateRange?: { from: ForgeDate; to: ForgeDate };
		employeeColumnWidth?: number;
		minColumnWidth?: number;
		defaultCollapsed?: boolean;
		selectedIds?: string[];
		rowClass?: (row: ScheduleTimelineEmployeeRowData) => ClassValue;
		loadMoreThreshold?: number;
		loadKey?: string | number;
		/** See `ScheduleTimeline.selectionMode`. */
		selectionMode?: 'open' | 'toggle';
		class?: string;
	}>(),
	{
		employeeColumnWidth: 200,
		minColumnWidth: 36,
		defaultCollapsed: false,
		selectionMode: 'open',
	},
);

const emit = defineEmits<{
	'day-click': [date: string];
	'employee-click': [employeeId: string, event: MouseEvent | KeyboardEvent];
	'shift-click': [event: ShiftClickEvent];
	'shift-contextmenu': [event: ShiftContextMenuEvent];
	/** See `ScheduleTimelineDayView` for the `additive` / `range` semantics. */
	'shift-select': [shiftId: string, additive: boolean, range?: boolean];
	'load-more': [];
}>();

const monthDays = computed<ForgeDate[]>(() => {
	if (props.dateRange) return buildDayRange(props.dateRange.from, props.dateRange.to);
	const start = props.selectedDate.startOf('month');
	const end = props.selectedDate.endOf('month');
	return Array.from({ length: end.day }, (_, i) => start.plus({ days: i }));
});

const dateColumns = computed(() => monthDays.value.map((d) => d.toISODate()));
const totalColumns = computed(() => monthDays.value.length);
const { today } = useDayTick();

const headerColumns = computed<ScheduleTimelineHeaderColumn[]>(() =>
	monthDays.value.map((day) => ({
		label: String(day.day),
		sublabel: day.format(EDateFormat.WeekdayShort),
		date: day.toISODate(),
		isToday: day.isSame(today.value, 'day'),
		isWeekend: isWeekendDay(day),
	})),
);
// See DayView for rationale: cache the Set so consumers passing fresh
// `selectedIds` arrays each render don't invalidate every row.
const selectedSet = shallowRef<Set<string>>(new Set(props.selectedIds ?? []));
watch(
	() => selectionKey(props.selectedIds),
	() => {
		selectedSet.value = new Set(props.selectedIds ?? []);
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
	initialColumnWidth: 36,
});

const totalWidth = computed(() => totalColumns.value * columnWidth.value);

// Rows with overflow in any cell can be expanded inline. Clicking "+N"
// expands the whole row so cells stay vertically aligned.
const expandedRows = ref<Set<string>>(new Set());

function toggleRowExpand(employeeId: string) {
	if (expandedRows.value.has(employeeId)) expandedRows.value.delete(employeeId);
	else expandedRows.value.add(employeeId);
	virtualScrollRef.value?.measure?.();
}

// Pre-index "any cell with overflow" per employee from the underlying row
// data only — the previous implementation walked `rows × dateColumns` on
// every dependency change, so a 31-day month × 200 employees re-scanned
// 6.2k cells whenever `selectedDate`, `departments`, or `rows` ticked.
// This computed only recomputes when fixtures change.
const expandableEmployeeIdSet = computed<Set<string>>(() => {
	const ids = new Set<string>();
	const rows: ScheduleTimelineEmployeeRowData[] = [];
	if (props.departments) for (const d of props.departments) rows.push(...d.rows);
	rows.push(...(props.rows ?? []));
	for (const r of rows) {
		for (const dateStr of Object.keys(r.days)) {
			if (getMonthOverflow(getDayCell(r, dateStr)) > 0) {
				ids.add(r.employee.id);
				break;
			}
		}
	}
	return ids;
});

const expandableEmployeeIds = computed<string[]>(() => Array.from(expandableEmployeeIdSet.value));

const allRowsExpanded = computed(() => {
	const expandable = expandableEmployeeIdSet.value;
	if (expandable.size === 0) return false;
	for (const id of expandable) if (!expandedRows.value.has(id)) return false;
	return true;
});

function expandAllRows() {
	expandedRows.value = new Set(expandableEmployeeIds.value);
	virtualScrollRef.value?.measure?.();
}

function collapseAllRows() {
	expandedRows.value = new Set();
	virtualScrollRef.value?.measure?.();
}

function onShiftClick(payload: {
	e: MouseEvent;
	shift: ScheduleTimelineShift;
	employeeId: string;
	dateStr: string;
}) {
	const range = payload.e.shiftKey;
	const additive = payload.e.ctrlKey || payload.e.metaKey || range;
	if (additive || props.selectionMode === 'toggle') {
		emit('shift-select', payload.shift.id, additive, range);
		return;
	}
	emit('shift-click', {
		shiftId: payload.shift.id,
		employeeId: payload.employeeId,
		dateStr: payload.dateStr,
		x: payload.e.clientX,
		y: payload.e.clientY,
		meta: payload.shift.meta,
	});
}

function onShiftContextMenu(payload: {
	e: MouseEvent;
	shift: ScheduleTimelineShift;
	employeeId: string;
	dateStr: string;
}) {
	payload.e.preventDefault();
	emit('shift-contextmenu', {
		shiftId: payload.shift.id,
		employeeId: payload.employeeId,
		dateStr: payload.dateStr,
		x: payload.e.clientX,
		y: payload.e.clientY,
		meta: payload.shift.meta,
	});
}

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
	if (!item) return 44;
	switch (item.kind) {
		case 'department-header':
			return 36;
		case 'department-row':
		case 'flat-row':
			return 44;
		case 'department-legend':
			return 32;
	}
}
</script>
