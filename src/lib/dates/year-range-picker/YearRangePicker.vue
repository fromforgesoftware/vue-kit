<template>
	<!-- Button variant: popover trigger + grid content -->
	<PopoverRoot v-if="variant === 'button'" :open="popoverOpen" @update:open="onOpenChange">
		<PopoverTrigger as-child>
			<Button
				variant="outline"
				:size="triggerButtonSize"
				data-slot="year-range-picker-trigger"
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
				data-slot="year-range-picker-content"
				:class="yearRangePickerContentVariants({ size })"
				:side-offset="4"
				:collision-padding="8"
				align="start"
			>
				<YearRangePickerRoot
					:model-value="rekaValue"
					:min-value="rekaMin"
					:max-value="rekaMax"
					:locale="locale"
					:years-per-page="yearsPerPage"
					:disabled="disabled"
					data-slot="year-range-picker"
					:class="popoverInnerClasses"
					@update:model-value="onUpdate"
				>
					<template #default="{ grid }">
						<YearRangePickerHeader
							data-slot="year-range-picker-header"
							:class="yearRangePickerHeaderVariants()"
						>
							<YearRangePickerPrev
								data-slot="year-range-picker-prev"
								aria-label="Previous years"
								:class="yearRangePickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronLeft" size="sm" />
							</YearRangePickerPrev>
							<YearRangePickerHeading
								data-slot="year-range-picker-heading"
								:class="yearRangePickerHeadingVariants({ size })"
							/>
							<YearRangePickerNext
								data-slot="year-range-picker-next"
								aria-label="Next years"
								:class="yearRangePickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronRight" size="sm" />
							</YearRangePickerNext>
						</YearRangePickerHeader>

						<YearRangePickerGrid
							data-slot="year-range-picker-grid"
							:class="yearRangePickerGridVariants()"
						>
							<YearRangePickerGridBody data-slot="year-range-picker-grid-body">
								<YearRangePickerGridRow
									v-for="(row, rowIdx) in grid.rows"
									:key="`row-${rowIdx}`"
									data-slot="year-range-picker-grid-row"
									:class="yearRangePickerGridRowVariants()"
								>
									<YearRangePickerCell
										v-for="year in row"
										:key="year.toString()"
										:date="year"
										data-slot="year-range-picker-cell"
										:class="yearRangePickerCellVariants({ size })"
									>
										<YearRangePickerCellTrigger
											:year="year"
											data-slot="year-range-picker-cell-trigger"
											:class="yearRangePickerCellTriggerVariants({ size })"
										/>
									</YearRangePickerCell>
								</YearRangePickerGridRow>
							</YearRangePickerGridBody>
						</YearRangePickerGrid>
					</template>
				</YearRangePickerRoot>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>

	<!-- Inline variant: always-visible grid -->
	<YearRangePickerRoot
		v-else
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:years-per-page="yearsPerPage"
		:disabled="disabled"
		data-slot="year-range-picker"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="inlineRootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ grid }">
			<YearRangePickerHeader
				data-slot="year-range-picker-header"
				:class="yearRangePickerHeaderVariants()"
			>
				<YearRangePickerPrev
					data-slot="year-range-picker-prev"
					aria-label="Previous years"
					:class="yearRangePickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronLeft" size="sm" />
				</YearRangePickerPrev>
				<YearRangePickerHeading
					data-slot="year-range-picker-heading"
					:class="yearRangePickerHeadingVariants({ size })"
				/>
				<YearRangePickerNext
					data-slot="year-range-picker-next"
					aria-label="Next years"
					:class="yearRangePickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronRight" size="sm" />
				</YearRangePickerNext>
			</YearRangePickerHeader>

			<YearRangePickerGrid
				data-slot="year-range-picker-grid"
				:class="yearRangePickerGridVariants()"
			>
				<YearRangePickerGridBody data-slot="year-range-picker-grid-body">
					<YearRangePickerGridRow
						v-for="(row, rowIdx) in grid.rows"
						:key="`row-${rowIdx}`"
						data-slot="year-range-picker-grid-row"
						:class="yearRangePickerGridRowVariants()"
					>
						<YearRangePickerCell
							v-for="year in row"
							:key="year.toString()"
							:date="year"
							data-slot="year-range-picker-cell"
							:class="yearRangePickerCellVariants({ size })"
						>
							<YearRangePickerCellTrigger
								:year="year"
								data-slot="year-range-picker-cell-trigger"
								:class="yearRangePickerCellTriggerVariants({ size })"
							/>
						</YearRangePickerCell>
					</YearRangePickerGridRow>
				</YearRangePickerGridBody>
			</YearRangePickerGrid>
		</template>
	</YearRangePickerRoot>
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
	YearRangePickerRoot,
	YearRangePickerHeader,
	YearRangePickerHeading,
	YearRangePickerPrev,
	YearRangePickerNext,
	YearRangePickerGrid,
	YearRangePickerGridBody,
	YearRangePickerGridRow,
	YearRangePickerCell,
	YearRangePickerCellTrigger,
} from 'reka-ui';
import type { DateValue } from '@internationalized/date';
import { type ForgeDate, EDateFormat } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaDate, toRekaRange, rekaRangeToForgeDateRange } from '../_adapter';
import Button from '../../general/button/Button.vue';
import type { ButtonSize } from '../../general/button/button';
import type { YearRangePickerVariants } from './year-range-picker';
import {
	yearRangePickerRootVariants,
	yearRangePickerContentVariants,
	yearRangePickerHeaderVariants,
	yearRangePickerHeadingVariants,
	yearRangePickerNavButtonVariants,
	yearRangePickerGridVariants,
	yearRangePickerGridRowVariants,
	yearRangePickerCellVariants,
	yearRangePickerCellTriggerVariants,
} from './year-range-picker';

interface Props {
	/** Selected year range. */
	modelValue?: { start: ForgeDate; end: ForgeDate } | null;
	/** Earliest selectable year. */
	minValue?: ForgeDate;
	/** Latest selectable year. */
	maxValue?: ForgeDate;
	/** BCP-47 locale used for formatting. */
	locale?: string;
	/** Number of years rendered per page. */
	yearsPerPage?: number;
	/** Disable all interaction. */
	disabled?: boolean;
	/** Trigger style — `button` (default, popover) or `inline` (always-visible grid). */
	variant?: 'button' | 'inline';
	/** Visual error state — sets `aria-invalid="true"` on trigger / inline root. */
	error?: boolean;
	/** id of the element(s) describing the picker. */
	describedBy?: string;
	/** Density. `sm` / `default` / `lg`. */
	size?: YearRangePickerVariants['size'];
	/** Placeholder shown on the button trigger when nothing is selected. */
	placeholder?: string;
	/** Override the button trigger label entirely. */
	label?: string;
	/** Extra wrapper classes (layout only — propose a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	yearsPerPage: 12,
	disabled: false,
	variant: 'button',
	size: 'default',
	error: false,
	placeholder: 'Pick a year range',
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
		yearRangePickerRootVariants({ variant: effectiveRootVariant.value, size: props.size }),
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
	props.modelValue ? props.modelValue.start.format(EDateFormat.YearFull) : null,
);
const endLabel = computed(() =>
	props.modelValue ? props.modelValue.end.format(EDateFormat.YearFull) : null,
);
</script>
