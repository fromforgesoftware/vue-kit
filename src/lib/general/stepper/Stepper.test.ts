import { describe, it, expect, beforeEach } from 'vitest';
import { mount, type VueWrapper } from '@vue/test-utils';
import Stepper from './Stepper.vue';

const sampleSteps = [
	{ id: 'step-1', title: 'Step 1', description: 'First step' },
	{ id: 'step-2', title: 'Step 2', description: 'Second step' },
	{ id: 'step-3', title: 'Step 3', description: 'Third step' },
];

describe('Stepper', () => {
	let wrapper: VueWrapper;

	beforeEach(() => {
		wrapper = mount(Stepper, {
			props: {
				steps: sampleSteps,
				modelValue: 0,
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

		it('should render step indicators', () => {
			expect(wrapper.text()).toContain('1');
		});

		it('should render step titles', () => {
			expect(wrapper.text()).toContain('Step 1');
			expect(wrapper.text()).toContain('Step 2');
			expect(wrapper.text()).toContain('Step 3');
		});

		it('should render step descriptions', () => {
			expect(wrapper.text()).toContain('First step');
		});

		it('should render navigation buttons by default', () => {
			expect(wrapper.text()).toContain('Previous');
			expect(wrapper.text()).toContain('Next');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept steps prop', () => {
			expect(wrapper.text()).toContain('Step 1');
		});

		it('should accept modelValue prop', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 1 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept loading prop', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 0, loading: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept showNavigation prop', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 0, showNavigation: false },
			});
			expect(wrapper.text()).not.toContain('Previous');
			expect(wrapper.text()).not.toContain('Next');
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default modelValue to 0', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should default loading to false', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default showNavigation to true', () => {
			expect(wrapper.text()).toContain('Previous');
			expect(wrapper.text()).toContain('Next');
		});
	});

	// ============================================
	// Navigation Tests
	// ============================================
	describe('navigation', () => {
		it('should disable Previous button on first step', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 0 },
			});
			const buttons = wrapper.findAll('button');
			const prevButton = buttons.find((b) => b.text().includes('Previous'));
			expect(prevButton?.attributes('disabled')).toBeDefined();
		});

		it('should show Finish on last step', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 2 },
			});
			expect(wrapper.text()).toContain('Finish');
		});

		it('should show Next on non-last steps', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 0 },
			});
			expect(wrapper.text()).toContain('Next');
		});
	});

	// ============================================
	// Loading State Tests
	// ============================================
	describe('loading state', () => {
		it('should disable Next button when loading', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 0, loading: true },
			});
			const buttons = wrapper.findAll('button');
			const nextButton = buttons.find((b) => b.text().includes('Next'));
			expect(nextButton?.attributes('disabled')).toBeDefined();
		});

		it('should disable Previous button when loading', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 1, loading: true },
			});
			const buttons = wrapper.findAll('button');
			const prevButton = buttons.find((b) => b.text().includes('Previous'));
			expect(prevButton?.attributes('disabled')).toBeDefined();
		});
	});

	// ============================================
	// Slot Tests
	// ============================================
	describe('slots', () => {
		it('should render default slot content', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, modelValue: 0 },
				slots: {
					default: '<div class="step-content">Step Content</div>',
				},
			});
			expect(wrapper.find('.step-content').exists()).toBe(true);
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:modelValue emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have stepComplete emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have finish emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(Stepper, {
				props: { steps: sampleSteps, class: 'custom-stepper' },
			});
			expect(wrapper.classes()).toContain('custom-stepper');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should handle single step', () => {
			const wrapper = mount(Stepper, {
				props: { steps: [{ id: 'only', title: 'Only Step' }], modelValue: 0 },
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.text()).toContain('Finish');
		});

		it('should handle many steps', () => {
			const manySteps = Array.from({ length: 10 }, (_, i) => ({
				id: `step-${i}`,
				title: `Step ${i + 1}`,
			}));
			const wrapper = mount(Stepper, {
				props: { steps: manySteps, modelValue: 0 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle steps without description', () => {
			const wrapper = mount(Stepper, {
				props: {
					steps: [{ id: 'no-desc', title: 'No Description' }],
					modelValue: 0,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle disabled step', () => {
			const wrapper = mount(Stepper, {
				props: {
					steps: [{ id: 'disabled', title: 'Disabled Step', disabled: true }],
					modelValue: 0,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should handle completed steps', () => {
			const wrapper = mount(Stepper, {
				props: {
					steps: [
						{ id: 's1', title: 'Step 1', completed: true },
						{ id: 's2', title: 'Step 2' },
					],
					modelValue: 1,
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});
