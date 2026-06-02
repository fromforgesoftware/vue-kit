import { cva, type VariantProps } from 'class-variance-authority';
import type { Component } from 'vue';

/** Action button rendered on a notification item (Approve / Reject / Review etc.). */
export interface NotificationCenterAction {
	/** App-defined key for the action (e.g. 'approve', 'reject', 'review') */
	key: string;
	/** Display label */
	label: string;
	/** Button visual style */
	variant?: 'default' | 'destructive' | 'secondary' | 'outline' | 'ghost';
	/** Optional lucide icon component */
	icon?: Component;
	/** Whether this action is disabled */
	disabled?: boolean;
	/** Whether this action is currently loading */
	loading?: boolean;
}

/** Single notification entry — content, metadata, optional actions. */
export interface NotificationCenterItemData {
	/** Unique notification ID */
	id: string;
	/** Notification subject/title */
	subject: string;
	/** Notification body text */
	body?: string;
	/** Lucide icon component for the notification */
	icon?: Component;
	/** Tailwind classes for the icon container (e.g. 'text-blue-500 bg-blue-50') */
	iconClass?: string;
	/** Avatar for the notification source. If set, renders instead of icon. */
	avatar?: {
		src?: string;
		name: string;
	};
	/** Whether the notification has been read */
	isRead: boolean;
	/** Pre-formatted relative time string (e.g. '5 min ago') */
	relativeTime: string;
	/** Optional badge */
	badge?: {
		label: string;
		variant?: 'default' | 'secondary' | 'destructive' | 'outline';
	};
	/** Action buttons (e.g. approve/reject). Renders a button row when present. */
	actions?: NotificationCenterAction[];
	/** Left border accent for high-priority items */
	accent?: boolean;
	/** Optional attachment chip */
	attachment?: {
		label: string;
		size?: string;
	};
}

/** Tab definition — used to filter notifications (e.g. "All", "Unread", "Mentions"). */
export interface NotificationCenterTab {
	/** Tab value/key */
	value: string;
	/** Tab display label */
	label: string;
	/** Optional badge count */
	count?: number;
}

/** `simple` is a flat list; `complex` adds tabs + grouping for power users. */
export type NotificationCenterVariant = 'simple' | 'complex';

/**
 * Popover content panel. On mobile (`max-sm:`) it collapses to a bottom-sheet
 * pinned to the viewport edges — `!important` overrides Reka's floating-ui
 * `position`/`transform` so the panel reads as a sheet instead of a tiny
 * popover under the bell icon.
 */
export const notificationCenterContentVariants = cva(
	[
		'w-full sm:w-[420px] max-w-[calc(100vw-1rem)] p-0',
		// Mobile bottom-sheet: Reka's PopoverContent positions itself with inline
		// styles via floating-ui, so we use `!` to override its `transform`,
		// `top`, `left`, and `position` on viewports < sm.
		'max-sm:!fixed max-sm:!inset-x-0 max-sm:!top-auto max-sm:!bottom-0',
		'max-sm:!left-0 max-sm:!right-0',
		'max-sm:[transform:none!important]',
		'max-sm:rounded-t-2xl max-sm:rounded-b-none',
		'max-sm:max-w-full max-sm:max-h-[85dvh]',
		'max-sm:data-[state=closed]:slide-out-to-bottom max-sm:data-[state=open]:slide-in-from-bottom',
	].join(' '),
	{
		variants: {},
		defaultVariants: {},
	},
);

export const notificationCenterHeaderVariants = cva(
	'flex items-center justify-between px-4 py-3 border-b border-border shrink-0',
	{
		variants: {},
		defaultVariants: {},
	},
);

export const notificationCenterItemVariants = cva(
	'flex gap-3 px-4 py-3 cursor-pointer transition-colors hover:bg-accent/50 border-b border-border/50 last:border-b-0',
	{
		variants: {
			// Read state is signalled by the dot on the right (and absence of the
			// subtle accent tint) — no need to dim the entire row, which made
			// already-actioned notifications hard to scan.
			isRead: {
				true: '',
				false: 'bg-accent/20',
			},
			accent: {
				true: 'border-l-2 border-l-destructive',
				false: '',
			},
		},
		defaultVariants: {
			isRead: false,
			accent: false,
		},
	},
);

export const notificationCenterFooterVariants = cva(
	'flex items-center justify-center px-4 py-2.5 border-t border-border shrink-0',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type NotificationCenterContentVariants = VariantProps<
	typeof notificationCenterContentVariants
>;
export type NotificationCenterItemVariants = VariantProps<typeof notificationCenterItemVariants>;
