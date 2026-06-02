<template>
	<div :class="classes" data-slot="command-palette" data-command-palette>
		<!--
      Slot exposes `search` so parent can conditionally render sections.
      Example: hide "Recent" group while the user is actively searching.
        <CommandPalette v-slot="{ search }">
          <CommandPaletteGroup v-if="!search" heading="Recent">…</CommandPaletteGroup>
          <CommandPaletteGroup heading="Navigation">…</CommandPaletteGroup>
        </CommandPalette>
    -->
		<slot
			:search="search"
			:recent-values="recentValues"
			:remove-selection="removeSelection"
			:clear-selections="clearSelections"
		/>
	</div>
</template>

<script setup lang="ts">
import { computed, provide, ref, watch } from 'vue';
import { cn } from '../../../helpers/cn';
import {
	commandPaletteVariants,
	COMMAND_PALETTE_KEY,
	type CommandPaletteContext,
} from './command-palette';

const MAX_RECENTS = 5;

interface CommandPaletteProps {
	/** Custom filter function. Return true to show the item. Default: case-insensitive includes */
	filter?: (value: string, search: string) => boolean;
	/**
	 * sessionStorage key used to persist recently selected item values.
	 * Override when mounting multiple independent palettes on the same page.
	 */
	storageKey?: string;
	class?: string;
}

const props = withDefaults(defineProps<CommandPaletteProps>(), {
	filter: undefined,
	storageKey: 'command-palette-recents',
});

// Optional v-model:search — consumer can read/write the search query.
// When omitted, the palette manages search internally as before.
const search = defineModel<string>('search', { default: '' });
const highlightedValue = ref<string | null>(null);

watch(search, () => {
	highlightedValue.value = null;
});

const activeSubmenu = ref<string | null>(null);
const submenuLabel = ref<string | null>(null);
const visibleCount = ref(0);

// Recents persist across the session via sessionStorage.
function readRecents(): string[] {
	try {
		return JSON.parse(sessionStorage.getItem(props.storageKey) ?? '[]');
	} catch {
		return [];
	}
}

const recentValues = ref<string[]>(readRecents());

function recordSelection(value: string) {
	if (!value) return;
	const updated = [value, ...recentValues.value.filter((v) => v !== value)].slice(0, MAX_RECENTS);
	recentValues.value = updated;
	sessionStorage.setItem(props.storageKey, JSON.stringify(updated));
}

function removeSelection(value: string) {
	const updated = recentValues.value.filter((v) => v !== value);
	recentValues.value = updated;
	sessionStorage.setItem(props.storageKey, JSON.stringify(updated));
}

function clearSelections() {
	recentValues.value = [];
	sessionStorage.removeItem(props.storageKey);
}

const defaultFilter = (value: string, query: string): boolean => {
	if (!query) return true;
	return value.toLowerCase().includes(query.toLowerCase());
};

const ctx: CommandPaletteContext = {
	search,
	get filter() {
		return props.filter ?? defaultFilter;
	},
	activeSubmenu,
	submenuLabel,
	pushSubmenu(id: string, label: string) {
		activeSubmenu.value = id;
		submenuLabel.value = label;
	},
	popSubmenu() {
		activeSubmenu.value = null;
		submenuLabel.value = null;
	},
	visibleCount,
	incrementVisible() {
		visibleCount.value++;
	},
	decrementVisible() {
		visibleCount.value = Math.max(0, visibleCount.value - 1);
	},
	recentValues,
	recordSelection,
	removeSelection,
	clearSelections,
	highlightedValue,
	setHighlight(value: string | null) {
		highlightedValue.value = value;
	},
};

provide(COMMAND_PALETTE_KEY, ctx);

const classes = computed(() => cn(commandPaletteVariants(), props.class));
</script>
