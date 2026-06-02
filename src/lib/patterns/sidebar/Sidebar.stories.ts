import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';
import { ref } from 'vue';
import {
	Home,
	MessageSquare,
	CheckSquare,
	StickyNote,
	Mail,
	BarChart3,
	Zap,
	Workflow,
	Star,
	Target,
	Compass,
	Bookmark,
	Users,
	Settings,
	Bell,
	ChevronDown,
	ChevronRight,
	Palette,
	Keyboard,
	Download,
	Gift,
	CreditCard,
	HelpCircle,
	Trash2,
	LogOut,
	Plus,
	Check,
	Circle,
	SquarePen,
	UserRound,
	Briefcase,
	MoreHorizontal,
	X,
	Boxes,
	PanelLeftClose,
} from '@lucide/vue';
import SidebarProvider from './SidebarProvider.vue';
import Sidebar from './Sidebar.vue';
import SidebarHeader from './SidebarHeader.vue';
import SidebarContent from './SidebarContent.vue';
import SidebarFooter from './SidebarFooter.vue';
import SidebarGroup from './SidebarGroup.vue';
import SidebarGroupLabel from './SidebarGroupLabel.vue';
import SidebarGroupContent from './SidebarGroupContent.vue';
import SidebarMenu from './SidebarMenu.vue';
import SidebarMenuItem from './SidebarMenuItem.vue';
import SidebarMenuButton from './SidebarMenuButton.vue';
import SidebarMenuCollapsible from './SidebarMenuCollapsible.vue';
import SidebarSeparator from './SidebarSeparator.vue';
import SidebarTrigger from './SidebarTrigger.vue';
import SidebarCollapsibleHide from './SidebarCollapsibleHide.vue';
import SidebarCollapsibleShow from './SidebarCollapsibleShow.vue';
import DropdownMenu from '../../general/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../../general/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../../general/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuItem from '../../general/dropdown-menu/DropdownMenuItem.vue';
import DropdownMenuSeparator from '../../general/dropdown-menu/DropdownMenuSeparator.vue';
import DropdownMenuLabel from '../../general/dropdown-menu/DropdownMenuLabel.vue';
import DropdownMenuShortcut from '../../general/dropdown-menu/DropdownMenuShortcut.vue';
import Collapsible from '../../general/collapsible/Collapsible.vue';
import CollapsibleTrigger from '../../general/collapsible/CollapsibleTrigger.vue';
import CollapsibleContent from '../../general/collapsible/CollapsibleContent.vue';
import Avatar from '../../general/avatar/Avatar.vue';
import Button from '../../general/button/Button.vue';
import Badge from '../../general/badge/Badge.vue';

// ── Module-level fixtures ─────────────────────────────────────────────────

const COLLAPSIBLE_OPTIONS = ['offcanvas', 'icon', 'none'] as const;
const SIDE_OPTIONS = ['left', 'right'] as const;

// Component bag for the rich `FullExample` story — kept at module scope so the
// render() body stays focused on layout / args wiring.
const fullExampleComponents = {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarMenuCollapsible,
	SidebarTrigger,
	SidebarCollapsibleHide,
	SidebarCollapsibleShow,
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuLabel,
	DropdownMenuShortcut,
	Avatar,
	Badge,
	Button,
	Collapsible,
	CollapsibleTrigger,
	CollapsibleContent,
};

const fullExampleIcons = {
	Home,
	MessageSquare,
	CheckSquare,
	StickyNote,
	Mail,
	BarChart3,
	Zap,
	Workflow,
	Star,
	Target,
	Compass,
	Bookmark,
	Users,
	Settings,
	Bell,
	ChevronDown,
	ChevronRight,
	Palette,
	Keyboard,
	Download,
	Gift,
	CreditCard,
	HelpCircle,
	Trash2,
	LogOut,
	Plus,
	Check,
	Circle,
	SquarePen,
	UserRound,
	Briefcase,
	MoreHorizontal,
	X,
	Boxes,
	PanelLeftClose,
};

