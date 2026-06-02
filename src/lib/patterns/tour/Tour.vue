<template>
	<Teleport to="body">
		<!-- Overlay with spotlight cutout -->
		<svg
			v-if="tour.isActive.value"
			class="pointer-events-none fixed inset-0 z-50 h-screen w-screen"
			:class="overlayClass"
		>
			<defs>
				<mask :id="maskId">
					<rect x="0" y="0" width="100%" height="100%" fill="white" />
					<rect
						v-if="cutout"
						:x="cutout.x"
						:y="cutout.y"
						:width="cutout.width"
						:height="cutout.height"
						rx="8"
						fill="black"
						class="transition-all duration-300 ease-in-out"
					/>
				</mask>
			</defs>
			<rect
				x="0"
				y="0"
				width="100%"
				height="100%"
				fill="rgba(0,0,0,0.5)"
				:mask="`url(#${maskId})`"
				class="pointer-events-auto"
				@click="tour.skip()"
			/>
		</svg>

		<!-- Popover card positioned via Reka UI -->
		<PopoverRoot v-if="tour.isActive.value && tour.targetElement.value" :open="true" :modal="false">
			<!-- `as any`: PopoverAnchor accepts a loose ref shape; our HTMLElement satisfies the runtime contract. -->
			<PopoverAnchor :reference="tour.targetElement.value as any" />
			<PopoverPortal>
				<!--
          Reka's PopoverContent gets role="dialog"; without a name it fails
          axe's aria-dialog-name. The visible title lives in TourCard, so we
          surface it on the dialog wrapper as aria-label.
        -->
				<PopoverContent
					:side="tour.currentStep.value?.placement ?? 'bottom'"
					:side-offset="tour.currentStep.value?.offset ?? 12"
					:avoid-collisions="true"
					:class="contentClasses"
					:aria-label="tour.currentStep.value?.title ?? 'Tour step'"
					@open-auto-focus.prevent
					@close-auto-focus.prevent
				>
					<TourCard
						:step="tour.currentStep.value"
						:current="tour.currentIndex.value + 1"
						:total="tour.totalSteps.value"
						:is-first="tour.isFirst.value"
						:is-last="tour.isLast.value"
						@next="tour.next()"
						@prev="tour.prev()"
						@skip="tour.skip()"
						@restart="tour.goTo(0)"
					>
						<template #default="{ step, current, total }">
							<slot name="step" :step="step" :current="current" :total="total" />
						</template>
					</TourCard>
					<PopoverArrow class="fill-popover stroke-border" />
				</PopoverContent>
			</PopoverPortal>
		</PopoverRoot>
	</Teleport>
</template>

<script setup lang="ts">
import { computed, onMounted, watch } from 'vue';
import { PopoverRoot, PopoverAnchor, PopoverPortal, PopoverContent, PopoverArrow } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { useTour, type UseTourOptions } from './useTour';
import { tourCardVariants, type TourStep } from './tour';
import TourCard from './TourCard.vue';

interface TourProps {
	/** Array of tour step definitions */
	steps: TourStep[];
	/** Auto-start the tour on mount */
	autoStart?: boolean;
	/** Class override for the popover card */
	cardClass?: string;
	/** Class override for the overlay */
	overlayClass?: string;
	/** Padding around the spotlight cutout in px */
	spotlightPadding?: number;
	/** Called when tour finishes */
	onComplete?: UseTourOptions['onComplete'];
}

const props = withDefaults(defineProps<TourProps>(), {
	autoStart: false,
	spotlightPadding: 6,
});

const emit = defineEmits<{
	complete: [reason: 'done' | 'skip'];
}>();

const tour = useTour({
	steps: props.steps,
	onComplete: (reason) => {
		props.onComplete?.(reason);
		emit('complete', reason);
	},
});

// Unique mask ID to avoid collisions if multiple tours exist
const maskId = `tour-mask-${Math.random().toString(36).slice(2, 9)}`;

// Spotlight cutout dimensions
const cutout = computed(() => {
	const rect = tour.targetRect.value;
	if (!rect) return null;
	const p = props.spotlightPadding;
	return {
		x: rect.x - p,
		y: rect.y - p,
		width: rect.width + p * 2,
		height: rect.height + p * 2,
	};
});

const contentClasses = computed(() => cn(tourCardVariants(), props.cardClass));

// Expose tour controls so parent can call start/skip/etc.
defineExpose({
	start: tour.start,
	next: tour.next,
	prev: tour.prev,
	goTo: tour.goTo,
	skip: tour.skip,
	isActive: tour.isActive,
	currentIndex: tour.currentIndex,
	currentStep: tour.currentStep,
});

onMounted(() => {
	if (props.autoStart) {
		tour.start();
	}
});

// Re-initialize if steps change while active
watch(
	() => props.steps,
	() => {
		if (tour.isActive.value) {
			tour.skip();
		}
	},
);
</script>
