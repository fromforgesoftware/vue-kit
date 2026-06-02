<template>
	<MenubarCheckboxItem
		data-slot="menubar-checkbox-item"
		:checked="checked"
		:disabled="disabled"
		:text-value="textValue"
		:class="classes"
		@select="onSelect"
	>
		<span
			class="absolute left-2 flex size-4 shrink-0 items-center justify-center rounded border border-input"
			:class="checked ? 'border-primary bg-primary text-primary-foreground' : ''"
		>
			<Icon v-if="checked" :icon="Check" size="xs" />
		</span>
		<slot />
	</MenubarCheckboxItem>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarCheckboxItem } from 'reka-ui';
import { Check } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { menubarCheckboxItemVariants } from './menubar.js';

interface Props {
	checked?: boolean | 'indeterminate';
	disabled?: boolean;
	textValue?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
});

const emit = defineEmits<{
	'update:checked': [value: boolean];
}>();

const classes = computed(() => cn(menubarCheckboxItemVariants(), props.class));

function onSelect(event: Event) {
	event.preventDefault();
	emit('update:checked', !props.checked);
}
</script>
