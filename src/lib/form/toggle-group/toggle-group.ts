import { cva, type VariantProps } from 'class-variance-authority';

// A row (or column) of Toggle items that share a single border. The container
// strips inner items' rounding and individual borders, then re-applies a
// unified border on the wrapper and a divider between items. Reka manages the
// roving focus and keyboard navigation.
//
// Items pull their visual style from the Toggle CVA so density and variants
// stay consistent with a standalone Toggle.
export const toggleGroupVariants = cva(
	[
		'inline-flex items-center rounded-md border border-input bg-background',
		// Strip per-item rounding and border so the wrapper provides them.
		'[&>*]:rounded-none [&>*]:border-0 [&>*]:shadow-none',
		// First / last item get the wrapper rounding so the border looks solid.
		'[&>*:first-child]:rounded-l-md [&>*:last-child]:rounded-r-md',
		// Divider between items.
		'[&>*+*]:border-l [&>*+*]:border-input',
	].join(' '),
	{
		variants: {
			orientation: {
				horizontal: 'flex-row',
				vertical: [
					'flex-col',
					// Reset horizontal-only side-rounding for vertical layout.
					'[&>*:first-child]:rounded-none [&>*:last-child]:rounded-none',
					'[&>*:first-child]:rounded-t-md [&>*:last-child]:rounded-b-md',
					// Vertical divider above the next item, not to the left.
					'[&>*+*]:border-l-0 [&>*+*]:border-t [&>*+*]:border-input',
				].join(' '),
			},
		},
		defaultVariants: {
			orientation: 'horizontal',
		},
	},
);

export type ToggleGroupVariants = VariantProps<typeof toggleGroupVariants>;
export type ToggleGroupOrientation = NonNullable<ToggleGroupVariants['orientation']>;
