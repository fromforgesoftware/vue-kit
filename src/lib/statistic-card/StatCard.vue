<template>
	<article
		v-if="!interactive"
		data-slot="stat-card"
		:aria-label="label"
		:aria-busy="loading"
		:class="classes"
	>
		<template v-if="loading">
			<slot name="loading">
				<div class="space-y-3 animate-pulse" aria-hidden="true">
					<div data-slot="stat-card-skeleton" class="h-4 w-24 rounded bg-muted" />
					<div class="h-8 w-20 rounded bg-muted" />
					<div class="h-3 w-32 rounded bg-muted" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>
		<template v-else>
			<div class="flex items-start justify-between">
				<p data-slot="stat-card-label" :class="labelClasses">{{ label }}</p>
				<slot name="action" />
			</div>

			<div class="mt-2 flex items-center gap-2">
				<span data-slot="stat-card-value" :class="valueClasses">{{ value }}</span>
				<span
					v-if="unit"
					data-slot="stat-card-unit"
					class="text-sm font-normal text-muted-foreground"
				>
					{{ unit }}
				</span>
				<slot name="trend" />
			</div>

			<p
				v-if="description"
				data-slot="stat-card-description"
				class="mt-1.5 text-sm text-muted-foreground"
			>
				{{ description }}
			</p>

			<div
				v-if="$slots.footer"
				data-slot="stat-card-footer"
				class="mt-1.5 text-sm text-muted-foreground"
			>
				<slot name="footer" />
			</div>
		</template>
	</article>
	<div
		v-else
		data-slot="stat-card"
		role="button"
		:tabindex="0"
		:aria-label="label"
		:aria-busy="loading"
		:class="classes"
		@click="onClick"
		@keydown="onKeydown"
	>
		<template v-if="loading">
			<slot name="loading">
				<div class="space-y-3 animate-pulse" aria-hidden="true">
					<div data-slot="stat-card-skeleton" class="h-4 w-24 rounded bg-muted" />
					<div class="h-8 w-20 rounded bg-muted" />
					<div class="h-3 w-32 rounded bg-muted" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>

		<template v-else>
			<div class="flex items-start justify-between">
				<p data-slot="stat-card-label" :class="labelClasses">{{ label }}</p>
				<slot name="action" />
			</div>

			<div class="mt-2 flex items-center gap-2">
				<span data-slot="stat-card-value" :class="valueClasses">{{ value }}</span>
				<span
					v-if="unit"
					data-slot="stat-card-unit"
					class="text-sm font-normal text-muted-foreground"
				>
					{{ unit }}
				</span>
				<slot name="trend" />
			</div>

			<p
				v-if="description"
				data-slot="stat-card-description"
				class="mt-1.5 text-sm text-muted-foreground"
			>
				{{ description }}
			</p>

			<div
				v-if="$slots.footer"
				data-slot="stat-card-footer"
				class="mt-1.5 text-sm text-muted-foreground"
			>
				<slot name="footer" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
/**
 * Label + value + optional trend / footer. The default stat card — pair with
 * {@link IconStatCard}, {@link ColoredStatCard}, or {@link ProgressStatCard}
 * inside a {@link StatCardGroup} for dashboard layouts.
 *
 * @example
 * ```vue
 * <StatCard label="Active users" value="1,234" :trend="12.5" />
 * ```
 */
import { computed } from 'vue';
import { cn } from '../../helpers/cn.js';
import {
	statCardVariants,
	statCardLabelVariants,
	statCardValueVariants,
	type StatCardVariants,
} from './stat-card.js';

interface StatCardProps {
	/** The metric label displayed above the value. */
	label: string;
	/** The main metric value. */
	value: string | number;
	/** Unit suffix shown in smaller text after the value. */
	unit?: string;
	/** Optional supporting description displayed below the value. */
	description?: string;
	/** Show skeleton loading state. */
	loading?: boolean;
	/** Surface style. */
	variant?: StatCardVariants['variant'];
	/** Density. */
	size?: StatCardVariants['size'];
	/** Treat the card as a clickable surface — adds hover/focus styling. */
	interactive?: StatCardVariants['interactive'];
	class?: string;
}

const props = withDefaults(defineProps<StatCardProps>(), {
	loading: false,
	variant: 'default',
	size: 'default',
	interactive: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const classes = computed(() =>
	cn(
		statCardVariants({
			variant: props.variant,
			size: props.size,
			interactive: props.interactive,
		}),
		props.class,
	),
);

const labelClasses = computed(() => cn(statCardLabelVariants({ size: props.size })));
const valueClasses = computed(() => cn(statCardValueVariants({ size: props.size })));

function onClick(event: MouseEvent) {
	if (!props.interactive) return;
	emit('click', event);
}

function onKeydown(event: KeyboardEvent) {
	if (!props.interactive) return;
	if (event.key === 'Enter' || event.key === ' ') {
		event.preventDefault();
		// Cast: keyboard activation reuses the `click` emit signature; consumers
		// don't read MouseEvent-specific fields like clientX/Y.
		emit('click', event as unknown as MouseEvent);
	}
}
</script>
