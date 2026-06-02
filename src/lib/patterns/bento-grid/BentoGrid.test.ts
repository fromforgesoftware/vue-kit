import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import { h } from 'vue';
import BentoGrid from './BentoGrid.vue';
import BentoCard from './BentoCard.vue';

describe('BentoGrid', () => {
	it('applies the dense auto-flow class', () => {
		const wrapper = mount(BentoGrid, { slots: { default: () => 'hi' } });
		const root = wrapper.find('[data-slot="bento-grid"]');
		expect(root.attributes('class')).toMatch(/grid-auto-flow:dense/);
	});

	it('uses 3 columns by default at the lg breakpoint', () => {
		const wrapper = mount(BentoGrid, { slots: { default: () => 'hi' } });
		const root = wrapper.find('[data-slot="bento-grid"]');
		expect(root.attributes('class')).toContain('lg:grid-cols-3');
	});

	it('honours a custom column count', () => {
		const wrapper = mount(BentoGrid, {
			props: { cols: 4 },
			slots: { default: () => 'hi' },
		});
		expect(wrapper.find('[data-slot="bento-grid"]').attributes('class')).toContain(
			'lg:grid-cols-4',
		);
	});

	it('honours gap variants', () => {
		const wrapper = mount(BentoGrid, {
			props: { gap: 'lg' },
			slots: { default: () => 'hi' },
		});
		expect(wrapper.find('[data-slot="bento-grid"]').attributes('class')).toContain('gap-4');
	});

	it('renders slot content', () => {
		const wrapper = mount(BentoGrid, {
			slots: { default: () => h('div', { 'data-test': 'child' }, 'inside') },
		});
		expect(wrapper.find('[data-test="child"]').text()).toBe('inside');
	});
});

describe('BentoCard', () => {
	it('defaults to size sm (1×1)', () => {
		const wrapper = mount(BentoCard, { slots: { default: () => 'hi' } });
		const root = wrapper.find('[data-slot="bento-card"]');
		expect(root.attributes('data-bento-size')).toBe('sm');
		expect(root.attributes('class')).toContain('col-span-1');
		expect(root.attributes('class')).toContain('row-span-1');
	});

	it('size=wide spans the full row', () => {
		const wrapper = mount(BentoCard, {
			props: { size: 'wide' },
			slots: { default: () => 'hi' },
		});
		const root = wrapper.find('[data-slot="bento-card"]');
		expect(root.attributes('data-bento-size')).toBe('wide');
		expect(root.attributes('class')).toContain('col-span-full');
	});

	it('size=hero spans 2×2 at sm+', () => {
		const wrapper = mount(BentoCard, {
			props: { size: 'hero' },
			slots: { default: () => 'hi' },
		});
		const root = wrapper.find('[data-slot="bento-card"]');
		expect(root.attributes('class')).toContain('sm:col-span-2');
		expect(root.attributes('class')).toContain('sm:row-span-2');
	});

	it('interactive prop applies hover styles (incl. bare attribute usage)', () => {
		// Bare attribute (`<BentoCard interactive>`) should auto-coerce to
		// boolean true. If the prop type is a literal union (`true | false | null
		// | undefined`) Vue does not auto-coerce — this regression test guards
		// the boolean prop type.
		const wrapper = mount(BentoCard, {
			attrs: { interactive: '' }, // simulates bare attribute syntax
			slots: { default: () => 'hi' },
		});
		const cls = wrapper.find('[data-slot="bento-card"]').attributes('class') ?? '';
		expect(cls).toContain('cursor-pointer');
		expect(cls).toContain('hover:shadow-sm');
	});

	it('interactive=false omits hover styles', () => {
		const wrapper = mount(BentoCard, {
			props: { interactive: false },
			slots: { default: () => 'hi' },
		});
		const cls = wrapper.find('[data-slot="bento-card"]').attributes('class') ?? '';
		expect(cls).not.toContain('cursor-pointer');
	});

	it('size=tall-lg spans 3 rows at sm+', () => {
		const wrapper = mount(BentoCard, {
			props: { size: 'tall-lg' },
			slots: { default: () => 'hi' },
		});
		const root = wrapper.find('[data-slot="bento-card"]');
		expect(root.attributes('data-bento-size')).toBe('tall-lg');
		expect(root.attributes('class')).toContain('col-span-1');
		expect(root.attributes('class')).toContain('sm:row-span-3');
	});

	it('adds the @container class so consumers can use container queries inside', () => {
		const wrapper = mount(BentoCard, { slots: { default: () => 'hi' } });
		expect(wrapper.find('[data-slot="bento-card"]').attributes('class')).toContain('@container');
	});

	it('renders slot content', () => {
		const wrapper = mount(BentoCard, {
			slots: { default: () => h('span', { 'data-test': 'child' }, 'inside') },
		});
		expect(wrapper.find('[data-test="child"]').text()).toBe('inside');
	});
});
