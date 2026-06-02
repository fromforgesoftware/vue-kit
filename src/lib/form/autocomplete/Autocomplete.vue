<template>
	<ComboboxRoot
		data-slot="autocomplete"
		:model-value="rekaModelValue"
		:open="open"
		:multiple="multiple"
		:disabled="disabled"
		:class="rootClass"
		:reset-search-term-on-select="multiple"
		:ignore-filter="!!fetch"
		@update:model-value="handleRootUpdate"
		@update:open="handleOpenChange"
	>
		<ComboboxAnchor
			data-slot="autocomplete-anchor"
			:aria-invalid="error || undefined"
			:class="anchorClass"
		>
			<!-- Inner wrapper: clips chip + input overflow on the left so the clear and
           trigger buttons on the right always stay visible regardless of how many
           chips are selected. -->
			<div
				data-slot="autocomplete-content-row"
				class="flex flex-1 min-w-0 items-center gap-1 overflow-hidden"
			>
				<!-- Chips (multi mode). Style matches `SelectValue`'s multi chips 1:1 so the two
             components share visual grammar — same height, same colors, same remove icon. -->
				<template v-if="multiple">
					<span
						v-for="opt in visibleChips"
						:key="opt.value"
						data-slot="autocomplete-chip"
						class="inline-flex shrink-0 items-center gap-1 rounded-md bg-secondary px-1.5 py-0.5 text-xs"
					>
						<span class="max-w-[8rem] truncate">{{ opt.label }}</span>
						<Button
							v-if="!disabled"
							variant="ghost"
							size="icon-xs"
							data-slot="autocomplete-chip-remove"
							class="size-auto rounded-sm bg-transparent opacity-70 hover:bg-transparent hover:opacity-100"
							:aria-label="`Remove ${opt.label}`"
							@click.stop="removeChip(opt.value)"
							@keydown.enter.prevent="removeChip(opt.value)"
							@keydown.space.prevent="removeChip(opt.value)"
						>
							<Icon :icon="X" size="xs" aria-hidden="true" />
						</Button>
					</span>
					<span
						v-if="overflowCount > 0"
						data-slot="autocomplete-chip-overflow"
						class="shrink-0 text-xs text-muted-foreground"
						:title="`${overflowCount} more selected`"
						aria-hidden="true"
					>
						+{{ overflowCount }}
					</span>
				</template>

				<ComboboxInput
					:id="id"
					v-model="inputValue"
					data-slot="autocomplete-input"
					:display-value="displayValue"
					class="flex-1 min-w-0 bg-transparent outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed"
					:placeholder="effectivePlaceholder"
					:disabled="disabled"
					:aria-label="ariaLabel"
					:aria-describedby="describedBy"
					@input="handleInput"
					@focus="onInputFocus"
					@keydown.backspace="onBackspace"
				/>
			</div>
			<Button
				v-if="clearable && hasValue"
				variant="ghost"
				size="icon-xs"
				data-slot="autocomplete-clear"
				class="size-auto shrink-0 rounded-sm bg-transparent p-0 text-muted-foreground hover:bg-transparent hover:text-foreground"
				:disabled="disabled"
				:aria-label="clearLabel"
				@click.stop="handleClear"
			>
				<Icon :icon="CircleX" size="sm" aria-hidden="true" />
			</Button>
			<ComboboxTrigger
				data-slot="autocomplete-trigger"
				class="shrink-0 cursor-pointer"
				:disabled="disabled"
				:aria-label="triggerLabel"
			>
				<Icon :icon="ChevronDown" size="sm" class="opacity-50" aria-hidden="true" />
			</ComboboxTrigger>
		</ComboboxAnchor>

		<ComboboxContent data-slot="autocomplete-content" :class="contentClass">
			<ComboboxViewport as-child>
				<div
					ref="viewportRef"
					data-slot="autocomplete-viewport"
					:class="viewportClass"
					role="group"
					aria-label="Autocomplete options"
					tabindex="0"
					@scroll="onViewportScroll"
				>
					<!-- Header slot -->
					<slot name="header" />

					<!-- Loading state — initial fetch or client-side loading -->
					<div
						v-if="isLoading && totalItems === 0"
						data-slot="autocomplete-loading"
						:class="loadingClass"
					>
						<Spinner size="sm" />
					</div>

					<template v-else>
						<!-- Empty state -->
						<ComboboxEmpty data-slot="autocomplete-empty" :class="emptyClass">
							{{ emptyText }}
						</ComboboxEmpty>

						<!-- Grouped (client-side mode only) -->
						<template v-if="!fetch && groups">
							<template v-for="(group, index) in visibleGroups" :key="group.label">
								<ComboboxSeparator
									v-if="index !== 0"
									data-slot="autocomplete-separator"
									:class="separatorClass"
								/>
								<ComboboxGroup data-slot="autocomplete-group">
									<ComboboxLabel data-slot="autocomplete-label" :class="labelClass">
										{{ group.label }}
									</ComboboxLabel>
									<ComboboxItem
										v-for="option in group.options"
										:key="option.value"
										data-slot="autocomplete-item"
										:value="option.value"
										:disabled="option.disabled"
										:class="itemClass"
									>
										<span class="flex-1 truncate">{{ option.label }}</span>
										<span v-if="option.description" class="text-xs text-muted-foreground truncate">
											{{ option.description }}
										</span>
										<span
											data-slot="autocomplete-item-indicator-wrapper"
											class="absolute right-2 flex size-3.5 items-center justify-center"
										>
											<ComboboxItemIndicator data-slot="autocomplete-item-indicator">
												<Icon :icon="Check" size="sm" aria-hidden="true" />
											</ComboboxItemIndicator>
										</span>
									</ComboboxItem>
								</ComboboxGroup>
							</template>
						</template>

						<!-- Flat options (covers both fetch mode and client-side flat options) -->
						<template v-else>
							<ComboboxItem
								v-for="option in flatOptions"
								:key="option.value"
								data-slot="autocomplete-item"
								:value="option.value"
								:disabled="option.disabled"
								:class="itemClass"
							>
								<span class="flex-1 truncate">{{ option.label }}</span>
								<span v-if="option.description" class="text-xs text-muted-foreground truncate">
									{{ option.description }}
								</span>
								<span
									data-slot="autocomplete-item-indicator-wrapper"
									class="absolute right-2 flex size-3.5 items-center justify-center"
								>
									<ComboboxItemIndicator data-slot="autocomplete-item-indicator">
										<Icon :icon="Check" size="sm" aria-hidden="true" />
									</ComboboxItemIndicator>
								</span>
							</ComboboxItem>

							<!-- Infinite-scroll sentinel — only in fetch mode and when more pages exist -->
							<div
								v-if="fetch && hasMore"
								ref="sentinelRef"
								data-slot="autocomplete-load-more"
								class="flex items-center justify-center py-2 text-xs text-muted-foreground"
							>
								<Spinner v-if="isLoading" size="sm" />
								<span v-else>Loading more…</span>
							</div>
						</template>
					</template>
				</div>
			</ComboboxViewport>
		</ComboboxContent>
	</ComboboxRoot>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue';
