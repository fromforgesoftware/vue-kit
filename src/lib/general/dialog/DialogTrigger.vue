<template>
	<DialogTrigger data-slot="dialog-trigger" v-bind="props" as-child>
		<slot />
	</DialogTrigger>
</template>

<script setup lang="ts">
import { DialogTrigger, type DialogTriggerProps } from 'reka-ui';

const props = defineProps<DialogTriggerProps>();
</script>
