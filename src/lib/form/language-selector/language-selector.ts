import { cva, type VariantProps } from 'class-variance-authority';

/**
 * Locale metadata: display names and emoji flags.
 *
 * Covers all locales currently shipped by the app.
 * Add entries here when new locales are introduced.
 */
export interface LocaleOption {
	code: string;
	label: string;
	flag: string;
}

const localeMetadata: Record<string, { label: string; flag: string }> = {
	de: { label: 'Deutsch', flag: '🇩🇪' },
	de_DE: { label: 'Deutsch (Deutschland)', flag: '🇩🇪' },
	en: { label: 'English', flag: '🇬🇧' },
	en_GB: { label: 'English (UK)', flag: '🇬🇧' },
	en_US: { label: 'English (US)', flag: '🇺🇸' },
	es: { label: 'Español', flag: '🇪🇸' },
	es_ES: { label: 'Español (España)', flag: '🇪🇸' },
	fr: { label: 'Français', flag: '🇫🇷' },
	fr_CA: { label: 'Français (Canada)', flag: '🇨🇦' },
	fr_FR: { label: 'Français (France)', flag: '🇫🇷' },
	it: { label: 'Italiano', flag: '🇮🇹' },
	it_IT: { label: 'Italiano (Italia)', flag: '🇮🇹' },
	pl: { label: 'Polski', flag: '🇵🇱' },
	pl_PL: { label: 'Polski (Polska)', flag: '🇵🇱' },
	pt: { label: 'Português', flag: '🇵🇹' },
	pt_BR: { label: 'Português (Brasil)', flag: '🇧🇷' },
	pt_PT: { label: 'Português (Portugal)', flag: '🇵🇹' },
};

export function getLocaleOption(code: string): LocaleOption {
	const meta = localeMetadata[code];
	return meta ? { code, ...meta } : { code, label: code, flag: '🌐' };
}

/**
 * Build locale options, filtering out bare base codes (e.g. "en")
 * when regional variants exist (e.g. "en_GB", "en_US").
 */
export function getLocaleOptions(codes: string[]): LocaleOption[] {
	const filtered = codes.filter((code) => {
		if (!code.includes('_')) {
			const hasRegional = codes.some((c) => c.startsWith(code + '_'));
			return !hasRegional;
		}
		return true;
	});
	return filtered.map(getLocaleOption);
}

/**
 * Resolve a locale code to one that exists in the filtered options.
 * Maps bare base codes (e.g. "en") to their first regional variant (e.g. "en_GB")
 * when the base code was filtered out.
 */
export function resolveLocale(code: string, codes: string[]): string {
	if (codes.includes(code) && !isFilteredOut(code, codes)) return code;
	if (!code.includes('_')) {
		const regional = codes.find((c) => c.startsWith(code + '_'));
		if (regional) return regional;
	}
	return code;
}

function isFilteredOut(code: string, codes: string[]): boolean {
	return !code.includes('_') && codes.some((c) => c.startsWith(code + '_'));
}

// Inline variant trigger — globe-icon button used in nav/footer.
// `min-h-6` (24 px) satisfies WCAG 2.2 SC 2.5.8 even at the compact density.
export const languageSelectorTriggerVariants = cva(
	[
		'inline-flex min-h-6 items-center gap-1.5 rounded px-2 py-1 transition-colors',
		'hover:text-foreground',
		'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-1',
		'disabled:cursor-not-allowed disabled:opacity-50',
	].join(' '),
	{
		variants: {
			tone: {
				muted: 'text-muted-foreground',
				foreground: 'text-foreground',
			},
			density: {
				compact: 'text-2xs',
				default: 'text-xs',
			},
		},
		defaultVariants: {
			tone: 'muted',
			density: 'compact',
		},
	},
);

export type LanguageSelectorTriggerVariants = VariantProps<typeof languageSelectorTriggerVariants>;
export type LanguageSelectorTone = NonNullable<LanguageSelectorTriggerVariants['tone']>;
export type LanguageSelectorDensity = NonNullable<LanguageSelectorTriggerVariants['density']>;
export type LanguageSelectorVariant = 'inline' | 'select';
