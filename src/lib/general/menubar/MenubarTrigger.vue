<template>
	<MenubarTrigger data-slot="menubar-trigger" :disabled="disabled" :class="classes">
		<slot />
	</MenubarTrigger>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarTrigger } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { menubarTriggerVariants } from './menubar.js';

interface MenubarTriggerProps {
	/** When true, prevents the user from interacting with the trigger. */
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<MenubarTriggerProps>(), {
	disabled: false,
});

const classes = computed(() => cn(menubarTriggerVariants(), props.class));
</script>
