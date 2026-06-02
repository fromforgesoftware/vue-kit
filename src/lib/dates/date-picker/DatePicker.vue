<template>
	<DatePickerRoot
		v-model:placeholder="calendarPlaceholder"
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:granularity="granularity"
		:hour-cycle="hourCycle"
		:number-of-months="numberOfMonths"
		:week-starts-on="resolvedWeekStart"
		:fixed-weeks="fixedWeeks"
		:disabled="disabled"
		:readonly="readonly"
		@update:model-value="onUpdate"
		@update:open="emit('update:open', $event)"
	>
		<!-- Button variant: single button trigger -->
		<DatePickerTrigger
			v-if="variant === 'button'"
			as="button"
			data-slot="date-picker-trigger"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:class="buttonTriggerClasses"
		>
			<Icon :icon="CalendarIcon" size="sm" />
			{{ dateLabel }}
		</DatePickerTrigger>

		<!-- Field variant (default): segmented date input -->
		<DatePickerField
			v-else
			v-slot="{ segments }"
			data-slot="date-picker-field"
			:aria-invalid="error || undefined"
			:aria-describedby="describedBy"
			:class="fieldClasses"
		>
			<div class="flex items-center">
				<template v-for="item in segments" :key="item.part">
					<DatePickerInput
						v-if="item.part === 'literal'"
						:part="item.part"
						data-slot="date-picker-literal"
					>
						{{ item.value }}
					</DatePickerInput>
					<DatePickerInput
						v-else
						:part="item.part"
						data-slot="date-picker-segment"
						:class="datePickerInputVariants()"
					>
						{{ item.value }}
					</DatePickerInput>
				</template>
			</div>
			<DatePickerTrigger
				as="button"
				data-slot="date-picker-trigger"
				aria-label="Open calendar"
				:class="datePickerTriggerVariants()"
			>
				<Icon :icon="CalendarIcon" size="sm" />
			</DatePickerTrigger>
		</DatePickerField>

		<DatePickerContent
			data-slot="date-picker-content"
			:class="datePickerContentVariants()"
			:side-offset="4"
			:collision-padding="8"
			align="start"
		>
			<div class="flex">
				<DatePickerPresets
					v-if="presets?.length"
					:presets="presets"
					:active-preset-id="activePresetId"
					@select="onPresetSelect"
				/>
				<DatePickerCalendar
					v-slot="{ grid, weekDays, date }"
					data-slot="date-picker-calendar"
					:class="datePickerCalendarVariants({ size })"
				>
					<DatePickerHeader data-slot="date-picker-header" :class="datePickerHeaderVariants()">
						<DatePickerPrev
							data-slot="date-picker-prev"
							aria-label="Previous month"
							:class="datePickerNavButtonVariants({ size })"
						>
							<Icon :icon="ChevronLeft" size="sm" />
						</DatePickerPrev>

						<template v-if="monthYearSelect">
							<div data-slot="date-picker-month-year-select" class="flex items-center gap-1">
								<select
									:value="date.month"
									data-slot="date-picker-month-select"
									aria-label="Month"
									:class="datePickerSelectVariants({ size })"
									@change="onMonthChange($event, date)"
								>
									<option v-for="m in monthNames" :key="m.value" :value="m.value">
										{{ m.label }}
									</option>
								</select>
								<select
									:value="date.year"
									data-slot="date-picker-year-select"
									aria-label="Year"
									:class="datePickerSelectVariants({ size })"
									@change="onYearChange($event, date)"
								>
									<option v-for="y in yearRange" :key="y" :value="y">
										{{ y }}
									</option>
								</select>
							</div>
						</template>
						<DatePickerHeading
							v-else
							data-slot="date-picker-heading"
							:class="datePickerHeadingVariants({ size })"
						/>

						<DatePickerNext
							data-slot="date-picker-next"
							aria-label="Next month"
							:class="datePickerNavButtonVariants({ size })"
						>
							<Icon :icon="ChevronRight" size="sm" />
						</DatePickerNext>
					</DatePickerHeader>

					<div class="flex flex-col space-y-4 pt-4 sm:flex-row sm:space-x-4 sm:space-y-0">
						<DatePickerGrid
							v-for="month in grid"
							:key="month.value.toString()"
							data-slot="date-picker-grid"
							:class="datePickerGridVariants()"
						>
							<DatePickerGridHead data-slot="date-picker-grid-head">
								<DatePickerGridRow class="mb-1 grid w-full grid-cols-7">
									<DatePickerHeadCell
										v-for="day in weekDays"
										:key="day"
										data-slot="date-picker-head-cell"
										:class="datePickerHeadCellVariants({ size })"
									>
										{{ day }}
									</DatePickerHeadCell>
								</DatePickerGridRow>
							</DatePickerGridHead>
							<DatePickerGridBody data-slot="date-picker-grid-body" class="grid">
								<DatePickerGridRow
									v-for="(week, weekIdx) in month.rows"
									:key="`week-${weekIdx}`"
									data-slot="date-picker-grid-row"
									class="grid grid-cols-7"
								>
									<DatePickerCell
										v-for="day in week"
										:key="day.toString()"
										:date="day"
										data-slot="date-picker-cell"
										:class="datePickerCellVariants({ size })"
									>
										<DatePickerCellTrigger
											:day="day"
											:month="month.value"
											data-slot="date-picker-cell-trigger"
											:class="datePickerCellTriggerVariants({ size })"
										/>
									</DatePickerCell>
								</DatePickerGridRow>
							</DatePickerGridBody>
						</DatePickerGrid>
					</div>
				</DatePickerCalendar>
			</div>
		</DatePickerContent>
	</DatePickerRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CalendarIcon, ChevronLeft, ChevronRight } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import {
	DatePickerRoot,
	DatePickerField,
	DatePickerInput,
	DatePickerTrigger,
	DatePickerContent,
	DatePickerCalendar,
	DatePickerHeader,
	DatePickerHeading,
	DatePickerPrev,
	DatePickerNext,
	DatePickerGrid,
	DatePickerGridHead,
	DatePickerGridBody,
	DatePickerGridRow,
	DatePickerHeadCell,
	DatePickerCell,
	DatePickerCellTrigger,
} from 'reka-ui';
import { CalendarDate, type DateValue } from '@internationalized/date';
import { type ForgeDate, EDateFormat, getWeekStartForCalendar } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import { toRekaDate, calendarDateToForgeDate } from '../_adapter.js';
import { buttonVariants } from '../../general/button/button.js';
import DatePickerPresets from './DatePickerPresets.vue';
import type { DatePickerPreset, DatePickerVariants } from './date-picker.js';
import {
	datePickerFieldVariants,
	datePickerInputVariants,
	datePickerTriggerVariants,
	datePickerContentVariants,
	datePickerCalendarVariants,
	datePickerHeaderVariants,
	datePickerHeadingVariants,
	datePickerSelectVariants,
	datePickerNavButtonVariants,
	datePickerGridVariants,
	datePickerHeadCellVariants,
	datePickerCellVariants,
	datePickerCellTriggerVariants,
} from './date-picker.js';

