import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Outer container variants. Density mirrors ChatBubble's `size` so a
 * `<ChatPanel size="sm">` defaults its bubbles to `sm` too. The panel
 * itself always fills its parent (`h-full w-full`) — parent decides
 * whether that parent is a dialog, drawer, full-screen page, etc.
 */
export const chatPanelVariants = cva('flex h-full w-full min-h-0 flex-col', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
		},
		bordered: {
			true: 'rounded-xl border border-border bg-card',
			false: '',
		},
	},
	defaultVariants: {
		size: 'default',
		bordered: false,
	},
});

export type ChatPanelVariants = VariantProps<typeof chatPanelVariants>;
export type ChatPanelSize = NonNullable<ChatPanelVariants['size']>;

/**
 * Author role — drives the default `<ChatBubble>` direction. Aligns
 * with `ChatBubble`'s `direction` prop so a message object maps 1:1
 * to a bubble when using the built-in renderer. Override per-message
 * via the `message` render-prop slot.
 */
export type ChatPanelRole = 'incoming' | 'outgoing' | 'system';

/**
 * Tool-call status — mirrors what an AI workflow surfaces to the user:
 * running while mid-execution, done on success, failed on error,
 * awaiting-confirmation while a write tool waits for approval,
 * awaiting-clarification while the workflow needs a picker resolution.
 */
export type ChatPanelToolStatus =
	| 'running'
	| 'done'
	| 'failed'
	| 'awaiting-confirmation'
	| 'awaiting-clarification';

interface ChatPanelMessageBase {
	/** Stable identifier — used as the `v-for` key. */
	id: string | number;
	/** Rendered under the bubble / card. */
	time?: Date | string | number;
	/** Arbitrary consumer payload — useful for tool-calls, attachments, etc. */
	data?: unknown;
}

/** Plain conversational turn. Default kind when none is specified. */
export interface ChatPanelTextMessage extends ChatPanelMessageBase {
	kind?: 'text';
	role: ChatPanelRole;
	/** Plain-text content. For rich rendering pass it through the `message` slot. */
	content?: string;
	/** Replaces the bubble body with a spinner — for typing indicators. */
	loading?: boolean;
	/** Accessible author name. Forwarded to `ChatBubble`'s `authorLabel`. */
	author?: string;
	/** Convenience field for the consumer's own `message` slot rendering. */
	avatarUrl?: string;
}

/**
 * Tool-call in the message stream — rendered by `ToolCallStep`. Shown
 * for any tool the AI invokes. Status drives the badge + spinner; args
 * + result are JSON strings (the LLM speaks JSON) or already-parsed
 * objects depending on the producer.
 */
export interface ChatPanelToolCallMessage extends ChatPanelMessageBase {
	kind: 'tool-call';
	toolCallID: string;
	toolName: string;
	status: ChatPanelToolStatus;
	/** Tool args — JSON string from the LLM, or a pre-parsed object. */
	args?: string | Record<string, unknown>;
	/** Tool result — string (Go formatted) or object. Present on `done`. */
	result?: string | Record<string, unknown>;
	/** Error message — present on `failed`. */
	error?: string;
}

/**
 * Inline approval request — rendered by `InlineConfirmation`. Pushed
 * when the backend emits `ai.confirmation.request` for a write tool.
 * `decision` is set once the user clicks; the parent surface owns
 * actually sending the decision back to the API.
 */
export interface ChatPanelConfirmationMessage extends ChatPanelMessageBase {
	kind: 'confirmation';
	toolCallID: string;
	toolName: string;
	/** Args the tool will run with — JSON string or object. */
	args?: string | Record<string, unknown>;
	/** Optional human-readable summary built server-side. */
	summary?: string;
	/** Locks the buttons after the user responds. */
	decision?: 'approve' | 'reject' | null;
}

/**
 * Inline picker — rendered by `InlineClarification`. Pushed when the
 * backend emits `ai.clarification` (today: tenant disambiguation).
 * `selected` is set once the user picks; parent owns the submit.
 */
export interface ChatPanelClarificationMessage extends ChatPanelMessageBase {
	kind: 'clarification';
	toolCallID: string;
	toolName?: string;
	prompt: string;
	/** Generic argument name — `tenant` today, may be `employee`/`group` later. */
	argName?: string;
	options: Array<{
		value: string;
		label: string;
		description?: string;
	}>;
	/** Locks the picker after the user submits. */
	selected?: string | null;
}

/**
 * Discriminated union — every consumer should switch on `kind` (with
 * `kind ?? 'text'` for legacy text-only producers).
 */
export type ChatPanelMessage =
	| ChatPanelTextMessage
	| ChatPanelToolCallMessage
	| ChatPanelConfirmationMessage
	| ChatPanelClarificationMessage;
