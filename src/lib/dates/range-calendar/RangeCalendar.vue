<template>
	<div data-slot="range-calendar" :class="cn('flex', rootClasses)">
		<DateRangePresets
			v-if="presets?.length"
			:presets="presets"
			:active-preset-id="activePresetId"
			@select="onPresetSelect"
		/>
		<RangeCalendarRoot
			v-model:placeholder="placeholder"
			:model-value="rekaValue"
			:min-value="rekaMin"
			:max-value="rekaMax"
			:locale="locale"
			:number-of-months="numberOfMonths"
			:week-starts-on="resolvedWeekStart"
			:fixed-weeks="fixedWeeks"
			:disabled="disabled"
			data-slot="range-calendar-root"
			:class="panelClasses"
			@update:model-value="onUpdate"
		>
			<template #default="{ grid, weekDays, date }">
				<RangeCalendarHeader
					data-slot="range-calendar-header"
					:class="rangeCalendarHeaderVariants()"
				>
					<RangeCalendarPrev
						data-slot="range-calendar-prev"
						aria-label="Previous month"
						:class="navButtonClasses"
					>
						<Icon :icon="ChevronLeft" size="sm" />
					</RangeCalendarPrev>

					<template v-if="monthYearSelect">
						<div data-slot="range-calendar-month-year-select" class="flex items-center gap-1">
							<select
								:value="date.month"
								data-slot="range-calendar-month-select"
								aria-label="Month"
								:class="selectClasses"
								@change="onMonthChange($event, date)"
							>
								<option v-for="m in monthNames" :key="m.value" :value="m.value">
									{{ m.label }}
								</option>
							</select>
							<select
								:value="date.year"
								data-slot="range-calendar-year-select"
								aria-label="Year"
								:class="selectClasses"
								@change="onYearChange($event, date)"
							>
								<option v-for="y in yearRange" :key="y" :value="y">
									{{ y }}
								</option>
							</select>
						</div>
					</template>
					<RangeCalendarHeading v-else data-slot="range-calendar-heading" :class="headingClasses" />

					<RangeCalendarNext
						data-slot="range-calendar-next"
						aria-label="Next month"
						:class="navButtonClasses"
					>
						<Icon :icon="ChevronRight" size="sm" />
					</RangeCalendarNext>
				</RangeCalendarHeader>

				<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
					<RangeCalendarGrid
						v-for="month in grid"
						:key="month.value.toString()"
						data-slot="range-calendar-grid"
						:class="rangeCalendarGridVariants()"
					>
						<RangeCalendarGridHead data-slot="range-calendar-grid-head">
							<RangeCalendarGridRow :class="rangeCalendarGridRowVariants()">
								<RangeCalendarHeadCell
									v-for="day in weekDays"
									:key="day"
									data-slot="range-calendar-head-cell"
									:class="headCellClasses"
								>
									{{ day }}
								</RangeCalendarHeadCell>
							</RangeCalendarGridRow>
						</RangeCalendarGridHead>
						<RangeCalendarGridBody data-slot="range-calendar-grid-body" class="grid">
							<RangeCalendarGridRow
								v-for="(week, weekIdx) in month.rows"
								:key="`week-${weekIdx}`"
								data-slot="range-calendar-grid-row"
								class="grid grid-cols-7"
							>
								<RangeCalendarCell
									v-for="day in week"
									:key="day.toString()"
									:date="day"
									data-slot="range-calendar-cell"
									:class="cellClasses"
								>
									<RangeCalendarCellTrigger
										:day="day"
										:month="month.value"
										data-slot="range-calendar-cell-trigger"
										:class="cellTriggerClasses"
									/>
								</RangeCalendarCell>
							</RangeCalendarGridRow>
						</RangeCalendarGridBody>
					</RangeCalendarGrid>
				</div>
			</template>
		</RangeCalendarRoot>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ChevronLeft, ChevronRight } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import {
	RangeCalendarRoot,
	RangeCalendarHeader,
	RangeCalendarHeading,
	RangeCalendarPrev,
	RangeCalendarNext,
	RangeCalendarGrid,
	RangeCalendarGridHead,
	RangeCalendarGridBody,
	RangeCalendarGridRow,
	RangeCalendarHeadCell,
	RangeCalendarCell,
	RangeCalendarCellTrigger,
} from 'reka-ui';
import { CalendarDate, type DateValue } from '@internationalized/date';
import { type ForgeDate, getWeekStartForCalendar } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaDate, toRekaRange, rekaRangeToForgeDateRange } from '../_adapter';
import DateRangePresets from '../date-range-picker/DateRangePresets.vue';
import type { DateRangePreset } from '../date-range-picker/date-range-picker';
import {
	rangeCalendarRootVariants,
	rangeCalendarPanelVariants,
	rangeCalendarHeaderVariants,
	rangeCalendarHeadingVariants,
	rangeCalendarSelectVariants,
	rangeCalendarNavButtonVariants,
	rangeCalendarGridVariants,
	rangeCalendarGridRowVariants,
	rangeCalendarHeadCellVariants,
	rangeCalendarCellVariants,
	rangeCalendarCellTriggerVariants,
	type RangeCalendarVariants,
} from './range-calendar';

