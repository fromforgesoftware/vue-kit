<template>
	<AuthCard :class="props.class">
		<template #title>
			<h1 class="text-2xl font-bold tracking-tight text-card-foreground">Forgot your password?</h1>
		</template>
		<template #subtitle>
			<p class="text-sm text-muted-foreground">Enter your email to reset your password.</p>
		</template>

		<form data-slot="auth-form" class="space-y-4" @submit.prevent="handleSubmit">
			<!-- Email -->
			<div class="space-y-1.5">
				<Label for="forgot-email">Email</Label>
				<Input
					id="forgot-email"
					v-model="email"
					type="email"
					placeholder="you@example.com"
					autocomplete="email"
					required
				/>
			</div>

			<!-- Submit -->
			<Button data-slot="auth-submit" type="submit" class="w-full" :loading="loading">
				Send reset link
			</Button>

			<!-- Back to login -->
			<p class="text-center text-sm text-muted-foreground">
				Remember your password?
				<Button variant="link" size="sm" class="h-auto p-0 text-foreground" @click="emit('login')">
					Login
				</Button>
			</p>
		</form>
	</AuthCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AuthCard from './AuthCard.vue';
import Button from '../../general/button/Button.vue';
import Input from '../../form/input/Input.vue';
import Label from '../../form/label/Label.vue';
import type { AuthForgotPasswordProps } from './authentication.js';

/**
 * AuthForgotPassword — sends a password reset link to the provided email.
 *
 * @example
 * <AuthForgotPassword @submit="handleForgot" @login="goToSignIn" />
 */
const props = withDefaults(defineProps<AuthForgotPasswordProps>(), {
	loading: false,
});

const emit = defineEmits<{
	submit: [email: string];
	login: [];
}>();

const email = ref('');

function handleSubmit() {
	emit('submit', email.value);
}
</script>
