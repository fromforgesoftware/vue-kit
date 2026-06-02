<template>
	<DateRangePickerRoot
		v-model:placeholder="calendarPlaceholder"
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:granularity="granularity"
		:number-of-months="numberOfMonths"
		:week-starts-on="resolvedWeekStart"
		:fixed-weeks="fixedWeeks"
		:disabled="disabled"
		:readonly="readonly"
		@update:model-value="onUpdate"
		@update:open="emit('update:open', $event)"
	>
		<!-- Button variant: single button trigger -->
		<DateRangePickerTrigger
			v-if="variant === 'button'"
			as="button"
			data-slot="date-range-picker-trigger"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:class="buttonTriggerClasses"
		>
			<Icon :icon="CalendarIcon" size="sm" />
			<template v-if="startLabel">
				{{ startLabel }}
				<Icon :icon="ArrowRight" size="xs-sm" class="text-muted-foreground" />
				{{ endLabel }}
			</template>
			<template v-else>{{ placeholder }}</template>
		</DateRangePickerTrigger>

		<!-- Field variant (default): segmented date input -->
		<DateRangePickerField
			v-else
			v-slot="{ segments }"
			data-slot="date-range-picker-field"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:class="fieldClasses"
		>
			<div class="flex items-center">
				<template v-for="item in segments.start" :key="`start-${item.part}`">
					<DateRangePickerInput
						v-if="item.part === 'literal'"
						:part="item.part"
						type="start"
						data-slot="date-range-picker-literal"
					>
						{{ item.value }}
					</DateRangePickerInput>
					<DateRangePickerInput
						v-else
						:part="item.part"
						type="start"
						data-slot="date-range-picker-segment"
						:class="dateRangePickerInputVariants()"
					>
						{{ item.value }}
					</DateRangePickerInput>
				</template>

				<span class="mx-1 text-muted-foreground">–</span>

				<template v-for="item in segments.end" :key="`end-${item.part}`">
					<DateRangePickerInput
						v-if="item.part === 'literal'"
						:part="item.part"
						type="end"
						data-slot="date-range-picker-literal"
					>
						{{ item.value }}
					</DateRangePickerInput>
					<DateRangePickerInput
						v-else
						:part="item.part"
						type="end"
						data-slot="date-range-picker-segment"
						:class="dateRangePickerInputVariants()"
					>
						{{ item.value }}
					</DateRangePickerInput>
				</template>
			</div>

			<DateRangePickerTrigger
				as="button"
				data-slot="date-range-picker-trigger"
				aria-label="Open calendar"
				:class="dateRangePickerTriggerVariants()"
			>
				<Icon :icon="CalendarIcon" size="sm" />
			</DateRangePickerTrigger>
		</DateRangePickerField>

		<DateRangePickerContent
			data-slot="date-range-picker-content"
			:class="dateRangePickerContentVariants()"
			:side-offset="4"
			:collision-padding="8"
			align="start"
		>
			<div class="flex">
				<DateRangePresets
					v-if="presets?.length"
					:presets="presets"
					:active-preset-id="activePresetId"
					@select="onPresetSelect"
				/>

				<DateRangePickerCalendar
					v-slot="{ grid, weekDays, date }"
					data-slot="date-range-picker-calendar"
					:class="dateRangePickerCalendarVariants({ size })"
				>
					<DateRangePickerHeader
						data-slot="date-range-picker-header"
						:class="dateRangePickerHeaderVariants()"
					>
						<DateRangePickerPrev
							data-slot="date-range-picker-prev"
							aria-label="Previous month"
							:class="dateRangePickerNavButtonVariants({ size })"
						>
							<Icon :icon="ChevronLeft" size="sm" />
						</DateRangePickerPrev>

						<template v-if="monthYearSelect">
							<div data-slot="date-range-picker-month-year-select" class="flex items-center gap-1">
								<select
									:value="date.month"
									data-slot="date-range-picker-month-select"
									aria-label="Month"
									:class="dateRangePickerSelectVariants({ size })"
									@change="onMonthChange($event, date)"
								>
									<option v-for="m in monthNames" :key="m.value" :value="m.value">
										{{ m.label }}
									</option>
								</select>
								<select
									:value="date.year"
									data-slot="date-range-picker-year-select"
									aria-label="Year"
									:class="dateRangePickerSelectVariants({ size })"
									@change="onYearChange($event, date)"
								>
									<option v-for="y in yearRange" :key="y" :value="y">
										{{ y }}
									</option>
								</select>
							</div>
						</template>
						<DateRangePickerHeading
							v-else
							data-slot="date-range-picker-heading"
							:class="dateRangePickerHeadingVariants({ size })"
						/>

						<DateRangePickerNext
							data-slot="date-range-picker-next"
							aria-label="Next month"
							:class="dateRangePickerNavButtonVariants({ size })"
						>
							<Icon :icon="ChevronRight" size="sm" />
						</DateRangePickerNext>
					</DateRangePickerHeader>

					<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
						<DateRangePickerGrid
							v-for="month in grid"
							:key="month.value.toString()"
							data-slot="date-range-picker-grid"
							:class="dateRangePickerGridVariants()"
						>
							<DateRangePickerGridHead data-slot="date-range-picker-grid-head">
								<DateRangePickerGridRow class="mb-1 grid grid-cols-7">
									<DateRangePickerHeadCell
										v-for="day in weekDays"
										:key="day"
										data-slot="date-range-picker-head-cell"
										:class="dateRangePickerHeadCellVariants({ size })"
									>
										{{ day }}
									</DateRangePickerHeadCell>
								</DateRangePickerGridRow>
							</DateRangePickerGridHead>
							<DateRangePickerGridBody data-slot="date-range-picker-grid-body" class="grid">
								<DateRangePickerGridRow
									v-for="(week, weekIdx) in month.rows"
									:key="`week-${weekIdx}`"
									data-slot="date-range-picker-grid-row"
									class="grid grid-cols-7"
								>
									<DateRangePickerCell
										v-for="day in week"
										:key="day.toString()"
										:date="day"
										data-slot="date-range-picker-cell"
										:class="dateRangePickerCellVariants({ size })"
									>
										<DateRangePickerCellTrigger
											:day="day"
											:month="month.value"
											data-slot="date-range-picker-cell-trigger"
											:class="dateRangePickerCellTriggerVariants({ size })"
										/>
									</DateRangePickerCell>
								</DateRangePickerGridRow>
							</DateRangePickerGridBody>
						</DateRangePickerGrid>
					</div>
				</DateRangePickerCalendar>
			</div>
		</DateRangePickerContent>
	</DateRangePickerRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import {
	DateRangePickerRoot,
	DateRangePickerField,
	DateRangePickerInput,
	DateRangePickerTrigger,
	DateRangePickerContent,
	DateRangePickerCalendar,
	DateRangePickerHeader,
	DateRangePickerHeading,
	DateRangePickerPrev,
	DateRangePickerNext,
	DateRangePickerGrid,
	DateRangePickerGridHead,
	DateRangePickerGridBody,
	DateRangePickerGridRow,
	DateRangePickerHeadCell,
	DateRangePickerCell,
	DateRangePickerCellTrigger,
} from 'reka-ui';
import { CalendarDate, type DateValue } from '@internationalized/date';
import { type ForgeDate, EDateFormat, getWeekStartForCalendar } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaDate, toRekaRange, rekaRangeToForgeDateRange } from '../_adapter';
import { buttonVariants } from '../../general/button/button';
import DateRangePresets from './DateRangePresets.vue';
import type { DateRangePreset, DateRangePickerVariants } from './date-range-picker';
import {
	dateRangePickerFieldVariants,
	dateRangePickerInputVariants,
	dateRangePickerTriggerVariants,
	dateRangePickerContentVariants,
	dateRangePickerCalendarVariants,
	dateRangePickerHeaderVariants,
	dateRangePickerHeadingVariants,
	dateRangePickerSelectVariants,
	dateRangePickerNavButtonVariants,
	dateRangePickerGridVariants,
	dateRangePickerHeadCellVariants,
	dateRangePickerCellVariants,
	dateRangePickerCellTriggerVariants,
} from './date-range-picker';

