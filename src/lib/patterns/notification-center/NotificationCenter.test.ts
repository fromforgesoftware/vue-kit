import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { Bell, Calendar } from '@lucide/vue';
import NotificationCenter from './NotificationCenter.vue';
import NotificationCenterItem from './NotificationCenterItem.vue';
import NotificationCenterActions from './NotificationCenterActions.vue';
import NotificationCenterEmpty from './NotificationCenterEmpty.vue';
import NotificationCenterList from './NotificationCenterList.vue';
import type { NotificationCenterItemData, NotificationCenterTab } from './notification-center';

const sampleItems: NotificationCenterItemData[] = [
	{
		id: '1',
		subject: 'New shift assigned',
		body: 'You have been assigned to the morning shift.',
		icon: Calendar,
		iconClass: 'text-blue-500 bg-blue-50',
		isRead: false,
		relativeTime: '5 min ago',
	},
	{
		id: '2',
		subject: 'Welcome message',
		body: 'Welcome to the team!',
		avatar: { name: 'John Doe', src: 'https://example.com/avatar.jpg' },
		isRead: true,
		relativeTime: '2 hours ago',
		badge: { label: 'Team A' },
	},
	{
		id: '3',
		subject: 'Leave request',
		body: 'Please review this leave request.',
		icon: Bell,
		isRead: false,
		relativeTime: '1 hour ago',
		actions: [
			{ key: 'reject', label: 'Reject', variant: 'destructive' as const },
			{ key: 'approve', label: 'Approve', variant: 'default' as const },
		],
	},
];

const sampleTabs: NotificationCenterTab[] = [
	{ value: 'all', label: 'All' },
	{ value: 'inbox', label: 'Inbox', count: 2 },
	{ value: 'actions', label: 'Actions', count: 1 },
];

// ============================================
// NotificationCenter (root component)
// Popover content is rendered in a portal,
// so we test the trigger and prop acceptance.
// Sub-component tests below cover content.
// ============================================
describe('NotificationCenter', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(NotificationCenter, {
			props: {
				items: sampleItems,
				unreadCount: 2,
			},
		});
	});

	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render the trigger button', () => {
			expect(wrapper.find('button').exists()).toBe(true);
		});

		it('should show unread count badge on trigger', () => {
			expect(wrapper.text()).toContain('2');
		});

		it('should cap unread count at 99+', () => {
			const wrapper = mount(NotificationCenter, {
				props: { items: [], unreadCount: 150 },
			});
			expect(wrapper.text()).toContain('99+');
		});

		it('should hide badge when unreadCount is 0', () => {
			const wrapper = mount(NotificationCenter, {
				props: { items: [], unreadCount: 0 },
			});
			// Only the trigger button, no badge text
			expect(wrapper.text()).toBe('');
		});
	});

	describe('props', () => {
		it('should accept tabs prop', () => {
			const wrapper = mount(NotificationCenter, {
				props: {
					items: sampleItems,
					unreadCount: 2,
					tabs: sampleTabs,
					activeTab: 'all',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept open prop', () => {
			const wrapper = mount(NotificationCenter, {
				props: { items: [], unreadCount: 0, open: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept side and align props', () => {
			const wrapper = mount(NotificationCenter, {
				props: { items: [], unreadCount: 0, side: 'right', align: 'start' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept loading and hasMore props', () => {
			const wrapper = mount(NotificationCenter, {
				props: { items: [], unreadCount: 0, loading: true, hasMore: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom class', () => {
			const wrapper = mount(NotificationCenter, {
				props: { items: [], unreadCount: 0, class: 'custom-class' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});

// ============================================
// NotificationCenterItem
// ============================================
describe('NotificationCenterItem', () => {
	it('should render subject', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[0] },
		});
		expect(wrapper.text()).toContain('New shift assigned');
	});

	it('should render body', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[0] },
		});
		expect(wrapper.text()).toContain('assigned to the morning shift');
	});

	it('should render relative time', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[0] },
		});
		expect(wrapper.text()).toContain('5 min ago');
	});

	it('should render badge', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[1] },
		});
		expect(wrapper.text()).toContain('Team A');
	});

	it('should render action buttons', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[2] },
		});
		expect(wrapper.text()).toContain('Approve');
		expect(wrapper.text()).toContain('Reject');
	});

	it('should render attachment chip', () => {
		const item: NotificationCenterItemData = {
			...sampleItems[0],
			attachment: { label: 'report.csv', size: '4mb' },
		};
		const wrapper = mount(NotificationCenterItem, { props: { item } });
		expect(wrapper.text()).toContain('report.csv');
		expect(wrapper.text()).toContain('4mb');
	});

	it('should show unread dot when not read', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: { ...sampleItems[0], isRead: false } },
		});
		expect(wrapper.find('.bg-primary').exists()).toBe(true);
	});

	it('should hide unread dot when read', () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: { ...sampleItems[0], isRead: true } },
		});
		expect(wrapper.find('.size-2.rounded-full.bg-primary').exists()).toBe(false);
	});

	it('should apply accent border class', () => {
		const item: NotificationCenterItemData = { ...sampleItems[0], accent: true };
		const wrapper = mount(NotificationCenterItem, { props: { item } });
		expect(wrapper.classes().join(' ')).toContain('border-l-destructive');
	});

	it('should emit click when clicked', async () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[0] },
		});
		await wrapper.trigger('click');
		expect(wrapper.emitted('click')).toBeTruthy();
		expect(wrapper.emitted('click')![0]).toEqual([sampleItems[0]]);
	});

	it('should emit actionClick when action button clicked', async () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[2] },
		});
		const approveBtn = wrapper.findAll('button').find((b) => b.text() === 'Approve');
		expect(approveBtn).toBeDefined();
		await approveBtn!.trigger('click');
		expect(wrapper.emitted('actionClick')).toBeTruthy();
		expect(wrapper.emitted('actionClick')![0]).toEqual([sampleItems[2], 'approve']);
	});

	it('should not emit click when action button clicked', async () => {
		const wrapper = mount(NotificationCenterItem, {
			props: { item: sampleItems[2] },
		});
		const approveBtn = wrapper.findAll('button').find((b) => b.text() === 'Approve');
		await approveBtn!.trigger('click');
		// actionClick emitted but not click (stopPropagation)
		expect(wrapper.emitted('actionClick')).toBeTruthy();
		expect(wrapper.emitted('click')).toBeFalsy();
	});

	it('should handle minimal item without optional fields', () => {
		const item: NotificationCenterItemData = {
			id: 'min',
			subject: 'Minimal',
			isRead: false,
			relativeTime: 'now',
		};
		const wrapper = mount(NotificationCenterItem, { props: { item } });
		expect(wrapper.text()).toContain('Minimal');
	});
});

