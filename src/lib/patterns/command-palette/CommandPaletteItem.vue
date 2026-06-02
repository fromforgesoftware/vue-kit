<template>
	<div
		v-show="isFiltered"
		ref="elRef"
		:class="classes"
		:data-value="itemValue"
		:data-disabled="disabled || undefined"
		:data-highlighted="highlighted || undefined"
		:data-command-keywords="keywordsAttr"
		data-command-item
		data-slot="command-palette-item"
		role="option"
		@click="onSelect"
		@pointerenter="ctx.setHighlight(itemValue)"
		@pointerleave="ctx.setHighlight(null)"
	>
		<slot />
	</div>
</template>

<script setup lang="ts">
import { computed, inject, onMounted, onUnmounted, ref, watch } from 'vue';
import { cn } from '../../../helpers/cn.js';
import {
	commandPaletteItemVariants,
	COMMAND_PALETTE_KEY,
	COMMAND_PALETTE_GROUP_KEY,
} from './command-palette.js';

interface CommandPaletteItemProps {
	/** Value used for filtering. Falls back to text content if not provided. */
	value?: string;
	/** When true, the item cannot be selected */
	disabled?: boolean;
	/** Synonyms surfaced as `data-command-keywords` for consumer-supplied filters. */
	keywords?: string[];
	class?: string;
}

const props = withDefaults(defineProps<CommandPaletteItemProps>(), {
	disabled: false,
	value: undefined,
	keywords: () => [],
});

const keywordsAttr = computed(() => (props.keywords.length ? props.keywords.join(' ') : undefined));

const emit = defineEmits<{
	select: [];
}>();

const ctx = inject(COMMAND_PALETTE_KEY)!;
const groupCtx = inject(COMMAND_PALETTE_GROUP_KEY, null);
const elRef = ref<HTMLElement | null>(null);

const itemValue = computed(() => props.value ?? elRef.value?.textContent?.trim() ?? '');
const highlighted = computed(
	() => !!ctx.highlightedValue.value && ctx.highlightedValue.value === itemValue.value,
);

const isFiltered = computed(() => {
	if (!ctx.search.value) return true;
	return ctx.filter(itemValue.value, ctx.search.value);
});

const classes = computed(() => cn(commandPaletteItemVariants(), props.class));

// Track visibility to keep ctx.visibleCount (for CommandPaletteEmpty) and the
// owning group's visible count (for hiding empty section headings) accurate.
let wasVisible = false;

function notifyVisibilityChange(visible: boolean) {
	if (visible) {
		ctx.incrementVisible();
		groupCtx?.incrementVisible();
	} else {
		ctx.decrementVisible();
		groupCtx?.decrementVisible();
	}
}

onMounted(() => {
	wasVisible = isFiltered.value;
	if (wasVisible) notifyVisibilityChange(true);
});

watch(isFiltered, (visible) => {
	if (visible && !wasVisible) notifyVisibilityChange(true);
	else if (!visible && wasVisible) notifyVisibilityChange(false);
	wasVisible = visible;
});

onUnmounted(() => {
	if (wasVisible) notifyVisibilityChange(false);
});

function onSelect() {
	if (props.disabled) return;
	ctx.recordSelection(itemValue.value);
	emit('select');
}
</script>
