<template>
	<div
		:class="
			cn('rounded-lg border border-warning/30 bg-warning/5 p-3 text-sm', $attrs.class as string)
		"
		data-slot="inline-confirmation"
		:data-decision="decision ?? 'pending'"
		role="region"
		:aria-label="`Approval required for ${toolName}`"
	>
		<div class="flex items-start gap-2">
			<ShieldAlert class="mt-0.5 size-4 shrink-0 text-warning-foreground" />
			<div class="flex-1 min-w-0">
				<div class="text-sm font-semibold text-foreground" data-slot="inline-confirmation-title">
					<slot name="title">{{ defaultTitle }}</slot>
				</div>
				<p
					v-if="summary"
					class="mt-1 text-sm text-muted-foreground whitespace-pre-wrap"
					data-slot="inline-confirmation-summary"
				>
					{{ summary }}
				</p>

				<Collapsible
					v-if="formattedArgs"
					variant="ghost"
					size="sm"
					class="mt-2"
					data-slot="inline-confirmation-details"
				>
					<CollapsibleTrigger
						chevron-position="left"
						class="text-[11px] uppercase tracking-wide text-muted-foreground hover:text-foreground"
					>
						Arguments
					</CollapsibleTrigger>
					<CollapsibleContent inner-class="pt-1">
						<pre
							class="max-h-32 overflow-auto rounded bg-muted/40 p-2 font-mono text-[11px] text-foreground whitespace-pre-wrap break-words"
							data-slot="inline-confirmation-args"
							>{{ formattedArgs }}</pre
						>
					</CollapsibleContent>
				</Collapsible>
			</div>
		</div>

		<div
			v-if="decision == null"
			class="mt-3 flex items-center justify-end gap-2"
			data-slot="inline-confirmation-actions"
		>
			<Button
				variant="ghost"
				size="sm"
				:disabled="busy"
				data-slot="inline-confirmation-reject"
				@click="onClick('reject')"
			>
				Reject
			</Button>
			<Button
				size="sm"
				:disabled="busy"
				:loading="busy && pending === 'approve'"
				data-slot="inline-confirmation-approve"
				@click="onClick('approve')"
			>
				Approve
			</Button>
		</div>

		<Badge
			v-else
			:variant="decision === 'approve' ? 'soft-success' : 'secondary'"
			size="sm"
			class="mt-2"
			data-slot="inline-confirmation-resolved"
			:data-decision="decision"
		>
			<Check v-if="decision === 'approve'" class="size-3" />
			<X v-else class="size-3" />
			<span>{{ decision === 'approve' ? 'Approved' : 'Rejected' }}</span>
		</Badge>
	</div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Check, ShieldAlert, X } from '@lucide/vue';
import { cn } from '../../../helpers/cn.js';
import Badge from '../../general/badge/Badge.vue';
import Button from '../../general/button/Button.vue';
import Collapsible from '../../general/collapsible/Collapsible.vue';
import CollapsibleTrigger from '../../general/collapsible/CollapsibleTrigger.vue';
import CollapsibleContent from '../../general/collapsible/CollapsibleContent.vue';

defineOptions({ inheritAttrs: false });

export type ConfirmationDecision = 'approve' | 'reject';

interface InlineConfirmationProps {
	/** Tool the LLM proposed — `update_employee`, `delete_schedule`, etc. */
	toolName: string;
	/** Args JSON the tool will run with. Object or JSON-string. */
	args?: string | Record<string, unknown>;
	/** Human-readable summary built server-side (preferred for UX). */
	summary?: string;
	/** Locks the buttons after the user's decision is known. */
	decision?: ConfirmationDecision | null;
	/** True while the parent is waiting on the API ack. */
	busy?: boolean;
}

const props = withDefaults(defineProps<InlineConfirmationProps>(), {
	args: undefined,
	summary: '',
	decision: null,
	busy: false,
});

const emit = defineEmits<{
	/** Fired when the user picks approve or reject. Parent owns the API call. */
	decide: [decision: ConfirmationDecision];
}>();

const pending = ref<ConfirmationDecision | null>(null);

function onClick(decision: ConfirmationDecision) {
	if (props.busy || props.decision != null) return;
	pending.value = decision;
	emit('decide', decision);
}

const defaultTitle = computed(() => `Approve \`${props.toolName}\`?`);

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
</script>
