<template>
	<div data-slot="list-detail-header" :class="cn(listDetailHeaderVariants(), props.class)">
		<span v-if="$slots.leading" class="shrink-0" data-slot="list-detail-header-leading">
			<slot name="leading" />
		</span>
		<div class="min-w-0">
			<h2 class="truncate text-xl font-semibold leading-tight">
				<slot name="title">{{ title }}</slot>
			</h2>
			<p
				v-if="subtitle || $slots.subtitle"
				class="mt-1 truncate text-sm text-muted-foreground leading-tight"
			>
				<slot name="subtitle">{{ subtitle }}</slot>
			</p>
		</div>
		<div
			v-if="$slots.actions"
			class="ml-auto flex shrink-0 items-center gap-2"
			data-slot="list-detail-header-actions"
		>
			<slot name="actions" />
		</div>
	</div>
</template>

<script setup lang="ts">
import { cn } from '../../../helpers/cn.js';
import { listDetailHeaderVariants } from './list-detail.js';

interface ListDetailHeaderProps {
	/** Title text. Override with the `title` slot for rich content. */
	title?: string;
	/** Subtitle/meta line under the title. Override with the `subtitle` slot. */
	subtitle?: string;
	class?: string;
}

const props = withDefaults(defineProps<ListDetailHeaderProps>(), {
	title: undefined,
	subtitle: undefined,
	class: undefined,
});
</script>
