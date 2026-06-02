import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import Dialog from './Dialog.vue';
import DialogTrigger from './DialogTrigger.vue';
import DialogContent from './DialogContent.vue';
import DialogHeader from './DialogHeader.vue';
import DialogTitle from './DialogTitle.vue';
import DialogDescription from './DialogDescription.vue';
import DialogFooter from './DialogFooter.vue';
import DialogBody from './DialogBody.vue';
import DialogClose from './DialogClose.vue';
import Button from '../button/Button.vue';
import Input from '../../form/input/Input.vue';
import Label from '../../form/label/Label.vue';
import Textarea from '../../form/textarea/Textarea.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const ALL_SIZES = ['sm', 'default', 'lg', 'xl', 'full'] as const;

type StoryArgs = InstanceType<typeof Dialog>['$props'] & {
	size?: (typeof ALL_SIZES)[number];
};

const meta = {
	title: 'General/Dialog',
	component: Dialog,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Modal dialog for focused tasks (forms, confirmations) or rich content. Built on Reka UI — content portals to <code>document.body</code>. At &lt; 640 px the dialog renders as a bottom sheet with a drag-to-dismiss handle.',
			},
		},
	},
	argTypes: {
		size: {
			control: 'select',
			options: ALL_SIZES,
			description: 'Width tier for sm: and up. Mobile is always full-width bottom sheet.',
		},
		modal: {
			control: 'boolean',
			description: 'When true, focus is trapped and the rest of the page is inert.',
		},
		'onUpdate:open': { action: 'update:open' },
	} as Meta<StoryArgs>['argTypes'],
	args: {
		size: 'default',
		modal: true,
		'onUpdate:open': fn(),
	} as StoryArgs,
	render: (args) => ({
		components: {
			Dialog,
			DialogTrigger,
			DialogContent,
			DialogHeader,
			DialogTitle,
			DialogDescription,
			DialogBody,
			DialogFooter,
			DialogClose,
			Button,
			Input,
			Label,
		},
		setup: () => ({ args }),
		template: `
      <Dialog v-bind="args">
        <DialogTrigger>
          <Button>Edit Profile</Button>
        </DialogTrigger>
        <DialogContent :size="args.size">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Make changes to your profile here. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <DialogBody class="grid gap-4">
            <div class="grid gap-2">
              <Label for="name">Name</Label>
              <Input id="name" model-value="John Doe" placeholder="Enter your name" />
            </div>
            <div class="grid gap-2">
              <Label for="email">Email</Label>
              <Input id="email" type="email" model-value="john@example.com" placeholder="Enter your email" />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Save Changes</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
	}),
} satisfies Meta<typeof Dialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Sizes: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Five width tiers. Pick the smallest that fits — wide dialogs feel like full-page takeovers.',
			},
		},
	},
	render: () => ({
		components: {
			Dialog,
			DialogTrigger,
			DialogContent,
			DialogHeader,
			DialogTitle,
			DialogDescription,
			DialogBody,
			DialogFooter,
			DialogClose,
			Button,
		},
		setup: () => ({ ALL_SIZES }),
		template: `
      <div class="flex flex-wrap gap-3 p-6">
        <Dialog v-for="s in ALL_SIZES" :key="s">
          <DialogTrigger>
            <Button variant="outline">size: {{ s }}</Button>
          </DialogTrigger>
          <DialogContent :size="s">
            <DialogHeader>
              <DialogTitle>Size: {{ s }}</DialogTitle>
              <DialogDescription>This dialog uses the {{ s }} size variant.</DialogDescription>
            </DialogHeader>
            <DialogBody>
              <p class="text-sm">Body content fills the available width up to the size cap.</p>
            </DialogBody>
            <DialogFooter>
              <DialogClose><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    `,
	}),
};

export const Destructive: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'For irreversible actions, prefer <a href="?path=/docs/general-alert-dialog--docs">AlertDialog</a> — it forces a deliberate choice. Dialog is fine for soft destructive actions where the user can also dismiss.',
			},
		},
	},
	render: () => ({
		components: {
			Dialog,
			DialogTrigger,
			DialogContent,
			DialogHeader,
			DialogTitle,
			DialogDescription,
			DialogFooter,
			DialogClose,
			Button,
		},
		template: `
      <Dialog>
        <DialogTrigger>
          <Button variant="destructive">Delete Account</Button>
        </DialogTrigger>
        <DialogContent size="sm">
          <DialogHeader>
            <DialogTitle>Delete Account</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete your account? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button variant="destructive">Delete</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
	}),
};

