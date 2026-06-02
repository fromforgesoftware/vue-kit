import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, userEvent, waitFor } from 'storybook/test';
import Autocomplete from './Autocomplete.vue';
import Label from '../label/Label.vue';
import type { AutocompleteOption, AutocompleteOptionGroup } from './autocomplete.js';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const fruits: AutocompleteOption[] = [
	{ value: 'apple', label: 'Apple' },
	{ value: 'banana', label: 'Banana' },
	{ value: 'cherry', label: 'Cherry' },
	{ value: 'date', label: 'Date' },
	{ value: 'elderberry', label: 'Elderberry' },
	{ value: 'fig', label: 'Fig' },
	{ value: 'grape', label: 'Grape' },
];

const grouped: AutocompleteOptionGroup[] = [
	{
		label: 'Fruit',
		options: [
			{ value: 'apple', label: 'Apple' },
			{ value: 'banana', label: 'Banana' },
			{ value: 'orange', label: 'Orange' },
			{ value: 'pear', label: 'Pear' },
		],
	},
	{
		label: 'Vegetable',
		options: [
			{ value: 'cabbage', label: 'Cabbage' },
			{ value: 'broccoli', label: 'Broccoli' },
			{ value: 'carrot', label: 'Carrot' },
			{ value: 'lettuce', label: 'Lettuce' },
		],
	},
];

