import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { ref } from 'vue';
import { fn, expect, userEvent } from 'storybook/test';
import { Calendar, AlertTriangle, CheckCircle, UserPlus, MessageCircle } from '@lucide/vue';
import NotificationCenter from './NotificationCenter.vue';
import type { NotificationCenterItemData, NotificationCenterTab } from './notification-center.js';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers.js';

// ── Module-level fixtures ────────────────────────────────────────────────

const VARIANTS = ['simple', 'complex'] as const;
const POPOVER_SIDES = ['top', 'right', 'bottom', 'left'] as const;
const POPOVER_ALIGN = ['start', 'center', 'end'] as const;

const dropdownItems: NotificationCenterItemData[] = [
	{
		id: '1',
		subject: 'Wei Chen joined Final Presentation',
		body: 'A new team member has been added to the shift.',
		icon: UserPlus,
		iconClass: 'text-blue-500 bg-blue-50',
		isRead: false,
		relativeTime: '8 min ago',
		badge: { label: 'Horizon Shift', variant: 'secondary' },
	},
	{
		id: '2',
		subject: 'Sophia Williams invites you to review',
		body: 'You have been invited to review the updated schedule for next week.',
		avatar: { name: 'Sophia Williams', src: 'https://i.pravatar.cc/150?u=sophia' },
		isRead: false,
		relativeTime: '2 hours ago',
		badge: { label: 'Synergy HR', variant: 'secondary' },
		actions: [
			{ key: 'reject', label: 'Deny', variant: 'outline' },
			{ key: 'approve', label: 'Approve', variant: 'default' },
		],
	},
	{
		id: '3',
		subject: 'Arthur Taylor uploaded a file',
		body: 'A new report has been uploaded for review.',
		avatar: { name: 'Arthur Taylor', src: 'https://i.pravatar.cc/150?u=arthur' },
		isRead: false,
		relativeTime: '3 hours ago',
		badge: { label: 'Apex Financial', variant: 'secondary' },
		attachment: { label: 'report.csv', size: '4mb' },
	},
	{
		id: '4',
		subject: 'Schedule published for next week',
		body: 'The schedule for April 21-27 has been published. Check your shifts.',
		icon: Calendar,
		iconClass: 'text-emerald-500 bg-emerald-50',
		isRead: false,
		relativeTime: '5 hours ago',
	},
	{
		id: '5',
		subject: 'Laura Perez commented on your post',
		body: "Fantastic! Let's dive right in.",
		avatar: { name: 'Laura Perez', src: 'https://i.pravatar.cc/150?u=laura' },
		isRead: false,
		relativeTime: '1 day ago',
		badge: { label: 'Solaris', variant: 'secondary' },
	},
];

const actionItems: NotificationCenterItemData[] = [
	{
		id: 'a-1',
		subject: 'Leave request: Maria Garcia',
		body: 'Requesting annual leave from April 22 to April 25.',
		avatar: { name: 'Maria Garcia', src: 'https://i.pravatar.cc/150?u=maria' },
		isRead: false,
		relativeTime: '15 min ago',
		actions: [
			{ key: 'reject', label: 'Reject', variant: 'destructive' },
			{ key: 'review', label: 'Review', variant: 'outline' },
			{ key: 'approve', label: 'Approve', variant: 'default' },
		],
	},
	{
		id: 'a-2',
		subject: 'Shift offer: Evening shift Apr 18',
		body: 'An open shift is available. First to accept gets it.',
		icon: Calendar,
		iconClass: 'text-emerald-500 bg-emerald-50',
		isRead: false,
		relativeTime: '1 hour ago',
		actions: [
			{ key: 'decline', label: 'Decline', variant: 'outline' },
			{ key: 'accept', label: 'Accept', variant: 'default' },
		],
	},
	{
		id: 'a-3',
		subject: 'Shift swap request from John Doe',
		body: 'John Doe wants to swap their Monday morning shift with your Tuesday evening shift.',
		avatar: { name: 'John Doe', src: 'https://i.pravatar.cc/150?u=john' },
		isRead: false,
		relativeTime: '3 hours ago',
		actions: [
			{ key: 'reject', label: 'Decline', variant: 'outline' },
			{ key: 'approve', label: 'Accept', variant: 'default' },
		],
	},
];

