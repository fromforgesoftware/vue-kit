import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import EventCalendarWeekHorizontal from './EventCalendarWeekHorizontal.vue';
import type { EventCalendarItem } from './event-calendar.js';

// Monday for predictable week math.
const SELECTED = ForgeDate.fromISO('2025-09-29');

function timedEvent(
	id: string,
	date: string,
	startTime: string,
	endTime: string,
	extras: Partial<EventCalendarItem> = {},
): EventCalendarItem {
	return {
		id,
		title: id,
		start: ForgeDate.fromISO(`${date}T${startTime}`),
		end: ForgeDate.fromISO(`${date}T${endTime}`),
		variant: 'primary',
		...extras,
	};
}

describe('EventCalendarWeekHorizontal', () => {
	it('renders one row per day of the week', () => {
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [] },
		});
		const rows = wrapper.findAll('[data-slot="event-calendar-week-horizontal-row"]');
		expect(rows.length).toBe(7);
	});

	it('positions a timed event proportionally on the time axis', () => {
		const event = timedEvent('s1', '2025-09-29', '09:00', '13:00');
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [event] },
		});
		const positioned = wrapper.findAll('div').find((n) => {
			const style = n.attributes('style') ?? '';
			return style.includes('left:') && style.includes('width:') && n.text().includes('s1');
		});
		expect(positioned).toBeTruthy();
		const style = positioned!.attributes('style') ?? '';
		// 9 hours of 24 = 37.5%
		expect(style).toContain('left: 37.5%');
		// 4 hours of 24 ≈ 16.66...%
		expect(style).toMatch(/width:\s*16\.6/);
	});

	it('renders all-day events as a full-width chip', () => {
		const all: EventCalendarItem = {
			id: 'allday',
			title: 'Annual leave',
			start: ForgeDate.fromISO('2025-09-30'),
			end: ForgeDate.fromISO('2025-09-30'),
			allDay: true,
			variant: 'warning',
		};
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [all] },
		});
		expect(wrapper.text()).toContain('Annual leave');
	});

	it('renders segments inside a timed event', () => {
		const event = timedEvent('s1', '2025-09-29', '09:00', '17:00', {
			segments: [
				{ offset: 0.25, size: 0.05, variant: 'green', label: 'Break' },
				{ offset: 0.5, size: 0.0625, variant: 'amber', label: 'Lunch' },
			],
		});
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [event] },
		});
		// Segments render as overlay divs with `top-[1px]` styling.
		const segments = wrapper
			.findAll('div')
			.filter((n) => n.classes().some((c) => c.includes('top-[1px]')));
		expect(segments.length).toBe(2);
	});

	it('compact mode hides event titles', () => {
		const event = timedEvent('hidden-name', '2025-09-29', '09:00', '13:00', {
			title: 'Visible label',
		});
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [event], compact: true },
		});
		expect(wrapper.text()).not.toContain('Visible label');
	});

	it('emits eventClick when clicking a timed chip', async () => {
		const event = timedEvent('s1', '2025-09-29', '09:00', '13:00');
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [event] },
		});
		const chip = wrapper.findAll('div').find((n) => {
			const style = n.attributes('style') ?? '';
			return style.includes('left:') && style.includes('width:') && n.text().includes('s1');
		})!;
		await chip.trigger('click');
		const events = wrapper.emitted('eventClick');
		expect(events).toBeTruthy();
		expect(events![0][0]).toMatchObject({ item: { id: 's1' } });
	});

	it('emits slotClick when clicking the lane', async () => {
		const wrapper = mount(EventCalendarWeekHorizontal, {
			props: { selectedDate: SELECTED, events: [] },
		});
		const lane = wrapper.findAll('div').find((n) => n.classes().includes('h-14'));
		expect(lane).toBeTruthy();
		await lane!.trigger('click');
		expect(wrapper.emitted('slotClick')).toBeTruthy();
	});
});
