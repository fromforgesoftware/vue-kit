<template>
	<AuthCard :class="props.class">
		<template #title>
			<h1 class="text-2xl font-bold tracking-tight text-card-foreground">Welcome back</h1>
		</template>
		<template #subtitle>
			<p class="text-sm text-muted-foreground">Enter your credentials to login to your account.</p>
		</template>

		<form data-slot="auth-form" class="space-y-4" @submit.prevent="handleSubmit">
			<!-- Error — soft destructive alert, inline above the form so the
           message is spatially anchored to the inputs. Hidden when no
           error is set; only the consumer (LoginView) drives it. -->
			<Alert v-if="error" variant="destructive" tone="soft" size="sm" :icon="AlertCircle">
				<AlertTitle>Couldn't sign in</AlertTitle>
				<AlertDescription>{{ error }}</AlertDescription>
			</Alert>

			<!-- Email -->
			<div class="space-y-1.5">
				<Label for="signin-email">Email</Label>
				<Input
					id="signin-email"
					v-model="email"
					type="email"
					placeholder="you@example.com"
					autocomplete="email"
					required
				/>
			</div>

			<!-- Password -->
			<div class="space-y-1.5">
				<Label for="signin-password">Password</Label>
				<div class="relative">
					<Input
						id="signin-password"
						v-model="password"
						:type="showPassword ? 'text' : 'password'"
						placeholder="Enter your password"
						autocomplete="current-password"
						class="pr-10"
						required
					/>
					<Button
						variant="ghost"
						size="icon-xs"
						class="absolute right-1 top-1/2 -translate-y-1/2 text-muted-foreground"
						:aria-label="showPassword ? 'Hide password' : 'Show password'"
						@click="showPassword = !showPassword"
					>
						<Icon v-if="showPassword" :icon="EyeOff" size="sm" />
						<Icon v-else :icon="Eye" size="sm" />
					</Button>
				</div>
			</div>

			<!-- Remember me + Forgot password -->
			<div class="flex items-center justify-between">
				<div class="flex items-center gap-2">
					<Checkbox
						id="signin-remember"
						:checked="rememberMe"
						@update:checked="rememberMe = !!$event"
					/>
					<Label for="signin-remember" class="cursor-pointer font-normal">Remember me</Label>
				</div>
				<Button
					variant="link"
					size="sm"
					class="h-auto p-0 text-muted-foreground hover:text-foreground"
					@click="emit('forgotPassword')"
				>
					Forgot password?
				</Button>
			</div>

			<!-- Submit -->
			<Button data-slot="auth-submit" type="submit" class="w-full" :loading="loading">
				Sign in
			</Button>

			<!-- Register link -->
			<p class="text-center text-sm text-muted-foreground">
				Don't have an account?
				<Button
					variant="link"
					size="sm"
					class="h-auto p-0 text-foreground"
					@click="emit('register')"
				>
					Register
				</Button>
			</p>

			<!-- Divider — only render if at least one social provider is shown. -->
			<Divider v-if="showGoogleLogin || showGithubLogin" label="Or" />

			<!-- Social buttons -->
			<div v-if="showGoogleLogin || showGithubLogin" class="space-y-2">
				<Button
					v-if="showGoogleLogin"
					type="button"
					variant="outline"
					class="w-full"
					@click="emit('googleLogin', rememberMe)"
				>
					<!-- Google icon -->
					<svg
						aria-hidden="true"
						class="h-4 w-4"
						viewBox="0 0 24 24"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
							fill="#4285F4"
						/>
						<path
							d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
							fill="#34A853"
						/>
						<path
							d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
							fill="#FBBC05"
						/>
						<path
							d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
							fill="#EA4335"
						/>
					</svg>
					Login with Google
				</Button>

				<Button
					v-if="showGithubLogin"
					type="button"
					variant="outline"
					class="w-full"
					@click="emit('githubLogin', rememberMe)"
				>
					<!-- GitHub icon -->
					<svg
						aria-hidden="true"
						class="h-4 w-4"
						viewBox="0 0 24 24"
						fill="currentColor"
						xmlns="http://www.w3.org/2000/svg"
					>
						<path
							d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
						/>
					</svg>
					Login with GitHub
				</Button>
			</div>
		</form>
	</AuthCard>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { Eye, EyeOff, AlertCircle } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import AuthCard from './AuthCard.vue';
import Button from '../../general/button/Button.vue';
import Input from '../../form/input/Input.vue';
import Label from '../../form/label/Label.vue';
import Checkbox from '../../form/checkbox/Checkbox.vue';
import Divider from '../../general/divider/Divider.vue';
import Alert from '../../general/alert/Alert.vue';
import AlertTitle from '../../general/alert/AlertTitle.vue';
import AlertDescription from '../../general/alert/AlertDescription.vue';
import type { AuthSignInProps } from './authentication';

/**
 * AuthSignIn — sign-in card with email/password, social login and links.
 *
 * @example
 * <AuthSignIn @submit="handleSignIn" @forgot-password="goToForgot" />
 */
const props = withDefaults(defineProps<AuthSignInProps>(), {
	loading: false,
	showGoogleLogin: true,
	showGithubLogin: true,
});

const emit = defineEmits<{
	submit: [email: string, password: string, rememberMe: boolean];
	forgotPassword: [];
	register: [];
	googleLogin: [rememberMe: boolean];
	githubLogin: [rememberMe: boolean];
}>();

const email = ref('');
const password = ref('');
const rememberMe = ref(false);
const showPassword = ref(false);

function handleSubmit() {
	emit('submit', email.value, password.value, rememberMe.value);
}
</script>
