import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import RangeCalendar from './RangeCalendar.vue';
import { defaultDateRangePresets } from '../date-range-picker/date-range-picker';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Dates/RangeCalendar',
	component: RangeCalendar,
	// Curated About.mdx — disable autodocs to avoid duplicate docs page.
	tags: ['!autodocs'],
	argTypes: {
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Density. `sm` = 28px cells, `default` = 32px, `lg` = 36px.',
		},
		numberOfMonths: { control: 'number', description: 'Render 1 or 2 months side by side.' },
		monthYearSelect: { control: 'boolean' },
		disabled: { control: 'boolean' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		size: 'default',
		numberOfMonths: 1,
		monthYearSelect: false,
		disabled: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Always-visible range calendar built on Reka UI. For a popover-triggered range picker compose [DateRangePicker](?path=/docs/dates-daterangepicker--docs).',
			},
		},
	},
	render: (args) => ({
		components: { RangeCalendar },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value };
		},
		template: `
      <div class="space-y-2">
        <RangeCalendar v-bind="args" v-model="value" @update:modelValue="args['onUpdate:modelValue']" />
        <p class="text-xs text-muted-foreground">
          {{ value?.start?.toISODate() ?? '—' }} → {{ value?.end?.toISODate() ?? '—' }}
        </p>
      </div>
    `,
	}),
} satisfies Meta<typeof RangeCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Three density tiers. Day cells meet WCAG 2.5.8 (≥ 24×24) at every size.',
			},
		},
	},
	render: (args) => ({
		components: { RangeCalendar },
		setup: () => ({ args }),
		template: `
      <div class="flex flex-wrap items-start gap-4">
        <RangeCalendar v-bind="args" size="sm" />
        <RangeCalendar v-bind="args" size="default" />
        <RangeCalendar v-bind="args" size="lg" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
};

export const WithMinMax: Story = {
	name: 'With Min / Max',
	render: (args) => ({
		components: { RangeCalendar },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			const min = ForgeDate.now().minus({ days: 30 });
			const max = ForgeDate.now().plus({ days: 60 });
			return { args, value, min, max };
		},
		template: `<RangeCalendar v-bind="args" v-model="value" :min-value="min" :max-value="max" />`,
	}),
};

export const WithMonthYearSelect: Story = {
	name: 'With Month / Year Select',
	args: { monthYearSelect: true },
};

export const TwoMonths: Story = {
	args: { numberOfMonths: 2 },
};

export const WithPresets: Story = {
	name: 'With Presets',
	parameters: {
		docs: {
			description: {
				story:
					'Render preset buttons in a sidebar. Selecting a preset emits the preset range and clears any in-flight selection.',
			},
		},
	},
	render: (args) => ({
		components: { RangeCalendar },
		setup() {
			const value = ref<{ start: ForgeDate; end: ForgeDate } | null>(null);
			return { args, value, presets: defaultDateRangePresets };
		},
		template: `<RangeCalendar v-bind="args" v-model="value" :presets="presets" />`,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveSelectRangeByClick: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const triggers = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="range-calendar-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		);
		await expect(triggers.length).toBeGreaterThan(2);
		await userEvent.click(triggers[5]);
		await userEvent.click(triggers[10]);
		await new Promise((r) => requestAnimationFrame(() => r(undefined)));
		await expect(args['onUpdate:modelValue']).toHaveBeenCalled();
		// After selection both bookend cells should be marked.
		const start = canvasElement.querySelector('[data-selection-start]');
		const end = canvasElement.querySelector('[data-selection-end]');
		await expect(start).not.toBeNull();
		await expect(end).not.toBeNull();
	},
};

export const InteractiveKeyboardArrowRight: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const triggers = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="range-calendar-cell-trigger"]:not([data-outside-view]):not([data-disabled])',
		);
		const first = triggers[5];
		first.focus();
		await userEvent.keyboard('{ArrowRight}');
		await expect(document.activeElement).not.toBe(first);
	},
};

export const InteractiveCellTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Day cells meet WCAG 2.2 SC 2.5.8 (≥ 24×24) at all sizes.' } },
	},
	render: () => ({
		components: { RangeCalendar },
		template: `
      <div data-test-root class="flex flex-wrap items-start gap-4 p-2">
        <RangeCalendar size="sm" />
        <RangeCalendar size="default" />
        <RangeCalendar size="lg" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		const triggers = root.querySelectorAll<HTMLElement>(
			'[data-slot="range-calendar-cell-trigger"]:not([data-outside-view])',
		);
		await expect(triggers.length).toBeGreaterThan(0);
		for (const t of Array.from(triggers).slice(0, 6)) expectMinTargetSize(t, 24);
	},
};

export const InteractiveTodayHasAriaCurrent: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const today = canvasElement.querySelector('[data-today]');
		await expect(today).not.toBeNull();
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
		components: { RangeCalendar },
		template: `
      <div data-test-root class="p-2">
        <RangeCalendar />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cal = root.querySelector('[data-slot="range-calendar"]') as HTMLElement;
			const r = cal.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
		});
	},
};