export const WithTextarea: Story = {
	render: () => ({
		components: {
			Dialog,
			DialogTrigger,
			DialogContent,
			DialogHeader,
			DialogTitle,
			DialogDescription,
			DialogBody,
			DialogFooter,
			DialogClose,
			Button,
			Input,
			Label,
			Textarea,
		},
		template: `
      <Dialog>
        <DialogTrigger>
          <Button variant="outline">Send Feedback</Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Feedback</DialogTitle>
            <DialogDescription>
              Help us improve by sharing your thoughts. We read every message.
            </DialogDescription>
          </DialogHeader>
          <DialogBody class="grid gap-4">
            <div class="grid gap-2">
              <Label for="subject">Subject</Label>
              <Input id="subject" placeholder="What's this about?" />
            </div>
            <div class="grid gap-2">
              <Label for="message">Message</Label>
              <Textarea id="message" placeholder="Tell us what you think..." class="min-h-24" />
            </div>
          </DialogBody>
          <DialogFooter>
            <DialogClose>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button>Send</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpensOnTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /edit profile/i });
		await userEvent.click(trigger);
		const dialog = await inBody().findByRole('dialog');
		await expect(dialog).toBeInTheDocument();
		await expect(dialog.getAttribute('data-slot')).toBe('dialog-content');
	},
};

export const InteractiveEscapeCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /edit profile/i });
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(inBody().queryByRole('dialog')).toBeNull();
		});
	},
};

export const InteractiveClickOutsideCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /edit profile/i });
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		// Click on the overlay
		const overlay = document.body.querySelector(
			'[data-slot="dialog-overlay"]',
		) as HTMLElement | null;
		await expect(overlay).not.toBeNull();
		await userEvent.click(overlay!);
		await waitFor(async () => {
			await expect(inBody().queryByRole('dialog')).toBeNull();
		});
	},
};

export const InteractiveCloseButton: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /edit profile/i });
		await userEvent.click(trigger);
		const dialog = await inBody().findByRole('dialog');
		const closeBtn = dialog.querySelector(
			'[data-slot="dialog-content"] > button:last-child, button[aria-label="Close"]',
		) as HTMLElement | null;
		// Reka renders the close button as the last button inside content
		const closeBtnByText = within(dialog).getByText('Close').closest('button');
		await expect(closeBtnByText ?? closeBtn).not.toBeNull();
		await userEvent.click((closeBtnByText ?? closeBtn) as HTMLElement);
		await waitFor(async () => {
			await expect(inBody().queryByRole('dialog')).toBeNull();
		});
	},
};

export const InteractiveFocusReturnsToTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /edit profile/i });
		trigger.focus();
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		await userEvent.keyboard('{Escape}');
		await waitFor(async () => {
			await expect(inBody().queryByRole('dialog')).toBeNull();
		});
		// Reka returns focus to the trigger on close
		await waitFor(async () => {
			await expect(document.activeElement).toBe(trigger);
		});
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /edit profile/i });
		await userEvent.click(trigger);
		await inBody().findByRole('dialog');
		const slots = [
			'dialog-content',
			'dialog-overlay',
			'dialog-header',
			'dialog-title',
			'dialog-description',
			'dialog-footer',
		];
		for (const slot of slots) {
			await expect(document.body.querySelector(`[data-slot="${slot}"]`)).not.toBeNull();
		}
	},
};

export const InteractiveResponsive: Story = {
	tags: ['!autodocs', 'test'],
	parameters: {
		docs: {
			description: {
				story:
					'At &lt; 640 px the dialog renders as a bottom sheet with a drag handle. At ≥ 640 px it is a centred modal.',
			},
		},
	},
	render: () => ({
		components: {
			Dialog,
			DialogTrigger,
			DialogContent,
			DialogHeader,
			DialogTitle,
			DialogDescription,
			DialogBody,
			DialogFooter,
			DialogClose,
			Button,
		},
		template: `
      <div data-test-root class="p-2">
        <Dialog default-open>
          <DialogTrigger>
            <Button>Open dialog</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Responsive dialog</DialogTitle>
              <DialogDescription>Centred above 640 px, bottom sheet below.</DialogDescription>
            </DialogHeader>
            <DialogBody><p class="text-sm">Body content reflows to width.</p></DialogBody>
            <DialogFooter>
              <DialogClose><Button variant="outline">Close</Button></DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const content = await inBody().findByRole('dialog');
			const r = content.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
			await expect(r.height).toBeGreaterThan(0);
		});
	},
};
