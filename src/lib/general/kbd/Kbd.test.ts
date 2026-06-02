import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import Kbd from './Kbd.vue';
import KbdGroup from './KbdGroup.vue';

describe('Kbd', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(Kbd, { slots: { default: '⌘' } });
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as a kbd element', () => {
			const wrapper = mount(Kbd, { slots: { default: 'K' } });
			expect(wrapper.element.tagName).toBe('KBD');
		});

		it('should render slot content', () => {
			const wrapper = mount(Kbd, { slots: { default: 'Enter' } });
			expect(wrapper.text()).toBe('Enter');
		});

		it('should have data-slot="kbd"', () => {
			const wrapper = mount(Kbd, { slots: { default: '⌘' } });
			expect(wrapper.attributes('data-slot')).toBe('kbd');
		});
	});

	describe('props', () => {
		it('should accept size="sm"', () => {
			const wrapper = mount(Kbd, { props: { size: 'sm' }, slots: { default: '⌘' } });
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept size="default"', () => {
			const wrapper = mount(Kbd, { props: { size: 'default' }, slots: { default: '⌘' } });
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept size="lg"', () => {
			const wrapper = mount(Kbd, { props: { size: 'lg' }, slots: { default: '⌘' } });
			expect(wrapper.exists()).toBe(true);
		});

		it('should support custom class', () => {
			const wrapper = mount(Kbd, { props: { class: 'custom-key' }, slots: { default: '⌘' } });
			expect(wrapper.classes()).toContain('custom-key');
		});
	});

	describe('KbdGroup', () => {
		it('should render as a span with data-slot="kbd-group"', () => {
			const wrapper = mount(KbdGroup, {
				slots: { default: '<kbd>⌘</kbd><kbd>K</kbd>' },
			});
			expect(wrapper.element.tagName).toBe('SPAN');
			expect(wrapper.attributes('data-slot')).toBe('kbd-group');
		});

		it('should support custom class', () => {
			const wrapper = mount(KbdGroup, {
				props: { class: 'my-group' },
				slots: { default: '<kbd>A</kbd>' },
			});
			expect(wrapper.classes()).toContain('my-group');
		});

		it('should render child Kbd components', () => {
			const wrapper = mount({
				components: { Kbd, KbdGroup },
				template: `<KbdGroup><Kbd>⌘</Kbd><Kbd>K</Kbd></KbdGroup>`,
			});
			const keys = wrapper.findAll('[data-slot="kbd"]');
			expect(keys).toHaveLength(2);
		});

		it('should inject size to child Kbd components', () => {
			const wrapper = mount({
				components: { Kbd, KbdGroup },
				template: `<KbdGroup size="sm"><Kbd>↑</Kbd><Kbd>↓</Kbd></KbdGroup>`,
			});
			const keys = wrapper.findAll('[data-slot="kbd"]');
			expect(keys).toHaveLength(2);
			for (const key of keys) {
				expect(key.classes().some((c) => c.includes('h-'))).toBe(true);
			}
		});
	});

	describe('edge cases', () => {
		it('should render with no slot content', () => {
			const wrapper = mount(Kbd);
			expect(wrapper.exists()).toBe(true);
		});

		it('should render unicode symbols', () => {
			const wrapper = mount(Kbd, { slots: { default: '⌫' } });
			expect(wrapper.text()).toBe('⌫');
		});
	});
});
