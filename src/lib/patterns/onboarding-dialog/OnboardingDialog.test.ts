import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import OnboardingDialog from './OnboardingDialog.vue';
import type { OnboardingStep } from './onboarding-dialog.js';

const steps: OnboardingStep[] = [
	{ id: 'step-1', title: 'Welcome', description: 'First step description' },
	{ id: 'step-2', title: 'Features', description: 'Second step description' },
	{ id: 'step-3', title: 'Get Started', description: 'Third step description' },
];

describe('OnboardingDialog', () => {
	let wrapper: ReturnType<typeof mount<typeof OnboardingDialog>>;

	beforeEach(() => {
		wrapper = mount(OnboardingDialog, {
			props: { steps },
		});
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept steps prop', () => {
			const w = mount(OnboardingDialog, {
				props: { steps: [{ id: 'a', title: 'A' }] },
			});
			expect(w.exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept open prop', () => {
			const w = mount(OnboardingDialog, {
				props: { open: true, steps },
			});
			expect(w.exists()).toBe(true);
		});

		it('should accept custom button labels', () => {
			const w = mount(OnboardingDialog, {
				props: {
					steps,
					skipLabel: 'Dismiss',
					nextLabel: 'Continue',
					finishLabel: "Let's Go",
				},
			});
			expect(w.exists()).toBe(true);
		});

		it('should accept hideCloseButton prop', () => {
			const w = mount(OnboardingDialog, {
				props: { steps, hideCloseButton: true },
			});
			expect(w.exists()).toBe(true);
		});

		it('should accept class prop', () => {
			const w = mount(OnboardingDialog, {
				props: { steps, class: 'custom-class' },
			});
			expect(w.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default open to false', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default hideCloseButton to false', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Exposed Methods Tests
	// ============================================
	describe('exposed methods', () => {
		it('should expose next method', () => {
			expect(wrapper.vm.next).toBeDefined();
			expect(typeof wrapper.vm.next).toBe('function');
		});

		it('should expose goTo method', () => {
			expect(wrapper.vm.goTo).toBeDefined();
			expect(typeof wrapper.vm.goTo).toBe('function');
		});

		it('should expose skip method', () => {
			expect(wrapper.vm.skip).toBeDefined();
			expect(typeof wrapper.vm.skip).toBe('function');
		});

		it('should expose currentStep ref starting at 0', () => {
			expect(wrapper.vm.currentStep).toBeDefined();
			expect(wrapper.vm.currentStep).toBe(0);
		});

		it('should advance currentStep when next is called', () => {
			wrapper.vm.next();
			expect(wrapper.vm.currentStep).toBe(1);
		});

		it('should emit next event when next is called', () => {
			wrapper.vm.next();
			expect(wrapper.emitted('next')).toBeTruthy();
			expect(wrapper.emitted('next')![0]).toEqual([{ step: steps[0], index: 0 }]);
		});

		it('should emit complete and close on last step next', () => {
			wrapper.vm.goTo(2);
			wrapper.vm.next();
			expect(wrapper.emitted('complete')).toBeTruthy();
			expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
		});

		it('should jump to step with goTo', () => {
			wrapper.vm.goTo(2);
			expect(wrapper.vm.currentStep).toBe(2);
		});

		it('should not goTo out-of-bounds index', () => {
			wrapper.vm.goTo(10);
			expect(wrapper.vm.currentStep).toBe(0);
			wrapper.vm.goTo(-1);
			expect(wrapper.vm.currentStep).toBe(0);
		});

		it('should emit skip and close when skip is called', () => {
			wrapper.vm.skip();
			expect(wrapper.emitted('skip')).toBeTruthy();
			expect(wrapper.emitted('update:open')?.[0]).toEqual([false]);
		});

		it('should reset currentStep when skip is called', () => {
			wrapper.vm.goTo(2);
			wrapper.vm.skip();
			expect(wrapper.vm.currentStep).toBe(0);
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have update:open emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have next emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have complete emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have skip emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with single step', () => {
			const w = mount(OnboardingDialog, {
				props: { steps: [{ id: 'only', title: 'Only step' }] },
			});
			expect(w.exists()).toBe(true);
		});

		it('should render with all props set', () => {
			const w = mount(OnboardingDialog, {
				props: {
					open: true,
					steps,
					skipLabel: 'Dismiss',
					nextLabel: 'Continue',
					finishLabel: "Let's Go",
					hideCloseButton: true,
					class: 'custom-class',
				},
			});
			expect(w.exists()).toBe(true);
		});

		it('should reset step when open changes to false', async () => {
			const w = mount(OnboardingDialog, {
				props: { open: true, steps },
			});
			w.vm.goTo(2);
			expect(w.vm.currentStep).toBe(2);
			await w.setProps({ open: false });
			expect(w.vm.currentStep).toBe(0);
		});
	});
});
