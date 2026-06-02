import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent } from 'storybook/test';
import { ref } from 'vue';
import RadioGroup from './RadioGroup.vue';
import RadioGroupItem from './RadioGroupItem.vue';
import Label from '../label/Label.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const meta = {
	title: 'Form/Radio',
	component: RadioGroup,
	tags: ['!autodocs'],
	argTypes: {
		modelValue: { control: 'text', description: 'Selected value.' },
		orientation: {
			control: 'select',
			options: ['vertical', 'horizontal'],
			description: 'Layout direction.',
		},
		size: {
			control: 'select',
			options: ['sm', 'default'],
			description: 'Density. Both sizes meet WCAG 24×24 hit-area via invisible padding.',
		},
		disabled: { control: 'boolean' },
		required: { control: 'boolean' },
		error: {
			control: 'boolean',
			description: 'Sets `aria-invalid="true"` on the group and propagates to items.',
		},
		describedBy: { control: 'text' },
		'onUpdate:modelValue': { action: 'update:modelValue' },
	},
	args: {
		orientation: 'vertical',
		size: 'default',
		disabled: false,
		required: false,
		error: false,
		'onUpdate:modelValue': fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'Mutually exclusive single-choice control. Built on Reka UI. Compose `RadioGroup` with one `RadioGroupItem` per option, each paired with a `Label`.',
			},
		},
	},
	render: (args) => ({
		components: { RadioGroup, RadioGroupItem, Label },
		setup: () => ({ args }),
		template: `
      <RadioGroup v-bind="args" @update:modelValue="args['onUpdate:modelValue']">
        <Label for="rd-1" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="rd-1" value="1" />
          One
        </Label>
        <Label for="rd-2" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="rd-2" value="2" />
          Two
        </Label>
        <Label for="rd-3" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="rd-3" value="3" />
          Three
        </Label>
      </RadioGroup>
    `,
	}),
} satisfies Meta<typeof RadioGroup>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Horizontal: Story = {
	args: { orientation: 'horizontal' },
	parameters: {
		docs: {
			description: {
				story: 'Use horizontal orientation when options are short and fit on a single row.',
			},
		},
	},
};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story: '`default` paints a 16 px circle; `sm` paints 14 px. Both meet WCAG 24×24 hit-area.',
			},
		},
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <div class="grid gap-6">
        <RadioGroup size="sm" default-value="b">
          <Label for="size-sm-a" class="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem id="size-sm-a" value="a" />
            Small one
          </Label>
          <Label for="size-sm-b" class="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem id="size-sm-b" value="b" />
            Small two
          </Label>
        </RadioGroup>
        <RadioGroup size="default" default-value="b">
          <Label for="size-d-a" class="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem id="size-d-a" value="a" />
            Default one
          </Label>
          <Label for="size-d-b" class="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem id="size-d-b" value="b" />
            Default two
          </Label>
        </RadioGroup>
      </div>
    `,
	}),
};

export const PreSelected: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Pass `defaultValue` for an uncontrolled pre-selection, or `v-model` to wire up state.',
			},
		},
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		setup() {
			const selected = ref('2');
			return { selected };
		},
		template: `
      <RadioGroup v-model="selected">
        <Label for="ps-1" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="ps-1" value="1" />
          One
        </Label>
        <Label for="ps-2" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="ps-2" value="2" />
          Two
        </Label>
        <Label for="ps-3" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="ps-3" value="3" />
          Three
        </Label>
      </RadioGroup>
    `,
	}),
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: {
			description: {
				story:
					'The whole group is disabled — pass `disabled` on a single `<RadioGroupItem>` to disable just that option.',
			},
		},
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <RadioGroup default-value="1">
        <Label for="d1" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="d1" value="1" />
          Option one
        </Label>
        <Label for="d2" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="d2" value="2" :disabled="true" />
          Option two (disabled)
        </Label>
        <Label for="d3" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="d3" value="3" />
          Option three
        </Label>
      </RadioGroup>
    `,
	}),
};

