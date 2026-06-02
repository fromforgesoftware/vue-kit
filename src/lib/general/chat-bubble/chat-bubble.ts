import { cva, type VariantProps } from 'class-variance-authority';

/** Chat-message bubble. `direction` controls colour + alignment, `size` the padding density. */
export const chatBubbleVariants = cva('relative max-w-3/4 rounded-lg break-words', {
	variants: {
		direction: {
			incoming: 'bg-muted text-foreground',
			outgoing: 'bg-primary text-primary-foreground',
			system: 'bg-secondary/60 text-secondary-foreground border border-border',
		},
		size: {
			sm: 'px-2.5 py-1.5 text-xs',
			default: 'px-3 py-2 text-sm',
			lg: 'px-4 py-3 text-base',
		},
	},
	defaultVariants: {
		direction: 'incoming',
		size: 'default',
	},
});

export const chatBubbleContainerVariants = cva('flex flex-col w-full', {
	variants: {
		direction: {
			incoming: 'items-start',
			outgoing: 'items-end',
			system: 'items-center',
		},
	},
	defaultVariants: {
		direction: 'incoming',
	},
});

export const chatBubbleTimeVariants = cva('my-0.5 text-xs text-muted-foreground', {
	variants: {
		direction: {
			incoming: 'ml-3',
			outgoing: 'mr-3',
			system: 'mt-1',
		},
	},
	defaultVariants: {
		direction: 'incoming',
	},
});

export type ChatBubbleVariants = VariantProps<typeof chatBubbleVariants>;
export type ChatBubbleDirection = NonNullable<ChatBubbleVariants['direction']>;
export type ChatBubbleSize = NonNullable<ChatBubbleVariants['size']>;
