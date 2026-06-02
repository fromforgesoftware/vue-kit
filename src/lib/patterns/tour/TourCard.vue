<template>
	<div data-slot="tour-card" :class="cn('flex flex-col', props.class)">
		<div v-if="step">
			<p :class="titleClasses">{{ step.title }}</p>
			<p v-if="step.description" :class="descriptionClasses">
				{{ step.description }}
			</p>
			<slot :step="step" :current="current" :total="total" />
		</div>

		<div :class="footerClasses">
			<span :class="counterClasses">{{ current }}/{{ total }}</span>

			<div class="flex items-center gap-1.5">
				<Button
					v-if="!isLast"
					data-slot="tour-card-skip"
					variant="ghost"
					size="sm"
					@click="emit('skip')"
				>
					Skip
				</Button>

				<Button v-if="isLast" variant="ghost" size="sm" @click="emit('restart')">
					Start over
				</Button>

				<Button
					v-if="!isFirst"
					data-slot="tour-card-back"
					variant="ghost"
					size="sm"
					@click="emit('prev')"
				>
					Prev
				</Button>

				<Button v-if="!isLast" data-slot="tour-card-next" size="sm" @click="emit('next')">
					Next
				</Button>

				<Button v-if="isLast" data-slot="tour-card-next" size="sm" @click="emit('next')">
					Done
				</Button>
			</div>
		</div>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { cn } from '../../../helpers/cn.js';
import Button from '../../general/button/Button.vue';
import type { TourStep } from './tour.js';
import {
	tourCardTitleVariants,
	tourCardDescriptionVariants,
	tourCardFooterVariants,
	tourCardCounterVariants,
} from './tour.js';

interface TourCardProps {
	/** Current step data */
	step: TourStep | null;
	/** Current step number (1-based) */
	current: number;
	/** Total number of steps */
	total: number;
	/** Whether this is the first step */
	isFirst: boolean;
	/** Whether this is the last step */
	isLast: boolean;
	class?: string;
}

const props = defineProps<TourCardProps>();

const emit = defineEmits<{
	next: [];
	prev: [];
	skip: [];
	restart: [];
}>();

const titleClasses = computed(() => cn(tourCardTitleVariants()));
const descriptionClasses = computed(() => cn(tourCardDescriptionVariants()));
const footerClasses = computed(() => cn(tourCardFooterVariants()));
const counterClasses = computed(() => cn(tourCardCounterVariants()));
</script>