import {
	ComboboxRoot,
	ComboboxAnchor,
	ComboboxInput,
	ComboboxTrigger,
	ComboboxContent,
	ComboboxViewport,
	ComboboxEmpty,
	ComboboxItem,
	ComboboxItemIndicator,
	ComboboxGroup,
	ComboboxLabel,
	ComboboxSeparator,
} from 'reka-ui';
import { Check, ChevronDown, CircleX, X } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn.js';
import Spinner from '../../general/spinner/Spinner.vue';
import {
	autocompleteVariants,
	autocompleteAnchorVariants,
	autocompleteContentVariants,
	autocompleteViewportVariants,
	autocompleteItemVariants,
	autocompleteEmptyVariants,
	autocompleteLoadingVariants,
	autocompleteLabelVariants,
	autocompleteSeparatorVariants,
	type AutocompleteOption,
	type AutocompleteOptionGroup,
	type AutocompleteSize,
	type AutocompleteFetcher,
	type AutocompleteResolver,
} from './autocomplete.js';

interface AutocompleteProps {
	/** Selected option value (single) or values (multi). */
	modelValue?: string | string[] | null;
	/** Multi-select mode. */
	multiple?: boolean;
	/** Flat list of options (client-side mode). Ignored when `fetch` is provided. */
	options?: AutocompleteOption[];
	/** Grouped options (client-side mode). Ignored when `fetch` is provided. */
	groups?: AutocompleteOptionGroup[];
	/**
	 * Server-side fetcher. When provided, the component owns the option list and ignores
	 * `options` / `groups`. The function receives the search query, a 1-indexed page number,
	 * and an `AbortSignal` that fires when the request is superseded by another keystroke
	 * or when the popover closes.
	 */
	fetch?: AutocompleteFetcher;
	/**
	 * Resolves selected value(s) to options when they aren't in the current page (e.g. on
	 * mount with a pre-populated `modelValue`). Required when `fetch` is set and
	 * `modelValue` may start populated.
	 */
	resolve?: AutocompleteResolver;
	/** First page size in fetch mode. Defaults to 30. */
	pageSize?: number;
	/** Debounce for the `search → fetch(query, 1)` pipeline. Defaults to 250 ms. */
	debounceMs?: number;
	/**
	 * Multi-select chip threshold. When more items are selected than this, the surplus
	 * collapse into a "+N" pill. Defaults to 1 — safe for unbounded label widths
	 * (employee names, etc.). Bump to 2–3 only when the consumer knows the labels are
	 * short.
	 */
	maxVisibleChips?: number;
	/** Placeholder text for the input. */
	placeholder?: string;
	/** Disabled state. */
	disabled?: boolean;
	/** Force a loading spinner instead of items (overrides internal loading). */
	loading?: boolean;
	/** Text shown when no options match. */
	emptyText?: string;
	/** Show a clear button when there is a value. Default true. */
	clearable?: boolean;
	/** Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px (matches Input). */
	size?: AutocompleteSize;
	/** Sets `aria-invalid="true"` on the anchor and tints the border destructive. */
	error?: boolean;
	/** id of the element(s) describing the input — error or hint text. */
	describedBy?: string;
	/** Element id matching the `for` of an associated <Label>. */
	id?: string;
	/** Optional aria-label for the input when no visible label is paired. */
	ariaLabel?: string;
	/** Accessible name for the clear button. */
	clearLabel?: string;
	/** Accessible name for the dropdown trigger button. */
	triggerLabel?: string;
	/** Extra wrapper classes. */
	class?: string;
}

