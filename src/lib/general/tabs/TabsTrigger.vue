<template>
	<TabsTrigger data-slot="tabs-trigger" :value="value" :disabled="disabled" :class="classes">
		<slot />
		<Badge
			v-if="hasCount"
			variant="secondary"
			size="xs"
			shape="pill"
			class="ml-1 tabular-nums"
			data-slot="tabs-trigger-count"
		>
			{{ count }}
		</Badge>
	</TabsTrigger>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { TabsTrigger, type TabsTriggerProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import Badge from '../badge/Badge.vue';
import {
	tabsTriggerVariants,
	TABS_VARIANT_KEY,
	TABS_SIZE_KEY,
	type TabsVariant,
	type TabsSize,
} from './tabs';

interface Props extends TabsTriggerProps {
	variant?: TabsVariant;
	size?: TabsSize;
	/**
	 * Optional numeric count rendered as a pill badge after the trigger label.
	 * Hidden when `undefined`. Pass `0` explicitly to force-show a zero badge.
	 */
	count?: number;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	variant: undefined,
	size: undefined,
	count: undefined,
});

const injectedVariant = inject(TABS_VARIANT_KEY, ref<TabsVariant>('default'));
const injectedSize = inject(TABS_SIZE_KEY, ref<TabsSize>('default'));
const resolvedVariant = computed(() => props.variant ?? injectedVariant.value);
const resolvedSize = computed(() => props.size ?? injectedSize.value);

const hasCount = computed(() => props.count !== undefined);

const classes = computed(() =>
	cn(
		tabsTriggerVariants({ variant: resolvedVariant.value, size: resolvedSize.value }),
		props.class,
	),
);
</script>
