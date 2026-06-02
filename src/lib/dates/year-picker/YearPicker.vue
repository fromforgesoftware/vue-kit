<template>
	<PopoverRoot v-if="variant === 'button'" :open="popoverOpen" @update:open="onOpenChange">
		<PopoverTrigger as-child>
			<Button
				variant="outline"
				:size="triggerButtonSize"
				data-slot="year-picker-trigger"
				:disabled="disabled"
				:aria-invalid="error || undefined"
				:aria-describedby="describedBy"
				:class="buttonTriggerClasses"
			>
				<Icon :icon="CalendarIcon" size="sm" />
				{{ dateLabel }}
			</Button>
		</PopoverTrigger>
		<PopoverPortal>
			<PopoverContent
				data-slot="year-picker-content"
				:class="yearPickerContentVariants({ size })"
				:side-offset="4"
				:collision-padding="8"
				align="start"
			>
				<YearPickerRoot
					:model-value="rekaValue"
					:min-value="rekaMin"
					:max-value="rekaMax"
					:locale="locale"
					:years-per-page="yearsPerPage"
					:disabled="disabled"
					data-slot="year-picker"
					:class="popoverInnerClasses"
					@update:model-value="onUpdate"
				>
					<template #default="{ grid }">
						<YearPickerHeader data-slot="year-picker-header" :class="yearPickerHeaderVariants()">
							<YearPickerPrev
								data-slot="year-picker-prev"
								aria-label="Previous years"
								:class="yearPickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronLeft" size="sm" />
							</YearPickerPrev>
							<YearPickerHeading
								data-slot="year-picker-heading"
								:class="yearPickerHeadingVariants({ size })"
							/>
							<YearPickerNext
								data-slot="year-picker-next"
								aria-label="Next years"
								:class="yearPickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronRight" size="sm" />
							</YearPickerNext>
						</YearPickerHeader>

						<YearPickerGrid data-slot="year-picker-grid" :class="yearPickerGridVariants()">
							<YearPickerGridBody data-slot="year-picker-grid-body">
								<YearPickerGridRow
									v-for="(row, rowIdx) in grid.rows"
									:key="`row-${rowIdx}`"
									data-slot="year-picker-grid-row"
									:class="yearPickerGridRowVariants()"
								>
									<YearPickerCell
										v-for="year in row"
										:key="year.toString()"
										:date="year"
										data-slot="year-picker-cell"
										:class="yearPickerCellVariants({ size })"
									>
										<YearPickerCellTrigger
											:year="year"
											data-slot="year-picker-cell-trigger"
											:class="yearPickerCellTriggerVariants({ size })"
										/>
									</YearPickerCell>
								</YearPickerGridRow>
							</YearPickerGridBody>
						</YearPickerGrid>
					</template>
				</YearPickerRoot>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>

	<!-- Inline variant: always-visible grid -->
	<YearPickerRoot
		v-else
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:years-per-page="yearsPerPage"
		:disabled="disabled"
		data-slot="year-picker"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="inlineRootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ grid }">
			<YearPickerHeader data-slot="year-picker-header" :class="yearPickerHeaderVariants()">
				<YearPickerPrev
					data-slot="year-picker-prev"
					aria-label="Previous years"
					:class="yearPickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronLeft" size="sm" />
				</YearPickerPrev>
				<YearPickerHeading
					data-slot="year-picker-heading"
					:class="yearPickerHeadingVariants({ size })"
				/>
				<YearPickerNext
					data-slot="year-picker-next"
					aria-label="Next years"
					:class="yearPickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronRight" size="sm" />
				</YearPickerNext>
			</YearPickerHeader>

			<YearPickerGrid data-slot="year-picker-grid" :class="yearPickerGridVariants()">
				<YearPickerGridBody data-slot="year-picker-grid-body">
					<YearPickerGridRow
						v-for="(row, rowIdx) in grid.rows"
						:key="`row-${rowIdx}`"
						data-slot="year-picker-grid-row"
						:class="yearPickerGridRowVariants()"
					>
						<YearPickerCell
							v-for="year in row"
							:key="year.toString()"
							:date="year"
							data-slot="year-picker-cell"
							:class="yearPickerCellVariants({ size })"
						>
							<YearPickerCellTrigger
								:year="year"
								data-slot="year-picker-cell-trigger"
								:class="yearPickerCellTriggerVariants({ size })"
							/>
						</YearPickerCell>
					</YearPickerGridRow>
				</YearPickerGridBody>
			</YearPickerGrid>
		</template>
	</YearPickerRoot>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { CalendarIcon, ChevronLeft, ChevronRight } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import {
	PopoverRoot,
	PopoverTrigger,
	PopoverPortal,
	PopoverContent,
	YearPickerRoot,
	YearPickerHeader,
	YearPickerHeading,
	YearPickerPrev,
	YearPickerNext,
	YearPickerGrid,
	YearPickerGridBody,
	YearPickerGridRow,
	YearPickerCell,
	YearPickerCellTrigger,
} from 'reka-ui';
import type { DateValue } from '@internationalized/date';
import { type ForgeDate, EDateFormat } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaDate, calendarDateToForgeDate } from '../_adapter';
import Button from '../../general/button/Button.vue';
import type { ButtonSize } from '../../general/button/button';
import type { YearPickerVariants } from './year-picker';
import {
	yearPickerRootVariants,
	yearPickerContentVariants,
	yearPickerHeaderVariants,
	yearPickerHeadingVariants,
	yearPickerNavButtonVariants,
	yearPickerGridVariants,
	yearPickerGridRowVariants,
	yearPickerCellVariants,
	yearPickerCellTriggerVariants,
} from './year-picker';

interface Props {
	/** Selected year. */
	modelValue?: ForgeDate | null;
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
	size?: YearPickerVariants['size'];
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
	placeholder: 'Pick a year',
});

const emit = defineEmits<{
	'update:modelValue': [value: ForgeDate];
	'update:open': [value: boolean];
}>();

const popoverOpen = ref(false);

const rekaValue = computed(() => toRekaDate(props.modelValue));
const rekaMin = computed(() => toRekaDate(props.minValue));
const rekaMax = computed(() => toRekaDate(props.maxValue));

const effectiveRootVariant = computed(() => (props.error ? 'error' : 'default'));

function onUpdate(value: DateValue | DateValue[] | undefined) {
	if (!value || Array.isArray(value)) return;
	emit('update:modelValue', calendarDateToForgeDate(value));
	popoverOpen.value = false;
}

function onOpenChange(open: boolean) {
	popoverOpen.value = open;
	emit('update:open', open);
}

const inlineRootClasses = computed(() =>
	cn(
		yearPickerRootVariants({ variant: effectiveRootVariant.value, size: props.size }),
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

const dateLabel = computed(
	() =>
		props.label ??
		(props.modelValue ? props.modelValue.format(EDateFormat.YearFull) : props.placeholder),
);
</script>
