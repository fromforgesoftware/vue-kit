import { cva, type VariantProps } from 'class-variance-authority';

/** Slider root. `touch-none` + `select-none` keep mobile drag from scrolling / selecting text. */
export const sliderVariants = cva(
	['relative flex touch-none items-center select-none', 'data-[disabled]:opacity-50'].join(' '),
	{
		variants: {
			orientation: {
				horizontal: 'w-full flex-row',
				vertical: 'h-full min-h-44 w-auto flex-col',
			},
			size: {
				sm: '',
				default: '',
			},
		},
		defaultVariants: {
			orientation: 'horizontal',
			size: 'default',
		},
	},
);

// Track — the unfilled portion of the slider rail.
export const sliderTrackVariants = cva('relative grow overflow-hidden rounded-full bg-muted', {
	variants: {
		orientation: {
			horizontal: 'w-full',
			vertical: 'h-full',
		},
		size: {
			sm: '',
			default: '',
		},
	},
	compoundVariants: [
		{ orientation: 'horizontal', size: 'sm', class: 'h-1' },
		{ orientation: 'horizontal', size: 'default', class: 'h-1.5' },
		{ orientation: 'vertical', size: 'sm', class: 'w-1' },
		{ orientation: 'vertical', size: 'default', class: 'w-1.5' },
	],
	defaultVariants: {
		orientation: 'horizontal',
		size: 'default',
	},
});

// Range — the filled portion of the track between min and the current value.
export const sliderRangeVariants = cva('absolute bg-primary', {
	variants: {
		orientation: {
			horizontal: 'h-full',
			vertical: 'w-full',
		},
	},
	defaultVariants: {
		orientation: 'horizontal',
	},
});

/**
 * Draggable knob. `::before` expands the pointer hit-target to ≥ 24×24
 * (WCAG SC 2.5.8) without inflating the visible thumb size.
 */
export const sliderThumbVariants = cva(
	[
		'relative block shrink-0 rounded-full border bg-background shadow-sm',
		'border-primary',
		'transition-[color,box-shadow] outline-none',
		'hover:ring-4 hover:ring-ring/30',
		'focus-visible:ring-4 focus-visible:ring-ring/40',
		'disabled:pointer-events-none disabled:opacity-50',
		'aria-[invalid=true]:border-destructive aria-[invalid=true]:ring-destructive/20',
		// Pointer hit-area expansion to ≥ 24×24 — purely interactive, not visual.
		"before:content-[''] before:absolute before:inset-0 before:-m-1",
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-3.5',
				default: 'size-4',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export type SliderVariants = VariantProps<typeof sliderVariants>;
export type SliderOrientation = NonNullable<SliderVariants['orientation']>;
export type SliderSize = NonNullable<SliderVariants['size']>;
