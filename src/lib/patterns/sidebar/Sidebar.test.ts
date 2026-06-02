import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import SidebarProvider from './SidebarProvider.vue';
import Sidebar from './Sidebar.vue';
import SidebarHeader from './SidebarHeader.vue';
import SidebarContent from './SidebarContent.vue';
import SidebarFooter from './SidebarFooter.vue';
import SidebarGroup from './SidebarGroup.vue';
import SidebarGroupLabel from './SidebarGroupLabel.vue';
import SidebarMenu from './SidebarMenu.vue';
import SidebarMenuItem from './SidebarMenuItem.vue';
import SidebarMenuButton from './SidebarMenuButton.vue';
import SidebarSeparator from './SidebarSeparator.vue';
import SidebarTrigger from './SidebarTrigger.vue';
import SidebarCollapsibleHide from './SidebarCollapsibleHide.vue';
import SidebarCollapsibleShow from './SidebarCollapsibleShow.vue';
import SidebarMenuCollapsible from './SidebarMenuCollapsible.vue';
import SidebarMenuBadge from './SidebarMenuBadge.vue';
import SidebarMenuAction from './SidebarMenuAction.vue';
import SidebarMenuSub from './SidebarMenuSub.vue';
import SidebarMenuSubItem from './SidebarMenuSubItem.vue';
import SidebarMenuSubButton from './SidebarMenuSubButton.vue';
import SidebarRail from './SidebarRail.vue';
import SidebarInput from './SidebarInput.vue';
import SidebarGroupContent from './SidebarGroupContent.vue';

// Helper to mount within a SidebarProvider context
function mountWithProvider(
	component: any,
	props: Record<string, any> = {},
	providerProps: Record<string, any> = {},
) {
	const wrapper = mount(SidebarProvider, {
		props: { collapsible: 'icon', ...providerProps },
		slots: {
			default: () => h(component, props),
		},
	});
	return wrapper;
}

// Reset persisted sidebar open/close state before every test — without this,
// tests that toggle the sidebar (e.g. SidebarRail) leak `open=false` into
// later tests that rely on `defaultOpen: true`.
beforeEach(() => {
	localStorage.clear();
});

describe('SidebarProvider', () => {
	it('renders with default props', () => {
		const wrapper = mount(SidebarProvider, {
			slots: { default: 'content' },
		});
		expect(wrapper.text()).toContain('content');
	});

	it('sets data-sidebar-state attribute', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: true },
			slots: { default: 'content' },
		});
		expect(wrapper.find('[data-sidebar-state]').attributes('data-sidebar-state')).toBe('expanded');
	});

	it('defaults to expanded state', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: true },
			slots: { default: 'content' },
		});
		expect(wrapper.find('[data-sidebar-state="expanded"]').exists()).toBe(true);
	});

	it('can start collapsed', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: false },
			slots: { default: 'content' },
		});
		expect(wrapper.find('[data-sidebar-state="collapsed"]').exists()).toBe(true);
	});
});

describe('SidebarHeader', () => {
	it('renders slot content', () => {
		const wrapper = mountWithProvider(SidebarHeader, {}, {});
		// The header should be rendered inside the provider
		expect(wrapper.find('[data-slot="sidebar-header"]').exists()).toBe(true);
	});
});

describe('SidebarContent', () => {
	it('renders with data-slot', () => {
		const wrapper = mountWithProvider(SidebarContent);
		expect(wrapper.find('[data-slot="sidebar-content"]').exists()).toBe(true);
	});
});

describe('SidebarFooter', () => {
	it('renders with data-slot', () => {
		const wrapper = mountWithProvider(SidebarFooter);
		expect(wrapper.find('[data-slot="sidebar-footer"]').exists()).toBe(true);
	});
});

describe('SidebarGroup', () => {
	it('renders with data-slot', () => {
		const wrapper = mountWithProvider(SidebarGroup);
		expect(wrapper.find('[data-slot="sidebar-group"]').exists()).toBe(true);
	});
});

describe('SidebarMenu', () => {
	it('renders as ul element', () => {
		const wrapper = mountWithProvider(SidebarMenu);
		expect(wrapper.find('ul[data-slot="sidebar-menu"]').exists()).toBe(true);
	});
});

