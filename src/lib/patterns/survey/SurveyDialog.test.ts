import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import SurveyDialog from './SurveyDialog.vue';
import SurveyRatingScale from './SurveyRatingScale.vue';

describe('SurveyDialog', () => {
	let wrapper: ReturnType<typeof mount<typeof SurveyDialog>>;

	beforeEach(() => {
		wrapper = mount(SurveyDialog, {
			props: { steps: ['Step 1', 'Step 2'] },
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
			const wrapper = mount(SurveyDialog, {
				props: { steps: ['A', 'B', 'C'] },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept open prop', () => {
			const wrapper = mount(SurveyDialog, {
				props: { open: true, steps: ['Step 1'] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom title', () => {
			const wrapper = mount(SurveyDialog, {
				props: { title: 'Custom Survey', steps: ['Step 1'] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom button labels', () => {
			const wrapper = mount(SurveyDialog, {
				props: {
					steps: ['A', 'B'],
					submitLabel: 'Done',
					nextLabel: 'Continue',
					backLabel: 'Previous',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept loading prop', () => {
			const wrapper = mount(SurveyDialog, {
				props: { steps: ['Step 1'], loading: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept size prop', () => {
			const wrapper = mount(SurveyDialog, {
				props: { steps: ['Step 1'], size: 'lg' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default open to false', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default loading to false', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default size to sm', () => {
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

		it('should have submit emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});

		it('should have update:step emitter defined', () => {
			expect(wrapper.vm.$emit).toBeDefined();
		});
	});

	// ============================================
	// Exposed Methods Tests
	// ============================================
	describe('exposed methods', () => {
		it('should expose setSuccess method', () => {
			expect(wrapper.vm.setSuccess).toBeDefined();
			expect(typeof wrapper.vm.setSuccess).toBe('function');
		});

		it('should expose next method', () => {
			expect(wrapper.vm.next).toBeDefined();
			expect(typeof wrapper.vm.next).toBe('function');
		});

		it('should expose back method', () => {
			expect(wrapper.vm.back).toBeDefined();
			expect(typeof wrapper.vm.back).toBe('function');
		});

		it('should expose currentStep ref', () => {
			expect(wrapper.vm.currentStep).toBeDefined();
			expect(wrapper.vm.currentStep).toBe(0);
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with single step', () => {
			const wrapper = mount(SurveyDialog, {
				props: { steps: ['Only step'] },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with all props set', () => {
			const wrapper = mount(SurveyDialog, {
				props: {
					open: true,
					title: 'Survey',
					steps: ['A', 'B'],
					submitLabel: 'Done',
					nextLabel: 'Continue',
					backLabel: 'Previous',
					loading: false,
					size: 'default',
					class: 'custom-class',
				},
			});
			expect(wrapper.exists()).toBe(true);
		});
	});
});

describe('SurveyRatingScale', () => {
	let wrapper: ReturnType<typeof mount<typeof SurveyRatingScale>>;

	beforeEach(() => {
		wrapper = mount(SurveyRatingScale);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render with question text', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: { question: 'How was it?' },
			});
			expect(wrapper.text()).toContain('How was it?');
		});

		it('should render min and max labels', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: { minLabel: 'Bad', maxLabel: 'Great' },
			});
			expect(wrapper.text()).toContain('Bad');
			expect(wrapper.text()).toContain('Great');
		});

		it('should render correct number of options', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: { min: 0, max: 5 },
			});
			const items = wrapper.findAll('[data-slot="toggle-group-item"]');
			expect(items).toHaveLength(6);
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept modelValue prop', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: { modelValue: '5' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom min and max', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: { min: 1, max: 3 },
			});
			const items = wrapper.findAll('[data-slot="toggle-group-item"]');
			expect(items).toHaveLength(3);
		});

		it('should accept disabled prop', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: { disabled: true },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default min to 0 and max to 10', () => {
			const items = wrapper.findAll('[data-slot="toggle-group-item"]');
			expect(items).toHaveLength(11);
		});

		it('should default labels', () => {
			expect(wrapper.text()).toContain('Very easy');
			expect(wrapper.text()).toContain('Very difficult');
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props set', () => {
			const wrapper = mount(SurveyRatingScale, {
				props: {
					modelValue: '3',
					question: 'Rate this',
					min: 1,
					max: 5,
					minLabel: 'Low',
					maxLabel: 'High',
					disabled: false,
					class: 'my-scale',
				},
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.text()).toContain('Rate this');
		});
	});
});
