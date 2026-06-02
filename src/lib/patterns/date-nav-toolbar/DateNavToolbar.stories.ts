import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import { Plus } from '@lucide/vue';
import DateNavToolbar from './DateNavToolbar.vue';
import Button from '../../general/button/Button.vue';
import Icon from '../../general/icon/Icon.vue';
import {
	defaultDatePickerPresets,
	defaultWeekPickerPresets,
} from '../../dates/date-picker/date-picker';

const TODAY = ForgeDate.now();

const meta = {
	title: 'Patterns/DateNavToolbar',
	component: DateNavToolbar,
	tags: ['!autodocs'],
	argTypes: {
		'onUpdate:view': { action: 'update:view' },
		'onUpdate:selectedDate': { action: 'update:selectedDate' },
		onPrev: { action: 'prev' },
		onNext: { action: 'next' },
	},
	args: {
		view: 'week',
		views: [
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' },
			{ value: 'year', label: 'Year' },
		],
		selectedDate: TODAY,
		label: 'Apr 27 – May 3, 2026',
		'onUpdate:view': fn(),
		'onUpdate:selectedDate': fn(),
		onPrev: fn(),
		onNext: fn(),
	},
} satisfies Meta<typeof DateNavToolbar>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
	render: (args) => ({
		components: { DateNavToolbar },
		setup: () => ({ args }),
		template: `<DateNavToolbar v-bind="args" />`,
	}),
};

export const ThreeViews: Story = {
	name: 'Three views (no Year) — like Timeline',
	args: {
		views: [
			{ value: 'day', label: 'Day' },
			{ value: 'week', label: 'Week' },
			{ value: 'month', label: 'Month' },
		],
		view: 'day',
		label: 'Apr 29, 2026',
	},
	render: (args) => ({
		components: { DateNavToolbar },
		setup: () => ({ args, presets: defaultDatePickerPresets }),
		template: `<DateNavToolbar v-bind="args" :presets="presets" />`,
	}),
};

export const MonthPickerView: Story = {
	args: { view: 'month', label: 'April 2026' },
	render: (args) => ({
		components: { DateNavToolbar },
		setup: () => ({ args }),
		template: `<DateNavToolbar v-bind="args" />`,
	}),
};

export const YearPickerView: Story = {
	args: { view: 'year', label: '2026' },
	render: (args) => ({
		components: { DateNavToolbar },
		setup: () => ({ args }),
		template: `<DateNavToolbar v-bind="args" />`,
	}),
};

export const WithActions: Story = {
	args: { view: 'week', label: 'Apr 27 – May 3, 2026' },
	render: (args) => ({
		components: { DateNavToolbar, Button, Icon },
		setup: () => ({ args, Plus }),
		template: `
      <DateNavToolbar v-bind="args">
        <template #actions>
          <Button size="sm" variant="outline">All Groups</Button>
          <Button size="sm">
            <Icon :icon="Plus" size="sm" />
            New event
          </Button>
        </template>
      </DateNavToolbar>
    `,
	}),
};

export const TwoWayBinding: Story = {
	name: 'v-model (interactive)',
	render: () => ({
		components: { DateNavToolbar },
		setup() {
			const view = ref('week');
			const selectedDate = ref(TODAY);
			const presets = defaultWeekPickerPresets;
			const views = [
				{ value: 'day', label: 'Day' },
				{ value: 'week', label: 'Week' },
				{ value: 'month', label: 'Month' },
				{ value: 'year', label: 'Year' },
			];
			function onPrev() {
				selectedDate.value = selectedDate.value.minus({ days: 7 });
			}
			function onNext() {
				selectedDate.value = selectedDate.value.plus({ days: 7 });
			}
			return { view, selectedDate, presets, views, onPrev, onNext };
		},
		template: `
      <div class="space-y-4">
        <DateNavToolbar
          v-model:view="view"
          v-model:selected-date="selectedDate"
          :views="views"
          :label="selectedDate.toISODate()"
          :presets="presets"
          @prev="onPrev"
          @next="onNext"
        />
        <div class="text-xs text-muted-foreground">
          view = {{ view }} · selectedDate = {{ selectedDate.toISODate() }}
        </div>
      </div>
    `,
	}),
};

// ── Interactive tests ──────────────────────────────────────────────────

export const InteractivePrevNext: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const prev = canvasElement.querySelector<HTMLElement>('[data-slot="date-nav-toolbar-prev"]');
		const next = canvasElement.querySelector<HTMLElement>('[data-slot="date-nav-toolbar-next"]');
		await expect(prev).toBeInTheDocument();
		await expect(next).toBeInTheDocument();
		await userEvent.click(prev!);
		await expect(args.onPrev).toHaveBeenCalled();
		await userEvent.click(next!);
		await expect(args.onNext).toHaveBeenCalled();
	},
};

export const InteractiveSwitchView: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const dayBtn = canvasElement.querySelector<HTMLElement>(
			'[data-slot="date-nav-toolbar-view"][data-view="day"]',
		);
		await expect(dayBtn).toBeInTheDocument();
		await userEvent.click(dayBtn!);
		await expect(args['onUpdate:view']).toHaveBeenCalledWith('day');
	},
};
