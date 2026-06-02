import { cva, type VariantProps } from 'class-variance-authority';
import type { InjectionKey } from 'vue';

export const kbdVariants = cva(
	'inline-flex items-center justify-center font-mono text-muted-foreground select-none',
	{
		variants: {
			variant: {
				// Default — bordered "key" look with a soft surface; suitable for
				// shortcut overlays and help affordances.
				default: 'border border-border/50 bg-muted/60',
				// Ghost — inline, no chrome. The compound variants below strip the
				// chip sizing (padding / fixed height / min-width / rounded corners)
				// so the symbol sits flush with surrounding body copy. Use inside
				// menu items and list rows where a bordered chip would compete with
				// the row's own background and rhythm.
				ghost: 'border-0 bg-transparent',
			},
			size: {
				sm: 'h-[18px] min-w-[18px] px-[3px] text-[10px] font-medium rounded',
				default: 'h-6 min-w-6 px-1.5 text-xs font-medium rounded-md',
				lg: 'h-7 min-w-7 px-2 text-sm font-medium rounded-md',
			},
		},
		compoundVariants: [
			// Ghost discards everything chip-y — paddings, fixed heights, min-widths,
			// border-radius — so the kbd flows like text. Font size still scales
			// with the `size` prop, but each tier is bumped one step up so the
			// glyph doesn't look shrunken next to body copy.
			{
				variant: 'ghost',
				size: 'sm',
				class: 'h-auto min-w-0 px-0 text-xs font-normal rounded-none',
			},
			{
				variant: 'ghost',
				size: 'default',
				class: 'h-auto min-w-0 px-0 text-sm font-normal rounded-none',
			},
			{
				variant: 'ghost',
				size: 'lg',
				class: 'h-auto min-w-0 px-0 text-base font-normal rounded-none',
			},
		],
		defaultVariants: {
			variant: 'default',
			size: 'default',
		},
	},
);

export const kbdGroupVariants = cva('inline-flex items-center', {
	variants: {
		variant: {
			// Default — adjacent chips share their border so a multi-key shortcut
			// reads as a single unit.
			default:
				'[&>kbd+kbd]:border-l-0 [&>kbd:not(:last-child)]:rounded-r-none [&>kbd:not(:first-child)]:rounded-l-none',
			// Ghost — no border collapse to manage. A small gap keeps adjacent
			// glyphs legible without inserting a visible separator.
			ghost: 'gap-1',
		},
	},
	defaultVariants: {
		variant: 'default',
	},
});

export type KbdVariants = VariantProps<typeof kbdVariants>;
export type KbdSize = NonNullable<KbdVariants['size']>;
export type KbdVariant = NonNullable<KbdVariants['variant']>;

export const KBD_SIZE_KEY: InjectionKey<KbdSize> = Symbol('kbd-size');
export const KBD_VARIANT_KEY: InjectionKey<KbdVariant> = Symbol('kbd-variant');
