<template>
	<div data-slot="theme-manager" :class="rootClasses">
		<Select :model-value="theme" @update:model-value="onChangeTheme">
			<SelectTrigger data-slot="theme-manager-select" class="w-56" aria-label="Select a theme">
				<SelectValue placeholder="Select a theme">
					<span class="inline-flex items-center">
						<span :class="[swatchClasses, themeClass(theme)]">
							<span
								class="absolute top-[2px] left-[2px] h-2 w-2 rounded-full bg-foreground forced-colors:hidden"
								:style="swatchFgStyle(theme)"
							/>
							<span
								class="absolute right-[2px] bottom-[2px] h-2 w-2 rounded-full bg-background forced-colors:hidden"
								:style="swatchBgStyle(theme)"
							/>
						</span>
						{{ selectedThemeName }}
					</span>
				</SelectValue>
			</SelectTrigger>
			<SelectContent>
				<SelectItem v-for="opt in allThemes" :key="opt.value" :value="opt.value">
					<span :class="[swatchClasses, themeClass(opt.value)]">
						<span
							class="absolute top-[2px] left-[2px] h-2 w-2 rounded-full bg-foreground forced-colors:hidden"
							:style="swatchFgStyle(opt.value)"
						/>
						<span
							class="absolute right-[2px] bottom-[2px] h-2 w-2 rounded-full bg-background forced-colors:hidden"
							:style="swatchBgStyle(opt.value)"
						/>
					</span>
					{{ opt.name }}
				</SelectItem>
			</SelectContent>
		</Select>

		<div v-if="isCustom" data-slot="theme-manager-custom-panel" :class="panelClasses">
			<div v-for="field in COLOR_FIELDS" :key="field.key" :class="rowClasses">
				<label :class="labelClasses">{{ field.label }}</label>
				<ColorPicker
					:model-value="resolvedCustomColors[field.key]"
					shape="square"
					:aria-label="`Pick ${field.label.toLowerCase()} colour`"
					@update:model-value="(v) => updateCustomColor(field.key, v)"
				/>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn';
import Select from '../../form/select/Select.vue';
import SelectTrigger from '../../form/select/SelectTrigger.vue';
import SelectValue from '../../form/select/SelectValue.vue';
import SelectContent from '../../form/select/SelectContent.vue';
import SelectItem from '../../form/select/SelectItem.vue';
import ColorPicker from '../../color/color-picker/ColorPicker.vue';
import {
	type ThemeOption,
	type Theme,
	COLOR_FIELDS,
	themeManagerRootVariants,
	themeManagerCustomPanelVariants,
	themeManagerColorRowVariants,
	themeManagerColorLabelVariants,
	themeManagerSwatchVariants,
} from './theme-manager';
import { useThemeManager } from './useThemeManager';

interface ThemeManagerProps {
	/** Available theme options to display in the select dropdown. */
	themes: ThemeOption[];
	class?: string;
}

const props = defineProps<ThemeManagerProps>();

const { theme, resolvedCustomColors, isCustom, setTheme, updateCustomColor } = useThemeManager();

const allThemes = computed<ThemeOption[]>(() => [
	...props.themes,
	{ name: 'Custom', value: 'custom' },
]);

const selectedThemeName = computed(() => {
	return allThemes.value.find((t) => t.value === theme.value)?.name ?? theme.value;
});

function onChangeTheme(value: string | string[]): void {
	setTheme(value as Theme);
}

/**
 * Returns the CSS class to scope a swatch to a specific theme's variables.
 * Uses the `.dark` class which triggers the dark theme CSS variable overrides.
 * For 'custom', inline styles are used instead (see template).
 */
function themeClass(themeValue: Theme): string {
	if (themeValue === 'dark') return 'dark';
	return '';
}

function swatchFgStyle(themeValue: Theme): Record<string, string> {
	if (themeValue === 'custom') {
		return { backgroundColor: resolvedCustomColors.value.foreground };
	}
	return {};
}

function swatchBgStyle(themeValue: Theme): Record<string, string> {
	if (themeValue === 'custom') {
		return { backgroundColor: resolvedCustomColors.value.background };
	}
	return {};
}

const rootClasses = computed(() => cn(themeManagerRootVariants(), props.class));
const panelClasses = computed(() => cn(themeManagerCustomPanelVariants()));
const rowClasses = computed(() => cn(themeManagerColorRowVariants()));
const labelClasses = computed(() => cn(themeManagerColorLabelVariants()));
const swatchClasses = computed(() => cn(themeManagerSwatchVariants()));
</script>
