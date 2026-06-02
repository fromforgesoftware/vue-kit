<template>
	<DateRangeFieldRoot
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:granularity="granularity"
		:disabled="disabled"
		:readonly="readonly"
		data-slot="date-range-field"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="rootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ segments }">
			<template v-for="item in segments.start" :key="`start-${item.part}`">
				<DateRangeFieldInput
					v-if="item.part === 'literal'"
					:part="item.part"
					type="start"
					data-slot="date-range-field-literal"
				>
					{{ item.value }}
				</DateRangeFieldInput>
				<DateRangeFieldInput
					v-else
					:part="item.part"
					type="start"
					data-slot="date-range-field-segment"
					data-range-side="start"
					:class="segmentClasses"
				>
					{{ item.value }}
				</DateRangeFieldInput>
			</template>
			<span data-slot="date-range-field-separator" :class="separatorClasses">–</span>

			<template v-for="item in segments.end" :key="`end-${item.part}`">
				<DateRangeFieldInput
					v-if="item.part === 'literal'"
					:part="item.part"
					type="end"
					data-slot="date-range-field-literal"
				>
					{{ item.value }}
				</DateRangeFieldInput>
				<DateRangeFieldInput
					v-else
					:part="item.part"
					type="end"
					data-slot="date-range-field-segment"
					data-range-side="end"
					:class="segmentClasses"
				>
					{{ item.value }}
				</DateRangeFieldInput>
			</template>
		</template>
	</DateRangeFieldRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DateRangeFieldRoot, DateRangeFieldInput } from 'reka-ui';
import type { DateValue } from '@internationalized/date';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import { toRekaDate, toRekaRange, rekaRangeToForgeDateRange } from '../_adapter.js';
import {
	dateRangeFieldRootVariants,
	dateRangeFieldInputVariants,
	dateRangeFieldSeparatorVariants,
	type DateRangeFieldVariants,
} from './date-range-field.js';

interface Props {
	/** Selected range. */
	modelValue?: { start: ForgeDate; end: ForgeDate } | null;
	/** Earliest selectable date. */
	minValue?: ForgeDate;
	/** Latest selectable date. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for segment ordering. */
	locale?: string;
	/** Smallest segment to show. */
	granularity?: 'day' | 'hour' | 'minute' | 'second';
	/** Disable all interaction. */
	disabled?: boolean;
	/** Block edits but allow focus and copy. */
	readonly?: boolean;
	/** Visual style. `error` flips border / ring to destructive tones. */
	variant?: DateRangeFieldVariants['variant'];
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. */
	size?: DateRangeFieldVariants['size'];
	/** Convenience for `aria-invalid="true"` + error variant. */
	error?: boolean;
	/** id of the element(s) describing the field. */
	describedBy?: string;
	/** Extra wrapper classes (layout only). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	granularity: 'day',
	disabled: false,
	readonly: false,
	variant: 'default',
	size: 'default',
	error: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: { start: ForgeDate; end: ForgeDate }];
}>();

const rekaValue = computed(() => toRekaRange(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

function onUpdate(value: { start?: DateValue; end?: DateValue }) {
	const result = rekaRangeToForgeDateRange(value);
	if (result) emit('update:modelValue', result);
}

const rootClasses = computed(() =>
	cn(
		dateRangeFieldRootVariants({ variant: effectiveVariant.value, size: props.size }),
		props.class,
	),
);
const segmentClasses = computed(() => dateRangeFieldInputVariants());
const separatorClasses = computed(() => dateRangeFieldSeparatorVariants({ size: props.size }));
</script>
