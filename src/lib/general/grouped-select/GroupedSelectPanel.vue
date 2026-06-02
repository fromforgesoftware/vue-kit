<template>
	<div
		data-slot="grouped-select-panel"
		:class="
			cn(
				'flex flex-col overflow-hidden rounded-md border bg-popover text-popover-foreground',
				props.class,
			)
		"
	>
		<!-- Search -->
		<div v-if="showSearch" data-slot="grouped-select-panel-search" class="border-b p-2">
			<div class="relative">
				<Icon
					:icon="Search"
					size="sm"
					class="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground"
				/>
				<input
					v-model="searchQuery"
					type="text"
					data-slot="grouped-select-search-input"
					:placeholder="resolvedSearchPlaceholder"
					class="border-input h-8 w-full rounded-md border bg-transparent pl-9 pr-8 text-sm outline-none transition-[color,box-shadow] placeholder:text-muted-foreground focus-visible:outline-2 focus-visible:outline-primary focus:border-primary focus:ring-0 focus:ring-inset focus:ring-primary"
				/>
				<button
					v-if="searchQuery"
					type="button"
					data-slot="grouped-select-search-clear"
					aria-label="Clear search"
					class="absolute right-2 top-1/2 -translate-y-1/2 min-w-6 min-h-6 inline-flex items-center justify-center text-muted-foreground hover:text-foreground focus-visible:outline-2 focus-visible:outline-primary"
					@click="searchQuery = ''"
				>
					<Icon :icon="CircleX" size="xs-sm" />
				</button>
			</div>
		</div>

		<!--
      Layout: side-by-side master/detail on sm+, drill-down master/detail on mobile.
      On mobile only one of the two panes is mounted at a time. The mobileView
      ref tracks which pane is shown; tapping a category drills into items,
      the items pane has a back arrow that returns to the category list.
    -->
		<div
			class="flex flex-col sm:flex-row overflow-hidden max-sm:max-h-[60vh] sm:h-[var(--panel-h)]"
			:style="{ '--panel-h': panelHeight }"
		>
			<!-- LEFT: Categories list (always shown on sm+; on mobile only when mobileView === 'categories') -->
			<ScrollArea
				v-show="!isMobile || mobileView === 'categories'"
				class="w-full sm:w-[35%] sm:border-r max-sm:flex-1"
			>
				<div class="p-1">
					<template v-for="(section, index) in groupedCategories" :key="section.name">
						<div v-if="index !== 0" class="-mx-1 my-1 h-px bg-muted" />
						<div
							v-if="section.name && groupedCategories.length > 1"
							class="px-2 py-1.5 text-xs font-semibold text-foreground"
						>
							{{ section.name }}
						</div>
						<button
							v-for="cat in section.categories"
							:key="cat.id"
							type="button"
							data-slot="grouped-select-category"
							class="relative flex w-full cursor-default select-none items-center justify-between gap-2 rounded-sm py-1.5 pl-2 pr-2 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-primary"
							:class="
								selectedCategory === cat.id && !isMobile && 'bg-accent text-accent-foreground'
							"
							@click="onCategoryClick(cat.id)"
						>
							<span class="flex min-w-0 items-center gap-2">
								<span class="truncate">{{ cat.label }}</span>
							</span>
							<span class="flex shrink-0 items-center gap-1.5">
								<Badge
									:variant="getCategorySelectedCount(cat.id) > 0 ? 'default' : 'outline'"
									class="rounded-full px-1.5 py-0 text-[10px] min-w-[32px] justify-center"
								>
									{{ getCategorySelectedCount(cat.id) }}/{{ getCategoryTotalCount(cat.id) }}
								</Badge>
								<Icon
									v-if="isMobile"
									:icon="ChevronRight"
									size="sm"
									class="text-muted-foreground"
									aria-hidden="true"
								/>
							</span>
						</button>
					</template>
				</div>
			</ScrollArea>

			<!-- RIGHT: Items list (always shown on sm+; on mobile only when mobileView === 'items') -->
			<div v-show="!isMobile || mobileView === 'items'" class="flex flex-1 min-w-0 flex-col">
				<!-- Mobile-only: back-to-categories header -->
				<div
					v-if="isMobile"
					class="flex items-center gap-2 border-b px-2 py-1.5"
					data-slot="grouped-select-mobile-header"
				>
					<button
						type="button"
						data-slot="grouped-select-back"
						aria-label="Go back"
						class="inline-flex min-h-9 min-w-9 items-center justify-center rounded-md hover:bg-accent focus-visible:outline-2 focus-visible:outline-primary"
						@click="mobileView = 'categories'"
					>
						<Icon :icon="ChevronLeft" size="sm" />
					</button>
					<span class="truncate text-sm font-medium">{{ activeCategoryLabel }}</span>
				</div>
				<ScrollArea class="flex-1 min-w-0">
					<div class="p-1 overflow-x-hidden">
						<div
							v-for="item in filteredCategoryItems"
							:key="item.id"
							data-slot="grouped-select-item"
							role="button"
							:tabindex="readonly ? -1 : 0"
							:class="
								cn(
									'relative flex w-full select-none items-center gap-2 rounded-sm py-1.5 pl-2 pr-8 text-sm outline-none transition-colors',
									!readonly &&
										'cursor-pointer hover:bg-accent hover:text-accent-foreground focus-visible:outline-2 focus-visible:outline-primary',
								)
							"
							@click="toggleItem(item.id)"
							@keydown.enter.prevent="toggleItem(item.id)"
							@keydown.space.prevent="toggleItem(item.id)"
						>
							<span class="flex size-3.5 items-center justify-center shrink-0">
								<Icon v-if="isSelected(item.id)" :icon="Check" size="sm" class="text-primary" />
							</span>
							<div class="flex-1 min-w-0">
								<div class="truncate" :title="item.panelLabel || item.label">
									{{ item.panelLabel || item.label }}
								</div>
								<div v-if="item.description" class="truncate text-xs text-muted-foreground">
									{{ item.description }}
								</div>
							</div>
							<slot name="item-append" :item="item" />
						</div>
						<div
							v-if="filteredCategoryItems.length === 0"
							class="py-6 text-center text-sm text-muted-foreground"
						>
							No items found
						</div>
					</div>
				</ScrollArea>
			</div>
		</div>

		<!-- Footer -->
		<div
			v-if="showFooter"
			data-slot="grouped-select-panel-footer"
			class="flex items-center justify-between border-t px-3 py-2"
		>
			<span class="text-sm text-muted-foreground"> {{ modelValue.length }} selected </span>
			<slot name="footer-actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import { Search, CircleX, Check, ChevronLeft, ChevronRight } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { useResponsive } from '../../../composables/useResponsive';
