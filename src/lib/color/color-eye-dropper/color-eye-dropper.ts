import { cva, type VariantProps } from 'class-variance-authority';

export const colorEyeDropperVariants = cva('shrink-0', {
	variants: {
		size: {
			sm: '',
			default: '',
			lg: '',
		},
	},
	defaultVariants: { size: 'default' },
});

export type ColorEyeDropperVariants = VariantProps<typeof colorEyeDropperVariants>;
export type ColorEyeDropperSize = NonNullable<ColorEyeDropperVariants['size']>;

interface EyeDropperResult {
	sRGBHex: string;
}

interface EyeDropperConstructor {
	new (): { open: (options?: { signal?: AbortSignal }) => Promise<EyeDropperResult> };
}

declare global {
	interface Window {
		EyeDropper?: EyeDropperConstructor;
	}
}

export function isEyeDropperSupported(): boolean {
	return typeof window !== 'undefined' && typeof window.EyeDropper === 'function';
}

export async function pickColorFromScreen(signal?: AbortSignal): Promise<string | null> {
	if (!isEyeDropperSupported()) return null;
	try {
		const Ctor = window.EyeDropper!;
		const instance = new Ctor();
		const { sRGBHex } = await instance.open({ signal });
		return sRGBHex;
	} catch {
		return null;
	}
}
