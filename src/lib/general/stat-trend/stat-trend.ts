import { cva, type VariantProps } from 'class-variance-authority';

export const statTrendVariants = cva('inline-flex items-center gap-1 font-medium rounded-md', {
	variants: {
		direction: {
			up: '',
			down: '',
			flat: '',
		},
		tone: {
			soft: '',
			solid: '',
			ghost: '',
		},
		sentiment: {
			positive: '',
			negative: '',
			neutral: '',
		},
		severity: {
			normal: '',
			warning: '',
			critical: '',
		},
		size: {
			sm: 'text-2xs px-1 py-0.5 [&>svg]:size-2.5',
			default: 'text-xs px-1.5 py-0.5 [&>svg]:size-3',
			lg: 'text-sm px-2 py-1 [&>svg]:size-4',
		},
	},
	compoundVariants: [
		// Soft tone (default)
		{ sentiment: 'positive', tone: 'soft', class: 'text-success bg-success/10' },
		{ sentiment: 'negative', tone: 'soft', class: 'text-destructive bg-destructive/10' },
		{ sentiment: 'neutral', tone: 'soft', class: 'text-muted-foreground bg-muted' },
		// Solid tone
		{ sentiment: 'positive', tone: 'solid', class: 'text-success-foreground bg-success' },
		{ sentiment: 'negative', tone: 'solid', class: 'text-destructive-foreground bg-destructive' },
		{ sentiment: 'neutral', tone: 'solid', class: 'text-secondary-foreground bg-secondary' },
		// Ghost tone — text only
		{ sentiment: 'positive', tone: 'ghost', class: 'text-success bg-transparent' },
		{ sentiment: 'negative', tone: 'ghost', class: 'text-destructive bg-transparent' },
		{ sentiment: 'neutral', tone: 'ghost', class: 'text-muted-foreground bg-transparent' },
	],
	defaultVariants: {
		direction: 'flat',
		tone: 'soft',
		sentiment: 'neutral',
		severity: 'normal',
		size: 'default',
	},
});

export type StatTrendVariants = VariantProps<typeof statTrendVariants>;
export type TrendDirection = NonNullable<StatTrendVariants['direction']>;
export type TrendTone = NonNullable<StatTrendVariants['tone']>;
export type TrendSize = NonNullable<StatTrendVariants['size']>;
export type TrendSeverity = NonNullable<StatTrendVariants['severity']>;
