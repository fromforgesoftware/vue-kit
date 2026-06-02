import { describe, it, expect, vi } from 'vitest';
import { mount } from '@vue/test-utils';
import { defineComponent, h } from 'vue';
import LineChart from './LineChart.vue';
import type { LineChartData } from './line-chart.js';

// Stub vue-chartjs's Line component so the test focuses on the wrapper's
// own behaviour (data shaping, color resolution, accessibility) without
// requiring a real <canvas> in jsdom.
const lineProps = vi.fn();
vi.mock('vue-chartjs', () => ({
	Line: defineComponent({
		name: 'StubLine',
		props: {
			data: { type: Object, default: () => ({}) },
			options: { type: Object, default: () => ({}) },
			plugins: { type: Array, default: () => [] },
		},
		setup(props, { attrs }) {
			lineProps(props, attrs);
			return () =>
				h('canvas', {
					role: 'img',
					'aria-label': attrs['aria-label'],
					'aria-describedby': attrs['aria-describedby'],
				});
		},
	}),
}));

const sample: LineChartData = {
	categories: ['Mon', 'Tue', 'Wed'],
	datasets: [
		{ label: 'Series A', color: '#10b981', data: [90, 92, 94] },
		{ label: 'Reference', color: '#9ca3af', data: [90, 90, 90], dashed: true },
	],
};

describe('LineChart', () => {
	it('exposes the chart wrapper and an inner canvas with role="img"', () => {
		const w = mount(LineChart, { props: { data: sample } });
		const wrap = w.find('[data-slot="line-chart"]');
		expect(wrap.exists()).toBe(true);
		const canvas = wrap.find('canvas');
		expect(canvas.exists()).toBe(true);
		expect(canvas.attributes('role')).toBe('img');
	});

	it('derives an accessible name from dataset labels when ariaLabel is omitted', () => {
		const w = mount(LineChart, { props: { data: sample } });
		const label = w.find('canvas').attributes('aria-label') ?? '';
		expect(label.toLowerCase()).toContain('series a');
		expect(label.toLowerCase()).toContain('reference');
	});

	it('uses the provided ariaLabel verbatim when given', () => {
		const w = mount(LineChart, {
			props: { data: sample, ariaLabel: 'Quarterly trend' },
		});
		expect(w.find('canvas').attributes('aria-label')).toBe('Quarterly trend');
	});

	it('forwards categories and dataset values to Chart.js', () => {
		lineProps.mockClear();
		mount(LineChart, { props: { data: sample } });
		const lastCall = lineProps.mock.calls.at(-1)![0] as {
			data: { labels: string[]; datasets: { data: number[]; label: string }[] };
		};
		expect(lastCall.data.labels).toEqual(['Mon', 'Tue', 'Wed']);
		expect(lastCall.data.datasets).toHaveLength(2);
		expect(lastCall.data.datasets[0].data).toEqual([90, 92, 94]);
		expect(lastCall.data.datasets[0].label).toBe('Series A');
	});

	it('renders dashed lines without points (target / reference style)', () => {
		lineProps.mockClear();
		mount(LineChart, { props: { data: sample } });
		const call = lineProps.mock.calls.at(-1)![0] as {
			data: { datasets: { borderDash?: number[]; pointRadius: number }[] };
		};
		const reference = call.data.datasets[1];
		expect(reference.borderDash).toEqual([6, 6]);
		expect(reference.pointRadius).toBe(0);
	});

	it('renders solid lines with visible points', () => {
		lineProps.mockClear();
		mount(LineChart, { props: { data: sample } });
		const call = lineProps.mock.calls.at(-1)![0] as {
			data: { datasets: { borderDash?: number[]; pointRadius: number }[] };
		};
		const solid = call.data.datasets[0];
		expect(solid.borderDash).toBeUndefined();
		expect(solid.pointRadius).toBeGreaterThan(0);
	});

	it('respects yMin / yMax on the Y scale', () => {
		lineProps.mockClear();
		mount(LineChart, { props: { data: sample, yMin: 0, yMax: 100 } });
		const call = lineProps.mock.calls.at(-1)![0] as {
			options: { scales: { y: { min?: number; max?: number } } };
		};
		expect(call.options.scales.y.min).toBe(0);
		expect(call.options.scales.y.max).toBe(100);
	});

	it('resolves CSS variable colours to computed values for canvas rendering', () => {
		const docEl = document.documentElement;
		docEl.style.setProperty('--color-chart-1', 'rgb(20, 184, 166)');
		lineProps.mockClear();
		mount(LineChart, {
			props: {
				data: {
					categories: ['A', 'B'],
					datasets: [{ label: 'A', color: 'var(--color-chart-1)', data: [1, 2] }],
				},
			},
		});
		const call = lineProps.mock.calls.at(-1)![0] as {
			data: { datasets: { borderColor: string }[] };
		};
		expect(call.data.datasets[0].borderColor).toBe('rgb(20, 184, 166)');
		docEl.style.removeProperty('--color-chart-1');
	});

	it('passes through a non-token colour string as-is', () => {
		lineProps.mockClear();
		mount(LineChart, { props: { data: sample } });
		const call = lineProps.mock.calls.at(-1)![0] as {
			data: { datasets: { borderColor: string }[] };
		};
		expect(call.data.datasets[0].borderColor).toBe('#10b981');
	});

	it('honours the height prop on the wrapper', () => {
		const w = mount(LineChart, { props: { data: sample, height: 320 } });
		const wrap = w.find('[data-slot="line-chart"]');
		expect(wrap.attributes('style')).toContain('height: 320px');
	});
});
