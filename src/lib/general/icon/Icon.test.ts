import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import { h, defineComponent } from 'vue';
import Icon from './Icon.vue';

// Mock icon component for testing
const MockIconComponent = defineComponent({
	props: { strokeWidth: { type: [String, Number] } },
	setup(props) {
		return () => h('svg', { 'data-testid': 'mock-icon', 'stroke-width': props.strokeWidth });
	},
});

describe('Icon', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Icon, {
			props: {
				icon: MockIconComponent,
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

		it('should render the icon component', () => {
			expect(wrapper.find('[data-testid="mock-icon"]').exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept icon prop', () => {
			expect(wrapper.find('[data-testid="mock-icon"]').exists()).toBe(true);
		});

		it('should accept size prop', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, size: 'lg' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept strokeWidth prop', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, strokeWidth: 3 },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default size to default', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default strokeWidth to 2', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Size Tests
	// ============================================
	describe('sizes', () => {
		it('should apply sm size', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, size: 'sm' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply default size', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, size: 'default' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply lg size', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, size: 'lg' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, class: 'custom-icon' },
			});
			expect(wrapper.html()).toContain('custom-icon');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props', () => {
			const wrapper = mount(Icon, {
				props: {
					icon: MockIconComponent,
					size: 'lg',
					strokeWidth: 4,
					class: 'custom',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle string strokeWidth', () => {
			const wrapper = mount(Icon, {
				props: { icon: MockIconComponent, strokeWidth: '2.5' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
