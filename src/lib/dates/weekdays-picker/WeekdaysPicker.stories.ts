import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import WeekdaysPicker from './WeekdaysPicker.vue';
import type { WeekdayValue } from './weekdays-picker.js';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const ALL_SIZES = ['sm', 'default', 'lg'] as const;
const ALL_VARIANTS = ['default', 'outline'] as const;

const meta = {
	title: 'Dates/WeekdaysPicker',
	component: WeekdaysPicker,
	// Disable autodocs because this component has a curated `About.mdx`.
	tags: ['!autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Density. Tracks the form ramp — `sm` 28 px, `default` 36 px, `lg` 44 px.',
		},
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual style. `outline` keeps a border on unselected days.',
		},
		minSelection: {
			control: { type: 'number', min: 0, max: 7 },
			description:
				'Minimum days that must remain selected — prevents deselecting below this count.',
		},
		readonly: { control: 'boolean', description: 'Block edits but allow focus.' },
		disabled: { control: 'boolean', description: 'Disable every day button.' },
		error: {
			control: 'boolean',
			description: 'Apply destructive styling and `aria-invalid="true"`.',
		},
		label: { control: 'text', description: 'Accessible label for the fieldset.' },
		describedBy: { control: 'text', description: 'id of the error / hint message.' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		size: 'default',
		variant: 'default',
		minSelection: 0,
		readonly: false,
		disabled: false,
		error: false,
		label: 'Days of the week',
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Multi-select picker for days of the week. Renders 7 round day buttons in the user-preferred week-start order with roving focus and full keyboard navigation.',
			},
		},
	},
	render: (args) => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1, 2, 3, 4, 5]);
			return { args, selected };
		},
		template: `
      <WeekdaysPicker
        v-model="selected"
        v-bind="args"
        @update:modelValue="args['onUpdate:modelValue']"
      />
    `,
	}),
} satisfies Meta<typeof WeekdaysPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Empty: Story = {
	parameters: {
		docs: { description: { story: 'Empty initial state — useful when no default days apply.' } },
	},
	render: (args) => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([]);
			return { args, selected };
		},
		template: `<WeekdaysPicker v-model="selected" v-bind="args" />`,
	}),
};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`default` for filled chips; `outline` for bordered chips that read alongside outline buttons.',
			},
		},
	},
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1, 3, 5]);
			return { selected };
		},
		template: `
      <div class="space-y-4">
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">Default</span>
          <WeekdaysPicker v-model="selected" variant="default" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">Outline</span>
          <WeekdaysPicker v-model="selected" variant="outline" />
        </div>
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: { story: 'Three densities. All sizes meet WCAG 2.2 SC 2.5.8 (≥ 24×24).' },
		},
	},
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1, 2, 3, 4, 5]);
			return { selected };
		},
		template: `
      <div class="space-y-4">
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">Small</span>
          <WeekdaysPicker v-model="selected" size="sm" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">Default</span>
          <WeekdaysPicker v-model="selected" size="default" />
        </div>
        <div class="space-y-1">
          <span class="text-xs text-muted-foreground">Large</span>
          <WeekdaysPicker v-model="selected" size="lg" />
        </div>
      </div>
    `,
	}),
};

export const MinSelection: Story = {
	name: 'Min Selection (1)',
	args: { minSelection: 1 },
	parameters: {
		docs: {
			description: {
				story:
					"When `min-selection` is set, the user can't deselect below the floor — useful when an empty selection is invalid (e.g. working-day patterns).",
			},
		},
	},
	render: (args) => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1]);
			return { args, selected };
		},
		template: `
      <div class="space-y-2">
        <WeekdaysPicker v-model="selected" v-bind="args" />
        <p class="text-xs text-muted-foreground">Cannot deselect the last remaining day</p>
      </div>
    `,
	}),
};

export const Readonly: Story = {
	args: { readonly: true },
	parameters: {
		docs: {
			description: {
				story:
					'Read-only — visible state with no interaction. Use for table cells or summary rows.',
			},
		},
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'Disabled — buttons ignore input and lower opacity.' } },
	},
};

export const WithError: Story = {
	args: { error: true, describedBy: 'weekdays-error' },
	parameters: {
		docs: {
			description: {
				story:
					'`error` flips unselected days to a destructive border and exposes `aria-invalid="true"`. Pair with `describedBy` pointing to your message id.',
			},
		},
	},
	render: (args) => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([]);
			return { args, selected };
		},
		template: `
      <div class="space-y-2">
        <WeekdaysPicker v-model="selected" v-bind="args" />
        <p id="weekdays-error" class="text-xs text-destructive">Pick at least one day.</p>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveClickToggles: Story = {
	tags: ['!autodocs', 'test'],
	render: (args) => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([]);
			return { args, selected };
		},
		template: `<WeekdaysPicker v-model="selected" v-bind="args" />`,
	}),
	play: async ({ args, canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		expect(buttons.length).toBe(7);

		// Click Monday (first item)
		await userEvent.click(buttons[0]);
		expect(buttons[0]).toHaveAttribute('aria-checked', 'true');
		expect(buttons[0]).toHaveAttribute('data-state', 'on');

		// Click again to deselect
		await userEvent.click(buttons[0]);
		expect(buttons[0]).toHaveAttribute('aria-checked', 'false');
		expect(buttons[0]).toHaveAttribute('data-state', 'off');

		expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveSpaceToggles: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([]);
			return { selected };
		},
		template: `<WeekdaysPicker v-model="selected" />`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		buttons[0].focus();
		expect(buttons[0]).toHaveFocus();
		await userEvent.keyboard(' ');
		expect(buttons[0]).toHaveAttribute('aria-checked', 'true');
		await userEvent.keyboard('{Enter}');
		expect(buttons[0]).toHaveAttribute('aria-checked', 'false');
	},
};