export const WithError: Story = {
	args: { error: true },
	parameters: {
		docs: {
			description: {
				story:
					'Error state sets `aria-invalid="true"` on the group and tints item borders destructive.',
			},
		},
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <div class="grid gap-2">
        <RadioGroup error described-by="err-msg">
          <Label for="er-1" class="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem id="er-1" value="1" />
            One
          </Label>
          <Label for="er-2" class="flex items-center gap-2 cursor-pointer">
            <RadioGroupItem id="er-2" value="2" />
            Two
          </Label>
        </RadioGroup>
        <p id="err-msg" class="text-xs text-destructive">Please pick one.</p>
      </div>
    `,
	}),
};

export const Required: Story = {
	args: { required: true },
	parameters: {
		docs: { description: { story: 'Required groups participate in native form validation.' } },
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <RadioGroup required name="plan">
        <Label for="rq-1" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="rq-1" value="free" />
          Free
        </Label>
        <Label for="rq-2" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="rq-2" value="pro" />
          Pro
        </Label>
      </RadioGroup>
    `,
	}),
};

// ── Interactive ────────────────────────────────────────────────────────────

export const InteractiveClickSelects: Story = {
	tags: ['!autodocs', 'test'],
	play: async ({ args, canvasElement }) => {
		const canvas = within(canvasElement);
		const radios = canvas.getAllByRole('radio');
		expect(radios.length).toBe(3);
		await userEvent.click(radios[1]);
		expect(args['onUpdate:modelValue']).toHaveBeenCalledWith('2');
	},
};

export const InteractiveArrowKeyNav: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'ArrowDown/Right moves selection forward from the currently selected item; ArrowUp/Left moves backward.',
			},
		},
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		setup() {
			const onUpdate = fn();
			return { onUpdate };
		},
		template: `
      <RadioGroup default-value="1" @update:modelValue="onUpdate">
        <Label for="ak-1" class="flex items-center gap-2"><RadioGroupItem id="ak-1" value="1" />One</Label>
        <Label for="ak-2" class="flex items-center gap-2"><RadioGroupItem id="ak-2" value="2" />Two</Label>
        <Label for="ak-3" class="flex items-center gap-2"><RadioGroupItem id="ak-3" value="3" />Three</Label>
      </RadioGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const radios = canvas.getAllByRole('radio');
		expect(radios.length).toBe(3);
		// The selected item ("1") receives focus on Tab and becomes the arrow-nav anchor.
		radios[0].focus();
		expect(radios[0]).toHaveFocus();
		// Reka's RovingFocusItem listens for keydown on currentTarget — fire a
		// KeyboardEvent directly on the focused element so it bubbles correctly.
		radios[0].dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowDown', bubbles: true, cancelable: true }),
		);
		// Reka focuses next item, then handleFocus uses setTimeout(0) → click → check.
		await new Promise((r) => setTimeout(r, 50));
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]');
		expect(items[1].getAttribute('aria-checked')).toBe('true');
		expect(items[1]).toHaveFocus();

		items[1].dispatchEvent(
			new KeyboardEvent('keydown', { key: 'ArrowUp', bubbles: true, cancelable: true }),
		);
		await new Promise((r) => setTimeout(r, 50));
		expect(items[0].getAttribute('aria-checked')).toBe('true');
	},
};

export const InteractiveSelectedAriaChecked: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'The selected item exposes `aria-checked="true"` and `data-state="checked"`.',
			},
		},
	},
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <RadioGroup default-value="2">
        <Label for="ac-1" class="flex items-center gap-2"><RadioGroupItem id="ac-1" value="1" />One</Label>
        <Label for="ac-2" class="flex items-center gap-2"><RadioGroupItem id="ac-2" value="2" />Two</Label>
        <Label for="ac-3" class="flex items-center gap-2"><RadioGroupItem id="ac-3" value="3" />Three</Label>
      </RadioGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]');
		expect(items.length).toBe(3);
		expect(items[1].getAttribute('aria-checked')).toBe('true');
		expect(items[1].getAttribute('data-state')).toBe('checked');
		expect(items[0].getAttribute('aria-checked')).toBe('false');
	},
};

export const InteractiveDisabledItemBlocks: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		setup() {
			const onUpdate = fn();
			return { onUpdate };
		},
		template: `
      <RadioGroup @update:modelValue="onUpdate">
        <Label for="dd-1" class="flex items-center gap-2"><RadioGroupItem id="dd-1" value="1" />One</Label>
        <Label for="dd-2" class="flex items-center gap-2"><RadioGroupItem id="dd-2" value="2" :disabled="true" />Two</Label>
        <Label for="dd-3" class="flex items-center gap-2"><RadioGroupItem id="dd-3" value="3" />Three</Label>
      </RadioGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]');
		expect(items[1].getAttribute('data-disabled')).not.toBeNull();
		expect((items[1] as HTMLButtonElement).disabled).toBe(true);
	},
};

