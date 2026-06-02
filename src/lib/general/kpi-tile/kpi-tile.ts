import { cva } from 'class-variance-authority';

export const kpiTileVariants = cva(
	'flex flex-col gap-1 rounded-lg border border-border bg-card p-4 text-card-foreground shadow-xs',
	{
		variants: {
			size: {
				sm: 'p-3 gap-0.5',
				default: 'p-4 gap-1',
				lg: 'p-6 gap-2',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

export type KpiTrendDirection = 'up' | 'down' | 'flat';

export interface KpiDelta {
	value: number;
	/** When true, treats positive change as bad (e.g. churn going up). */
	invertSentiment?: boolean;
	format?: 'percent' | 'absolute';
}

export function deltaSentiment(delta: KpiDelta): 'good' | 'bad' | 'neutral' {
	if (delta.value === 0) return 'neutral';
	const positive = delta.value > 0;
	if (delta.invertSentiment) return positive ? 'bad' : 'good';
	return positive ? 'good' : 'bad';
}

export type KpiTileSize = NonNullable<Parameters<typeof kpiTileVariants>[0]>['size'];
