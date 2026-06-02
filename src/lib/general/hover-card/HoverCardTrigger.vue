<template>
	<HoverCardTrigger :as-child="asChild" data-slot="hover-card-trigger" :class="$props.class">
		<slot />
	</HoverCardTrigger>
</template>

<script setup lang="ts">
import { HoverCardTrigger } from 'reka-ui';

interface HoverCardTriggerProps {
	/**
	 * When true (default), the trigger merges into its only child. Pass
	 * `false` to wrap the slot content in Reka's default `<button>`.
	 */
	asChild?: boolean;
	class?: string;
}

withDefaults(defineProps<HoverCardTriggerProps>(), {
	asChild: true,
});
</script>
