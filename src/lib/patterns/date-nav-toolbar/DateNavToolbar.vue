<template>
	<div :class="rootClasses" data-slot="date-nav-toolbar">
		<div :class="dateNavToolbarLeftClusterVariants()">
			<ToggleGroup type="single" :model-value="view" @update:model-value="onViewChange">
				<ToggleGroupItem
					v-for="v in views"
					:key="v.value"
					:value="v.value"
					size="sm"
					data-slot="date-nav-toolbar-view"
					:data-view="v.value"
				>
					{{ v.label }}
				</ToggleGroupItem>
			</ToggleGroup>

			<div :class="dateNavToolbarNavGroupVariants()">
				<Tooltip :content="prevLabel">
					<Button
						variant="outline"
						size="icon"
						data-slot="date-nav-toolbar-prev"
						:aria-label="prevLabel"
						@click="emit('prev')"
					>
						<Icon :icon="ChevronLeft" size="sm" />
					</Button>
				</Tooltip>

				<MonthPicker
					v-if="resolvedPickerType === 'month'"
					variant="button"
					:model-value="selectedDate"
					:label="label"
					@update:model-value="onPickDate"
				/>
				<YearPicker
					v-else-if="resolvedPickerType === 'year'"
					variant="button"
					:model-value="selectedDate"
					:label="label"
					@update:model-value="onPickDate"
				/>
				<!--
          Week view uses DateRangePicker so the entire week is visually
          highlighted as a connected range — DateRangePicker already handles
          the range styling natively, no custom selection-unit logic needed.
          We adapt at the boundary: convert the single `selectedDate` into
          `{ start, end }` for the picker, and emit `range.start` back as the
          new `selectedDate`. Single-date `presets` are converted to range
          presets that span the whole week containing each preset's date.
        -->
				<DateRangePicker
					v-else-if="resolvedSelectionUnit === 'week'"
					variant="button"
					:number-of-months="1"
					:month-year-select="monthYearSelect"
					:model-value="weekRangeValue"
					:label="label"
					:presets="weekRangePresets"
					@update:model-value="onPickRange"
				/>
				<DatePicker
					v-else
					variant="button"
					:month-year-select="monthYearSelect"
					:model-value="selectedDate"
					:label="label"
					:presets="presets"
					@update:model-value="onPickDate"
				/>

				<Tooltip :content="nextLabel">
					<Button
						variant="outline"
						size="icon"
						data-slot="date-nav-toolbar-next"
						:aria-label="nextLabel"
						@click="emit('next')"
					>
						<Icon :icon="ChevronRight" size="sm" />
					</Button>
				</Tooltip>
			</div>
		</div>

		<div v-if="$slots.actions" :class="dateNavToolbarActionsVariants()">
			<slot name="actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import Tooltip from '../../general/tooltip/Tooltip.vue';
import ToggleGroup from '../../form/toggle-group/ToggleGroup.vue';
import ToggleGroupItem from '../../form/toggle-group/ToggleGroupItem.vue';
import DatePicker from '../../dates/date-picker/DatePicker.vue';
import DateRangePicker from '../../dates/date-range-picker/DateRangePicker.vue';
import MonthPicker from '../../dates/month-picker/MonthPicker.vue';
import YearPicker from '../../dates/year-picker/YearPicker.vue';
import type { DatePickerPreset } from '../../dates/date-picker/date-picker.js';
import type { DateRangePreset } from '../../dates/date-range-picker/date-range-picker.js';
import {
	dateNavToolbarVariants,
	dateNavToolbarLeftClusterVariants,
	dateNavToolbarNavGroupVariants,
	dateNavToolbarActionsVariants,
	type DateNavToolbarView,
	type DateNavToolbarPickerType,
} from './date-nav-toolbar.js';

interface Props {
	view: string;
	views: DateNavToolbarView[];
	selectedDate: ForgeDate;
	/** Text shown inside the picker's button trigger. When omitted, the picker formats `selectedDate` itself. */
	label?: string;
	/**
	 * Which picker to render. If omitted, derived from `view`:
	 *   `month` → MonthPicker, `year` → YearPicker, anything else → DatePicker.
	 */
	pickerType?: DateNavToolbarPickerType;
	presets?: DatePickerPreset[];
	/** Show month/year selects in the DatePicker header. Default true. */
	monthYearSelect?: boolean;
	/**
	 * Visual selection unit for the date picker. Defaults to the picker type:
	 * `view === 'week'` → `'week'`, otherwise `'day'`. Set explicitly to opt
	 * a non-week view into week-highlighting (or vice versa).
	 */
	selectionUnit?: 'day' | 'week' | 'month';
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	monthYearSelect: true,
});

const emit = defineEmits<{
	'update:view': [view: string];
	'update:selectedDate': [date: ForgeDate];
	prev: [];
	next: [];
}>();

const prevLabel = computed(() => 'Previous');
const nextLabel = computed(() => 'Next');

const resolvedPickerType = computed<DateNavToolbarPickerType>(() => {
	if (props.pickerType) return props.pickerType;
	if (props.view === 'month') return 'month';
	if (props.view === 'year') return 'year';
	return 'date';
});

// Auto-pick `'week'` for the week view so the date picker shows the whole
// week as a connected range via DateRangePicker. Other views default to
// `'day'`. Consumers can override with the explicit prop.
const resolvedSelectionUnit = computed<'day' | 'week' | 'month'>(() => {
	if (props.selectionUnit) return props.selectionUnit;
	if (props.view === 'week') return 'week';
	return 'day';
});

// Adapt the single `selectedDate` to a `{ start, end }` range that spans the
// whole week so DateRangePicker can highlight it natively.
const weekRangeValue = computed(() => ({
	start: props.selectedDate.startOf('week'),
	end: props.selectedDate.endOf('week'),
}));

// Convert the consumer's single-date presets into range presets where each
// preset spans the full week containing the preset's date. Lets the existing
// `defaultWeekPickerPresets` keep working with no consumer-side change.
const weekRangePresets = computed<DateRangePreset[] | undefined>(() => {
	if (!props.presets?.length) return undefined;
	return props.presets.map((p) => ({
		id: p.id,
		label: p.label,
		range: () => {
			const d = p.date();
			return { start: d.startOf('week'), end: d.endOf('week') };
		},
	}));
});

const rootClasses = computed(() => cn(dateNavToolbarVariants(), props.class));

function onViewChange(value: string | string[]) {
	if (typeof value === 'string' && value) emit('update:view', value);
}

function onPickDate(date: ForgeDate | null) {
	if (date) emit('update:selectedDate', date);
}

function onPickRange(range: { start: ForgeDate; end: ForgeDate } | null) {
	if (range) emit('update:selectedDate', range.start);
}
</script>
