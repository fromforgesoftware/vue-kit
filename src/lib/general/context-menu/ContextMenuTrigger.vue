<template>
	<ContextMenuTrigger data-slot="context-menu-trigger" v-bind="props" as-child>
		<slot />
	</ContextMenuTrigger>
</template>

<script setup lang="ts">
import { ContextMenuTrigger, type ContextMenuTriggerProps } from 'reka-ui';

const props = defineProps<ContextMenuTriggerProps>();
</script>
