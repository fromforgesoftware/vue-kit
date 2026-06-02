import { cva, type VariantProps } from 'class-variance-authority';

/** Root wrapper for the 2D colour-pick surface. `relative` anchors the absolutely-positioned thumb. */
export const colorAreaRootVariants = cva('relative inline-block', {
	variants: {
		size: {
			sm: '',
			default: '',
			lg: '',
			full: 'block w-full',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

/** Drawable colour surface. Reka injects the gradient as inline `style`; we paint the geometry. */
export const colorAreaAreaVariants = cva(
	[
		'relative rounded-lg overflow-hidden',
		'outline-none',
		'data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'size-[160px]',
				default: 'size-[200px]',
				lg: 'size-[240px]',
				full: 'size-full min-h-[160px]',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

/**
 * Thumb knob. `::before` expansion ring lifts the pointer hit-target to ≥ 24×24
 * (WCAG SC 2.5.8) without growing the visible knob; white border + transparent
 * fill keeps it visible on any gradient — bright or dark — without a theme token.
 */
export const colorAreaThumbVariants = cva(
	[
		'block size-4 rounded-full border-2 border-white bg-white/0 shadow-md',
		'transition-[box-shadow] outline-none cursor-pointer',
		'hover:ring-4 hover:ring-ring/30',
		'focus-visible:ring-4 focus-visible:ring-ring/40',
		"before:content-[''] before:absolute before:inset-0 before:-m-1",
	].join(' '),
);

export type ColorAreaVariants = VariantProps<typeof colorAreaRootVariants>;
export type ColorAreaSize = NonNullable<ColorAreaVariants['size']>;
