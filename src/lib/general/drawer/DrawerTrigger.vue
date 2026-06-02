<template>
	<!--
    The trigger is a transparent inline wrapper: the consumer is expected to
    provide their own focusable element (typically <Button>). We don't add
    role="button" or tabindex on the span because that would create a nested
    interactive element when paired with a focusable child (axe nested-interactive).
    Click events bubble from the inner element to open the drawer; keyboard
    Enter/Space activate the inner button natively, which bubbles a click here.
  -->
	<span data-slot="drawer-trigger" @click="onClick">
		<slot />
	</span>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { drawerKey } from './drawer';

const ctx = inject(drawerKey)!;

function onClick() {
	ctx.open();
}
</script>
