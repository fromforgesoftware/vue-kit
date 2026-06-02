<template>
	<Collapsible
		v-model:open="isOpen"
		variant="ghost"
		:class="cn('rounded-lg border border-border bg-card/50 text-xs', $attrs.class as string)"
		data-slot="tool-call-step"
		:data-status="status"
	>
		<CollapsibleTrigger as-child>
			<button
				type="button"
				class="flex w-full cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-left hover:bg-muted/30 outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
				data-slot="tool-call-step-trigger"
			>
				<Wrench class="size-3.5 shrink-0 text-muted-foreground" />
				<span class="flex-1 truncate font-mono text-foreground">{{ toolName }}</span>
				<Badge
					:variant="statusBadgeVariant"
					size="xs"
					shape="pill"
					data-slot="tool-call-step-status"
				>
					<Spinner v-if="status === 'running'" size="xs" tone="current" />
					<Check v-else-if="status === 'done'" class="size-3" />
					<X v-else-if="status === 'failed'" class="size-3" />
					<Clock
						v-else-if="status === 'awaiting-confirmation' || status === 'awaiting-clarification'"
						class="size-3"
					/>
					<span>{{ statusLabel }}</span>
				</Badge>
				<ChevronDown
					:class="[
						'size-3.5 shrink-0 text-muted-foreground transition-transform',
						isOpen && 'rotate-180',
					]"
				/>
			</button>
		</CollapsibleTrigger>

		<CollapsibleContent
			class="border-t border-border"
			inner-class="px-3 py-2 space-y-2"
			data-slot="tool-call-step-body"
		>
			<slot name="body" :args="formattedArgs" :result="formattedResult" :error="error">
				<div v-if="formattedArgs" class="space-y-1">
					<div class="text-[10px] uppercase tracking-wide text-muted-foreground">Arguments</div>
					<pre
						class="max-h-32 overflow-auto rounded bg-muted/40 p-2 font-mono text-[11px] text-foreground whitespace-pre-wrap break-words"
						data-slot="tool-call-step-args"
						>{{ formattedArgs }}</pre
					>
				</div>

				<div v-if="error" class="space-y-1">
					<div class="text-[10px] uppercase tracking-wide text-destructive">Error</div>
					<pre
						class="max-h-32 overflow-auto rounded bg-destructive/10 p-2 font-mono text-[11px] text-destructive whitespace-pre-wrap break-words"
						data-slot="tool-call-step-error"
						>{{ error }}</pre
					>
				</div>

				<div v-else-if="formattedResult" class="space-y-1">
					<div class="text-[10px] uppercase tracking-wide text-muted-foreground">Result</div>
					<pre
						class="max-h-48 overflow-auto rounded bg-muted/40 p-2 font-mono text-[11px] text-foreground whitespace-pre-wrap break-words"
						data-slot="tool-call-step-result"
						>{{ formattedResult }}</pre
					>
				</div>
			</slot>
		</CollapsibleContent>
	</Collapsible>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Check, ChevronDown, Clock, Wrench, X } from '@lucide/vue';
import { cn } from '../../../helpers/cn.js';
import Badge from '../../general/badge/Badge.vue';
import Collapsible from '../../general/collapsible/Collapsible.vue';
import CollapsibleTrigger from '../../general/collapsible/CollapsibleTrigger.vue';
import CollapsibleContent from '../../general/collapsible/CollapsibleContent.vue';
import Spinner from '../../general/spinner/Spinner.vue';
import type { BadgeVariant } from '../../general/badge/badge.js';
import type { ToolCallStepStatus } from './tool-call-step.js';

defineOptions({ inheritAttrs: false });

interface ToolCallStepProps {
	toolName: string;
	status: ToolCallStepStatus;
	/** JSON string from the LLM, or pre-parsed object — both render to pretty JSON. */
	args?: string | Record<string, unknown>;
	/** Result payload — string (typical backend format) or object. */
	result?: string | Record<string, unknown>;
	/** Error message rendered in place of `result` when present. */
	error?: string;
	/** Initial open state. Default: open while running / waiting, closed when done/failed. */
	defaultOpen?: boolean;
}

const props = withDefaults(defineProps<ToolCallStepProps>(), {
	args: undefined,
	result: undefined,
	error: undefined,
	defaultOpen: undefined,
});

const initialOpen =
	props.defaultOpen ??
	(props.status === 'running' ||
		props.status === 'awaiting-confirmation' ||
		props.status === 'awaiting-clarification');
const isOpen = ref(initialOpen);

const statusLabel = computed(() => {
	switch (props.status) {
		case 'running':
			return 'Calling…';
		case 'done':
			return 'Done';
		case 'failed':
			return 'Failed';
		case 'awaiting-confirmation':
			return 'Awaiting approval';
		case 'awaiting-clarification':
			return 'Needs clarification';
		default:
			return '';
	}
});

const statusBadgeVariant = computed<BadgeVariant>(() => {
	switch (props.status) {
		case 'done':
			return 'soft-success';
		case 'failed':
			return 'soft-destructive';
		case 'awaiting-confirmation':
			return 'soft-warning';
		case 'awaiting-clarification':
		case 'running':
		default:
			return 'soft-info';
	}
});

// Pretty-print JSON for args/result. The backend sends args as JSON strings
// (the LLM's raw tool-call argument blob) and results as Go-formatted strings.
function pretty(value: string | Record<string, unknown> | undefined): string {
	if (value == null || value === '') return '';
	if (typeof value === 'object') {
		try {
			return JSON.stringify(value, null, 2);
		} catch {
			return String(value);
		}
	}
	const trimmed = value.trim();
	if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
		try {
			return JSON.stringify(JSON.parse(trimmed), null, 2);
		} catch {
			return value;
		}
	}
	return value;
}

const formattedArgs = computed(() => pretty(props.args));
const formattedResult = computed(() => pretty(props.result));
</script>
