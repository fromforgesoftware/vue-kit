<template>
	<div
		:class="classes"
		data-slot="event-calendar-event"
		:data-event-id="item.id"
		@click="onClick"
		@mouseenter="onMouseEnter"
		@mouseleave="onMouseLeave"
	>
		<Icon v-if="item.icon" :icon="item.icon" size="xs" class="mr-1 inline-flex flex-shrink-0" />
		<span class="truncate">{{ item.title }}</span>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import {
	eventCalendarEventVariants,
	type EventCalendarItem,
	type EventCalendarEventClickPayload,
	type EventCalendarEventHoverPayload,
} from './event-calendar';

interface Props {
	item: EventCalendarItem;
	class?: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
	click: [payload: EventCalendarEventClickPayload];
	hover: [payload: EventCalendarEventHoverPayload];
	leave: [item: EventCalendarItem];
}>();

const classes = computed(() =>
	cn(eventCalendarEventVariants({ variant: props.item.variant ?? 'primary' }), props.class),
);

function onClick(e: MouseEvent) {
	e.stopPropagation();
	emit('click', { item: props.item, event: e });
}

function onMouseEnter(e: MouseEvent) {
	const el = e.currentTarget as HTMLElement;
	emit('hover', { item: props.item, rect: el.getBoundingClientRect(), event: e });
}

function onMouseLeave() {
	emit('leave', props.item);
}
</script>
