<template>
	<TimeRangeFieldRoot
		:model-value="rekaValue"
		:granularity="granularity"
		:hour-cycle="resolvedHourCycle"
		:disabled="disabled"
		:readonly="readonly"
		data-slot="time-range-field"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="rootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ segments }">
			<DayPeriodRangeToggle ref="dayPeriodToggleRef" />
			<template v-for="item in segments.start" :key="`start-${item.part}`">
				<TimeRangeFieldInput
					v-if="item.part === 'literal'"
					:part="item.part"
					type="start"
					data-slot="time-range-field-literal"
				>
					{{ item.value }}
				</TimeRangeFieldInput>
				<TimeRangeFieldInput
					v-else-if="item.part === 'dayPeriod'"
					:part="item.part"
					type="start"
					data-slot="time-range-field-segment"
					data-range-side="start"
					data-segment="dayPeriod"
					:class="
						cn(
							segmentClasses,
							'inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center',
						)
					"
					@click.prevent="toggleDayPeriod('start')"
					@keydown.capture="(e: KeyboardEvent) => onDayPeriodKeydown(e, 'start')"
				>
					{{ item.value }}
				</TimeRangeFieldInput>
				<TimeRangeFieldInput
					v-else
					:part="item.part"
					type="start"
					data-slot="time-range-field-segment"
					data-range-side="start"
					:class="segmentClasses"
				>
					{{ item.value }}
				</TimeRangeFieldInput>
			</template>
			<span data-slot="time-range-field-separator" :class="separatorClasses">–</span>

			<template v-for="item in segments.end" :key="`end-${item.part}`">
				<TimeRangeFieldInput
					v-if="item.part === 'literal'"
					:part="item.part"
					type="end"
					data-slot="time-range-field-literal"
				>
					{{ item.value }}
				</TimeRangeFieldInput>
				<TimeRangeFieldInput
					v-else-if="item.part === 'dayPeriod'"
					:part="item.part"
					type="end"
					data-slot="time-range-field-segment"
					data-range-side="end"
					data-segment="dayPeriod"
					:class="
						cn(
							segmentClasses,
							'inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center',
						)
					"
					@click.prevent="toggleDayPeriod('end')"
					@keydown.capture="(e: KeyboardEvent) => onDayPeriodKeydown(e, 'end')"
				>
					{{ item.value }}
				</TimeRangeFieldInput>
				<TimeRangeFieldInput
					v-else
					:part="item.part"
					type="end"
					data-slot="time-range-field-segment"
					data-range-side="end"
					:class="segmentClasses"
				>
					{{ item.value }}
				</TimeRangeFieldInput>
			</template>
		</template>
	</TimeRangeFieldRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TimeRangeFieldRoot, TimeRangeFieldInput } from 'reka-ui';
import { type ForgeDate, getHourCycle } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import type { DateValue } from '@internationalized/date';
import { hiveDateToCalendarDateTime, calendarDateToForgeDate } from '../_adapter';
import {
	timeRangeFieldRootVariants,
	timeRangeFieldInputVariants,
	timeRangeFieldSeparatorVariants,
	type TimeRangeFieldVariants,
} from './time-range-field';
import DayPeriodRangeToggle from '../day-period-range-toggle/DayPeriodRangeToggle.vue';

interface Props {
	/** Selected time range. */
	modelValue?: { start: ForgeDate; end: ForgeDate } | null;
	/** Smallest segment to show (default: minute). */
	granularity?: 'hour' | 'minute' | 'second';
	/** 12-hour or 24-hour clock. Defaults to user preference. */
	hourCycle?: 12 | 24;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Block edits but allow focus and copy. */
	readonly?: boolean;
	/** Visual style. `error` flips border / ring to destructive tones. */
	variant?: TimeRangeFieldVariants['variant'];
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: TimeRangeFieldVariants['size'];
	/** Convenience for `aria-invalid="true"` + error variant. */
	error?: boolean;
	/** id of the element(s) describing the field. */
	describedBy?: string;
	/** Extra wrapper classes (layout only). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	granularity: 'minute',
	disabled: false,
	readonly: false,
	variant: 'default',
	size: 'default',
	error: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: { start: ForgeDate; end: ForgeDate }];
}>();

const rekaValue = computed(() => {
	if (!props.modelValue) return undefined;
	return {
		start: hiveDateToCalendarDateTime(props.modelValue.start),
		end: hiveDateToCalendarDateTime(props.modelValue.end),
	};
});

function onUpdate(value: { start?: DateValue; end?: DateValue } | Record<string, unknown>) {
	const v = value as { start?: DateValue; end?: DateValue };
	if (!v.start || !v.end) return;
	emit('update:modelValue', {
		start: calendarDateToForgeDate(v.start),
		end: calendarDateToForgeDate(v.end),
	});
}

const resolvedHourCycle = computed(() => props.hourCycle ?? getHourCycle());
const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

const rootClasses = computed(() =>
	cn(
		timeRangeFieldRootVariants({ variant: effectiveVariant.value, size: props.size }),
		props.class,
	),
);
const segmentClasses = computed(() => timeRangeFieldInputVariants());
const separatorClasses = computed(() => timeRangeFieldSeparatorVariants({ size: props.size }));

const dayPeriodToggleRef = ref<InstanceType<typeof DayPeriodRangeToggle>>();

function toggleDayPeriod(type: 'start' | 'end') {
	dayPeriodToggleRef.value?.toggle(type);
}

function onDayPeriodKeydown(e: KeyboardEvent, type: 'start' | 'end') {
	if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
		e.preventDefault();
		e.stopPropagation();
		toggleDayPeriod(type);
	} else if (e.key === 'a' || e.key === 'A') {
		e.preventDefault();
		e.stopPropagation();
		dayPeriodToggleRef.value?.setDayPeriod(type, 'AM');
	} else if (e.key === 'p' || e.key === 'P') {
		e.preventDefault();
		e.stopPropagation();
		dayPeriodToggleRef.value?.setDayPeriod(type, 'PM');
	}
}
</script>
