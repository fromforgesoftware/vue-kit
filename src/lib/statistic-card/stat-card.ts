import { cva, type VariantProps } from 'class-variance-authority';

// Shared base for default/icon/progress variants. ColoredStatCard composes its
// own classes so the tinted surface can drop the border.
const STAT_CARD_BASE =
	'rounded-xl text-card-foreground transition-colors outline-none ' +
	'[&[data-slot=stat-card-value]]:tracking-tight';

// --- StatCard ----------------------------------------------------------------

/** Card surface variants for the default {@link StatCard}. */
export const statCardVariants = cva(STAT_CARD_BASE, {
	variants: {
		variant: {
			default: 'border border-border bg-card',
			muted: 'border border-border bg-muted',
			ghost: 'border border-transparent bg-transparent',
		},
		size: {
			sm: 'p-3',
			default: 'p-4',
			lg: 'p-5',
		},
		interactive: {
			true:
				'cursor-pointer hover:border-ring ' +
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
			false: '',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
		interactive: false,
	},
});

/** Label-text density variants — paired with `statCardVariants` size. */
export const statCardLabelVariants = cva('font-medium text-foreground', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
			lg: 'text-base',
		},
	},
	defaultVariants: { size: 'default' },
});

/** Value-text density variants — paired with `statCardVariants` size. */
export const statCardValueVariants = cva('font-bold tracking-tight text-foreground', {
	variants: {
		size: {
			sm: 'text-xl',
			default: 'text-h3',
			lg: 'text-h2',
		},
	},
	defaultVariants: { size: 'default' },
});

export type StatCardVariants = VariantProps<typeof statCardVariants>;
export type StatCardVariant = NonNullable<StatCardVariants['variant']>;
export type StatCardSize = NonNullable<StatCardVariants['size']>;

// --- IconStatCard ------------------------------------------------------------

