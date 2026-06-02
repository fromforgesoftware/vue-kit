<template>
	<div data-slot="color-picker" :class="rootClasses">
		<!-- Mobile: Dialog bottom-sheet — Reka Dialog handles this cleanly,
         unlike Popover whose floating-ui inline transforms fight max-sm: overrides. -->
		<Dialog v-if="isMobile">
			<DialogTrigger as-child>
				<button
					type="button"
					data-slot="color-picker-trigger"
					:class="triggerClasses"
					:style="{ backgroundColor: currentColor }"
					:disabled="disabled"
					:aria-label="triggerAriaLabel"
				/>
			</DialogTrigger>
			<DialogContent hide-close-button class="p-4">
				<VisuallyHidden>
					<DialogTitle>{{ triggerAriaLabel }}</DialogTitle>
				</VisuallyHidden>
				<div data-slot="color-picker-content" :class="contentClasses">
					<ColorArea
						:model-value="currentColor"
						:color-space="colorSpace"
						size="full"
						class="w-full"
						aria-label="Saturation and brightness"
						@update:model-value="onColorChange"
					/>
					<div :class="colorPickerSliderRowVariants()">
						<ColorEyeDropper v-if="showEyeDropper" size="sm" @update:model-value="onColorChange" />
						<ColorSwatch :color="currentColor" size="sm" />
						<div :class="colorPickerSlidersStackVariants()">
							<ColorSlider
								:model-value="currentColor"
								:color-space="colorSpace"
								channel="hue"
								aria-label="Hue"
								@update:model-value="onColorChange"
							/>
							<ColorSlider
								v-if="showAlpha"
								:model-value="currentColor"
								:color-space="colorSpace"
								channel="alpha"
								aria-label="Alpha"
								@update:model-value="onColorChange"
							/>
						</div>
					</div>
					<ColorChannelInputs
						v-if="showChannels === 'all'"
						:model-value="currentColor"
						:show-alpha="showAlpha"
						size="sm"
						@update:model-value="onColorChange"
					/>
					<ColorField
						v-else-if="showChannels === 'hex'"
						:model-value="currentColor"
						aria-label="Hex value"
						@update:model-value="onColorChange"
					/>
					<ColorSwatchPicker
						v-if="hasPresets"
						:model-value="currentColor"
						:colors="presets!"
						size="sm"
						aria-label="Preset colours"
						@update:model-value="onColorChange"
					/>
				</div>
			</DialogContent>
		</Dialog>

		<!-- Desktop: anchored popover -->
		<Popover v-else>
			<PopoverTrigger>
				<button
					type="button"
					data-slot="color-picker-trigger"
					:class="triggerClasses"
					:style="{ backgroundColor: currentColor }"
					:disabled="disabled"
					:aria-label="triggerAriaLabel"
				/>
			</PopoverTrigger>
			<PopoverContent
				size="auto"
				:align="align"
				:side-offset="8"
				hide-close-button
				aria-label="Color picker"
			>
				<div data-slot="color-picker-content" :class="contentClasses">
					<ColorArea
						:model-value="currentColor"
						:color-space="colorSpace"
						size="full"
						class="w-full"
						aria-label="Saturation and brightness"
						@update:model-value="onColorChange"
					/>
					<div :class="colorPickerSliderRowVariants()">
						<ColorEyeDropper v-if="showEyeDropper" size="sm" @update:model-value="onColorChange" />
						<ColorSwatch :color="currentColor" size="sm" />
						<div :class="colorPickerSlidersStackVariants()">
							<ColorSlider
								:model-value="currentColor"
								:color-space="colorSpace"
								channel="hue"
								aria-label="Hue"
								@update:model-value="onColorChange"
							/>
							<ColorSlider
								v-if="showAlpha"
								:model-value="currentColor"
								:color-space="colorSpace"
								channel="alpha"
								aria-label="Alpha"
								@update:model-value="onColorChange"
							/>
						</div>
					</div>
					<ColorChannelInputs
						v-if="showChannels === 'all'"
						:model-value="currentColor"
						:show-alpha="showAlpha"
						size="sm"
						@update:model-value="onColorChange"
					/>
					<ColorField
						v-else-if="showChannels === 'hex'"
						:model-value="currentColor"
						aria-label="Hex value"
						@update:model-value="onColorChange"
					/>
					<ColorSwatchPicker
						v-if="hasPresets"
						:model-value="currentColor"
						:colors="presets!"
						size="sm"
						aria-label="Preset colours"
						@update:model-value="onColorChange"
					/>
				</div>
			</PopoverContent>
		</Popover>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { VisuallyHidden } from 'reka-ui';
