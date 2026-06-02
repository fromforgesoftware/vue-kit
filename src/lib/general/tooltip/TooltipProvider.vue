<template>
	<TooltipProvider
		:delay-duration="delayDuration"
		:skip-delay-duration="skipDelayDuration"
		:disable-hoverable-content="disableHoverableContent"
	>
		<slot />
	</TooltipProvider>
</template>

<script setup lang="ts">
import { TooltipProvider } from 'reka-ui';

interface TooltipProviderProps {
	delayDuration?: number;
	skipDelayDuration?: number;
	disableHoverableContent?: boolean;
}

withDefaults(defineProps<TooltipProviderProps>(), {
	delayDuration: 200,
	skipDelayDuration: 300,
	disableHoverableContent: false,
});
</script>
