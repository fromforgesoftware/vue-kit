import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { expect } from 'storybook/test';
import Table from './Table.vue';
import TableHeader from './TableHeader.vue';
import TableBody from './TableBody.vue';
import TableFooter from './TableFooter.vue';
import TableRow from './TableRow.vue';
import TableHead from './TableHead.vue';
import TableCell from './TableCell.vue';
import TableCaption from './TableCaption.vue';
import { expectNoHorizontalOverflow, forEachViewport } from '../../../test-utils/playHelpers.js';

const components = {
	Table,
	TableHeader,
	TableBody,
	TableFooter,
	TableRow,
	TableHead,
	TableCell,
	TableCaption,
};

const ALL_DENSITIES = ['compact', 'default', 'relaxed'] as const;
const ALL_ALIGNS = ['left', 'center', 'right'] as const;

const invoices = [
	{ id: 'INV001', status: 'Paid', method: 'Credit Card', amount: '$250.00' },
	{ id: 'INV002', status: 'Pending', method: 'PayPal', amount: '$150.00' },
	{ id: 'INV003', status: 'Unpaid', method: 'Bank Transfer', amount: '$350.00' },
	{ id: 'INV004', status: 'Paid', method: 'Credit Card', amount: '$450.00' },
	{ id: 'INV005', status: 'Paid', method: 'PayPal', amount: '$550.00' },
];

