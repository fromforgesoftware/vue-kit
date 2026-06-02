<template>
	<TabsList data-slot="tabs-list" :loop="loop" :class="classes">
		<TabsIndicatorVue />
		<slot />
	</TabsList>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { TabsList, type TabsListProps } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { tabsListVariants, TABS_VARIANT_KEY, type TabsVariant } from './tabs.js';
import TabsIndicatorVue from './TabsIndicator.vue';

interface Props extends TabsListProps {
	variant?: TabsVariant;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: undefined,
	loop: true,
});

const injectedVariant = inject(TABS_VARIANT_KEY, ref<TabsVariant>('default'));
const resolvedVariant = computed(() => props.variant ?? injectedVariant.value);

const classes = computed(() =>
	cn(tabsListVariants({ variant: resolvedVariant.value }), props.class),
);
</script>
