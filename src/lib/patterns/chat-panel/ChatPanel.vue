<template>
	<div :class="containerClasses" data-slot="chat-panel">
		<!-- Header: hidden when `hideHeader`. Slot escape-hatches let consumers
         compose pieces or replace the whole header. -->
		<header
			v-if="!hideHeader"
			class="flex shrink-0 items-center gap-2 border-b border-border px-3 py-2.5"
			data-slot="chat-panel-header"
		>
			<slot name="header">
				<slot name="header-start" />
				<div class="flex-1 min-w-0">
					<slot name="header-title">
						<h2
							v-if="title"
							class="truncate text-sm font-semibold text-foreground"
							data-slot="chat-panel-title"
						>
							{{ title }}
						</h2>
					</slot>
				</div>
				<slot name="header-actions" />
			</slot>
		</header>

		<!-- Body: scrollable message list. Either renders the empty state, or
         iterates messages through the default ChatBubble renderer (overridable
         via the `message` slot). `messages-footer` appends extra inline
         content — e.g. a confirmation card, clarification picker. -->
		<div
			ref="bodyEl"
			class="flex-1 overflow-y-auto px-4 py-3"
			data-slot="chat-panel-body"
			@scroll="onBodyScroll"
		>
			<div
				v-if="!messages.length && !$slots['messages-footer']"
				class="flex h-full w-full items-center justify-center"
				data-slot="chat-panel-empty"
			>
				<slot name="empty">
					<div class="text-center text-sm text-muted-foreground">
						<p v-if="emptyTitle" class="text-base font-semibold text-foreground">
							{{ emptyTitle }}
						</p>
						<p v-if="emptyDescription" class="mt-1">{{ emptyDescription }}</p>
					</div>
				</slot>
			</div>
			<div v-else class="flex flex-col gap-3" data-slot="chat-panel-messages">
				<template v-for="(msg, index) in messages" :key="msg.id">
					<slot name="message" :message="msg" :index="index">
						<!-- Default renderer covers `text` messages (backward-compatible
                 with the legacy shape — no `kind` field). New kinds
                 (`tool-call`, `confirmation`, `clarification`) require a
                 custom `message` slot wired by the consumer; the patterns
                 they should compose with live alongside this one in
                 `@fromforgesoftware/vue-kit` (`ToolCallStep`, `InlineConfirmation`,
                 `InlineClarification`). Anything else silently no-ops to
                 avoid runtime crashes on unknown kinds. -->
						<ChatBubble
							v-if="!('kind' in msg) || msg.kind === 'text'"
							:direction="msg.role"
							:size="bubbleSize"
							:loading="msg.loading"
							:author-label="msg.author"
							:time="msg.time"
						>
							<span class="whitespace-pre-wrap">{{ msg.content }}</span>
						</ChatBubble>
					</slot>
				</template>
				<slot name="messages-footer" />
			</div>
		</div>

		<!-- Composer: textarea + slot regions for tools/attach/send. Hidden
         when `hideComposer` (read-only chat history). -->
		<div
			v-if="!hideComposer"
			class="shrink-0 border-t border-border p-3"
			data-slot="chat-panel-composer"
		>
			<div
				class="flex flex-col gap-2 rounded-lg border border-border bg-background px-3 py-2 focus-within:border-primary"
			>
				<Textarea
					ref="textareaEl"
					v-model="draft"
					:placeholder="placeholder"
					:disabled="disabled"
					:rows="1"
					class="min-h-8 max-h-48 resize-none border-0 bg-transparent p-0 text-sm shadow-none focus-visible:ring-0 field-sizing-content"
					data-slot="chat-panel-input"
					@keydown="onComposerKeydown"
				/>
				<div class="flex items-center justify-between gap-2">
					<div class="flex items-center gap-1">
						<slot name="composer-leading" :submit="submit" :draft="draft" />
					</div>
					<div class="flex items-center gap-1">
						<slot name="composer-trailing" :submit="submit" :draft="draft" />
						<slot name="send-button" :submit="submit" :can-submit="canSubmit">
							<Button
								size="icon-sm"
								:disabled="!canSubmit"
								:aria-label="sendLabel"
								data-slot="chat-panel-send"
								@click="submit"
							>
								<ArrowUp />
							</Button>
						</slot>
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, nextTick, ref, watch } from 'vue';
import { ArrowUp } from '@lucide/vue';
import { cn } from '../../../helpers/cn.js';
import Button from '../../general/button/Button.vue';
import ChatBubble from '../../general/chat-bubble/ChatBubble.vue';
import Textarea from '../../form/textarea/Textarea.vue';
import { chatPanelVariants, type ChatPanelMessage, type ChatPanelSize } from './chat-panel.js';

