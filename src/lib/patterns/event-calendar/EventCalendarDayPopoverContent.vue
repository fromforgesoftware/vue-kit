<template>
	<div class="px-3 py-2 border-b">
		<p class="text-xs font-medium text-foreground">{{ formatDayHeading(date) }}</p>
		<p class="text-2xs text-muted-foreground">
			{{ events.length }} {{ events.length === 1 ? 'event' : 'events' }}
		</p>
	</div>
	<div class="max-h-64 overflow-y-auto p-1 space-y-0.5">
		<EventCalendarEvent
			v-for="event in events"
			:key="event.id"
			:item="event"
			:class="selectedEventId === event.id ? 'ring-2 ring-inset ring-primary' : undefined"
			@click="(p) => emit('eventClick', p)"
			@hover="(p) => emit('eventHover', p)"
			@leave="(p) => emit('eventLeave', p)"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import EventCalendarEvent from './EventCalendarEvent.vue';
import type {
	EventCalendarItem,
	EventCalendarEventClickPayload,
	EventCalendarEventHoverPayload,
} from './event-calendar';

interface Props {
	date: ForgeDate;
	events: EventCalendarItem[];
	selectedEventId?: string | null;
	locale?: string;
}

const props = withDefaults(defineProps<Props>(), {
	locale: 'en',
	selectedEventId: null,
});

const emit = defineEmits<{
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
}>();

const dateFormatter = computed(
	() => new Intl.DateTimeFormat(props.locale, { weekday: 'short', month: 'short', day: 'numeric' }),
);

function formatDayHeading(date: ForgeDate): string {
	return dateFormatter.value.format(date.toDate());
}
</script>
