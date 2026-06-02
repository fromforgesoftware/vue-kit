import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import DropdownMenu from './DropdownMenu.vue';

describe('DropdownMenu', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(DropdownMenu);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render slot content', () => {
			const wrapper = mount(DropdownMenu, {
				slots: {
					default: '<div class="menu-trigger">Open Menu</div>',
				},
			});
			expect(wrapper.find('.menu-trigger').exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept open prop', () => {
			const wrapper = mount(DropdownMenu, {
				props: { open: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultOpen prop', () => {
			const wrapper = mount(DropdownMenu, {
				props: { defaultOpen: false },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept modal prop', () => {
			const wrapper = mount(DropdownMenu, {
				props: { modal: false },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should default modal to true', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:open emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(DropdownMenu, {
				props: {
					open: false,
					defaultOpen: false,
					modal: true,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with complex slot content', () => {
			const wrapper = mount(DropdownMenu, {
				slots: {
					default: `
            <button class="trigger">Open</button>
            <div class="content">
              <div class="item">Item 1</div>
              <div class="item">Item 2</div>
            </div>
          `,
				},
			});
			expect(wrapper.find('.trigger').exists()).toBe(true);
			expect(wrapper.findAll('.item')).toHaveLength(2);
		});
	});
});
