import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import MonthPicker from './MonthPicker.vue';
import Label from '../../form/label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Dates/MonthPicker',
	component: MonthPicker,
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
		disabled: false,
		error: false,
		placeholder: 'Pick a month',
		'onUpdate:modelValue': fn(),
		'onUpdate:open': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Composite month picker — button trigger that opens a popover with a 4×3 grid of months. Built on Reka UI primitives.',
			},
		},
	},
	render: (args) => ({
		components: { MonthPicker },
		setup() {
			const value = ref<ForgeDate | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <MonthPicker v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">Value: {{ value?.toISODate() ?? 'None' }}</p>
      </div>
    `,
	}),
} satisfies Meta<typeof MonthPicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	render: (args) => ({
		components: { MonthPicker },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-4">
        <MonthPicker v-bind="args" variant="button" />
        <MonthPicker v-bind="args" variant="inline" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: (args) => ({
		components: { MonthPicker },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-3">
        <MonthPicker v-bind="args" size="sm" />
        <MonthPicker v-bind="args" size="default" />
        <MonthPicker v-bind="args" size="lg" />
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
	args: { error: true, describedBy: 'month-picker-error' },
	render: (args) => ({
		components: { MonthPicker, Label },
		setup() {
			const value = ref<ForgeDate | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label>Reporting month</Label>
        <MonthPicker v-bind="args" v-model="value" />
        <p id="month-picker-error" class="text-xs text-destructive">Please pick a month.</p>
      </div>
    `,
	}),
};

export const WithMinMax: Story = {
	name: 'With Min / Max',
	render: (args) => ({
		components: { MonthPicker },
		setup() {
			const value = ref<ForgeDate | null>(null);
			const min = ForgeDate.now().minus({ months: 6 });
			const max = ForgeDate.now().plus({ months: 6 });
			return { args, value, min, max };
		},
		template: `<MonthPicker v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpenOnTriggerClick: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="month-picker-trigger"]',
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
			'[data-slot="month-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cell = document.body.querySelector(
			'[data-slot="month-picker-cell-trigger"]:not([data-disabled])',
		) as HTMLElement;
		await expect(cell).toBeTruthy();
		await userEvent.click(cell);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveOutsideClickCloses: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="month-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		await userEvent.click(document.body);
		await new Promise((r) => setTimeout(r, 120));
		const open = document.body.querySelector(
			'[data-slot="month-picker-content"][data-state="open"]',
		);
		await expect(open).toBeFalsy();
	},
};

export const InteractiveDisabledDoesNotOpen: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="month-picker-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeDisabled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="month-picker-trigger"]',
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
			'[data-slot="month-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cells = document.body.querySelectorAll<HTMLElement>(
			'[data-slot="month-picker-cell-trigger"]',
		);
		await expect(cells.length).toBeGreaterThan(0);
		for (const c of Array.from(cells).slice(0, 6)) expectMinTargetSize(c, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { MonthPicker },
		template: `
      <div data-test-root class="p-2">
        <MonthPicker />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector('[data-slot="month-picker-trigger"]') as HTMLElement;
			const r = trigger.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
