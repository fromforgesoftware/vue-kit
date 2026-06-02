<template>
	<div
		data-slot="schedule-timeline-employee-row"
		:data-employee-id="employee.id"
		:class="
			cn(
				// Opaque hover (no /30 alpha) so the sticky employee cell's
				// `bg-inherit` doesn't reveal scrolled shifts behind it.
				'flex items-stretch border-b border-border/60 bg-background hover:bg-row-hover transition-colors w-fit min-w-full',
				props.class,
			)
		"
	>
		<!-- Employee info cell (sticky left). Only this cell is clickable for
         `employee-click` — clicking the rest of the row no longer navigates
         to the employee. -->
		<div
			data-slot="schedule-timeline-employee-cell"
			role="button"
			tabindex="0"
			:aria-label="employee.name"
			class="sticky left-0 flex-shrink-0 flex items-center gap-2.5 bg-inherit border-r border-border/60 px-3 py-2 transition-colors cursor-pointer hover:bg-muted/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
			:style="{
				width: `${employeeColumnWidth}px`,
				minWidth: `${employeeColumnWidth}px`,
				zIndex: Z.rowStickyColumn,
			}"
			@click="onRowClick"
			@keydown="onCellKeydown"
		>
			<div class="relative flex-shrink-0">
				<Avatar :src="employee.avatarUrl" :name="employee.name" size="sm" />
				<!-- Status indicator dot -->
				<span
					v-if="employee.status"
					class="absolute -bottom-0.5 -right-0.5 size-2.5 rounded-full border-2 border-background"
					:class="employee.status === 'online' ? 'bg-success' : 'bg-muted-foreground/40'"
				/>
			</div>
			<div class="flex flex-col min-w-0">
				<span class="text-sm font-medium text-foreground truncate leading-tight">
					{{ employee.name }}
				</span>
				<ScheduleTimelineEmployeeMeta :employee="employee" />
			</div>
		</div>

		<!-- Day columns -->
		<div class="flex">
			<div
				v-for="dateStr in dateColumns"
				:key="dateStr"
				class="flex-shrink-0 flex flex-col gap-1 px-1 py-1.5 border-r border-border/40 min-h-[56px] justify-start"
				:style="{ width: `${columnWidth}px` }"
			>
				<!-- OFF day -->
				<template v-if="getDayCell(dateStr).isOff">
					<span class="text-2xs font-medium text-muted-foreground text-center select-none">
						Off
					</span>
				</template>

				<template v-for="cellShift in cellShiftsByDate[dateStr] ?? []" :key="cellShift.shift.id">
					<slot
						name="shift-wrapper"
						:shift="cellShift.shift"
						:shifts="getDayCell(dateStr).shifts"
						:idx="cellShift.idx"
						:date-str="dateStr"
						:employee-id="employee.id"
						:style="{}"
						:data-attrs="{
							'data-shift-id': cellShift.shift.id,
							'data-employee-id': employee.id,
							'data-date': dateStr,
						}"
						:aria-label="cellShift.ariaLabel"
						:selected="cellShift.selected"
					>
						<div
							:data-employee-id="employee.id"
							:data-date="dateStr"
							role="button"
							tabindex="0"
							:aria-label="cellShift.ariaLabel"
							:aria-pressed="cellShift.selected"
							:class="cn(cellShift.selected && 'ring-2 ring-primary ring-offset-1 rounded-md')"
							@click.stop="(e: MouseEvent) => onShiftClick(e, cellShift.shift, dateStr)"
							@contextmenu.stop="(e: MouseEvent) => onShiftContextMenu(e, cellShift.shift, dateStr)"
							@keydown="(e: KeyboardEvent) => onShiftKeydown(e, cellShift.shift, dateStr)"
						>
							<TimeRangeBar
								:data-shift-id="cellShift.shift.id"
								density="card"
								:duration-sec="cellShift.shift.durationSec ?? 0"
								:start-time-sec="shiftStartSec(cellShift.shift)"
								:segments="shiftChildrenToSegments(cellShift.shift)"
								:variant="shiftVariantToSegmentVariant(cellShift.shift.variant)"
								:readonly="true"
								:editable="false"
								:show-labels="false"
								:show-ruler="false"
							>
								<template #card-content>
									<!-- Row 1: leading indicators + icon + title + warnings + lock -->
									<div class="flex items-center gap-1 min-w-0">
										<ScheduleTimelineIndicator v-if="cellShift.shift.isSwap" type="swap" />
										<ScheduleTimelineIndicator v-if="cellShift.shift.isCovering" type="covering" />
										<ScheduleTimelineIndicator v-if="cellShift.shift.isSick" type="sick" />

										<Icon
											v-if="cellShift.shift.icon"
											:icon="cellShift.shift.icon"
											size="xs-sm"
											class="opacity-80"
											aria-hidden="true"
										/>

										<span class="truncate text-xs font-semibold">{{ cellShift.shift.name }}</span>

										<span
											v-if="cellShift.warnings.length > 0"
											class="ml-auto shrink-0 inline-flex"
											:title="cellShift.warnings.join('\n')"
											:aria-label="`${cellShift.warnings.length} warning(s)`"
										>
											<Icon :icon="AlertTriangle" size="xs" class="text-warning" />
										</span>

										<Icon
											v-if="cellShift.locked"
											:icon="Lock"
											size="xs"
											:class="cellShift.warnings.length > 0 ? 'opacity-80' : 'opacity-80 ml-auto'"
											aria-label="Locked"
										/>
									</div>

									<div
										v-if="cellShift.shift.timeRange || cellShift.durationLabel"
										class="flex items-center justify-between gap-1.5 text-xs leading-tight"
									>
										<span class="truncate">{{ cellShift.shift.timeRange }}</span>
										<span v-if="cellShift.durationLabel" class="shrink-0 opacity-80"
											>({{ cellShift.durationLabel }})</span
										>
									</div>
								</template>
							</TimeRangeBar>
						</div>
					</slot>
				</template>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { ClassValue } from 'clsx';
