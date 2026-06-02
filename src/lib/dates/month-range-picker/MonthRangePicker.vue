<template>
	<!-- Button variant: popover trigger + grid content -->
	<PopoverRoot v-if="variant === 'button'" :open="popoverOpen" @update:open="onOpenChange">
		<PopoverTrigger as-child>
			<Button
				variant="outline"
				:size="triggerButtonSize"
				data-slot="month-range-picker-trigger"
				:disabled="disabled"
				:aria-invalid="error || undefined"
				:aria-describedby="describedBy"
				:class="buttonTriggerClasses"
			>
				<Icon :icon="CalendarIcon" size="sm" />
				<template v-if="label">
					{{ label }}
				</template>
				<template v-else-if="startLabel">
					{{ startLabel }}
					<Icon :icon="ArrowRight" size="xs-sm" class="text-muted-foreground" />
					{{ endLabel }}
				</template>
				<template v-else>{{ placeholder }}</template>
			</Button>
		</PopoverTrigger>
		<PopoverPortal>
			<PopoverContent
				data-slot="month-range-picker-content"
				:class="monthRangePickerContentVariants({ size })"
				:side-offset="4"
				:collision-padding="8"
				align="start"
			>
				<MonthRangePickerRoot
					:model-value="rekaValue"
					:min-value="rekaMin"
					:max-value="rekaMax"
					:locale="locale"
					:disabled="disabled"
					data-slot="month-range-picker"
					:class="popoverInnerClasses"
					@update:model-value="onUpdate"
				>
					<template #default="{ grid }">
						<MonthRangePickerHeader
							data-slot="month-range-picker-header"
							:class="monthRangePickerHeaderVariants()"
						>
							<MonthRangePickerPrev
								data-slot="month-range-picker-prev"
								aria-label="Previous year"
								:class="monthRangePickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronLeft" size="sm" />
							</MonthRangePickerPrev>
							<MonthRangePickerHeading
								data-slot="month-range-picker-heading"
								:class="monthRangePickerHeadingVariants({ size })"
							/>
							<MonthRangePickerNext
								data-slot="month-range-picker-next"
								aria-label="Next year"
								:class="monthRangePickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronRight" size="sm" />
							</MonthRangePickerNext>
						</MonthRangePickerHeader>

						<MonthRangePickerGrid
							data-slot="month-range-picker-grid"
							:class="monthRangePickerGridVariants()"
						>
							<MonthRangePickerGridBody data-slot="month-range-picker-grid-body">
								<MonthRangePickerGridRow
									v-for="(row, rowIdx) in grid.rows"
									:key="`row-${rowIdx}`"
									data-slot="month-range-picker-grid-row"
									:class="monthRangePickerGridRowVariants()"
								>
									<MonthRangePickerCell
										v-for="month in row"
										:key="month.toString()"
										:date="month"
										data-slot="month-range-picker-cell"
										:class="monthRangePickerCellVariants({ size })"
									>
										<MonthRangePickerCellTrigger
											:month="month"
											data-slot="month-range-picker-cell-trigger"
											:class="monthRangePickerCellTriggerVariants({ size })"
										/>
									</MonthRangePickerCell>
								</MonthRangePickerGridRow>
							</MonthRangePickerGridBody>
						</MonthRangePickerGrid>
					</template>
				</MonthRangePickerRoot>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>

	<!-- Inline variant: always-visible grid -->
	<MonthRangePickerRoot
		v-else
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:disabled="disabled"
		data-slot="month-range-picker"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="inlineRootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ grid }">
			<MonthRangePickerHeader
				data-slot="month-range-picker-header"
				:class="monthRangePickerHeaderVariants()"
			>
				<MonthRangePickerPrev
					data-slot="month-range-picker-prev"
					aria-label="Previous year"
					:class="monthRangePickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronLeft" size="sm" />
				</MonthRangePickerPrev>
				<MonthRangePickerHeading
					data-slot="month-range-picker-heading"
					:class="monthRangePickerHeadingVariants({ size })"
				/>
				<MonthRangePickerNext
					data-slot="month-range-picker-next"
					aria-label="Next year"
					:class="monthRangePickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronRight" size="sm" />
				</MonthRangePickerNext>
			</MonthRangePickerHeader>

			<MonthRangePickerGrid
				data-slot="month-range-picker-grid"
				:class="monthRangePickerGridVariants()"
			>
				<MonthRangePickerGridBody data-slot="month-range-picker-grid-body">
					<MonthRangePickerGridRow
						v-for="(row, rowIdx) in grid.rows"
						:key="`row-${rowIdx}`"
						data-slot="month-range-picker-grid-row"
						:class="monthRangePickerGridRowVariants()"
					>
						<MonthRangePickerCell
							v-for="month in row"
							:key="month.toString()"
							:date="month"
							data-slot="month-range-picker-cell"
							:class="monthRangePickerCellVariants({ size })"
						>
							<MonthRangePickerCellTrigger
								:month="month"
								data-slot="month-range-picker-cell-trigger"
								:class="monthRangePickerCellTriggerVariants({ size })"
							/>
						</MonthRangePickerCell>
					</MonthRangePickerGridRow>
				</MonthRangePickerGridBody>
			</MonthRangePickerGrid>
		</template>
	</MonthRangePickerRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { ArrowRight, CalendarIcon, ChevronLeft, ChevronRight } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import {
	PopoverRoot,
	PopoverTrigger,
	PopoverPortal,
	PopoverContent,
	MonthRangePickerRoot,
	MonthRangePickerHeader,
	MonthRangePickerHeading,
	MonthRangePickerPrev,
	MonthRangePickerNext,
	MonthRangePickerGrid,
	MonthRangePickerGridBody,
	MonthRangePickerGridRow,
	MonthRangePickerCell,
	MonthRangePickerCellTrigger,
} from 'reka-ui';
import type { DateValue } from '@internationalized/date';
import { type ForgeDate, EDateFormat } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import { toRekaDate, toRekaRange, rekaRangeToForgeDateRange } from '../_adapter.js';
import Button from '../../general/button/Button.vue';
import type { ButtonSize } from '../../general/button/button.js';
import type { MonthRangePickerVariants } from './month-range-picker.js';
import {
	monthRangePickerRootVariants,
	monthRangePickerContentVariants,
	monthRangePickerHeaderVariants,
	monthRangePickerHeadingVariants,
	monthRangePickerNavButtonVariants,
	monthRangePickerGridVariants,
	monthRangePickerGridRowVariants,
	monthRangePickerCellVariants,
	monthRangePickerCellTriggerVariants,
} from './month-range-picker.js';