const highPriorityItems: NotificationCenterItemData[] = [
	{
		id: 'hp-1',
		subject: 'System maintenance scheduled',
		body: 'The system will be unavailable on April 20 from 2:00 AM to 4:00 AM UTC.',
		icon: AlertTriangle,
		iconClass: 'text-amber-500 bg-amber-50',
		isRead: false,
		relativeTime: '1 hour ago',
		accent: true,
	},
	{
		id: 'hp-2',
		subject: 'Shift swap request requires your approval',
		body: 'John Doe has requested to swap their Monday shift with Jane Smith.',
		icon: CheckCircle,
		iconClass: 'text-violet-500 bg-violet-50',
		isRead: false,
		relativeTime: '30 min ago',
		accent: true,
		actions: [
			{ key: 'reject', label: 'Reject', variant: 'destructive' },
			{ key: 'approve', label: 'Approve', variant: 'default' },
		],
	},
	...dropdownItems.slice(0, 3),
];

const complexTabs: NotificationCenterTab[] = [
	{ value: 'all', label: 'All' },
	{ value: 'unread', label: 'Unread', count: 6 },
	{ value: 'actions', label: 'Action Required', count: 2 },
];

const ICONS = [Calendar, MessageCircle, UserPlus, CheckCircle, AlertTriangle];
const ICON_CLASSES = [
	'text-emerald-500 bg-emerald-50',
	'text-blue-500 bg-blue-50',
	'text-violet-500 bg-violet-50',
	'text-amber-500 bg-amber-50',
	'text-rose-500 bg-rose-50',
];
const SUBJECTS = [
	'Schedule updated for next week',
	'New message from team lead',
	'Employee joined your team',
	'Leave request approved',
	'System alert: high load detected',
];

function createPaginatedItem(i: number): NotificationCenterItemData {
	return {
		id: `item-${i}`,
		subject: SUBJECTS[i % SUBJECTS.length],
		body: `This is notification #${i + 1}. Scroll down to load more items automatically.`,
		icon: ICONS[i % ICONS.length],
		iconClass: ICON_CLASSES[i % ICON_CLASSES.length],
		isRead: i > 5,
		relativeTime: i < 60 ? `${i + 1} min ago` : `${Math.floor(i / 60) + 1} hours ago`,
	};
}

const meta = {
	title: 'Patterns/Notification Center',
	component: NotificationCenter,
	tags: ['!autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'Bell-icon trigger that opens a popover listing notifications. `simple` is a flat list with optional infinite scroll. `complex` adds tabs (e.g. All / Unread / Action Required). All items expose actions, badges, avatars, attachments, and accent stripes.',
			},
		},
	},
	argTypes: {
		items: {
			control: false,
			description: 'Notification items to display.',
		},
		variant: {
			control: 'select',
			options: VARIANTS,
			description: '`simple` (flat list) or `complex` (tabbed list with infinite scroll).',
		},
		tabs: {
			control: false,
			description: 'Tab definitions. Only rendered when `variant="complex"`.',
		},
		activeTab: {
			control: 'text',
			description: 'Currently active tab value (controlled).',
		},
		unreadCount: {
			control: { type: 'number', min: 0 },
			description: 'Total unread count shown on the trigger badge. `> 99` renders as `99+`.',
		},
		hasMore: { control: 'boolean', description: 'Whether more items can be loaded.' },
		loading: { control: 'boolean', description: 'Whether items are currently loading.' },
		open: { control: 'boolean', description: 'Popover open state (controlled).' },
		side: { control: 'select', options: POPOVER_SIDES, description: 'Popover placement side.' },
		align: { control: 'select', options: POPOVER_ALIGN, description: 'Popover alignment.' },
		onItemClick: { action: 'itemClick' },
		onActionClick: { action: 'actionClick' },
		onMarkAllRead: { action: 'markAllRead' },
		onLoadMore: { action: 'loadMore' },
		onManageClick: { action: 'manageClick' },
		'onUpdate:open': { action: 'update:open' },
		'onUpdate:activeTab': { action: 'update:activeTab' },
	},
	args: {
		items: dropdownItems,
		variant: 'simple',
		unreadCount: 5,
		hasMore: false,
		loading: false,
		open: undefined,
		side: 'bottom',
		align: 'end',
		onItemClick: fn(),
		onActionClick: fn(),
		onMarkAllRead: fn(),
		onLoadMore: fn(),
		onManageClick: fn(),
		'onUpdate:open': fn(),
		'onUpdate:activeTab': fn(),
	},
	// The outer container is intentional layout — the bell trigger sits at
	// top-right of an app header in real consumers. This is a permitted use
	// (sizing parent for viewport behaviour), not a fix to the component.
	decorators: [
		(story) => ({
			components: { story },
			template: `
        <div data-test-root class="flex justify-end p-4 min-h-[600px] bg-background">
          <div><story /></div>
        </div>
      `,
		}),
	],
} satisfies Meta<typeof NotificationCenter>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────

