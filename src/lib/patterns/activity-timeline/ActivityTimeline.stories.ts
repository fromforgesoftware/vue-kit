import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, userEvent, within } from 'storybook/test';
import ActivityTimeline from './ActivityTimeline.vue';
import type { ActivityGroup } from './activity-timeline';
import {
	forEachViewport,
	expectNoHorizontalOverflow,
	expectMinTargetSize,
} from '../../../test-utils/playHelpers';

// ─── Fixtures ─────────────────────────────────────────────────────────────────
// Lifted to module scope so demo + interactive stories share a single dataset
// and play tests can reason about exact item counts / labels.

const fullGroups: ActivityGroup[] = [
	{
		title: 'This week',
		items: [
			{
				id: '1',
				type: 'status_change',
				timestamp: '1 day ago',
				user: {
					name: 'Daniel James',
					avatarUrl: 'https://i.pravatar.cc/150?u=daniel',
				},
				meta: { value: 'Deal Closed' },
			},
			{
				id: '2',
				type: 'email',
				timestamp: '2 days ago',
				title: 'Welcome to Attio',
				description:
					"Hi Yvonne, I'm thrilled to be able to welcome you to Attio! The team will be able to get you onboarded this afternoon - what time works best for you?",
				users: [
					{ name: 'Nico Greenberg', avatarUrl: 'https://i.pravatar.cc/150?u=nico' },
					{ name: 'Yvonne Thompson', avatarUrl: 'https://i.pravatar.cc/150?u=yvonne' },
				],
			},
			{
				id: '3',
				type: 'expandable_group',
				timestamp: '',
				title: 'Show 3 more emails from this week',
				collapsedItems: [
					{
						id: '3-1',
						type: 'email',
						timestamp: '3 days ago',
						title: 'Re: Onboarding',
						description: 'Just checking in on the progress...',
						users: [{ name: 'Daniel James' }],
					},
					{
						id: '3-2',
						type: 'email',
						timestamp: '4 days ago',
						title: 'Meeting notes',
						description: 'Here are the notes from our call...',
						users: [{ name: 'Yvonne Thompson' }],
					},
					{
						id: '3-3',
						type: 'email',
						timestamp: '5 days ago',
						title: 'Contract Review',
						description: 'Please review the attached contract draft.',
						users: [{ name: 'Legal Team' }],
					},
				],
			},
			{
				id: '4',
				type: 'attribute_change',
				timestamp: '2 days ago',
				user: {
					name: 'Nico Greenberg',
					avatarUrl: 'https://i.pravatar.cc/150?u=nico',
				},
				meta: { count: 3 },
				attributeChanges: [
					{ attribute: 'Status', oldValue: 'In Progress', newValue: 'Completed' },
					{ attribute: 'Priority', oldValue: 'Medium', newValue: 'High' },
					{ attribute: 'Assignee', oldValue: 'John Doe', newValue: 'Jane Smith' },
				],
			},
			{ id: '5', type: 'add_to_list', timestamp: '3 days ago' },
			{ id: '6', type: 'merge', timestamp: '6 days ago' },
			{
				id: '7',
				type: 'calendar_event',
				timestamp: '10:00 - 11:40 AM',
				title: 'Due Diligence Update',
				users: [{ name: 'NAM' }, { name: 'AM' }, { name: 'M' }],
				meta: { count: 4 },
			},
			{
				id: '8',
				type: 'expandable_group',
				timestamp: '',
				title: 'Show 3 more events from this week',
				collapsedItems: [
					{
						id: '8-1',
						type: 'calendar_event',
						timestamp: '2:00 - 3:00 PM',
						title: 'Product Demo',
						users: [{ name: 'DJ' }],
					},
					{
						id: '8-2',
						type: 'calendar_event',
						timestamp: '4:00 - 5:00 PM',
						title: 'Team Sync',
						users: [{ name: 'All' }],
					},
					{
						id: '8-3',
						type: 'calendar_event',
						timestamp: '5:30 - 6:00 PM',
						title: 'Wrap up',
						users: [{ name: 'Nico' }],
					},
				],
			},
		],
	},
];

