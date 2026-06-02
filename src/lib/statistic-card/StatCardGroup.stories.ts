import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import StatCard from './StatCard.vue';
import StatCardGroup from './StatCardGroup.vue';
import StatTrend from '../general/stat-trend/StatTrend.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../test-utils/playHelpers';

const COLUMNS = [2, 3, 4, 6] as const;
const LAYOUTS = ['connected', 'separated'] as const;
const GAPS = ['none', 'sm', 'default', 'lg'] as const;

const meta = {
	title: 'Statistic Card/StatCardGroup',
	component: StatCardGroup,
	tags: ['!autodocs'],
	argTypes: {
		columns: {
			control: 'select',
			options: COLUMNS,
			description: 'Maximum columns at the largest breakpoint.',
		},
		layout: {
			control: 'select',
			options: LAYOUTS,
			description:
				'`connected` shares one surface with dividers; `separated` keeps each card distinct.',
		},
		gap: {
			control: 'select',
			options: GAPS,
			description: 'Gap between children (only applies in `separated` layout).',
		},
	},
	args: {
		columns: 3,
		layout: 'connected',
		gap: 'none',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Layout container for a row/grid of StatCards. Defaults to a connected surface with internal dividers (the original behaviour). Switch to `separated` for distinct cards.',
			},
		},
	},
	render: (args) => ({
		components: { StatCardGroup, StatCard, StatTrend },
		setup: () => ({ args }),
		template: `
      <StatCardGroup v-bind="args" class="max-w-3xl">
        <StatCard label="Total Sales & Cost" value="$956.82k">
          <template #trend><StatTrend :value="5.4" direction="up" /></template>
          <template #footer>+8.20k vs prev. 60 days</template>
        </StatCard>
        <StatCard label="New Customers" value="1,245">
          <template #trend><StatTrend :value="3.2" direction="up" /></template>
          <template #footer>+39 vs last quarter</template>
        </StatCard>
        <StatCard label="Churn Rate" value="2.8%">
          <template #trend><StatTrend :value="1.1" direction="down" /></template>
          <template #footer>-0.3% vs prev. 30 days</template>
        </StatCard>
      </StatCardGroup>
    `,
	}),
} satisfies Meta<typeof StatCardGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Connected: Story = {
	args: { layout: 'connected', columns: 3 },
	parameters: {
		docs: {
			description: {
				story:
					'Single shared card surface — children lose their individual borders and dividers separate them.',
			},
		},
	},
};

export const Separated: Story = {
	args: { layout: 'separated', gap: 'default', columns: 3 },
	parameters: {
		docs: {
			description: { story: 'Each card stays a distinct surface — use `gap` to control spacing.' },
		},
	},
};

export const Columns: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Four column counts. `2` and `3` use a single break at `sm`; `4` and `6` add a `lg` step.',
			},
		},
	},
	render: () => ({
		components: { StatCardGroup, StatCard },
		setup: () => ({ COLUMNS }),
		template: `
      <div class="flex flex-col gap-4">
        <div v-for="c in COLUMNS" :key="c">
          <p class="text-xs text-muted-foreground mb-2">columns: {{ c }}</p>
          <StatCardGroup :columns="c">
            <StatCard v-for="i in c" :key="i" :label="'Metric ' + i" :value="i * 1234" />
          </StatCardGroup>
        </div>
      </div>
    `,
	}),
};

export const SeparatedGaps: Story = {
	name: 'Separated — gap variants',
	render: () => ({
		components: { StatCardGroup, StatCard },
		setup: () => ({ GAPS }),
		template: `
      <div class="flex flex-col gap-6 max-w-3xl">
        <div v-for="g in GAPS" :key="g">
          <p class="text-xs text-muted-foreground mb-2">gap: {{ g }}</p>
          <StatCardGroup :columns="3" layout="separated" :gap="g">
            <StatCard label="Metric A" value="120" />
            <StatCard label="Metric B" value="240" />
            <StatCard label="Metric C" value="360" />
          </StatCardGroup>
        </div>
      </div>
    `,
	}),
};

// ── Interactive (test, hidden from autodocs) ───────────────────────────────

export const InteractiveRendersAndHasDataSlot: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const group = canvasElement.querySelector('[data-slot="stat-card-group"]') as HTMLElement;
		await expect(group).toBeInTheDocument();
		await expect(group.tagName).toBe('SECTION');
		await expect(group).toHaveAttribute('role', 'group');
		const cards = canvasElement.querySelectorAll('[data-slot="stat-card"]');
		await expect(cards.length).toBe(3);
	},
};

export const InteractiveSeparatedAppliesGap: Story = {
	tags: ['!autodocs', 'test'],
	args: { layout: 'separated', gap: 'default', columns: 3 },
	play: async ({ canvasElement }) => {
		const group = canvasElement.querySelector('[data-slot="stat-card-group"]') as HTMLElement;
		// `default` gap → gap-4
		await expect(group.className).toContain('gap-4');
		// separated layout doesn't add divide-x — children keep their own borders
		await expect(group.className).not.toContain('divide-x');
	},
};

export const InteractiveConnectedHasDividers: Story = {
	tags: ['!autodocs', 'test'],
	args: { layout: 'connected', columns: 3 },
	play: async ({ canvasElement }) => {
		const group = canvasElement.querySelector('[data-slot="stat-card-group"]') as HTMLElement;
		await expect(group.className).toContain('divide-x');
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { StatCardGroup, StatCard, StatTrend },
		template: `
      <div data-test-root class="p-2">
        <StatCardGroup :columns="4" layout="separated" gap="default">
          <StatCard label="A" value="120">
            <template #trend><StatTrend :value="3" direction="up" /></template>
          </StatCard>
          <StatCard label="B" value="240" />
          <StatCard label="C" value="360" />
          <StatCard label="D" value="480" />
        </StatCardGroup>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const cards = root.querySelectorAll('[data-slot="stat-card"]');
			await expect(cards.length).toBe(4);
		});
	},
};
