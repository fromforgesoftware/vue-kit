<template>
	<AuthCard :class="props.class">
		<template #title>
			<h1 class="text-2xl font-bold tracking-tight text-card-foreground">Thanks for signing up!</h1>
		</template>
		<template #subtitle>
			<p class="text-sm text-muted-foreground">
				Please verify your email address before continuing.
			</p>
		</template>

		<div class="space-y-4">
			<p class="text-sm text-muted-foreground">
				We've sent a verification link to
				<span v-if="email" class="font-semibold text-foreground">{{ email }}</span
				><span v-else>your email address</span>. Please click the link to verify your email address.
			</p>

			<p class="text-sm text-muted-foreground">
				Didn't receive the email? Click the button below to resend the verification link.
			</p>

			<div class="flex items-center gap-4">
				<Button data-slot="auth-submit" class="flex-1" :loading="loading" @click="emit('resend')">
					Resend verification email
				</Button>
				<Button
					variant="link"
					size="sm"
					class="h-auto p-0 text-muted-foreground hover:text-foreground"
					@click="emit('logout')"
				>
					Log out
				</Button>
			</div>
		</div>
	</AuthCard>
</template>

<script setup lang="ts">
import AuthCard from './AuthCard.vue';
import Button from '../../general/button/Button.vue';
import type { AuthEmailVerificationProps } from './authentication.js';

/**
 * AuthEmailVerification — post-registration screen asking the user to verify their email.
 *
 * @example
 * <AuthEmailVerification email="user@example.com" @resend="handleResend" @logout="handleLogout" />
 */
const props = withDefaults(defineProps<AuthEmailVerificationProps>(), {
	loading: false,
});

const emit = defineEmits<{
	resend: [];
	logout: [];
}>();
</script>
