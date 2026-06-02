<template>
	<div class="flex items-center gap-2">
		<Button
			v-for="action in actions"
			:key="action.key"
			data-slot="notification-center-action"
			:variant="action.variant ?? 'secondary'"
			size="sm"
			:disabled="action.disabled"
			:loading="action.loading"
			@click.stop="emit('action', action.key)"
		>
			<Icon v-if="action.icon" :icon="action.icon" size="sm" />
			{{ action.label }}
		</Button>
	</div>
</template>

<script setup lang="ts">
import Button from '../../general/button/Button.vue';
import Icon from '../../general/icon/Icon.vue';
import type { NotificationCenterAction } from './notification-center';

interface NotificationCenterActionsProps {
	actions: NotificationCenterAction[];
}

defineProps<NotificationCenterActionsProps>();

const emit = defineEmits<{
	action: [key: string];
}>();
</script>