const props = withDefaults(defineProps<AutocompleteProps>(), {
	multiple: false,
	options: () => [],
	pageSize: 30,
	debounceMs: 250,
	maxVisibleChips: 1,
	placeholder: 'Type or select an option...',
	disabled: false,
	loading: false,
	emptyText: 'No results found.',
	clearable: true,
	size: 'default',
	error: false,
	clearLabel: 'Clear',
	triggerLabel: 'Open options',
});

const emit = defineEmits<{
	/** Emits the selected value (single) or values (multi). */
	'update:modelValue': [value: string | string[] | null];
	/** Fires on every keystroke — for callers using client-side filtering. Server-fetch mode handles its own pipeline. */
	search: [value: string];
	/** Fires when an option is selected, providing the full option object. */
	select: [option: AutocompleteOption];
}>();

// ── Class wiring ──────────────────────────────────────────────────────────
const rootClass = computed(() => cn(autocompleteVariants(), props.class));
const anchorClass = computed(() => cn(autocompleteAnchorVariants({ size: props.size })));
const contentClass = computed(() => cn(autocompleteContentVariants()));
const viewportClass = computed(() => cn(autocompleteViewportVariants()));
const itemClass = computed(() => cn(autocompleteItemVariants()));
const emptyClass = computed(() => cn(autocompleteEmptyVariants()));
const loadingClass = computed(() => cn(autocompleteLoadingVariants()));
const labelClass = computed(() => cn(autocompleteLabelVariants()));
const separatorClass = computed(() => cn(autocompleteSeparatorVariants()));

// ── Server-fetch state ────────────────────────────────────────────────────
const fetchedOptions = ref<AutocompleteOption[]>([]);
const fetchedPage = ref(1);
const hasMore = ref(false);
const isLoading = ref(false);
const inFlightController = ref<AbortController | null>(null);
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