interface Props {
	/** Selected date (or null when nothing is selected). */
	modelValue?: ForgeDate | null;
	/** Earliest selectable date. */
	minValue?: ForgeDate;
	/** Latest selectable date. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for month / weekday names and segment ordering. */
	locale?: string;
	/** Smallest segment to show — `day`, `hour`, `minute`, `second`. */
	granularity?: 'day' | 'hour' | 'minute' | 'second';
	/** 12-hour or 24-hour clock when granularity ≥ hour. */
	hourCycle?: 12 | 24;
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
	/** Replace the heading label with month + year `<select>` controls. */
	monthYearSelect?: boolean;
	/** Trigger style — segmented `field` (default) or single `button`. */
	variant?: 'field' | 'button';
	/** Visual error state — sets `aria-invalid="true"` and tints the field border. */
	error?: boolean;
	/** id of the element(s) describing the field — error or hint text. */
	describedBy?: string;
	/** Density. Mirrors DateField — `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: DatePickerVariants['size'];
	/** Placeholder shown on the button trigger when nothing is selected. */
	placeholder?: string;
	/** Override the button trigger label entirely. */
	label?: string;
	/** Optional preset shortcuts (e.g. Today, Yesterday). */
	presets?: DatePickerPreset[];
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	granularity: 'day',
	numberOfMonths: 1,
	fixedWeeks: true,
	disabled: false,
	readonly: false,
	monthYearSelect: false,
	variant: 'button',
	size: 'default',
	error: false,
	placeholder: 'Pick a date',
});

const resolvedWeekStart = computed(() => props.weekStartsOn ?? getWeekStartForCalendar());

const emit = defineEmits<{
	'update:modelValue': [value: ForgeDate];
	'update:open': [value: boolean];
}>();

const calendarPlaceholder = ref<DateValue>();

// Derive the active preset from the current value so clicking a calendar
// cell that happens to match a preset (e.g. picking today's date) highlights
// the corresponding preset row, not just the explicit preset-click path.
const activePresetId = computed<string | null>(() => {
	const current = props.modelValue;
	if (!current || !props.presets?.length) return null;
	for (const preset of props.presets) {
		if (preset.date().isSame(current, 'day')) return preset.id;
	}
	return null;
});

const rekaValue = computed(() => toRekaDate(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

const effectiveFieldVariant = computed(() => (props.error ? 'error' : 'default'));

function onUpdate(value: DateValue | undefined) {
	if (!value) return;
	emit('update:modelValue', calendarDateToForgeDate(value));
}

function onPresetSelect(date: ForgeDate) {
	emit('update:modelValue', date);
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
		datePickerFieldVariants({ variant: effectiveFieldVariant.value, size: props.size }),
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
		props.class,
	),
);

const dateLabel = computed(
	() =>
		props.label ??
		(props.modelValue ? props.modelValue.format(EDateFormat.Pretty) : props.placeholder),
);
</script>
