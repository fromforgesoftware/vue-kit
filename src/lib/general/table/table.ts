import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

// ───────────────────────────────────────────────────────────────────────────
// Table — semantic styling for native <table>/<thead>/<tbody>/<tr>/<th>/<td>.
// Sortable / selectable / paginated machinery lives in <DataTable>; this layer
// is the styling primitive.
// ───────────────────────────────────────────────────────────────────────────

export type TableDensity = 'compact' | 'default' | 'relaxed';
export type TableAlign = 'left' | 'center' | 'right';

export const TABLE_DENSITY_KEY: InjectionKey<Ref<TableDensity>> = Symbol('table-density');
export const TABLE_STICKY_HEADER_KEY: InjectionKey<Ref<boolean>> = Symbol('table-sticky-header');

// Root table.
export const tableVariants = cva('w-full caption-bottom text-sm', {
	variants: {},
	defaultVariants: {},
});

// Wrapper that scrolls horizontally when needed and clips the rounded surface.
export const tableWrapperVariants = cva('relative w-full overflow-auto', {
	variants: {
		surface: {
			none: '',
			card: 'rounded-md border bg-card',
		},
	},
	defaultVariants: { surface: 'none' },
});

export const tableHeaderVariants = cva('[&_tr]:border-b', {
	variants: {
		sticky: {
			true: 'sticky top-0 z-10 bg-background [&_th]:bg-background',
			false: '',
		},
	},
	defaultVariants: { sticky: false },
});

export const tableBodyVariants = cva('[&_tr:last-child]:border-0', {
	variants: {},
	defaultVariants: {},
});

export const tableFooterVariants = cva('bg-muted/50 border-t font-medium [&>tr]:last:border-b-0', {
	variants: {},
	defaultVariants: {},
});

// Row hover + selected states. `interactive` toggles cursor + stronger hover
// for clickable rows. `density` is also forwarded down via context so cells
// can pick up matching padding without each row repeating it.
export const tableRowVariants = cva('border-b transition-colors data-[state=selected]:bg-muted', {
	variants: {
		interactive: {
			true: 'cursor-pointer hover:bg-muted/60',
			false: 'hover:bg-muted/50',
		},
	},
	defaultVariants: { interactive: false },
});

// Header cell. Density controls vertical rhythm; align controls text alignment.
export const tableHeadVariants = cva(
	'align-middle font-medium text-muted-foreground [&:has([role=checkbox])]:pr-0',
	{
		variants: {
			density: {
				compact: 'h-8 px-2 text-xs',
				default: 'h-10 px-3 text-xs',
				relaxed: 'h-12 px-4 text-sm',
			},
			align: {
				left: 'text-left',
				center: 'text-center',
				right: 'text-right',
			},
		},
		defaultVariants: { density: 'default', align: 'left' },
	},
);

// Body cell. Same density tiers, default left-aligned text.
export const tableCellVariants = cva('align-middle [&:has([role=checkbox])]:pr-0', {
	variants: {
		density: {
			compact: 'p-2 text-xs',
			default: 'p-3 text-sm',
			relaxed: 'p-4 text-sm',
		},
		align: {
			left: 'text-left',
			center: 'text-center',
			right: 'text-right',
		},
		numeric: {
			true: 'tabular-nums',
			false: '',
		},
	},
	defaultVariants: { density: 'default', align: 'left', numeric: false },
});

export const tableCaptionVariants = cva('mt-4 text-xs text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export type TableVariants = VariantProps<typeof tableVariants>;
export type TableHeadVariants = VariantProps<typeof tableHeadVariants>;
export type TableCellVariants = VariantProps<typeof tableCellVariants>;
export type TableRowVariants = VariantProps<typeof tableRowVariants>;
export type TableWrapperVariants = VariantProps<typeof tableWrapperVariants>;
export type TableSurface = NonNullable<TableWrapperVariants['surface']>;