const shortGroups: ActivityGroup[] = [
	{
		title: 'Today',
		items: [
			{
				id: 's1',
				type: 'comment',
				timestamp: '10:00 AM',
				user: { name: 'Alice' },
				description: 'Looks good to me.',
			},
			{
				id: 's2',
				type: 'expandable_group',
				timestamp: '',
				collapsedItems: [
					{
						id: 's2-1',
						type: 'comment',
						timestamp: '09:00 AM',
						user: { name: 'Bob' },
						description: 'Earlier comment 1',
					},
					{
						id: 's2-2',
						type: 'comment',
						timestamp: '08:00 AM',
						user: { name: 'Carol' },
						description: 'Earlier comment 2',
					},
				],
			},
		],
	},
];

const attributeChangeGroups: ActivityGroup[] = [
	{
		title: 'Today',
		items: [
			{
				id: 'a1',
				type: 'attribute_change',
				timestamp: '11:00 AM',
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

// ─── Meta ─────────────────────────────────────────────────────────────────────

const meta = {
	title: 'Patterns/Activity Timeline',
	component: ActivityTimeline,
	// `!autodocs` disables Storybook's auto-generated "Docs" page so only the
	// MDX-driven "About" page shows in the sidebar — matches the convention
	// used across other Patterns/* components (Sidebar, TimeRangeBar, …).
	tags: ['!autodocs'],
	argTypes: {
		groups: {
			control: 'object',
			description: 'Grouped activity items, one section per time bucket.',
		},
		class: {
			control: 'text',
			description: 'Extra utility classes appended to the root.',
		},
	},
	args: {
		groups: fullGroups,
	},
	parameters: {
		docs: {
			description: {
				component:
					'Vertical chronologically grouped feed of typed activity events. Use for entity detail pages (deal, contact, ticket).',
			},
		},
	},
	render: (args) => ({
		components: { ActivityTimeline },
		setup: () => ({ args }),
		template: `
      <div class="w-[600px] max-w-full bg-background p-8 rounded-xl border border-border">
        <ActivityTimeline v-bind="args" />
      </div>
    `,
	}),
} satisfies Meta<typeof ActivityTimeline>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Demo stories (autodocs) ──────────────────────────────────────────────────

export const Default: Story = {};

export const ShortFeed: Story = {
	args: { groups: shortGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Compact feed with one direct comment plus an expandable group of two earlier comments. Useful for testing the collapse/expand affordance in isolation.',
			},
		},
	},
};

export const AttributeChange: Story = {
	args: { groups: attributeChangeGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Single `attribute_change` row. Click the heading to reveal old → new diffs for each changed attribute.',
			},
		},
	},
};

// ─── Interaction tests (hidden from autodocs) ────────────────────────────────

export const InteractiveExpandGroup: Story = {
	tags: ['!autodocs', 'test'],
	args: { groups: shortGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Clicks the expand toggle, asserts collapsed sub-items render and `aria-expanded` flips to `true`.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvasElement.querySelector(
			'[data-slot="activity-timeline-expand"]',
		) as HTMLButtonElement;
		await expect(toggle).toBeInTheDocument();
		await expect(toggle.tagName.toLowerCase()).toBe('button');
		await expect(toggle.getAttribute('aria-expanded')).toBe('false');

		// Sub-items hidden initially.
		await expect(canvas.queryByText('Earlier comment 1')).toBeNull();

		await userEvent.click(toggle);

		await expect(toggle.getAttribute('aria-expanded')).toBe('true');
		await canvas.findByText('Earlier comment 1');
		await canvas.findByText('Earlier comment 2');
	},
};

