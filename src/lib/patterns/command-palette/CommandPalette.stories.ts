import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { computed, ref } from 'vue';
import {
	BarChart2,
	CalendarDays,
	CalendarPlus,
	CalendarX2,
	ChartNoAxesCombined,
	Inbox,
	Repeat2,
	Settings,
	UserPlus,
	Users,
} from '@lucide/vue';
import CommandPalette from './CommandPalette.vue';
import CommandPaletteInput from './CommandPaletteInput.vue';
import CommandPaletteList from './CommandPaletteList.vue';
import CommandPaletteEmpty from './CommandPaletteEmpty.vue';
import CommandPaletteGroup from './CommandPaletteGroup.vue';
import CommandPaletteItem from './CommandPaletteItem.vue';
import CommandPaletteSeparator from './CommandPaletteSeparator.vue';
import CommandPaletteTrigger from './CommandPaletteTrigger.vue';
import { inBody } from '../../../test-utils/playHelpers.js';

const meta = {
	title: 'Patterns/CommandPalette',
	component: CommandPalette,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Global search + command palette inspired by Raycast and Linear. ' +
					'Opens via `CommandPaletteTrigger` (button + ⌘K) or `CommandPaletteDialog` for manual control. ' +
					'Use `v-slot="{ search }"` on `CommandPalette` to conditionally show/hide sections.',
			},
		},
	},
} satisfies Meta<typeof CommandPalette>;

export default meta;
type Story = StoryObj<typeof meta>;

// ─── Default inline (no dialog) ─────────────────────────────────────────────

export const Default: Story = {
	args: {
		onSelectInbox: fn(),
		onSelectTimeline: fn(),
	} as Record<string, unknown>,
	render: (args) => ({
		components: {
			CommandPalette,
			CommandPaletteInput,
			CommandPaletteList,
			CommandPaletteEmpty,
			CommandPaletteGroup,
			CommandPaletteItem,
			CommandPaletteSeparator,
			Inbox,
			CalendarDays,
			Users,
			Settings,
		},
		setup: () => ({ args }),
		template: `
      <div class="w-full max-w-[400px] rounded-xl border shadow-md">
        <CommandPalette v-slot="{ search }">
          <CommandPaletteInput placeholder="Search anything..." />
          <CommandPaletteList>
            <CommandPaletteEmpty />
            <CommandPaletteGroup heading="Navigation">
              <CommandPaletteItem value="Inbox" @select="args.onSelectInbox">
                <Inbox class="size-4" /><span>Inbox</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Timeline" @select="args.onSelectTimeline">
                <CalendarDays class="size-4" /><span>Timeline</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Employees" @select="() => {}">
                <Users class="size-4" /><span>Employees</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Settings" @select="() => {}">
                <Settings class="size-4" /><span>Settings</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>
          </CommandPaletteList>
        </CommandPalette>
      </div>
    `,
	}),
};

// ─── Trigger button (⌘K) ────────────────────────────────────────────────────

export const WithTrigger: Story = {
	name: 'With trigger button (⌘K)',
	render: () => ({
		components: {
			CommandPalette,
			CommandPaletteInput,
			CommandPaletteList,
			CommandPaletteEmpty,
			CommandPaletteGroup,
			CommandPaletteItem,
			CommandPaletteSeparator,
			CommandPaletteTrigger,
			Inbox,
			CalendarDays,
			Users,
			CalendarX2,
			Repeat2,
			Settings,
			UserPlus,
			CalendarPlus,
			BarChart2,
			ChartNoAxesCombined,
		},
		template: `
      <CommandPaletteTrigger placeholder="Search here..." shortcut="⌘K" class="w-64" v-slot="{ close }">
        <CommandPalette v-slot="{ search }">
          <CommandPaletteInput placeholder="Search anything..." />
          <CommandPaletteList>
            <CommandPaletteEmpty />

            <CommandPaletteGroup v-if="!search" heading="Recent">
              <CommandPaletteItem value="Timeline" @select="close">
                <CalendarDays class="size-4" /><span>Timeline</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Employees" @select="close">
                <Users class="size-4" /><span>Employees</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Inbox" @select="close">
                <Inbox class="size-4" /><span>Inbox</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>

            <CommandPaletteSeparator v-if="!search" />

            <CommandPaletteGroup heading="Navigation">
              <CommandPaletteItem value="Inbox Notifications" @select="close">
                <Inbox class="size-4" /><span>Inbox</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Timeline Schedule" @select="close">
                <CalendarDays class="size-4" /><span>Timeline</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Adherence Report" @select="close">
                <ChartNoAxesCombined class="size-4" /><span>Adherence Report</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Employees" @select="close">
                <Users class="size-4" /><span>Employees</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Leave Management" @select="close">
                <CalendarX2 class="size-4" /><span>Leave Management</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Shift Swaps" @select="close">
                <Repeat2 class="size-4" /><span>Shift Swaps</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Settings" @select="close">
                <Settings class="size-4" /><span>Settings</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>

            <CommandPaletteSeparator />

            <CommandPaletteGroup heading="Actions">
              <CommandPaletteItem value="New Employee" @select="close">
                <UserPlus class="size-4" /><span>New Employee</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="Request Leave" @select="close">
                <CalendarPlus class="size-4" /><span>Request Leave</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>
          </CommandPaletteList>
        </CommandPalette>
      </CommandPaletteTrigger>
    `,
	}),
};

