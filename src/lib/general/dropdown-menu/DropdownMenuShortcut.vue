<template>
	<span data-slot="dropdown-menu-shortcut" :class="classes">
		<slot />
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { dropdownMenuShortcutVariants } from './dropdown-menu.js';

interface DropdownMenuShortcutProps {
	class?: string;
}

const props = defineProps<DropdownMenuShortcutProps>();

const classes = computed(() => cn(dropdownMenuShortcutVariants(), props.class));
</script>
