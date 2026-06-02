import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import IconStatCard from './IconStatCard.vue';

describe('IconStatCard', () => {
	describe('rendering', () => {
		it('renders label and value', () => {
			const w = mount(IconStatCard, { props: { label: 'Active', value: 17 } });
			expect(w.text()).toContain('Active');
			expect(w.text()).toContain('17');
		});

		it('renders the footer when provided', () => {
			const w = mount(IconStatCard, {
				props: { label: 'Active', value: 17, footer: 'last 30 days' },
			});
			expect(w.text()).toContain('last 30 days');
		});

		it('renders the icon slot inside an aria-hidden container', () => {
			const w = mount(IconStatCard, {
				props: { label: 'Active', value: 17 },
				slots: { icon: '<div data-test="icon" />' },
			});
			const iconWrap = w.find('[data-slot="icon-stat-card-icon"]');
			expect(iconWrap.exists()).toBe(true);
			expect(iconWrap.attributes('aria-hidden')).toBe('true');
			expect(w.find('[data-test="icon"]').exists()).toBe(true);
		});
	});

	describe('layout prop', () => {
		it('defaults to stacked', () => {
			const w = mount(IconStatCard, { props: { label: 'A', value: 1 } });
			const root = w.find('[data-slot="icon-stat-card"]');
			expect(root.attributes('data-layout')).toBe('stacked');
		});

		it('accepts layout="inline" and reflects it on the root', () => {
			const w = mount(IconStatCard, {
				props: { label: 'A', value: 1, layout: 'inline' },
			});
			const root = w.find('[data-slot="icon-stat-card"]');
			expect(root.attributes('data-layout')).toBe('inline');
		});

		it('renders both layouts with the same content slots', () => {
			const stacked = mount(IconStatCard, {
				props: { label: 'A', value: 1, footer: 'F', layout: 'stacked' },
				slots: { icon: '<span data-test="icon" />' },
			});
			const inline = mount(IconStatCard, {
				props: { label: 'A', value: 1, footer: 'F', layout: 'inline' },
				slots: { icon: '<span data-test="icon" />' },
			});
			// Both layouts must surface the same data-slots — only the structural
			// arrangement changes, never the contract.
			for (const w of [stacked, inline]) {
				expect(w.find('[data-slot="stat-card-label"]').exists()).toBe(true);
				expect(w.find('[data-slot="stat-card-value"]').exists()).toBe(true);
				expect(w.find('[data-slot="stat-card-footer"]').exists()).toBe(true);
				expect(w.find('[data-slot="icon-stat-card-icon"]').exists()).toBe(true);
				expect(w.find('[data-test="icon"]').exists()).toBe(true);
			}
		});

		it('preserves the trend slot in inline layout', () => {
			const w = mount(IconStatCard, {
				props: { label: 'A', value: 1, layout: 'inline' },
				slots: { trend: '<span data-test="trend">+12%</span>' },
			});
			expect(w.find('[data-test="trend"]').exists()).toBe(true);
		});
	});

	describe('interactive mode', () => {
		it('renders as an article when not interactive', () => {
			const w = mount(IconStatCard, { props: { label: 'A', value: 1 } });
			expect(w.find('[data-slot="icon-stat-card"]').element.tagName).toBe('ARTICLE');
		});

		it('renders as role=button when interactive, both stacked and inline', () => {
			for (const layout of ['stacked', 'inline'] as const) {
				const w = mount(IconStatCard, {
					props: { label: 'A', value: 1, layout, interactive: true },
				});
				const root = w.find('[data-slot="icon-stat-card"]');
				expect(root.attributes('role')).toBe('button');
				expect(root.attributes('tabindex')).toBe('0');
			}
		});

		it('emits click when activated', async () => {
			const w = mount(IconStatCard, {
				props: { label: 'A', value: 1, interactive: true, layout: 'inline' },
			});
			await w.find('[data-slot="icon-stat-card"]').trigger('click');
			expect(w.emitted('click')).toHaveLength(1);
		});

		it('emits click on Enter / Space keypress', async () => {
			const w = mount(IconStatCard, {
				props: { label: 'A', value: 1, interactive: true, layout: 'inline' },
			});
			const root = w.find('[data-slot="icon-stat-card"]');
			await root.trigger('keydown', { key: 'Enter' });
			await root.trigger('keydown', { key: ' ' });
			expect(w.emitted('click')).toHaveLength(2);
		});
	});

	describe('loading state', () => {
		it('renders a skeleton in stacked layout when loading', () => {
			const w = mount(IconStatCard, {
				props: { label: 'A', value: 1, loading: true, layout: 'stacked' },
			});
			expect(w.find('[data-slot="icon-stat-card"]').attributes('aria-busy')).toBe('true');
			expect(w.text()).toContain('Loading A');
		});

		it('renders a skeleton in inline layout when loading', () => {
			const w = mount(IconStatCard, {
				props: { label: 'A', value: 1, loading: true, layout: 'inline' },
			});
			expect(w.find('[data-slot="icon-stat-card"]').attributes('aria-busy')).toBe('true');
			expect(w.text()).toContain('Loading A');
		});
	});
});
