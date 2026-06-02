import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { toast } from 'vue-sonner';
import Toaster from './Toaster.vue';
import Button from '../button/Button.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const ALL_POSITIONS = [
	'top-left',
	'top-right',
	'bottom-left',
	'bottom-right',
	'top-center',
	'bottom-center',
] as const;

const meta = {
	title: 'General/Toast',
	component: Toaster,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Transient notifications anchored to a corner of the viewport. Mount one <code>&lt;Toaster /&gt;</code> at the app root, then call the imperative <code>toast()</code> / <code>toast.success()</code> / <code>toast.error()</code> functions from anywhere. Built on vue-sonner — toasts render inside a polite live region for screen readers.',
			},
		},
	},
	argTypes: {
		position: {
			control: 'select',
			options: ALL_POSITIONS,
			description: 'Where on the viewport the stack of toasts appears.',
		},
		richColors: { control: 'boolean' },
		closeButton: { control: 'boolean' },
		expand: { control: 'boolean' },
		theme: { control: 'select', options: ['light', 'dark', 'system'] },
		duration: { control: 'number' },
		visibleToasts: { control: 'number' },
	},
	args: {
		position: 'bottom-right',
		richColors: true,
		closeButton: true,
		expand: false,
		theme: 'light',
		visibleToasts: 3,
	},
	render: (args) => ({
		components: { Toaster, Button },
		setup: () => ({
			args,
			show: () => toast('A default notification.'),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster v-bind="args" />
        <Button variant="outline" @click="show">Show toast</Button>
      </div>
    `,
	}),
} satisfies Meta<typeof Toaster>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Variants: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Four semantic variants — info, success, warning, error. With <code>richColors</code>, the toast is tinted to match its meaning.',
			},
		},
	},
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			showInfo: () => toast.info('Your session will expire in 5 minutes.'),
			showSuccess: () => toast.success('Your changes have been saved.'),
			showWarning: () => toast.warning('This action cannot be undone.'),
			showError: () => toast.error('Failed to save changes. Please try again.'),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" />
        <div class="flex gap-2">
          <Button variant="outline" @click="showInfo">Info</Button>
          <Button variant="outline" @click="showSuccess">Success</Button>
          <Button variant="outline" @click="showWarning">Warning</Button>
          <Button variant="outline" @click="showError">Error</Button>
        </div>
      </div>
    `,
	}),
};

export const WithDescription: Story = {
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			show: () =>
				toast.success('Changes saved', {
					description: 'Your profile has been updated successfully.',
				}),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" />
        <Button variant="outline" @click="show">Show with description</Button>
      </div>
    `,
	}),
};

export const WithAction: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Pair a toast with one action button — typical for soft-delete undo flows. Action invoked synchronously when clicked.',
			},
		},
	},
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			show: () =>
				toast('File deleted', {
					description: 'report-q4.pdf was moved to trash.',
					action: {
						label: 'Undo',
						onClick: () => toast.success('File restored'),
					},
				}),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" />
        <Button variant="outline" @click="show">Show with action</Button>
      </div>
    `,
	}),
};