import { cn } from '../../../helpers/cn';
import Badge from '../badge/Badge.vue';
import ScrollArea from '../scroll-area/ScrollArea.vue';
import type { GroupedItem, GroupedCategory } from './grouped-select';

const { isMobile } = useResponsive();

interface Props {
	items: GroupedItem[];
	categories: GroupedCategory[];
	modelValue: string[];
	searchPlaceholder?: string;
	showSearch?: boolean;
	showFooter?: boolean;
	readonly?: boolean;
	panelHeight?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	showSearch: true,
	showFooter: true,
	readonly: false,
	panelHeight: '280px',
});

const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? 'Search');

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
}>();

const searchQuery = ref('');
const selectedCategory = ref<string | null>(null);
// Mobile drill-down: 'categories' (master) → 'items' (detail). Reset to
// 'categories' on close so re-opening always lands on the master view.
const mobileView = ref<'categories' | 'items'>('categories');

const activeCategoryLabel = computed(
	() => props.categories.find((c) => c.id === selectedCategory.value)?.label ?? '',
);

function onCategoryClick(id: string) {
	selectedCategory.value = id;
	if (isMobile.value) {
		mobileView.value = 'items';
	}
}

const filteredCategories = computed(() => {
	if (!searchQuery.value) return props.categories;

	const q = searchQuery.value.toLowerCase();
	return props.categories.filter((cat) =>
		props.items.some(
			(item) =>
				item.category === cat.id &&
				(item.label.toLowerCase().includes(q) ||
					item.description?.toLowerCase().includes(q) ||
					item.id.toLowerCase().includes(q)),
		),
	);
});

const groupedCategories = computed(() => {
	const sections = new Map<string, GroupedCategory[]>();
	for (const cat of filteredCategories.value) {
		const section = cat.section ?? '';
		if (!sections.has(section)) sections.set(section, []);
		sections.get(section)!.push(cat);
	}
	return Array.from(sections.entries()).map(([name, categories]) => ({
		name,
		categories,
	}));
});

const filteredCategoryItems = computed(() => {
	let items = props.items.filter((i) => i.category === selectedCategory.value);
	if (searchQuery.value) {
		const q = searchQuery.value.toLowerCase();
		items = items.filter(
			(i) =>
				i.label.toLowerCase().includes(q) ||
				i.description?.toLowerCase().includes(q) ||
				i.id.toLowerCase().includes(q),
		);
	}
	return [...items].sort((a, b) => {
		const orderA = a.displayOrder ?? 99;
		const orderB = b.displayOrder ?? 99;
		if (orderA !== orderB) return orderA - orderB;
		return a.label.localeCompare(b.label);
	});
});

function isSelected(id: string): boolean {
	return props.modelValue.includes(id);
}

function toggleItem(id: string) {
	if (props.readonly) return;
	const newValue = isSelected(id)
		? props.modelValue.filter((v) => v !== id)
		: [...props.modelValue, id];
	emit('update:modelValue', newValue);
}

function getCategorySelectedCount(categoryId: string): number {
	return props.items.filter((i) => i.category === categoryId && props.modelValue.includes(i.id))
		.length;
}

function getCategoryTotalCount(categoryId: string): number {
	return props.items.filter((i) => i.category === categoryId).length;
}

watch(
	() => filteredCategories.value,
	(cats) => {
		if (cats.length > 0 && !cats.some((c) => c.id === selectedCategory.value)) {
			selectedCategory.value = cats[0].id;
		}
	},
	{ immediate: true },
);

watch(searchQuery, (query) => {
	if (!query) return;
	const q = query.toLowerCase();
	for (const cat of props.categories) {
		const hasMatch = props.items.some(
			(i) =>
				i.category === cat.id &&
				(i.label.toLowerCase().includes(q) ||
					i.description?.toLowerCase().includes(q) ||
					i.id.toLowerCase().includes(q)),
		);
		if (hasMatch) {
			selectedCategory.value = cat.id;
			break;
		}
	}
});
</script>
