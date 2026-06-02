import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, within, userEvent } from 'storybook/test';
import InputSearch from './InputSearch.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;

const meta = {
	title: 'Form/Input Search',
	component: InputSearch,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		placeholder: { control: 'text', description: 'Placeholder text.' },
		debounceTime: {
			control: 'number',
			description: 'Debounce delay in ms. `0` emits synchronously.',
		},
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density. `sm` = 28 px, `default` = 32 px, `lg` = 40 px.',
		},
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Visual style. Prefer the `error` boolean prop for validation errors.',
		},
		disabled: { control: 'boolean', description: 'Disabled state.' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` and applies error border.',
		},
		describedBy: { control: 'text', description: 'id of helper / error text.' },
		hideClear: { control: 'boolean', description: 'Hide the clear button.' },
		clearLabel: { control: 'text', description: 'Accessible name for the clear button.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onSearch: { action: 'search' },
		onClear: { action: 'clear' },
	},
	args: {
		placeholder: 'Search...',
		debounceTime: 0,
		size: 'default',
		variant: 'default',
		disabled: false,
		error: false,
		hideClear: false,
		clearLabel: 'Clear search',
		'onUpdate:modelValue': fn(),
		onSearch: fn(),
		onClear: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Search input with a leading magnifying glass and a clear button. Emits `update:modelValue` (debounce-friendly), `search` on Enter, and `clear` when cleared.',
			},
		},
	},
	render: (args) => ({
		components: { InputSearch, Label },
		setup() {
			const query = ref('');
			return { args, query };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="search-default">Search</Label>
        <InputSearch
          id="search-default"
          v-model="query"
          v-bind="args"
          @update:model-value="args['onUpdate:modelValue']"
          @search="args.onSearch"
          @clear="args.onClear"
        />
      </div>
    `,
	}),
} satisfies Meta<typeof InputSearch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three density tiers, mirroring Input.' } },
	},
	render: () => ({
		components: { InputSearch, Label },
		setup() {
			const a = ref('');
			const b = ref('');
			const c = ref('');
			return { a, b, c };
		},
		template: `
      <div class="grid w-72 gap-3">
        <div class="grid gap-1.5">
          <Label for="search-sizes-sm">Small</Label>
          <InputSearch id="search-sizes-sm" v-model="a" size="sm" placeholder="Small" />
        </div>
        <div class="grid gap-1.5">
          <Label for="search-sizes-default">Default</Label>
          <InputSearch id="search-sizes-default" v-model="b" size="default" placeholder="Default" />
        </div>
        <div class="grid gap-1.5">
          <Label for="search-sizes-lg">Large</Label>
          <InputSearch id="search-sizes-lg" v-model="c" size="lg" placeholder="Large" />
        </div>
      </div>
    `,
	}),
};

