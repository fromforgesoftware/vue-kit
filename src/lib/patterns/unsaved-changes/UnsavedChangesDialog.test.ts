import { describe, it, expect, afterEach } from 'vitest';
import { mount, flushPromises } from '@vue/test-utils';
import UnsavedChangesDialog from './UnsavedChangesDialog.vue';

// Reka's AlertDialog teleports its content to document.body. The global
// vitest setup stubs `teleport: true` for other components, so we
// explicitly un-stub it (both Vue's lowercase tag and Reka's Capitalised
// component reference) so the dialog content actually reaches the DOM.
async function mountDialog(
	props: Partial<InstanceType<typeof UnsavedChangesDialog>['$props']> = {},
) {
	const wrapper = mount(UnsavedChangesDialog, {
		props: { open: true, ...props },
		attachTo: document.body,
		global: { stubs: { teleport: false, Teleport: false } },
	});
	await flushPromises();
	return wrapper;
}

afterEach(() => {
	document.body.innerHTML = '';
});

describe('UnsavedChangesDialog', () => {
	describe('rendering', () => {
		it('does not render content when closed', async () => {
			mount(UnsavedChangesDialog, {
				props: { open: false },
				attachTo: document.body,
				global: { stubs: { teleport: false, Teleport: false } },
			});
			await flushPromises();
			expect(document.querySelector('[data-slot="unsaved-changes-confirm"]')).toBeNull();
		});

		it('renders default copy when open', async () => {
			await mountDialog();

			expect(document.body.textContent).toContain('Discard unsaved changes?');
			expect(document.body.textContent).toContain('If you leave now, your changes will be lost.');
			expect(document.body.textContent).toContain('Discard changes');
			expect(document.body.textContent).toContain('Continue');
		});

		it('honours custom copy props', async () => {
			await mountDialog({
				title: 'You have 3 unsaved changes',
				description: 'They will disappear if you leave.',
				confirmText: 'Leave anyway',
				cancelText: 'Stay',
			});

			expect(document.body.textContent).toContain('You have 3 unsaved changes');
			expect(document.body.textContent).toContain('They will disappear if you leave.');
			expect(document.body.textContent).toContain('Leave anyway');
			expect(document.body.textContent).toContain('Stay');
		});
	});

	describe('events', () => {
		it('emits confirm when the confirm button is clicked', async () => {
			const wrapper = await mountDialog();
			const confirmBtn = document.querySelector(
				'[data-slot="unsaved-changes-confirm"]',
			) as HTMLElement | null;

			expect(confirmBtn).not.toBeNull();
			confirmBtn!.click();

			expect(wrapper.emitted('confirm')).toBeTruthy();
			expect(wrapper.emitted('cancel')).toBeUndefined();
		});

		it('emits cancel when the cancel button is clicked', async () => {
			const wrapper = await mountDialog();
			const cancelBtn = document.querySelector(
				'[data-slot="unsaved-changes-cancel"]',
			) as HTMLElement | null;

			expect(cancelBtn).not.toBeNull();
			cancelBtn!.click();

			expect(wrapper.emitted('cancel')).toBeTruthy();
			expect(wrapper.emitted('confirm')).toBeUndefined();
		});
	});
});
