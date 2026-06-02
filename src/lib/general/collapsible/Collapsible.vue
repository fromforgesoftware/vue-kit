<template>
	<CollapsibleRoot
		v-bind="rootProps"
		:class="classes"
		data-slot="collapsible"
		@update:open="emit('update:open', $event)"
	>
		<slot />
	</CollapsibleRoot>
</template>

<script setup lang="ts">
import { computed, provide, toRef } from 'vue';
import { CollapsibleRoot } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import {
	collapsibleVariants,
	COLLAPSIBLE_VARIANT_KEY,
	COLLAPSIBLE_SIZE_KEY,
	type CollapsibleVariant,
	type CollapsibleSize,
} from './collapsible';

interface CollapsibleProps {
	/** Controlled open state. */
	open?: boolean;
	/** Initial open state when uncontrolled. */
	defaultOpen?: boolean;
	/** When true, prevents the user from interacting with the collapsible. */
	disabled?: boolean;
	/** Visual variant. */
	variant?: CollapsibleVariant;
	/** Density tier — controls padding and trigger typography. */
	size?: CollapsibleSize;
	class?: string;
}

const props = withDefaults(defineProps<CollapsibleProps>(), {
	open: undefined,
	defaultOpen: false,
	disabled: false,
	variant: 'default',
	size: 'default',
});

provide(COLLAPSIBLE_VARIANT_KEY, toRef(props, 'variant'));
provide(COLLAPSIBLE_SIZE_KEY, toRef(props, 'size'));

const emit = defineEmits<{
	'update:open': [value: boolean];
}>();

const rootProps = computed(() => {
	const p: Record<string, unknown> = {
		defaultOpen: props.defaultOpen,
		disabled: props.disabled,
	};
	if (props.open !== undefined) {
		p.open = props.open;
	}
	return p;
});

const classes = computed(() => cn(collapsibleVariants({ variant: props.variant }), props.class));
</script>
