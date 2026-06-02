<template>
	<div v-if="visible" data-slot="unsaved-changes-banner" :class="bannerClasses">
		<div :class="bannerInnerClasses">
			<!-- Info section -->
			<div :class="bannerInfoClasses">
				<div :class="bannerIconWrapperClasses">
					<Icon :icon="Info" size="sm" />
				</div>
				<span :class="bannerTitleClasses">
					{{ title }}
				</span>
			</div>

			<!-- Actions section -->
			<div :class="bannerActionsClasses">
				<Button
					data-slot="unsaved-changes-discard"
					variant="ghost"
					size="sm"
					:class="bannerButtonClasses"
					@click="emit('reset')"
				>
					{{ resetLabel }}
				</Button>
				<Button
					data-slot="unsaved-changes-save"
					variant="ghost"
					size="sm"
					:class="bannerButtonClasses"
					@click="emit('save')"
				>
					{{ saveLabel }}
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Info } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import Button from '../../general/button/Button.vue';
import { cn } from '../../../helpers/cn.js';
import {
	unsavedChangesBannerVariants,
	unsavedChangesBannerInnerVariants,
	unsavedChangesBannerInfoVariants,
	unsavedChangesBannerIconWrapperVariants,
	unsavedChangesBannerTitleVariants,
	unsavedChangesBannerActionsVariants,
	unsavedChangesBannerButtonVariants,
} from './unsaved-changes.js';

interface Props {
	/** Whether the banner is visible. Bind to hasUnsavedChanges. */
	visible: boolean;
	/** Whether the banner should play the jiggle animation. Bind to composable's isJiggling. */
	jiggling?: boolean;
	/** Banner title text. */
	title?: string;
	/** Save button label. */
	saveLabel?: string;
	/** Reset/discard button label. */
	resetLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<Props>(), {
	jiggling: false,
	title: 'Unsaved changes!',
	saveLabel: 'Save',
	resetLabel: 'Reset',
});

const emit = defineEmits<{
	save: [];
	reset: [];
}>();

const bannerClasses = computed(() =>
	cn(unsavedChangesBannerVariants(), props.jiggling && 'jiggle', props.class),
);
const bannerInnerClasses = computed(() => unsavedChangesBannerInnerVariants());
const bannerInfoClasses = computed(() => unsavedChangesBannerInfoVariants());
const bannerIconWrapperClasses = computed(() => unsavedChangesBannerIconWrapperVariants());
const bannerTitleClasses = computed(() => unsavedChangesBannerTitleVariants());
const bannerActionsClasses = computed(() => unsavedChangesBannerActionsVariants());
const bannerButtonClasses = computed(() => unsavedChangesBannerButtonVariants());
</script>

<style>
@keyframes unsaved-changes-jiggle {
	0% {
		transform: translateX(0);
	}
	25% {
		transform: translateX(-5px) rotate(-1deg);
	}
	50% {
		transform: translateX(5px) rotate(1deg);
	}
	75% {
		transform: translateX(-5px) rotate(-1deg);
	}
	100% {
		transform: translateX(0);
	}
}

.jiggle {
	animation: unsaved-changes-jiggle 0.4s ease-in-out;
}
</style>
