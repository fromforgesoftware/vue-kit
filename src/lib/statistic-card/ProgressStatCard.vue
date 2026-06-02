<template>
	<article
		v-if="!interactive"
		data-slot="progress-stat-card"
		:aria-label="label"
		:aria-busy="loading"
		:class="cardClasses"
	>
		<template v-if="loading">
			<slot name="loading">
				<div class="space-y-3 animate-pulse" aria-hidden="true">
					<div class="h-4 w-32 rounded bg-muted" />
					<div class="h-2 w-full rounded bg-muted" />
					<div class="h-4 w-40 rounded bg-muted" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>
		<template v-else>
			<div class="flex items-center justify-between">
				<h3 data-slot="stat-card-label" :class="labelClasses">{{ label }}</h3>
				<slot name="header-right" />
			</div>

			<div v-if="$slots.summary" class="mt-2 flex items-center justify-between text-sm">
				<slot name="summary" />
			</div>

			<div data-slot="stat-card-progress" class="mt-3">
				<Progress :model-value="clampedValue" :variant="progressVariant" :aria-label="label" />
			</div>

			<div
				v-if="description || secondaryText || statusLabel"
				class="mt-2 flex items-center justify-between"
			>
				<div class="flex items-baseline gap-1">
					<span
						v-if="description"
						data-slot="stat-card-description"
						class="text-sm font-semibold text-foreground"
					>
						{{ description }}
					</span>
					<span v-if="secondaryText" class="text-xs text-muted-foreground">
						{{ secondaryText }}
					</span>
				</div>
				<span v-if="statusLabel" data-slot="stat-card-status" :class="statusClasses">
					{{ statusLabel }}
				</span>
			</div>

			<div
				v-if="$slots.footer"
				data-slot="stat-card-footer"
				class="mt-3 border-t border-border pt-3 text-xs text-muted-foreground"
			>
				<slot name="footer" />
			</div>
		</template>
	</article>
	<div
		v-else
		data-slot="progress-stat-card"
		role="button"
		:tabindex="0"
		:aria-label="label"
		:aria-busy="loading"
		:class="cardClasses"
		@click="onClick"
		@keydown="onKeydown"
	>
		<template v-if="loading">
			<slot name="loading">
				<div class="space-y-3 animate-pulse" aria-hidden="true">
					<div class="h-4 w-32 rounded bg-muted" />
					<div class="h-2 w-full rounded bg-muted" />
					<div class="h-4 w-40 rounded bg-muted" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>

		<template v-else>
			<div class="flex items-center justify-between">
				<h3 data-slot="stat-card-label" :class="labelClasses">{{ label }}</h3>
				<slot name="header-right" />
			</div>

			<div v-if="$slots.summary" class="mt-2 flex items-center justify-between text-sm">
				<slot name="summary" />
			</div>

			<div data-slot="stat-card-progress" class="mt-3">
				<Progress :model-value="clampedValue" :variant="progressVariant" :aria-label="label" />
			</div>

			<div
				v-if="description || secondaryText || statusLabel"
				class="mt-2 flex items-center justify-between"
			>
				<div class="flex items-baseline gap-1">
					<span
						v-if="description"
						data-slot="stat-card-description"
						class="text-sm font-semibold text-foreground"
					>
						{{ description }}
					</span>
					<span v-if="secondaryText" class="text-xs text-muted-foreground">
						{{ secondaryText }}
					</span>
				</div>
				<span v-if="statusLabel" data-slot="stat-card-status" :class="statusClasses">
					{{ statusLabel }}
				</span>
			</div>

			<div
				v-if="$slots.footer"
				data-slot="stat-card-footer"
				class="mt-3 border-t border-border pt-3 text-xs text-muted-foreground"
			>
				<slot name="footer" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
/**
 * Stat card with a progress bar — pair with a {@link StatCardGroup} for
 * adherence / completion / quota dashboards. Status colour (`success`,
 * `warning`, `destructive`) drives both the progress bar tone and the
 * status-text label.
 */
import { computed } from 'vue';
import { cn } from '../../helpers/cn';
import {
	progressStatCardVariants,
	progressStatCardStatusVariants,
	statCardLabelVariants,
	type ProgressStatCardVariants,
	type ProgressStatCardStatusVariants,
} from './stat-card';
import Progress from '../general/progress/Progress.vue';

interface ProgressStatCardProps {
	/** The metric label. */
	label: string;
	/** Progress value (0-100). */
	value: number;
	/** Description text shown below the bar. */
	description?: string;
	/** Secondary text next to description (e.g., "of 5000 monthly quota"). */
	secondaryText?: string;
	/** Status drives both the progress colour and the inline status label tone. */
	status?: ProgressStatCardStatusVariants['status'];
	/** Status label text (e.g., "Optimal", "Critical"). */
	statusLabel?: string;
	/** Show skeleton loading state. */
	loading?: boolean;
	/** Surface style. */
	variant?: ProgressStatCardVariants['variant'];
	/** Density. */
	size?: ProgressStatCardVariants['size'];
	/** Treat the card as a clickable surface. */
	interactive?: ProgressStatCardVariants['interactive'];
	class?: string;
}

const props = withDefaults(defineProps<ProgressStatCardProps>(), {
	status: 'default',
	loading: false,
	variant: 'default',
	size: 'default',
	interactive: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const cardClasses = computed(() =>
	cn(
		progressStatCardVariants({
			variant: props.variant,
			size: props.size,
			interactive: props.interactive,
		}),
		props.class,
	),
);

const labelClasses = computed(() =>
	cn(statCardLabelVariants({ size: props.size }), 'font-semibold'),
);

const statusClasses = computed(() => cn(progressStatCardStatusVariants({ status: props.status })));

// Map ProgressStatCard status → Progress component variant. Both share
// success/warning/destructive; "default" is Progress's primary blue.
const progressVariant = computed<'default' | 'success' | 'warning' | 'destructive'>(() => {
	switch (props.status) {
		case 'success':
		case 'warning':
		case 'destructive':
			return props.status;
		default:
			return 'default';
	}
});

const clampedValue = computed(() => Math.min(100, Math.max(0, props.value)));

function onClick(event: MouseEvent) {
	if (!props.interactive) return;
	emit('click', event);
}

function onKeydown(event: KeyboardEvent) {
	if (!props.interactive) return;
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		// Keyboard activation reuses the `click` emit signature — see StatCard.vue.
		emit('click', event as unknown as MouseEvent);
	}
}
</script>
