<template>
	<Tabs
		data-slot="color-channel-inputs"
		:model-value="activeTab"
		size="sm"
		variant="default"
		:class="rootClasses"
		@update:model-value="onTabChange"
	>
		<TabsList :class="colorChannelInputsListVariants()">
			<TabsTrigger value="hex" class="flex-1">Hex</TabsTrigger>
			<TabsTrigger value="rgb" class="flex-1">RGB</TabsTrigger>
			<TabsTrigger value="hsl" class="flex-1">HSL</TabsTrigger>
			<TabsTrigger value="hsb" class="flex-1">HSB</TabsTrigger>
		</TabsList>

		<TabsContent value="hex" data-slot="color-channel-inputs-pane-hex">
			<div :class="colorChannelInputsRowVariants({ columns: showAlpha ? 2 : 1 })">
				<div>
					<ColorField
						:model-value="modelValue"
						:size="size"
						:disabled="disabled"
						hide-swatch
						aria-label="Hex value"
						@update:model-value="emitChange"
					/>
					<span :class="colorChannelInputsLabelVariants()">Hex</span>
				</div>
				<div v-if="showAlpha">
					<ColorField
						:model-value="modelValue"
						channel="alpha"
						color-space="rgb"
						:size="size"
						:disabled="disabled"
						hide-swatch
						aria-label="Alpha"
						@update:model-value="emitChange"
					/>
					<span :class="colorChannelInputsLabelVariants()">A</span>
				</div>
			</div>
		</TabsContent>

		<TabsContent value="rgb" data-slot="color-channel-inputs-pane-rgb">
			<div :class="colorChannelInputsRowVariants({ columns: showAlpha ? 4 : 3 })">
				<div v-for="ch in rgbChannels" :key="ch.channel">
					<ColorField
						:model-value="modelValue"
						:channel="ch.channel"
						color-space="rgb"
						:size="size"
						:disabled="disabled"
						hide-swatch
						:aria-label="ch.label"
						@update:model-value="emitChange"
					/>
					<span :class="colorChannelInputsLabelVariants()">{{ ch.short }}</span>
				</div>
			</div>
		</TabsContent>

		<TabsContent value="hsl" data-slot="color-channel-inputs-pane-hsl">
			<div :class="colorChannelInputsRowVariants({ columns: showAlpha ? 4 : 3 })">
				<div v-for="ch in hslChannels" :key="ch.channel">
					<ColorField
						:model-value="modelValue"
						:channel="ch.channel"
						color-space="hsl"
						:size="size"
						:disabled="disabled"
						hide-swatch
						:aria-label="ch.label"
						@update:model-value="emitChange"
					/>
					<span :class="colorChannelInputsLabelVariants()">{{ ch.short }}</span>
				</div>
			</div>
		</TabsContent>

		<TabsContent value="hsb" data-slot="color-channel-inputs-pane-hsb">
			<div :class="colorChannelInputsRowVariants({ columns: showAlpha ? 4 : 3 })">
				<div v-for="ch in hsbChannels" :key="ch.channel">
					<ColorField
						:model-value="modelValue"
						:channel="ch.channel"
						color-space="hsb"
						:size="size"
						:disabled="disabled"
						hide-swatch
						:aria-label="ch.label"
						@update:model-value="emitChange"
					/>
					<span :class="colorChannelInputsLabelVariants()">{{ ch.short }}</span>
				</div>
			</div>
		</TabsContent>
	</Tabs>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import type { ColorChannel } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import Tabs from '../../general/tabs/Tabs.vue';
import TabsList from '../../general/tabs/TabsList.vue';
import TabsTrigger from '../../general/tabs/TabsTrigger.vue';
import TabsContent from '../../general/tabs/TabsContent.vue';
import ColorField from '../color-field/ColorField.vue';
import type { ColorFieldSize } from '../color-field/color-field';
import {
	colorChannelInputsRootVariants,
	colorChannelInputsListVariants,
	colorChannelInputsRowVariants,
	colorChannelInputsLabelVariants,
	type ColorChannelInputsTab,
} from './color-channel-inputs';

interface Props {
	/** v-model — current colour as hex (always hex, regardless of active tab). */
	modelValue?: string;
	/** Initial uncontrolled value. */
	defaultValue?: string;
	/** Show an alpha channel input in every pane. */
	showAlpha?: boolean;
	/** Active tab. Uncontrolled by default. */
	tab?: ColorChannelInputsTab;
	/** Initial tab for the uncontrolled case. */
	defaultTab?: ColorChannelInputsTab;
	/** Density forwarded to every `ColorField`. */
	size?: ColorFieldSize;
	/** Disabled state — applied to all panes. */
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	defaultValue: '#000000',
	showAlpha: false,
	defaultTab: 'hex',
	size: 'sm',
	disabled: false,
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
	'update:tab': [value: ColorChannelInputsTab];
}>();

const internalTab = ref<ColorChannelInputsTab>(props.tab ?? props.defaultTab);
watch(
	() => props.tab,
	(v) => {
		if (v !== undefined) internalTab.value = v;
	},
);
const activeTab = computed(() => props.tab ?? internalTab.value);

function onTabChange(value: string | number): void {
	const next = value as ColorChannelInputsTab;
	if (props.tab === undefined) internalTab.value = next;
	emit('update:tab', next);
}

function emitChange(value: string): void {
	emit('update:modelValue', value);
}

const rgbChannels: { channel: ColorChannel; label: string; short: string }[] = [
	{ channel: 'red', label: 'Red', short: 'R' },
	{ channel: 'green', label: 'Green', short: 'G' },
	{ channel: 'blue', label: 'Blue', short: 'B' },
];
const hslChannels: { channel: ColorChannel; label: string; short: string }[] = [
	{ channel: 'hue', label: 'Hue', short: 'H' },
	{ channel: 'saturation', label: 'Saturation', short: 'S' },
	{ channel: 'lightness', label: 'Lightness', short: 'L' },
];
const hsbChannels: { channel: ColorChannel; label: string; short: string }[] = [
	{ channel: 'hue', label: 'Hue', short: 'H' },
	{ channel: 'saturation', label: 'Saturation', short: 'S' },
	{ channel: 'brightness', label: 'Brightness', short: 'B' },
];

const rootClasses = computed(() => cn(colorChannelInputsRootVariants(), props.class));
</script>
