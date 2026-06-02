<template>
	<TabsContent data-slot="tabs-content" :value="value" :force-mount="forceMount" :class="classes">
		<slot />
	</TabsContent>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { TabsContent, type TabsContentProps } from 'reka-ui';
import { cn } from '../../../helpers/cn';
import { tabsContentVariants } from './tabs';

interface Props extends TabsContentProps {
	class?: string;
}

const props = defineProps<Props>();

const classes = computed(() => cn(tabsContentVariants(), props.class));
</script>
