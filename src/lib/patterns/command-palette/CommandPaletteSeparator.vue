<template>
	<div
		:class="classes"
		data-slot="command-palette-separator"
		data-command-separator
		role="separator"
	/>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { commandPaletteSeparatorVariants } from './command-palette.js';

interface CommandPaletteSeparatorProps {
	class?: string;
}

const props = defineProps<CommandPaletteSeparatorProps>();

const classes = computed(() => cn(commandPaletteSeparatorVariants(), props.class));
</script>