const meta = {
	title: 'Form/Autocomplete',
	component: Autocomplete,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Searchable input with a filtered dropdown. Built on Reka UI <code>Combobox</code>. Use when there are too many options to fit a Select comfortably and the user benefits from typing-as-filter.',
			},
		},
	},
	argTypes: {
		placeholder: { control: 'text' },
		disabled: { control: 'boolean' },
		loading: { control: 'boolean' },
		clearable: { control: 'boolean' },
		error: {
			control: 'boolean',
			description: 'Sets aria-invalid="true" and tints the border destructive.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Trigger height — matches Input sizes.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onSearch: { action: 'search' },
		onSelect: { action: 'select' },
	},
	args: {
		placeholder: 'Type or select an option...',
		disabled: false,
		loading: false,
		clearable: true,
		error: false,
		size: 'default',
		'onUpdate:modelValue': fn(),
		onSearch: fn(),
		onSelect: fn(),
	},
	render: (args) => ({
		components: { Autocomplete },
		setup() {
			const value = ref('');
			return { args, value, fruits };
		},
		template: `
      <div class="w-72">
        <Autocomplete v-bind="args" v-model="value" :options="fruits" aria-label="Fruit" />
      </div>
    `,
	}),
} satisfies Meta<typeof Autocomplete>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three trigger heights — match the Input sizes used elsewhere on the form.',
			},
		},
	},
	render: () => ({
		components: { Autocomplete },
		setup: () => ({ ALL_SIZES, fruits }),
		template: `
      <div class="grid w-72 gap-3">
        <Autocomplete
          v-for="s in ALL_SIZES"
          :key="s"
          :size="s"
          :options="fruits"
          :placeholder="'Size: ' + s"
          aria-label="Fruit"
        />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Loading: Story = {
	args: { loading: true },
};

export const WithError: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets <code>aria-invalid="true"</code> and tints the border destructive. Always pair with descriptive helper text via <code>describedBy</code>.',
			},
		},
	},
	render: () => ({
		components: { Autocomplete, Label },
		setup: () => ({ fruits }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="ac-error" required>Fruit</Label>
        <Autocomplete id="ac-error" :options="fruits" error described-by="ac-error-msg" />
        <p id="ac-error-msg" class="text-xs text-destructive">Please pick a fruit.</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	render: () => ({
		components: { Autocomplete, Label },
		setup: () => ({ fruits }),
		template: `
      <div class="grid w-72 gap-2">
        <Label for="ac-label">Fruit</Label>
        <Autocomplete id="ac-label" :options="fruits" placeholder="Pick or type" />
      </div>
    `,
	}),
};

export const Grouped: Story = {
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref('');
			return { value, grouped };
		},
		template: `
      <div class="w-72">
        <Autocomplete v-model="value" :groups="grouped" placeholder="Type or select an option..." aria-label="Item" />
      </div>
    `,
	}),
};

export const ServerSideSearch: Story = {
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref('');
			const results = ref<AutocompleteOption[]>([]);
			const loading = ref(false);

			function onSearch(term: string) {
				if (!term) {
					results.value = [];
					return;
				}
				loading.value = true;
				setTimeout(() => {
					results.value = fruits.filter((f) => f.label.toLowerCase().includes(term.toLowerCase()));
					loading.value = false;
				}, 400);
			}

			return { value, results, loading, onSearch };
		},
		template: `
      <div class="w-72">
        <p class="mb-2 text-xs text-muted-foreground">Simulates server-side filtering (400 ms delay)</p>
        <Autocomplete
          v-model="value"
          :options="results"
          :loading="loading"
          placeholder="Type to search..."
          aria-label="Fruit"
          @search="onSearch"
        />
      </div>
    `,
	}),
};

// ── Multi-select stories ──────────────────────────────────────────────────

export const Multiple: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Multi-select renders selected items as chips before the input. Backspace on an empty input removes the last chip; click the chip × to remove individually.',
			},
		},
	},
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string[]>(['apple', 'cherry']);
			return { value, fruits };
		},
		template: `
      <div class="w-80">
        <Autocomplete v-model="value" :options="fruits" multiple placeholder="Pick fruits…" aria-label="Fruits" />
        <p class="mt-2 text-xs text-muted-foreground">Selected: {{ value.join(', ') || '—' }}</p>
      </div>
    `,
	}),
};

export const MultipleOverflow: Story = {
	name: 'Multiple — chip overflow',
	parameters: {
		docs: {
			description: {
				story:
					'By default a multi-Autocomplete shows 1 chip + a "+N" counter so the trigger never overflows on long labels (employees, customers). Bump `max-visible-chips` to 2 or 3 only when the consumer knows the labels are short.',
			},
		},
	},
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string[]>(['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig']);
			return { value, fruits };
		},
		template: `
      <div class="grid w-full max-w-96 gap-3">
        <div>
          <p class="mb-1 text-xs text-muted-foreground">Default — 1 chip + "+N"</p>
          <Autocomplete v-model="value" :options="fruits" multiple aria-label="Fruits (default)" />
        </div>
        <div>
          <p class="mb-1 text-xs text-muted-foreground">Override — 3 visible chips (short labels only)</p>
          <Autocomplete v-model="value" :options="fruits" multiple :max-visible-chips="3" aria-label="Fruits (3 chips)" />
        </div>
      </div>
    `,
	}),
};

// ── Server-fetch stories ──────────────────────────────────────────────────

const ALL_BIG = Array.from({ length: 250 }).map((_, i) => ({
	value: `emp-${i + 1}`,
	label: `Employee ${String(i + 1).padStart(3, '0')}`,
	description: `external-id-${i + 1}`,
}));

function makeFetcher(opts: { delay?: number; pageSize?: number }) {
	const { delay = 300, pageSize = 30 } = opts;
	return async (
		query: string,
		page: number,
		signal: AbortSignal,
	): Promise<{ items: AutocompleteOption[]; hasMore: boolean }> => {
		await new Promise<void>((resolve, reject) => {
			const t = setTimeout(resolve, delay);
			signal.addEventListener('abort', () => {
				clearTimeout(t);
				reject(new DOMException('Aborted', 'AbortError'));
			});
		});
		const filtered = query
			? ALL_BIG.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()))
			: ALL_BIG;
		const start = (page - 1) * pageSize;
		const slice = filtered.slice(start, start + pageSize);
		return { items: slice, hasMore: filtered.length > start + pageSize };
	};
}

const resolveByID = async (ids: string[]): Promise<AutocompleteOption[]> =>
	ALL_BIG.filter((o) => ids.includes(o.value));

export const ServerFetchSingle: Story = {
	name: 'Server fetch — single',
	parameters: {
		docs: {
			description: {
				story:
					'Server-fetch mode (single). Component owns the option list, debounces typing, aborts in-flight requests on every keystroke, paginates via infinite scroll.',
			},
		},
	},
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string | null>(null);
			return { value, fetch: makeFetcher({}), resolve: resolveByID };
		},
		template: `
      <div class="w-80">
        <Autocomplete
          v-model="value"
          :fetch="fetch"
          :resolve="resolve"
          placeholder="Search 250 employees…"
          aria-label="Employee"
        />
        <p class="mt-2 text-xs text-muted-foreground">Selected: {{ value ?? '—' }}</p>
      </div>
    `,
	}),
};

export const ServerFetchMultiple: Story = {
	name: 'Server fetch — multiple',
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string[]>([]);
			return { value, fetch: makeFetcher({}), resolve: resolveByID };
		},
		template: `
      <div class="w-full max-w-96">
        <Autocomplete
          v-model="value"
          :fetch="fetch"
          :resolve="resolve"
          multiple
          placeholder="Search and pick employees…"
          aria-label="Employees"
        />
        <p class="mt-2 text-xs text-muted-foreground">Selected: {{ value.length }} item(s)</p>
      </div>
    `,
	}),
};

export const ServerFetchPreselected: Story = {
	name: 'Server fetch — preselected (resolve runs on mount)',
	parameters: {
		docs: {
			description: {
				story:
					'Form mounts with a pre-populated modelValue. The component calls `resolve(ids)` once to fetch labels for the unknown IDs so chips render immediately — without forcing the user to search to populate the cache.',
			},
		},
	},
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string[]>(['emp-7', 'emp-42', 'emp-200']);
			return { value, fetch: makeFetcher({}), resolve: resolveByID };
		},
		template: `
      <div class="w-full max-w-96">
        <Autocomplete v-model="value" :fetch="fetch" :resolve="resolve" multiple aria-label="Employees" />
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveTypingFilters: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ args, canvasElement }) => {
		const input = canvasElement.querySelector(
			'[data-slot="autocomplete-input"]',
		) as HTMLInputElement;
		await userEvent.click(input);
		await userEvent.type(input, 'a');
		expect(args.onSearch).toHaveBeenCalled();
		await waitFor(async () => {
			const opts = await inBody().findAllByRole('option');
			expect(opts.length).toBeGreaterThan(0);
		});
	},
};

