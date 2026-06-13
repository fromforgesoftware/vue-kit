<template>
	<button
		type="button"
		data-slot="list-detail-item"
		:data-active="active ? '' : undefined"
		:aria-current="active ? 'true' : undefined"
		:disabled="disabled"
		:class="cn(listDetailItemVariants({ active }), props.class)"
		@click="emit('select')"
	>
		<span v-if="$slots.leading" class="shrink-0" data-slot="list-detail-item-leading">
			<slot name="leading" />
		</span>
		<span class="min-w-0 flex-1">
			<span class="block truncate text-sm font-medium leading-tight">
				<slot name="title">{{ title }}</slot>
			</span>
			<span
				v-if="subtitle || $slots.subtitle"
				class="mt-0.5 block truncate text-xs text-muted-foreground leading-tight"
			>
				<slot name="subtitle">{{ subtitle }}</slot>
			</span>
		</span>
		<span
			v-if="$slots.trailing"
			class="ml-auto shrink-0 text-right"
			data-slot="list-detail-item-trailing"
		>
			<slot name="trailing" />
		</span>
	</button>
</template>

<script setup lang="ts">
import { cn } from '../../../helpers/cn.js';
import { listDetailItemVariants } from './list-detail.js';

interface ListDetailItemProps {
	/** Primary label. Override with the `title` slot for rich content. */
	title?: string;
	/** Secondary line under the title. Override with the `subtitle` slot. */
	subtitle?: string;
	/** Highlights the row as the current selection. */
	active?: boolean;
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<ListDetailItemProps>(), {
	title: undefined,
	subtitle: undefined,
	active: false,
	disabled: false,
	class: undefined,
});

const emit = defineEmits<{
	/** Fired when the row is clicked. */
	select: [];
}>();
</script>