interface Props {
	/** Selected range (or null when nothing is selected). */
	modelValue?: { start: ForgeDate; end: ForgeDate } | null;
	/** Earliest selectable date. */
	minValue?: ForgeDate;
	/** Latest selectable date. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for month / weekday names and segment ordering. */
	locale?: string;
	/** Smallest segment to show — `day`, `hour`, `minute`, `second`. */
	granularity?: 'day' | 'hour' | 'minute' | 'second';
	/** Number of months rendered in the calendar (1 or 2). */
	numberOfMonths?: number;
	/** First day of week (0 = Sunday … 6 = Saturday). Defaults to user preference. */
	weekStartsOn?: 0 | 1 | 2 | 3 | 4 | 5 | 6;
	/** Pads weeks so every month has 6 rows — keeps height stable. */
	fixedWeeks?: boolean;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Block edits but allow focus and copy. */
	readonly?: boolean;
	/** Optional preset shortcuts (e.g. Last 7 Days). */
	presets?: DateRangePreset[];
	/** Replace the heading label with month + year `<select>` controls. */
	monthYearSelect?: boolean;
	/** Trigger style — single `button` (default) or segmented `field` for fast keyboard entry. */
	variant?: 'field' | 'button';
	/** Visual error state — sets `aria-invalid="true"` and tints the field border. */
	error?: boolean;
	/** id of the element(s) describing the field — error or hint text. */
	describedBy?: string;
	/** Density. Mirrors DateField — `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: DateRangePickerVariants['size'];
	/** Placeholder shown on the button trigger when nothing is selected. */
	placeholder?: string;
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	granularity: 'day',
	numberOfMonths: 2,
	fixedWeeks: true,
	disabled: false,
	readonly: false,
	monthYearSelect: false,
	variant: 'button',
	size: 'default',
	error: false,
	placeholder: 'Pick a date range',
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartForCalendar());

