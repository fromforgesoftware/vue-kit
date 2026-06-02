<template>
	<!--
    Two render modes:
    - No `items`: legacy presentational ellipsis (used by static breadcrumbs
      that don't have hidden middle crumbs to expose).
    - `items` provided: opens a DropdownMenu listing the hidden crumbs, each
      navigable via `to` (RouterLink) or `href` (anchor) per WCAG 2.4.3 —
      hidden navigation must remain keyboard-reachable.
  -->
	<DropdownMenu v-if="items && items.length">
		<DropdownMenuTrigger as-child>
			<button
				type="button"
				data-slot="breadcrumb-ellipsis"
				:class="classes"
				:aria-label="ariaLabel"
			>
				<Icon :icon="MoreHorizontal" size="sm" />
				<span class="sr-only">{{ ariaLabel }}</span>
			</button>
		</DropdownMenuTrigger>
		<DropdownMenuContent align="start">
			<DropdownMenuItem
				v-for="(item, idx) in items"
				:key="`${item.label}-${idx}`"
				@select="handleSelect(item)"
			>
				{{ item.label }}
			</DropdownMenuItem>
		</DropdownMenuContent>
	</DropdownMenu>
	<span
		v-else
		data-slot="breadcrumb-ellipsis"
		role="presentation"
		aria-hidden="true"
		:class="classes"
	>
		<Icon :icon="MoreHorizontal" size="sm" />
		<span class="sr-only">More</span>
	</span>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { MoreHorizontal } from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import DropdownMenu from '../dropdown-menu/DropdownMenu.vue';
import DropdownMenuTrigger from '../dropdown-menu/DropdownMenuTrigger.vue';
import DropdownMenuContent from '../dropdown-menu/DropdownMenuContent.vue';
import DropdownMenuItem from '../dropdown-menu/DropdownMenuItem.vue';
import { cn } from '../../../helpers/cn';
import { breadcrumbEllipsisVariants } from './breadcrumb';

export interface BreadcrumbEllipsisItem {
	/** Visible label */
	label: string;
	/** Vue Router target (preferred for SPA navigation) */
	to?: string | Record<string, unknown>;
	/** Plain anchor href (fallback) */
	href?: string;
	/** Custom click handler if neither `to` nor `href` is appropriate */
	onSelect?: () => void;
}

interface BreadcrumbEllipsisProps {
	/** Hidden middle crumbs to surface in the dropdown. When omitted the
	 *  component renders as a passive presentational ellipsis. */
	items?: BreadcrumbEllipsisItem[];
	/** Accessible name for the trigger when items are present. */
	ariaLabel?: string;
	class?: string;
}

const props = withDefaults(defineProps<BreadcrumbEllipsisProps>(), {
	items: undefined,
	ariaLabel: 'Show more breadcrumbs',
});

const emit = defineEmits<{
	navigate: [item: BreadcrumbEllipsisItem];
}>();

const classes = computed(() => cn(breadcrumbEllipsisVariants(), props.class));

function handleSelect(item: BreadcrumbEllipsisItem): void {
	if (item.onSelect) {
		item.onSelect();
		return;
	}
	// Vue Router or anchor navigation is delegated to the consumer via the
	// `navigate` event so we don't have to import vue-router here (this
	// component lives in the UI package which stays router-agnostic).
	emit('navigate', item);
}
</script>