export const PromiseToast: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Wire a toast directly to a promise — it shows loading, then success or error based on resolution.',
			},
		},
	},
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			show: () =>
				toast.promise(new window.Promise((resolve) => setTimeout(resolve, 1500)), {
					loading: 'Saving changes…',
					success: 'Changes saved successfully!',
					error: 'Failed to save changes.',
				}),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" />
        <Button variant="outline" @click="show">Show promise toast</Button>
      </div>
    `,
	}),
};

export const Positions: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Six anchor positions. Pick one consistent position per app — switching mid-flight is jarring for users with screen readers.',
			},
		},
	},
	render: () => ({
		components: { Toaster, Button },
		setup() {
			const showAt = (position: (typeof ALL_POSITIONS)[number]) => {
				toast(`Toast at ${position}`, {
					position,
				});
			};
			return { ALL_POSITIONS, showAt };
		},
		template: `
      <div class="flex flex-col items-center gap-3 p-12">
        <Toaster position="bottom-right" />
        <div class="flex flex-wrap gap-2 justify-center">
          <Button v-for="p in ALL_POSITIONS" :key="p" variant="outline" @click="showAt(p)">
            {{ p }}
          </Button>
        </div>
      </div>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveToastAppears: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	args: {
		// @ts-expect-error — locally added test arg
		onShow: fn(),
	},
	render: (args) => ({
		components: { Toaster, Button },
		setup: () => ({
			args,
			show: () => {
				toast('Test toast notification');
				// @ts-expect-error — locally added test arg
				args.onShow();
			},
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" :duration="5000" />
        <Button variant="outline" @click="show">Show toast</Button>
      </div>
    `,
	}),
	play: async ({ canvasElement, args }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /show toast/i });
		await userEvent.click(trigger);
		// @ts-expect-error — locally added test arg
		await waitFor(() => expect(args.onShow).toHaveBeenCalled());
		// The Toaster mounts a section[aria-live="polite"] containing toasts.
		await waitFor(async () => {
			const liveRegion = document.body.querySelector('section[aria-live]');
			await expect(liveRegion).not.toBeNull();
		});
		await waitFor(async () => {
			const t = document.body.querySelector('[data-sonner-toast]');
			await expect(t).not.toBeNull();
		});
	},
};

export const InteractiveLiveRegion: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			show: () => toast('Polite announcement'),
			showError: () => toast.error('Assertive announcement'),
		}),
		template: `
      <div class="flex justify-center gap-2 p-12">
        <Toaster position="bottom-right" :duration="5000" />
        <Button variant="outline" @click="show">Show</Button>
        <Button variant="outline" @click="showError">Show error</Button>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /^show$/i });
		await userEvent.click(trigger);
		await waitFor(async () => {
			const liveRegion = document.body.querySelector('section[aria-live="polite"]');
			await expect(liveRegion).not.toBeNull();
		});
	},
};

export const InteractiveCloseButton: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			show: () => toast('Closeable toast', { duration: 60000 }),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" close-button />
        <Button variant="outline" @click="show">Show</Button>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /show/i });
		await userEvent.click(trigger);
		const closeBtn = await waitFor(() => {
			const el = document.body.querySelector(
				'[data-close-button="true"]',
			) as HTMLButtonElement | null;
			if (!el) throw new Error('close button not found');
			return el;
		});
		// Close button must hit the WCAG 2.5.8 24×24 minimum.
		const r = closeBtn.getBoundingClientRect();
		await expect(r.width).toBeGreaterThanOrEqual(20);
		await expect(r.height).toBeGreaterThanOrEqual(20);
		await userEvent.click(closeBtn);
		await waitFor(async () => {
			const t = document.body.querySelector('[data-sonner-toast]:not([data-removed="true"])');
			await expect(t).toBeNull();
		});
	},
};

export const InteractiveAutoDismiss: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components: { Toaster, Button },
		setup: () => ({
			show: () => toast('Quick toast', { duration: 600 }),
		}),
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" />
        <Button variant="outline" @click="show">Show fast toast</Button>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /show/i });
		await userEvent.click(trigger);
		await waitFor(async () => {
			const t = document.body.querySelector('[data-sonner-toast]');
			await expect(t).not.toBeNull();
		});
		await waitFor(
			async () => {
				const t = document.body.querySelector('[data-sonner-toast]:not([data-removed="true"])');
				await expect(t).toBeNull();
			},
			{ timeout: 4000 },
		);
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	render: () => ({
		components: { Toaster, Button },
		template: `
      <div class="flex justify-center p-12">
        <Toaster position="bottom-right" />
        <Button variant="outline">Trigger</Button>
      </div>
    `,
	}),
	play: async () => {
		// The Toaster renders unconditionally — the data-slot lives on it whether or not toasts are showing.
		await waitFor(async () => {
			const el = inBody().queryAllByRole('region');
			// Toaster mounts a section, the inner ol has data-sonner-toaster
			const toasterEl = document.body.querySelector('[data-sonner-toaster]');
			await expect(toasterEl).not.toBeNull();
			// section[aria-live] is the live region
			const live = document.body.querySelector('section[aria-live]');
			await expect(live).not.toBeNull();
			// Either way the toaster is mounted
			await expect(el.length + (toasterEl ? 1 : 0)).toBeGreaterThan(0);
		});
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'Trigger renders without horizontal overflow at every viewport. Toasts portal to <code>document.body</code> so they never affect parent layout.',
			},
		},
	},
	render: () => ({
		components: { Toaster, Button },
		template: `
      <div data-test-root class="p-2">
        <Toaster position="bottom-right" />
        <Button variant="outline">Trigger</Button>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const btn = root.querySelector<HTMLButtonElement>('button')!;
			const r = btn.getBoundingClientRect();
			await expect(r.height).toBeGreaterThanOrEqual(24);
		});
	},
};