export const InteractiveAttributeExpand: Story = {
	tags: ['!autodocs', 'test'],
	args: { groups: attributeChangeGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Clicks the `attribute_change` toggle, asserts the toggle is a real `<button>`, old → new diffs render, and `aria-expanded` flips to `true`.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvasElement.querySelector(
			'[data-slot="activity-timeline-attribute-toggle"]',
		) as HTMLButtonElement;
		await expect(toggle).toBeInTheDocument();
		await expect(toggle.tagName.toLowerCase()).toBe('button');
		await expect(toggle.getAttribute('aria-expanded')).toBe('false');

		// Diffs hidden initially.
		await expect(canvas.queryByText('Open')).toBeNull();

		await userEvent.click(toggle);

		await expect(toggle.getAttribute('aria-expanded')).toBe('true');
		await canvas.findByText('Open');
		await canvas.findByText('Closed');
		await canvas.findByText('Low');
		await canvas.findByText('High');
	},
};

export const InteractiveAttributeKeyboard: Story = {
	tags: ['!autodocs', 'test'],
	args: { groups: attributeChangeGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Tab to the `attribute_change` toggle, press Enter — verifies the diff toggle is reachable + activatable via keyboard alone (WCAG SC 2.1.1).',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvasElement.querySelector(
			'[data-slot="activity-timeline-attribute-toggle"]',
		) as HTMLButtonElement;
		toggle.focus();
		await expect(toggle).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(toggle.getAttribute('aria-expanded')).toBe('true');
		await canvas.findByText('Open');
	},
};

export const InteractiveKeyboardExpand: Story = {
	tags: ['!autodocs', 'test'],
	args: { groups: shortGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Tab to the expand toggle, press Enter — asserts the expand happens via keyboard alone (WCAG SC 2.1.1 Keyboard).',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const toggle = canvasElement.querySelector(
			'[data-slot="activity-timeline-expand"]',
		) as HTMLButtonElement;
		toggle.focus();
		await expect(toggle).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(toggle.getAttribute('aria-expanded')).toBe('true');
		await canvas.findByText('Earlier comment 1');
	},
};

export const InteractiveAriaAttributes: Story = {
	tags: ['!autodocs', 'test'],
	args: { groups: shortGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Verifies the timeline exposes the contract play tests / consumers depend on: the root, group, item, and toggle data-slots, plus initial `aria-expanded="false"` on the expand toggle.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-slot="activity-timeline"]');
		const group = canvasElement.querySelector('[data-slot="activity-timeline-group"]');
		const items = canvasElement.querySelectorAll('[data-slot="activity-timeline-item"]');
		const toggle = canvasElement.querySelector('[data-slot="activity-timeline-expand"]');

		await expect(root).toBeInTheDocument();
		await expect(group).toBeInTheDocument();
		await expect(items.length).toBeGreaterThan(0);
		for (const item of Array.from(items)) {
			await expect(item.getAttribute('data-activity-type')).toBeTruthy();
		}
		await expect(toggle).toBeInTheDocument();
		await expect(toggle?.getAttribute('aria-expanded')).toBe('false');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { groups: shortGroups },
	parameters: {
		docs: {
			description: {
				story:
					'Renders cleanly across mobileXs / mobileSm / tablet / laptop / desktop with no horizontal overflow.',
			},
		},
	},
	render: (args) => ({
		components: { ActivityTimeline },
		setup: () => ({ args }),
		template: `
      <div data-test-root class="w-full max-w-full p-4">
        <ActivityTimeline v-bind="args" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			// Both toggles stay real <button>s at every viewport and clear
			// WCAG SC 2.5.8 target size (≥ 24 × 24 px).
			const expand = canvasElement.querySelector(
				'[data-slot="activity-timeline-expand"]',
			) as HTMLElement | null;
			const attrToggle = canvasElement.querySelector(
				'[data-slot="activity-timeline-attribute-toggle"]',
			) as HTMLElement | null;
			if (expand) {
				await expect(expand.tagName.toLowerCase()).toBe('button');
				expectMinTargetSize(expand, 24);
			}
			if (attrToggle) {
				await expect(attrToggle.tagName.toLowerCase()).toBe('button');
			}
		});
	},
};
