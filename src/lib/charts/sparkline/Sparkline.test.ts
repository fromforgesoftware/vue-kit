import { describe, expect, it } from 'vitest';
import { mount } from '@vue/test-utils';
import Sparkline from './Sparkline.vue';
import { buildSparklinePath } from './sparkline';

describe('buildSparklinePath', () => {
	it('returns empty paths for an empty input', () => {
		const r = buildSparklinePath([], 100, 30);
		expect(r.path).toBe('');
		expect(r.areaPath).toBe('');
	});

	it('emits move + line commands across the points', () => {
		const r = buildSparklinePath([1, 2, 3, 4], 100, 30);
		expect(r.path.startsWith('M')).toBe(true);
		expect(r.path.split(' ').length).toBe(4);
		expect(r.min).toBe(1);
		expect(r.max).toBe(4);
	});

	it('flat input still produces a valid path (range guarded against 0)', () => {
		const r = buildSparklinePath([5, 5, 5], 100, 30);
		expect(r.path).toContain('M');
		expect(r.areaPath).toContain('Z');
	});
});

describe('Sparkline', () => {
	it('renders an SVG with role=img and an accessible label', () => {
		const w = mount(Sparkline, { props: { values: [1, 2, 3, 4, 5] } });
		const svg = w.find('[data-slot="sparkline"]');
		expect(svg.exists()).toBe(true);
		expect(svg.attributes('role')).toBe('img');
		expect(svg.attributes('aria-label')).toContain('Sparkline');
	});

	it('uses the provided ariaLabel verbatim', () => {
		const w = mount(Sparkline, { props: { values: [1, 2, 3], ariaLabel: 'Revenue trend' } });
		expect(w.find('[data-slot="sparkline"]').attributes('aria-label')).toBe('Revenue trend');
	});

	it('skips the last-point dot when showLastPoint is false', () => {
		const w = mount(Sparkline, { props: { values: [1, 2, 3], showLastPoint: false } });
		expect(w.find('circle').exists()).toBe(false);
	});

	it('omits the area fill when filled=false', () => {
		const w = mount(Sparkline, { props: { values: [1, 2, 3], filled: false } });
		const paths = w.findAll('path');
		expect(paths).toHaveLength(1);
	});
});
