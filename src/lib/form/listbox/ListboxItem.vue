<template>
	<ListboxItem
		:id="id"
		data-slot="listbox-item"
		:value="value"
		:disabled="disabled"
		:class="classes"
	>
		<slot />
		<span
			data-slot="listbox-item-indicator-wrapper"
			class="absolute right-2 flex size-3.5 items-center justify-center"
		>
			<ListboxItemIndicator data-slot="listbox-item-indicator">
				<Icon :icon="Check" size="sm" />
			</ListboxItemIndicator>
		</span>
	</ListboxItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { ListboxItem, ListboxItemIndicator } from 'reka-ui';
import { Check } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import { listboxItemVariants } from './listbox';

interface ListboxItemProps {
	/** The value submitted with the form when this item is selected. */
	value: string;
	/** Disable just this item. */
	disabled?: boolean;
	/** Element id (rare — typically not needed). */
	id?: string;
	/** Extra classes. */
	class?: string;
}

const props = withDefaults(defineProps<ListboxItemProps>(), {
	disabled: false,
});

const classes = computed(() => cn(listboxItemVariants(), props.class));
</script>
