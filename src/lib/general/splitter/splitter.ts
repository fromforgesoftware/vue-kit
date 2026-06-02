import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey, Ref } from 'vue';

// ───────────────────────────────────────────────────────────────────────────
// Splitter — drag-to-resize panel divider built on Reka UI's SplitterGroup.
// WCAG SC 2.5.7 (Dragging movements): the resize handle exposes a keyboard
// alternative — ArrowLeft/Right (horizontal) or ArrowUp/Down (vertical) —
// implemented by Reka internally on the underlying separator role.
// WCAG SC 2.5.8 (Target size minimum): the handle's hit area is ≥ 24×24 by
// extending an invisible expansion zone via ::before, while the visible
// rule stays a thin, calm 1–2 px line.
// ───────────────────────────────────────────────────────────────────────────

export const splitterVariants = cva('flex h-full w-full', {
	variants: {
		direction: {
			horizontal: 'flex-row',
			vertical: 'flex-col',
		},
	},
	defaultVariants: { direction: 'horizontal' },
});

export const splitterPanelVariants = cva('min-h-0 min-w-0', {
	variants: {
		surface: {
			none: '',
			card: 'rounded-lg border bg-card',
			muted: 'bg-muted',
		},
	},
	defaultVariants: { surface: 'none' },
});

// Visible rule + invisible 24px expansion zone (::before) for hit area.
// `data-resize-handle-state="drag"` is set by Reka while dragging; we tint
// the rule with the focus ring colour so the user has a clear visual.
export const splitterResizeHandleVariants = cva(
	[
		'group/handle relative shrink-0 outline-none',
		'transition-colors',
		// Visible rule colour — calm by default, ring-coloured when focused or dragging.
		'bg-border',
		'hover:bg-ring/40 focus-visible:bg-ring data-[resize-handle-state=drag]:bg-ring',
		// Cursor + axis sizing.
		'data-[orientation=horizontal]:w-px data-[orientation=horizontal]:cursor-col-resize',
		'data-[orientation=vertical]:h-px data-[orientation=vertical]:cursor-row-resize',
		// 24×24 hit area (WCAG 2.5.8) via invisible expansion.
		"before:content-[''] before:absolute before:z-10",
		'data-[orientation=horizontal]:before:inset-y-0 data-[orientation=horizontal]:before:-inset-x-3',
		'data-[orientation=vertical]:before:inset-x-0 data-[orientation=vertical]:before:-inset-y-3',
		// Focus ring — tied to the visible rule via CSS rather than ring utilities so
		// it works inside flex layouts that clip outline.
		'focus-visible:outline-2 focus-visible:outline-ring focus-visible:outline-offset-2',
	].join(' '),
	{
		variants: {
			thickness: {
				// 1px hairline (default — calmest)
				hairline: 'data-[orientation=horizontal]:w-px data-[orientation=vertical]:h-px',
				// 2px standard
				default: 'data-[orientation=horizontal]:w-0.5 data-[orientation=vertical]:h-0.5',
				// 4px thicker rule — for complex layouts where a clear gutter is wanted.
				thick: 'data-[orientation=horizontal]:w-1 data-[orientation=vertical]:h-1',
			},
		},
		defaultVariants: { thickness: 'hairline' },
	},
);

export type SplitterVariants = VariantProps<typeof splitterVariants>;
export type SplitterPanelVariants = VariantProps<typeof splitterPanelVariants>;
export type SplitterResizeHandleVariants = VariantProps<typeof splitterResizeHandleVariants>;
export type SplitterDirection = NonNullable<SplitterVariants['direction']>;
export type SplitterPanelSurface = NonNullable<SplitterPanelVariants['surface']>;
export type SplitterHandleThickness = NonNullable<SplitterResizeHandleVariants['thickness']>;

// Provided by <Splitter> so children can derive their orientation defaults.
export const SPLITTER_DIRECTION_KEY: InjectionKey<Ref<SplitterDirection>> =
	Symbol('splitter-direction');
