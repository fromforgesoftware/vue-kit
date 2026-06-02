import { cva, type VariantProps } from 'class-variance-authority';
import type { Component } from 'vue';

export const activityTimelineVariants = cva('flex flex-col gap-6', {
	variants: {},
	defaultVariants: {},
});

export const activityTimelineGroupVariants = cva('flex flex-col', {
	variants: {},
	defaultVariants: {},
});

export const activityTimelineItemVariants = cva('flex gap-4 relative py-3 group', {
	variants: {},
	defaultVariants: {},
});

export const activityTimelineIconVariants = cva(
	'flex items-center justify-center size-6 rounded-full bg-background border border-border shadow-sm',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type ActivityTimelineVariants = VariantProps<typeof activityTimelineVariants>;

export type ActivityType =
	| 'status_change'
	| 'email'
	| 'attribute_change'
	| 'add_to_list'
	| 'assignment'
	| 'merge'
	| 'calendar_event'
	| 'expandable_group'
	| 'comment'
	| 'default';

export interface ActivityUser {
	/**
	 * User's display name.
	 */
	name: string;
	/**
	 * User's avatar URL.
	 */
	avatarUrl?: string;
}

export interface ActivityItem {
	/**
	 * Unique identifier.
	 */
	id: string;
	/**
	 * Type of activity.
	 */
	type: ActivityType;
	/**
	 * Timestamp display string.
	 */
	timestamp: string;
	/**
	 * Absolute timestamp shown on hover; falls back to `timestamp` when absent.
	 */
	timestampTooltip?: string;
	/**
	 * Primary user associated with this activity.
	 */
	user?: ActivityUser;
	/**
	 * Multiple users (for email, calendar events).
	 */
	users?: ActivityUser[];
	/**
	 * Activity title.
	 */
	title?: string;
	/**
	 * Activity description.
	 */
	description?: string;
	/**
	 * Additional metadata.
	 */
	meta?: {
		label?: string;
		value?: string;
		badge?: string;
		badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
		count?: number;
	};
	/**
	 * Collapsed items for expandable groups.
	 */
	collapsedItems?: ActivityItem[];
	/**
	 * Attribute changes for attribute_change type.
	 */
	attributeChanges?: Array<{
		attribute: string;
		oldValue: string;
		newValue: string;
	}>;
	/**
	 * Optional row-level actions. Any item can opt into a small action
	 * bar (one or two buttons) below its content — useful for "approve /
	 * deny", "accept / reject", "show diff / revert" patterns that
	 * belong to the item's lifecycle. Renders only when present.
	 *
	 * The handler receives no arguments because the item id is already
	 * known to the consumer that built the action.
	 */
	actions?: Array<{
		label: string;
		icon?: Component;
		variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'ghost';
		onClick: () => void;
	}>;
}

export interface ActivityGroup {
	/**
	 * Group title (e.g., "Today", "Yesterday").
	 */
	title: string;
	/**
	 * Items in this group.
	 */
	items: ActivityItem[];
}