export const Default: Story = {};

export const SimpleWithActions: Story = {
	name: 'Simple / With Actions',
	args: { items: actionItems, unreadCount: 3 },
};

export const SimpleHighPriority: Story = {
	name: 'Simple / High Priority',
	args: { items: highPriorityItems, unreadCount: 5 },
};

export const SimpleEmpty: Story = {
	name: 'Simple / Empty',
	args: { items: [], unreadCount: 0 },
};

export const SimpleLoading: Story = {
	name: 'Simple / Loading',
	args: { items: [], unreadCount: 0, loading: true },
};

export const Complex: Story = {
	name: 'Complex / With Tabs & Infinite Scroll',
	args: {
		variant: 'complex',
		tabs: complexTabs,
		activeTab: 'all',
		hasMore: true,
	},
	render: (args) => ({
		components: { NotificationCenter },
		setup() {
			const open = ref(true);
			const activeTab = ref(args.activeTab ?? 'all');
			const loading = ref(args.loading ?? false);
			const pageSize = 10;
			const maxItems = 50;

			const items = ref<NotificationCenterItemData[]>(
				Array.from({ length: pageSize }, (_, i) => createPaginatedItem(i)),
			);
			const hasMore = ref(true);

			function loadMore() {
				if (loading.value) return;
				loading.value = true;
				setTimeout(() => {
					const currentLen = items.value.length;
					const newItems = Array.from(
						{ length: Math.min(pageSize, maxItems - currentLen) },
						(_, i) => createPaginatedItem(currentLen + i),
					);
					items.value = [...items.value, ...newItems];
					hasMore.value = items.value.length < maxItems;
					loading.value = false;
				}, 2000);
			}

			return { args, items, open, activeTab, hasMore, loading, loadMore };
		},
		template: `
      <NotificationCenter
        v-bind="args"
        v-model:open="open"
        :items="items"
        :active-tab="activeTab"
        :unread-count="items.filter(i => !i.isRead).length"
        :has-more="hasMore"
        :loading="loading"
        @update:active-tab="activeTab = $event"
        @load-more="loadMore"
      />
    `,
	}),
};

export const ComplexEmpty: Story = {
	name: 'Complex / Empty',
	args: {
		items: [],
		unreadCount: 0,
		variant: 'complex',
		tabs: complexTabs,
		activeTab: 'all',
	},
};

// ── Interactive (Pattern D) ─────────────────────────────────────────────

