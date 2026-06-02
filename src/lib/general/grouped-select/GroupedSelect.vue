<template>
	<PopoverRoot v-model:open="open">
		<PopoverTrigger as-child :disabled="disabled">
			<button
				type="button"
				:disabled="disabled"
				data-slot="grouped-select-trigger"
				:class="
					cn(
						'border-input flex min-h-8 w-full items-center gap-1.5 rounded-md border bg-transparent px-3 py-1.5 text-sm transition-[color,box-shadow] outline-none',
						'focus-visible:outline-2 focus-visible:outline-primary focus-within:ring-0 focus-within:ring-inset focus-within:ring-primary focus-within:border-primary',
						'disabled:cursor-not-allowed disabled:opacity-50',
						props.class,
					)
				"
			>
				<span
					v-if="selectedItems.length > 0"
					class="flex min-w-0 flex-1 items-center gap-1.5 overflow-hidden"
				>
					<!--
            Selected chips are rendered as plain visual tags inside the trigger
            button. They cannot host their own remove control because nesting
            an interactive element (button or [role=button]) inside another
            button violates WCAG nested-interactive — even with tabindex="-1",
            assistive technologies can still focus it. The inline X icon is
            therefore decorative; users remove a selection by re-opening the
            panel and unchecking it (or clicking the chip itself, which opens
            the popover via the parent button click handler).
          -->
					<span
						v-for="item in visibleChips"
						:key="item.id"
						data-slot="grouped-select-chip"
						class="inline-flex min-w-0 items-center gap-1 rounded-md bg-secondary px-2 py-0.5 text-sm max-sm:max-w-[55%]"
					>
						<span class="truncate">{{ item.label }}</span>
						<Icon :icon="X" size="xs" aria-hidden="true" class="shrink-0 opacity-50" />
					</span>
					<span v-if="overflowCount > 0" class="shrink-0 text-sm text-muted-foreground">
						+{{ overflowCount }}
					</span>
				</span>
				<span v-else-if="selectedItems.length === 0" class="text-muted-foreground">{{
					resolvedPlaceholder
				}}</span>
				<Icon
					:icon="ChevronDown"
					size="sm"
					class="ml-auto shrink-0 cursor-pointer opacity-50 transition-transform"
					:class="open ? 'rotate-180' : undefined"
				/>
			</button>
		</PopoverTrigger>
		<PopoverPortal>
			<PopoverContent
				data-slot="grouped-select-content"
				side="bottom"
				:side-offset="4"
				align="start"
				class="z-[60] w-[var(--reka-popover-trigger-width)] sm:min-w-[400px] max-w-[calc(100vw-1rem)] rounded-md border bg-popover p-0 text-popover-foreground shadow-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[side=bottom]:slide-in-from-top-2"
				@open-auto-focus.prevent
			>
				<GroupedSelectPanel
					:items="items"
					:categories="categories"
					:model-value="modelValue"
					:search-placeholder="resolvedSearchPlaceholder"
					:panel-height="panelHeight"
					class="border-0 shadow-none rounded-none"
					@update:model-value="handleSelectionChange"
				>
					<template #item-append="{ item }">
						<slot name="item-append" :item="item" />
					</template>
					<template #footer-actions>
						<Button size="sm" data-slot="grouped-select-done" @click="open = false">
							Confirm
						</Button>
					</template>
				</GroupedSelectPanel>
			</PopoverContent>
		</PopoverPortal>
	</PopoverRoot>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { PopoverRoot, PopoverTrigger, PopoverPortal, PopoverContent } from 'reka-ui';
import { ChevronDown, X } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { useResponsive } from '../../../composables/useResponsive.js';
import { cn } from '../../../helpers/cn.js';
import Button from '../button/Button.vue';
import GroupedSelectPanel from './GroupedSelectPanel.vue';
import type { GroupedItem, GroupedCategory } from './grouped-select.js';

const { isMobile } = useResponsive();

interface Props {
	items: GroupedItem[];
	categories: GroupedCategory[];
	modelValue: string[];
	placeholder?: string;
	disabled?: boolean;
	maxChips?: number;
	searchPlaceholder?: string;
	panelHeight?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	disabled: false,
	maxChips: 3,
	panelHeight: '280px',
});

const resolvedPlaceholder = computed(() => props.placeholder ?? 'Select items...');
const resolvedSearchPlaceholder = computed(() => props.searchPlaceholder ?? 'Search');

const emit = defineEmits<{
	'update:modelValue': [value: string[]];
}>();

const open = ref(false);

const selectedItems = computed(
	() =>
		props.modelValue
			.map((id) => props.items.find((item) => item.id === id))
			.filter(Boolean) as GroupedItem[],
);

// On narrow viewports, only one chip fits before "+N" is pushed off-screen,
// so clamp to a single chip on mobile regardless of the consumer's maxChips.
const effectiveMaxChips = computed(() => (isMobile.value ? 1 : props.maxChips));
const visibleChips = computed(() => selectedItems.value.slice(0, effectiveMaxChips.value));
const overflowCount = computed(() =>
	Math.max(0, selectedItems.value.length - effectiveMaxChips.value),
);

function handleSelectionChange(value: string[]) {
	emit('update:modelValue', value);
}
</script>