/** Icon-led variant — same surface tones as {@link statCardVariants}. */
export const iconStatCardVariants = cva(STAT_CARD_BASE, {
	variants: {
		variant: {
			default: 'border border-border bg-card',
			muted: 'border border-border bg-muted',
			ghost: 'border border-transparent bg-transparent',
		},
		size: {
			sm: 'p-3',
			default: 'p-4',
			lg: 'p-5',
		},
		/**
		 * `stacked` (default) — icon top-left, label/value/footer flow below in
		 *   a single column. The "CRM-style summary card" pattern.
		 * `inline` — icon on the left, label/value/footer flow as a column on
		 *   the right. More efficient for narrow/dense rows where vertical space
		 *   matters and the icon serves as a categorical anchor.
		 */
		layout: {
			stacked: '',
			inline: '',
		},
		interactive: {
			true:
				'cursor-pointer hover:border-ring ' +
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
			false: '',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
		layout: 'stacked',
		interactive: false,
	},
});

export type IconStatCardVariants = VariantProps<typeof iconStatCardVariants>;

// --- ColoredStatCard ---------------------------------------------------------

// `[&_[data-slot=stat-trend]]:...` overrides the soft StatTrend pill when
// rendered inside a ColoredStatCard. The default `text-success bg-success/10`
// pill is invisible on saturated backgrounds (orange/red/blue) — here we
// force the pill to inherit the card's foreground (`currentColor`) for both
// text and a 15 %-opacity backdrop, so the pill becomes a readable lighter
// shade of whatever tone the card is using. `!important` (`!`) wins over
// the StatTrend CVA's compound variants.
/** Tinted-surface variant — entire card uses a single tone token. */
export const coloredStatCardVariants = cva(
	'rounded-xl overflow-hidden outline-none transition-colors ' +
		'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring ' +
		'[&_[data-slot=stat-trend]]:!text-current [&_[data-slot=stat-trend]]:!bg-current/15',
	{
		variants: {
			tone: {
				dark: 'bg-foreground text-background',
				primary: 'bg-primary text-primary-foreground',
				success: 'bg-success text-success-foreground',
				warning: 'bg-warning text-warning-foreground',
				destructive: 'bg-destructive text-destructive-foreground',
				info: 'bg-info text-info-foreground',
			},
			size: {
				sm: 'p-4',
				default: 'p-5',
				lg: 'p-6',
			},
			interactive: {
				true: 'cursor-pointer hover:opacity-95',
				false: '',
			},
		},
		defaultVariants: {
			tone: 'dark',
			size: 'default',
			interactive: false,
		},
	},
);

export type ColoredStatCardVariants = VariantProps<typeof coloredStatCardVariants>;
export type ColoredStatCardTone = NonNullable<ColoredStatCardVariants['tone']>;
/** @deprecated Use {@link ColoredStatCardTone}. */
export type ColoredStatCardColor = ColoredStatCardTone;

// --- ProgressStatCard --------------------------------------------------------

/** Card surface variants for {@link ProgressStatCard}. */
export const progressStatCardVariants = cva(STAT_CARD_BASE, {
	variants: {
		variant: {
			default: 'border border-border bg-card',
			muted: 'border border-border bg-muted',
			ghost: 'border border-transparent bg-transparent',
		},
		size: {
			sm: 'p-3',
			default: 'p-4',
			lg: 'p-5',
		},
		interactive: {
			true:
				'cursor-pointer hover:border-ring ' +
				'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
			false: '',
		},
	},
	defaultVariants: {
		variant: 'default',
		size: 'default',
		interactive: false,
	},
});

/** Status-text colour variants — paired with the progress bar's tone. */
export const progressStatCardStatusVariants = cva('text-xs font-medium', {
	variants: {
		status: {
			default: 'text-muted-foreground',
			success: 'text-success',
			warning: 'text-warning-foreground',
			destructive: 'text-destructive',
		},
	},
	defaultVariants: { status: 'default' },
});

export type ProgressStatCardVariants = VariantProps<typeof progressStatCardVariants>;
export type ProgressStatCardStatusVariants = VariantProps<typeof progressStatCardStatusVariants>;
export type ProgressStatCardStatus = NonNullable<ProgressStatCardStatusVariants['status']>;

// --- StatCardGroup -----------------------------------------------------------

/** Container that arranges multiple stat cards in a grid; `connected` shares a surface. */
export const statCardGroupVariants = cva('grid', {
	variants: {
		columns: {
			2: 'grid-cols-1 sm:grid-cols-2',
			3: 'grid-cols-1 sm:grid-cols-3',
			4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
			6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
		},
		/**
		 * `connected` renders one shared surface with internal dividers (the
		 * default — preserves existing layouts). `separated` renders each child
		 * as its own card with a gap between them.
		 */
		layout: {
			connected:
				'rounded-xl border border-border bg-card text-card-foreground overflow-hidden ' +
				'divide-x divide-border ' +
				'[&>[data-slot=stat-card]]:border-0 [&>[data-slot=stat-card]]:shadow-none [&>[data-slot=stat-card]]:rounded-none ' +
				'[&>[data-slot=icon-stat-card]]:border-0 [&>[data-slot=icon-stat-card]]:shadow-none [&>[data-slot=icon-stat-card]]:rounded-none ' +
				'[&>[data-slot=progress-stat-card]]:border-0 [&>[data-slot=progress-stat-card]]:shadow-none [&>[data-slot=progress-stat-card]]:rounded-none',
			separated: '',
		},
		gap: {
			none: 'gap-0',
			sm: 'gap-2',
			default: 'gap-4',
			lg: 'gap-6',
		},
	},
	compoundVariants: [
		// Connected layout has no gap by default — dividers handle separation.
		{ layout: 'connected', gap: 'none', class: 'gap-0' },
	],
	defaultVariants: {
		columns: 3,
		layout: 'connected',
		gap: 'none',
	},
});

export type StatCardGroupVariants = VariantProps<typeof statCardGroupVariants>;
export type StatCardGroupColumns = NonNullable<StatCardGroupVariants['columns']>;
export type StatCardGroupLayout = NonNullable<StatCardGroupVariants['layout']>;
export type StatCardGroupGap = NonNullable<StatCardGroupVariants['gap']>;
