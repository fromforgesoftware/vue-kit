import type { Meta, StoryObj } from '@storybook/vue3-vite';
import BentoGrid from './BentoGrid.vue';
import BentoCard from './BentoCard.vue';

const meta = {
	title: 'Patterns/BentoGrid',
	component: BentoGrid,
	tags: ['!autodocs'],
	argTypes: {
		cols: { control: 'select', options: [1, 2, 3, 4, 6] },
		gap: { control: 'select', options: ['sm', 'md', 'lg'] },
	},
	args: {
		cols: 3,
		gap: 'md',
	},
} satisfies Meta<typeof BentoGrid>;

export default meta;
type Story = StoryObj<typeof meta>;

const placeholder = (label: string, height = 88) =>
	`<div style="min-height:${height}px;display:flex;align-items:center;justify-content:center;color:hsl(var(--muted-foreground));font-size:12px;">${label}</div>`;

export const Default: Story = {
	render: (args) => ({
		components: { BentoGrid, BentoCard },
		setup: () => ({ args }),
		template: `
      <div style="width: 720px;">
        <BentoGrid v-bind="args">
          <BentoCard size="wide">${placeholder('wide (col-span-full)')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="md">${placeholder('md (2×1)')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
        </BentoGrid>
      </div>
    `,
	}),
};

export const Hero: Story = {
	render: (args) => ({
		components: { BentoGrid, BentoCard },
		setup: () => ({ args }),
		template: `
      <div style="width: 720px;">
        <BentoGrid v-bind="args">
          <BentoCard size="hero">${placeholder('hero (2×2)', 184)}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="wide">${placeholder('wide')}</BentoCard>
        </BentoGrid>
      </div>
    `,
	}),
};

export const TallAndDense: Story = {
	render: (args) => ({
		components: { BentoGrid, BentoCard },
		setup: () => ({ args }),
		template: `
      <div style="width: 720px;">
        <BentoGrid v-bind="args">
          <BentoCard size="tall">${placeholder('tall (1×2)', 184)}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="md">${placeholder('md (2×1) — backfills via dense')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
        </BentoGrid>
      </div>
    `,
	}),
};

export const FourColumns: Story = {
	args: { cols: 4 },
	render: (args) => ({
		components: { BentoGrid, BentoCard },
		setup: () => ({ args }),
		template: `
      <div style="width: 960px;">
        <BentoGrid v-bind="args">
          <BentoCard size="hero">${placeholder('hero', 184)}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="sm">${placeholder('sm')}</BentoCard>
          <BentoCard size="md">${placeholder('md')}</BentoCard>
          <BentoCard size="md">${placeholder('md')}</BentoCard>
          <BentoCard size="wide">${placeholder('wide (col-span-full)')}</BentoCard>
        </BentoGrid>
      </div>
    `,
	}),
};
