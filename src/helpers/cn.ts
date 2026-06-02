import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/**
 * Merge Tailwind class names. Combines `clsx` (conditional classes) with
 * `tailwind-merge` (later utility wins on conflict — `p-2 p-4` becomes `p-4`).
 *
 * @example
 * ```ts
 * cn('px-2 py-1', isActive && 'bg-primary', props.class)
 * ```
 */
export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs));
}
