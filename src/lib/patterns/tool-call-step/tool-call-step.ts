import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Status of a tool the AI is invoking.
 *  - `running`                — tool actively executing
 *  - `done`                   — completed successfully
 *  - `failed`                 — execution failed
 *  - `awaiting-confirmation`  — write tool paused waiting for user approval
 *  - `awaiting-clarification` — paused waiting for a picker selection
 *
 * Mirrors `ChatPanelToolStatus` from chat-panel.ts — kept locally so
 * the component can be used outside ChatPanel too.
 */
export type ToolCallStepStatus =
	| 'running'
	| 'done'
	| 'failed'
	| 'awaiting-confirmation'
	| 'awaiting-clarification';

export const toolCallStepStatusVariants = cva(
	'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[10px] font-medium',
	{
		variants: {
			status: {
				running: 'bg-primary/10 text-primary',
				done: 'bg-success/10 text-success',
				failed: 'bg-destructive/10 text-destructive',
				'awaiting-confirmation': 'bg-warning/10 text-warning-foreground',
				'awaiting-clarification': 'bg-info/10 text-info',
			},
		},
		defaultVariants: { status: 'running' },
	},
);

export type ToolCallStepStatusVariants = VariantProps<typeof toolCallStepStatusVariants>;
