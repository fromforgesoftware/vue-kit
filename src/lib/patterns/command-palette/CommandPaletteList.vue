<template>
	<div
		:class="classes"
		data-slot="command-palette-list"
		data-command-list
		role="listbox"
		:aria-label="ariaLabel"
		:aria-busy="loading || undefined"
		tabindex="0"
	>
		<slot v-if="loading" name="loading">
			<div class="flex flex-col gap-1 p-1" aria-hidden="true">
				<div
					v-for="(width, i) in skeletonWidths"
					:key="i"
					class="flex items-center gap-2 rounded-sm px-2 py-2"
				>
					<Skeleton class="size-4 shrink-0 rounded-sm" />
					<Skeleton class="h-3.5 rounded-sm" :style="{ width }" />
				</div>
			</div>
			<span class="sr-only">Searching…</span>
		</slot>
		<slot v-else />
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import { commandPaletteListVariants } from './command-palette.js';
import Skeleton from '../../general/skeleton/Skeleton.vue';

const skeletonWidths = ['70%', '55%', '80%', '45%', '65%'];

interface CommandPaletteListProps {
	/** When true, renders the `loading` slot instead of the default children. */
	loading?: boolean;
	/**
	 * Accessible name for the listbox. Required for axe's
	 * aria-input-field-name rule when no <label> is associated.
	 */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<CommandPaletteListProps>(), {
	loading: false,
	ariaLabel: 'Command results',
});

const classes = computed(() => cn(commandPaletteListVariants(), props.class));
</script>