describe('SidebarMenuItem', () => {
	it('renders as li element', () => {
		const wrapper = mountWithProvider(SidebarMenuItem);
		expect(wrapper.find('li[data-slot="sidebar-menu-item"]').exists()).toBe(true);
	});
});

describe('SidebarMenuButton', () => {
	it('renders as button by default', () => {
		const wrapper = mountWithProvider(SidebarMenuButton);
		expect(wrapper.find('button[data-slot="sidebar-menu-button"]').exists()).toBe(true);
	});

	it('sets data-active attribute', () => {
		const wrapper = mountWithProvider(SidebarMenuButton, { isActive: true });
		expect(wrapper.find('[data-active="true"]').exists()).toBe(true);
	});

	it('sets data-size attribute', () => {
		const wrapper = mountWithProvider(SidebarMenuButton, { size: 'lg' });
		expect(wrapper.find('[data-size="lg"]').exists()).toBe(true);
	});

	it('has cursor-pointer class', () => {
		const wrapper = mountWithProvider(SidebarMenuButton);
		const button = wrapper.find('[data-slot="sidebar-menu-button"]');
		expect(button.classes()).toContain('cursor-pointer');
	});
});

describe('SidebarTrigger', () => {
	it('renders a button', () => {
		const wrapper = mountWithProvider(SidebarTrigger);
		expect(wrapper.find('[data-slot="sidebar-trigger"]').exists()).toBe(true);
	});

	it('has aria-label', () => {
		const wrapper = mountWithProvider(SidebarTrigger);
		const button = wrapper.find('[data-slot="sidebar-trigger"]');
		expect(button.attributes('aria-label')).toMatch(/navigation/i);
	});
});

describe('SidebarCollapsibleHide', () => {
	it('renders content when expanded', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: true, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarCollapsibleHide, {}, { default: () => 'visible content' }),
						},
					),
			},
		});
		expect(wrapper.text()).toContain('visible content');
	});

	it('hides content when collapsed', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: false, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarCollapsibleHide, {}, { default: () => 'hidden content' }),
						},
					),
			},
		});
		expect(wrapper.text()).not.toContain('hidden content');
	});
});

describe('SidebarCollapsibleShow', () => {
	it('hides content when expanded', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: true, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarCollapsibleShow, {}, { default: () => 'collapsed only' }),
						},
					),
			},
		});
		expect(wrapper.text()).not.toContain('collapsed only');
	});

	it('renders content when collapsed', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: false, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarCollapsibleShow, {}, { default: () => 'collapsed only' }),
						},
					),
			},
		});
		expect(wrapper.text()).toContain('collapsed only');
	});
});

describe('SidebarGroupLabel', () => {
	it('renders slot content when expanded', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: true, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarGroupLabel, {}, { default: () => 'Favorites' }),
						},
					),
			},
		});
		expect(wrapper.text()).toContain('Favorites');
	});

	it('renders ellipsis icon when collapsed', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: false, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarGroupLabel, {}, { default: () => 'Favorites' }),
						},
					),
			},
		});
		expect(wrapper.text()).not.toContain('Favorites');
		expect(wrapper.find('svg').exists()).toBe(true); // Ellipsis icon
	});
});

describe('SidebarSeparator', () => {
	it('renders when expanded', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: true, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarSeparator),
						},
					),
			},
		});
		expect(wrapper.find('[data-slot="sidebar-separator"]').exists()).toBe(true);
	});

	it('hides when collapsed', () => {
		const wrapper = mount(SidebarProvider, {
			props: { defaultOpen: false, collapsible: 'icon' },
			slots: {
				default: () =>
					h(
						Sidebar,
						{},
						{
							default: () => h(SidebarSeparator),
						},
					),
			},
		});
		expect(wrapper.find('[data-slot="sidebar-separator"]').exists()).toBe(false);
	});
});

// Helper: mount a component inside <SidebarProvider><Sidebar>...</Sidebar></SidebarProvider>.
// Some components (SidebarMenuCollapsible, SidebarRail) require the provider context
// AND a Sidebar ancestor for state-driven branches to render correctly.
function mountInSidebar(vnodeFactory: () => any, providerProps: Record<string, any> = {}) {
	return mount(SidebarProvider, {
		props: { collapsible: 'icon', defaultOpen: true, ...providerProps },
		slots: {
			default: () => h(Sidebar, {}, { default: vnodeFactory }),
		},
	});
}

