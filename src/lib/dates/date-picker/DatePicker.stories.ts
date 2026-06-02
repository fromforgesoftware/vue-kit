import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import DatePicker from './DatePicker.vue';
import Label from '../../form/label/Label.vue';
import { defaultDatePickerPresets, defaultWeekPickerPresets } from './date-picker';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Dates/DatePicker',
	component: DatePicker,
	// Curated About.mdx — disable autodocs.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['field', 'button'],
			description: 'Trigger style — segmented `field` or single `button`.',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Density. Mirrors DateField — `sm` = 28 px, `default` = 32 px, `lg` = 40 px.',
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
		label: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		variant: 'field',
		size: 'default',
		granularity: 'day',
		numberOfMonths: 1,
		monthYearSelect: false,
		disabled: false,
		readonly: false,
		error: false,
		placeholder: 'Pick a date',
		'onUpdate:modelValue': fn(),
		'onUpdate:open': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Composite picker — segmented date field or button trigger paired with a popover Calendar. Built on Reka UI primitives.',
			},
		},
	},
	render: (args) => ({
		components: { DatePicker },
		setup() {
			const value = ref<ForgeDate | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <DatePicker v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">Value: {{ value?.toISODate() ?? 'None' }}</p>
      </div>
    `,
	}),
} satisfies Meta<typeof DatePicker>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: { story: 'Two trigger styles: segmented `field` (default) or single `button`.' },
		},
	},
	render: (args) => ({
		components: { DatePicker },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-4">
        <DatePicker v-bind="args" variant="field" />
        <DatePicker v-bind="args" variant="button" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three density tiers — heights mirror DateField and Input.' } },
	},
	render: (args) => ({
		components: { DatePicker },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-3">
        <DatePicker v-bind="args" size="sm" />
        <DatePicker v-bind="args" size="default" />
        <DatePicker v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const ButtonVariant: Story = {
	name: 'Button Variant',
	args: { variant: 'button' },
	render: (args) => ({
		components: { DatePicker },
		setup() {
			const value = ref<ForgeDate | null>(ForgeDate.now());
			return { args, value };
		},
		template: `<DatePicker v-bind="args" v-model="value" />`,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Readonly: Story = {
	args: { readonly: true },
	render: (args) => ({
		components: { DatePicker },
		setup() {
			const value = ref<ForgeDate | null>(ForgeDate.now());
			return { args, value };
		},
		template: `<DatePicker v-bind="args" v-model="value" />`,
	}),
};

export const WithError: Story = {
	args: { error: true, describedBy: 'date-picker-error' },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid="true"` and tints the field border. Pair with descriptive helper text via `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: { DatePicker, Label },
		setup() {
			const value = ref<ForgeDate | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label>Start date</Label>
        <DatePicker v-bind="args" v-model="value" />
        <p id="date-picker-error" class="text-xs text-destructive">Please choose a date.</p>
      </div>
    `,
	}),
};

export const WithMinMax: Story = {
	name: 'With Min / Max',
	parameters: {
		docs: {
			description: {
				story: 'Days outside the [min, max] window are styled disabled and reject clicks.',
			},
		},
	},
	render: (args) => ({
		components: { DatePicker },
		setup() {
			const value = ref<ForgeDate | null>(null);
			const min = ForgeDate.now().minus({ days: 7 });
			const max = ForgeDate.now().plus({ days: 30 });
			return { args, value, min, max };
		},
		template: `<DatePicker v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

export const WithMonthYearSelect: Story = {
	name: 'With Month / Year Select',
	args: { monthYearSelect: true },
	parameters: {
		docs: {
			description: {
				story:
					'Swap the heading text for two `<select>` controls — useful for picking dates far from today.',
			},
		},
	},
};

export const TwoMonths: Story = {
	args: { numberOfMonths: 2 },
};

export const WithDayPresets: Story = {
	name: 'With Day Presets',
	parameters: {
		docs: {
			description: {
				story:
					'Preset buttons render in a sidebar inside the popover. Active preset reflects the current selection.',
			},
		},
	},
	render: (args) => ({
		components: { DatePicker },
		setup() {
			const value = ref<ForgeDate | null>(ForgeDate.now());
			return { args, value, presets: defaultDatePickerPresets };
		},
		template: `<DatePicker v-bind="args" v-model="value" :presets="presets" />`,
	}),
};

export const WithWeekPresets: Story = {
	name: 'With Week Presets',
	render: (args) => ({
		components: { DatePicker },
		setup() {
			const value = ref<ForgeDate | null>(ForgeDate.now());
			return { args, value, presets: defaultWeekPickerPresets };
		},
		template: `<DatePicker v-bind="args" v-model="value" :presets="presets" />`,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpenOnTriggerClick: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button' },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="date-picker-trigger"]') as HTMLElement;
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
		const trigger = canvasElement.querySelector('[data-slot="date-picker-trigger"]') as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cell = document.body.querySelector(
			'[data-slot="date-picker-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		) as HTMLElement;
		await expect(cell).toBeTruthy();
		await userEvent.click(cell);
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
	},
};

export const InteractiveOutsideClickCloses: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button' },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="date-picker-trigger"]') as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		// Click outside the popover — Reka closes on outside pointer-down.
		await userEvent.click(document.body);
		await new Promise((r) => setTimeout(r, 120));
		const open = document.body.querySelector(
			'[data-slot="date-picker-content"][data-state="open"]',
		);
		await expect(open).toBeFalsy();
	},
};

export const InteractiveDisabledDoesNotOpen: Story = {
	tags: ['!autodocs', 'test'],
	args: { variant: 'button', disabled: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="date-picker-trigger"]') as HTMLElement;
		await expect(trigger).toBeDisabled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const field = canvasElement.querySelector('[data-slot="date-picker-field"]') as HTMLElement;
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
		const trigger = canvasElement.querySelector('[data-slot="date-picker-trigger"]') as HTMLElement;
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const cells = document.body.querySelectorAll<HTMLElement>(
			'[data-slot="date-picker-cell-trigger"]:not([data-outside-view])',
		);
		await expect(cells.length).toBeGreaterThan(0);
		for (const c of Array.from(cells).slice(0, 6)) expectMinTargetSize(c, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five standard viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components: { DatePicker },
		template: `
      <div data-test-root class="p-2">
        <DatePicker />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const field = root.querySelector('[data-slot="date-picker-field"]') as HTMLElement;
			const r = field.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
