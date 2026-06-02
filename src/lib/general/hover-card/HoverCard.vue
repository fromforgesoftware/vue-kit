<template>
	<HoverCardRoot
		v-bind="rootProps"
		data-slot="hover-card"
		@update:open="emit('update:open', $event)"
	>
		<slot />
	</HoverCardRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { HoverCardRoot } from 'reka-ui';

interface HoverCardProps {
	/**
	 * The open state of the hover card when it is initially rendered.
	 */
	open?: boolean;
	/**
	 * The duration from when the mouse enters the trigger until the hover card opens.
	 */
	openDelay?: number;
	/**
	 * The duration from when the mouse leaves the trigger or content until the hover card closes.
	 */
	closeDelay?: number;
}

const props = withDefaults(defineProps<HoverCardProps>(), {
	open: undefined,
	openDelay: 700,
	closeDelay: 300,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const rootProps = computed(() => {
	const result: Record<string, unknown> = {
		openDelay: props.openDelay,
		closeDelay: props.closeDelay,
	};
	if (props.open !== undefined) {
		result.open = props.open;
	}
	return result;
});
</script>