// ─── Registry-driven ────────────────────────────────────────────────────────

export const WithRegistry: Story = {
	name: 'Registry-driven (with keywords)',
	render: () => ({
		components: {
			CommandPalette,
			CommandPaletteInput,
			CommandPaletteList,
			CommandPaletteEmpty,
			CommandPaletteGroup,
			CommandPaletteItem,
			Inbox,
			CalendarDays,
			Users,
			Settings,
		},
		setup() {
			const items = [
				{ id: 'route.inbox', label: 'Inbox', icon: Inbox, keywords: ['notifications', 'messages'] },
				{ id: 'route.timeline', label: 'Timeline', icon: CalendarDays, keywords: ['schedule'] },
				{ id: 'route.employees', label: 'Employees', icon: Users, keywords: ['people', 'staff'] },
				{ id: 'settings.profile', label: 'Profile', icon: Settings, keywords: ['account', 'me'] },
			];
			const haystack = new Map(
				items.map((i) => [i.id, [i.label, ...i.keywords].join(' ').toLowerCase()]),
			);
			function filter(value: string, search: string): boolean {
				const text = haystack.get(value) ?? '';
				return text.includes(search.toLowerCase());
			}
			return { items, filter };
		},
		template: `
      <div class="w-full max-w-[420px] rounded-xl border shadow-md">
        <CommandPalette :filter="filter">
          <CommandPaletteInput placeholder="Try 'people' or 'me'..." />
          <CommandPaletteList>
            <CommandPaletteEmpty />
            <CommandPaletteGroup heading="All">
              <CommandPaletteItem
                v-for="item in items"
                :key="item.id"
                :value="item.id"
                :keywords="item.keywords"
                @select="() => {}"
              >
                <component :is="item.icon" class="size-4" />
                <span>{{ item.label }}</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>
          </CommandPaletteList>
        </CommandPalette>
      </div>
    `,
	}),
};

// ─── Prefix modes ───────────────────────────────────────────────────────────

export const PrefixModes: Story = {
	name: 'Prefix modes (/, @)',
	render: () => ({
		components: {
			CommandPalette,
			CommandPaletteInput,
			CommandPaletteList,
			CommandPaletteEmpty,
			CommandPaletteGroup,
			CommandPaletteItem,
			Inbox,
			CalendarDays,
			Users,
			Settings,
			UserPlus,
			CalendarPlus,
		},
		setup() {
			const search = ref('');
			const mode = computed<{ prefix: string; label: string } | null>(() => {
				if (search.value.startsWith('/')) return { prefix: '/', label: 'Commands' };
				if (search.value.startsWith('@')) return { prefix: '@', label: 'People' };
				return null;
			});
			const showNav = computed(() => !mode.value);
			const showActions = computed(() => !mode.value || mode.value.prefix === '/');
			const showPeople = computed(() => !mode.value || mode.value.prefix === '@');
			return { search, mode, showNav, showActions, showPeople };
		},
		template: `
      <div class="w-full max-w-[480px] rounded-xl border shadow-md">
        <CommandPalette v-model:search="search">
          <CommandPaletteInput placeholder="Try / for commands or @ for people..." />
          <div v-if="mode" class="px-3 py-1.5 text-xs text-muted-foreground border-b">
            In <span class="font-medium text-foreground">{{ mode.label }}</span>
          </div>
          <CommandPaletteList>
            <CommandPaletteEmpty />
            <CommandPaletteGroup v-if="showNav" heading="Pages">
              <CommandPaletteItem value="inbox" @select="() => {}">
                <Inbox class="size-4" /><span>Inbox</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="timeline" @select="() => {}">
                <CalendarDays class="size-4" /><span>Timeline</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="employees" @select="() => {}">
                <Users class="size-4" /><span>Employees</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>
            <CommandPaletteGroup v-if="showActions" heading="Actions">
              <CommandPaletteItem value="create-employee" @select="() => {}">
                <UserPlus class="size-4" /><span>Create employee</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="request-leave" @select="() => {}">
                <CalendarPlus class="size-4" /><span>Request leave</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>
            <CommandPaletteGroup v-if="showPeople" heading="People">
              <CommandPaletteItem value="alice" @select="() => {}">
                <Users class="size-4" /><span>Alice Anderson</span>
              </CommandPaletteItem>
              <CommandPaletteItem value="bob" @select="() => {}">
                <Users class="size-4" /><span>Bob Brown</span>
              </CommandPaletteItem>
            </CommandPaletteGroup>
          </CommandPaletteList>
        </CommandPalette>
      </div>
    `,
	}),
};