import { cn } from '../../../helpers/cn.js';
import { useResponsive } from '../../../composables/useResponsive.js';
import Popover from '../../general/popover/Popover.vue';
import PopoverTrigger from '../../general/popover/PopoverTrigger.vue';
import PopoverContent from '../../general/popover/PopoverContent.vue';
import Dialog from '../../general/dialog/Dialog.vue';
import DialogTrigger from '../../general/dialog/DialogTrigger.vue';
import DialogContent from '../../general/dialog/DialogContent.vue';
import DialogTitle from '../../general/dialog/DialogTitle.vue';
import ColorArea from '../color-area/ColorArea.vue';
import ColorSlider from '../color-slider/ColorSlider.vue';
import ColorField from '../color-field/ColorField.vue';
import ColorSwatch from '../color-swatch/ColorSwatch.vue';
import ColorSwatchPicker from '../color-swatch-picker/ColorSwatchPicker.vue';
import ColorChannelInputs from '../color-channel-inputs/ColorChannelInputs.vue';
import ColorEyeDropper from '../color-eye-dropper/ColorEyeDropper.vue';
import {
	colorPickerRootVariants,
	colorPickerTriggerVariants,
	colorPickerContentVariants,
	colorPickerSliderRowVariants,
	colorPickerSlidersStackVariants,
	type ColorPickerSize,
	type ColorPickerShape,
	type ColorPickerChannelsMode,
} from './color-picker.js';

interface Props {
	/** v-model — current colour as a hex string. */
	modelValue?: string;
	/** Initial uncontrolled value. */
	defaultValue?: string;
	/** Working colour space for the area + slider inside the popover. */
	colorSpace?: 'hsl' | 'hsb';
	/** Disabled state — blocks the trigger and prevents the popover from opening. */
	disabled?: boolean;
	/** Trigger size. All sizes meet ≥ 24×24 hit area. */
	size?: ColorPickerSize;
	/** Trigger shape — `default` is a wide preview tile, `square` is icon-button-sized. */
	shape?: ColorPickerShape;
	/** Popover alignment relative to the trigger. */
	align?: 'start' | 'center' | 'end';
	/** Accessible name for the trigger button. Defaults to "Pick color: <value>". */
	ariaLabel?: string;
	/** Render an alpha slider stacked under hue and an alpha column in the channel inputs. */
	showAlpha?: boolean;
	/** Render the screen eyedropper button. Hidden automatically on browsers without `window.EyeDropper`. */
	showEyeDropper?: boolean;
	/** Channel editor: `'all'` for tabbed Hex/RGB/HSL/HSB, `'hex'` for a single hex field, `false` to hide. */
	showChannels?: ColorPickerChannelsMode;
	/** Optional preset palette rendered below the inputs. */
	presets?: string[];
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	defaultValue: '#3b82f6',
	colorSpace: 'hsb',
	disabled: false,
	size: 'default',
	shape: 'default',
	align: 'start',
	showAlpha: true,
	showEyeDropper: true,
	showChannels: 'all',
});

const emit = defineEmits<{
	'update:modelValue': [value: string];
}>();

const currentColor = computed(() => props.modelValue ?? props.defaultValue);

const hasPresets = computed(() => (props.presets?.length ?? 0) > 0);
const isExpanded = computed(() => props.showChannels === 'all' || hasPresets.value);

function onColorChange(value: string | string[]): void {
	emit('update:modelValue', Array.isArray(value) ? value[0] : value);
}

const { isMobile } = useResponsive();

const rootClasses = computed(() => cn(colorPickerRootVariants(), props.class));
const triggerClasses = computed(() =>
	cn(colorPickerTriggerVariants({ size: props.size, shape: props.shape })),
);
const contentClasses = computed(() =>
	cn(colorPickerContentVariants({ width: isExpanded.value ? 'expanded' : 'compact' })),
);
const triggerAriaLabel = computed(() => props.ariaLabel ?? `Pick color: ${currentColor.value}`);
</script>
