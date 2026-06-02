<template>
	<div
		:class="cn('rounded-lg border border-info/30 bg-info/5 p-3 text-sm', $attrs.class as string)"
		data-slot="inline-clarification"
		:data-resolved="selected != null"
		role="region"
		:aria-label="ariaLabel"
	>
		<div class="flex items-start gap-2">
			<HelpCircle class="mt-0.5 size-4 shrink-0 text-info" />
			<div class="flex-1 min-w-0">
				<p
					class="text-sm font-medium text-foreground whitespace-pre-wrap"
					data-slot="inline-clarification-prompt"
				>
					{{ prompt }}
				</p>

				<RadioGroup
					v-if="selected == null"
					v-model="localSelected"
					:disabled="busy"
					orientation="vertical"
					class="mt-2 gap-1"
					data-slot="inline-clarification-options"
				>
					<Label
						v-for="option in options"
						:key="option.value"
						:for="optionID(option.value)"
						class="flex cursor-pointer items-start gap-2 rounded-md border border-transparent px-2 py-1.5 hover:bg-info/5 has-[[data-state=checked]]:border-info has-[[data-state=checked]]:bg-info/10"
						:data-value="option.value"
						data-slot="inline-clarification-option"
					>
						<RadioGroupItem
							:id="optionID(option.value)"
							:value="option.value"
							:disabled="busy"
							class="mt-0.5"
						/>
						<span class="flex-1 min-w-0">
							<span class="block truncate text-sm text-foreground">{{ option.label }}</span>
							<span
								v-if="option.description"
								class="block truncate text-xs text-muted-foreground"
								>{{ option.description }}</span
							>
						</span>
					</Label>
				</RadioGroup>

				<Badge
					v-else
					variant="soft-success"
					size="sm"
					class="mt-1"
					data-slot="inline-clarification-resolved"
				>
					<Check class="size-3" />
					<span>{{ resolvedLabel }}</span>
				</Badge>
			</div>
		</div>

		<div
			v-if="selected == null"
			class="mt-3 flex items-center justify-end gap-2"
			data-slot="inline-clarification-actions"
		>
			<Button
				size="sm"
				:disabled="!localSelected || busy"
				:loading="busy"
				data-slot="inline-clarification-submit"
				@click="submit"
			>
				Continue
			</Button>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed, ref, useId, watch } from 'vue';
import { Check, HelpCircle } from '@lucide/vue';
import { cn } from '../../../helpers/cn';
import Badge from '../../general/badge/Badge.vue';
import Button from '../../general/button/Button.vue';
import Label from '../../form/label/Label.vue';
import RadioGroup from '../../form/radio/RadioGroup.vue';
import RadioGroupItem from '../../form/radio/RadioGroupItem.vue';

defineOptions({ inheritAttrs: false });

export interface ClarificationOption {
	value: string;
	label: string;
	description?: string;
}

interface InlineClarificationProps {
	/** Human-readable question the AI is asking. */
	prompt: string;
	options: ClarificationOption[];
	/** Generic arg name — `tenant` today, may be `employee`/`group` later. */
	argName?: string;
	/** Tool that triggered the clarification — used in the aria-label. */
	toolName?: string;
	/** Locks the picker once the parent resolves the choice. */
	selected?: string | null;
	/** True while the parent is waiting on the API ack. */
	busy?: boolean;
}

const props = withDefaults(defineProps<InlineClarificationProps>(), {
	argName: undefined,
	toolName: undefined,
	selected: null,
	busy: false,
});

const emit = defineEmits<{
	/** Fired when the user picks an option and hits Continue. */
	submit: [value: string];
}>();

const groupID = useId();
const localSelected = ref<string>(props.selected ?? '');

function optionID(value: string): string {
	return `inline-clarification-${groupID}-${value}`;
}

watch(
	() => props.selected,
	(val) => {
		if (val != null) localSelected.value = val;
	},
);

function submit() {
	if (!localSelected.value || props.busy) return;
	emit('submit', localSelected.value);
}

const ariaLabel = computed(() =>
	props.toolName ? `Clarification for ${props.toolName}` : 'Clarification required',
);

const resolvedLabel = computed(() => {
	if (!props.selected) return '';
	const opt = props.options.find((o) => o.value === props.selected);
	return opt ? opt.label : props.selected;
});
</script>