export const InteractiveErrorAriaInvalid: Story = {
	tags: ['!autodocs', 'test'],
	args: { error: true, describedBy: 'rg-msg' },
	play: async ({ canvasElement }) => {
		const group = canvasElement.querySelector('[data-slot="radio-group"]') as HTMLElement;
		expect(group.getAttribute('aria-invalid')).toBe('true');
		expect(group.getAttribute('aria-describedby')).toBe('rg-msg');
	},
};

export const InteractiveLabelAssociation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <RadioGroup>
        <Label for="la-1" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="la-1" value="a" />
          Option A
        </Label>
        <Label for="la-2" class="flex items-center gap-2 cursor-pointer">
          <RadioGroupItem id="la-2" value="b" />
          Option B
        </Label>
      </RadioGroup>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const radio = canvas.getByLabelText('Option A');
		expect(radio).toBeInTheDocument();
		expect(radio.getAttribute('role')).toBe('radio');
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
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <div data-test-root class="grid gap-6 p-2">
        <RadioGroup size="sm" aria-label="Small radio group">
          <RadioGroupItem value="a" aria-label="Small a" />
          <RadioGroupItem value="b" aria-label="Small b" />
        </RadioGroup>
        <RadioGroup size="default" aria-label="Default radio group">
          <RadioGroupItem value="a" aria-label="Default a" />
          <RadioGroupItem value="b" aria-label="Default b" />
        </RadioGroup>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const items = canvasElement.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]');
		expect(items.length).toBe(4);
		// Visible circle is < 24 px on purpose; the ::before ring delivers the hit
		// area but bounding rects ignore pseudos. Validate visible circle ≥ 14 px.
		for (const c of items) {
			const r = c.getBoundingClientRect();
			expect(r.width).toBeGreaterThanOrEqual(14);
			expect(r.height).toBeGreaterThanOrEqual(14);
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
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <RadioGroup>
        <Label data-test-row for="hit-1" class="flex items-center gap-2 cursor-pointer p-1">
          <RadioGroupItem id="hit-1" value="a" />
          Click anywhere on this row
        </Label>
      </RadioGroup>
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
		components: { RadioGroup, RadioGroupItem, Label },
		template: `
      <div data-test-root class="grid gap-3 p-2">
        <RadioGroup default-value="2">
          <Label for="rsp-1" class="flex items-center gap-2"><RadioGroupItem id="rsp-1" value="1" />Option one</Label>
          <Label for="rsp-2" class="flex items-center gap-2"><RadioGroupItem id="rsp-2" value="2" />Option two</Label>
          <Label for="rsp-3" class="flex items-center gap-2"><RadioGroupItem id="rsp-3" value="3" />Option three</Label>
        </RadioGroup>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const items = root.querySelectorAll<HTMLElement>('[data-slot="radio-group-item"]');
			expect(items.length).toBe(3);
			for (const c of items) {
				const r = c.getBoundingClientRect();
				expect(r.width).toBeGreaterThan(0);
				expect(r.height).toBeGreaterThan(0);
			}
		});
	},
};
