<template>
	<AuthCard :class="props.class">
		<template #title>
			<h1 class="text-2xl font-bold tracking-tight text-card-foreground">Reset your password</h1>
		</template>
		<template #subtitle>
			<p class="text-sm text-muted-foreground">Enter your new password to reset your account.</p>
		</template>

		<form data-slot="auth-form" class="space-y-4" @submit.prevent="handleSubmit">
			<!-- Password -->
			<div class="space-y-1.5">
				<Label for="reset-password">Password</Label>
				<Input
					id="reset-password"
					v-model="password"
					type="password"
					placeholder="Enter a new password"
					autocomplete="new-password"
					required
				/>
			</div>

			<!-- Password confirmation -->
			<div class="space-y-1.5">
				<Label for="reset-password-confirm">Password Confirmation</Label>
				<Input
					id="reset-password-confirm"
					v-model="passwordConfirmation"
					type="password"
					placeholder="Confirm your password"
					autocomplete="new-password"
					required
				/>
			</div>

			<!-- Submit -->
			<Button data-slot="auth-submit" type="submit" class="w-full" :loading="loading">
				Reset password
			</Button>
		</form>
	</AuthCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import AuthCard from './AuthCard.vue';
import Button from '../../general/button/Button.vue';
import Input from '../../form/input/Input.vue';
import Label from '../../form/label/Label.vue';
import type { AuthResetPasswordProps } from './authentication';

/**
 * AuthResetPassword — sets a new password after clicking the reset link.
 *
 * @example
 * <AuthResetPassword @submit="handleReset" />
 */
const props = withDefaults(defineProps<AuthResetPasswordProps>(), {
	loading: false,
});

const emit = defineEmits<{
	submit: [password: string, passwordConfirmation: string];
}>();

const password = ref('');
const passwordConfirmation = ref('');

function handleSubmit() {
	emit('submit', password.value, passwordConfirmation.value);
}
</script>
