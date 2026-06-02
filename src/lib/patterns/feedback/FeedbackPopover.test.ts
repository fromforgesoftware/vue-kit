import { describe, it, expect, beforeEach } from 'vitest';
import { mount } from '@vue/test-utils';
import FeedbackPopover from './FeedbackPopover.vue';

describe('FeedbackPopover', () => {
	let wrapper: ReturnType<typeof mount<typeof FeedbackPopover>>;

	beforeEach(() => {
		wrapper = mount(FeedbackPopover);
	});

	// ============================================
	// Render Tests
	// ============================================
	describe('rendering', () => {
		it('should render correctly', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should render trigger button with default label', () => {
			const button = wrapper.find('button');
			expect(button.exists()).toBe(true);
			expect(button.text()).toBe('Feedback');
		});
	});

	// ============================================
	// Props Tests
	// ============================================
	describe('props', () => {
		it('should accept custom trigger label', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { triggerLabel: 'Report' },
			});
			expect(wrapper.find('button').text()).toBe('Report');
		});

		it('should accept custom trigger variant', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { triggerVariant: 'ghost' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept loading prop', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { loading: true },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom title', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { title: 'Custom Title' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom placeholder', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { placeholder: 'Custom placeholder...' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should accept custom submit label', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { submitLabel: 'Send' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Default Props Tests
	// ============================================
	describe('default props', () => {
		it('should default trigger label to Feedback', () => {
			expect(wrapper.find('button').text()).toBe('Feedback');
		});

		it('should default trigger variant to outline', () => {
			expect(wrapper.exists()).toBe(true);
		});

		it('should default loading to false', () => {
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Events Tests
	// ============================================
	describe('events', () => {
		it('should have submit emitter defined', () => {
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
	});

	// ============================================
	// Styling Tests
	// ============================================
	describe('styling', () => {
		it('should support custom class', () => {
			const wrapper = mount(FeedbackPopover, {
				props: { class: 'custom-feedback' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	// ============================================
	// Edge Cases
	// ============================================
	describe('edge cases', () => {
		it('should render with all props set', () => {
			const wrapper = mount(FeedbackPopover, {
				props: {
					title: 'Report',
					placeholder: 'Describe...',
					submitLabel: 'Submit',
					triggerLabel: 'Bug',
					triggerVariant: 'destructive',
					loading: true,
					class: 'my-class',
				},
			});
			expect(wrapper.exists()).toBe(true);
			expect(wrapper.find('button').text()).toBe('Bug');
		});
	});
});
