<template>
	<TabsRoot
		data-slot="tabs"
		:model-value="modelValue"
		:default-value="defaultValue"
		:orientation="orientation"
		:activation-mode="activationMode"
		:unmount-on-hide="unmountOnHide"
		@update:model-value="emit('update:modelValue', $event)"
	>
		<slot />
	</TabsRoot>
</template>

<script setup lang="ts">
import { provide, toRef } from 'vue';
import { TabsRoot } from 'reka-ui';
import { TABS_VARIANT_KEY, TABS_SIZE_KEY, type TabsVariant, type TabsSize } from './tabs';

interface TabsProps {
	modelValue?: string | number;
	defaultValue?: string | number;
	orientation?: 'horizontal' | 'vertical';
	/**
	 * `automatic`: focusing a trigger via arrow keys also activates it (good for
	 * tabs that don't load remote content).
	 * `manual`: arrows move focus only; user must press Enter/Space to activate
	 * (good for expensive tab panels — avoids triggering loads on each arrow press).
	 */
	activationMode?: 'automatic' | 'manual';
	unmountOnHide?: boolean;
	/** Tab style variant — propagated to TabsList, TabsTrigger, and TabsIndicator */
	variant?: TabsVariant;
	/** Density tier — controls trigger padding and typography. */
	size?: TabsSize;
}

const props = withDefaults(defineProps<TabsProps>(), {
	modelValue: undefined,
	defaultValue: undefined,
	orientation: 'horizontal',
	activationMode: 'automatic',
	unmountOnHide: true,
	variant: 'default',
	size: 'default',
});

const emit = defineEmits<{
	'update:modelValue': [value: string | number];
}>();

provide(TABS_VARIANT_KEY, toRef(props, 'variant'));
provide(TABS_SIZE_KEY, toRef(props, 'size'));
</script>
