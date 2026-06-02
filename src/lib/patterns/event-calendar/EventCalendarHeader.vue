<template>
	<DateNavToolbar
		:class="eventCalendarHeaderVariants()"
		data-slot="event-calendar-header"
		:view="view"
		:views="views"
		:selected-date="selectedDate"
		:label="title"
		:presets="view === 'week' ? weekPresets : dayPresets"
		@update:view="onViewChange"
		@update:selected-date="(d) => emit('update:selectedDate', d)"
		@prev="emit('prev')"
		@next="emit('next')"
	>
		<template v-if="$slots.actions" #actions>
			<slot name="actions" />
		</template>
	</DateNavToolbar>
</template>

<script setup lang="ts">
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import DateNavToolbar from '../date-nav-toolbar/DateNavToolbar.vue';
import {
	defaultDatePickerPresets as dayPresets,
	defaultWeekPickerPresets as weekPresets,
} from '../../dates/date-picker/date-picker';
import { eventCalendarHeaderVariants, type EventCalendarView } from './event-calendar';

interface Props {
	title: string;
	view: EventCalendarView;
	selectedDate: ForgeDate;
}

defineProps<Props>();

const emit = defineEmits<{
	prev: [];
	next: [];
	'update:selectedDate': [date: ForgeDate];
	'update:view': [view: EventCalendarView];
}>();

const views = [
	{ value: 'day', label: 'Day' },
	{ value: 'week', label: 'Week' },
	{ value: 'month', label: 'Month' },
	{ value: 'year', label: 'Year' },
	// 'week-horizontal' is intentionally not exposed here — it's an embeddable
	// variant for compact previews; toggling to it from the toolbar would
	// confuse users since it visually looks like the day view rotated.
];

function onViewChange(value: string) {
	emit('update:view', value as EventCalendarView);
}
</script>
