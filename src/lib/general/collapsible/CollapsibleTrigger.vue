<template>
	<CollapsibleTrigger
		:as-child="asChild"
		:class="asChild ? props.class : classes"
		data-slot="collapsible-trigger"
	>
		<Icon
			v-if="!asChild && chevronPosition === 'left'"
			:icon="ChevronRight"
			size="sm"
			data-slot="collapsible-chevron"
			aria-hidden="true"
			class="text-muted-foreground transition-transform duration-200"
		/>
		<slot />
		<Icon
			v-if="!asChild && chevronPosition === 'right'"
			:icon="ChevronDown"
			size="sm"
			data-slot="collapsible-chevron"
			aria-hidden="true"
			class="text-muted-foreground transition-transform duration-200"
		/>
	</CollapsibleTrigger>
</template>

<script setup lang="ts">
import { CollapsibleTrigger } from 'reka-ui';
import { computed, inject } from 'vue';
import { ChevronDown, ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import {
	collapsibleTriggerVariants,
	COLLAPSIBLE_VARIANT_KEY,
	COLLAPSIBLE_SIZE_KEY,
	type CollapsibleVariant,
	type CollapsibleSize,
	type CollapsibleChevronPosition,
} from './collapsible';

interface CollapsibleTriggerProps {
	/**
	 * When true, the trigger merges into its only child via Reka's `as-child`
	 * pattern — useful when wrapping a `<Button>` directly. When false (default
	 * for the styled trigger), the trigger renders its own `<button>` with the
	 * variant/size classes from the parent.
	 */
	asChild?: boolean;
	/**
	 * Auto-renders a chevron icon on the trigger and rotates it on open. Set to
	 * `'left'` for accordion-style nav menus, `'right'` for FAQ-style triggers.
	 * Default `'none'` keeps backward compatibility (no auto-chevron). Has no
	 * effect when `asChild` is true.
	 */
	chevronPosition?: CollapsibleChevronPosition;
	class?: string;
}

const props = withDefaults(defineProps<CollapsibleTriggerProps>(), {
	asChild: false,
	chevronPosition: 'none',
});

const variant = inject<{ value: CollapsibleVariant } | undefined>(
	COLLAPSIBLE_VARIANT_KEY,
	undefined,
);
const size = inject<{ value: CollapsibleSize } | undefined>(COLLAPSIBLE_SIZE_KEY, undefined);

const classes = computed(() =>
	cn(
		collapsibleTriggerVariants({
			variant: variant?.value,
			size: size?.value,
			chevronPosition: props.chevronPosition,
		}),
		props.class,
	),
);
</script>
