import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { ForgeDate } from '@fromforgesoftware/ts-kit';
import DateNavToolbar from './DateNavToolbar.vue';

// Fixed selectedDate so the week-range label is deterministic across runs.
const baseProps = {
	view: 'week',
	views: [
		{ value: 'day', label: 'Day' },
		{ value: 'week', label: 'Week' },
		{ value: 'month', label: 'Month' },
	],
	selectedDate: ForgeDate.fromISO('2026-04-30'),
	label: 'Apr 27 – May 3, 2026',
};

describe('DateNavToolbar', () => {
	it('renders one toggle item per view', () => {
		const w = mount(DateNavToolbar, { props: baseProps });
		const items = w.findAll('[data-slot="date-nav-toolbar-view"]');
		expect(items).toHaveLength(3);
		expect(items[0].attributes('data-view')).toBe('day');
	});

	it('renders prev and next buttons', () => {
		const w = mount(DateNavToolbar, { props: baseProps });
		expect(w.find('[data-slot="date-nav-toolbar-prev"]').exists()).toBe(true);
		expect(w.find('[data-slot="date-nav-toolbar-next"]').exists()).toBe(true);
	});

	it('emits prev / next on button click', async () => {
		const w = mount(DateNavToolbar, { props: baseProps });
		await w.find('[data-slot="date-nav-toolbar-prev"]').trigger('click');
		await w.find('[data-slot="date-nav-toolbar-next"]').trigger('click');
		expect(w.emitted('prev')).toHaveLength(1);
		expect(w.emitted('next')).toHaveLength(1);
	});

	it('renders the actions slot when provided', () => {
		const w = mount(DateNavToolbar, {
			props: baseProps,
			slots: { actions: '<button data-testid="action">Go</button>' },
		});
		expect(w.find('[data-testid="action"]').exists()).toBe(true);
	});

	it('omits the actions wrapper when no slot content is provided', () => {
		const w = mount(DateNavToolbar, { props: baseProps });
		// No actions slot → only the left cluster is rendered as a direct child
		expect(w.html()).not.toContain('data-testid="action"');
	});

	it('does not render Year picker for the default view', () => {
		const w = mount(DateNavToolbar, { props: baseProps });
		expect(w.find('[data-slot^="year-picker"]').exists()).toBe(false);
	});
});