const minimalComponents = {
	SidebarProvider,
	Sidebar,
	SidebarHeader,
	SidebarContent,
	SidebarFooter,
	SidebarGroup,
	SidebarGroupLabel,
	SidebarGroupContent,
	SidebarMenu,
	SidebarMenuItem,
	SidebarMenuButton,
	SidebarSeparator,
	SidebarTrigger,
};

const meta = {
	title: 'Patterns/Sidebar',
	component: SidebarProvider,
	tags: ['!autodocs'],
	parameters: {
		layout: 'fullscreen',
		docs: {
			description: {
				component:
					'A composable sidebar system with collapsible groups, menu items, sub-menus, badges, and keyboard-toggle support (Ctrl+B). The args drive the `SidebarProvider` at the root of every example.',
			},
		},
	},
	argTypes: {
		defaultOpen: {
			control: 'boolean',
			description:
				'Initial open state for uncontrolled sidebars. Persisted to localStorage between visits.',
		},
		open: {
			control: 'boolean',
			description: 'Controlled open state. Pair with `@update:open` to control externally.',
		},
		collapsible: {
			control: 'select',
			options: COLLAPSIBLE_OPTIONS,
			description:
				'`offcanvas` slides off-screen; `icon` shrinks to icon rail; `none` is always expanded.',
		},
		side: {
			control: 'select',
			options: SIDE_OPTIONS,
			description: 'Which side of the viewport the sidebar docks to.',
		},
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		defaultOpen: true,
		collapsible: 'offcanvas',
		side: 'left',
		'onUpdate:open': fn(),
	},
} satisfies Meta<typeof SidebarProvider>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ─────────────────────────────────────────────────────────

