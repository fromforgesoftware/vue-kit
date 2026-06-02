<template>
	<div
		data-slot="schedule-timeline-employee-row"
		:data-employee-id="row.employee.id"
		:class="
			cn(
				'flex items-stretch border-b border-border/60 hover:bg-row-hover transition-colors w-fit min-w-full',
				props.class,
			)
		"
		style="min-height: 44px"
	>
		<div
			data-slot="schedule-timeline-employee-cell"
			role="button"
			tabindex="0"
			:aria-label="row.employee.name"
			class="sticky left-0 flex-shrink-0 flex flex-col justify-center bg-background border-r border-border/60 px-2 py-1 hover:bg-muted/50 transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			:style="{
				width: `${employeeColumnWidth}px`,
				minWidth: `${employeeColumnWidth}px`,
				zIndex: Z.rowStickyColumn,
			}"
			@click="onRowClick"
			@keydown="onCellKeydown"
		>
			<div class="flex items-center gap-2">
				<Avatar
					:src="row.employee.avatarUrl"
					:name="row.employee.name"
					size="xs"
					class="flex-shrink-0"
				/>
				<span class="text-2xs font-medium text-foreground truncate">
					{{ row.employee.name }}
				</span>
			</div>
		</div>
		<div class="flex">
			<div
				v-for="dateStr in dateColumns"
				:key="dateStr"
				data-slot="schedule-timeline-month-cell"
				:data-date="dateStr"
				class="flex-shrink-0 flex flex-col gap-px p-px border-r border-border/40 overflow-hidden"
				:style="{ width: `${columnWidth}px` }"
			>
				<template v-if="getDayCell(dateStr).isOff">
					<span class="text-3xs text-muted-foreground text-center mt-1 select-none"> Off </span>
				</template>
				<template v-else>
					<template v-for="(shift, idx) in getVisibleShifts(getDayCell(dateStr))" :key="shift.id">
						<slot
							name="shift-wrapper"
							:shift="shift"
							:shifts="getDayCell(dateStr).shifts"
							:idx="idx"
							:date-str="dateStr"
							:employee-id="row.employee.id"
							:style="{}"
							:data-attrs="{
								'data-shift-id': shift.id,
								'data-employee-id': row.employee.id,
								'data-date': dateStr,
							}"
							:aria-label="`${shift.name} ${shift.timeRange}`.trim()"
							:selected="props.selectedSet?.has(shift.id) ?? false"
						>
							<div
								:data-employee-id="row.employee.id"
								:data-date="dateStr"
								role="button"
								tabindex="0"
								:aria-label="`${shift.name} ${shift.timeRange}`.trim()"
								:aria-pressed="props.selectedSet?.has(shift.id) ?? false"
								:class="
									cn(
										(props.selectedSet?.has(shift.id) ?? false) &&
											'ring-2 ring-primary ring-offset-1 rounded-md',
									)
								"
								@click.stop="(e: MouseEvent) => onShiftClick(e, shift, dateStr)"
								@contextmenu.stop="(e: MouseEvent) => onShiftContextMenu(e, shift, dateStr)"
								@keydown="(e: KeyboardEvent) => onShiftKeydown(e, shift, dateStr)"
							>
								<TimeRangeBar
									:data-shift-id="shift.id"
									density="pill"
									:duration-sec="shift.durationSec ?? 0"
									:start-time-sec="shiftStartSec(shift)"
									:segments="shiftChildrenToSegments(shift)"
									:variant="shiftVariantToSegmentVariant(shift.variant)"
									:readonly="true"
									:editable="false"
									:show-labels="false"
									:show-ruler="false"
									:title="`${shift.name} (${shift.timeRange})`"
								/>
							</div>
						</slot>
					</template>
					<Button
						v-if="!isExpanded && getOverflow(getDayCell(dateStr)) > 0"
						variant="link"
						size="xs"
						class="mx-auto"
						@click.stop="onToggleExpand"
					>
						+{{ getOverflow(getDayCell(dateStr)) }}
					</Button>
				</template>
			</div>
		</div>
		<Button
			v-if="isExpanded"
			variant="link"
			size="xs"
			class="sticky right-0 self-end px-2 py-1"
			:style="{ zIndex: Z.rowStickyColumn }"
			@click.stop="onToggleExpand"
		>
			Show less
		</Button>
	</div>
