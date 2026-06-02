import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { getLocaleOption, getLocaleOptions, resolveLocale } from './language-selector.js';
import LanguageSelector from './LanguageSelector.vue';

// ============================================
// Utility Function Tests
// ============================================
describe('language-selector utilities', () => {
	const allLocales = [
		'de',
		'de_DE',
		'en',
		'en_GB',
		'en_US',
		'es',
		'es_ES',
		'fr',
		'fr_CA',
		'fr_FR',
		'it',
		'it_IT',
		'pl',
		'pl_PL',
		'pt',
		'pt_BR',
		'pt_PT',
	];

	describe('getLocaleOption', () => {
		it('returns correct label and flag for known locale', () => {
			const opt = getLocaleOption('en_GB');
			expect(opt.code).toBe('en_GB');
			expect(opt.label).toBe('English (UK)');
			expect(opt.flag).toBe('🇬🇧');
		});

		it('returns correct label for base locale', () => {
			const opt = getLocaleOption('es');
			expect(opt.label).toBe('Español');
		});

		it('returns fallback for unknown locale', () => {
			const opt = getLocaleOption('xx_YY');
			expect(opt.code).toBe('xx_YY');
			expect(opt.label).toBe('xx_YY');
			expect(opt.flag).toBe('🌐');
		});
	});

	describe('getLocaleOptions', () => {
		it('filters out bare base codes when regional variants exist', () => {
			const options = getLocaleOptions(allLocales);
			const codes = options.map((o) => o.code);

			// Bare codes should be filtered out
			expect(codes).not.toContain('en');
			expect(codes).not.toContain('es');
			expect(codes).not.toContain('fr');
			expect(codes).not.toContain('de');
			expect(codes).not.toContain('it');
			expect(codes).not.toContain('pl');
			expect(codes).not.toContain('pt');

			// Regional variants should remain
			expect(codes).toContain('en_GB');
			expect(codes).toContain('en_US');
			expect(codes).toContain('es_ES');
			expect(codes).toContain('fr_CA');
			expect(codes).toContain('fr_FR');
		});

		it('keeps bare code when no regional variant exists', () => {
			const options = getLocaleOptions(['pl', 'en_GB']);
			const codes = options.map((o) => o.code);

			expect(codes).toContain('pl');
			expect(codes).toContain('en_GB');
		});

		it('returns all codes when none have regional variants', () => {
			const options = getLocaleOptions(['en_GB', 'es_ES', 'fr_FR']);
			expect(options).toHaveLength(3);
		});

		it('returns empty array for empty input', () => {
			expect(getLocaleOptions([])).toEqual([]);
		});
	});

	describe('resolveLocale', () => {
		it('resolves bare base code to first regional variant', () => {
			expect(resolveLocale('en', allLocales)).toBe('en_GB');
		});

		it('returns regional code unchanged', () => {
			expect(resolveLocale('en_US', allLocales)).toBe('en_US');
		});

		it('returns bare code when no regional variant exists', () => {
			expect(resolveLocale('pl', ['pl'])).toBe('pl');
		});

		it('returns unknown code unchanged', () => {
			expect(resolveLocale('xx', allLocales)).toBe('xx');
		});

		it('resolves each base language to its first regional variant', () => {
			expect(resolveLocale('de', allLocales)).toBe('de_DE');
			expect(resolveLocale('es', allLocales)).toBe('es_ES');
			expect(resolveLocale('fr', allLocales)).toBe('fr_CA');
			expect(resolveLocale('pt', allLocales)).toBe('pt_BR');
		});
	});
});

// ============================================
// Component Tests
// ============================================
describe('LanguageSelector', () => {
	const locales = ['en_GB', 'en_US', 'es_ES', 'fr_FR'];

	it('renders correctly', () => {
		const wrapper = mount(LanguageSelector, {
			props: { modelValue: 'en_GB', locales },
		});
		expect(wrapper.exists()).toBe(true);
	});

	it('displays current locale label in trigger', () => {
		const wrapper = mount(LanguageSelector, {
			props: { modelValue: 'en_GB', locales },
		});
		expect(wrapper.text()).toContain('English (UK)');
	});

	it('displays resolved locale label when given bare code', () => {
		const wrapper = mount(LanguageSelector, {
			props: { modelValue: 'en', locales: ['en', 'en_GB', 'en_US'] },
		});
		expect(wrapper.text()).toContain('English (UK)');
	});

	it('emits update:modelValue to resolve bare base code on mount', async () => {
		const wrapper = mount(LanguageSelector, {
			props: { modelValue: 'en', locales: ['en', 'en_GB', 'en_US'] },
		});
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toBeTruthy();
		expect(emitted![0]).toEqual(['en_GB']);
	});

	it('does not emit on mount when locale is already valid', async () => {
		const wrapper = mount(LanguageSelector, {
			props: { modelValue: 'en_GB', locales },
		});
		await wrapper.vm.$nextTick();
		const emitted = wrapper.emitted('update:modelValue');
		expect(emitted).toBeUndefined();
	});

	it('renders trigger button with globe icon', () => {
		const wrapper = mount(LanguageSelector, {
			props: { modelValue: 'en_GB', locales },
		});
		const svgs = wrapper.findAll('svg');
		expect(svgs.length).toBeGreaterThanOrEqual(1);
	});
});
