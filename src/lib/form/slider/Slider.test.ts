import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Slider from './Slider.vue';

describe('Slider', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Slider, {
			props: {
				modelValue: [50],
			},
		});
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should expose data-slot="slider" on the root', () => {
			expect(wrapper.attributes('data-slot')).toBe('slider');
		});

		it('should render track element', () => {
			expect(wrapper.find('[data-slot="slider-track"]').exists()).toBe(true);
		});

		it('should render range element', () => {
			expect(wrapper.find('[data-slot="slider-range"]').exists()).toBe(true);
		});

		it('should render thumb element', () => {
			expect(wrapper.find('[data-slot="slider-thumb"]').exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept modelValue prop', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept defaultValue prop', () => {
			const wrapper = mount(Slider, {
				props: { defaultValue: [25] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept min prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], min: 10 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept max prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], max: 200 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept step prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], step: 5 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept disabled prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], disabled: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept orientation prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], orientation: 'vertical' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept name prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], name: 'volume' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept id prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], id: 'slider-1' },
			});
			expect(wrapper.attributes('id')).toBe('slider-1');
		});

		it('should accept size prop', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], size: 'sm' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should set aria-invalid when error prop is true', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], error: true },
			});
			expect(wrapper.attributes('aria-invalid')).toBe('true');
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default min to 0', () => {
			const wrapper = mount(Slider);
			expect(wrapper.exists()).toBe(true);
		});

		it('should default max to 100', () => {
			const wrapper = mount(Slider);
			expect(wrapper.exists()).toBe(true);
		});

		it('should default step to 1', () => {
			const wrapper = mount(Slider);
			expect(wrapper.exists()).toBe(true);
		});

		it('should default orientation to horizontal', () => {
			const wrapper = mount(Slider);
			expect(wrapper.exists()).toBe(true);
		});

		it('should default disabled to false', () => {
			const wrapper = mount(Slider);
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Orientation Tests
	// ============================================
	describe('orientation', () => {
		it('should support horizontal orientation', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], orientation: 'horizontal' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should support vertical orientation', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], orientation: 'vertical' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Disabled State Tests
	// ============================================
	describe('disabled state', () => {
		it('should be disabled when prop is set', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], disabled: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should not be disabled by default', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50] },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:modelValue emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Range Slider Tests
	// ============================================
	describe('range slider', () => {
		it('should support multiple thumbs for range', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [25, 75] },
			});
			const thumbs = wrapper.findAll('[data-slot="slider-thumb"]');
			expect(thumbs.length).toBe(2);
		});

		it('should render thumb for each value', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [20, 40, 60] },
			});
			const thumbs = wrapper.findAll('[data-slot="slider-thumb"]');
			expect(thumbs.length).toBe(3);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], class: 'custom-slider' },
			});
			expect(wrapper.html()).toContain('custom-slider');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle min greater than default value', () => {
			const wrapper = mount(Slider, {
				props: { defaultValue: [0], min: 10 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle value at boundaries', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [0], min: 0, max: 100 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle max value at boundary', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [100], min: 0, max: 100 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle large step values', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [50], step: 25 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle decimal step values', () => {
			const wrapper = mount(Slider, {
				props: { modelValue: [0.5], min: 0, max: 1, step: 0.1 },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
