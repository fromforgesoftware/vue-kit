<template>
	<div
		data-slot="multi-select-list"
		:class="
			cn('rounded-md border border-border bg-card overflow-hidden flex flex-col', props.class)
		"
	>
		<div v-if="showSearch" class="border-b border-border p-3">
			<InputSearch v-model="search" :placeholder="resolvedSearchPlaceholder" />
		</div>

		<div
			v-if="filteredItems.length === 0"
			class="px-6 py-8 text-center text-sm text-muted-foreground"
		>
			<slot name="empty" :search="search">
				{{ search ? 'No results found' : (emptyText ?? 'No results found') }}
			</slot>
		</div>

		<!-- Virtualized list: keeps DOM row count bounded for very large pools. -->
		<VirtualScrollArea
			v-else-if="virtualize"
			:items="filteredItems"
			:estimate-size="itemHeight"
			:style="{ maxHeight: maxHeight }"
		>
			<template #default="{ item }">
				<label
					class="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-accent/50 transition-colors border-b border-border"
				>
					<Checkbox
						:checked="selectedSet.has(getKey(item as T))"
						@update:checked="() => toggle(getKey(item as T))"
					/>
					<slot :item="item as T" :selected="selectedSet.has(getKey(item as T))" />
				</label>
			</template>
		</VirtualScrollArea>

		<div v-else class="overflow-y-auto" :style="{ maxHeight: maxHeight }">
			<div class="divide-y divide-border">
				<label
					v-for="item in filteredItems"
					:key="getKey(item)"
					class="flex items-center gap-3 px-6 py-3 cursor-pointer hover:bg-accent/50 transition-colors"
				>
					<Checkbox
						:checked="selectedSet.has(getKey(item))"
						@update:checked="() => toggle(getKey(item))"
					/>
					<slot :item="item" :selected="selectedSet.has(getKey(item))" />
				</label>
			</div>
		</div>

		<div
			v-if="showFooter"
			class="flex items-center justify-between gap-3 border-t border-border px-6 py-2"
		>
			<p class="text-xs text-muted-foreground">{{ modelValue.length }} selected</p>
			<div class="flex items-center gap-3">
				<Button
					variant="link"
					size="sm"
					:disabled="filteredItems.length === 0"
					@click="selectAllFiltered"
				>
					{{ selectAllLabel ?? 'Select all' }}
				</Button>
				<Button
					variant="link"
					size="sm"
					:disabled="!hasSelectionInFilter"
					@click="deselectAllFiltered"
				>
					{{ deselectAllLabel ?? 'Deselect all' }}
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts" generic="T">
import { ref, computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import InputSearch from '../../form/input-search/InputSearch.vue';
import Checkbox from '../../form/checkbox/Checkbox.vue';
import Button from '../button/Button.vue';
import VirtualScrollArea from '../virtual-scroll-area/VirtualScrollArea.vue';

export interface MultiSelectListProps<TItem> {
	/** Pool of items to choose from. */
	items: TItem[];
	/** Currently selected item ids. v-model. */
	modelValue: string[];
	/** Returns the unique id for an item. Defaults to `item.id`. */
	itemKey?: (item: TItem) => string;
	/** Returns the text matched against the search query. Defaults to `item.name ?? item.label`. */
	searchableText?: (item: TItem) => string;
	searchPlaceholder?: string;
	showSearch?: boolean;
	showFooter?: boolean;
	/** CSS max-height for the scrollable list area. Default `20rem` (~8 rows). */
	maxHeight?: string;
	/** Text shown when items is empty (no filter active). */
	emptyText?: string;
	selectAllLabel?: string;
	deselectAllLabel?: string;
	/**
	 * Render rows through `<VirtualScrollArea>`. Worth enabling once the pool
	 * grows past a few hundred items; not needed for typical lists.
	 */
	virtualize?: boolean;
	/** Estimated row height (px) for the virtualizer. Default 52. */
	itemHeight?: number;
	class?: string;
}

const props = withDefaults(defineProps<MultiSelectListProps<T>>(), {
	showSearch: true,
	showFooter: true,
	maxHeight: '20rem',
	virtualize: false,
	itemHeight: 52,
});

const emit = defineEmits<{ 'update:modelValue': [value: string[]] }>();

const search = ref('');

const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? 'Search');

function getKey(item: T): string {
	if (props.itemKey) return props.itemKey(item);
	return (item as unknown as { id: string }).id;
}

function getSearchText(item: T): string {
	if (props.searchableText) return props.searchableText(item);
	const obj = item as unknown as { name?: string; label?: string };
	return obj.name ?? obj.label ?? '';
}

const selectedSet = computed(() => new Set(props.modelValue));

const filteredItems = computed(() => {
	const q = search.value.trim().toLowerCase();
	if (!q) return props.items;
	return props.items.filter((item) => getSearchText(item).toLowerCase().includes(q));
});

const hasSelectionInFilter = computed(() =>
	filteredItems.value.some((item) => selectedSet.value.has(getKey(item))),
);

function toggle(id: string) {
	const next = new Set(selectedSet.value);
	if (next.has(id)) next.delete(id);
	else next.add(id);
	emit('update:modelValue', Array.from(next));
}

function selectAllFiltered() {
	const next = new Set(selectedSet.value);
	for (const item of filteredItems.value) next.add(getKey(item));
	emit('update:modelValue', Array.from(next));
}

function deselectAllFiltered() {
	const next = new Set(selectedSet.value);
	for (const item of filteredItems.value) next.delete(getKey(item));
	emit('update:modelValue', Array.from(next));
}
</script>
