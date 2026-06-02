<template>
	<Button
		variant="outline"
		data-slot="command-palette-trigger"
		:class="cn('w-full justify-between font-normal text-muted-foreground', props.class)"
		@click="open = true"
	>
		<Icon :icon="Search" size="sm" />
		<span class="flex-1 truncate text-left">{{ placeholder }}</span>
		<Kbd size="sm" class="pointer-events-none hidden sm:inline-flex">
			{{ shortcut }}
		</Kbd>
	</Button>

	<CommandPaletteDialog v-model:open="open">
		<!--
      Slot scope exposes `close` so items can close the dialog on select.
      Usage:
        <CommandPaletteTrigger v-slot="{ close }">
          <CommandPalette>
            ...
            <CommandPaletteItem @select="close">Go to Dashboard</CommandPaletteItem>
          </CommandPalette>
        </CommandPaletteTrigger>
    -->
		<slot :close="() => (open = false)" />
	</CommandPaletteDialog>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { Search } from '@lucide/vue';
import { cn } from '../../../helpers/cn';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import Kbd from '../../general/kbd/Kbd.vue';
import CommandPaletteDialog from './CommandPaletteDialog.vue';

interface CommandPaletteTriggerProps {
	/** Label shown inside the button */
	placeholder?: string;
	/** Shortcut label rendered in the badge (display only) */
	shortcut?: string;
	/** Actual key to listen for, combined with Meta/Ctrl */
	shortcutKey?: string;
	class?: string;
}

const props = withDefaults(defineProps<CommandPaletteTriggerProps>(), {
	placeholder: 'Search...',
	shortcut: '⌘K',
	shortcutKey: 'k',
});

const open = ref(false);

function handleKeyDown(e: KeyboardEvent) {
	if ((e.metaKey || e.ctrlKey) && e.key === props.shortcutKey) {
		e.preventDefault();
		open.value = !open.value;
	}
}

onMounted(() => window.addEventListener('keydown', handleKeyDown));
onUnmounted(() => window.removeEventListener('keydown', handleKeyDown));
</script>
