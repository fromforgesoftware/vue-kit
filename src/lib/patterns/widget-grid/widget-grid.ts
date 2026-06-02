import { cva, type VariantProps } from 'class-variance-authority';

export const widgetGridVariants = cva('relative w-full box-border', {
	variants: {},
	defaultVariants: {},
});

export const widgetGridItemVariants = cva(
	'absolute rounded-xl border border-border bg-card text-card-foreground overflow-hidden transition-all duration-100 select-none',
	{
		variants: {
			editable: {
				true: 'cursor-move hover:shadow-lg hover:border-primary/30',
				false: '',
			},
			dragging: {
				// While interacting the item lifts: bump z so it overlays siblings,
				// drop the snap-easing transition so it tracks the cursor 1:1, and
				// add a soft shadow for the "picked up" feel.
				true: 'shadow-2xl z-30 transition-none',
				false: '',
			},
			// Optional micro-scale during drag. Toggled separately so consumers can
			// disable the grow effect (e.g. when using `showPlaceholder` mode).
			scaleOnDrag: {
				true: 'scale-[1.02]',
				false: '',
			},
		},
		defaultVariants: {
			editable: false,
			dragging: false,
			scaleOnDrag: true,
		},
	},
);

// Drag-target ghost shown when `showPlaceholder` is true. Sits behind the
// dragged item (which dims via the `dragging` variant), so the operator
// sees both the panel-being-moved and where it'll land.
export const widgetGridPlaceholderVariants = cva(
	'absolute rounded-xl border-2 border-dashed border-primary/60 bg-primary/10 pointer-events-none transition-all duration-100',
	{ variants: {}, defaultVariants: {} },
);

export type WidgetGridBackground = 'none' | 'grid' | 'dots';

export type WidgetGridVariants = VariantProps<typeof widgetGridVariants>;
export type WidgetGridItemVariants = VariantProps<typeof widgetGridItemVariants>;

export interface GridLayoutConfig {
	cols: number;
	snapColumns: number;
	rows: number;
	rowHeight: { value: number } | number;
	margin: number;
	draggable: boolean;
	resizable: boolean;
	items: {
		value: Array<{ i: string | number; x: number; y: number; w: number; h: number }>;
	};
	// Mutated by `WidgetGridItem` while the user drags or resizes — read by
	// `WidgetGrid` to render the optional drop-target placeholder. `null` when
	// no item is currently being manipulated.
	dragging: GridItemPosition | null;
	// Mirrors the `showPlaceholder` prop so items can switch between
	// smooth-follow drag (placeholder mode, like Grafana) and snap-during-drag
	// (default) without re-exporting the prop on every item.
	showPlaceholder: boolean;
	// When true, suppresses the micro-scale grow effect on click/drag.
	disableDragScale: boolean;
}

export interface GridItemPosition {
	i: string | number;
	x: number;
	y: number;
	w: number;
	h: number;
}