/**
 * Label cache. Populated by:
 *  - the active fetch page
 *  - the `resolve` callback for selected values not in the current page
 *  - client-side options (when not using fetch).
 *
 * Used by `displayValue` and chip rendering.
 */
const labelCache = ref(new Map<string, AutocompleteOption>());

function cacheOption(opt: AutocompleteOption) {
	labelCache.value.set(opt.value, opt);
}

function cacheOptions(opts: AutocompleteOption[]) {
	for (const o of opts) cacheOption(o);
}

// Seed from client-side props so chip labels work without a `resolve` callback.
watch(
	() => [props.options, props.groups],
	() => {
		if (!props.fetch) {
			cacheOptions(props.options);
			if (props.groups) {
				for (const g of props.groups) cacheOptions(g.options);
			}
		}
	},
	{ immediate: true, deep: true },
);

// Resolve unknown selected IDs once on mount and whenever modelValue changes to an
// unseen ID (single mode) or includes unseen IDs (multi mode).
watch(
	() => props.modelValue,
	async (val) => {
		if (!props.fetch || !props.resolve) return;
		const ids = normaliseIds(val).filter((id) => !labelCache.value.has(id));
		if (ids.length === 0) return;
		try {
			const resolved = await props.resolve(ids);
			cacheOptions(resolved);
		} catch {
			/* swallow — caller will surface via toast / error state */
		}
	},
	{ immediate: true },
);

function normaliseIds(val: string | string[] | null | undefined): string[] {
	if (val === null || val === undefined) return [];
	if (Array.isArray(val)) return val;
	return val ? [val] : [];
}

// ── Reka model bridge ────────────────────────────────────────────────────
// Reka's ComboboxRoot expects:
//   - single: a string | undefined
//   - multi:  an array of values
// Our prop is `string | string[] | null`. Map both ways.
const rekaModelValue = computed(() => {
	if (props.multiple) return Array.isArray(props.modelValue) ? props.modelValue : [];
	return typeof props.modelValue === 'string' ? props.modelValue : '';
});

const hasValue = computed(() => {
	if (props.multiple) return Array.isArray(props.modelValue) && props.modelValue.length > 0;
	return !!props.modelValue;
});

function handleRootUpdate(val: unknown) {
	if (props.multiple) {
		const arr = Array.isArray(val) ? (val as string[]) : [];
		emit('update:modelValue', arr);
		// Fire `select` for the most-recently-added value (best-effort signal for consumers).
		const prev = Array.isArray(props.modelValue) ? props.modelValue : [];
		const added = arr.find((v) => !prev.includes(v));
		if (added && labelCache.value.has(added)) {
			emit('select', labelCache.value.get(added)!);
		}
	} else {
		const value = typeof val === 'string' ? val : null;
		emit('update:modelValue', value);
		if (value && labelCache.value.has(value)) {
			emit('select', labelCache.value.get(value)!);
		}
	}
}

// ── Input value (typed text) ─────────────────────────────────────────────
const inputValue = ref('');

const displayValue = (val: unknown) => {
	if (props.multiple) return '';
	if (typeof val !== 'string' || !val) return '';
	return labelCache.value.get(val)?.label ?? '';
};

const effectivePlaceholder = computed(() => {
	if (props.multiple && hasValue.value) return '';
	return props.placeholder;
});

function handleInput(event: Event) {
	const text = (event.target as HTMLInputElement).value;
	inputValue.value = text;
	emit('search', text);
	if (props.fetch) scheduleFetch(text);
}

// ── Server fetch pipeline ────────────────────────────────────────────────
function scheduleFetch(query: string) {
	if (debounceTimer) clearTimeout(debounceTimer);
	debounceTimer = setTimeout(() => void runFetch(query, 1), props.debounceMs);
}

