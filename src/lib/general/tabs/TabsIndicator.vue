<template>
	<TabsIndicator data-slot="tabs-indicator" :class="classes" :data-variant="resolvedVariant">
		<slot />
	</TabsIndicator>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { TabsIndicator } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { tabsIndicatorVariants, TABS_VARIANT_KEY, type TabsVariant } from './tabs.js';

interface Props {
	variant?: TabsVariant;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: undefined,
});

const injectedVariant = inject(TABS_VARIANT_KEY, ref<TabsVariant>('default'));
const resolvedVariant = computed(() => props.variant ?? injectedVariant.value);

const classes = computed(() =>
	cn('wui-tabs-indicator', tabsIndicatorVariants({ variant: resolvedVariant.value }), props.class),
);
</script>

<style>
/* Horizontal positioning */
[data-orientation='horizontal'] > .wui-tabs-indicator[data-variant='default'],
[data-orientation='horizontal'] > .wui-tabs-indicator[data-variant='pill'] {
	width: var(--reka-tabs-indicator-size);
	height: calc(100% - 4px);
	top: 2px;
	left: 0;
	translate: var(--reka-tabs-indicator-position) 0;
}

[data-orientation='horizontal'] > .wui-tabs-indicator[data-variant='underlined'] {
	width: var(--reka-tabs-indicator-size);
	height: 2px;
	bottom: 0;
	left: 0;
	translate: var(--reka-tabs-indicator-position) 0;
}

[data-orientation='horizontal'] > .wui-tabs-indicator[data-variant='ghost'] {
	width: var(--reka-tabs-indicator-size);
	height: 100%;
	top: 0;
	left: 0;
	translate: var(--reka-tabs-indicator-position) 0;
}

/* Vertical positioning */
[data-orientation='vertical'] > .wui-tabs-indicator[data-variant='default'],
[data-orientation='vertical'] > .wui-tabs-indicator[data-variant='pill'] {
	height: var(--reka-tabs-indicator-size);
	width: calc(100% - 4px);
	left: 2px;
	top: 0;
	translate: 0 var(--reka-tabs-indicator-position);
}

[data-orientation='vertical'] > .wui-tabs-indicator[data-variant='underlined'] {
	height: var(--reka-tabs-indicator-size);
	width: 2px;
	right: 0;
	top: 0;
	translate: 0 var(--reka-tabs-indicator-position);
}

[data-orientation='vertical'] > .wui-tabs-indicator[data-variant='ghost'] {
	height: var(--reka-tabs-indicator-size);
	width: 100%;
	left: 0;
	top: 0;
	translate: 0 var(--reka-tabs-indicator-position);
}
</style>
