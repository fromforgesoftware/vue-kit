<template>
	<HoverCard v-if="trigger === 'hover'" :open-delay="200" :close-delay="100">
		<HoverCardTrigger as-child>
			<slot />
		</HoverCardTrigger>
		<HoverCardContent :side-offset="6" class="w-64 p-0" data-slot="event-calendar-day-popover">
			<DayContent
				:date="date"
				:events="events"
				:selected-event-id="selectedEventId"
				:locale="locale"
				@event-click="(p) => emit('eventClick', p)"
				@event-hover="(p) => emit('eventHover', p)"
				@event-leave="(p) => emit('eventLeave', p)"
			/>
		</HoverCardContent>
	</HoverCard>

	<Popover v-else>
		<PopoverTrigger as-child>
			<slot />
		</PopoverTrigger>
		<PopoverContent
			:side-offset="4"
			class="w-64 p-0"
			data-slot="event-calendar-day-popover"
			@click.stop
		>
			<DayContent
				:date="date"
				:events="events"
				:selected-event-id="selectedEventId"
				:locale="locale"
				@event-click="(p) => emit('eventClick', p)"
				@event-hover="(p) => emit('eventHover', p)"
				@event-leave="(p) => emit('eventLeave', p)"
			/>
		</PopoverContent>
	</Popover>
</template>

<script setup lang="ts">
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import HoverCard from '../../general/hover-card/HoverCard.vue';
import HoverCardTrigger from '../../general/hover-card/HoverCardTrigger.vue';
import HoverCardContent from '../../general/hover-card/HoverCardContent.vue';
import Popover from '../../general/popover/Popover.vue';
import PopoverTrigger from '../../general/popover/PopoverTrigger.vue';
import PopoverContent from '../../general/popover/PopoverContent.vue';
import DayContent from './EventCalendarDayPopoverContent.vue';
import type {
	EventCalendarItem,
	EventCalendarEventClickPayload,
	EventCalendarEventHoverPayload,
} from './event-calendar';

interface Props {
	date: ForgeDate;
	events: EventCalendarItem[];
	selectedEventId?: string | null;
	/** Whether the popover opens on hover (year view) or click (month "+N more"). */
	trigger?: 'hover' | 'click';
	locale?: string;
}

withDefaults(defineProps<Props>(), {
	trigger: 'hover',
	locale: 'en',
	selectedEventId: null,
});

const emit = defineEmits<{
	eventClick: [payload: EventCalendarEventClickPayload];
	eventHover: [payload: EventCalendarEventHoverPayload];
	eventLeave: [item: EventCalendarItem];
}>();
</script>
