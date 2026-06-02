<template>
	<PaginationRoot
		v-slot="{ page: currentPage }"
		data-slot="pagination"
		:page="page"
		:default-page="defaultPage"
		:total="total"
		:items-per-page="itemsPerPage"
		:sibling-count="siblingCount"
		:show-edges="showEdges"
		:disabled="disabled"
		:class="classes"
		@update:page="emit('update:page', $event)"
	>
		<PaginationList v-slot="{ items }" data-slot="pagination-list" :class="contentClasses">
			<PaginationFirst
				v-if="showEdges"
				data-slot="pagination-first"
				:class="prevClasses"
				aria-label="First page"
			>
				<Icon :icon="ChevronsLeft" size="sm" />
			</PaginationFirst>
			<PaginationPrev data-slot="pagination-prev" :class="prevClasses" aria-label="Previous page">
				<Icon :icon="ChevronLeft" size="sm" />
			</PaginationPrev>

			<template v-for="(item, index) in items" :key="index">
				<PaginationListItem
					v-if="item.type === 'page'"
					:value="item.value"
					data-slot="pagination-page"
					:aria-label="`Page ${item.value}`"
					:aria-current="item.value === currentPage ? 'page' : undefined"
					:class="cn(getLinkClasses(item.value === currentPage), 'hidden sm:inline-flex')"
				>
					{{ item.value }}
				</PaginationListItem>
				<PaginationEllipsis
					v-else
					:index="index"
					data-slot="pagination-ellipsis"
					aria-hidden="true"
					:class="cn(ellipsisClasses, 'hidden sm:flex')"
				>
					<Icon :icon="MoreHorizontal" size="sm" />
				</PaginationEllipsis>
			</template>
			<!-- Mobile: show current page text between prev/next -->
			<span
				data-slot="pagination-current-mobile"
				class="sm:hidden text-sm text-muted-foreground tabular-nums"
				:aria-label="`Page ${currentPage}`"
				aria-current="page"
			>
				{{ currentPage }}
			</span>

			<PaginationNext data-slot="pagination-next" :class="nextClasses" aria-label="Next page">
				<Icon :icon="ChevronRight" size="sm" />
			</PaginationNext>
			<PaginationLast
				v-if="showEdges"
				data-slot="pagination-last"
				:class="nextClasses"
				aria-label="Last page"
			>
				<Icon :icon="ChevronsRight" size="sm" />
			</PaginationLast>
		</PaginationList>
	</PaginationRoot>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import {
	PaginationRoot,
	PaginationList,
	PaginationListItem,
	PaginationFirst,
	PaginationPrev,
	PaginationNext,
	PaginationLast,
	PaginationEllipsis,
} from 'reka-ui';
import {
	ChevronLeft,
	ChevronRight,
	ChevronsLeft,
	ChevronsRight,
	MoreHorizontal,
} from '@lucide/vue';
import Icon from '../icon/Icon.vue';
import { cn } from '../../../helpers/cn';
import {
	paginationVariants,
	paginationContentVariants,
	paginationLinkVariants,
	paginationPreviousVariants,
	paginationNextVariants,
	paginationEllipsisVariants,
} from './pagination';

interface PaginationProps {
	/**
	 * The controlled current page.
	 */
	page?: number;
	/**
	 * The default page when uncontrolled.
	 */
	defaultPage?: number;
	/**
	 * The total number of items.
	 */
	total?: number;
	/**
	 * Number of items per page.
	 */
	itemsPerPage?: number;
	/**
	 * Number of pages to show around the current page.
	 */
	siblingCount?: number;
	/**
	 * Whether to show first/last page buttons.
	 */
	showEdges?: boolean;
	/**
	 * When true, prevents the user from interacting with pagination.
	 */
	disabled?: boolean;
	class?: string;
}

const props = withDefaults(defineProps<PaginationProps>(), {
	defaultPage: 1,
	total: 100,
	itemsPerPage: 10,
	siblingCount: 1,
	showEdges: true,
	disabled: false,
});

const emit = defineEmits<{
	'update:page': [value: number];
}>();

const classes = computed(() => cn(paginationVariants(), props.class));
const contentClasses = computed(() => cn(paginationContentVariants()));
const prevClasses = computed(() => cn(paginationPreviousVariants()));
const nextClasses = computed(() => cn(paginationNextVariants()));
const ellipsisClasses = computed(() => cn(paginationEllipsisVariants()));

const getLinkClasses = (isActive: boolean) => {
	return cn(paginationLinkVariants({ isActive }));
};
</script>
