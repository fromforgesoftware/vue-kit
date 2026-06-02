<template>
	<span data-slot="context-menu-shortcut" :class="classes">
		<slot />
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import { contextMenuShortcutVariants } from './context-menu';

interface ContextMenuShortcutProps {
	class?: string;
}

const props = defineProps<ContextMenuShortcutProps>();

const classes = computed(() => cn(contextMenuShortcutVariants(), props.class));
</script>
