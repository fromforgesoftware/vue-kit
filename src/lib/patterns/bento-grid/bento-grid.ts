import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Per-card span. Caller picks the size that fits the card's content.
 *
 * - `sm`      — 1×1 (default)
 * - `md`      — 2×1
 * - `wide`    — full row width × 1 (`col-span-full`)
 * - `tall`    — 1×2
 * - `tall-lg` — 1×3 (for a side-rail card with a list inside)
 * - `hero`    — 2×2
 *
 * Combine with `grid-auto-flow: dense` on the grid (provided by `BentoGrid`)
 * so smaller cards backfill holes left by larger ones — no manual line math.
 */
export type BentoSize = 'sm' | 'md' | 'wide' | 'tall' | 'tall-lg' | 'hero';

export const bentoGridVariants = cva('grid [grid-auto-flow:dense]', {
	variants: {
		cols: {
			1: 'grid-cols-1',
			2: 'grid-cols-1 sm:grid-cols-2',
			3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
			4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
			6: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-6',
		},
		gap: {
			sm: 'gap-2',
			md: 'gap-3',
			lg: 'gap-4',
		},
	},
	defaultVariants: {
		cols: 3,
		gap: 'md',
	},
});

/**
 * `@container` is added so consumers can use container queries inside the
 * card to re-flow content (e.g. `@sm:grid-cols-2`) without resizing the card
 * itself. This is the canonical pattern for "card adapts to its width" — see
 * MDN container queries / shadcn / Magic UI bento implementations.
 */
export const bentoCardVariants = cva('@container', {
	variants: {
		size: {
			sm: 'col-span-1 row-span-1',
			md: 'col-span-1 sm:col-span-2 row-span-1',
			wide: 'col-span-full row-span-1',
			tall: 'col-span-1 row-span-1 sm:row-span-2',
			'tall-lg': 'col-span-1 row-span-1 sm:row-span-3',
			hero: 'col-span-1 sm:col-span-2 row-span-1 sm:row-span-2',
		},
	},
	defaultVariants: {
		size: 'sm',
	},
});

export type BentoGridVariants = VariantProps<typeof bentoGridVariants>;
export type BentoCardVariants = VariantProps<typeof bentoCardVariants>;
export type BentoCols = NonNullable<BentoGridVariants['cols']>;
export type BentoGap = NonNullable<BentoGridVariants['gap']>;