// ─── Loading state ──────────────────────────────────────────────────────────

export const LoadingState: Story = {
	name: 'Loading slot',
	render: () => ({
		components: { CommandPalette, CommandPaletteInput, CommandPaletteList },
		template: `
      <div class="w-full max-w-[420px] rounded-xl border shadow-md">
        <CommandPalette>
          <CommandPaletteInput placeholder="Searching..." />
          <CommandPaletteList :loading="true" />
        </CommandPalette>
      </div>
    `,
	}),
};

// ─── Interactive tests ──────────────────────────────────────────────────────

const triggerStoryTemplate = `
  <CommandPaletteTrigger placeholder="Search here..." shortcut="⌘K" class="w-64" v-slot="{ close }">
    <CommandPalette v-slot="{ search }">
      <CommandPaletteInput placeholder="Search anything..." />
      <CommandPaletteList>
        <CommandPaletteEmpty />
        <CommandPaletteGroup heading="Navigation">
          <CommandPaletteItem value="Inbox Notifications" @select="close">
            <Inbox class="size-4" /><span>Inbox</span>
          </CommandPaletteItem>
          <CommandPaletteItem value="Timeline Schedule" @select="close">
            <CalendarDays class="size-4" /><span>Timeline</span>
          </CommandPaletteItem>
          <CommandPaletteItem value="Employees" @select="close">
            <Users class="size-4" /><span>Employees</span>
          </CommandPaletteItem>
          <CommandPaletteItem value="Settings" @select="close">
            <Settings class="size-4" /><span>Settings</span>
          </CommandPaletteItem>
        </CommandPaletteGroup>
      </CommandPaletteList>
    </CommandPalette>
  </CommandPaletteTrigger>
`;

const triggerStoryComponents = {
	CommandPalette,
	CommandPaletteInput,
	CommandPaletteList,
	CommandPaletteEmpty,
	CommandPaletteGroup,
	CommandPaletteItem,
	CommandPaletteTrigger,
	Inbox,
	CalendarDays,
	Users,
	Settings,
};

export const InteractiveOpensViaTrigger: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: triggerStoryComponents,
		template: triggerStoryTemplate,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="command-palette-trigger"]',
		) as HTMLElement;
		await expect(trigger).toBeInTheDocument();
		await userEvent.click(trigger);
		const body = inBody();
		const palette = await body.findByRole('dialog');
		await expect(palette).toBeInTheDocument();
		await expect(document.querySelector('[data-slot="command-palette-input"]')).toBeInTheDocument();
	},
};

export const InteractiveTypeToFilter: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: triggerStoryComponents,
		template: triggerStoryTemplate,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="command-palette-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		const body = inBody();
		await body.findByRole('dialog');
		// CommandPaletteInput places `data-slot="command-palette-input"` directly on
		// the underlying <input> via attribute fall-through (InputSearch's
		// inheritAttrs:false forwards attrs to the inner input). No descendant
		// `input` selector — the data-slot IS the input.
		const input = document.querySelector('[data-slot="command-palette-input"]') as HTMLInputElement;
		await expect(input).toBeInTheDocument();
		await userEvent.type(input, 'inbox');
		const items = document.querySelectorAll<HTMLElement>('[data-slot="command-palette-item"]');
		let visibleMatching = 0;
		let visibleNonMatching = 0;
		for (const item of items) {
			const isVisible = item.offsetParent !== null;
			const txt = item.textContent?.toLowerCase() ?? '';
			if (!isVisible) continue;
			if (txt.includes('inbox')) visibleMatching++;
			else visibleNonMatching++;
		}
		await expect(visibleMatching).toBeGreaterThan(0);
		await expect(visibleNonMatching).toBe(0);
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: triggerStoryComponents,
		template: triggerStoryTemplate,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="command-palette-trigger"]',
		) as HTMLElement;
		await userEvent.click(trigger);
		const body = inBody();
		const dialog = await body.findByRole('dialog');
		await expect(dialog).toBeInTheDocument();
		await userEvent.keyboard('{Escape}');
		// Reka Presence animates the exit — DismissableLayer can persist briefly.
		// Assert via `data-state="closed"` on the dialog rather than DOM removal.
		await expect(dialog).toHaveAttribute('data-state', 'closed');
	},
};

export const InteractiveTriggerTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: triggerStoryComponents,
		template: triggerStoryTemplate,
	}),
	play: async ({ canvasElement }) => {
		const trigger = canvasElement.querySelector(
			'[data-slot="command-palette-trigger"]',
		) as HTMLElement;
		const r = trigger.getBoundingClientRect();
		await expect(r.width).toBeGreaterThanOrEqual(24);
		await expect(r.height).toBeGreaterThanOrEqual(24);
	},
};
