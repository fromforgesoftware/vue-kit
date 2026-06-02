<template>
	<AspectRatio :ratio="ratio" :class="props.class" data-slot="aspect-ratio">
		<slot />
	</AspectRatio>
</template>

<script setup lang="ts">
import { AspectRatio } from 'reka-ui';

interface AspectRatioProps {
	ratio?: number;
	class?: string;
}

const props = withDefaults(defineProps<AspectRatioProps>(), {
	ratio: 1,
});
</script>
