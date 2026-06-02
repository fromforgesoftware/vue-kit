import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import YearRangePicker from './YearRangePicker.vue';
import Label from '../../form/label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Dates/YearRangePicker',
	component: YearRangePicker,
	// Curated About.mdx — disable autodocs.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['button', 'inline'],
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
		},
		yearsPerPage: { control: 'number' },
		disabled: { control: 'boolean' },
		error: { control: 'boolean' },
		describedBy: { control: 'text' },
		placeholder: { control: 'text' },
		label: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		variant: 'button',
		size: 'default',
		yearsPerPage: 12,
		disabled: false,
		error: false,
		placeholder: 'Pick a year range',
		'onUpdate:modelValue': fn(),
		'onUpdate:open': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Composite year-range picker — button trigger that opens a popover with a paged grid of years. Built on Reka UI primitives.',
			},
		},
	},
	render: (args) => ({
		components: { YearRangePicker },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <YearRangePicker v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">
          Start: {{ value?.start?.toISODate() ?? 'None' }} / End: {{ value?.end?.toISODate() ?? 'None' }}
        </p>
      </div>
    `,
	}),
} satisfies Meta<typeof YearRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	render: (args) => ({
		components: { YearRangePicker },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-4">
        <YearRangePicker v-bind="args" variant="button" />
        <YearRangePicker v-bind="args" variant="inline" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: (args) => ({
		components: { YearRangePicker },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-3">
        <YearRangePicker v-bind="args" size="sm" />
        <YearRangePicker v-bind="args" size="default" />
        <YearRangePicker v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const Inline: Story = {
	args: { variant: 'inline' },
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const WithError: Story = {
	args: { error: true, describedBy: 'year-range-error' },
	render: (args) => ({
		components: { YearRangePicker, Label },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label>Reporting period</Label>
        <YearRangePicker v-bind="args" v-model="value" />
        <p id="year-range-error" class="text-xs text-destructive">Please pick a range.</p>
      </div>
    `,
	}),
};

export const WithMinMax: Story = {
	name: 'With Min / Max',
	render: (args) => ({
		components: { YearRangePicker },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			const min = ForgeDate.now().minus({ years: 10 });
			const max = ForgeDate.now().plus({ years: 10 });
			return { args, value, min, max };
		},
		template: `<YearRangePicker v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

export const CustomPageSize: Story = {
	name: 'Custom Page Size',
	args: { yearsPerPage: 20 },
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpenOnTriggerClick: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="year-range-picker-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);
		const content = await inBody().findByRole('dialog');
		await expect(content).toBeInTheDocument();
	},
};

export const InteractiveSelectEmitsModel: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="year-range-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cells = document.body.querySelectorAll<HTMLElement>(
			'[data-slot="year-range-picker-cell-trigger"]:not([data-disabled])',
		);
		await expect(cells.length).toBeGreaterThan(2);
		await userEvent.click(cells[1]);
		await userEvent.click(cells[4]);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveOutsideClickCloses: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="year-range-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		await userEvent.click(document.body);
		await new Promise((r) => setTimeout(r, 120));
		const open = document.body.querySelector(
			'[data-slot="year-range-picker-content"][data-state="open"]',
		);
		await expect(open).toBeFalsy();
	},
};

export const InteractiveDisabledDoesNotOpen: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="year-range-picker-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeDisabled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="year-range-picker-trigger"]',
		) as HTMLElement;
		await expect(trigger).toHaveAttribute('aria-invalid', 'true');
		await expect(trigger).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveCellTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		globals: { viewport: { value: 'tablet' } },
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="year-range-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cells = document.body.querySelectorAll<HTMLElement>(
			'[data-slot="year-range-picker-cell-trigger"]',
		);
		await expect(cells.length).toBeGreaterThan(0);
		for (const c of Array.from(cells).slice(0, 6)) expectMinTargetSize(c, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { YearRangePicker },
		template: `
      <div data-test-root class="p-2">
        <YearRangePicker />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector('[data-slot="year-range-picker-trigger"]') as HTMLElement;
			const r = trigger.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