describe('SidebarGroupContent', () => {
	it('renders with data-slot', () => {
		const wrapper = mountWithProvider(SidebarGroupContent);
		expect(wrapper.find('[data-slot="sidebar-group-content"]').exists()).toBe(true);
	});
});

describe('SidebarMenuBadge', () => {
	it('renders with data-slot and slot content', () => {
		const wrapper = mount(SidebarMenuBadge, {
			slots: { default: '12' },
		});
		const el = wrapper.find('[data-slot="sidebar-menu-badge"]');
		expect(el.exists()).toBe(true);
		expect(el.text()).toBe('12');
	});

	it('merges custom class', () => {
		const wrapper = mount(SidebarMenuBadge, {
			props: { class: 'custom-badge-class' },
		});
		expect(wrapper.find('[data-slot="sidebar-menu-badge"]').classes()).toContain(
			'custom-badge-class',
		);
	});
});

describe('SidebarMenuAction', () => {
	it('renders as a button by default', () => {
		const wrapper = mount(SidebarMenuAction, {
			slots: { default: 'x' },
		});
		expect(wrapper.find('button[data-slot="sidebar-menu-action"]').exists()).toBe(true);
	});

	it('honours showOnHover prop', () => {
		const wrapper = mount(SidebarMenuAction, {
			props: { showOnHover: true },
		});
		// The variant adds opacity-0/group-hover classes when showOnHover is true.
		const cls = wrapper.find('[data-slot="sidebar-menu-action"]').classes().join(' ');
		expect(cls).toMatch(/opacity-0/);
	});

	it('renders as child when asChild is true', () => {
		const wrapper = mount(SidebarMenuAction, {
			props: { asChild: true },
			slots: { default: () => h('a', { href: '#' }, 'go') },
		});
		// With as-child, no <button> wrapper; the slot's <a> carries the data-slot.
		expect(wrapper.find('button[data-slot="sidebar-menu-action"]').exists()).toBe(false);
		expect(wrapper.find('a[data-slot="sidebar-menu-action"]').exists()).toBe(true);
	});
});

describe('SidebarMenuSub', () => {
	it('renders as ul with data-slot when expanded', () => {
		const wrapper = mountInSidebar(() => h(SidebarMenuSub), {
			defaultOpen: true,
			collapsible: 'icon',
		});
		const el = wrapper.find('ul[data-slot="sidebar-menu-sub"]');
		expect(el.exists()).toBe(true);
		expect(el.classes()).not.toContain('hidden');
	});

	it('is hidden when icon-collapsed', () => {
		const wrapper = mountInSidebar(() => h(SidebarMenuSub), {
			defaultOpen: false,
			collapsible: 'icon',
		});
		expect(wrapper.find('ul[data-slot="sidebar-menu-sub"]').classes()).toContain('hidden');
	});
});

describe('SidebarMenuSubItem', () => {
	it('renders as li with data-slot', () => {
		const wrapper = mount(SidebarMenuSubItem);
		expect(wrapper.find('li[data-slot="sidebar-menu-sub-item"]').exists()).toBe(true);
	});
});

describe('SidebarMenuSubButton', () => {
	it('renders as anchor by default', () => {
		const wrapper = mountWithProvider(SidebarMenuSubButton);
		expect(wrapper.find('a[data-slot="sidebar-menu-sub-button"]').exists()).toBe(true);
	});

	it('reflects isActive via data-active', () => {
		const wrapper = mountWithProvider(SidebarMenuSubButton, { isActive: true });
		expect(wrapper.find('[data-slot="sidebar-menu-sub-button"]').attributes('data-active')).toBe(
			'true',
		);
	});

	it('reflects size via data-size', () => {
		const wrapper = mountWithProvider(SidebarMenuSubButton, { size: 'sm' });
		expect(wrapper.find('[data-slot="sidebar-menu-sub-button"]').attributes('data-size')).toBe(
			'sm',
		);
	});
});

describe('SidebarRail', () => {
	it('renders a button with toggle aria-label', () => {
		const wrapper = mountInSidebar(() => h(SidebarRail));
		const btn = wrapper.find('[data-slot="sidebar-rail"]');
		expect(btn.exists()).toBe(true);
		expect(btn.attributes('aria-label')).toMatch(/toggle/i);
		expect(btn.attributes('tabindex')).toBe('-1');
	});

	it('toggles sidebar state on click', async () => {
		const wrapper = mountInSidebar(() => h(SidebarRail), {
			defaultOpen: true,
			collapsible: 'icon',
		});
		expect(wrapper.find('[data-sidebar-state="expanded"]').exists()).toBe(true);
		await wrapper.find('[data-slot="sidebar-rail"]').trigger('click');
		expect(wrapper.find('[data-sidebar-state="collapsed"]').exists()).toBe(true);
	});
});

