<template>
	<AuthCard :class="props.class">
		<template #title>
			<!-- Realm badge -->
			<div v-if="realm" class="mb-1 flex justify-center">
				<Badge variant="outline" shape="pill" class="px-3 text-muted-foreground">
					Signing in to: <span class="font-medium text-foreground">{{ realm }}</span>
				</Badge>
			</div>
			<h1 class="text-2xl font-bold tracking-tight text-card-foreground">
				Enter your verification code
			</h1>
		</template>
		<template #subtitle>
			<p class="text-sm text-muted-foreground">
				We sent a 6-digit code to
				<span v-if="email" class="font-semibold text-foreground">{{ email }}</span>
				<span v-else>your email</span>
			</p>
		</template>

		<form data-slot="auth-form" class="space-y-6" @submit.prevent="handleSubmit">
			<!-- OTP input with shake -->
			<div class="flex flex-col items-center gap-2">
				<div :class="['transition-transform', isShaking && 'animate-otp-shake']">
					<PinInput
						v-model="otpValue"
						:length="6"
						type="number"
						otp
						:class="error ? 'otp-error' : ''"
						@complete="handleComplete"
					/>
				</div>

				<!-- Error message -->
				<div v-if="error" role="alert" class="flex items-center gap-1.5 text-sm text-destructive">
					<Icon :icon="AlertCircle" size="sm" class="shrink-0" />
					<span>{{ error }}</span>
				</div>
			</div>

			<!-- Submit -->
			<Button
				data-slot="auth-submit"
				type="submit"
				class="w-full"
				:disabled="!isComplete"
				:loading="loading"
			>
				Sign In
			</Button>

			<!-- Helper + resend -->
			<div class="space-y-1 text-center">
				<p class="text-xs text-muted-foreground">
					Check your spam folder if you don't see the code in a minute
				</p>
				<p class="text-sm text-muted-foreground">
					Didn't get the code?
					<Button
						v-if="canResend"
						variant="link"
						size="sm"
						class="h-auto p-0 text-primary-text"
						@click="handleResend"
					>
						Resend code
					</Button>
					<span v-else class="font-medium"> Resend available in {{ formattedCountdown }} </span>
				</p>
			</div>
		</form>
	</AuthCard>
</template>

<script setup lang="ts">
import { ref, computed, watch, onUnmounted } from 'vue';
import { AlertCircle } from '@lucide/vue';
import Icon from '../../general/icon/Icon.vue';
import AuthCard from './AuthCard.vue';
import Button from '../../general/button/Button.vue';
import PinInput from '../../form/pin-input/PinInput.vue';
import Badge from '../../general/badge/Badge.vue';
import type { AuthOTPVerificationProps } from './authentication.js';

/**
 * AuthOTPVerification — 6-digit OTP entry with countdown timer and error shake animation.
 *
 * @example
 * <AuthOTPVerification
 *   email="admin@demo.com"
 *   realm="acme"
 *   :error="errorMessage"
 *   @submit="handleOTP"
 *   @resend="handleResend"
 * />
 */
const props = withDefaults(defineProps<AuthOTPVerificationProps>(), {
	resendCooldown: 60,
	loading: false,
});

const emit = defineEmits<{
	submit: [code: string];
	resend: [];
}>();

// --- OTP value ---
const otpValue = ref<string[]>([]);

const isComplete = computed(() => otpValue.value.filter(Boolean).length === 6);

function handleComplete(value: string[]) {
	otpValue.value = value;
}

function handleSubmit() {
	if (!isComplete.value) return;
	emit('submit', otpValue.value.join(''));
}

// --- Countdown timer ---
const countdown = ref(props.resendCooldown);
let timer: ReturnType<typeof setInterval> | null = null;

function startTimer() {
	countdown.value = props.resendCooldown;
	timer = setInterval(() => {
		if (countdown.value > 0) {
			countdown.value--;
		} else {
			clearTimer();
		}
	}, 1000);
}

function clearTimer() {
	if (timer) {
		clearInterval(timer);
		timer = null;
	}
}

const formattedCountdown = computed(() => {
	const m = Math.floor(countdown.value / 60)
		.toString()
		.padStart(2, '0');
	const s = (countdown.value % 60).toString().padStart(2, '0');
	return `${m}:${s}`;
});

const canResend = computed(() => countdown.value === 0);

function handleResend() {
	emit('resend');
	startTimer();
}

// Start countdown on mount
startTimer();
onUnmounted(clearTimer);

// --- Shake animation on error ---
const isShaking = ref(false);

watch(
	() => props.error,
	(newError) => {
		if (newError) {
			// Reset OTP so user can re-enter
			otpValue.value = [];
			// Trigger shake
			isShaking.value = true;
			setTimeout(() => {
				isShaking.value = false;
			}, 500);
		}
	},
);
</script>

<style scoped>
@keyframes otp-shake {
	0%,
	100% {
		transform: translateX(0);
	}
	20% {
		transform: translateX(-6px);
	}
	40% {
		transform: translateX(6px);
	}
	60% {
		transform: translateX(-4px);
	}
	80% {
		transform: translateX(4px);
	}
}

.animate-otp-shake {
	animation: otp-shake 0.45s ease-in-out;
}

/* Red border + text on all PinInput cells when there is an error */
.otp-error :deep([data-slot='pin-input'] input) {
	border-color: oklch(var(--destructive));
	color: oklch(var(--destructive));
}
</style>
