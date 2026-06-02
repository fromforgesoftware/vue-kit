import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Container for a stacked group of avatars. Items overlap with a small negative
 * inline-margin and a ring matching the surrounding background.
 */
export const avatarGroupVariants = cva('flex items-center', {
	variants: {},
	defaultVariants: {},
});

/**
 * Per-item wrapper variants — controls the overlap distance between stacked avatars.
 * Tighter sizes use less overlap so the initials remain readable.
 */
export const avatarGroupItemVariants = cva('first:ms-0 ring-2 ring-background rounded-full', {
	variants: {
		size: {
			xs: '-ms-1',
			sm: '-ms-1.5',
			default: '-ms-2',
			lg: '-ms-2.5',
			xl: '-ms-3',
		},
	},
	defaultVariants: {
		size: 'default',
	},
});

/**
 * Overflow indicator variants — the trailing "+N" avatar shown when more items exist
 * than the configured `max`. Uses a muted surface to recede from the named avatars.
 */
export const avatarGroupOverflowVariants = cva('bg-muted text-muted-foreground', {
	variants: {},
	defaultVariants: {},
});

export type AvatarGroupVariants = VariantProps<typeof avatarGroupVariants>;
export type AvatarGroupItemVariants = VariantProps<typeof avatarGroupItemVariants>;

/**
 * Single avatar in a group. Mirrors the {@link Avatar} props that compose into
 * the rendered face plus an optional `description` line shown in the default
 * tooltip beneath the name.
 */
export interface AvatarGroupItem {
	/** Full name. Used to derive initials and as default tooltip title. */
	name?: string;
	/** Initials shown in the fallback (overrides `name`-derived initials). */
	initials?: string;
	/** Image URL. */
	src?: string;
	/** Image alt text. Defaults to `name` then to "Avatar". */
	alt?: string;
	/** Optional second line in the default tooltip (e.g. email, role). */
	description?: string;
}
