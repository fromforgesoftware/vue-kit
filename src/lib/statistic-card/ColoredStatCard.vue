<template>
	<article
		v-if="!interactive"
		data-slot="colored-stat-card"
		:data-tone="resolvedTone"
		:aria-label="label"
		:aria-busy="loading"
		:class="classes"
	>
		<template v-if="loading">
			<slot name="loading">
				<div class="space-y-3 animate-pulse" aria-hidden="true">
					<div class="h-4 w-24 rounded bg-current/20" />
					<div class="h-10 w-20 rounded bg-current/20" />
					<div class="h-3 w-32 rounded bg-current/20" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>
		<template v-else>
			<div class="flex items-start justify-between">
				<div v-if="$slots.icon" data-slot="colored-stat-card-icon" class="mb-3" aria-hidden="true">
					<slot name="icon" />
				</div>
				<p v-else data-slot="stat-card-label" class="text-sm font-medium">
					{{ label }}
				</p>
				<slot name="action" />
			</div>

			<div class="mt-2 flex items-center gap-2">
				<span data-slot="stat-card-value" class="text-h2 font-bold tracking-tight">{{
					value
				}}</span>
				<span v-if="unit" data-slot="stat-card-unit" class="text-lg font-normal">
					{{ unit }}
				</span>
				<slot name="trend" />
			</div>

			<p v-if="$slots.icon" data-slot="stat-card-label" class="mt-1 text-sm font-semibold">
				{{ label }}
			</p>

			<p v-if="description" data-slot="stat-card-description" class="mt-1 text-sm">
				{{ description }}
			</p>

			<div v-if="$slots.footer" data-slot="stat-card-footer" class="mt-3 text-sm">
				<slot name="footer" />
			</div>
		</template>
	</article>
	<div
		v-else
		data-slot="colored-stat-card"
		:data-tone="resolvedTone"
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
					<div class="h-4 w-24 rounded bg-current/20" />
					<div class="h-10 w-20 rounded bg-current/20" />
					<div class="h-3 w-32 rounded bg-current/20" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>

		<template v-else>
			<div class="flex items-start justify-between">
				<div v-if="$slots.icon" data-slot="colored-stat-card-icon" class="mb-3" aria-hidden="true">
					<slot name="icon" />
				</div>
				<p v-else data-slot="stat-card-label" class="text-sm font-medium">
					{{ label }}
				</p>
				<slot name="action" />
			</div>

			<div class="mt-2 flex items-center gap-2">
				<span data-slot="stat-card-value" class="text-h2 font-bold tracking-tight">{{
					value
				}}</span>
				<span v-if="unit" data-slot="stat-card-unit" class="text-lg font-normal">
					{{ unit }}
				</span>
				<slot name="trend" />
			</div>

			<p v-if="$slots.icon" data-slot="stat-card-label" class="mt-1 text-sm font-semibold">
				{{ label }}
			</p>

			<p v-if="description" data-slot="stat-card-description" class="mt-1 text-sm">
				{{ description }}
			</p>

			<div v-if="$slots.footer" data-slot="stat-card-footer" class="mt-3 text-sm">
				<slot name="footer" />
			</div>
		</template>
	</div>
</template>

<script setup lang="ts">
/**
 * Tinted-surface variant of {@link StatCard} — entire card uses one tone token
 * (`primary`, `success`, `warning`, etc.). Use sparingly for hero KPIs where
 * tonal contrast carries the meaning (e.g. a "danger" alert card).
 */
import { computed } from 'vue';
import { cn } from '../../helpers/cn';
import {
	coloredStatCardVariants,
	type ColoredStatCardVariants,
	type ColoredStatCardTone,
} from './stat-card';

interface ColoredStatCardProps {
	/** The metric label. */
	label: string;
	/** The main metric value. */
	value: string | number;
	/** Unit suffix shown after the value. */
	unit?: string;
	/** Description text below the value. */
	description?: string;
	/**
	 * Tone — tints the entire card surface with the matching semantic token.
	 * Preferred over the deprecated `color` alias.
	 */
	tone?: ColoredStatCardVariants['tone'];
	/** @deprecated Use `tone`. */
	color?: ColoredStatCardTone;
	/** Show skeleton loading state. */
	loading?: boolean;
	/** Density. */
	size?: ColoredStatCardVariants['size'];
	/** Treat the card as a clickable surface. */
	interactive?: ColoredStatCardVariants['interactive'];
	class?: string;
}

const props = withDefaults(defineProps<ColoredStatCardProps>(), {
	loading: false,
	size: 'default',
	interactive: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

// Resolve `tone` (preferred) with `color` as legacy alias. Default = dark.
const resolvedTone = computed<ColoredStatCardTone>(() => props.tone ?? props.color ?? 'dark');

const classes = computed(() =>
	cn(
		coloredStatCardVariants({
			tone: resolvedTone.value,
			size: props.size,
			interactive: props.interactive,
		}),
		props.class,
	),
);

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