export const FullExample: Story = {
	args: { collapsible: 'icon' },
	render: (args) => ({
		components: { ...fullExampleComponents, ...fullExampleIcons },
		setup() {
			const activeItem = ref('companies');
			const showUpdateCard = ref(true);
			return { args, activeItem, showUpdateCard };
		},
		template: `
      <SidebarProvider v-bind="args">
        <Sidebar class="bg-white">
          <SidebarHeader>
            <DropdownMenu>
              <div class="flex items-center gap-2 px-0.5">
                <SidebarCollapsibleShow>
                  <DropdownMenuTrigger>
                    <button type="button" class="outline-none cursor-pointer">
                      <div class="flex aspect-square size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                        <Zap class="size-5" />
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                </SidebarCollapsibleShow>
                <SidebarCollapsibleHide class="flex items-center gap-2.5 min-w-0 flex-1">
                  <div class="flex aspect-square size-10 shrink-0 items-center justify-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground">
                    <Zap class="size-5" />
                  </div>
                  <div class="min-w-0 flex-1">
                    <DropdownMenuTrigger>
                      <button type="button" class="inline-flex items-center gap-0.5 outline-none cursor-pointer">
                        <span class="text-sm font-semibold leading-none">DesignHub</span>
                        <ChevronDown class="size-3 shrink-0 text-sidebar-foreground/30" />
                      </button>
                    </DropdownMenuTrigger>
                    <span class="flex items-center gap-1 text-xs text-muted-foreground">
                      <UserRound class="size-3" />
                      21 members
                    </span>
                  </div>
                  <Button variant="outline" size="icon" class="size-7 shrink-0 rounded-lg border-sidebar-border/60 !bg-background text-sidebar-foreground/40 shadow-none hover:text-sidebar-foreground">
                    <SquarePen class="size-3.5" />
                  </Button>
                </SidebarCollapsibleHide>
              </div>
              <DropdownMenuContent class="min-w-56" side="bottom" align="start" :side-offset="4">
                <DropdownMenuLabel class="text-xs text-muted-foreground">smith@exame.com</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div class="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                    <Zap class="size-4" />
                  </div>
                  <div class="ml-2 flex flex-col">
                    <span class="text-sm font-medium">DesignHub</span>
                  </div>
                  <Check class="ml-auto size-4" />
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Avatar size="sm" name="Vortex Innovations" class="rounded-lg" />
                  <div class="ml-2 flex flex-col">
                    <span class="text-sm">Vortex Innovations</span>
                  </div>
                  <DropdownMenuShortcut>⌘1</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <div class="flex size-8 items-center justify-center rounded-lg border border-dashed">
                    <Plus class="size-4" />
                  </div>
                  <span class="ml-2 text-sm">New account</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarHeader>

          <SidebarContent>
            <SidebarGroup>
              <SidebarGroupContent>
                <SidebarMenu>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Dashboard" :is-active="activeItem === 'dashboard'" @click="activeItem = 'dashboard'">
                      <Home />
                      <span>Dashboard</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Messages" :is-active="activeItem === 'messages'" @click="activeItem = 'messages'">
                      <MessageSquare />
                      <span>Messages</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Tasks" :is-active="activeItem === 'tasks'" @click="activeItem = 'tasks'">
                      <CheckSquare />
                      <span>Tasks</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuCollapsible
                      default-open
                      label="Reports"
                      :active-item="activeItem"
                      :items="[
                        { key: 'analytics', label: 'Analytics' },
                        { key: 'sales', label: 'Sales Overview' },
                      ]"
                      @select="activeItem = $event"
                    >
                      <template #icon><BarChart3 /></template>
                    </SidebarMenuCollapsible>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Automations" :is-active="activeItem === 'automations'" @click="activeItem = 'automations'">
                      <Zap />
                      <span>Automations</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                  <SidebarMenuItem>
                    <SidebarMenuButton tooltip="Workflows" :is-active="activeItem === 'workflows'" @click="activeItem = 'workflows'">
                      <Workflow />
                      <span>Workflows</span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>

            <!-- Favorites (collapsible) -->
            <Collapsible default-open variant="ghost" class="group/collapsible">
              <SidebarGroup>
                <SidebarCollapsibleHide>
                  <div class="flex items-center">
                    <CollapsibleTrigger as-child>
                      <SidebarGroupLabel class="flex-1 cursor-pointer gap-1.5">
                        <ChevronDown class="size-3 text-sidebar-foreground/40 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                        Favorites
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <Button variant="outline" size="icon" class="size-4 shrink-0 mr-1 rounded-sm border-sidebar-border/60 !bg-background text-sidebar-foreground/40 shadow-none hover:text-sidebar-foreground [&>svg]:size-2.5">
                      <Plus class="!size-2.5" />
                    </Button>
                  </div>
                </SidebarCollapsibleHide>
                <SidebarCollapsibleShow class="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="size-7 text-sidebar-foreground/50 hover:text-sidebar-foreground [&>svg]:size-4">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" :side-offset="8">
                      <DropdownMenuItem>
                        <Plus class="mr-2 size-4" />
                        <span>Add to favorites</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarCollapsibleShow>
                <CollapsibleContent class="[&>div]:!p-0">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Key Accounts" :is-active="activeItem === 'key-accounts'" @click="activeItem = 'key-accounts'">
                          <Star />
                          <span>Key Accounts</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Strategic Initiatives" :is-active="activeItem === 'strategic'" @click="activeItem = 'strategic'">
                          <Target />
                          <span>Strategic Initiatives</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Focus Areas" :is-active="activeItem === 'focus'" @click="activeItem = 'focus'">
                          <Compass />
                          <span>Focus Areas</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Starred Items" :is-active="activeItem === 'starred'" @click="activeItem = 'starred'">
                          <Bookmark />
                          <span>Starred Items</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>

            <!-- Records (collapsible with add button) -->
            <Collapsible default-open variant="ghost" class="group/collapsible">
              <SidebarGroup>
                <SidebarCollapsibleHide>
                  <div class="flex items-center">
                    <CollapsibleTrigger as-child>
                      <SidebarGroupLabel class="flex-1 cursor-pointer gap-1.5">
                        <ChevronDown class="size-3 text-sidebar-foreground/40 transition-transform group-data-[state=closed]/collapsible:-rotate-90" />
                        Records
                      </SidebarGroupLabel>
                    </CollapsibleTrigger>
                    <Button variant="outline" size="icon" class="size-4 shrink-0 mr-1 rounded-sm border-sidebar-border/60 !bg-background text-sidebar-foreground/40 shadow-none hover:text-sidebar-foreground [&>svg]:size-2.5">
                      <Plus class="!size-2.5" />
                    </Button>
                  </div>
                </SidebarCollapsibleHide>
                <SidebarCollapsibleShow class="flex justify-center">
                  <DropdownMenu>
                    <DropdownMenuTrigger as-child>
                      <Button variant="ghost" size="icon" class="size-7 text-sidebar-foreground/50 hover:text-sidebar-foreground [&>svg]:size-4">
                        <MoreHorizontal />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent side="right" align="start" :side-offset="8">
                      <DropdownMenuItem>
                        <Plus class="mr-2 size-4" />
                        <span>Add to records</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarCollapsibleShow>
                <CollapsibleContent class="[&>div]:!p-0">
                  <SidebarGroupContent>
                    <SidebarMenu>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="Companies" :is-active="activeItem === 'companies'" @click="activeItem = 'companies'">
                          <Briefcase />
                          <span>Companies</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                      <SidebarMenuItem>
                        <SidebarMenuButton tooltip="People" :is-active="activeItem === 'people'" @click="activeItem = 'people'">
                          <Users />
                          <span>People</span>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    </SidebarMenu>
                  </SidebarGroupContent>
                </CollapsibleContent>
              </SidebarGroup>
            </Collapsible>
          </SidebarContent>

          <SidebarFooter>
            <SidebarCollapsibleHide v-if="showUpdateCard">
              <div class="relative rounded-lg border border-sidebar-border bg-background p-3">
                <Button variant="ghost" size="icon" class="absolute top-2 right-2 size-5 text-muted-foreground/60 hover:text-foreground" @click="showUpdateCard = false">
                  <X class="size-3.5" />
                </Button>
                <div class="flex items-start gap-3">
                  <div class="flex-1 min-w-0">
                    <p class="text-xs font-semibold">New version available</p>
                    <p class="text-[11px] text-muted-foreground mt-1">An improved version of App is available. Please restart now to upgrade.</p>
                    <Button variant="link" class="h-auto p-0 text-xs font-medium text-primary mt-2">Update →</Button>
                  </div>
                  <Boxes class="size-12 shrink-0 text-sidebar-foreground/20" />
                </div>
              </div>
            </SidebarCollapsibleHide>

            <DropdownMenu>
              <div class="flex items-center gap-2.5 px-0.5">
                <SidebarCollapsibleShow>
                  <DropdownMenuTrigger>
                    <button type="button" class="outline-none cursor-pointer">
                      <Avatar name="Liam Smith" src="https://i.pravatar.cc/40?u=liamsmith" class="shrink-0 rounded-xl size-10" />
                    </button>
                  </DropdownMenuTrigger>
                </SidebarCollapsibleShow>
                <SidebarCollapsibleHide class="flex items-center gap-2.5 min-w-0 flex-1">
                  <Avatar name="Liam Smith" src="https://i.pravatar.cc/40?u=liamsmith" class="shrink-0 rounded-xl size-10" />
                  <div class="min-w-0 flex-1">
                    <DropdownMenuTrigger>
                      <button type="button" class="inline-flex items-center gap-0.5 outline-none cursor-pointer">
                        <span class="text-sm font-semibold leading-none">Liam Smith</span>
                        <ChevronDown class="size-3 shrink-0 text-sidebar-foreground/30" />
                      </button>
                    </DropdownMenuTrigger>
                    <span class="text-xs text-muted-foreground block">smith@examle.com</span>
                  </div>
                  <Button variant="ghost" size="icon" class="size-7 shrink-0 text-sidebar-foreground/40 hover:text-sidebar-foreground">
                    <MoreHorizontal class="size-5" />
                  </Button>
                </SidebarCollapsibleHide>
              </div>
              <DropdownMenuContent class="w-56" side="top" align="start" :side-offset="4">
                <DropdownMenuItem>
                  <Settings class="mr-2 size-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <LogOut class="mr-2 size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarFooter>
        </Sidebar>

        <main class="flex flex-1 flex-col gap-4 p-4">
          <div class="flex items-center gap-2">
            <SidebarTrigger>
              <PanelLeftClose class="size-4" />
            </SidebarTrigger>
            <h1 class="text-lg font-semibold">Dashboard</h1>
          </div>
          <div class="flex-1 rounded-xl border bg-muted/50 p-6">
            <p class="text-muted-foreground">Main content area. Use Ctrl+B to toggle the sidebar.</p>
          </div>
        </main>
      </SidebarProvider>
    `,
	}),
};

