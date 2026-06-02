import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import ActivityTimeline from './ActivityTimeline.vue';
import type { ActivityGroup } from './activity-timeline';

const baseGroups: ActivityGroup[] = [
	{
		title: 'Today',
		items: [
			{
				id: '1',
				type: 'status_change',
				timestamp: '10:30 AM',
				user: { name: 'John Doe' },
				meta: { value: 'Active' },
			},
			{
				id: '2',
				type: 'comment',
				timestamp: '09:15 AM',
				user: { name: 'Jane Smith' },
				description: 'This is a comment',
			},
		],
	},
];

const groupsWithExpandable: ActivityGroup[] = [
	{
		title: 'Today',
		items: [
			{
				id: '1',
				type: 'comment',
				timestamp: '10:00 AM',
				user: { name: 'User 1' },
			},
			{
				id: 'expand-1',
				type: 'expandable_group',
				timestamp: '',
				collapsedItems: [
					{
						id: 'sub-1',
						type: 'comment',
						timestamp: '09:00 AM',
						user: { name: 'User 2' },
					},
					{
						id: 'sub-2',
						type: 'comment',
						timestamp: '08:00 AM',
						user: { name: 'User 3' },
					},
				],
			},
		],
	},
];

const groupsWithAttributeChange: ActivityGroup[] = [
	{
		title: 'Today',
		items: [
			{
				id: 'attr-1',
				type: 'attribute_change',
				timestamp: '10:00 AM',
				user: { name: 'Editor' },
				meta: { count: 2 },
				attributeChanges: [
					{ attribute: 'Status', oldValue: 'Open', newValue: 'Closed' },
					{ attribute: 'Priority', oldValue: 'Low', newValue: 'High' },
				],
			},
		],
	},
];

