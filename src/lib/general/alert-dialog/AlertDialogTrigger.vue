<template>
	<AlertDialogTrigger data-slot="alert-dialog-trigger" v-bind="props" as-child>
		<slot />
	</AlertDialogTrigger>
</template>

<script setup lang="ts">
import { AlertDialogTrigger, type AlertDialogTriggerProps } from 'reka-ui';

const props = defineProps<AlertDialogTriggerProps>();
</script>
