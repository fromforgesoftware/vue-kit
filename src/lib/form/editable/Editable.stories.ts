import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, userEvent } from 'storybook/test';
import { ref } from 'vue';
import { Pencil, Check, X } from '@lucide/vue';
import Editable from './Editable.vue';
import EditableArea from './EditableArea.vue';
import EditablePreview from './EditablePreview.vue';
import EditableInput from './EditableInput.vue';
import EditableEditTrigger from './EditableEditTrigger.vue';
import EditableSubmitTrigger from './EditableSubmitTrigger.vue';
import EditableCancelTrigger from './EditableCancelTrigger.vue';
import Icon from '../../general/icon/Icon.vue';
import {
	expectMinTargetSize,
	expectNoHorizontalOverflow,
	forEachViewport,
} from '../../../test-utils/playHelpers';

const components = {
	Editable,
	EditableArea,
	EditablePreview,
	EditableInput,
	EditableEditTrigger,
	EditableSubmitTrigger,
	EditableCancelTrigger,
	Icon,
};

const meta = {
	title: 'Form/Editable',
	component: Editable,
	// Disable autodocs because this component has a curated `About.mdx`.
	tags: ['!autodocs'],
	argTypes: {
		submitMode: {
			control: 'select',
			options: ['none', 'blur', 'enter', 'both'],
			description:
				'When the value commits. `blur` saves on focus loss; `enter` saves on Enter; `both` does both; `none` requires the explicit Save trigger.',
		},
		activationMode: {
			control: 'select',
			options: ['focus', 'dblclick', 'none'],
			description:
				'How edit mode starts. `focus` (default) — click or focus the preview; `dblclick` — double-click; `none` — only via the Edit trigger.',
		},
		size: {
			control: 'select',
			options: ['sm', 'default', 'lg'],
			description: 'Density. Tracks the Input ramp — applies to preview, input, and triggers.',
		},
		disabled: { control: 'boolean', description: 'Disable activation entirely.' },
		readonly: {
			control: 'boolean',
			description: 'Show preview only — edit mode cannot be entered.',
		},
		placeholder: {
			control: 'text',
			description: 'Shown in preview and input when value is empty.',
		},
		selectOnFocus: {
			control: 'boolean',
			description: 'Select the input value when entering edit mode.',
		},
		'onUpdate:modelValue': { action: 'update:modelValue' },
		onSubmit: { action: 'submit' },
	},
	args: {
		submitMode: 'blur',
		activationMode: 'focus',
		size: 'default',
		disabled: false,
		readonly: false,
		selectOnFocus: false,
		'onUpdate:modelValue': fn(),
		onSubmit: fn(),
	},
	parameters: {
		docs: {
			description: {
				component:
					'An inline-editable text field. Click or focus the preview to enter edit mode; press Enter to save and Escape to cancel. Built on Reka `Editable`.',
			},
		},
	},
	render: (args) => ({
		components,
		setup() {
			const text = ref('Click to edit');
			return { args, text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text" v-bind="args">
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </Editable>
      </div>
    `,
	}),
} satisfies Meta<typeof Editable>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Three densities. Heights match the Input ramp so the preview ↔ input swap is visually stable.',
			},
		},
	},
	render: () => ({
		components,
		setup() {
			const a = ref('Small');
			const b = ref('Default');
			const c = ref('Large');
			return { a, b, c };
		},
		template: `
      <div class="w-72 space-y-3">
        <Editable v-model="a" size="sm">
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
        <Editable v-model="b" size="default">
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
        <Editable v-model="c" size="lg">
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
      </div>
    `,
	}),
};

export const SubmitOnEnter: Story = {
	args: { submitMode: 'enter' },
	parameters: {
		docs: {
			description: {
				story: '`submitMode="enter"` commits the value only on Enter; click-away cancels.',
			},
		},
	},
};

export const DoubleClickActivation: Story = {
	args: { activationMode: 'dblclick' },
	parameters: {
		docs: {
			description: {
				story:
					'Use `activationMode="dblclick"` when the preview is wrapped in a list item that also handles a single click.',
			},
		},
	},
};

export const Disabled: Story = {
	args: { disabled: true },
	parameters: {
		docs: { description: { story: 'Disabled editables cannot be activated and lower opacity.' } },
	},
	render: () => ({
		components,
		setup() {
			const text = ref('Cannot edit');
			return { text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text" disabled>
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
      </div>
    `,
	}),
};

export const Readonly: Story = {
	args: { readonly: true },
	parameters: {
		docs: {
			description: { story: 'Read-only editables show the preview but never enter edit mode.' },
		},
	},
	render: () => ({
		components,
		setup() {
			const text = ref('Read-only value');
			return { text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text" readonly>
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
      </div>
    `,
	}),
};

export const WithEmptyPlaceholder: Story = {
	args: { placeholder: 'Click to add a name' },
	parameters: {
		docs: {
			description: {
				story:
					'Empty values show the placeholder in muted text. The preview keeps its 24×24 hit area.',
			},
		},
	},
	render: () => ({
		components,
		setup() {
			const text = ref('');
			return { text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text" placeholder="Click to add a name">
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
      </div>
    `,
	}),
};

export const WithExplicitTriggers: Story = {
	args: { activationMode: 'none', submitMode: 'none' },
	parameters: {
		docs: {
			description: {
				story:
					'Use `EditableEditTrigger`, `EditableSubmitTrigger`, and `EditableCancelTrigger` for explicit Edit / Save / Cancel buttons. All triggers meet ≥ 24×24 hit area.',
			},
		},
	},
	render: () => ({
		components,
		setup() {
			const text = ref('Press Edit to start');
			return { text, Pencil, Check, X };
		},
		template: `
      <div class="w-full max-w-96">
        <Editable v-model="text" activation-mode="none" submit-mode="none">
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
          <div class="mt-2 flex gap-2">
            <EditableEditTrigger><Icon :icon="Pencil" /> Edit</EditableEditTrigger>
            <EditableSubmitTrigger><Icon :icon="Check" /> Save</EditableSubmitTrigger>
            <EditableCancelTrigger><Icon :icon="X" /> Cancel</EditableCancelTrigger>
          </div>
        </Editable>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveActivation: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup() {
			const text = ref('Hello');
			return { text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text">
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </Editable>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const preview = canvasElement.querySelector('[data-slot="editable-preview"]') as HTMLElement;
		expect(preview).toBeVisible();
		const input = canvasElement.querySelector('[data-slot="editable-input"]') as HTMLInputElement;
		// Reka renders both, hides input until edit mode.
		expect(input).toBeInTheDocument();
		await userEvent.click(preview);
		// After click, the input takes focus.
		expect(input).toHaveFocus();
	},
};

export const InteractiveEnterSaves: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup() {
			const text = ref('start');
			return { text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text" submit-mode="enter">
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </Editable>
        <p data-test-value class="mt-2 text-xs">{{ text }}</p>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const preview = canvasElement.querySelector('[data-slot="editable-preview"]') as HTMLElement;
		await userEvent.click(preview);
		const input = canvasElement.querySelector('[data-slot="editable-input"]') as HTMLInputElement;
		expect(input).toHaveFocus();
		await userEvent.clear(input);
		await userEvent.type(input, 'updated');
		await userEvent.keyboard('{Enter}');
		const valueEl = canvasElement.querySelector('[data-test-value]') as HTMLElement;
		expect(valueEl.textContent?.trim()).toBe('updated');
	},
};

export const InteractiveEscapeCancels: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup() {
			const text = ref('original');
			return { text };
		},
		template: `
      <div class="w-72">
        <Editable v-model="text" submit-mode="enter">
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
        </Editable>
        <p data-test-value class="mt-2 text-xs">{{ text }}</p>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const preview = canvasElement.querySelector('[data-slot="editable-preview"]') as HTMLElement;
		await userEvent.click(preview);
		const input = canvasElement.querySelector('[data-slot="editable-input"]') as HTMLInputElement;
		await userEvent.clear(input);
		await userEvent.type(input, 'discard me');
		await userEvent.keyboard('{Escape}');
		const valueEl = canvasElement.querySelector('[data-test-value]') as HTMLElement;
		// Value must remain the original after Escape.
		expect(valueEl.textContent?.trim()).toBe('original');
	},
};

export const InteractiveTriggersHitArea: Story = {
	tags: ['!autodocs', 'test'],
	render: () => ({
		components,
		setup() {
			const text = ref('value');
			return { text, Pencil, Check, X };
		},
		template: `
      <div data-test-root class="w-full max-w-96 p-2">
        <Editable v-model="text" activation-mode="none" submit-mode="none">
          <EditableArea>
            <EditablePreview />
            <EditableInput />
          </EditableArea>
          <div class="mt-2 flex gap-2">
            <EditableEditTrigger aria-label="Edit"><Icon :icon="Pencil" /></EditableEditTrigger>
            <EditableSubmitTrigger aria-label="Save"><Icon :icon="Check" /></EditableSubmitTrigger>
            <EditableCancelTrigger aria-label="Cancel"><Icon :icon="X" /></EditableCancelTrigger>
          </div>
        </Editable>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		// Edit trigger is visible while in preview mode and must meet ≥ 24×24.
		const editTrigger = canvasElement.querySelector(
			'[data-slot="editable-edit-trigger"]',
		) as HTMLElement;
		expect(editTrigger).toBeInTheDocument();
		expectMinTargetSize(editTrigger, 24);
		// Click Edit, then verify submit / cancel triggers also meet target size.
		await userEvent.click(editTrigger);
		const submit = canvasElement.querySelector(
			'[data-slot="editable-submit-trigger"]',
		) as HTMLElement;
		const cancel = canvasElement.querySelector(
			'[data-slot="editable-cancel-trigger"]',
		) as HTMLElement;
		expect(submit).toBeInTheDocument();
		expect(cancel).toBeInTheDocument();
		expectMinTargetSize(submit, 24);
		expectMinTargetSize(cancel, 24);
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story: 'Renders correctly across all five viewports without horizontal overflow.',
			},
		},
	},
	render: () => ({
		components,
		setup() {
			const a = ref('Small editable');
			const b = ref('Default editable');
			return { a, b };
		},
		template: `
      <div data-test-root class="w-full max-w-md space-y-3 p-2">
        <Editable v-model="a" size="sm">
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
        <Editable v-model="b">
          <EditableArea><EditablePreview /><EditableInput /></EditableArea>
        </Editable>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const previews = root.querySelectorAll<HTMLElement>('[data-slot="editable-preview"]');
			expect(previews.length).toBe(2);
			for (const p of previews) expectMinTargetSize(p, 24);
		});
	},
};