export const InteractiveArrowKeyNavigation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([]);
			return { selected };
		},
		template: `<WeekdaysPicker v-model="selected" />`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		buttons[0].focus();
		expect(buttons[0]).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		expect(buttons[1]).toHaveFocus();
		await userEvent.keyboard('{ArrowRight}');
		expect(buttons[2]).toHaveFocus();
		await userEvent.keyboard('{ArrowLeft}');
		expect(buttons[1]).toHaveFocus();
		await userEvent.keyboard('{End}');
		expect(buttons[6]).toHaveFocus();
		await userEvent.keyboard('{Home}');
		expect(buttons[0]).toHaveFocus();
	},
};

export const InteractiveAriaPressed: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1, 3, 5]);
			return { selected };
		},
		template: `<WeekdaysPicker v-model="selected" />`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		// [1, 3, 5] → Monday (idx 0), Wednesday (idx 2), Friday (idx 4)
		expect(buttons[0]).toHaveAttribute('aria-checked', 'true');
		expect(buttons[1]).toHaveAttribute('aria-checked', 'false');
		expect(buttons[2]).toHaveAttribute('aria-checked', 'true');
		expect(buttons[4]).toHaveAttribute('aria-checked', 'true');
		expect(buttons[6]).toHaveAttribute('aria-checked', 'false');
	},
};

export const InteractiveMinSelection: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1]);
			return { selected };
		},
		template: `<WeekdaysPicker v-model="selected" :min-selection="1" />`,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		// Try to deselect the only selected day — should be blocked
		await userEvent.click(buttons[0]);
		expect(buttons[0]).toHaveAttribute('aria-checked', 'true');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLButtonElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		for (const b of buttons) {
			expect(b).toBeDisabled();
		}
		expect(args['onUpdate:modelValue']).not.toHaveBeenCalled();
	},
};

export const InteractiveErrorAria: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'weekdays-error' },
	render: (args) => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([]);
			return { args, selected };
		},
		template: `
      <div>
        <WeekdaysPicker v-model="selected" v-bind="args" />
        <p id="weekdays-error">Pick at least one day.</p>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const fieldset = canvasElement.querySelector(
			'[data-slot="weekdays-picker"]',
		) as HTMLFieldSetElement;
		expect(fieldset).toHaveAttribute('aria-invalid', 'true');
		expect(fieldset).toHaveAttribute('aria-describedby', 'weekdays-error');
		expect(fieldset).toHaveAttribute('data-error', 'true');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Every size meets WCAG 2.2 SC 2.5.8 (≥ 24×24 px) on each day button.' },
		},
	},
	render: () => ({
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1, 2, 3]);
			return { selected };
		},
		template: `
      <div data-test-root class="flex flex-col items-start gap-3 p-2">
        <WeekdaysPicker v-model="selected" size="sm" />
        <WeekdaysPicker v-model="selected" size="default" />
        <WeekdaysPicker v-model="selected" size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const buttons = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="weekdays-picker-day"]',
		);
		expect(buttons.length).toBe(21);
		for (const b of buttons) expectMinTargetSize(b, 24);
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
		components: { WeekdaysPicker },
		setup() {
			const selected = ref<WeekdayValue[]>([1, 2, 3, 4, 5]);
			return { selected };
		},
		template: `
      <div data-test-root class="p-2">
        <WeekdaysPicker v-model="selected" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const buttons = root.querySelectorAll<HTMLElement>('[data-slot="weekdays-picker-day"]');
			expect(buttons.length).toBe(7);
			for (const b of buttons) {
				const r = b.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThan(0);
			}
		});
	},
};
