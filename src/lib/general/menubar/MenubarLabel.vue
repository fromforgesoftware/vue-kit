<template>
	<MenubarLabel data-slot="menubar-label" :class="classes">
		<slot />
	</MenubarLabel>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MenubarLabel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { menubarLabelVariants } from './menubar';

interface MenubarLabelProps {
	/** When true, the label is visually indented. */
	inset?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<MenubarLabelProps>(), {
	inset: false,
});

const classes = computed(() => cn(menubarLabelVariants({ inset: props.inset }), props.class));
</script>
