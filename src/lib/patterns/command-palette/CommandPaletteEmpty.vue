<template>
	<div
		v-if="isVisible"
		:class="classes"
		data-slot="command-palette-empty"
		data-command-empty
		role="presentation"
	>
		<slot>No results found.</slot>
	</div>
</template>

<script setup lang="ts">
import { computed, inject } from 'vue';
import { cn } from '../../../helpers/cn';
import { commandPaletteEmptyVariants, COMMAND_PALETTE_KEY } from './command-palette';

interface CommandPaletteEmptyProps {
	class?: string;
}

const props = defineProps<CommandPaletteEmptyProps>();

const ctx = inject(COMMAND_PALETTE_KEY)!;

const isVisible = computed(() => ctx.search.value.length > 0 && ctx.visibleCount.value === 0);

const classes = computed(() => cn(commandPaletteEmptyVariants(), props.class));
</script>