interface Props {
	/** Selected range (start + end). */
	modelValue?: { start: ForgeDate; end: ForgeDate } | null;
	/** Earliest selectable date. */
	minValue?: ForgeDate;
	/** Latest selectable date. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for month/weekday names. */
	locale?: string;
	/** Number of months to render side-by-side. */
	numberOfMonths?: number;
	/** First day of week (0 = Sunday … 6 = Saturday). Defaults to user preference. */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	/** Pads weeks so every month has 6 rows — keeps height stable. */
	fixedWeeks?: boolean;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Optional preset list rendered in a sidebar (Today, This Week, Last Month…). */
	presets?: DateRangePreset[];
	/** Replace the heading label with month + year `<select>` controls. */
	monthYearSelect?: boolean;
	/** Density. `sm` = 28px cells, `default` = 32px, `lg` = 36px. */
	size?: RangeCalendarVariants['size'];
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	numberOfMonths: 1,
	fixedWeeks: true,
	disabled: false,
	monthYearSelect: false,
	size: 'default',
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartForCalendar());

const emit = defineEmits<{
	'update:modelValue': [value: { start: ForgeDate; end: ForgeDate }];
}>();

const placeholder = ref<DateValue>();

const rekaValue = computed(() => toRekaRange(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

const activePresetId = ref<string | null>(null);

function onUpdate(value: { start?: DateValue; end?: DateValue }) {
	const result = rekaRangeToForgeDateRange(value);
	if (result) {
		activePresetId.value = null;
		emit('update:modelValue', result);
	}
}

function onPresetSelect(range: { start: ForgeDate; end: ForgeDate }, presetId: string) {
	activePresetId.value = presetId;
	emit('update:modelValue', range);
}

const monthNames = computed(() => {
	const formatter = new Intl.DateTimeFormat(props.locale, { month: 'long' });
	return Array.from({ length: 12 }, (_, i) => ({
		value: i + 1,
		label: formatter.format(new Date(2000, i, 1)),
	}));
});

const yearRange = computed(() => {
	const current = placeholder.value?.year ?? new Date().getFullYear();
	const start = current - 100;
	const end = current + 10;
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

function onMonthChange(event: Event, date: DateValue) {
	const month = Number((event.target as HTMLSelectElement).value);
	placeholder.value = new CalendarDate(date.year, month, 1);
}

function onYearChange(event: Event, date: DateValue) {
	const year = Number((event.target as HTMLSelectElement).value);
	placeholder.value = new CalendarDate(year, date.month, 1);
}

const rootClasses = computed(() =>
	cn(rangeCalendarRootVariants({ size: props.size }), props.class),
);
const panelClasses = computed(() => rangeCalendarPanelVariants({ size: props.size }));
const headingClasses = computed(() => rangeCalendarHeadingVariants({ size: props.size }));
const navButtonClasses = computed(() => rangeCalendarNavButtonVariants({ size: props.size }));
const selectClasses = computed(() => rangeCalendarSelectVariants({ size: props.size }));
const headCellClasses = computed(() => rangeCalendarHeadCellVariants({ size: props.size }));
const cellClasses = computed(() => rangeCalendarCellVariants({ size: props.size }));
const cellTriggerClasses = computed(() => rangeCalendarCellTriggerVariants({ size: props.size }));
</script>
