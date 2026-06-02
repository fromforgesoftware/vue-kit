<template>
	<!-- Button variant: popover trigger + grid content -->
	<PopoverRoot v-if="variant === 'button'" :open="popoverOpen" @update:open="onOpenChange">
		<PopoverTrigger as-child>
			<Button
				variant="outline"
				:size="triggerButtonSize"
				data-slot="month-picker-trigger"
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
				data-slot="month-picker-content"
				:class="monthPickerContentVariants({ size })"
				:side-offset="4"
				:collision-padding="8"
				align="start"
			>
				<MonthPickerRoot
					:model-value="rekaValue"
					:min-value="rekaMin"
					:max-value="rekaMax"
					:locale="locale"
					:disabled="disabled"
					data-slot="month-picker"
					:class="popoverInnerClasses"
					@update:model-value="onUpdate"
				>
					<template #default="{ grid }">
						<MonthPickerHeader data-slot="month-picker-header" :class="monthPickerHeaderVariants()">
							<MonthPickerPrev
								data-slot="month-picker-prev"
								aria-label="Previous year"
								:class="monthPickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronLeft" size="sm" />
							</MonthPickerPrev>
							<MonthPickerHeading
								data-slot="month-picker-heading"
								:class="monthPickerHeadingVariants({ size })"
							/>
							<MonthPickerNext
								data-slot="month-picker-next"
								aria-label="Next year"
								:class="monthPickerNavButtonVariants({ size })"
							>
								<Icon :icon="ChevronRight" size="sm" />
							</MonthPickerNext>
						</MonthPickerHeader>

						<MonthPickerGrid data-slot="month-picker-grid" :class="monthPickerGridVariants()">
							<MonthPickerGridBody data-slot="month-picker-grid-body">
								<MonthPickerGridRow
									v-for="(row, rowIdx) in grid.rows"
									:key="`row-${rowIdx}`"
									data-slot="month-picker-grid-row"
									:class="monthPickerGridRowVariants()"
								>
									<MonthPickerCell
										v-for="month in row"
										:key="month.toString()"
										:date="month"
										data-slot="month-picker-cell"
										:class="monthPickerCellVariants({ size })"
									>
										<MonthPickerCellTrigger
											:month="month"
											data-slot="month-picker-cell-trigger"
											:class="monthPickerCellTriggerVariants({ size })"
										/>
									</MonthPickerCell>
								</MonthPickerGridRow>
							</MonthPickerGridBody>
						</MonthPickerGrid>
					</template>
				</MonthPickerRoot>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>

	<!-- Inline variant: always-visible grid -->
	<MonthPickerRoot
		v-else
		:model-value="rekaValue"
		:min-value="rekaMin"
		:max-value="rekaMax"
		:locale="locale"
		:disabled="disabled"
		data-slot="month-picker"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:class="inlineRootClasses"
		@update:model-value="onUpdate"
	>
		<template #default="{ grid }">
			<MonthPickerHeader data-slot="month-picker-header" :class="monthPickerHeaderVariants()">
				<MonthPickerPrev
					data-slot="month-picker-prev"
					aria-label="Previous year"
					:class="monthPickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronLeft" size="sm" />
				</MonthPickerPrev>
				<MonthPickerHeading
					data-slot="month-picker-heading"
					:class="monthPickerHeadingVariants({ size })"
				/>
				<MonthPickerNext
					data-slot="month-picker-next"
					aria-label="Next year"
					:class="monthPickerNavButtonVariants({ size })"
				>
					<Icon :icon="ChevronRight" size="sm" />
				</MonthPickerNext>
			</MonthPickerHeader>

			<MonthPickerGrid data-slot="month-picker-grid" :class="monthPickerGridVariants()">
				<MonthPickerGridBody data-slot="month-picker-grid-body">
					<MonthPickerGridRow
						v-for="(row, rowIdx) in grid.rows"
						:key="`row-${rowIdx}`"
						data-slot="month-picker-grid-row"
						:class="monthPickerGridRowVariants()"
					>
						<MonthPickerCell
							v-for="month in row"
							:key="month.toString()"
							:date="month"
							data-slot="month-picker-cell"
							:class="monthPickerCellVariants({ size })"
						>
							<MonthPickerCellTrigger
								:month="month"
								data-slot="month-picker-cell-trigger"
								:class="monthPickerCellTriggerVariants({ size })"
							/>
						</MonthPickerCell>
					</MonthPickerGridRow>
				</MonthPickerGridBody>
			</MonthPickerGrid>
		</template>
	</MonthPickerRoot>
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
	MonthPickerRoot,
	MonthPickerHeader,
	MonthPickerHeading,
	MonthPickerPrev,
	MonthPickerNext,
	MonthPickerGrid,
	MonthPickerGridBody,
	MonthPickerGridRow,
	MonthPickerCell,
	MonthPickerCellTrigger,
} from 'reka-ui';
import type { DateValue } from '@internationalized/date';
import { type ForgeDate, EDateFormat } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn';
import { toRekaDate, calendarDateToForgeDate } from '../_adapter';
import Button from '../../general/button/Button.vue';
import type { ButtonSize } from '../../general/button/button';
import type { MonthPickerVariants } from './month-picker';
import {
	monthPickerRootVariants,
	monthPickerContentVariants,
	monthPickerHeaderVariants,
	monthPickerHeadingVariants,
	monthPickerNavButtonVariants,
	monthPickerGridVariants,
	monthPickerGridRowVariants,
	monthPickerCellVariants,
	monthPickerCellTriggerVariants,
} from './month-picker';

interface Props {
	/** Selected month (or null when nothing is selected). */
	modelValue?: ForgeDate | null;
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
	/** id of the element(s) describing the picker — error or hint text. */
	describedBy?: string;
	/** Density. `sm` / `default` / `lg`. */
	size?: MonthPickerVariants['size'];
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
	placeholder: 'Pick a month',
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
		monthPickerRootVariants({ variant: effectiveRootVariant.value, size: props.size }),
		props.class,
	),
);

// Inside the popover the content already provides border + padding + shadow,
// so the picker root sheds those tokens.
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
		(props.modelValue ? props.modelValue.format(EDateFormat.MonthYear) : props.placeholder),
);
</script>