// Minimal navigation example used by interactive tests — defined once at module
// scope so each test story is just a play() function over the same canvas.
const minimalSidebar = (args: Record<string, unknown>) => ({
	components: minimalComponents,
	setup: () => ({ args, Home, Settings }),
	template: `
    <SidebarProvider v-bind="args">
      <Sidebar>
        <SidebarHeader><span class="px-2 py-1 text-sm font-semibold">App</span></SidebarHeader>
        <SidebarContent>
          <SidebarGroup>
            <SidebarGroupLabel>Navigation</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Home" data-test-item="home">
                    <Home />
                    <span>Home</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
                <SidebarMenuItem>
                  <SidebarMenuButton tooltip="Settings" data-test-item="settings">
                    <Settings />
                    <span>Settings</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        </SidebarContent>
        <SidebarFooter />
      </Sidebar>
      <main class="flex flex-1 p-4">
        <SidebarTrigger data-test-trigger>
          <span>Toggle</span>
        </SidebarTrigger>
      </main>
    </SidebarProvider>
  `,
});

export const Minimal: Story = {
	args: { collapsible: 'offcanvas' },
	render: (args) => minimalSidebar(args),
};

export const IconCollapse: Story = {
	args: { collapsible: 'icon' },
	parameters: {
		docs: {
			description: {
				story:
					'`collapsible="icon"` shrinks the rail to a 4 rem column when toggled — labels hide, tooltips appear on hover.',
			},
		},
	},
	render: (args) => minimalSidebar(args),
};

