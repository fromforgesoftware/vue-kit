<template>
	<!-- Select variant — uses the real Select component -->
	<Select
		v-if="variant === 'select'"
		:model-value="resolved"
		:disabled="disabled"
		@update:model-value="
			(v: string | string[]) => emit('update:modelValue', typeof v === 'string' ? v : v[0])
		"
	>
		<SelectTrigger
			data-slot="language-selector-trigger"
			data-variant="select"
			:size="size"
			:aria-label="ariaLabel"
			:class="cn('w-56', props.class)"
		>
			<SelectValue />
		</SelectTrigger>
		<SelectContent>
			<SelectItem v-for="opt in options" :key="opt.code" :value="opt.code">
				{{ opt.label }}
			</SelectItem>
		</SelectContent>
	</Select>

	<!-- Inline variant — compact dropdown for nav/footer -->
	<DropdownMenu v-else>
		<DropdownMenuTrigger as-child :disabled="disabled">
			<Button
				variant="ghost"
				data-slot="language-selector-trigger"
				data-variant="inline"
				:class="inlineTriggerClass"
				:disabled="disabled"
				:aria-label="ariaLabel"
			>
				<Icon :icon="Globe" class="size-3.5" aria-hidden="true" />
				<span>{{ currentLocale.label }}</span>
				<Icon :icon="ChevronDown" class="size-3" aria-hidden="true" />
			</Button>
		</DropdownMenuTrigger>

		<DropdownMenuContent
			:side="side"
			:side-offset="sideOffset"
			align="start"
			class="max-h-64 overflow-y-auto"
		>
			<DropdownMenuRadioGroup
				:model-value="resolved"
				@update:model-value="(v: string) => emit('update:modelValue', v)"
			>
				<DropdownMenuRadioItem v-for="opt in options" :key="opt.code" :value="opt.code">
					{{ opt.label }}
				</DropdownMenuRadioItem>
			</DropdownMenuRadioGroup>
		</DropdownMenuContent>
	</DropdownMenu>
</template>

<script setup lang="ts">
import { computed, watch } from 'vue';
import { Globe, ChevronDown } from '@lucide/vue';
import DropdownMenu from '../../general/dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../../general/dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../../general/dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuRadioGroup from '../../general/dropdown-menu/DropdownMenuRadioGroup.vue';
import DropdownMenuRadioItem from '../../general/dropdown-menu/DropdownMenuRadioItem.vue';
import Select from '../select/Select.vue';
import SelectTrigger from '../select/SelectTrigger.vue';
import SelectContent from '../select/SelectContent.vue';
import SelectItem from '../select/SelectItem.vue';
import SelectValue from '../select/SelectValue.vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn';
import {
	getLocaleOption,
	getLocaleOptions,
	resolveLocale,
	languageSelectorTriggerVariants,
	type LanguageSelectorTone,
	type LanguageSelectorDensity,
	type LanguageSelectorVariant,
} from './language-selector';
import type { SelectSize } from '../select/select';

interface Props {
	/** Currently selected locale code. */
	modelValue: string;
	/** List of available locale codes. */
	locales: string[];
	/**
	 * Visual variant.
	 * - `inline` — compact globe-icon trigger (default, used in nav / footer).
	 * - `select` — full bordered Select-style trigger (used in settings forms).
	 */
	variant?: LanguageSelectorVariant;
	/** Trigger size when `variant === 'select'`. Matches Input sizes. */
	size?: SelectSize;
	/** Inline trigger tone — paint colour of the text/icon. */
	tone?: LanguageSelectorTone;
	/** Inline trigger density. `compact` keeps it small enough for footers. */
	density?: LanguageSelectorDensity;
	/** Preferred side for the dropdown (inline variant only). */
	side?: 'top' | 'right' | 'bottom' | 'left';
	/** Offset from the trigger (inline variant only). */
	sideOffset?: number;
	/** Disable the selector. */
	disabled?: boolean;
	/** Accessible label for the trigger button (inline variant). Default: "Select language". */
	ariaLabel?: string;
	/** Extra classes on the trigger element. */
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	variant: 'inline',
	size: 'default',
	tone: 'muted',
	density: 'compact',
	side: 'top',
	sideOffset: 8,
	disabled: false,
	ariaLabel: 'Select language',
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const resolved = computed(() => resolveLocale(props.modelValue, props.locales));
const currentLocale = computed(() => getLocaleOption(resolved.value));
const options = computed(() => getLocaleOptions(props.locales));

const inlineTriggerClass = computed(() =>
	cn(languageSelectorTriggerVariants({ tone: props.tone, density: props.density }), props.class),
);

// Auto-correct bare base codes (e.g. "en" → "en_GB") so the parent stays in sync
watch(
	resolved,
	(val) => {
		if (val !== props.modelValue) emit('update:modelValue', val);
	},
	{ immediate: true },
);
</script>
