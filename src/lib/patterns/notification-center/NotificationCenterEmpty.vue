<template>
	<div
		data-slot="notification-center-empty"
		class="flex flex-col items-center justify-center py-12 px-4 text-center"
	>
		<div
			class="flex items-center justify-center size-10 rounded-full bg-muted text-muted-foreground mb-3"
		>
			<slot name="icon">
				<Icon :icon="Bell" size="default" />
			</slot>
		</div>
		<p class="text-sm text-muted-foreground">
			<slot>{{ resolvedDescription }}</slot>
		</p>
	</div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Bell } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';

interface NotificationCenterEmptyProps {
	/** Description text for the empty state */
	description?: string;
}

const props = defineProps<NotificationCenterEmptyProps>();

const resolvedDescription = computed(() => props.description ?? 'No notifications');
</script>