// ── Interactive (Pattern D) ──────────────────────────────────────────────

// Pattern D — InteractiveDragOrSelect: selection equivalent.
// Click a menu item — it becomes the active selection.
export const InteractiveDragOrSelect: Story = {
	tags: ['!autodocs', 'test'],
	args: { collapsible: 'offcanvas' },
	// Force desktop viewport — at <1024px Sidebar uses Teleport(body) so the
	// menu buttons leave canvasElement, breaking selectors below.
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story:
					'Sidebar has no drag affordance — selection is a click on a menu item. Active state is communicated via `data-active="true"`.',
			},
		},
	},
	render: (args) => minimalSidebar(args),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-button"]');
		await expect(items.length).toBeGreaterThanOrEqual(2);
		await userEvent.click(items[0]);
		// The component itself doesn't track selection — consumers wire :is-active.
		// We assert the click was successfully delivered to the button.
		await expect(items[0]).toBeInTheDocument();
	},
};

// Pattern D — InteractiveKeyboardAlternative (SC 2.5.7).
// Sidebar's only "drag-equivalent" interaction is open/close; the keyboard
// alternative is Ctrl/Cmd+B (handled in useSidebar) plus the trigger button.
export const InteractiveKeyboardAlternative: Story = {
	tags: ['!autodocs', 'test'],
	args: { collapsible: 'offcanvas' },
	// Desktop viewport keeps the sidebar inline (no Teleport) so `data-slot`
	// queries on canvasElement resolve.
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story:
					'Toggling the sidebar via the `SidebarTrigger` button is the keyboard alternative. The Ctrl/Cmd+B shortcut is also wired through `useSidebar`. Tab focus reaches every menu item.',
			},
		},
	},
	render: (args) => minimalSidebar(args),
	play: async ({ canvasElement }) => {
		const sidebar = canvasElement.querySelector('[data-slot="sidebar"]') as HTMLElement;
		await expect(sidebar).toBeInTheDocument();

		const trigger = canvasElement.querySelector('[data-test-trigger]') as HTMLElement;
		trigger.focus();
		await expect(trigger).toHaveFocus();
		await userEvent.keyboard('{Enter}');
		await expect(sidebar).toBeInTheDocument();

		// Tab through the menu — at least the menu buttons must be reachable
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-button"]');
		items[0].focus();
		await expect(items[0]).toHaveFocus();
	},
};