describe('ActivityTimeline', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(ActivityTimeline, {
			props: { groups: baseGroups },
		});
	});

	// ── Render ────────────────────────────────────────────────────────────────
	describe('rendering', () => {
		it('renders correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('exposes data-slot="activity-timeline" on the root', () => {
			expect(wrapper.find('[data-slot="activity-timeline"]').exists()).toBe(true);
		});

		it('exposes data-slot="activity-timeline-group" on each group', () => {
			expect(wrapper.find('[data-slot="activity-timeline-group"]').exists()).toBe(true);
		});

		it('exposes data-slot="activity-timeline-item" on each item with data-activity-type', () => {
			const items = wrapper.findAll('[data-slot="activity-timeline-item"]');
			expect(items.length).toBe(2);
			expect(items[0].attributes('data-activity-type')).toBe('status_change');
			expect(items[1].attributes('data-activity-type')).toBe('comment');
		});

		it('renders the group title as a heading', () => {
			const heading = wrapper.find('h3');
			expect(heading.exists()).toBe(true);
			expect(heading.text()).toBe('Today');
		});

		it('renders activity items', () => {
			expect(wrapper.text()).toContain('John Doe');
			expect(wrapper.text()).toContain('Jane Smith');
		});
	});

	// ── Activity types ───────────────────────────────────────────────────────
	describe('activity types', () => {
		it('renders status_change with the new status value', () => {
			expect(wrapper.text()).toContain('Active');
		});

		it('renders comment description', () => {
			expect(wrapper.text()).toContain('This is a comment');
		});

		it('renders email type with title and preview', () => {
			const emailGroups: ActivityGroup[] = [
				{
					title: 'Today',
					items: [
						{
							id: 'e1',
							type: 'email',
							timestamp: '11:00 AM',
							title: 'Welcome aboard',
							description: 'Glad to have you on the team.',
							users: [{ name: 'Alice' }],
						},
					],
				},
			];
			const w = mount(ActivityTimeline, { props: { groups: emailGroups } });
			expect(w.text()).toContain('Welcome aboard');
			expect(w.text()).toContain('Glad to have you on the team.');
		});

		it('renders calendar_event with time range', () => {
			const calGroups: ActivityGroup[] = [
				{
					title: 'Today',
					items: [
						{
							id: 'c1',
							type: 'calendar_event',
							timestamp: '10:00 - 11:00 AM',
							title: 'Standup',
							users: [{ name: 'Team' }],
							meta: { count: 1 },
						},
					],
				},
			];
			const w = mount(ActivityTimeline, { props: { groups: calGroups } });
			expect(w.text()).toContain('10:00 - 11:00 AM');
		});
	});

	// ── Expandable groups (Show N more) ──────────────────────────────────────
	describe('expandable groups', () => {
		it('renders the expand toggle as a real <button> with aria-expanded="false"', () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithExpandable } });
			const toggle = w.find('[data-slot="activity-timeline-expand"]');
			expect(toggle.exists()).toBe(true);
			expect(toggle.element.tagName.toLowerCase()).toBe('button');
			expect(toggle.attributes('aria-expanded')).toBe('false');
		});

		it('hides the collapsed sub-items by default', () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithExpandable } });
			expect(w.text()).not.toContain('User 2');
			expect(w.text()).not.toContain('User 3');
		});

		it('expands the group when the toggle is clicked, flipping aria-expanded', async () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithExpandable } });
			const toggle = w.find('[data-slot="activity-timeline-expand"]');
			await toggle.trigger('click');
			expect(toggle.attributes('aria-expanded')).toBe('true');
			expect(w.text()).toContain('User 2');
			expect(w.text()).toContain('User 3');
		});

		it('collapses the group when the toggle is clicked again', async () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithExpandable } });
			const toggle = w.find('[data-slot="activity-timeline-expand"]');
			await toggle.trigger('click');
			await toggle.trigger('click');
			expect(toggle.attributes('aria-expanded')).toBe('false');
			expect(w.text()).not.toContain('User 2');
		});

		it('reflects the count in the toggle label', () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithExpandable } });
			const toggle = w.find('[data-slot="activity-timeline-expand"]');
			expect(toggle.text()).toContain('2');
			expect(toggle.text().toLowerCase()).toContain('more items');
		});
	});

	// ── Attribute change toggle ──────────────────────────────────────────────
	describe('attribute_change', () => {
		it('exposes data-slot="activity-timeline-attribute-toggle" as a real <button>', () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithAttributeChange } });
			const toggle = w.find('[data-slot="activity-timeline-attribute-toggle"]');
			expect(toggle.exists()).toBe(true);
			expect(toggle.element.tagName.toLowerCase()).toBe('button');
			expect(toggle.attributes('type')).toBe('button');
			expect(toggle.attributes('aria-expanded')).toBe('false');
		});

		it('hides the diff rows by default', () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithAttributeChange } });
			expect(w.text()).not.toContain('Open');
			expect(w.text()).not.toContain('Closed');
		});

		it('reveals old → new diffs when the toggle is clicked', async () => {
			const w = mount(ActivityTimeline, { props: { groups: groupsWithAttributeChange } });
			const toggle = w.find('[data-slot="activity-timeline-attribute-toggle"]');
			await toggle.trigger('click');
			expect(toggle.attributes('aria-expanded')).toBe('true');
			expect(w.text()).toContain('Open');
			expect(w.text()).toContain('Closed');
			expect(w.text()).toContain('Low');
			expect(w.text()).toContain('High');
		});

		it('is keyboard-focusable (real <button> is in the tab order)', () => {
			const w = mount(ActivityTimeline, {
				props: { groups: groupsWithAttributeChange },
				attachTo: document.body,
			});
			const toggle = w.find('[data-slot="activity-timeline-attribute-toggle"]');
			(toggle.element as HTMLButtonElement).focus();
			expect(document.activeElement).toBe(toggle.element);
			w.unmount();
		});
	});

	// ── Styling ───────────────────────────────────────────────────────────────
	describe('styling', () => {
		it('supports a custom class on the root', () => {
			const w = mount(ActivityTimeline, {
				props: { groups: baseGroups, class: 'custom-timeline' },
			});
			expect(w.classes()).toContain('custom-timeline');
		});
	});

	// ── Edge cases ────────────────────────────────────────────────────────────
	describe('edge cases', () => {
		it('handles empty groups array', () => {
			const w = mount(ActivityTimeline, { props: { groups: [] } });
			expect(w.exists()).toBe(true);
			expect(w.findAll('[data-slot="activity-timeline-group"]').length).toBe(0);
		});

		it('handles a group with no items', () => {
			const w = mount(ActivityTimeline, {
				props: { groups: [{ title: 'Empty', items: [] }] },
			});
			expect(w.text()).toContain('Empty');
			expect(w.findAll('[data-slot="activity-timeline-item"]').length).toBe(0);
		});

		it('handles many groups', () => {
			const manyGroups: ActivityGroup[] = Array.from({ length: 10 }, (_, i) => ({
				title: `Day ${i + 1}`,
				items: [
					{
						id: `item-${i}`,
						type: 'comment' as const,
						timestamp: '10:00 AM',
						user: { name: 'User' },
					},
				],
			}));
			const w = mount(ActivityTimeline, { props: { groups: manyGroups } });
			expect(w.findAll('[data-slot="activity-timeline-group"]').length).toBe(10);
		});
	});
});
