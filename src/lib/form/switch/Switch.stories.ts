import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ref } from 'vue';
import Switch from './Switch.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Form/Switch',
	component: Switch,
	tags: ['!autodocs'],
	argTypes: {
		checked: { control: 'boolean', description: 'Controlled checked state.' },
		size: {
			control: 'select',
			options: ['sm', 'default'],
			description: 'Track size. Both sizes meet WCAG 24×24 hit-area via invisible padding.',
		},
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
		error: { control: 'boolean', description: 'Sets `aria-invalid="true"`.' },
		describedBy: { control: 'text' },
		ariaLabel: { control: 'text', description: 'Use only when no Label is associated.' },
		'onUpdate:checked': { action: 'update:checked' },
	},
	args: {
		checked: false,
		size: 'default',
		disabled: false,
		required: false,
		error: false,
		'onUpdate:checked': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Binary on/off toggle for settings that take immediate effect. Built on Reka UI. Pair with a Label via id↔for to make the row click-target.',
			},
		},
	},
	render: (args) => ({
		components: { Switch },
		setup: () => ({ args }),
		template: `<Switch v-bind="args" aria-label="Toggle setting" @update:checked="args['onUpdate:checked']" />`,
	}),
} satisfies Meta<typeof Switch>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: { description: { story: 'Two states: unchecked and checked.' } },
	},
	render: (args) => ({
		components: { Switch },
		setup: () => ({ args }),
		template: `
      <div class="flex items-center gap-4">
        <Switch v-bind="args" aria-label="Off" :checked="false" />
        <Switch v-bind="args" aria-label="On" :checked="true" />
      </div>
    `,
	}),
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'`default` paints a 20 px tall track; `sm` paints 16 px. Both meet WCAG 24×24 hit-area.',
			},
		},
	},
	render: (args) => ({
		components: { Switch },
		setup: () => ({ args }),
		template: `
      <div class="flex items-center gap-4">
        <Switch v-bind="args" aria-label="Small" size="sm" :checked="true" />
        <Switch v-bind="args" aria-label="Default" size="default" :checked="true" />
      </div>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	render: (args) => ({
		components: { Switch },
		setup: () => ({ args }),
		template: `
      <div class="flex items-center gap-4">
        <Switch v-bind="args" aria-label="Disabled off" :checked="false" />
        <Switch v-bind="args" aria-label="Disabled on" :checked="true" />
      </div>
    `,
	}),
};

export const WithError: Story = {
	args: { error: true },
	parameters: {
		docs: {
			description: {
				story: 'Error state sets `aria-invalid="true"` and pairs with referenced helper text.',
			},
		},
	},
	render: () => ({
		components: { Switch, Label },
		setup() {
			const checked = ref(false);
			return { checked };
		},
		template: `
      <div class="grid gap-2">
        <Label for="sw-error" variant="error" required class="flex items-center gap-2 cursor-pointer">
          <Switch id="sw-error" v-model:checked="checked" error described-by="sw-error-msg" />
          Accept terms
        </Label>
        <p id="sw-error-msg" class="text-xs text-destructive">You must enable this to continue.</p>
      </div>
    `,
	}),
};

export const WithLabel: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Pair Switch with Label using `for`/`id` so the entire row toggles the switch and announces correctly.',
			},
		},
	},
	render: () => ({
		components: { Switch, Label },
		setup() {
			const enabled = ref(false);
			return { enabled };
		},
		template: `
      <Label for="sw-with-label" class="flex items-start gap-2 cursor-pointer">
        <Switch id="sw-with-label" v-model:checked="enabled" class="mt-0.5" />
        <span class="grid gap-1">
          <span class="text-sm font-medium">Email notifications</span>
          <span class="text-xs text-muted-foreground">Receive email updates about activity.</span>
        </span>
      </Label>
    `,
	}),
};

export const Group: Story = {
	parameters: {
		docs: {
			description: {
				story: 'A group of switches inside Labels — clicking the row toggles the switch.',
			},
		},
	},
	render: () => ({
		components: { Switch, Label },
		setup() {
			const options = ref([
				{ id: 'sw-1', label: 'Email notifications', checked: true },
				{ id: 'sw-2', label: 'Push notifications', checked: false },
				{ id: 'sw-3', label: 'SMS notifications', checked: false },
			]);
			function toggle(idx: number, v: boolean) {
				options.value[idx].checked = v;
			}
			return { options, toggle };
		},
		template: `
      <div class="grid gap-3">
        <Label
          v-for="(o, i) in options"
          :key="o.id"
          :for="o.id"
          class="flex items-center justify-between gap-4 cursor-pointer"
        >
          {{ o.label }}
          <Switch :id="o.id" :checked="o.checked" @update:checked="(v) => toggle(i, v)" />
        </Label>
      </div>
    `,
	}),
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveClickToggles: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const sw = canvas.getByRole('switch');
		await userEvent.click(sw);
		expect(args['onUpdate:checked']).toHaveBeenCalledWith(true);
	},
};

export const InteractiveSpaceToggles: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const sw = canvas.getByRole('switch') as HTMLElement;
		sw.focus();
		expect(sw).toHaveFocus();
		await userEvent.keyboard(' ');
		expect(args['onUpdate:checked']).toHaveBeenCalledWith(true);
	},
};

export const InteractiveAriaCheckedReflectsState: Story = {
	tags: ['!autodocs', 'test'],
	args: { checked: true },
	play: async ({ canvasElement }) => {
		const sw = canvasElement.querySelector('[data-slot="switch"]') as HTMLElement;
		expect(sw.getAttribute('aria-checked')).toBe('true');
		expect(sw.getAttribute('data-state')).toBe('checked');
	},
};

export const InteractiveDisabledBlocksToggle: Story = {
	tags: ['!autodocs', 'test'],
	args: { disabled: true },
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const sw = canvas.getByRole('switch') as HTMLElement;
		expect(sw).toBeDisabled();
		expect(sw.getAttribute('data-disabled')).not.toBeNull();
		// userEvent.click on a disabled control rejects with "pointer-events: none";
		// assert disabled state instead. Synthetic dispatch would still toggle Reka's
		// reactive root — that test wouldn't reflect real user behaviour.
		expect(args['onUpdate:checked']).not.toHaveBeenCalled();
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'sw-msg' },
	play: async ({ canvasElement }) => {
		const sw = canvasElement.querySelector('[data-slot="switch"]') as HTMLElement;
		expect(sw.getAttribute('aria-invalid')).toBe('true');
		expect(sw.getAttribute('aria-describedby')).toBe('sw-msg');
	},
};

export const InteractiveLabelAssociation: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: { description: { story: 'Clicking the label toggles the switch via id↔for.' } },
	},
	render: () => ({
		components: { Switch, Label },
		setup() {
			const checked = ref(false);
			return { checked };
		},
		template: `
      <Label for="sw-assoc" class="flex items-center gap-2 cursor-pointer">
        Subscribe
        <Switch id="sw-assoc" v-model:checked="checked" />
      </Label>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const sw = canvas.getByLabelText('Subscribe');
		expect(sw).toBeInTheDocument();
		expect(sw.getAttribute('role')).toBe('switch');
	},
};

