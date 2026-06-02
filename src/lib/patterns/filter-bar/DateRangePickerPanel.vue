<template>
	<div class="flex">
		<DateRangePresets v-if="presets?.length" :presets="presets" @select="onPresetSelect" />
		<RangeCalendar
			class="border-0 shadow-none rounded-md"
			:model-value="modelValue"
			@update:model-value="onCalendarSelect"
		/>
	</div>
</template>

<script setup lang="ts">
import type { ForgeDate } from '@fromforgesoftware/ts-kit';
import DateRangePresets from '../../dates/date-range-picker/DateRangePresets.vue';
import RangeCalendar from '../../dates/range-calendar/RangeCalendar.vue';
import type { DateRangePreset } from '../../dates/date-range-picker/date-range-picker.js';

type DateRange = { start: ForgeDate; end: ForgeDate };

defineProps<{
	presets?: DateRangePreset[];
	modelValue?: DateRange | null;
}>();

const emit = defineEmits<{
	select: [range: DateRange];
}>();

// RangeCalendar emits (range, presetId); forward range only.
function onCalendarSelect(range: DateRange) {
	emit('select', range);
}
function onPresetSelect(range: DateRange) {
	emit('select', range);
}
</script>
