import { cva, type VariantProps } from 'class-variance-authority';

// --- EmptyState container ---

export const emptyStateVariants = cva('flex flex-col items-center justify-center text-center', {
	variants: {
		size: {
			sm: 'gap-2 py-6',
			default: 'gap-3 py-10',
			lg: 'gap-4 py-16',
		},
		tone: {
			default: '',
			muted: 'rounded-lg bg-muted',
		},
	},
	defaultVariants: {
		size: 'default',
		tone: 'default',
	},
});

export type EmptyStateVariants = VariantProps<typeof emptyStateVariants>;
export type EmptyStateSize = NonNullable<EmptyStateVariants['size']>;
export type EmptyStateTone = NonNullable<EmptyStateVariants['tone']>;

// --- EmptyState icon ---

export const emptyStateIconVariants = cva(
	'flex items-center justify-center rounded-lg bg-muted text-muted-foreground',
	{
		variants: {
			size: {
				sm: 'size-10',
				default: 'size-12',
				lg: 'size-16',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type EmptyStateIconVariants = VariantProps<typeof emptyStateIconVariants>;

// --- EmptyState illustration ---

export const emptyStateIllustrationVariants = cva('h-auto select-none', {
	variants: {
		size: {
			sm: 'w-56',
			default: 'w-80',
			lg: 'w-96',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

export type EmptyStateIllustrationVariants = VariantProps<typeof emptyStateIllustrationVariants>;

/**
 * Names of the illustrations shipped in `@fromforgesoftware/ts-kit/assets/chart-illustrations/`.
 * Each name has both a `light/` and `dark/` SVG that EmptyState swaps via `[data-theme]`.
 */
export const ILLUSTRATION_NAMES = [
	'bar-chart',
	'contracts',
	'dashboard',
	'donut-chart',
	'empty-datatable',
	'forbidden',
	'forecast',
	'help',
	'knowledge',
	'line',
	'not-found',
	'notifications',
	'roster',
	'rotas',
	'shifts',
	'single-metric',
	'stat-grid',
	'table',
	'videos',
] as const;

export type IllustrationName = (typeof ILLUSTRATION_NAMES)[number];

// --- EmptyState title ---

export const emptyStateTitleVariants = cva('font-semibold text-foreground', {
	variants: {
		size: {
			sm: 'text-sm font-medium',
			default: 'text-base',
			lg: 'text-lg',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

// --- EmptyState description ---

export const emptyStateDescriptionVariants = cva('text-muted-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-sm',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

// --- EmptyState action card ---

export const emptyStateActionCardVariants = cva(
	'flex flex-col items-start gap-2 rounded-lg border border-border bg-card p-4 text-left transition-colors',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type EmptyStateActionCardVariants = VariantProps<typeof emptyStateActionCardVariants>;
