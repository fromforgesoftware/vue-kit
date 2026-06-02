import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { type ForgeDate } from '@fromforgesoftware/ts-kit';
import TimeRangeField from './TimeRangeField.vue';
import Label from '../../form/label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Dates/TimeRangeField',
	component: TimeRangeField,
	tags: ['!autodocs'],
	argTypes: {
		variant: { control: 'select', options: ['default', 'error'] },
		size: { control: 'select', options: ['sm', 'default', 'lg'] },
		granularity: { control: 'select', options: ['hour', 'minute', 'second'] },
		hourCycle: { control: 'select', options: [undefined, 12, 24] },
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		error: { control: 'boolean' },
		describedBy: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		variant: 'default',
		size: 'default',
		granularity: 'minute',
		disabled: false,
		readonly: false,
		error: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					"Segmented time-range input — start and end times each have their own focusable hour / minute (and optional second + AM/PM) segments. Built on Reka UI's TimeRangeField primitive.",
			},
		},
	},
	render: (args) => ({
		components: { TimeRangeField },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <TimeRangeField v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">
          {{ value?.start?.toISO() ?? '—' }} → {{ value?.end?.toISO() ?? '—' }}
        </p>
      </div>
    `,
	}),
} satisfies Meta<typeof TimeRangeField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	render: (args) => ({
		components: { TimeRangeField },
		setup: () => ({ args }),
		template: `
      <div class="grid w-fit gap-3">
        <TimeRangeField v-bind="args" size="sm" />
        <TimeRangeField v-bind="args" size="default" />
        <TimeRangeField v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = { args: { disabled: true } };

export const Readonly: Story = { args: { readonly: true } };

export const WithError: Story = {
	args: { error: true, describedBy: 'time-range-error-msg' },
	render: (args) => ({
		components: { TimeRangeField, Label },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid gap-2 w-fit">
        <Label>Shift hours</Label>
        <TimeRangeField v-bind="args" v-model="value" />
        <p id="time-range-error-msg" class="text-xs text-destructive">End time must be after start time.</p>
      </div>
    `,
	}),
};

export const WithSeconds: Story = { name: 'With Seconds', args: { granularity: 'second' } };
export const TwentyFourHour: Story = { name: '24-Hour Cycle', args: { hourCycle: 24 } };
export const TwelveHour: Story = { name: '12-Hour Cycle', args: { hourCycle: 12 } };

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="time-range-field"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-invalid', 'true');
		await expect(root).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="time-range-field"]') as HTMLElement;
		await expect(root).toHaveAttribute('data-disabled');
	},
};

export const InteractiveArrowMovesAcrossStartToEnd: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const startSegments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-range-field-segment"][data-range-side="start"]',
		);
		const endSegments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-range-field-segment"][data-range-side="end"]',
		);
		await expect(startSegments.length).toBeGreaterThan(0);
		await expect(endSegments.length).toBeGreaterThan(0);
		const lastStart = startSegments[startSegments.length - 1];
		lastStart.focus();
		await userEvent.keyboard('{ArrowRight}');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await expect(document.activeElement).not.toBe(lastStart);
	},
};

export const InteractiveArrowUpIncrements: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="time-range-field-segment"]',
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
		components: { TimeRangeField },
		template: `
      <div data-test-root class="grid w-fit gap-3 p-2">
        <TimeRangeField size="sm" />
        <TimeRangeField size="default" />
        <TimeRangeField size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll<HTMLElement>('[data-slot="time-range-field"]');
		await expect(roots.length).toBe(3);
		for (const r of roots) expectMinTargetSize(r, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { TimeRangeField },
		template: `
      <div data-test-root class="p-2">
        <TimeRangeField />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const field = root.querySelector('[data-slot="time-range-field"]') as HTMLElement;
			const r = field.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