</template>

<script setup lang="ts">
import type { ClassValue } from 'clsx';
import { cn } from '../../../../helpers/cn';
import Avatar from '../../../general/avatar/Avatar.vue';
import Button from '../../../general/button/Button.vue';
import TimeRangeBar from '../../time-range-bar/TimeRangeBar.vue';
import type {
	ScheduleTimelineEmployeeRow as ScheduleTimelineEmployeeRowData,
	ScheduleTimelineDayCell,
	ScheduleTimelineShift,
} from '../schedule-timeline';
import { shiftChildrenToSegments, shiftVariantToSegmentVariant } from '../schedule-timeline';
import {
	getMonthOverflow,
	MAX_VISIBLE_MONTH_SHIFTS,
	shiftStartSec,
	ScheduleTimelineZ as Z,
} from '../utils';

const props = withDefaults(
	defineProps<{
		row: ScheduleTimelineEmployeeRowData;
		dateColumns: string[];
		columnWidth: number;
		employeeColumnWidth: number;
		isExpanded?: boolean;
		/** Pre-computed selection set (lifted from the view). */
		selectedSet?: Set<string>;
		class?: ClassValue;
	}>(),
	{
		isExpanded: false,
	},
);

const emit = defineEmits<{
	'employee-click': [employeeId: string, event: MouseEvent | KeyboardEvent];
	'toggle-expand': [employeeId: string];
	'shift-click': [
		payload: {
			e: MouseEvent;
			shift: ScheduleTimelineShift;
			employeeId: string;
			dateStr: string;
		},
	];
	'shift-select': [shiftId: string];
	'shift-contextmenu': [
		payload: {
			e: MouseEvent;
			shift: ScheduleTimelineShift;
			employeeId: string;
			dateStr: string;
		},
	];
}>();

function getDayCell(dateStr: string): ScheduleTimelineDayCell {
	return props.row.days[dateStr] ?? { shifts: [] };
}

function getVisibleShifts(cell: ScheduleTimelineDayCell): ScheduleTimelineShift[] {
	if (props.isExpanded) return cell.shifts;
	return cell.shifts.slice(0, MAX_VISIBLE_MONTH_SHIFTS);
}

function getOverflow(cell: ScheduleTimelineDayCell): number {
	return getMonthOverflow(cell);
}

function onRowClick(e: MouseEvent) {
	emit('employee-click', props.row.employee.id, e);
}

function onCellKeydown(e: KeyboardEvent) {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	e.preventDefault();
	emit('employee-click', props.row.employee.id, e);
}

function onToggleExpand() {
	emit('toggle-expand', props.row.employee.id);
}

function onShiftClick(e: MouseEvent, shift: ScheduleTimelineShift, dateStr: string) {
	e.stopPropagation();
	if (e.metaKey || e.ctrlKey) {
		emit('shift-select', shift.id);
		return;
	}
	emit('shift-click', { e, shift, employeeId: props.row.employee.id, dateStr });
}

function onShiftContextMenu(e: MouseEvent, shift: ScheduleTimelineShift, dateStr: string) {
	e.stopPropagation();
	emit('shift-contextmenu', { e, shift, employeeId: props.row.employee.id, dateStr });
}

function onShiftKeydown(e: KeyboardEvent, shift: ScheduleTimelineShift, dateStr: string) {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	e.preventDefault();
	e.stopPropagation();
	if (e.shiftKey || e.metaKey || e.ctrlKey) {
		emit('shift-select', shift.id);
		return;
	}
	const synthetic = new MouseEvent('click', { bubbles: false, clientX: 0, clientY: 0 });
	emit('shift-click', { e: synthetic, shift, employeeId: props.row.employee.id, dateStr });
}
</script>
