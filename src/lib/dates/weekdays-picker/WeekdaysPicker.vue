<template>
	<fieldset
		data-slot="weekdays-picker"
		role="group"
		:aria-label="label"
		:aria-invalid="error || undefined"
		:aria-describedby="describedBy"
		:aria-disabled="disabled || undefined"
		:disabled="disabled"
		:data-readonly="readonly || undefined"
		:data-error="error || undefined"
		:class="cn(groupClasses, 'border-0 p-0 m-0')"
	>
		<legend class="sr-only">{{ label }}</legend>
		<Tooltip v-for="(day, index) in days" :key="day.value" :content="day.fullName">
			<button
				:ref="(el) => setButtonRef(el as Element | null, index)"
				type="button"
				role="checkbox"
				data-slot="weekdays-picker-day"
				:data-state="isSelected(day.value) ? 'on' : 'off'"
				:data-day="day.value"
				:aria-checked="isSelected(day.value)"
				:aria-label="day.fullName"
				:disabled="disabled"
				:tabindex="readonly ? -1 : index === focusedIndex ? 0 : -1"
				:class="
					cn(
						weekdayButtonVariants({
							size,
							variant,
							selected: isSelected(day.value),
							error,
						}),
						readonly && 'pointer-events-none',
					)
				"
				@click="toggle(day.value)"
				@focus="focusedIndex = index"
				@keydown="handleKeydown($event, index, day.value)"
			>
				{{ day.label }}
			</button>
		</Tooltip>
	</fieldset>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { cn } from '../../../helpers/cn.js';
import Tooltip from '../../general/tooltip/Tooltip.vue';
import {
	weekdaysPickerVariants,
	weekdayButtonVariants,
	getOrderedWeekdays,
	type WeekdaysPickerVariants,
	type WeekdayButtonVariants,
	type WeekdayValue,
	type WeekdayItem,
} from './weekdays-picker.js';

interface WeekdaysPickerProps {
	/** Minimum number of days that must be selected. */
	minSelection?: number;
	/** Custom weekday items (overrides default M-S order). */
	weekdays?: WeekdayItem[];
	/** Prevent user interaction while still allowing focus / copy. */
	readonly?: boolean;
	/** Disable the entire group. */
	disabled?: boolean;
	/** Density. `sm` 28 px, `default` 36 px, `lg` 44 px. */
	size?: WeekdaysPickerVariants['size'];
	/** Visual style. `outline` keeps a border on unselected days. */
	variant?: WeekdayButtonVariants['variant'];
	/** Convenience for `aria-invalid="true"` + destructive ring. */
	error?: boolean;
	/** Accessible label for the fieldset. */
	label?: string;
	/** id of the element(s) describing the field (e.g. error message). */
	describedBy?: string;
	class?: string;
}

const props = withDefaults(defineProps<WeekdaysPickerProps>(), {
	minSelection: 0,
	readonly: false,
	disabled: false,
	size: 'default',
	variant: 'default',
	error: false,
	label: 'Days of the week',
});

const model = defineModel<WeekdayValue[]>({ default: () => [] });

const days = computed(() => props.weekdays ?? getOrderedWeekdays());

const isSelected = (day: WeekdayValue): boolean => model.value.includes(day);

function toggle(day: WeekdayValue) {
	if (props.readonly || props.disabled) return;

	const current = model.value;
	const index = current.indexOf(day);

	if (index >= 0) {
		if (current.length <= props.minSelection) return;
		model.value = current.filter((d) => d !== day);
	} else {
		model.value = [...current, day];
	}
}

// Roving-focus index — only one button has tabindex=0 at a time so Tab lands
// on a single member of the group. Arrow keys move focus along the group.
const focusedIndex = ref(0);
const buttonRefs = ref<HTMLButtonElement[]>([]);

function setButtonRef(el: Element | null, index: number) {
	if (el instanceof HTMLButtonElement) buttonRefs.value[index] = el;
}

function focusAt(index: number) {
	const len = days.value.length;
	if (len === 0) return;
	const next = ((index % len) + len) % len;
	focusedIndex.value = next;
	buttonRefs.value[next]?.focus();
}

function handleKeydown(event: KeyboardEvent, index: number, day: WeekdayValue) {
	switch (event.key) {
		case ' ':
		case 'Enter':
			event.preventDefault();
			toggle(day);
			break;
		case 'ArrowRight':
		case 'ArrowDown':
			event.preventDefault();
			focusAt(index + 1);
			break;
		case 'ArrowLeft':
		case 'ArrowUp':
			event.preventDefault();
			focusAt(index - 1);
			break;
		case 'Home':
			event.preventDefault();
			focusAt(0);
			break;
		case 'End':
			event.preventDefault();
			focusAt(days.value.length - 1);
			break;
	}
}

const groupClasses = computed(() => cn(weekdaysPickerVariants({ size: props.size }), props.class));
</script>