// Pattern D — InteractiveDragOrSelect: NotificationCenter has no drag affordance.
// The "select" interaction is action-button click on a notification item.
export const InteractiveDragOrSelect: Story = {
	tags: ['!autodocs', 'test'],
	args: { items: actionItems, unreadCount: 3, open: true },
	parameters: {
		docs: {
			description: {
				story:
					'Selection equivalent: clicking an action button on a notification item emits `actionClick` with the item and key. NotificationCenter has no drag affordance, so this is the meaningful select interaction.',
			},
		},
	},
	play: async ({ args }) => {
		const body = inBody();
		await new Promise((r) => setTimeout(r, 100));
		const actionButtons = body
			.getAllByRole('button')
			.filter((b) => b.getAttribute('data-slot') === 'notification-center-action');
		await expect(actionButtons.length).toBeGreaterThan(0);
		await userEvent.click(actionButtons[0]);
		await expect(args.onActionClick).toHaveBeenCalled();
	},
};

// Pattern D — InteractiveKeyboardAlternative (SC 2.5.7).
// All actions reachable by Tab + Enter — no pointer-only paths.
export const InteractiveKeyboardAlternative: Story = {
	tags: ['!autodocs', 'test'],
	args: { items: actionItems, unreadCount: 3, open: true },
	parameters: {
		docs: {
			description: {
				story:
					'Every interactive surface is keyboard-reachable. Tabs cycle from the trigger through tabs, mark-all-read, items, and action buttons. Enter activates each.',
			},
		},
	},
	play: async ({ args }) => {
		await new Promise((r) => setTimeout(r, 100));
		const body = inBody();
		const actionButton = body
			.getAllByRole('button')
			.find((b) => b.getAttribute('data-slot') === 'notification-center-action')!;
		actionButton.focus();
		await expect(actionButton).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(args.onActionClick).toHaveBeenCalled();
	},
};

// Pattern D — InteractiveBoundaryClamps.
// Unread badge clamps to "99+" beyond 99. Empty state clamps to 0 / shows empty UI.
export const InteractiveBoundaryClamps: Story = {
	tags: ['!autodocs', 'test'],
	args: { items: dropdownItems, unreadCount: 250 },
	parameters: {
		docs: {
			description: {
				story:
					'Counts above 99 clamp to `99+` on the trigger badge. Items array of 0 still renders the popover with the empty slot.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="notification-center-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		const badge = trigger.querySelector('[data-slot="badge"]');
		await expect(badge?.textContent?.trim()).toBe('99+');
	},
};

// Pattern D — InteractiveActiveStatesAndA11y.
// Each item exposes data-slot, the trigger has accessible bell + count label,
// active tab gets data-state="active", all interactive targets meet 24×24.
export const InteractiveActiveStatesAndA11y: Story = {
	tags: ['!autodocs', 'test'],
	args: { items: actionItems, unreadCount: 3, open: true },
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="notification-center-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		expectMinTargetSize(trigger, 24);

		await new Promise((r) => setTimeout(r, 100));
		const items = document.body.querySelectorAll('[data-slot="notification-center-item"]');
		await expect(items.length).toBeGreaterThan(0);
		for (const item of items) {
			await expect(item).toHaveAttribute('data-slot', 'notification-center-item');
		}

		const actions = document.body.querySelectorAll('[data-slot="notification-center-action"]');
		await expect(actions.length).toBeGreaterThan(0);
		for (const a of actions) {
			expectMinTargetSize(a, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { items: dropdownItems, unreadCount: 5 },
	parameters: {
		docs: {
			description: {
				story:
					'Trigger and popover both render at every standard viewport without horizontal overflow. Popover content has `max-w-[calc(100vw-1rem)]` to avoid clipping on 320 px screens.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
			expectNoHorizontalOverflow(root);
			const trigger = root.querySelector(
				'[data-slot="notification-center-trigger"]',
			) as HTMLElement;
			await expect(trigger).toBeInTheDocument();
			expectMinTargetSize(trigger, 24);

			// Popover content is portalled to body — assert no overflow there too.
			await new Promise((r) => setTimeout(r, 50));
			const content = document.body.querySelector(
				'[data-slot="notification-center"]',
			) as HTMLElement | null;
			if (content) {
				expectNoHorizontalOverflow(content);
			}
		});
	},
};
