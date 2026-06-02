import { within } from 'storybook/test';

// `@vitest/browser/context` throws on import outside Vitest's browser-mode
// runtime — so it's loaded lazily inside `atViewport` rather than at module
// scope. This keeps Storybook dev mode (no test runner) from crashing when a
// story file pulls these helpers in.

// ─── Pointer drag ────────────────────────────────────────────────────────────
// userEvent.pointer doesn't reliably fire pointermove on document/window
// listeners in browser-mode, which is exactly the pattern reka-ui sliders and
// our useSegmentDrag/useResizable composables rely on. dispatchEvent of real
// PointerEvents does work because we run in real Chromium.
//
// `pointermove`/`pointerup` are dispatched on `document` (not `window`) so
// they reach both `document.addEventListener('pointermove', ...)` AND
// `window.addEventListener('pointermove', ...)` — events on `document`
// bubble up to `window`, but events on `window` do NOT propagate down to
// `document`. TimeRangeBar's `onBarResizePointerDown` and useSegmentDrag both
// register on `document`, so dispatching on `window` (the previous
// behaviour) silently failed for those consumers.
export async function pointerDragBy(el: Element, dx: number, dy = 0, steps = 5) {
	const rect = el.getBoundingClientRect();
	const startX = rect.left + rect.width / 2;
	const startY = rect.top + rect.height / 2;

	el.dispatchEvent(
		new PointerEvent('pointerdown', {
			bubbles: true,
			cancelable: true,
			clientX: startX,
			clientY: startY,
			pointerId: 1,
			pointerType: 'mouse',
			button: 0,
			buttons: 1,
		}),
	);

	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		document.dispatchEvent(
			new PointerEvent('pointermove', {
				bubbles: true,
				cancelable: true,
				clientX: startX + dx * t,
				clientY: startY + dy * t,
				pointerId: 1,
				pointerType: 'mouse',
				buttons: 1,
			}),
		);
	}

	document.dispatchEvent(
		new PointerEvent('pointerup', {
			bubbles: true,
			cancelable: true,
			clientX: startX + dx,
			clientY: startY + dy,
			pointerId: 1,
			pointerType: 'mouse',
			button: 0,
			buttons: 0,
		}),
	);

	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

// ─── Mouse drag ──────────────────────────────────────────────────────────────
// Counterpart to `pointerDragBy` for components that listen to native
// `mousedown`/`mousemove`/`mouseup` (e.g. WidgetGridItem). Dispatching a
// PointerEvent does not synthesise a corresponding MouseEvent, so listeners
// bound to the mouse-event family see nothing. Uses the same document-level
// dispatch strategy as `pointerDragBy` so move/up reach handlers registered
// on `document` (which is where WidgetGridItem registers them).
export async function mouseDragBy(el: Element, dx: number, dy = 0, steps = 5) {
	const rect = el.getBoundingClientRect();
	const startX = rect.left + rect.width / 2;
	const startY = rect.top + rect.height / 2;

	el.dispatchEvent(
		new MouseEvent('mousedown', {
			bubbles: true,
			cancelable: true,
			clientX: startX,
			clientY: startY,
			button: 0,
			buttons: 1,
		}),
	);

	for (let i = 1; i <= steps; i++) {
		const t = i / steps;
		document.dispatchEvent(
			new MouseEvent('mousemove', {
				bubbles: true,
				cancelable: true,
				clientX: startX + dx * t,
				clientY: startY + dy * t,
				buttons: 1,
			}),
		);
	}

	document.dispatchEvent(
		new MouseEvent('mouseup', {
			bubbles: true,
			cancelable: true,
			clientX: startX + dx,
			clientY: startY + dy,
			button: 0,
			buttons: 0,
		}),
	);

	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
}

// ─── Portal queries ──────────────────────────────────────────────────────────
// Reka UI primitives (Dialog, Popover, DropdownMenu, Select, Tooltip, Toast…)
// teleport their content to document.body, outside `canvasElement`.
export const inBody = () => within(document.body);

// ─── WCAG 2.2 SC 2.5.8 — Target Size (Minimum) ───────────────────────────────
// Throws if the element's bounding box is below `min` × `min` CSS px.
export function expectMinTargetSize(el: Element, min = 24) {
	const r = el.getBoundingClientRect();
	if (r.width < min || r.height < min) {
		throw new Error(
			`Target size ${r.width.toFixed(1)}×${r.height.toFixed(1)} below WCAG 2.2 SC 2.5.8 minimum ${min}×${min}`,
		);
	}
}

// ─── Responsive testing ──────────────────────────────────────────────────────
export const VIEWPORTS = [
	{ name: 'mobileXs', width: 320, height: 640 },
	{ name: 'mobileSm', width: 375, height: 812 },
	{ name: 'tablet', width: 768, height: 1024 },
	{ name: 'laptop', width: 1024, height: 768 },
	{ name: 'desktop', width: 1440, height: 900 },
] as const;

export type ViewportName = (typeof VIEWPORTS)[number]['name'];

// `@vitest/browser/context` only exists at runtime when stories run under
// `vitest --project=storybook`. In Storybook dev mode (interactive play
// button) the module evaluates and throws. We catch that and degrade — fn
// still runs, just at whatever viewport the iframe is currently set to.
type VitestPage = { viewport(w: number, h: number): Promise<void> };
async function getVitestPage(): Promise<VitestPage | null> {
	try {
		const mod = await import('@vitest/browser/context');
		return mod.page as VitestPage;
	} catch {
		return null;
	}
}

// `page.viewport()` actually resizes the test iframe → Tailwind media queries
// (sm/md/lg/xl) react correctly. In dev mode (no Vitest runtime), this is a
// no-op resize: fn runs at the current iframe size. Use the Storybook viewport
// toolbar to manually switch breakpoints in dev.
export async function atViewport(width: number, height: number, fn: () => Promise<void> | void) {
	const page = await getVitestPage();
	if (!page) {
		await fn();
		return;
	}
	const prevW = window.innerWidth;
	const prevH = window.innerHeight;
	await page.viewport(width, height);
	// give Vue + CSS a tick to flush
	await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
	try {
		await fn();
	} finally {
		await page.viewport(prevW, prevH);
	}
}

export function expectNoHorizontalOverflow(el: Element) {
	const e = el as HTMLElement;
	if (e.scrollWidth > e.clientWidth + 1) {
		throw new Error(
			`Horizontal overflow on <${e.tagName.toLowerCase()}>: scrollWidth=${e.scrollWidth} > clientWidth=${e.clientWidth}`,
		);
	}
}

// Convenience: run `fn` at every standard viewport, restoring afterwards.
// In dev mode (no Vitest runtime) we can't actually resize the iframe, so we
// just call fn once with the current viewport — running 5× would be the same
// assertion repeated.
export async function forEachViewport(
	fn: (vp: (typeof VIEWPORTS)[number]) => Promise<void> | void,
) {
	const page = await getVitestPage();
	if (!page) {
		const w = window.innerWidth;
		const closest = VIEWPORTS.reduce((a, b) =>
			Math.abs(b.width - w) < Math.abs(a.width - w) ? b : a,
		);
		await fn(closest);
		return;
	}
	for (const vp of VIEWPORTS) {
		await atViewport(vp.width, vp.height, () => fn(vp));
	}
}
