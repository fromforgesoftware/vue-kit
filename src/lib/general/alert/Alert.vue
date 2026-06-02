<template>
	<div data-slot="alert" role="alert" :class="classes">
		<Icon v-if="icon" :icon="icon" data-slot="alert-icon" aria-hidden="true" />
		<slot />
		<button
			v-if="dismissible"
			type="button"
			data-slot="alert-dismiss"
			:aria-label="dismissLabel"
			:class="dismissClasses"
			@click.stop="onDismiss"
		>
			<Icon :icon="X" aria-hidden="true" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { X } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { alertVariants, alertDismissVariants, type AlertVariants } from './alert.js';

interface AlertProps {
	variant?: AlertVariants['variant'];
	tone?: AlertVariants['tone'];
	size?: AlertVariants['size'];
	/** Optional leading icon component (e.g. lucide icon). */
	icon?: Component;
	/** Render a built-in dismiss button. Emits `dismiss` on click or Enter/Space. */
	dismissible?: boolean;
	/** Accessible label for the dismiss button. */
	dismissLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<AlertProps>(), {
	variant: 'default',
	tone: 'solid',
	size: 'default',
	dismissible: false,
	dismissLabel: 'Dismiss',
});

const emit = defineEmits<{
	dismiss: [];
}>();

const classes = computed(() =>
	cn(
		alertVariants({ variant: props.variant, tone: props.tone, size: props.size }),
		props.dismissible ? 'pr-9' : '',
		props.class,
	),
);

const dismissClasses = computed(() => cn(alertDismissVariants()));

function onDismiss() {
	emit('dismiss');
}
</script>
