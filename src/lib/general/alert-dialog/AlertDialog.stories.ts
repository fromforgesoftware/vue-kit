import type { Meta, StoryObj } from '@storybook/vue3-vite';
import { fn, expect, within, userEvent, waitFor } from 'storybook/test';
import { Trash2, LogOut, AlertTriangle, Home } from '@lucide/vue';
import AlertDialog from './AlertDialog.vue';
import AlertDialogTrigger from './AlertDialogTrigger.vue';
import AlertDialogContent from './AlertDialogContent.vue';
import AlertDialogHeader from './AlertDialogHeader.vue';
import AlertDialogTitle from './AlertDialogTitle.vue';
import AlertDialogDescription from './AlertDialogDescription.vue';
import AlertDialogFooter from './AlertDialogFooter.vue';
import AlertDialogAction from './AlertDialogAction.vue';
import AlertDialogCancel from './AlertDialogCancel.vue';
import Button from '../button/Button.vue';
import {
	expectNoHorizontalOverflow,
	forEachViewport,
	inBody,
} from '../../../test-utils/playHelpers';

const ALL_VARIANTS = ['default', 'destructive'] as const;

const meta = {
	title: 'General/Alert Dialog',
	component: AlertDialog,
	tags: ['!autodocs'],
	parameters: {
		docs: {
			description: {
				component:
					'Modal confirmation that interrupts the user with a binary decision. Built on Reka UI <code>AlertDialogRoot</code> — has <code>role="alertdialog"</code>, ignores Escape and overlay click, and forces a Cancel / Action choice. Use for irreversible actions (delete, log out).',
			},
		},
	},
	argTypes: {
		variant: {
			control: 'select',
			options: ALL_VARIANTS,
			description: 'Tone — destructive flips AlertDialogAction to the destructive button variant.',
		},
		'onUpdate:open': { action: 'update:open' },
	},
	args: {
		variant: 'default',
		'onUpdate:open': fn(),
	},
	render: (args) => ({
		components: {
			AlertDialog,
			AlertDialogTrigger,
			AlertDialogContent,
			AlertDialogHeader,
			AlertDialogTitle,
			AlertDialogDescription,
			AlertDialogFooter,
			AlertDialogAction,
			AlertDialogCancel,
			Button,
		},
		setup: () => ({ args }),
		template: `
      <AlertDialog v-bind="args">
        <AlertDialogTrigger>
          <Button variant="outline">Open dialog</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. Please confirm you want to proceed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    `,
	}),
} satisfies Meta<typeof AlertDialog>;

export default meta;
type Story = StoryObj<typeof meta>;

// ── Demo stories ────────────────────────────────────────────────────────────

export const Default: Story = {};

export const Destructive: Story = {
	args: { variant: 'destructive' },
	parameters: {
		docs: {
			description: {
				story:
					'Destructive variant — AlertDialogAction inherits the destructive button style automatically; no class override needed.',
			},
		},
	},
	render: (args) => ({
		components: {
			AlertDialog,
			AlertDialogTrigger,
			AlertDialogContent,
			AlertDialogHeader,
			AlertDialogTitle,
			AlertDialogDescription,
			AlertDialogFooter,
			AlertDialogAction,
			AlertDialogCancel,
			Button,
			AlertTriangle,
		},
		setup: () => ({ args }),
		template: `
      <AlertDialog v-bind="args">
        <AlertDialogTrigger>
          <Button variant="destructive">Delete Workspace</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <template #icon>
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive">
                <AlertTriangle class="size-5" />
              </div>
            </template>
            <AlertDialogTitle>Delete Workspace</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "My Workspace"? All projects, files, and data will be permanently removed. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Workspace</AlertDialogCancel>
            <AlertDialogAction>Delete Workspace</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    `,
	}),
};

export const WithIcon: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'Use the header <code>icon</code> slot for a leading badge — keep the icon decorative and the title self-describing.',
			},
		},
	},
	render: () => ({
		components: {
			AlertDialog,
			AlertDialogTrigger,
			AlertDialogContent,
			AlertDialogHeader,
			AlertDialogTitle,
			AlertDialogDescription,
			AlertDialogFooter,
			AlertDialogAction,
			AlertDialogCancel,
			Button,
			Trash2,
		},
		template: `
      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="destructive">Delete Account</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <template #icon>
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-destructive/10 text-destructive" aria-hidden="true">
                <Trash2 class="size-5" />
              </div>
            </template>
            <AlertDialogTitle>Delete Account</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete your account? All your data will be permanently removed and cannot be recovered.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep Account</AlertDialogCancel>
            <AlertDialogAction variant="destructive">Delete Account</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    `,
	}),
};

export const Logout: Story = {
	render: () => ({
		components: {
			AlertDialog,
			AlertDialogTrigger,
			AlertDialogContent,
			AlertDialogHeader,
			AlertDialogTitle,
			AlertDialogDescription,
			AlertDialogFooter,
			AlertDialogAction,
			AlertDialogCancel,
			Button,
			LogOut,
		},
		template: `
      <AlertDialog>
        <AlertDialogTrigger>
          <Button variant="outline">Logout</Button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <template #icon>
              <div class="flex size-10 shrink-0 items-center justify-center rounded-full bg-muted" aria-hidden="true">
                <LogOut class="size-5" />
              </div>
            </template>
            <AlertDialogTitle>Log out</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to log out? Any unsaved changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Stay</AlertDialogCancel>
            <AlertDialogAction>Log out</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    `,
	}),
};

