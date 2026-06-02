import { describe, it, expect } from 'vitest';
import { mount } from '@vue/test-utils';
import StatCard from './StatCard.vue';
import StatCardGroup from './StatCardGroup.vue';
import IconStatCard from './IconStatCard.vue';
import ColoredStatCard from './ColoredStatCard.vue';
import ProgressStatCard from './ProgressStatCard.vue';

// ============================================
// StatCard
// ============================================
describe('StatCard', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: '122,380' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as article element', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
			});
			expect(wrapper.element.tagName).toBe('ARTICLE');
		});

		it('should have correct data-slot', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
			});
			expect(wrapper.attributes('data-slot')).toBe('stat-card');
		});

		it('should display label text', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'All Orders', value: 100 },
			});
			expect(wrapper.text()).toContain('All Orders');
		});

		it('should display value', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: '122,380' },
			});
			expect(wrapper.text()).toContain('122,380');
		});

		it('should display unit when provided', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'SLA', value: 94, unit: '%' },
			});
			expect(wrapper.text()).toContain('%');
		});
	});

	describe('slots', () => {
		it('should render trend slot', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
				slots: { trend: '<span class="test-trend">+5%</span>' },
			});
			expect(wrapper.find('.test-trend').exists()).toBe(true);
		});

		it('should render footer slot', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
				slots: { footer: 'Vs last month' },
			});
			expect(wrapper.text()).toContain('Vs last month');
		});

		it('should render action slot', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
				slots: { action: '<button>Menu</button>' },
			});
			expect(wrapper.find('button').text()).toBe('Menu');
		});
	});

	describe('loading state', () => {
		it('should show loading skeleton when loading is true', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100, loading: true },
			});
			expect(wrapper.find('.animate-pulse').exists()).toBe(true);
		});

		it('should not display value when loading', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: '122,380', loading: true },
			});
			expect(wrapper.text()).not.toContain('122,380');
		});

		it('should have screen reader text when loading', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100, loading: true },
			});
			expect(wrapper.find('.sr-only').text()).toContain('Loading Orders');
		});
	});

	describe('accessibility', () => {
		it('should have aria-label matching label prop', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Total Orders', value: 100 },
			});
			expect(wrapper.attributes('aria-label')).toBe('Total Orders');
		});

		it('should have aria-busy when loading', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100, loading: true },
			});
			expect(wrapper.attributes('aria-busy')).toBe('true');
		});

		it('should not have aria-busy when not loading', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
			});
			expect(wrapper.attributes('aria-busy')).toBe('false');
		});
	});

	describe('sizing', () => {
		it('should apply default size', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100 },
			});
			expect(wrapper.classes()).toContain('p-4');
		});

		it('should apply sm size', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100, size: 'sm' },
			});
			expect(wrapper.classes()).toContain('p-3');
		});
	});

	describe('styling', () => {
		it('should support custom classes', () => {
			const wrapper = mount(StatCard, {
				props: { label: 'Orders', value: 100, class: 'w-64' },
			});
			expect(wrapper.classes()).toContain('w-64');
		});
	});
});

// ============================================
// StatCardGroup
// ============================================
describe('StatCardGroup', () => {
	it('should render correctly', () => {
		const wrapper = mount(StatCardGroup);
		expect(wrapper.exists()).toBe(true);
	});

	it('should render as section element', () => {
		const wrapper = mount(StatCardGroup);
		expect(wrapper.element.tagName).toBe('SECTION');
	});

	it('should have role group', () => {
		const wrapper = mount(StatCardGroup);
		expect(wrapper.attributes('role')).toBe('group');
	});

	it('should have data-slot', () => {
		const wrapper = mount(StatCardGroup);
		expect(wrapper.attributes('data-slot')).toBe('stat-card-group');
	});

	it('should render slot content', () => {
		const wrapper = mount(StatCardGroup, {
			slots: { default: '<div class="child">Card</div>' },
		});
		expect(wrapper.find('.child').exists()).toBe(true);
	});

	it('should support custom classes', () => {
		const wrapper = mount(StatCardGroup, {
			props: { class: 'max-w-3xl' },
		});
		expect(wrapper.classes()).toContain('max-w-3xl');
	});
});

