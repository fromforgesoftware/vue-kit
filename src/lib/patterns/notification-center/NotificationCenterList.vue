<template>
	<div data-slot="notification-center-list">
		<!-- Loading shimmer (no items yet) -->
		<div
			v-if="loading && items.length === 0"
			class="flex flex-col gap-2 p-3"
			aria-busy="true"
			aria-live="polite"
		>
			<div v-for="(width, i) in skeletonWidths" :key="i" class="flex items-start gap-3">
				<Skeleton class="size-8 shrink-0 rounded-full" />
				<div class="flex-1 space-y-1.5">
					<Skeleton class="h-3 rounded-sm" :style="{ width }" />
					<Skeleton class="h-3 w-[80%] rounded-sm" />
				</div>
			</div>
		</div>

		<!-- Empty state -->
		<NotificationCenterEmpty v-else-if="items.length === 0" :description="emptyDescription">
			<slot name="empty" />
		</NotificationCenterEmpty>

		<!-- Virtual scroll list (has items) -->
		<div v-else class="h-[400px] flex flex-col overflow-hidden">
			<VirtualScrollArea
				:items="items"
				:estimate-size="80"
				:overscan="5"
				class="h-full"
				@scroll-end="onScrollEnd"
			>
				<template #default="{ item }">
					<NotificationCenterItem
						:item="item"
						@click="emit('itemClick', item)"
						@action-click="(clickedItem, key) => emit('actionClick', clickedItem, key)"
					/>
				</template>
				<template v-if="loading" #footer>
					<div class="flex items-center justify-center py-3">
						<Spinner size="sm" />
					</div>
				</template>
			</VirtualScrollArea>
		</div>
	</div>
</template>

<script setup lang="ts">
import VirtualScrollArea from '../../general/virtual-scroll-area/VirtualScrollArea.vue';
import Skeleton from '../../general/skeleton/Skeleton.vue';
import Spinner from '../../general/spinner/Spinner.vue';

const skeletonWidths = ['70%', '55%', '80%', '60%', '75%'];
import NotificationCenterItem from './NotificationCenterItem.vue';
import NotificationCenterEmpty from './NotificationCenterEmpty.vue';
import type { NotificationCenterItemData } from './notification-center';

interface NotificationCenterListProps {
	items: NotificationCenterItemData[];
	hasMore?: boolean;
	loading?: boolean;
	emptyDescription?: string;
}

const props = withDefaults(defineProps<NotificationCenterListProps>(), {
	hasMore: false,
	loading: false,
	// emptyDescription left undefined so NotificationCenterEmpty falls
	// through to its built-in default copy.
	emptyDescription: undefined,
});

const emit = defineEmits<{
	itemClick: [item: NotificationCenterItemData];
	actionClick: [item: NotificationCenterItemData, actionKey: string];
	loadMore: [];
}>();

function onScrollEnd() {
	if (props.hasMore && !props.loading) {
		emit('loadMore');
	}
}
</script>
