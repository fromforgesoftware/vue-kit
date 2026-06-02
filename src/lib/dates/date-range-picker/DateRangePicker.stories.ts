import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import DateRangePicker from './DateRangePicker.vue';
import Label from '../../form/label/Label.vue';
import { defaultDateRangePresets } from './date-range-picker';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Dates/DateRangePicker',
	component: DateRangePicker,
	// Curated About.mdx — disable autodocs.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['field', 'button'],
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
		},
		granularity: {
			control: 'select',
			options: ['day', 'hour', 'minute', 'second'],
		},
		numberOfMonths: { control: 'number' },
		monthYearSelect: { control: 'boolean' },
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		error: { control: 'boolean' },
		describedBy: { control: 'text' },
		placeholder: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		variant: 'button',
		size: 'default',
		granularity: 'day',
		numberOfMonths: 2,
		monthYearSelect: false,
		disabled: false,
		readonly: false,
		error: false,
		placeholder: 'Pick a date range',
		'onUpdate:modelValue': fn(),
		'onUpdate:open': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Composite range picker — segmented start/end field or button trigger with a popover dual-month Calendar. Built on Reka UI primitives.',
			},
		},
	},
	render: (args) => ({
		components: { DateRangePicker },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <DateRangePicker v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">
          Start: {{ value?.start?.toISODate() ?? 'None' }} / End: {{ value?.end?.toISODate() ?? 'None' }}
        </p>
      </div>
    `,
	}),
} satisfies Meta<typeof DateRangePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	render: (args) => ({
		components: { DateRangePicker },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-4">
        <DateRangePicker v-bind="args" variant="field" />
        <DateRangePicker v-bind="args" variant="button" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	render: (args) => ({
		components: { DateRangePicker },
		setup: () => ({ args }),
		template: `
      <div class="grid w-full max-w-96 gap-3">
        <DateRangePicker v-bind="args" size="sm" />
        <DateRangePicker v-bind="args" size="default" />
        <DateRangePicker v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const FieldVariant: Story = {
	name: 'Field Variant',
	args: { variant: 'field' },
	render: (args) => ({
		components: { DateRangePicker },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>({
				start: ForgeDate.now().startOf('week'),
				end: ForgeDate.now().endOf('week'),
			});
			return { args, value };
		},
		template: `<DateRangePicker v-bind="args" v-model="value" />`,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const WithError: Story = {
	args: { error: true, describedBy: 'date-range-error' },
	render: (args) => ({
		components: { DateRangePicker, Label },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid w-full max-w-96 gap-2">
        <Label>Reporting period</Label>
        <DateRangePicker v-bind="args" v-model="value" />
        <p id="date-range-error" class="text-xs text-destructive">Please pick a valid range.</p>
      </div>
    `,
	}),
};

export const WithMinMax: Story = {
	name: 'With Min / Max',
	render: (args) => ({
		components: { DateRangePicker },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			const min = ForgeDate.now().minus({ days: 30 });
			const max = ForgeDate.now().plus({ days: 30 });
			return { args, value, min, max };
		},
		template: `<DateRangePicker v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

export const WithMonthYearSelect: Story = {
	name: 'With Month / Year Select',
	args: { monthYearSelect: true },
};

export const WithPresets: Story = {
	name: 'With Presets',
	render: (args) => ({
		components: { DateRangePicker },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value, presets: defaultDateRangePresets };
		},
		template: `<DateRangePicker v-bind="args" v-model="value" :presets="presets" />`,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpenOnTriggerClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button' },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="date-range-picker-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);
		const content = await inBody().findByRole('dialog');
		await expect(content).toBeInTheDocument();
	},
};

export const InteractiveSelectEmitsModel: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button' },
	play: async ({ args, canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="date-range-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cells = document.body.querySelectorAll<HTMLElement>(
			'[data-slot="date-range-picker-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		);
		await expect(cells.length).toBeGreaterThan(2);
		await userEvent.click(cells[2]);
		await userEvent.click(cells[5]);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveOutsideClickCloses: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button' },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="date-range-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		await userEvent.click(document.body);
		await new Promise((r) => setTimeout(r, 120));
		const open = document.body.querySelector(
			'[data-slot="date-range-picker-content"][data-state="open"]',
		);
		await expect(open).toBeFalsy();
	},
};

export const InteractiveDisabledDoesNotOpen: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button', disabled: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="date-range-picker-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeDisabled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	// Field variant exposes aria-invalid on the field wrapper; pin the variant so
	// the test doesn't break when the global default flips.
	args: { variant: 'field', error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const field = canvasElement.querySelector(
			'[data-slot="date-range-picker-field"]',
		) as HTMLElement;
		await expect(field).toHaveAttribute('aria-invalid', 'true');
		await expect(field).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveCellTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button' },
	parameters: {
		globals: { viewport: { value: 'tablet' } },
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="date-range-picker-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cells = document.body.querySelectorAll<HTMLElement>(
			'[data-slot="date-range-picker-cell-trigger"]:not([data-outside-view])',
		);
		await expect(cells.length).toBeGreaterThan(0);
		for (const c of Array.from(cells).slice(0, 6)) expectMinTargetSize(c, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DateRangePicker },
		template: `
      <div data-test-root class="p-2">
        <DateRangePicker variant="field" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const field = root.querySelector('[data-slot="date-range-picker-field"]') as HTMLElement;
			const r = field.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