const emit = defineEmits<{
	'update:modelValue': [value: { start: ForgeDate; end: ForgeDate }];
	'update:open': [value: boolean];
}>();

const calendarPlaceholder = ref<DateValue>();

const rekaValue = computed(() => toRekaRange(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

// Derived from modelValue + presets so manual selections that happen to match a
// preset's range still highlight the preset (the preset's range() is recomputed
// each render against `now()`, so e.g. "This week" stays in sync across midnight).
const activePresetId = computed(() => {
	if (!props.presets?.length || !props.modelValue) return null;
	const { start, end } = props.modelValue;
	for (const preset of props.presets) {
		const r = preset.range();
		if (start.isSame(r.start, 'day') && end.isSame(r.end, 'day')) return preset.id;
	}
	return null;
});
const effectiveFieldVariant = computed(() => (props.error ? 'error' : 'default'));

function onUpdate(value: { start?: DateValue; end?: DateValue }) {
	const result = rekaRangeToForgeDateRange(value);
	if (!result) return;
	emit('update:modelValue', result);
}

function onPresetSelect(range: { start: ForgeDate; end: ForgeDate }) {
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
	const current = calendarPlaceholder.value?.year ?? new Date().getFullYear();
	const start = current - 100;
	const end = current + 10;
	return Array.from({ length: end - start + 1 }, (_, i) => start + i);
});

function onMonthChange(event: Event, date: DateValue) {
	const month = Number((event.target as HTMLSelectElement).value);
	calendarPlaceholder.value = new CalendarDate(date.year, month, 1);
}

function onYearChange(event: Event, date: DateValue) {
	const year = Number((event.target as HTMLSelectElement).value);
	calendarPlaceholder.value = new CalendarDate(year, date.month, 1);
}

const fieldClasses = computed(() =>
	cn(
		dateRangePickerFieldVariants({ variant: effectiveFieldVariant.value, size: props.size }),
		props.class,
	),
);

const buttonSizeMap: Record<NonNullable<Props['size']>, 'sm' | 'default' | 'lg'> = {
	sm: 'sm',
	default: 'default',
	lg: 'lg',
};

const buttonTriggerClasses = computed(() =>
	cn(
		buttonVariants({ variant: 'outline', size: buttonSizeMap[props.size ?? 'default'] }),
		'font-normal',
		props.class,
	),
);

const startLabel = computed(() =>
	props.modelValue ? props.modelValue.start.format(EDateFormat.Pretty) : null,
);
const endLabel = computed(() =>
	props.modelValue ? props.modelValue.end.format(EDateFormat.Pretty) : null,
);
</script>
