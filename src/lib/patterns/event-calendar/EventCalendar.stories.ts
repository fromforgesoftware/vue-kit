import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent, within } from 'storybook/test';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import EventCalendar from './EventCalendar.vue';
import type { EventCalendarItem, EventCalendarView } from './event-calendar';
import {
	forEachViewport,
	expectNoHorizontalOverflow,
	expectMinTargetSize,
} from '../../../test-utils/playHelpers';

// ── Module-level fixtures ────────────────────────────────────────────────────

const TODAY = ForgeDate.now();
const YEAR = TODAY.year;
const MONTH = TODAY.month - 1;

const SAMPLE_EVENTS: EventCalendarItem[] = [
	{
		id: '1',
		title: 'Weekly Team Meeting',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 9, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 10, 0)),
		variant: 'primary',
	},
	{
		id: '2',
		title: 'Product Launch Review',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 13, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 14, 30)),
		variant: 'success',
	},
	{
		id: '3',
		title: 'Design Sprint',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day + 1, 10, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day + 1, 12, 0)),
		variant: 'info',
	},
	{
		id: '4',
		title: 'Quarterly Planning',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day + 2, 14, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day + 2, 16, 0)),
		variant: 'warning',
	},
	{
		id: '5',
		title: 'Company All-Hands',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 0, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 23, 59)),
		allDay: true,
		variant: 'danger',
	},
	{
		id: '6',
		title: '1:1 with Manager',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 11, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 11, 30)),
		variant: 'secondary',
	},
	{
		id: '7',
		title: 'Lunch Break',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 12, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 13, 0)),
		variant: 'neutral',
	},
];

const OVERLAPPING_EVENTS: EventCalendarItem[] = [
	{
		id: 'o1',
		title: 'Standup Call',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 9, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 9, 30)),
		variant: 'primary',
	},
	{
		id: 'o2',
		title: 'Design Review',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 9, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 10, 0)),
		variant: 'info',
	},
	{
		id: 'o3',
		title: 'Task Overview',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 9, 30)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 11, 0)),
		variant: 'success',
	},
	{
		id: 'o4',
		title: 'Auto Layouts',
		start: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 10, 0)),
		end: new ForgeDate(new Date(YEAR, MONTH, TODAY.day, 11, 0)),
		variant: 'warning',
	},
];

const meta = {
	title: 'Patterns/EventCalendar',
	component: EventCalendar,
	tags: ['!autodocs'],
	argTypes: {
		view: { control: 'select', options: ['day', 'week', 'month', 'year', 'week-horizontal'] },
		weekStartsOn: { control: 'number' },
		showWeekNumbers: { control: 'boolean' },
		locale: { control: 'text' },
		onEventClick: { action: 'eventClick' },
		'onUpdate:view': { action: 'update:view' },
		'onUpdate:selectedDate': { action: 'update:selectedDate' },
	},
	args: {
		view: 'week' as EventCalendarView,
		selectedDate: TODAY,
		events: SAMPLE_EVENTS,
		onEventClick: fn(),
		'onUpdate:view': fn(),
		'onUpdate:selectedDate': fn(),
	},
	render: (args) => ({
		components: { EventCalendar },
		setup: () => ({ args }),
		template: `
      <div data-test-root style="height: 700px">
        <EventCalendar
          v-bind="args"
          @event-click="args.onEventClick"
          @update:view="args['onUpdate:view']"
          @update:selected-date="args['onUpdate:selectedDate']"
        />
      </div>
    `,
	}),
} satisfies Meta<typeof EventCalendar>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Visual stories ───────────────────────────────────────────────────────────

export const WeekView: Story = {};

export const DayView: Story = { args: { view: 'day' } };

export const MonthView: Story = { args: { view: 'month' } };

export const YearView: Story = { args: { view: 'year' } };

export const Empty: Story = { args: { events: [] } };

export const OverlappingEvents: Story = {
	args: { view: 'day', events: OVERLAPPING_EVENTS },
};

export const SundayStart: Story = { args: { weekStartsOn: 7 } };

export const WeekHorizontal: Story = {
	args: { view: 'week-horizontal', hideHeader: true },
};

export const WeekHorizontalCompact: Story = {
	args: { view: 'week-horizontal', hideHeader: true, compact: true },
};

export const WeekHorizontalEmpty: Story = {
	args: { view: 'week-horizontal', hideHeader: true, events: [] },
};

// ── Interactive tests ────────────────────────────────────────────────────────

export const InteractiveNavigateNext: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const nextBtn = await canvas.findByRole('button', { name: /next/i });
		await userEvent.click(nextBtn);
		await expect(args['onUpdate:selectedDate']).toHaveBeenCalled();
	},
};

export const InteractiveSwitchView: Story = {
	tags: ['!autodocs', 'test'],
	args: { view: 'month' as EventCalendarView },
	play: async ({ args, canvasElement }) => {
		const weekBtn = canvasElement.querySelector<HTMLElement>(
			'[data-slot="date-nav-toolbar-view"][data-view="week"]',
		);
		await expect(weekBtn).toBeInTheDocument();
		await userEvent.click(weekBtn!);
		await expect(args['onUpdate:view']).toHaveBeenCalled();
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const prev = canvasElement.querySelector<HTMLElement>('[data-slot="date-nav-toolbar-prev"]');
		const next = canvasElement.querySelector<HTMLElement>('[data-slot="date-nav-toolbar-next"]');
		await expect(prev).toBeInTheDocument();
		await expect(next).toBeInTheDocument();
		expectMinTargetSize(prev!);
		expectMinTargetSize(next!);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector<HTMLElement>('[data-test-root]');
		await expect(root).toBeInTheDocument();
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root!);
		});
	},
};
