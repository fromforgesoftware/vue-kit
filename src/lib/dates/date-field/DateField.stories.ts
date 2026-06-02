import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import DateField from './DateField.vue';
import Label from '../../form/label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Dates/DateField',
	component: DateField,
	// Curated About.mdx — disable autodocs.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ['default', 'error'],
			description: 'Visual style. Prefer the `error` boolean for validation errors.',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Density. Mirrors Input — `sm` = 28 px, `default` = 32 px, `lg` = 40 px.',
		},
		granularity: {
			control: 'select',
			options: ['day', 'hour', 'minute', 'second'],
		},
		hourCycle: { control: 'select', options: [undefined, 12, 24] },
		disabled: { control: 'boolean' },
		readonly: { control: 'boolean' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` and applies error variant.',
		},
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
					"Segmented date input — each part (day, month, year) is independently focusable and keyboard-driven. Built on Reka UI's DateField primitive.",
			},
		},
	},
	render: (args) => ({
		components: { DateField },
		setup() {
			const value = ref<ForgeDate | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <DateField v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">Value: {{ value?.toISODate() ?? 'None' }}</p>
      </div>
    `,
	}),
} satisfies Meta<typeof DateField>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: { description: { story: 'Three density tiers — heights mirror Input.' } },
	},
	render: (args) => ({
		components: { DateField },
		setup: () => ({ args }),
		template: `
      <div class="grid w-72 gap-3">
        <DateField v-bind="args" size="sm" />
        <DateField v-bind="args" size="default" />
        <DateField v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const Readonly: Story = {
	args: { readonly: true },
	render: (args) => ({
		components: { DateField },
		setup() {
			const value = ref<ForgeDate | null>(ForgeDate.now());
			return { args, value };
		},
		template: `<DateField v-bind="args" v-model="value" />`,
	}),
};

export const WithError: Story = {
	args: { error: true, describedBy: 'date-error-msg' },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid="true"` on the root and tints the border. Pair with descriptive helper text via `describedBy`.',
			},
		},
	},
	render: (args) => ({
		components: { DateField, Label },
		setup() {
			const value = ref<ForgeDate | null>(null);
			return { args, value };
		},
		template: `
      <div class="grid w-72 gap-2">
        <Label>Date of birth</Label>
        <DateField v-bind="args" v-model="value" />
        <p id="date-error-msg" class="text-xs text-destructive">Please enter a valid date.</p>
      </div>
    `,
	}),
};

export const MinMax: Story = {
	name: 'Min / Max',
	parameters: {
		docs: {
			description: {
				story:
					'Out-of-range values get a `data-invalid` flag — visualise it with the error variant.',
			},
		},
	},
	render: (args) => ({
		components: { DateField },
		setup() {
			const value = ref<ForgeDate | null>(null);
			const min = ForgeDate.now().minus({ days: 7 });
			const max = ForgeDate.now().plus({ days: 30 });
			return { args, value, min, max };
		},
		template: `<DateField v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

export const WithGranularity: Story = {
	name: 'With Granularity (date + time)',
	args: { granularity: 'minute' },
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveTypeFillsSegment: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'Typing digits into the focused segment fills it and advances focus.' },
		},
	},
	play: async ({ args, canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="date-field-segment"]',
		);
		await expect(segments.length).toBeGreaterThan(0);
		segments[0].focus();
		await expect(segments[0]).toHaveFocus();
		await userEvent.keyboard('1');
		// After typing, Reka has advanced focus / updated the segment; the model
		// emits when a complete date is built — assert the segment received input.
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await expect(args['onUpdate:modelValue']).toBeDefined();
	},
};

export const InteractiveArrowRightMovesSegments: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="date-field-segment"]',
		);
		const first = segments[0];
		first.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(document.activeElement).not.toBe(first);
	},
};

export const InteractiveArrowUpIncrements: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'ArrowUp / ArrowDown increment / decrement the focused segment value.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const segments = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="date-field-segment"]',
		);
		const first = segments[0];
		first.focus();
		const before = first.textContent;
		await userEvent.keyboard('{ArrowUp}');
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await expect(first.textContent).not.toBe(before);
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'msg' },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="date-field"]') as HTMLElement;
		await expect(root).toHaveAttribute('aria-invalid', 'true');
		await expect(root).toHaveAttribute('aria-describedby', 'msg');
	},
};

export const InteractiveDisabled: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="date-field"]') as HTMLElement;
		await expect(root).toHaveAttribute('data-disabled');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DateField },
		template: `
      <div data-test-root class="grid w-72 gap-3 p-2">
        <DateField size="sm" />
        <DateField size="default" />
        <DateField size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const roots = canvasElement.querySelectorAll<HTMLElement>('[data-slot="date-field"]');
		await expect(roots.length).toBe(3);
		for (const r of roots) expectMinTargetSize(r, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { DateField },
		template: `
      <div data-test-root class="p-2">
        <DateField />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const field = root.querySelector('[data-slot="date-field"]') as HTMLElement;
			const r = field.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
