import type { Component } from 'vue';
import { ShieldX, FileQuestion, AlertOctagon, Lock } from '@lucide/vue';
import type { IllustrationName } from '../empty-state/empty-state.js';

export type ForbiddenStateVariant = 'forbidden' | 'not-found' | 'error' | 'locked';
export type ForbiddenStateSize = 'default' | 'lg';
export type ForbiddenStateTone = 'default' | 'muted';

export interface ForbiddenStatePreset {
	icon: Component;
	illustration?: IllustrationName;
	title: string;
	description: string;
}

export const FORBIDDEN_STATE_PRESETS: Record<ForbiddenStateVariant, ForbiddenStatePreset> = {
	forbidden: {
		icon: ShieldX,
		illustration: 'forbidden',
		title: 'Access Denied',
		description:
			'You do not have permission to view this page. Contact your administrator if you believe this is an error.',
	},
	'not-found': {
		icon: FileQuestion,
		illustration: 'not-found',
		title: 'Not found',
		description: 'The page or resource you were looking for could not be found.',
	},
	error: {
		icon: AlertOctagon,
		title: 'Something went wrong',
		description:
			'An unexpected error occurred. Try again or contact support if the problem persists.',
	},
	locked: {
		icon: Lock,
		illustration: 'forbidden',
		title: 'This is locked',
		description: 'This area is currently unavailable. Reach out to your administrator for access.',
	},
};

export interface ForbiddenStateProps {
	/** Pick the preset (illustration + icon + default title + default description). */
	variant?: ForbiddenStateVariant;
	/** Override the preset title. */
	title?: string;
	/** Override the preset description. */
	description?: string;
	/** Override the preset icon. Ignored when an illustration is resolved. */
	icon?: Component;
	/** Override the preset illustration. */
	illustration?: IllustrationName;
	/** Container size — defaults to `lg`. */
	size?: ForbiddenStateSize;
	/** Container tone — `default` is transparent; `muted` adds a soft background. */
	tone?: ForbiddenStateTone;
	class?: string;
}