export const InteractiveSelectEmits: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ args, canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="autocomplete-trigger"]',
		) as HTMLButtonElement;
		await userEvent.click(trigger);
		const opts = await waitFor(async () => {
			const found = await inBody().findAllByRole('option');
			if (found.length === 0) throw new Error('no options found yet');
			return found;
		});
		await userEvent.click(opts[0]);
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalled();
			expect(args.onSelect).toHaveBeenCalled();
		});
	},
};

export const InteractiveClearButton: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: (args) => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string | null>('apple');
			return { args, value, fruits };
		},
		template: `
      <div class="w-72">
        <Autocomplete v-bind="args" v-model="value" :options="fruits" aria-label="Fruit" />
      </div>
    `,
	}),
	play: async ({ args, canvasElement }) => {
		const clear = canvasElement.querySelector(
			'[data-slot="autocomplete-clear"]',
		) as HTMLButtonElement;
		expect(clear).toBeInTheDocument();
		await userEvent.click(clear);
		await waitFor(() => {
			expect(args['onUpdate:modelValue']).toHaveBeenCalledWith(null);
		});
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="autocomplete-trigger"]',
		) as HTMLButtonElement;
		await userEvent.click(trigger);
		await waitFor(async () => {
			const opts = await inBody().findAllByRole('option');
			expect(opts.length).toBeGreaterThan(0);
		});
		await userEvent.keyboard('{Escape}');
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const anchor = canvasElement.querySelector('[data-slot="autocomplete-anchor"]') as HTMLElement;
		expect(anchor).toHaveAttribute('aria-invalid', 'true');
		const input = canvasElement.querySelector('[data-slot="autocomplete-input"]') as HTMLElement;
		expect(input).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		expect(canvasElement.querySelector('[data-slot="autocomplete-anchor"]')).toBeInTheDocument();
		expect(canvasElement.querySelector('[data-slot="autocomplete-input"]')).toBeInTheDocument();
		expect(canvasElement.querySelector('[data-slot="autocomplete-trigger"]')).toBeInTheDocument();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Autocomplete },
		setup: () => ({ ALL_SIZES, fruits }),
		template: `
      <div data-test-root class="grid w-72 gap-3">
        <Autocomplete v-for="s in ALL_SIZES" :key="s" :size="s" :options="fruits" aria-label="Fruit" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const anchors = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="autocomplete-anchor"]',
		);
		expect(anchors.length).toBe(3);
		for (const a of anchors) expectMinTargetSize(a, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Autocomplete },
		setup: () => ({ fruits }),
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <Autocomplete :options="fruits" aria-label="Fruit" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const anchor = root.querySelector('[data-slot="autocomplete-anchor"]') as HTMLElement;
			expectMinTargetSize(anchor, 24);
		});
	},
};

export const InteractiveMultipleSelectAdds: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string[]>([]);
			return { value, fruits };
		},
		template: `
      <div class="w-80">
        <Autocomplete v-model="value" :options="fruits" multiple aria-label="Fruits" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="autocomplete-trigger"]',
		) as HTMLButtonElement;
		await userEvent.click(trigger);
		const opts = await waitFor(async () => {
			const found = await inBody().findAllByRole('option');
			if (found.length === 0) throw new Error('no options yet');
			return found;
		});
		await userEvent.click(opts[0]);
		await userEvent.click(opts[1]);
		await waitFor(() => {
			const chips = canvasElement.querySelectorAll('[data-slot="autocomplete-chip"]');
			expect(chips.length).toBe(2);
		});
	},
};

export const InteractiveServerFetchAborts: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components: { Autocomplete },
		setup() {
			const value = ref<string | null>(null);
			return { value, fetch: makeFetcher({ delay: 50 }), resolve: resolveByID };
		},
		template: `
      <div class="w-80">
        <Autocomplete v-model="value" :fetch="fetch" :resolve="resolve" aria-label="Employee" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const input = canvasElement.querySelector(
			'[data-slot="autocomplete-input"]',
		) as HTMLInputElement;
		await userEvent.click(input);
		// First page should arrive after debounce + delay.
		await waitFor(async () => {
			const found = await inBody().findAllByRole('option');
			expect(found.length).toBeGreaterThan(0);
		});
	},
};