import { Lock, AlertTriangle } from '@lucide/vue';
import { cn } from '../../../../helpers/cn';
import Avatar from '../../../general/avatar/Avatar.vue';
import Icon from '../../../general/icon/Icon.vue';
import TimeRangeBar from '../../time-range-bar/TimeRangeBar.vue';
import type {
	ScheduleTimelineEmployee,
	ScheduleTimelineDayCell,
	ScheduleTimelineShift,
} from '../schedule-timeline';
import { shiftChildrenToSegments, shiftVariantToSegmentVariant } from '../schedule-timeline';
import { formatShiftDuration, shiftStartSec, ScheduleTimelineZ as Z } from '../utils';
import ScheduleTimelineEmployeeMeta from '../shared/ScheduleTimelineEmployeeMeta.vue';
import ScheduleTimelineIndicator from '../shared/ScheduleTimelineIndicator.vue';

const props = defineProps<{
	employee: ScheduleTimelineEmployee;
	/** Ordered list of date strings for the columns */
	dateColumns: string[];
	/** Day cells keyed by date string */
	days: Record<string, ScheduleTimelineDayCell>;
	/** Width of each day column in pixels */
	columnWidth: number;
	/** Width of the employee column in pixels */
	employeeColumnWidth: number;
	/** Pre-computed selection set (lifted from the view). */
	selectedSet?: Set<string>;
	class?: ClassValue;
}>();

const emit = defineEmits<{
	'employee-click': [employeeId: string, event: MouseEvent | KeyboardEvent];
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
	return props.days[dateStr] ?? { shifts: [] };
}

// Per-cell derived view-model: pre-resolves the values the template would
// otherwise call functions for (selected/warnings/locked/durationLabel/ariaLabel).
interface CellShift {
	shift: ScheduleTimelineShift;
	idx: number;
	selected: boolean;
	warnings: string[];
	locked: boolean;
	durationLabel: string;
	ariaLabel: string;
}

// Memoize one CellShift array per date column. Without this each cell
// re-derives its view-model on every reactive read (selection, hover),
// allocating fresh arrays/objects throughout the visible week.
const cellShiftsByDate = computed<Record<string, CellShift[]>>(() => {
	const out: Record<string, CellShift[]> = {};
	const selected = props.selectedSet;
	for (const dateStr of props.dateColumns) {
		const cell = getDayCell(dateStr);
		out[dateStr] = cell.shifts.map((shift, idx) => {
			const warnings = shift.warnings ?? [];
			const durationLabel = formatShiftDuration(shift.durationSec);
			return {
				shift,
				idx,
				selected: selected?.has(shift.id) ?? false,
				warnings,
				locked: shift.isLocked ?? false,
				durationLabel,
				ariaLabel:
					`${shift.name} ${shift.timeRange}${durationLabel ? ` (${durationLabel})` : ''}`.trim(),
			};
		});
	}
	return out;
});

function onRowClick(e: MouseEvent) {
	emit('employee-click', props.employee.id, e);
}

function onCellKeydown(e: KeyboardEvent) {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	e.preventDefault();
	emit('employee-click', props.employee.id, e);
}

function onShiftClick(e: MouseEvent, shift: ScheduleTimelineShift, dateStr: string) {
	// Stop bubbling so the row's outer onClick (employee-click) doesn't also fire.
	e.stopPropagation();
	if (e.metaKey || e.ctrlKey) {
		emit('shift-select', shift.id);
		return;
	}
	emit('shift-click', { e, shift, employeeId: props.employee.id, dateStr });
}

function onShiftContextMenu(e: MouseEvent, shift: ScheduleTimelineShift, dateStr: string) {
	e.stopPropagation();
	emit('shift-contextmenu', { e, shift, employeeId: props.employee.id, dateStr });
}

function onShiftKeydown(e: KeyboardEvent, shift: ScheduleTimelineShift, dateStr: string) {
	if (e.key !== 'Enter' && e.key !== ' ') return;
	e.preventDefault();
	e.stopPropagation();
	if (e.shiftKey || e.metaKey || e.ctrlKey) {
		emit('shift-select', shift.id);
		return;
	}
	const synthetic = new MouseEvent('click', {
		bubbles: false,
		clientX: 0,
		clientY: 0,
	});
	emit('shift-click', { e: synthetic, shift, employeeId: props.employee.id, dateStr });
}
</script>
