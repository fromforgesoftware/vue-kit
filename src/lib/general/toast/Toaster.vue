<template>
	<Toaster
		data-slot="toaster"
		:position="position"
		:rich-colors="richColors"
		:close-button="closeButton"
		:expand="expand"
		:theme="theme"
		:duration="duration"
		:visible-toasts="visibleToasts"
		:offset="offset"
		:class="classes"
		:container-aria-label="containerAriaLabel"
	/>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { Toaster } from 'vue-sonner';
import 'vue-sonner/style.css';
import { cn } from '../../../helpers/cn';
import type { ToastPosition, ToastTheme } from './toast';

interface Props {
	position?: ToastPosition;
	/** Use rich semantic colours for success / error / warning / info toasts. */
	richColors?: boolean;
	/** Render a close button on every toast. */
	closeButton?: boolean;
	/** Always show all toasts expanded (rather than stacked). */
	expand?: boolean;
	theme?: ToastTheme;
	/** Auto-dismiss timeout (ms). */
	duration?: number;
	visibleToasts?: number;
	offset?: string | number;
	/** Tailwind classes appended to the inner toast `<ol>`. */
	class?: string;
	/**
	 * Container accessible name. Toasts within are announced by screen readers
	 * via aria-live; this label names the live region itself.
	 */
	containerAriaLabel?: string;
}

const props = withDefaults(defineProps<Props>(), {
	position: 'top-right',
	richColors: true,
	closeButton: true,
	expand: false,
	theme: 'light',
	visibleToasts: 3,
	containerAriaLabel: 'Notifications',
});

const classes = computed(() => cn(props.class));
</script>