const meta = {
	title: 'General/Table',
	component: Table,
	tags: ['!autodocs'],
	parameters: {
		layout: 'padded',
		docs: {
			description: {
				component:
					'Styling primitive for the native HTML <table>. Supports density, sticky headers, alignment, numeric formatting, and selected/interactive rows. Sortable / paginated machinery lives in <DataTable>.',
			},
		},
	},
	argTypes: {
		density: {
			control: 'select',
			options: ALL_DENSITIES,
			description: 'Padding/typography density. Propagates to head and body cells.',
		},
		surface: {
			control: 'select',
			options: ['none', 'card'],
			description: 'Wrapper visual treatment.',
		},
		stickyHeader: {
			control: 'boolean',
			description: 'Pin the header row to the top of a scrolling container.',
		},
	},
	args: {
		density: 'default',
		surface: 'none',
		stickyHeader: false,
	},
	render: (args) => ({
		components,
		setup: () => ({ args, invoices }),
		template: `
      <Table v-bind="args">
        <TableCaption>A list of your recent invoices.</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in invoices" :key="invoice.id">
            <TableCell class="font-medium">{{ invoice.id }}</TableCell>
            <TableCell>{{ invoice.status }}</TableCell>
            <TableCell>{{ invoice.method }}</TableCell>
            <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
	}),
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ───────────────────────────────────────────────────────────

export const Default: Story = {};

export const Densities: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three density tiers. Choose `compact` for dense data, `relaxed` for marketing-style tables.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ ALL_DENSITIES, invoices }),
		template: `
      <div class="flex flex-col gap-6">
        <div v-for="d in ALL_DENSITIES" :key="d" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">density="{{ d }}"</span>
          <Table :density="d">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead>Status</TableHead>
                <TableHead align="right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="invoice in invoices.slice(0, 3)" :key="invoice.id">
                <TableCell>{{ invoice.id }}</TableCell>
                <TableCell>{{ invoice.status }}</TableCell>
                <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    `,
	}),
};

export const Alignments: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Use `align` on <TableHead> and <TableCell> to switch between left, center, and right text alignment.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ ALL_ALIGNS }),
		template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead v-for="a in ALL_ALIGNS" :key="a" :align="a">align={{ a }}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell v-for="a in ALL_ALIGNS" :key="a" :align="a">value</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
	}),
};

export const Numeric: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Set `numeric` on a <TableCell> to render figures with `tabular-nums` so columns line up correctly.',
			},
		},
	},
	render: () => ({
		components,
		template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Region</TableHead>
            <TableHead align="right">Q1</TableHead>
            <TableHead align="right">Q2</TableHead>
            <TableHead align="right">Q3</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>EMEA</TableCell>
            <TableCell align="right" numeric>1,235</TableCell>
            <TableCell align="right" numeric>987</TableCell>
            <TableCell align="right" numeric>2,109</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>APAC</TableCell>
            <TableCell align="right" numeric>432</TableCell>
            <TableCell align="right" numeric>1,021</TableCell>
            <TableCell align="right" numeric>1,500</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
	}),
};

export const SelectedRow: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Set `selected` on a row to apply the selected-state background. The row exposes `data-state="selected"` for assistive tech.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ invoices }),
		template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="(invoice, i) in invoices" :key="invoice.id" :selected="i === 1">
            <TableCell>{{ invoice.id }}</TableCell>
            <TableCell>{{ invoice.status }}</TableCell>
            <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
	}),
};

export const InteractiveRows: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`interactive` rows show a stronger hover state and a pointer cursor — for clickable list-style tables.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ invoices }),
		template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in invoices" :key="invoice.id" interactive>
            <TableCell>{{ invoice.id }}</TableCell>
            <TableCell>{{ invoice.status }}</TableCell>
            <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
	}),
};

export const StickyHeader: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Set `stickyHeader` on <Table> to pin <thead> to the top of the scroll wrapper. Useful for long lists in fixed-height containers.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => {
			const rows = Array.from({ length: 30 }, (_, i) => ({
				id: `INV${String(i + 1).padStart(3, '0')}`,
				status: ['Paid', 'Pending', 'Unpaid'][i % 3],
				amount: `$${(i + 1) * 50}.00`,
			}));
			return { rows };
		},
		template: `
      <!--
        Scrollable wrapper exposes itself to keyboard users with tabindex="0" +
        role="region" + an accessible label so it satisfies axe rule
        "scrollable-region-focusable". The Table component itself does not
        wrap; this wrapper is the consumer's responsibility.
      -->
      <div
        class="h-72 overflow-auto rounded-md border"
        tabindex="0"
        role="region"
        aria-label="Invoices table"
      >
        <Table sticky-header surface="none">
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead align="right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="row in rows" :key="row.id">
              <TableCell>{{ row.id }}</TableCell>
              <TableCell>{{ row.status }}</TableCell>
              <TableCell align="right" numeric>{{ row.amount }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    `,
	}),
};

export const Surfaces: Story = {
	parameters: {
		docs: {
			description: {
				story: '`surface="card"` adds a bordered, rounded wrapper. `none` is the default.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ invoices }),
		template: `
      <div class="flex flex-col gap-6">
        <div v-for="s in ['none', 'card']" :key="s" class="flex flex-col gap-2">
          <span class="text-xs font-medium text-muted-foreground">surface="{{ s }}"</span>
          <Table :surface="s">
            <TableHeader>
              <TableRow>
                <TableHead>Invoice</TableHead>
                <TableHead align="right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="invoice in invoices.slice(0, 3)" :key="invoice.id">
                <TableCell>{{ invoice.id }}</TableCell>
                <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    `,
	}),
};

export const WithFooter: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`<TableFooter>` renders inside `<tfoot>` with a muted background — use for totals or summary rows.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ invoices }),
		template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Invoice</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Method</TableHead>
            <TableHead align="right">Amount</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow v-for="invoice in invoices" :key="invoice.id">
            <TableCell>{{ invoice.id }}</TableCell>
            <TableCell>{{ invoice.status }}</TableCell>
            <TableCell>{{ invoice.method }}</TableCell>
            <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell colspan="3">Total</TableCell>
            <TableCell align="right" numeric>$1,750.00</TableCell>
          </TableRow>
        </TableFooter>
      </Table>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ──────────────────────

export const InteractiveSemanticStructure: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ canvasElement }) => {
		await expect(canvasElement.querySelector('[data-slot="table-wrapper"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="table"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="table-header"]')).not.toBeNull();
		await expect(canvasElement.querySelector('[data-slot="table-body"]')).not.toBeNull();
		await expect(canvasElement.querySelectorAll('[data-slot="table-head"]').length).toBe(4);
		await expect(canvasElement.querySelectorAll('[data-slot="table-row"]').length).toBe(6);
		await expect(canvasElement.querySelectorAll('[data-slot="table-cell"]').length).toBe(20);

		// Native semantic elements are present.
		const thead = canvasElement.querySelector('thead')!;
		const tbody = canvasElement.querySelector('tbody')!;
		const ths = canvasElement.querySelectorAll('th');
		await expect(thead).not.toBeNull();
		await expect(tbody).not.toBeNull();
		await expect(ths.length).toBe(4);
		// <th scope="col"> is set by default — important for screen-reader association.
		for (const th of ths) {
			await expect(th.getAttribute('scope')).toBe('col');
		}
	},
};

export const InteractiveAlignmentClasses: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		template: `
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Left</TableHead>
            <TableHead align="center">Center</TableHead>
            <TableHead align="right">Right</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>L</TableCell>
            <TableCell align="center">C</TableCell>
            <TableCell align="right">R</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    `,
	}),
	play: async ({ canvasElement }) => {
		const heads = canvasElement.querySelectorAll<HTMLTableCellElement>('[data-slot="table-head"]');
		await expect(heads[0].className).toMatch(/text-left/);
		await expect(heads[1].className).toMatch(/text-center/);
		await expect(heads[2].className).toMatch(/text-right/);

		const cells = canvasElement.querySelectorAll<HTMLTableCellElement>('[data-slot="table-cell"]');
		await expect(cells[0].className).toMatch(/text-left/);
		await expect(cells[1].className).toMatch(/text-center/);
		await expect(cells[2].className).toMatch(/text-right/);
	},
};

export const InteractiveSelectedDataState: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		template: `
      <Table>
        <TableHeader>
          <TableRow><TableHead>Col</TableHead></TableRow>
        </TableHeader>
        <TableBody>
          <TableRow><TableCell>row 1</TableCell></TableRow>
          <TableRow selected><TableCell>row 2 (selected)</TableCell></TableRow>
        </TableBody>
      </Table>
    `,
	}),
	play: async ({ canvasElement }) => {
		const rows = canvasElement.querySelectorAll<HTMLTableRowElement>(
			'[data-slot="table-body"] [data-slot="table-row"]',
		);
		await expect(rows[0].getAttribute('data-state')).toBeNull();
		await expect(rows[1].getAttribute('data-state')).toBe('selected');
	},
};

export const InteractiveRowHoverHasMutedBackground: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components,
		template: `
      <Table>
        <TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>cell</TableCell></TableRow></TableBody>
      </Table>
    `,
	}),
	play: async ({ canvasElement }) => {
		const row = canvasElement.querySelector<HTMLTableRowElement>(
			'[data-slot="table-body"] [data-slot="table-row"]',
		)!;
		// The hover utility class is present (we don't dispatch synthetic hover —
		// jsdom does not toggle :hover. Asserting the class exists is enough.)
		await expect(row.className).toMatch(/hover:bg-muted/);
	},
};

export const InteractiveDensityPropagation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		template: `
      <Table density="compact">
        <TableHeader><TableRow><TableHead>Col</TableHead></TableRow></TableHeader>
        <TableBody><TableRow><TableCell>cell</TableCell></TableRow></TableBody>
      </Table>
    `,
	}),
	play: async ({ canvasElement }) => {
		// Compact density yields h-8 / p-2 / text-xs on the head/cell.
		const head = canvasElement.querySelector('[data-slot="table-head"]')!;
		const cell = canvasElement.querySelector('[data-slot="table-cell"]')!;
		await expect(head.className).toMatch(/h-8/);
		await expect(head.className).toMatch(/text-xs/);
		await expect(cell.className).toMatch(/p-2/);
		await expect(cell.className).toMatch(/text-xs/);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Tables wrap inside a horizontally scrollable container — the container itself never overflows the viewport.',
			},
		},
	},
	render: () => ({
		components,
		setup: () => ({ invoices }),
		template: `
      <div data-test-root class="w-full p-2">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Invoice</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Method</TableHead>
              <TableHead align="right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="invoice in invoices" :key="invoice.id">
              <TableCell>{{ invoice.id }}</TableCell>
              <TableCell>{{ invoice.status }}</TableCell>
              <TableCell>{{ invoice.method }}</TableCell>
              <TableCell align="right" numeric>{{ invoice.amount }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const rows = root.querySelectorAll('[data-slot="table-row"]');
			await expect(rows.length).toBe(6);
		});
	},
};
