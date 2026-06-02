<template>
	<DateFieldRoot
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:granularity="granularity"
		:hour-cycle="hourCycle"
		:disabled="disabled"
		:readonly="readonly"
		data-slot="date-field"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="rootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ segments }">
			<template v-for="item in segments" :key="item.part">
				<DateFieldInput
					v-if="item.part === 'literal'"
					:part="item.part"
					data-slot="date-field-literal"
				>
					{{ item.value }}
				</DateFieldInput>
				<DateFieldInput
					v-else
					:part="item.part"
					data-slot="date-field-segment"
					:class="segmentClasses"
				>
					{{ item.value }}
				</DateFieldInput>
			</template>
		</template>
	</DateFieldRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { DateFieldRoot, DateFieldInput } from 'reka-ui';
import type { DateValue } from '@internationalized/date';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaDate, calendarDateToForgeDate } from '../_adapter';
import {
	dateFieldRootVariants,
	dateFieldInputVariants,
	type DateFieldVariants,
} from './date-field';

interface Props {
	/** Selected date. */
	modelValue?: ForgeDate | null;
	/** Earliest selectable date. */
	minValue?: ForgeDate;
	/** Latest selectable date. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for segment ordering and labels. */
	locale?: string;
	/** Smallest segment to show — `day`, `hour`, `minute`, `second`. */
	granularity?: 'day' | 'hour' | 'minute' | 'second';
	/** 12-hour or 24-hour clock when granularity ≥ hour. */
	hourCycle?: 12 | 24;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Block edits but allow focus and copy. */
	readonly?: boolean;
	/** Visual style. `error` flips border / ring to destructive tones. */
	variant?: DateFieldVariants['variant'];
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px. Mirrors Input. */
	size?: DateFieldVariants['size'];
	/** Convenience for `aria-invalid="true"` + error variant. Prefer this over `variant="error"`. */
	error?: boolean;
	/** id of the element(s) describing the field — error or hint text. */
	describedBy?: string;
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
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
	'update:modelValue': [value: ForgeDate | null];
}>();

const rekaValue = computed(() => toRekaDate(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

const effectiveVariant = computed(() => (props.error ? 'error' : props.variant));

function onUpdate(value: DateValue | undefined) {
	if (!value) {
		emit('update:modelValue', null);
		return;
	}
	emit('update:modelValue', calendarDateToForgeDate(value));
}

const rootClasses = computed(() =>
	cn(dateFieldRootVariants({ variant: effectiveVariant.value, size: props.size }), props.class),
);
const segmentClasses = computed(() => dateFieldInputVariants());
</script>
