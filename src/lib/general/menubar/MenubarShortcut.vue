<template>
	<span data-slot="menubar-shortcut" :class="classes">
		<slot />
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { menubarShortcutVariants } from './menubar';

interface MenubarShortcutProps {
	class?: string;
}

const props = defineProps<MenubarShortcutProps>();

const classes = computed(() => cn(menubarShortcutVariants(), props.class));
</script>
