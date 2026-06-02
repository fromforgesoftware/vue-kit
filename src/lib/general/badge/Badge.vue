<template>
	<div data-slot="badge" :class="classes">
		<slot />
		<button
			v-if="removable"
			type="button"
			data-slot="badge-remove"
			:aria-label="removeLabel"
			:class="removeClasses"
			@click.stop="onRemove"
		>
			<Icon :icon="X" size="none" aria-hidden="true" class="size-full" />
		</button>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { X } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn.js';
import { badgeVariants, badgeRemoveVariants, type BadgeVariants } from './badge.js';

interface BadgeProps {
	variant?: BadgeVariants['variant'];
	size?: BadgeVariants['size'];
	shape?: BadgeVariants['shape'];
	/** Render an internal close button. Emits `remove` on click or Enter/Space. */
	removable?: boolean;
	/** Accessible label for the remove button. Defaults to "Remove". */
	removeLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<BadgeProps>(), {
	variant: 'default',
	size: 'default',
	shape: 'default',
	removable: false,
	removeLabel: 'Remove',
});

const emit = defineEmits<{
	remove: [];
}>();

const classes = computed(() =>
	cn(badgeVariants({ variant: props.variant, size: props.size, shape: props.shape }), props.class),
);

const removeClasses = computed(() => cn(badgeRemoveVariants({ size: props.size })));

function onRemove() {
	emit('remove');
}
</script>