interface ChatPanelProps {
	/** Conversation history rendered in the body. */
	messages: ChatPanelMessage[];
	/** Heading shown in the default header. Use `header-title` slot for richer content. */
	title?: string;
	/** Composer placeholder. */
	placeholder?: string;
	/** Read-only composer. */
	disabled?: boolean;
	/** Enter submits, Shift+Enter inserts newline. Default true. */
	submitOnEnter?: boolean;
	/** Auto-scroll the body to the bottom when new messages arrive. Default true. */
	autoScroll?: boolean;
	/** Hide the header section entirely. */
	hideHeader?: boolean;
	/** Hide the composer section entirely (history view). */
	hideComposer?: boolean;
	/** Empty-state title (ignored if the `empty` slot is provided). */
	emptyTitle?: string;
	/** Empty-state subtitle (ignored if the `empty` slot is provided). */
	emptyDescription?: string;
	/** Accessible label for the send button. */
	sendLabel?: string;
	/** Density. `sm` propagates to the default bubble renderer. */
	size?: ChatPanelSize;
	/** Wrap the panel in a card-style border + background. */
	bordered?: boolean;
	/** Extra classes merged onto the root. */
	class?: string;
}

const props = withDefaults(defineProps<ChatPanelProps>(), {
	title: '',
	placeholder: 'Type a message…',
	disabled: false,
	submitOnEnter: true,
	autoScroll: true,
	hideHeader: false,
	hideComposer: false,
	emptyTitle: '',
	emptyDescription: '',
	sendLabel: 'Send',
	size: 'default',
	bordered: false,
	class: '',
});

const emit = defineEmits<{
	/** Composer text changed. Two-way binding via `v-model`. */
	'update:modelValue': [value: string];
	/** Send button clicked, or Enter pressed (with `submitOnEnter`). */
	submit: [text: string];
}>();

// Composer draft is `v-model`-able so parents can persist it across mounts.
const draft = defineModel<string>({ default: '' });

const bodyEl = ref<HTMLElement | null>(null);
const textareaEl = ref<{ $el?: HTMLElement } | null>(null);
// Track whether the user has scrolled away from the bottom — in that case
// we suppress auto-scroll-on-new-message so we don't yank them back.
const stickToBottom = ref(true);

const containerClasses = computed(() =>
	cn(chatPanelVariants({ size: props.size, bordered: props.bordered }), props.class),
);

const bubbleSize = computed(() => (props.size === 'sm' ? 'sm' : 'default'));

const canSubmit = computed(() => !props.disabled && draft.value.trim().length > 0);

function submit() {
	if (!canSubmit.value) return;
	const text = draft.value.trim();
	draft.value = '';
	emit('submit', text);
}

defineExpose({
	/** Programmatically focus the composer (e.g. when the panel opens). */
	focus: () => {
		const el = textareaEl.value?.$el;
		el?.querySelector('textarea')?.focus();
	},
	/** Force-scroll the body to the bottom. */
	scrollToBottom,
});

function onComposerKeydown(event: KeyboardEvent) {
	if (!props.submitOnEnter) return;
	if (event.key !== 'Enter') return;
	if (event.shiftKey || event.metaKey || event.ctrlKey || event.altKey) return;
	event.preventDefault();
	submit();
}

function onBodyScroll() {
	if (!bodyEl.value) return;
	const { scrollTop, clientHeight, scrollHeight } = bodyEl.value;
	// 32px of slack so micro-scrolls near the bottom keep auto-stick on.
	stickToBottom.value = scrollHeight - (scrollTop + clientHeight) < 32;
}

async function scrollToBottom() {
	await nextTick();
	if (!bodyEl.value) return;
	bodyEl.value.scrollTop = bodyEl.value.scrollHeight;
}

// Auto-scroll on new messages (or on loading-state changes for the typing
// indicator), but only when the user is already at the bottom. Avoids
// hijacking scroll while they review history. The last-message tracker
// reads through the discriminated union via narrowing — only text
// messages carry `loading`; others change identity instead.
function lastMessageStamp(): unknown {
	const last = props.messages[props.messages.length - 1];
	if (!last) return undefined;
	if (!('kind' in last) || last.kind === 'text') return last.loading;
	if (last.kind === 'tool-call') return last.status;
	if (last.kind === 'confirmation') return last.decision;
	if (last.kind === 'clarification') return last.selected;
	return undefined;
}

watch(
	() => [props.messages.length, lastMessageStamp()],
	() => {
		if (props.autoScroll && stickToBottom.value) scrollToBottom();
	},
);
</script>