async function runFetch(query: string, page: number) {
	if (!props.fetch) return;
	if (inFlightController.value) inFlightController.value.abort();
	const controller = new AbortController();
	inFlightController.value = controller;
	isLoading.value = true;
	try {
		const result = await props.fetch(query, page, controller.signal);
		if (controller.signal.aborted) return;
		if (page === 1) {
			fetchedOptions.value = result.items;
		} else {
			fetchedOptions.value = [...fetchedOptions.value, ...result.items];
		}
		fetchedPage.value = page;
		hasMore.value = result.hasMore;
		cacheOptions(result.items);
	} catch (e) {
		if ((e as DOMException)?.name === 'AbortError') return;
		// Other errors: stop loading; consumer surfaces via toast.
	} finally {
		if (inFlightController.value === controller) {
			inFlightController.value = null;
			isLoading.value = false;
		}
	}
}

const sentinelRef = ref<HTMLElement | null>(null);
const viewportRef = ref<HTMLElement | null>(null);

// Infinite scroll: a scroll listener on the viewport is simpler and more reliable than
// IntersectionObserver inside a Reka popover (which detaches/reattaches as it animates).
function onViewportScroll() {
	if (!props.fetch || !hasMore.value || isLoading.value) return;
	const el = viewportRef.value;
	if (!el) return;
	if (el.scrollTop + el.clientHeight >= el.scrollHeight - 24) {
		void runFetch(inputValue.value, fetchedPage.value + 1);
	}
}

const open = ref(false);

function handleOpenChange(next: boolean) {
	open.value = next;
	if (next && props.fetch && fetchedOptions.value.length === 0) {
		// Lazy first page on first open.
		void runFetch('', 1);
	}
	if (!next) {
		if (inFlightController.value) {
			inFlightController.value.abort();
			inFlightController.value = null;
		}
		if (debounceTimer) {
			clearTimeout(debounceTimer);
			debounceTimer = null;
		}
	}
}

// Focusing the input opens the panel — autocomplete is meant to surface options
// the moment the user engages, not require a second click on the chevron.
function onInputFocus() {
	if (props.disabled) return;
	open.value = true;
}

onBeforeUnmount(() => {
	if (inFlightController.value) inFlightController.value.abort();
	if (debounceTimer) clearTimeout(debounceTimer);
});

// ── Visible options ──────────────────────────────────────────────────────
const flatOptions = computed<AutocompleteOption[]>(() => {
	if (props.fetch) return fetchedOptions.value;
	return props.options;
});

const totalItems = computed(() => flatOptions.value.length);

const visibleGroups = computed(() => {
	if (!props.groups) return [];
	const query = inputValue.value.toLowerCase();
	if (!query) return props.groups;
	return props.groups
		.map((group) => ({
			...group,
			options: group.options.filter((opt) => opt.label.toLowerCase().includes(query)),
		}))
		.filter((group) => group.options.length > 0);
});

// ── Multi mode chip rendering ────────────────────────────────────────────
const selectedOptions = computed<AutocompleteOption[]>(() => {
	if (!props.multiple) return [];
	const ids = Array.isArray(props.modelValue) ? props.modelValue : [];
	return ids.map((id) => labelCache.value.get(id) ?? { value: id, label: id });
});

const visibleChips = computed(() => selectedOptions.value.slice(0, props.maxVisibleChips));

const overflowCount = computed(() =>
	Math.max(0, selectedOptions.value.length - props.maxVisibleChips),
);

function removeChip(value: string) {
	const next = (Array.isArray(props.modelValue) ? props.modelValue : []).filter(
		(id) => id !== value,
	);
	emit('update:modelValue', next);
}

function onBackspace(event: KeyboardEvent) {
	if (!props.multiple) return;
	const target = event.target as HTMLInputElement;
	if (target.value !== '') return;
	const arr = Array.isArray(props.modelValue) ? props.modelValue : [];
	if (arr.length === 0) return;
	emit('update:modelValue', arr.slice(0, -1));
}

// ── Clear ────────────────────────────────────────────────────────────────
function handleClear() {
	emit('update:modelValue', props.multiple ? [] : null);
	// Clear typed text too.
	inputValue.value = '';
	nextTick(() => {
		if (props.fetch) {
			void runFetch('', 1);
		}
	});
}

// Re-export for tests / consumers that need to peek inside.
defineExpose({
	fetchedOptions,
	hasMore,
	labelCache,
	reload: () => void runFetch(inputValue.value, 1),
});
</script>
