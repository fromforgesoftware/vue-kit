import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import DateRangeField from './DateRangeField.vue';
import Label from '../../form/label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Dates/DateRangeField',
	component: DateRangeField,
	tags: ['!autodocs'],
	argTypes: {
		variant: { control: 'select', options: ['default', 'error'] },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		granularity: { control: 'select', options: ['day', 'hour', 'minute', 'second'] },
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		error: { control: 'boolean' },
		describedBy: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		variant: 'default',
		size: 'default',
		granularity: 'day',
		disabled: false,
		readonly: false,
		error: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					"Segmented date-range input — start and end dates each have their own focusable segments separated by an en-dash. Built on Reka UI's DateRangeField primitive.",
			},
		},
	},
	render: (args) => ({
		components: { DateRangeField },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <DateRangeField v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">
          {{ value?.start?.toISODate() ?? '—' }} → {{ value?.end?.toISODate() ?? '—' }}
        </p>
      </div>
    `,
	}),
} satisfies Meta<typeof DateRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	render: (args) => ({
		components: { DateRangeField },
		setup: () => ({ args }),
		template: `
      <div class="grid w-fit gap-3">
        <DateRangeField v-bind="args" size="sm" />
        <DateRangeField v-bind="args" size="default" />
        <DateRangeField v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = { args: { disabled: true } };

export const Readonly: Story = {
	args: { readonly: true },
	render: (args) => ({
		components: { DateRangeField },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>({
				start: ForgeDate.now(),
				end: ForgeDate.now().plus({ days: 7 }),
			});
			return { args, value };
		},
		template: `<DateRangeField v-bind="args" v-model="value" />`,
	}),
};

export const WithError: Story = {
	args: { error: true, describedBy: 'range-error-msg' },
	render: (args) => ({
		components: { DateRangeField, Label },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid gap-2 w-fit">
        <Label>Date range</Label>
        <DateRangeField v-bind="args" v-model="value" />
        <p id="range-error-msg" class="text-xs text-destructive">End date must be after the start date.</p>
      </div>
    `,
	}),
};

export const MinMax: Story = {
	name: 'Min / Max',
	render: (args) => ({
		components: { DateRangeField },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			const min = ForgeDate.now().minus({ days: 30 });
			const max = ForgeDate.now().plus({ days: 60 });
			return { args, value, min, max };
		},
		template: `<DateRangeField v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="date-range-field"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-invalid', 'true');
		await expect(root).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="date-range-field"]') as HTMLElement;
		await expect(root).toHaveAttribute('data-disabled');
	},
};

export const InteractiveArrowMovesAcrossStartToEnd: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Arrow keys cross the start → end boundary; tab order spans every segment in order.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const startSegments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="date-range-field-segment"][data-range-side="start"]',
		);
		const endSegments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="date-range-field-segment"][data-range-side="end"]',
		);
		await expect(startSegments.length).toBeGreaterThan(0);
		await expect(endSegments.length).toBeGreaterThan(0);
		const lastStart = startSegments[startSegments.length - 1];
		lastStart.focus();
		await userEvent.keyboard('{ArrowRight}');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		// Reka moves focus into the first end segment.
		await expect(document.activeElement).not.toBe(lastStart);
	},
};

export const InteractiveArrowUpIncrements: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="date-range-field-segment"]',
		);
		const first = segments[0];
		first.focus();
		const before = first.textContent;
		await userEvent.keyboard('{ArrowUp}');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await expect(first.textContent).not.toBe(before);
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DateRangeField },
		template: `
      <div data-test-root class="grid w-fit gap-3 p-2">
        <DateRangeField size="sm" />
        <DateRangeField size="default" />
        <DateRangeField size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll<HTMLElement>('[data-slot="date-range-field"]');
		await expect(roots.length).toBe(3);
		for (const r of roots) expectMinTargetSize(r, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DateRangeField },
		template: `
      <div data-test-root class="p-2">
        <DateRangeField />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const field = root.querySelector('[data-slot="date-range-field"]') as HTMLElement;
			const r = field.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