// ============================================
// IconStatCard
// ============================================
describe('IconStatCard', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Projects', value: 17 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as article', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Projects', value: 17 },
			});
			expect(wrapper.element.tagName).toBe('ARTICLE');
		});

		it('should display label and value', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Active Projects', value: '3,421' },
			});
			expect(wrapper.text()).toContain('Active Projects');
			expect(wrapper.text()).toContain('3,421');
		});

		it('should display footer text', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Projects', value: 17, footer: 'Jan - Jul 2024' },
			});
			expect(wrapper.text()).toContain('Jan - Jul 2024');
		});
	});

	describe('accessibility', () => {
		it('should have aria-label', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Projects', value: 17 },
			});
			expect(wrapper.attributes('aria-label')).toBe('Projects');
		});

		it('should have aria-busy when loading', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Projects', value: 17, loading: true },
			});
			expect(wrapper.attributes('aria-busy')).toBe('true');
		});

		it('should mark icon as decorative', () => {
			const wrapper = mount(IconStatCard, {
				props: { label: 'Projects', value: 17 },
				slots: { icon: '<span class="icon">Icon</span>' },
			});
			const iconWrapper = wrapper.find('[aria-hidden="true"]');
			expect(iconWrapper.exists()).toBe(true);
		});
	});
});

// ============================================
// ColoredStatCard
// ============================================
describe('ColoredStatCard', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Sales', value: '$892M' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as article', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Sales', value: '$892M' },
			});
			expect(wrapper.element.tagName).toBe('ARTICLE');
		});

		it('should display label at top when no icon', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Sales', value: '$892M' },
			});
			expect(wrapper.text()).toContain('Sales');
		});

		it('should display description when provided', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'NPS', value: '27.3%', description: 'Net Promoter Score' },
			});
			expect(wrapper.text()).toContain('Net Promoter Score');
		});
	});

	describe('color variants', () => {
		it('should apply dark color by default', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Sales', value: '$892M' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply success color', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Sales', value: '$892M', color: 'success' },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should apply info color', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Users', value: '8,200', color: 'info' },
			});
			expect(wrapper.exists()).toBe(true);
		});
	});

	describe('accessibility', () => {
		it('should have aria-label', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Total Sales', value: '$892M' },
			});
			expect(wrapper.attributes('aria-label')).toBe('Total Sales');
		});

		it('should have screen reader text when loading', () => {
			const wrapper = mount(ColoredStatCard, {
				props: { label: 'Sales', value: '', loading: true },
			});
			expect(wrapper.find('.sr-only').text()).toContain('Loading Sales');
		});
	});
});

// ============================================
// ProgressStatCard
// ============================================
describe('ProgressStatCard', () => {
	describe('rendering', () => {
		it('should render correctly', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'API Quota', value: 40 },
			});
			expect(wrapper.exists()).toBe(true);
		});

		it('should render as article', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'API Quota', value: 40 },
			});
			expect(wrapper.element.tagName).toBe('ARTICLE');
		});

		it('should display label', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'API Call Quota', value: 40 },
			});
			expect(wrapper.text()).toContain('API Call Quota');
		});

		it('should display description', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'Quota', value: 40, description: '3000 free calls left' },
			});
			expect(wrapper.text()).toContain('3000 free calls left');
		});

		it('should display secondary text', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'Quota', value: 40, secondaryText: 'of 5000' },
			});
			expect(wrapper.text()).toContain('of 5000');
		});

		it('should display status label', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'Coverage', value: 95, statusLabel: 'Optimal' },
			});
			expect(wrapper.text()).toContain('Optimal');
		});
	});

	describe('progress bar', () => {
		it('should render progress component', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'Quota', value: 40 },
			});
			expect(wrapper.find('[data-slot="progress"]').exists()).toBe(true);
		});
	});

	describe('accessibility', () => {
		it('should have aria-label', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'API Quota', value: 40 },
			});
			expect(wrapper.attributes('aria-label')).toBe('API Quota');
		});

		it('should have aria-busy when loading', () => {
			const wrapper = mount(ProgressStatCard, {
				props: { label: 'Quota', value: 0, loading: true },
			});
			expect(wrapper.attributes('aria-busy')).toBe('true');
		});
	});
});
