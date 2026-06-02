<template>
	<Button
		v-if="supported"
		type="button"
		data-slot="color-eye-dropper"
		variant="ghost"
		:size="buttonSize"
		:disabled="disabled || picking"
		:aria-label="ariaLabel"
		:class="cn(colorEyeDropperVariants({ size }), props.class)"
		@click="onPick"
	>
		<Pipette aria-hidden="true" />
	</Button>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Pipette } from '@lucide/vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn.js';
import {
	colorEyeDropperVariants,
	isEyeDropperSupported,
	pickColorFromScreen,
	type ColorEyeDropperSize,
} from './color-eye-dropper.js';

interface Props {
	/** Density. Matches sibling slider/field sizes. */
	size?: ColorEyeDropperSize;
	/** Disabled state. */
	disabled?: boolean;
	/** Accessible name for the icon-only button. */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	size: 'default',
	disabled: false,
	ariaLabel: 'Pick colour from screen',
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	pick: [value: string];
}>();

const supported = isEyeDropperSupported();
const picking = ref(false);

const buttonSize = computed<'icon-xs' | 'icon-sm' | 'icon'>(() => {
	if (props.size === 'sm') return 'icon-xs';
	if (props.size === 'lg') return 'icon';
	return 'icon-sm';
});

async function onPick(): Promise<void> {
	picking.value = true;
	try {
		const hex = await pickColorFromScreen();
		if (hex) {
			emit('update:modelValue', hex);
			emit('pick', hex);
		}
	} finally {
		picking.value = false;
	}
}
</script>