export const WithDebounce: Story = {
	args: { debounceTime: 500, placeholder: 'Search with debounce...' },
	parameters: {
		docs: {
			description: {
				story: 'Debounced emit. Useful for typeahead-driven API calls.',
			},
		},
	},
	render: (args) => ({
		components: { InputSearch, Label },
		setup() {
			const query = ref('');
			return { args, query };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="search-debounce">Search</Label>
        <InputSearch
          id="search-debounce"
          v-model="query"
          v-bind="args"
          @update:model-value="args['onUpdate:modelValue']"
        />
        <p class="text-xs text-muted-foreground">Debounced by {{ args.debounceTime }}ms</p>
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true, modelValue: 'fixed query' },
	parameters: {
		docs: { description: { story: 'Disabled state. Input and clear button are non-interactive.' } },
	},
	render: (args) => ({
		components: { InputSearch, Label },
		setup() {
			const query = ref('fixed query');
			return { args, query };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="search-disabled">Search</Label>
        <InputSearch id="search-disabled" v-model="query" v-bind="args" />
      </div>
    `,
	}),
};

export const WithError: Story = {
	args: { error: true },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid="true"` and tints the border. Pair with descriptive helper text via `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: { InputSearch, Label },
		setup() {
			const query = ref('');
			return { args, query };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="search-error-input">Search</Label>
        <InputSearch id="search-error-input" v-model="query" v-bind="args" described-by="search-error" />
        <p id="search-error" class="text-xs text-destructive">Search query is too short</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: { description: { story: 'Compose with `<Label>` for accessible names.' } },
	},
	render: () => ({
		components: { InputSearch, Label },
		setup() {
			const query = ref('');
			return { query };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label for="customer-search">Customers</Label>
        <InputSearch
          id="customer-search"
          v-model="query"
          placeholder="Search customers..."
        />
      </div>
    `,
	}),
};

export const HideClear: Story = {
	args: { hideClear: true, modelValue: 'persistent' },
	parameters: {
		docs: {
			description: {
				story:
					'Hide the clear button. Use when the input drives a filter that should never be cleared in a single click.',
			},
		},
	},
	render: (args) => ({
		components: { InputSearch, Label },
		setup() {
			const query = ref('persistent');
			return { args, query };
		},
		template: `
      <div class="grid w-72 gap-1.5">
        <Label for="search-hideclear">Search</Label>
        <InputSearch id="search-hideclear" v-model="query" v-bind="args" />
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveTypeEmits: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('searchbox');
		await userEvent.type(input, 'hello');
		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		const calls = (args['onUpdate:modelValue'] as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe('hello');
	},
};

export const InteractiveClearButton: Story = {
	tags: ['!autodocs', 'test'],
	args: { modelValue: 'existing' },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const clear = canvas.getByRole('button', { name: 'Clear search' });
		expect(clear).toBeInTheDocument();
		expectMinTargetSize(clear, 24);
		await userEvent.click(clear);
		expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('');
		expect(args.onClear).toHaveBeenCalled();
	},
};

export const InteractiveEnterTriggersSearch: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('searchbox');
		await userEvent.type(input, 'foo');
		await userEvent.keyboard('{Enter}');
		expect(args.onSearch).toHaveBeenCalled();
		const calls = (args.onSearch as ReturnType<typeof fn>).mock.calls;
		expect(calls[calls.length - 1][0]).toBe('foo');
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('searchbox');
		expect(input).toHaveAttribute('aria-invalid', 'true');
		expect(input).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDisabledBlocksInput: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true, modelValue: 'fixed' },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const input = canvas.getByRole('searchbox') as HTMLInputElement;
		expect(input).toBeDisabled();
		const clear = canvas.queryByRole('button', {
			name: 'Clear search',
		}) as HTMLButtonElement | null;
		if (clear) expect(clear).toBeDisabled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Wrapper and clear button meet WCAG 2.2 SC 2.5.8 (≥ 24×24 px).',
			},
		},
	},
	render: () => ({
		components: { InputSearch },
		setup() {
			const a = ref('text');
			const b = ref('text');
			const c = ref('text');
			return { a, b, c };
		},
		template: `
      <div data-test-root class="grid w-72 gap-3">
        <InputSearch v-model="a" size="sm" aria-label="Small search" />
        <InputSearch v-model="b" size="default" aria-label="Default search" />
        <InputSearch v-model="c" size="lg" aria-label="Large search" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const wrappers = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="input-search-wrapper"]',
		);
		expect(wrappers.length).toBe(3);
		for (const w of wrappers) expectMinTargetSize(w, 24);
		const clears = canvasElement.querySelectorAll<HTMLElement>('[data-slot="input-search-clear"]');
		expect(clears.length).toBe(3);
		for (const c of clears) expectMinTargetSize(c, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { InputSearch },
		setup() {
			const a = ref('');
			const b = ref('something');
			return { a, b };
		},
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <InputSearch v-model="a" placeholder="Empty" aria-label="Empty search" />
        <InputSearch v-model="b" placeholder="With clear" aria-label="Search with clear" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const inputs = root.querySelectorAll<HTMLInputElement>('input');
			expect(inputs.length).toBe(2);
			for (const i of inputs) {
				const r = i.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThanOrEqual(24);
			}
		});
	},
};