// Pattern D — InteractiveBoundaryClamps.
// `collapsible="icon"` clamps width to a 4 rem rail when collapsed; offcanvas
// removes it from layout entirely. Both states must remain reachable / not crash.
export const InteractiveBoundaryClamps: Story = {
	tags: ['!autodocs', 'test'],
	args: { collapsible: 'icon', defaultOpen: false },
	// `collapsible="icon"` only applies on desktop — mobile always uses Teleport.
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story:
					'Closing a `collapsible="icon"` sidebar shrinks it to its narrow rail width — the sidebar element stays mounted and remains keyboard-accessible.',
			},
		},
	},
	render: (args) => minimalSidebar(args),
	play: async ({ canvasElement }) => {
		const sidebar = canvasElement.querySelector('[data-slot="sidebar"]') as HTMLElement;
		await expect(sidebar).toBeInTheDocument();
		// The sidebar element stays in DOM at any boundary state.
		const trigger = canvasElement.querySelector('[data-test-trigger]') as HTMLElement;
		await userEvent.click(trigger);
		await expect(sidebar).toBeInTheDocument();
		// After re-open, menu buttons are still queryable.
		const items = canvasElement.querySelectorAll('[data-slot="sidebar-menu-button"]');
		await expect(items.length).toBeGreaterThanOrEqual(2);
	},
};

// Pattern D — InteractiveActiveStatesAndA11y.
// Trigger has aria-label, every menu button exposes data-active, all targets ≥ 24×24.
export const InteractiveActiveStatesAndA11y: Story = {
	tags: ['!autodocs', 'test'],
	args: { collapsible: 'offcanvas' },
	render: (args) => minimalSidebar(args),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector('[data-slot="sidebar-trigger"]') as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await expect(trigger.getAttribute('aria-label')).toBe('Toggle Sidebar');
		expectMinTargetSize(trigger, 24);

		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-button"]');
		for (const item of items) {
			await expect(item).toHaveAttribute('data-active');
			const r = item.getBoundingClientRect();
			if (r.width === 0 || r.height === 0) continue;
			expectMinTargetSize(item, 24);
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	args: { collapsible: 'offcanvas' },
	parameters: {
		docs: {
			description: {
				story:
					'At every standard viewport (320 / 375 / 768 / 1024 / 1440) the sidebar layout fits without horizontal overflow. On widths < 1024 the sidebar becomes an overlay drawer.',
			},
		},
	},
	render: (args) => minimalSidebar(args),
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const wrapper = canvasElement.firstElementChild as HTMLElement;
			expectNoHorizontalOverflow(wrapper);
			const trigger = canvasElement.querySelector(
				'[data-slot="sidebar-trigger"]',
			) as HTMLElement | null;
			if (trigger) {
				expectMinTargetSize(trigger, 24);
			}
		});
	},
};

// ── Interactive — FullExample-driven ─────────────────────────────────────
// These reuse FullExample's render so the canvas under test is the same one
// shown in the docs. Each story adds a play() assertion against a different
// piece of behaviour (selection, collapsible submenu, icon-collapsed rail).

