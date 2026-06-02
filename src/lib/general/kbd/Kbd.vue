<template>
	<kbd data-slot="kbd" :class="classes"><slot /></kbd>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { kbdVariants, KBD_SIZE_KEY, KBD_VARIANT_KEY, type KbdVariants } from './kbd.js';

interface KbdProps {
	size?: KbdVariants['size'];
	variant?: KbdVariants['variant'];
	class?: string;
}

const props = defineProps<KbdProps>();

const groupSize = inject(KBD_SIZE_KEY, undefined);
const groupVariant = inject(KBD_VARIANT_KEY, undefined);

const classes = computed(() =>
	cn(
		kbdVariants({
			size: props.size ?? groupSize,
			variant: props.variant ?? groupVariant,
		}),
		props.class,
	),
);
</script>