describe('SidebarInput', () => {
	it('renders with data-slot and forwards attrs', () => {
		const wrapper = mount(SidebarInput, {
			attrs: { placeholder: 'Search…' },
		});
		const el = wrapper.find('[data-slot="sidebar-input"]');
		expect(el.exists()).toBe(true);
		expect(el.attributes('data-sidebar')).toBe('input');
	});
});

describe('SidebarMenuCollapsible', () => {
	const items = [
		{ key: 'a', label: 'Item A' },
		{ key: 'b', label: 'Item B' },
	];

	it('renders inline submenu trigger when expanded', () => {
		const wrapper = mountInSidebar(
			() => h(SidebarMenuCollapsible, { items, label: 'Reports', defaultOpen: true }),
			{ defaultOpen: true, collapsible: 'icon' },
		);
		const trigger = wrapper.find('[data-slot="sidebar-menu-collapsible-trigger"]');
		expect(trigger.exists()).toBe(true);
		// Expanded mode: trigger is a SidebarMenuButton (acts as a button) and shows the label.
		expect(wrapper.text()).toContain('Reports');
	});

	it('renders submenu items when expanded and open', () => {
		const wrapper = mountInSidebar(
			() => h(SidebarMenuCollapsible, { items, label: 'Reports', defaultOpen: true }),
			{ defaultOpen: true, collapsible: 'icon' },
		);
		expect(wrapper.text()).toContain('Item A');
		expect(wrapper.text()).toContain('Item B');
	});

	it('marks the active sub-item via data-active', () => {
		const wrapper = mountInSidebar(
			() =>
				h(SidebarMenuCollapsible, {
					items,
					label: 'Reports',
					defaultOpen: true,
					activeItem: 'b',
				}),
			{ defaultOpen: true, collapsible: 'icon' },
		);
		const subButtons = wrapper.findAll('[data-slot="sidebar-menu-collapsible-item"]');
		expect(subButtons.length).toBe(2);
		expect(subButtons[0].attributes('data-active')).toBe('false');
		expect(subButtons[1].attributes('data-active')).toBe('true');
	});

	it('emits select when a sub-item is clicked', async () => {
		let selected: string | undefined;
		const wrapper = mountInSidebar(
			() =>
				h(SidebarMenuCollapsible, {
					items,
					label: 'Reports',
					defaultOpen: true,
					onSelect: (key: string) => (selected = key),
				}),
			{ defaultOpen: true, collapsible: 'icon' },
		);
		const subButtons = wrapper.findAll('[data-slot="sidebar-menu-collapsible-item"]');
		await subButtons[0].trigger('click');
		expect(selected).toBe('a');
	});

	it('switches to dropdown trigger when icon-collapsed', () => {
		const wrapper = mountInSidebar(() => h(SidebarMenuCollapsible, { items, label: 'Reports' }), {
			defaultOpen: false,
			collapsible: 'icon',
		});
		// In icon-collapsed mode the inline submenu (CollapsibleRoot) is replaced
		// by a DropdownMenu trigger; the inline data-slot is no longer present.
		expect(wrapper.find('[data-slot="sidebar-menu-collapsible"]').exists()).toBe(false);
		// The dropdown trigger button is still rendered inline.
		expect(wrapper.find('[data-slot="sidebar-menu-collapsible-trigger"]').exists()).toBe(true);
		// The label is hidden (only the icon slot is rendered in collapsed mode).
		expect(wrapper.text()).not.toContain('Reports');
	});

	it('does NOT collapse to dropdown when collapsible mode is "offcanvas"', () => {
		const wrapper = mountInSidebar(
			() => h(SidebarMenuCollapsible, { items, label: 'Reports', defaultOpen: true }),
			{ defaultOpen: false, collapsible: 'offcanvas' },
		);
		// offcanvas mode keeps inline submenu structure regardless of open state.
		expect(wrapper.text()).toContain('Reports');
	});
});