interface Props {
	/** Selected month range. */
	modelValue?: { start: ForgeDate; end: ForgeDate } | null;
	/** Earliest selectable month. */
	minValue?: ForgeDate;
	/** Latest selectable month. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for month names. */
	locale?: string;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Trigger style — `button` (default, popover) or `inline` (always-visible grid). */
	variant?: 'button' | 'inline';
	/** Visual error state — sets `aria-invalid="true"` on trigger / inline root. */
	error?: boolean;
	/** id of the element(s) describing the picker. */
	describedBy?: string;
	/** Density. `sm` / `default` / `lg`. */
	size?: MonthRangePickerVariants['size'];
	/** Placeholder shown on the button trigger when nothing is selected. */
	placeholder?: string;
	/** Override the button trigger label entirely. */
	label?: string;
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	disabled: false,
	variant: 'button',
	size: 'default',
	error: false,
	placeholder: 'Pick a month range',
});

const emit = defineEmits<{
	'update:modelValue': [value: { start: ForgeDate; end: ForgeDate }];
	'update:open': [value: boolean];
}>();

const popoverOpen = ref(false);

const rekaValue = computed(() => toRekaRange(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

const effectiveRootVariant = computed(() => (props.error ? 'error' : 'default'));

function onUpdate(value: { start?: DateValue; end?: DateValue }) {
	const result = rekaRangeToForgeDateRange(value);
	if (result) {
		emit('update:modelValue', result);
		popoverOpen.value = false;
	}
}

function onOpenChange(open: boolean) {
	popoverOpen.value = open;
	emit('update:open', open);
}

const inlineRootClasses = computed(() =>
	cn(
		monthRangePickerRootVariants({ variant: effectiveRootVariant.value, size: props.size }),
		props.class,
	),
);

const popoverInnerClasses = 'w-fit border-0 shadow-none p-0 bg-transparent';

const buttonSizeMap: Record<NonNullable<Props['size']>, ButtonSize> = {
	sm: 'sm',
	default: 'default',
	lg: 'lg',
};

const triggerButtonSize = computed<ButtonSize>(() => buttonSizeMap[props.size ?? 'default']);

const buttonTriggerClasses = computed(() => cn('font-normal', props.class));

const startLabel = computed(() =>
	props.modelValue ? props.modelValue.start.format(EDateFormat.MonthYear) : null,
);
const endLabel = computed(() =>
	props.modelValue ? props.modelValue.end.format(EDateFormat.MonthYear) : null,
);
</script>
