<template>
	<MenubarRadioItem
		data-slot="menubar-radio-item"
		:value="value"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="emit('select', $event)"
	>
		<span class="absolute left-2 flex size-3.5 items-center justify-center">
			<MenubarItemIndicator>
				<Icon :icon="Circle" size="2xs" class="fill-current" />
			</MenubarItemIndicator>
		</span>
		<slot />
	</MenubarRadioItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarRadioItem, MenubarItemIndicator } from 'reka-ui';
import { Circle } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { menubarRadioItemVariants } from './menubar.js';

interface MenubarRadioItemProps {
	/** The unique value of the item. */
	value: string;
	/** When true, prevents the user from interacting with the item. */
	disabled?: boolean;
	/** Optional text used for typeahead purposes. */
	textValue?: string;
	class?: string;
}

const props = withDefaults(defineProps<MenubarRadioItemProps>(), {
	disabled: false,
});

const emit = defineEmits<{
	select: [event: Event];
}>();

const classes = computed(() => cn(menubarRadioItemVariants(), props.class));
</script>
