<template>
	<div data-slot="auth-card" :class="cardClasses">
		<!-- Logo -->
		<div class="mb-6 flex flex-col items-center gap-4 text-center">
			<slot name="logo">
				<div class="flex h-12 w-12 items-center justify-center rounded-full border border-border">
					<svg
						aria-hidden="true"
						width="24"
						height="24"
						viewBox="0 0 24 24"
						fill="none"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path d="M12 2L21.196 7V17L12 22L2.804 17V7L12 2Z" fill="oklch(var(--primary))" />
					</svg>
				</div>
			</slot>

			<div class="space-y-1">
				<slot name="title" />
				<slot name="subtitle" />
			</div>
		</div>

		<!-- Form content -->
		<slot />
	</div>
</template>

<script setup lang="ts">
import { cn } from '../../../helpers/cn';
import { authCardVariants } from './authentication';

interface AuthCardProps {
	class?: string;
}

const props = defineProps<AuthCardProps>();

const cardClasses = cn(authCardVariants(), props.class);
</script>
