<template>
	<component
		:is="interactive ? 'div' : 'article'"
		data-slot="icon-stat-card"
		:data-layout="layout"
		:role="interactive ? 'button' : undefined"
		:tabindex="interactive ? 0 : undefined"
		:aria-label="label"
		:aria-busy="loading"
		:class="classes"
		@click="onClick"
		@keydown="onKeydown"
	>
		<template v-if="loading">
			<slot name="loading">
				<div class="space-y-3 animate-pulse" aria-hidden="true">
					<div class="flex items-center justify-between">
						<div class="size-10 rounded-lg bg-muted" />
						<div class="h-6 w-16 rounded bg-muted" />
					</div>
					<div class="h-4 w-24 rounded bg-muted" />
					<div class="h-8 w-16 rounded bg-muted" />
					<div class="h-3 w-32 rounded bg-muted" />
				</div>
				<span class="sr-only">Loading {{ label }}</span>
			</slot>
		</template>

		<template v-else-if="layout === 'inline'">
			<!-- Inline: icon column on the left, content column on the right.
           Trend sits in the top-right of the content column so it pairs
           with the value visually, the way it does in the stacked layout. -->
			<div class="flex items-start gap-3">
				<div data-slot="icon-stat-card-icon" class="shrink-0" aria-hidden="true">
					<slot name="icon" />
				</div>
				<div class="flex-1 min-w-0">
					<div class="flex items-start justify-between gap-2">
						<p data-slot="stat-card-label" :class="labelClasses">{{ label }}</p>
						<slot name="trend" />
					</div>
					<div class="mt-0.5 flex items-baseline gap-1">
						<span data-slot="stat-card-value" :class="valueClasses">{{ value }}</span>
						<span
							v-if="unit"
							data-slot="stat-card-unit"
							class="text-sm font-normal text-muted-foreground"
						>
							{{ unit }}
						</span>
					</div>
					<div
						v-if="footer || $slots.footer"
						data-slot="stat-card-footer"
						class="mt-1 text-xs text-muted-foreground truncate"
					>
						<slot name="footer">{{ footer }}</slot>
					</div>
				</div>
			</div>
		</template>

		<template v-else>
			<!-- Stacked (default): icon top-left, content flows below. -->
			<div class="flex items-start justify-between">
				<div data-slot="icon-stat-card-icon" aria-hidden="true">
					<slot name="icon" />
				</div>
				<slot name="trend" />
			</div>

			<p data-slot="stat-card-label" class="mt-3" :class="labelClasses">{{ label }}</p>

			<div class="mt-1 flex items-baseline gap-1">
				<span data-slot="stat-card-value" :class="valueClasses">{{ value }}</span>
				<span
					v-if="unit"
					data-slot="stat-card-unit"
					class="text-sm font-normal text-muted-foreground"
				>
					{{ unit }}
				</span>
			</div>

			<div
				v-if="footer || $slots.footer"
				data-slot="stat-card-footer"
				class="mt-2 text-xs text-muted-foreground"
			>
				<slot name="footer">{{ footer }}</slot>
			</div>
		</template>
	</component>
</template>

<script setup lang="ts">
/**
 * Icon-led variant of {@link StatCard} — same surface tones, with a leading
 * icon block. Use for KPIs where the icon adds quick recognition.
 */
import { computed } from 'vue';
import { cn } from '../../helpers/cn.js';
import {
	iconStatCardVariants,
	statCardLabelVariants,
	statCardValueVariants,
	type IconStatCardVariants,
} from './stat-card.js';

interface IconStatCardProps {
	/** The metric label. */
	label: string;
	/** The main metric value. */
	value: string | number;
	/** Unit suffix shown in smaller text after the value. */
	unit?: string;
	/** Footer text (e.g., date range). */
	footer?: string;
	/** Show skeleton loading state. */
	loading?: boolean;
	/** Surface style. */
	variant?: IconStatCardVariants['variant'];
	/** Density. */
	size?: IconStatCardVariants['size'];
	/**
	 * Content arrangement. `stacked` (default) — icon top-left, content flows
	 * below; the "CRM-style summary card" pattern. `inline` — icon on the
	 * left, content column on the right; better for dense rows where vertical
	 * space matters and the icon is a categorical anchor.
	 */
	layout?: IconStatCardVariants['layout'];
	/** Treat the card as a clickable surface. */
	interactive?: IconStatCardVariants['interactive'];
	class?: string;
}

const props = withDefaults(defineProps<IconStatCardProps>(), {
	loading: false,
	variant: 'default',
	size: 'default',
	layout: 'stacked',
	interactive: false,
});

const emit = defineEmits<{
	click: [event: MouseEvent];
}>();

const classes = computed(() =>
	cn(
		iconStatCardVariants({
			variant: props.variant,
			size: props.size,
			layout: props.layout,
			interactive: props.interactive,
		}),
		props.class,
	),
);

const labelClasses = computed(() =>
	cn(statCardLabelVariants({ size: props.size }), 'text-muted-foreground'),
);
const valueClasses = computed(() => cn(statCardValueVariants({ size: props.size })));

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