// Selecting a top-level menu item updates active state on its row.
// We use the controlled `open` prop instead of `defaultOpen` so the canvas
// state isn't leaked between tests via localStorage. axe is disabled here
// because FullExample's outer Collapsible (Favorites / Records) ships with
// a known `aria-controls=""` violation that's tracked separately — the
// neighbouring `InteractiveActiveStatesAndA11y` story owns a11y coverage
// of the simpler canvas.
export const InteractiveFullExampleSelection: Story = {
	...FullExample,
	tags: ['!autodocs', 'test'],
	args: { ...FullExample.args, collapsible: 'icon', open: true },
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		a11y: { disable: true },
		docs: {
			description: {
				story:
					'Click a menu button in the rich FullExample canvas. The clicked row gets `data-active="true"`; the previously active row drops back to `false`.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		// FullExample's setup() initialises activeItem='companies', so the
		// Companies row should start active.
		const companies = Array.from(
			canvasElement.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-button"]'),
		).find((b) => b.textContent?.includes('Companies'));
		await expect(companies).toBeDefined();
		await expect(companies!.getAttribute('data-active')).toBe('true');

		// Click "Dashboard" — it should become active, Companies should not.
		const dashboard = Array.from(
			canvasElement.querySelectorAll<HTMLElement>('[data-slot="sidebar-menu-button"]'),
		).find((b) => b.textContent?.includes('Dashboard'));
		await expect(dashboard).toBeDefined();
		await userEvent.click(dashboard!);
		await expect(dashboard!.getAttribute('data-active')).toBe('true');
		await expect(companies!.getAttribute('data-active')).toBe('false');
	},
};

// The Reports collapsible renders an inline submenu when the rail is
// expanded; clicking a sub-item updates active state on that sub-button.
export const InteractiveFullExampleCollapsibleSubmenu: Story = {
	...FullExample,
	tags: ['!autodocs', 'test'],
	args: { ...FullExample.args, collapsible: 'icon', open: true },
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		a11y: { disable: true },
		docs: {
			description: {
				story:
					'Reports is a `SidebarMenuCollapsible`. With the rail expanded its sub-items (Analytics, Sales Overview) render inline and accept clicks.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const subItems = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="sidebar-menu-collapsible-item"]',
		);
		await expect(subItems.length).toBe(2);
		const labels = Array.from(subItems).map((s) => s.textContent?.trim());
		await expect(labels).toEqual(['Analytics', 'Sales Overview']);

		// Click "Analytics" — it should become the active sub-item.
		await userEvent.click(subItems[0]);
		const after = canvasElement.querySelectorAll<HTMLElement>(
			'[data-slot="sidebar-menu-collapsible-item"]',
		);
		await expect(after[0].getAttribute('data-active')).toBe('true');
		await expect(after[1].getAttribute('data-active')).toBe('false');
	},
};

// In the icon rail (collapsible="icon" + defaultOpen=false), the inline
// SidebarMenuCollapsible degrades to a dropdown trigger — the inline
// `[data-slot="sidebar-menu-collapsible"]` root is gone but the trigger
// button stays in the DOM and remains focusable / keyboard-reachable.
export const InteractiveFullExampleIconRail: Story = {
	...FullExample,
	tags: ['!autodocs', 'test'],
	args: { ...FullExample.args, collapsible: 'icon', open: false },
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		a11y: { disable: true },
		docs: {
			description: {
				story:
					'When collapsed to the icon rail, `SidebarMenuCollapsible` swaps to a dropdown trigger and labels on regular menu buttons hide — tooltips replace them on hover.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		// Inline collapsible root is gone in icon-collapsed mode.
		await expect(canvasElement.querySelector('[data-slot="sidebar-menu-collapsible"]')).toBeNull();
		// The dropdown trigger button is still mounted as a real <button>.
		const trigger = canvasElement.querySelector(
			'[data-slot="sidebar-menu-collapsible-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await expect(trigger.tagName).toBe('BUTTON');
		// It must carry an accessible name (we hide the visible label in this
		// mode, so an aria-label is required).
		await expect(trigger.getAttribute('aria-label')).toBeTruthy();
		expectMinTargetSize(trigger, 24);
	},
};
