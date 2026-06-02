<template>
	<Primitive
		:as="as"
		:as-child="asChild"
		data-slot="button"
		:class="classes"
		:disabled="as === 'button' && isDisabled ? true : undefined"
		:aria-disabled="ariaDisabled"
		:data-loading="loading ? '' : undefined"
		@click="onClick"
	>
		<Spinner
			v-if="loading"
			data-slot="button-spinner"
			:size="spinnerSize"
			tone="current"
			:label="loadingLabel"
			class="-ms-0.5"
		/>
		<slot />
	</Primitive>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Primitive, type PrimitiveProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { buttonVariants, type ButtonVariants } from './button';
import Spinner from '../spinner/Spinner.vue';

interface ButtonProps extends /* @vue-ignore */ PrimitiveProps {
	/** Element to render as. Defaults to `button`. Combine with `asChild` to merge props onto a slot child (e.g. `<RouterLink>`). */
	as?: PrimitiveProps['as'];
	/** Render the slot child as the root, merging button props/classes onto it. Use to wrap router links or anchors. */
	asChild?: boolean;
	/** Visual style. */
	variant?: ButtonVariants['variant'];
	/** Density. Use `icon-*` sizes for icon-only buttons (requires `aria-label`). */
	size?: ButtonVariants['size'];
	/** Full-width within parent. */
	block?: boolean;
	/** Whether the button is disabled. */
	disabled?: boolean;
	/** Whether the button is in a loading state. Implicitly disables interaction. */
	loading?: boolean;
	/** Optional override for the loading spinner's accessible label. Defaults to "Loading". */
	loadingLabel?: string;
	/** Extra classes appended after CVA output (mostly for layout — prefer adding a variant for visual changes). */
	class?: string;
}

const props = withDefaults(defineProps<ButtonProps>(), {
	as: 'button',
	asChild: false,
	variant: 'default',
	size: 'default',
	block: false,
	disabled: false,
	loading: false,
	loadingLabel: 'Loading',
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

function onClick(event: MouseEvent) {
	if (props.disabled || props.loading) {
		event.preventDefault();
		event.stopPropagation();
		return;
	}
	emit('click', event);
}

const classes = computed(() =>
	cn(buttonVariants({ variant: props.variant, size: props.size, block: props.block }), props.class),
);

const isDisabled = computed(() => props.disabled || props.loading);

// For non-button `as` values, native `disabled` doesn't apply — use aria-disabled.
const ariaDisabled = computed(() =>
	isDisabled.value && props.as !== 'button' ? 'true' : undefined,
);

const spinnerSize = computed(() => {
	switch (props.size) {
		case 'xs':
		case 'icon-xs':
		case 'sm':
		case 'icon-sm':
			return 'sm' as const;
		case 'lg':
		case 'icon-lg':
			return 'default' as const;
		default:
			return 'sm' as const;
	}
});
</script>
