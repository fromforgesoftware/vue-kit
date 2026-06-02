import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect, within } from 'storybook/test';
import { Slash } from '@lucide/vue';
import Breadcrumb from './Breadcrumb.vue';
import BreadcrumbList from './BreadcrumbList.vue';
import BreadcrumbItem from './BreadcrumbItem.vue';
import BreadcrumbLink from './BreadcrumbLink.vue';
import BreadcrumbPage from './BreadcrumbPage.vue';
import BreadcrumbSeparator from './BreadcrumbSeparator.vue';
import BreadcrumbEllipsis from './BreadcrumbEllipsis.vue';
import Icon from '../icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers.js';

const components = {
	Breadcrumb,
	BreadcrumbList,
	BreadcrumbItem,
	BreadcrumbLink,
	BreadcrumbPage,
	BreadcrumbSeparator,
	BreadcrumbEllipsis,
	Icon,
};

const ALL_VARIANTS = ['default'] as const;

const DEFAULT_TRAIL = [
	{ label: 'Home', href: '#home' },
	{ label: 'Products', href: '#products' },
	{ label: 'Electronics' },
] as const;

const meta = {
	title: 'General/Breadcrumb',
	component: Breadcrumb,
	// Disable autodocs because this component has a curated `About.mdx`. Without
	// this override the global `tags: ['autodocs']` in preview.ts would generate
	// a second "Docs" page next to our MDX.
	tags: ['!autodocs'],
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Visual style. Currently only `default`.',
		},
		class: {
			control: 'text',
			description: 'Extra classes merged onto the root `<nav>`.',
		},
	},
	args: {
		variant: 'default',
	},
	parameters: {
		docs: {
			description: {
				component:
					'Hierarchical navigation showing the path from a root to the current page. Renders as <nav> with an ordered list and announces "Breadcrumb" to assistive tech.',
			},
		},
	},
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="#products">Products</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Electronics</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
} satisfies Meta<typeof Breadcrumb>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Short: Story = {
	parameters: {
		docs: { description: { story: 'Two-level breadcrumb. The shortest useful form.' } },
	},
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="#home">Home</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Dashboard</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
};

export const Long: Story = {
	parameters: {
		docs: {
			description: { story: 'Long breadcrumbs wrap on narrow viewports thanks to flex-wrap.' },
		},
	},
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#a">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#b">Products</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#c">Electronics</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#d">Computers</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#e">Laptops</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Gaming Laptops</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
};

export const WithEllipsis: Story = {
	parameters: {
		docs: {
			description: {
				story: 'Use BreadcrumbEllipsis to collapse mid-path levels behind a "more" indicator.',
			},
		},
	},
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#root">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#parent">Laptops</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Model X</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
};

export const CustomSeparator: Story = {
	parameters: {
		docs: { description: { story: 'Override the separator slot for a different glyph.' } },
	},
	render: (args) => ({
		components,
		setup: () => ({ args, Slash }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#a">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><Icon :icon="Slash" size="sm" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbLink href="#b">Library</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator><Icon :icon="Slash" size="sm" /></BreadcrumbSeparator>
          <BreadcrumbItem><BreadcrumbPage>Data</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
};

export const Single: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Single-item breadcrumb for a top-level page. Most apps will skip this — but it stays valid.',
			},
		},
	},
	render: (args) => ({
		components,
		setup: () => ({ args }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbPage>Settings</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveSemantics: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		// The <nav aria-label="Breadcrumb"> is announced by name.
		const nav = canvas.getByRole('navigation', { name: 'Breadcrumb' });
		await expect(nav).toBeInTheDocument();
		// Current page exposes aria-current.
		const current = canvasElement.querySelector('[aria-current="page"]') as HTMLElement;
		await expect(current).not.toBeNull();
		await expect(current.textContent?.trim()).toBe('Electronics');
	},
};

export const InteractiveLinksFocusable: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		const links = canvasElement.querySelectorAll<HTMLAnchorElement>(
			'a[data-slot="breadcrumb-link"]',
		);
		await expect(links.length).toBe(2);
		for (const a of links) {
			a.focus();
			await expect(a).toHaveFocus();
			const r = a.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
		}
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="breadcrumb"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="breadcrumb-list"]')).not.toBeNull();
		await expect(canvasElement.querySelectorAll('[data-slot="breadcrumb-item"]').length).toBe(3);
		await expect(canvasElement.querySelectorAll('[data-slot="breadcrumb-link"]').length).toBe(2);
		await expect(canvasElement.querySelectorAll('[data-slot="breadcrumb-separator"]').length).toBe(
			2,
		);
		await expect(canvasElement.querySelector('[data-slot="breadcrumb-page"]')).not.toBeNull();
	},
};

export const InteractiveEllipsisTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		template: `
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#root">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbEllipsis /></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Item</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
	play: async ({ canvasElement }) => {
		const ellipsis = canvasElement.querySelector(
			'[data-slot="breadcrumb-ellipsis"]',
		) as HTMLElement;
		await expect(ellipsis).not.toBeNull();
		expectMinTargetSize(ellipsis, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Long breadcrumbs wrap rather than overflow horizontally at any viewport.',
			},
		},
	},
	render: (args) => ({
		components,
		setup: () => ({ args, DEFAULT_TRAIL }),
		template: `
      <Breadcrumb v-bind="args">
        <BreadcrumbList>
          <BreadcrumbItem><BreadcrumbLink href="#a">Home</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#b">Products</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbLink href="#c">Electronics &amp; gadgets</BreadcrumbLink></BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem><BreadcrumbPage>Headphones &amp; earbuds</BreadcrumbPage></BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>
    `,
	}),
	play: async ({ canvasElement }) => {
		await forEachViewport(async () => {
			const root = canvasElement.firstElementChild as HTMLElement;
			await expect(root).toBeVisible();
			expectNoHorizontalOverflow(root);
			for (const el of canvasElement.querySelectorAll(
				'a[data-slot="breadcrumb-link"], [data-slot="breadcrumb-ellipsis"]',
			)) {
				const r = (el as HTMLElement).getBoundingClientRect();
				await expect(r.width).toBeGreaterThan(0);
			}
		});
	},
};
