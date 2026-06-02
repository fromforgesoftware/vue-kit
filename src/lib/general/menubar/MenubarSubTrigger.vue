<template>
	<MenubarSubTrigger
		data-slot="menubar-sub-trigger"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
	>
		<slot />
		<Icon :icon="ChevronRight" size="sm" class="ml-auto" />
	</MenubarSubTrigger>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarSubTrigger } from 'reka-ui';
import { ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { menubarSubTriggerVariants } from './menubar.js';

interface MenubarSubTriggerProps {
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	/** When true, the item is visually indented. */
	inset?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<MenubarSubTriggerProps>(), {
	disabled: false,
	inset: false,
});

const classes = computed(() => cn(menubarSubTriggerVariants({ inset: props.inset }), props.class));
</script>
