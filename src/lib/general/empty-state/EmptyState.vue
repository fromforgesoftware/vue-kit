<template>
	<section data-slot="empty-state" :aria-label="title" :class="classes">
		<!-- Illustration area (preferred when set) -->
		<div
			v-if="illustration && illustrationLight && illustrationDark"
			data-slot="empty-state-illustration"
			:class="illustrationClasses"
			aria-hidden="true"
		>
			<img :src="illustrationLight" alt="" class="illustration-light h-auto w-full" />
			<img :src="illustrationDark" alt="" class="illustration-dark h-auto w-full" />
		</div>

		<!-- Icon area -->
		<div
			v-else-if="icon || $slots.icon"
			data-slot="empty-state-icon"
			:class="iconClasses"
			aria-hidden="true"
		>
			<slot name="icon">
				<Icon :icon="icon!" :size="iconSize" />
			</slot>
		</div>

		<!-- Text area -->
		<div class="max-w-md space-y-1">
			<h3 data-slot="empty-state-title" :class="titleClasses">{{ title }}</h3>
			<p v-if="description" data-slot="empty-state-description" :class="descriptionClasses">
				{{ description }}
			</p>
		</div>

		<!-- Inline action buttons -->
		<div
			v-if="$slots.default"
			data-slot="empty-state-actions"
			class="flex flex-wrap items-center justify-center gap-2"
		>
			<slot />
		</div>

		<!-- Card-based actions -->
		<div
			v-if="$slots.actions"
			data-slot="empty-state-action-cards"
			class="grid w-full max-w-lg gap-3 sm:grid-cols-2"
		>
			<slot name="actions" />
		</div>
	</section>
</template>

<script setup lang="ts">
import { computed, type Component } from 'vue';
import { cn } from '../../../helpers/cn.js';
import Icon from '../icon/Icon.vue';
import type { IconSize } from '../icon/icon.js';
import {
	emptyStateVariants,
	emptyStateIconVariants,
	emptyStateIllustrationVariants,
	emptyStateTitleVariants,
	emptyStateDescriptionVariants,
	type EmptyStateVariants,
	type IllustrationName,
} from './empty-state.js';

const lightUrls = import.meta.glob<string>(
	'../../../assets/chart-illustrations/light/*.svg',
	{ eager: true, query: '?url', import: 'default' },
);
const darkUrls = import.meta.glob<string>(
	'../../../assets/chart-illustrations/dark/*.svg',
	{ eager: true, query: '?url', import: 'default' },
);

function indexByName(entries: Record<string, string>): Record<string, string> {
	const out: Record<string, string> = {};
	for (const [path, url] of Object.entries(entries)) {
		const name = path.split('/').pop()!.replace('.svg', '');
		out[name] = url;
	}
	return out;
}

const lightByName = indexByName(lightUrls);
const darkByName = indexByName(darkUrls);

interface EmptyStateProps {
	/** Lucide icon component to display. Ignored when `illustration` is set. */
	icon?: Component;
	/** Illustration name from `@fromforgesoftware/ts-kit/assets/chart-illustrations/`. Takes precedence over `icon`. */
	illustration?: IllustrationName;
	/** Main heading text. */
	title: string;
	/** Optional description text below the title. */
	description?: string;
	/** Size — controls padding, icon, illustration, and text size. */
	size?: EmptyStateVariants['size'];
	/** Tone — `default` is transparent; `muted` adds a soft background. */
	tone?: EmptyStateVariants['tone'];
	class?: string;
}

const props = withDefaults(defineProps<EmptyStateProps>(), {
	size: 'default',
	tone: 'default',
});

const classes = computed(() =>
	cn(emptyStateVariants({ size: props.size, tone: props.tone }), props.class),
);
const iconClasses = computed(() => emptyStateIconVariants({ size: props.size }));
const illustrationClasses = computed(() => emptyStateIllustrationVariants({ size: props.size }));
const titleClasses = computed(() => emptyStateTitleVariants({ size: props.size }));
const descriptionClasses = computed(() => emptyStateDescriptionVariants({ size: props.size }));

const illustrationLight = computed(() =>
	props.illustration ? lightByName[props.illustration] : undefined,
);
const illustrationDark = computed(() =>
	props.illustration ? darkByName[props.illustration] : undefined,
);

const iconSize = computed<IconSize>(() => {
	const map: Record<string, IconSize> = {
		sm: 'md',
		default: 'default',
		lg: 'lg',
	};
	return map[props.size ?? 'default'];
});
</script>

<style scoped>
.illustration-dark {
	display: none;
}
:where([data-theme='dark']) .illustration-light {
	display: none;
}
:where([data-theme='dark']) .illustration-dark {
	display: block;
}
</style>