export const DestructiveConfirm: Story = {
	parameters: {
		docs: {
			description: {
				story:
					'For high-blast-radius deletions, the <code>destructive-confirm</code> variant adds a type-to-confirm input. The Action button is disabled until the user types <code>confirmValue</code> exactly.',
			},
		},
	},
	render: () => ({
		components: {
			AlertDialog,
			AlertDialogTrigger,
			AlertDialogContent,
			Button,
			Home,
		},
		template: `
      <AlertDialog variant="destructive-confirm">
        <AlertDialogTrigger>
          <Button variant="destructive">Delete Workspace</Button>
        </AlertDialogTrigger>
        <AlertDialogContent
          title="Delete workspace"
          description="Are you sure you want to delete the following workspace?"
          warning="This action <b>cannot be undone</b>. Deleting a workspace will remove all its associated data. Any test, configuration, monitoring insights, and more will be <b>permanently lost</b>."
          confirm-value="Acme"
          confirm-text="Yes, Delete Workspace"
        >
          <div class="flex items-center gap-3 rounded-lg border px-4 py-3">
            <div class="flex flex-1 items-center gap-3">
              <div class="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-semibold">A</div>
              <div>
                <p class="text-sm font-medium">Acme</p>
                <p class="text-xs text-muted-foreground">4 Pipelines, 21 tests, 173 commits</p>
              </div>
            </div>
            <button class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 rounded">
              <Home class="size-4" />
              Go to Home
            </button>
          </div>
        </AlertDialogContent>
      </AlertDialog>
    `,
	}),
};

// ── Interactive (hidden from autodocs, run as tests) ───────────────────────

export const InteractiveOpensOnTrigger: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		const dialog = await inBody().findByRole('alertdialog');
		await expect(dialog).toBeInTheDocument();
	},
};

export const InteractiveEscapeDoesNotClose: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story:
					'AlertDialog ignores Escape — it forces the user to choose Cancel or Action explicitly.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		const dialog = await inBody().findByRole('alertdialog');
		await userEvent.keyboard('{Escape}');
		// After Escape the dialog should still be open.
		await expect(dialog).toBeInTheDocument();
		await expect(inBody().queryByRole('alertdialog')).toBeInTheDocument();
	},
};

export const InteractiveCancelDefaultFocus: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story:
					'On open, focus lands on Cancel — the safer choice for irreversible actions (matches Reka <code>AlertDialogCancel</code> behaviour).',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		await inBody().findByRole('alertdialog');
		const cancel = await inBody().findByRole('button', { name: /cancel/i });
		await expect(document.activeElement).toBe(cancel);
	},
};

export const InteractiveCancelCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		await inBody().findByRole('alertdialog');
		const cancel = await inBody().findByRole('button', { name: /cancel/i });
		await userEvent.click(cancel);
		await waitFor(async () => {
			await expect(inBody().queryByRole('alertdialog')).toBeNull();
		});
	},
};

export const InteractiveActionCloses: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		await inBody().findByRole('alertdialog');
		const action = await inBody().findByRole('button', { name: /confirm/i });
		await userEvent.click(action);
		await waitFor(async () => {
			await expect(inBody().queryByRole('alertdialog')).toBeNull();
		});
	},
};

export const InteractiveTabCycles: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	parameters: {
		docs: {
			description: {
				story: 'Tab cycles between Cancel and Action — focus is trapped inside the alert dialog.',
			},
		},
	},
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		await inBody().findByRole('alertdialog');
		const cancel = await inBody().findByRole('button', { name: /cancel/i });
		const action = await inBody().findByRole('button', { name: /confirm/i });
		await expect(document.activeElement).toBe(cancel);
		await userEvent.tab();
		await expect(document.activeElement).toBe(action);
		await userEvent.tab();
		// Tab from the last button cycles back into the dialog (focus trap)
		const focused = document.activeElement as HTMLElement;
		const dialog = await inBody().findByRole('alertdialog');
		await expect(dialog.contains(focused)).toBe(true);
	},
};

export const InteractiveDataSlots: Story = {
	tags: ['!autodocs', 'test'],
	globals: { viewport: { value: 'desktop' } },
	play: async ({ canvasElement }) => {
		const canvas = within(canvasElement);
		const trigger = canvas.getByRole('button', { name: /open dialog/i });
		await userEvent.click(trigger);
		await inBody().findByRole('alertdialog');
		for (const slot of [
			'alert-dialog-content',
			'alert-dialog-overlay',
			'alert-dialog-title',
			'alert-dialog-description',
			'alert-dialog-action',
			'alert-dialog-cancel',
		]) {
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
					'AlertDialog is centred at every viewport — the trigger remains laid out without overflow.',
			},
		},
	},
	render: () => ({
		components: {
			AlertDialog,
			AlertDialogTrigger,
			AlertDialogContent,
			AlertDialogHeader,
			AlertDialogTitle,
			AlertDialogDescription,
			AlertDialogFooter,
			AlertDialogAction,
			AlertDialogCancel,
			Button,
		},
		template: `
      <div data-test-root class="p-2">
        <AlertDialog default-open>
          <AlertDialogTrigger>
            <Button>Open</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Confirm action</AlertDialogTitle>
              <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction>Confirm</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    `,
	}),
	play: async ({ canvasElement }) => {
		const root = canvasElement.querySelector('[data-test-root]') as HTMLElement;
		await forEachViewport(async () => {
			expectNoHorizontalOverflow(root);
			const dialog = await inBody().findByRole('alertdialog');
			const r = dialog.getBoundingClientRect();
			await expect(r.width).toBeGreaterThan(0);
		});
	},
};
