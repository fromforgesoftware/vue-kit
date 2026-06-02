import { cva } from 'class-variance-authority';

export const sparklineVariants = cva('inline-block align-middle', {
	variants: {
		tone: {
			default: 'text-foreground',
			muted: 'text-muted-foreground',
			success: 'text-success',
			warning: 'text-warning',
			destructive: 'text-destructive',
			info: 'text-info',
		},
	},
	defaultVariants: { tone: 'default' },
});

export type SparklineTone = NonNullable<Parameters<typeof sparklineVariants>[0]>['tone'];

export interface SparklinePoints {
	path: string;
	areaPath: string;
	min: number;
	max: number;
	width: number;
	height: number;
}

export function buildSparklinePath(
	values: number[],
	width: number,
	height: number,
	padding = 1,
): SparklinePoints {
	if (values.length === 0) {
		return { path: '', areaPath: '', min: 0, max: 0, width, height };
	}
	const min = Math.min(...values);
	const max = Math.max(...values);
	const range = max - min || 1;
	const usableWidth = width - padding * 2;
	const usableHeight = height - padding * 2;
	const stepX = values.length === 1 ? 0 : usableWidth / (values.length - 1);

	const xy = values.map((v, i) => {
		const x = padding + i * stepX;
		const y = padding + (1 - (v - min) / range) * usableHeight;
		return [x, y] as const;
	});

	const path = xy.map(([x, y], i) => `${i === 0 ? 'M' : 'L'}${round(x)},${round(y)}`).join(' ');

	const first = xy[0];
	const last = xy[xy.length - 1];
	const baseY = height - padding;
	const areaPath = `${path} L${round(last[0])},${baseY} L${round(first[0])},${baseY} Z`;

	return { path, areaPath, min, max, width, height };
}

function round(n: number): number {
	return Math.round(n * 100) / 100;
}
