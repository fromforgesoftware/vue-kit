<template>
	<TimeFieldRoot
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:granularity="granularity"
		:hour-cycle="resolvedHourCycle"
		:disabled="disabled"
		:readonly="readonly"
		data-slot="time-field"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="rootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ segments }">
			<DayPeriodToggle ref="dayPeriodToggleRef" />
			<template v-for="item in segments" :key="item.part">
				<TimeFieldInput
					v-if="item.part === 'literal'"
					:part="item.part"
					data-slot="time-field-literal"
				>
					{{ item.value }}
				</TimeFieldInput>
				<TimeFieldInput
					v-else-if="item.part === 'dayPeriod'"
					:part="item.part"
					data-slot="time-field-segment"
					data-segment="dayPeriod"
					:class="
						cn(
							segmentClasses,
							'inline-flex min-h-6 min-w-6 cursor-pointer items-center justify-center',
						)
					"
					@click.prevent="toggleDayPeriod"
					@keydown.capture="onDayPeriodKeydown"
				>
					{{ item.value }}
				</TimeFieldInput>
				<TimeFieldInput
					v-else
					:part="item.part"
					data-slot="time-field-segment"
					:class="segmentClasses"
				>
					{{ item.value }}
				</TimeFieldInput>
			</template>
		</template>
	</TimeFieldRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { TimeFieldRoot, TimeFieldInput, type TimeValue } from 'reka-ui';
import type { Time } from '@internationalized/date';
import { type ForgeDate, getHourCycle } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaTime, timeToForgeDate } from '../_adapter';
import {
	timeFieldRootVariants,
	timeFieldInputVariants,
	type TimeFieldVariants,
} from './time-field';
import DayPeriodToggle from '../day-period-toggle/DayPeriodToggle.vue';

interface Props {
	/** Selected time. */
	modelValue?: ForgeDate | null;
	/** Earliest selectable time. */
	minValue?: ForgeDate;
	/** Latest selectable time. */
	maxValue?: ForgeDate;
	/** Smallest segment to show (default: minute). */
	granularity?: 'hour' | 'minute' | 'second';
	/** 12-hour or 24-hour clock. Defaults to user preference. */
	hourCycle?: 12 | 24;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Block edits but allow focus and copy. */
	readonly?: boolean;
	/** Visual style. `error` flips border / ring to destructive tones. */
	variant?: TimeFieldVariants['variant'];
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: TimeFieldVariants['size'];
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
	'update:modelValue': [value: ForgeDate | null];
}>();

const rekaValue = computed(() => toRekaTime(props.modelValue));
const rekaMin = computed(() => toRekaTime(props.minValue));
const rekaMax = computed(() => toRekaTime(props.maxValue));

const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

function onUpdate(value: TimeValue | undefined) {
	if (!value) {
		emit('update:modelValue', null);
		return;
	}
	emit('update:modelValue', timeToForgeDate(value as Time, props.modelValue ?? undefined));
}

const resolvedHourCycle = computed(() => props.hourCycle ?? getHourCycle());
const rootClasses = computed(() =>
	cn(timeFieldRootVariants({ variant: effectiveVariant.value, size: props.size }), props.class),
);
const segmentClasses = computed(() => timeFieldInputVariants());

const dayPeriodToggleRef = ref<InstanceType<typeof DayPeriodToggle>>();

function toggleDayPeriod() {
	dayPeriodToggleRef.value?.toggle();
}

function onDayPeriodKeydown(e: KeyboardEvent) {
	if (e.key === 'ArrowUp' || e.key === 'ArrowDown') {
		e.preventDefault();
		e.stopPropagation();
		toggleDayPeriod();
	} else if (e.key === 'a' || e.key === 'A') {
		e.preventDefault();
		e.stopPropagation();
		dayPeriodToggleRef.value?.setDayPeriod('AM');
	} else if (e.key === 'p' || e.key === 'P') {
		e.preventDefault();
		e.stopPropagation();
		dayPeriodToggleRef.value?.setDayPeriod('PM');
	}
}
</script>
