<template>
	<div ref="wrapperRef" :class="wrapperClasses" data-command-input-wrapper @keydown="onKeyDown">
		<InputSearch
			data-slot="command-palette-input"
			:model-value="ctx.search.value"
			variant="ghost"
			size="lg"
			:placeholder="placeholder"
			autofocus
			@update:model-value="ctx.search.value = $event"
		/>
		<KbdGroup v-if="!ctx.search.value" size="sm" class="me-3 shrink-0 pointer-events-none">
			<Kbd>⌘</Kbd>
			<Kbd>K</Kbd>
		</KbdGroup>
	</div>
</template>

<script setup lang="ts">
import { computed, inject, ref } from 'vue';
import { cn } from '../../../helpers/cn';
import { commandPaletteInputWrapperVariants, COMMAND_PALETTE_KEY } from './command-palette';
import InputSearch from '../../form/input-search/InputSearch.vue';
import Kbd from '../../general/kbd/Kbd.vue';
import KbdGroup from '../../general/kbd/KbdGroup.vue';

interface CommandPaletteInputProps {
	placeholder?: string;
	class?: string;
}

const props = withDefaults(defineProps<CommandPaletteInputProps>(), {
	placeholder: 'Search...',
});

const ctx = inject(COMMAND_PALETTE_KEY)!;
const wrapperRef = ref<HTMLElement | null>(null);

const wrapperClasses = computed(() => cn(commandPaletteInputWrapperVariants(), props.class));

function getVisibleItems(): HTMLElement[] {
	const palette = wrapperRef.value?.closest('[data-command-palette]');
	if (!palette) return [];
	return Array.from(palette.querySelectorAll<HTMLElement>('[data-command-item]')).filter(
		(el) => el.offsetParent !== null && !el.dataset.disabled,
	);
}

function onKeyDown(e: KeyboardEvent) {
	const items = getVisibleItems();
	if (!items.length) return;

	if (e.key === 'Enter') {
		e.preventDefault();
		items.find((el) => el.dataset.value === ctx.highlightedValue.value)?.click();
		return;
	}
	if (e.key !== 'ArrowDown' && e.key !== 'ArrowUp') return;
	e.preventDefault();

	const idx = items.findIndex((el) => el.dataset.value === ctx.highlightedValue.value);
	const next =
		e.key === 'ArrowDown'
			? idx === items.length - 1
				? 0
				: idx + 1
			: idx <= 0
				? items.length - 1
				: idx - 1;

	const nextEl = items[next];
	ctx.setHighlight(nextEl.dataset.value ?? null);
	nextEl.scrollIntoView({ block: 'nearest' });
}
</script>
