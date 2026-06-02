<template>
	<div data-slot="chat-bubble" :class="containerClasses">
		<div
			data-slot="chat-bubble-content"
			:class="bubbleClasses"
			:role="loading ? 'status' : 'group'"
			:aria-label="ariaLabel"
		>
			<span
				v-if="showTail"
				data-slot="chat-bubble-tail"
				class="absolute bottom-0 w-3"
				:class="{
					'text-primary -right-1 -mr-px mb-px': direction === 'outgoing',
					'text-muted -left-1 -ml-px mb-px -scale-x-100': direction === 'incoming',
				}"
				aria-hidden="true"
			>
				<svg width="100%" height="100%" viewBox="0 0 66 66" xmlns="http://www.w3.org/2000/svg">
					<path
						d="M1.01522827,0.516204834 C-8.83532715,54.3062744 61.7609863,70.5215302 64.8009949,64.3061218 C68.8074951,54.8859711 30.1663208,52.9997559 37.5036011,0.516204834 L1.01522827,0.516204834 Z"
						fill="currentColor"
					/>
				</svg>
			</span>
			<template v-if="loading">
				<Spinner size="sm" tone="current" class="opacity-70" label="Message is loading" />
			</template>
			<slot v-else />
		</div>
		<div v-if="formattedTime && !loading" data-slot="chat-bubble-time" :class="timeClasses">
			{{ formattedTime }}
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ForgeDate, EDateFormat } from '@fromforgesoftware/ts-kit';
import { cn } from '../../../helpers/cn.js';
import Spinner from '../spinner/Spinner.vue';
import {
	chatBubbleVariants,
	chatBubbleContainerVariants,
	chatBubbleTimeVariants,
	type ChatBubbleDirection,
	type ChatBubbleSize,
} from './chat-bubble.js';

interface ChatBubbleProps {
	direction: ChatBubbleDirection;
	size?: ChatBubbleSize;
	/** Render the speech-bubble tail. Always hidden for `system` direction. */
	tail?: boolean;
	/** Timestamp; rendered below the bubble when not loading. */
	time?: string | number | Date;
	/** Show a spinner inside the bubble. */
	loading?: boolean;
	/** Accessible name for the author (e.g. "Kelly King"). Used in aria-label. */
	authorLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<ChatBubbleProps>(), {
	size: 'default',
	tail: true,
	loading: false,
});

const containerClasses = computed(() =>
	cn(chatBubbleContainerVariants({ direction: props.direction })),
);

const bubbleClasses = computed(() =>
	cn(chatBubbleVariants({ direction: props.direction, size: props.size }), props.class),
);

const timeClasses = computed(() => cn(chatBubbleTimeVariants({ direction: props.direction })));

const showTail = computed(() => props.tail && props.direction !== 'system');

const formattedTime = computed(() => {
	if (!props.time) return null;
	if (props.time instanceof Date) return ForgeDate.fromDate(props.time).format(EDateFormat.Time);
	if (typeof props.time === 'number') {
		return ForgeDate.fromDate(new Date(props.time)).format(EDateFormat.Time);
	}
	// String inputs: try to parse as ISO; fall back to passing through if the
	// caller already supplied a display-formatted string (e.g. "10:30 AM").
	try {
		return ForgeDate.fromISO(props.time).format(EDateFormat.Time);
	} catch {
		return props.time;
	}
});

const ariaLabel = computed(() => {
	if (props.loading) return 'Loading message';
	if (props.authorLabel) return `Message from ${props.authorLabel}`;
	return undefined;
});
</script>