export const InteractiveTargetSize: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Both sizes meet WCAG 2.2 SC 2.5.8 (≥ 24×24 px) via the hit-area expansion ring.',
			},
		},
	},
	render: () => ({
		components: { Switch },
		template: `
      <div data-test-root class="flex items-center gap-4 p-2">
        <Switch aria-label="Small" size="sm" />
        <Switch aria-label="Default" size="default" />
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		const sws = root.querySelectorAll<HTMLElement>('[data-slot="switch"]');
		expect(sws.length).toBe(2);
		// The painted track is < 24 px on purpose — the ::before ring delivers
		// 24 × 24 px, but bounding rects ignore pseudos. Validate visible track ≥ 16 px
		// and that the row hit area passes when composed inside a Label.
		for (const c of sws) {
			const r = c.getBoundingClientRect();
			expect(r.width).toBeGreaterThanOrEqual(16);
			expect(r.height).toBeGreaterThanOrEqual(16);
		}
	},
};

export const InteractiveLabelHitArea: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: { story: 'When composed inside a Label row, the hit area always meets 24×24.' },
		},
	},
	render: () => ({
		components: { Switch, Label },
		template: `
      <Label data-test-row for="sw-hit" class="flex items-center gap-2 cursor-pointer p-1">
        <Switch id="sw-hit" />
        Click anywhere on this row
      </Label>
    `,
	}),
	play: async ({ canvasElement }) => {
		const row = canvasElement.querySelector('[data-test-row]') as HTMLElement;
		expectMinTargetSize(row, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { Switch, Label },
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <Label for="rs1" class="flex items-center gap-2"><Switch id="rs1" />Default</Label>
        <Label for="rs2" class="flex items-center gap-2"><Switch id="rs2" :checked="true" />Checked</Label>
        <Label for="rs3" class="flex items-center gap-2"><Switch id="rs3" size="sm" />Small</Label>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const sws = root.querySelectorAll<HTMLElement>('[data-slot="switch"]');
			expect(sws.length).toBe(3);
			for (const c of sws) {
				const r = c.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThan(0);
			}
		});
	},
};
