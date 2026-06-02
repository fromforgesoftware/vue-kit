<template>
	<footer :class="classes" data-slot="command-palette-footer">
		<slot name="hint">
			<span>Type</span>
			<Kbd size="sm">/</Kbd>
			<span>to view available commands</span>
		</slot>
		<div class="ml-auto flex items-center gap-2">
			<slot name="actions">
				<KbdGroup size="sm">
					<Kbd>←</Kbd>
					<Kbd>→</Kbd>
					<Kbd>↑</Kbd>
					<Kbd>↓</Kbd>
				</KbdGroup>
				<span>to navigate</span>
				<Kbd size="sm">↵</Kbd>
				<span>to select</span>
			</slot>
		</div>
	</footer>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import Kbd from '../../general/kbd/Kbd.vue';
import KbdGroup from '../../general/kbd/KbdGroup.vue';
import { commandPaletteFooterVariants } from './command-palette.js';

interface CommandPaletteFooterProps {
	class?: string;
}

const props = defineProps<CommandPaletteFooterProps>();

const classes = computed(() => cn(commandPaletteFooterVariants(), props.class));
</script>
