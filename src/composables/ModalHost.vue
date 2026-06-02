<template>
	<component
		:is="entry.component"
		v-for="entry in stack"
		:key="entry.id"
		v-bind="entry.props"
		@resolve="(value: unknown) => resolve(value, entry.id)"
		@dismiss="(reason: unknown) => dismiss(entry.id, reason)"
		@close="close(entry.id)"
	/>
</template>

<script setup lang="ts">
import { useModal } from './useModal';

const { stack, resolve, dismiss, close } = useModal();
</script>
