<template>
	<DropdownMenuTrigger data-slot="dropdown-menu-trigger" v-bind="props" as-child>
		<slot />
	</DropdownMenuTrigger>
</template>

<script setup lang="ts">
import { DropdownMenuTrigger, type DropdownMenuTriggerProps } from 'reka-ui';

const props = defineProps<DropdownMenuTriggerProps>();
</script>
