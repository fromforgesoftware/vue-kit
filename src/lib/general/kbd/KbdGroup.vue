<template>
	<span
		data-slot="kbd-group"
		:class="cn(kbdGroupVariants({ variant: props.variant }), props.class)"
	>
		<slot />
	</span>
</template>

<script setup lang="ts">
import { provide } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { kbdGroupVariants, KBD_SIZE_KEY, KBD_VARIANT_KEY, type KbdVariants } from './kbd.js';

interface KbdGroupProps {
	size?: KbdVariants['size'];
	variant?: KbdVariants['variant'];
	class?: string;
}

const props = defineProps<KbdGroupProps>();

if (props.size) {
	provide(KBD_SIZE_KEY, props.size);
}
if (props.variant) {
	provide(KBD_VARIANT_KEY, props.variant);
}
</script>
