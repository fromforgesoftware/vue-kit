<template>
	<!-- A generic region rather than role="grid" — the dense layout doesn't
       fit axe's row/cell taxonomy and cascades aria-required-children failures. -->
	<div
		data-slot="schedule-timeline-week-view"
		:class="cn('flex flex-col h-full overflow-hidden', props.class)"
		role="region"
		aria-label="Timeline schedule"
	>
		<ScheduleTimelineHeader
			:columns="headerColumns"
			:column-width="columnWidth"
			:employee-column-width="employeeColumnWidth"
			:scroll-offset="headerScrollLeft"
			@day-click="emit('day-click', $event)"
		>
			<template #employee-header>
				<slot name="employee-header" />
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
						class="flex items-center h-10 w-fit border-b border-border/60 bg-background select-none"
						:style="{ minWidth: `${employeeColumnWidth + dateColumns.length * columnWidth}px` }"
					>
						<Button
							variant="ghost"
							class="sticky left-0 flex-shrink-0 justify-start gap-2 bg-background px-3 h-full rounded-none"
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

				<template v-else-if="item.kind === 'department-subheader'">
					<div class="flex items-center border-b border-border/60 bg-background w-fit min-w-full">
						<div
							class="sticky left-0 flex-shrink-0 flex items-center gap-1.5 bg-background border-r border-border/60 px-3 py-1.5"
							:style="{
								width: `${employeeColumnWidth}px`,
								minWidth: `${employeeColumnWidth}px`,
								zIndex: Z.rowStickyColumn,
							}"
						>
							<span class="text-2xs font-medium text-muted-foreground"> Employee </span>
							<div class="flex items-center gap-0.5 ml-auto">
								<slot name="employee-actions" />
							</div>
						</div>
						<div class="flex">
							<div
								v-for="(_, idx) in dateColumns"
								:key="idx"
								class="flex-shrink-0 border-r border-border/40"
								:style="{ width: `${columnWidth}px` }"
							/>
						</div>
					</div>
				</template>

				<template v-else-if="item.kind === 'department-row' || item.kind === 'flat-row'">
					<ScheduleTimelineWeekRow
						:employee="item.row.employee"
						:date-columns="dateColumns"
						:days="item.row.days"
						:column-width="columnWidth"
						:employee-column-width="employeeColumnWidth"
						:selected-set="selectedSet"
						:class="rowClass ? rowClass(item.row) : undefined"
						density="card"
						@employee-click="
							(id: string, e: MouseEvent | KeyboardEvent) => emit('employee-click', id, e)
						"
						@shift-click="onShiftClick"
						@shift-select="(id: string) => emit('shift-select', id, true)"
						@shift-contextmenu="onShiftContextMenu"
					>
						<template v-if="$slots['shift-wrapper']" #shift-wrapper="slotProps">
							<slot name="shift-wrapper" v-bind="slotProps" />
						</template>
					</ScheduleTimelineWeekRow>
				</template>

				<template v-else-if="item.kind === 'department-legend'">
					<ScheduleTimelineLegend
						:items="item.dept.legend ?? []"
						:employee-column-width="employeeColumnWidth"
						:timeline-width="dateColumns.length * columnWidth"
					/>
				</template>
			</template>
		</ScheduleTimelineVirtualScroll>
	</div>
</template>

<script setup lang="ts">
import { computed, shallowRef, toRef, watch } from 'vue';
import type { ClassValue } from 'clsx';
import { EDateFormat, type ForgeDate } from '@fromforgesoftware/ts-kit';
import { ChevronDown, ChevronRight, Pencil, LayoutGrid } from '@lucide/vue';
import { cn } from '../../../../helpers/cn';
import type {
	ScheduleTimelineDepartment,
	ScheduleTimelineEmployeeRow as ScheduleTimelineEmployeeRowData,
	ScheduleTimelineShift,
	ShiftClickEvent,
	ShiftContextMenuEvent,
} from '../schedule-timeline';
import ScheduleTimelineHeader, {
	type ScheduleTimelineHeaderColumn,
} from '../shared/ScheduleTimelineHeader.vue';
import ScheduleTimelineWeekRow from './ScheduleTimelineWeekRow.vue';
import ScheduleTimelineLegend from '../shared/ScheduleTimelineLegend.vue';
import ScheduleTimelineVirtualScroll from '../shared/ScheduleTimelineVirtualScroll.vue';
import Button from '../../../general/button/Button.vue';
import Icon from '../../../general/icon/Icon.vue';
import { buildDayRange, isWeekendDay, selectionKey, ScheduleTimelineZ as Z } from '../utils';
import { useScheduleTimelineLayout } from '../useScheduleTimelineLayout';
import { useDayTick } from '../useNowTick';

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
		minColumnWidth: 140,
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

const weekDays = computed<ForgeDate[]>(() => {
	if (props.dateRange) return buildDayRange(props.dateRange.from, props.dateRange.to);
	const start = props.selectedDate.startOf('week');
	return Array.from({ length: 7 }, (_, i) => start.plus({ days: i }));
});

const dateColumns = computed(() => weekDays.value.map((d) => d.toISODate()));

const { today } = useDayTick();
const headerColumns = computed<ScheduleTimelineHeaderColumn[]>(() =>
	weekDays.value.map((day) => ({
		label: day.format(EDateFormat.DayWeekMonth),
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
	columnCount: computed(() => weekDays.value.length),
	defaultCollapsed: toRef(props, 'defaultCollapsed'),
	initialColumnWidth: 140,
});

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
	| { kind: 'department-subheader'; dept: ScheduleTimelineDepartment }
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
			out.push({ kind: 'department-subheader', dept });
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
		case 'department-subheader':
			return 32;
		case 'department-row':
		case 'flat-row':
			return 56;
		case 'department-legend':
			return 32;
	}
}
</script>
