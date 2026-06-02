/**
 * Map keyboard shortcuts to handlers, with cmd/ctrl auto-detection and
 * input-element skipping. Listeners are attached on mount and removed on
 * unmount; if `target` is reactive, the listeners follow the new element.
 *
 * Key syntax:
 * - `cmd+a` — Cmd on Mac, Ctrl elsewhere (auto-detected via `navigator.platform`).
 * - `cmd+shift+z` — modifiers in any order.
 * - `escape`, `delete`, `backspace`, `arrowleft`, etc. — special keys lowercase.
 * - `a`, `?`, `/` — single keys (case-insensitive on the letter side).
 *
 * The composable does NOT call `event.preventDefault()` automatically. Each
 * handler decides whether to consume the event — important because some
 * shortcuts (cmd+c on a text input) shouldn't be hijacked.
 *
 * @example
 * ```ts
 * useKeyboardShortcuts({
 *   'cmd+a': (e) => { e.preventDefault(); selectAll() },
 *   'cmd+z': () => undo(),
 *   'cmd+shift+z': () => redo(),
 *   'escape': () => clearSelection(),
 * })
 * ```
 */
import { onMounted, onBeforeUnmount, watch, unref, isRef, type Ref, type MaybeRef } from 'vue';

export type ShortcutHandler = (event: KeyboardEvent) => void;
export type ShortcutMap = Record<string, ShortcutHandler>;

export interface UseKeyboardShortcutsOptions {
	/** Element to attach listeners to. Default: `document`. */
	target?: Ref<HTMLElement | null> | HTMLElement;
	/**
	 * Skip when event target is an input/textarea/contenteditable element.
	 * Default true — prevents shortcuts firing while the user is typing.
	 */
	skipInInputs?: boolean;
	/** Active flag — when false, no shortcuts fire. Default true. */
	enabled?: MaybeRef<boolean>;
}

const isMac = (): boolean => {
	if (typeof navigator === 'undefined') return false;
	// `platform` is deprecated but still the most reliable cross-browser signal
	// for Mac vs everywhere else. `userAgentData` isn't available in Safari.
	return /Mac|iPhone|iPad|iPod/i.test(navigator.platform || '');
};

interface ParsedShortcut {
	key: string;
	cmd: boolean;
	shift: boolean;
	alt: boolean;
}

function parseShortcut(spec: string): ParsedShortcut {
	const parts = spec
		.toLowerCase()
		.split('+')
		.map((p) => p.trim());
	const result: ParsedShortcut = { key: '', cmd: false, shift: false, alt: false };
	for (const part of parts) {
		if (part === 'cmd' || part === 'ctrl' || part === 'meta') result.cmd = true;
		else if (part === 'shift') result.shift = true;
		else if (part === 'alt' || part === 'option') result.alt = true;
		else result.key = part;
	}
	return result;
}

function eventMatches(event: KeyboardEvent, parsed: ParsedShortcut, mac: boolean): boolean {
	// cmd is Meta on Mac, Ctrl elsewhere. We also require the OTHER mod to be
	// unset — otherwise `cmd+a` on Mac would also match `ctrl+a`, which is a
	// separate browser shortcut consumers may want to bind independently.
	const cmdActive = mac ? event.metaKey : event.ctrlKey;
	const otherCmdActive = mac ? event.ctrlKey : event.metaKey;
	if (parsed.cmd !== cmdActive) return false;
	if (otherCmdActive) return false;
	if (parsed.shift !== event.shiftKey) return false;
	if (parsed.alt !== event.altKey) return false;

	const key = event.key.toLowerCase();
	return key === parsed.key;
}

function isEditableTarget(target: EventTarget | null): boolean {
	if (!(target instanceof HTMLElement)) return false;
	const tag = target.tagName;
	if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return true;
	// `isContentEditable` is the canonical signal in real browsers, but jsdom
	// doesn't always reflect it — fall back to the attribute as well.
	if (target.isContentEditable) return true;
	const ce = target.getAttribute('contenteditable');
	if (ce === '' || ce === 'true' || ce === 'plaintext-only') return true;
	return false;
}

export function useKeyboardShortcuts(
	map: MaybeRef<ShortcutMap>,
	opts: UseKeyboardShortcutsOptions = {},
): void {
	const { target, skipInInputs = true, enabled = true } = opts;
	const mac = isMac();

	const handler = (event: KeyboardEvent): void => {
		if (!unref(enabled)) return;
		if (skipInInputs && isEditableTarget(event.target)) return;

		const shortcuts = unref(map);
		for (const spec in shortcuts) {
			const parsed = parseShortcut(spec);
			if (eventMatches(event, parsed, mac)) {
				shortcuts[spec](event);
				// Don't break — multiple specs could plausibly match (we don't
				// expect this in practice, but it's also not worth enforcing).
			}
		}
	};

	const resolveTarget = (): EventTarget => {
		if (!target) return document;
		const el = isRef(target) ? target.value : target;
		return el ?? document;
	};

	let attached: EventTarget | null = null;

	const attach = (): void => {
		const el = resolveTarget();
		if (attached === el) return;
		if (attached) attached.removeEventListener('keydown', handler as EventListener);
		el.addEventListener('keydown', handler as EventListener);
		attached = el;
	};

	const detach = (): void => {
		if (attached) attached.removeEventListener('keydown', handler as EventListener);
		attached = null;
	};

	onMounted(attach);
	onBeforeUnmount(detach);

	// Reactive target — re-attach when it changes (e.g. element mounted async).
	if (target && isRef(target)) {
		watch(target, attach);
	}
}