// ============================================
// NotificationCenterActions
// ============================================
describe('NotificationCenterActions', () => {
	it('should render action buttons', () => {
		const wrapper = mount(NotificationCenterActions, {
			props: {
				actions: [
					{ key: 'reject', label: 'Reject', variant: 'destructive' as const },
					{ key: 'approve', label: 'Approve', variant: 'default' as const },
				],
			},
		});
		expect(wrapper.text()).toContain('Reject');
		expect(wrapper.text()).toContain('Approve');
	});

	it('should emit action key on click', async () => {
		const wrapper = mount(NotificationCenterActions, {
			props: {
				actions: [{ key: 'approve', label: 'Approve' }],
			},
		});
		await wrapper.find('button').trigger('click');
		expect(wrapper.emitted('action')).toBeTruthy();
		expect(wrapper.emitted('action')![0]).toEqual(['approve']);
	});

	it('should render disabled buttons', () => {
		const wrapper = mount(NotificationCenterActions, {
			props: {
				actions: [{ key: 'approve', label: 'Approve', disabled: true }],
			},
		});
		expect(wrapper.find('button').attributes('disabled')).toBeDefined();
	});
});

// ============================================
// NotificationCenterEmpty
// ============================================
describe('NotificationCenterEmpty', () => {
	it('should render the built-in default description when none is provided', () => {
		const wrapper = mount(NotificationCenterEmpty);
		// The default description is now sourced from `TranslationKeys.NotificationEmpty`
		// which resolves to "No notifications". Consumers can pass their own
		// string via the `description` prop if they want different copy.
		expect(wrapper.text()).toContain('No notifications');
	});

	it('should render custom description', () => {
		const wrapper = mount(NotificationCenterEmpty, {
			props: { description: 'Nothing to see here' },
		});
		expect(wrapper.text()).toContain('Nothing to see here');
	});
});

// ============================================
// NotificationCenterList
// ============================================
// Note: Virtual scroll items are not rendered in jsdom (no layout engine),
// so we test empty state, loading, and prop acceptance here.
// Item rendering is covered by NotificationCenterItem tests above.
describe('NotificationCenterList', () => {
	it('should render correctly with items', () => {
		const wrapper = mount(NotificationCenterList, {
			props: { items: sampleItems },
		});
		expect(wrapper.exists()).toBe(true);
		// VirtualScrollArea is present
		expect(wrapper.find('[data-slot="virtual-scroll-area"]').exists()).toBe(true);
	});

	it('should show empty state when no items', () => {
		const wrapper = mount(NotificationCenterList, {
			props: { items: [] },
		});
		// Default empty copy comes from the component's built-in default.
		expect(wrapper.text()).toContain('No notifications');
	});

	it('should show loading skeleton', () => {
		const wrapper = mount(NotificationCenterList, {
			props: { items: [], loading: true },
		});
		expect(wrapper.findAll('[data-slot="skeleton"]').length).toBeGreaterThan(0);
	});

	it('should accept hasMore prop', () => {
		const wrapper = mount(NotificationCenterList, {
			props: { items: sampleItems, hasMore: true },
		});
		expect(wrapper.exists()).toBe(true);
	});
});
