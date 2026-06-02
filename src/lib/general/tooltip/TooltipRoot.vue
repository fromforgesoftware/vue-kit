<template>
	<TooltipRoot
		:default-open="defaultOpen"
		:open="open"
		:delay-duration="delayDuration"
		:disable-hoverable-content="disableHoverableContent"
		:disable-closing-trigger="disableClosingTrigger"
		:disabled="disabled"
		:ignore-non-keyboard-focus="ignoreNonKeyboardFocus"
		@update:open="emit('update:open', $event)"
	>
		<slot />
	</TooltipRoot>
</template>

<script setup lang="ts">
import { TooltipRoot } from 'reka-ui';

interface TooltipRootProps {
	defaultOpen?: boolean;
	open?: boolean;
	delayDuration?: number;
	disableHoverableContent?: boolean;
	disableClosingTrigger?: boolean;
	disabled?: boolean;
	ignoreNonKeyboardFocus?: boolean;
}

withDefaults(defineProps<TooltipRootProps>(), {
	defaultOpen: false,
	delayDuration: 200,
	disableHoverableContent: false,
	disableClosingTrigger: false,
	disabled: false,
	ignoreNonKeyboardFocus: false,
});

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();
</script>
