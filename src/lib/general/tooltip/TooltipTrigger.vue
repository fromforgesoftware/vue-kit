<template>
	<TooltipTrigger data-slot="tooltip-trigger" :as-child="asChild">
		<slot />
	</TooltipTrigger>
</template>

<script setup lang="ts">
import { TooltipTrigger } from 'reka-ui';

interface TooltipTriggerProps {
	asChild?: boolean;
}

withDefaults(defineProps<TooltipTriggerProps>(), {
	asChild: false,
});
</script>
