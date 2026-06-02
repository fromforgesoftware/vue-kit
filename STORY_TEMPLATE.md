# Storybook Story + MDX Template

This is the canonical template every component in `packages/ui/src/lib/` must follow. Skill files reference this document — keep it updated when the pattern evolves.

For background on _why_ each part exists, see `packages/ui/CLAUDE.md` and the Foundation MDX pages (`Colors`, `Typography`, `Spacing`, `Iconography`).

The exemplar in source is `src/lib/general/button/` (`Button.vue`, `Button.stories.ts`, `About.mdx`). When in doubt, mirror that folder.

---

## File layout (one folder per component)

```
src/lib/<group>/<component-kebab>/
├── ComponentName.vue          # Vue SFC
├── ComponentName.test.ts      # Vitest unit test (rendering + props)
├── ComponentName.stories.ts   # Storybook stories — args-driven
├── About.mdx                  # MDX docs (always named About.mdx)
├── component-name.ts          # CVA variants + types (when variants exist)
└── index.ts                   # Barrel export
```

`<group>` is one of: `general/`, `form/`, `patterns/`, `dates/`, `color/`, `charts/`, `statistic-card/`, `foundation/`. Do **not** invent atoms/molecules/organisms — that taxonomy is not used.

---

## Hard rule — fixes go in the component, never in the story

This is non-negotiable. Stories are _consumers_ of the component; they exercise its public API and nothing else.

### Forbidden in story files

- Wrapper `<div>`s that adjust spacing, alignment, or sizing to make the component look correct (a consuming app won't have that wrapper).
- Inline `class="..."` or `:style="..."` on the component itself that override its built-in styling. (Test stories may set sizing on a _parent_ container only when measuring viewport behaviour.)
- Re-implementing variants in the story by composing primitives differently. If a story needs "a tighter Card", the Card needs a `density` or `size` variant.
- `<style>` blocks. Utility classes added to "fix" appearance.
- Workarounds for missing props (e.g. wrapping in `<div tabindex="0">` to add focus). The component must expose the prop.

### Allowed in story files

- Set props (`args`).
- Compose multiple components to demonstrate a real pattern (e.g. `Dialog` + `Button` + `FormField` together).
- Provide fixture data via `args`.
- Wire `fn()` spies for play-test assertions.
- Set the _outer_ container's width when explicitly testing viewport behaviour.

### When the audit finds a story doing fixes

That is a signal the component is missing a variant or prop. The fix sequence:

1. Identify what the story is doing (extra wrapper, override class, custom CSS).
2. Add the missing variant/prop to the component's CVA definition or `defineProps`.
3. Update _all_ current consumers in `apps/web` and `apps/global` that were doing the same workaround.
4. Refactor the story to use the new variant/prop.
5. Update `About.mdx` to surface the new variant/prop.

### Review heuristic

For every story, ask: _"If I deleted the story file and a consumer pasted only the component invocation (`<Foo :prop="..." />`) into a real app, would it look and behave identically to what Storybook shows?"_ If no, the difference is a missing variant.

---

## `ComponentName.stories.ts` — args-driven CSF3

```ts
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { fn, expect, within, userEvent } from 'storybook/test'
import ComponentName from './ComponentName.vue'
import {
  expectMinTargetSize,
  expectNoHorizontalOverflow,
  forEachViewport,
} from '../../../test-utils/playHelpers'

const meta = {
  title: 'General/ComponentName', // Group/Component (Title Case)
  component: ComponentName,

  // Disable autodocs because every component has a curated About.mdx.
  // Without this, the global tags: ['autodocs'] in preview.ts would generate
  // a duplicate auto-Docs page next to the curated MDX.
  tags: ['!autodocs'],

  argTypes: {
    variant: { control: 'select', options: [...], description: '...' },
    size: { control: 'select', options: [...], description: '...' },
    disabled: { control: 'boolean', description: '...' },
    onClick: { action: 'click' },
  },

  args: {
    variant: 'default',
    size: 'default',
    disabled: false,
    onClick: fn(),
  },

  parameters: {
    docs: {
      description: { component: 'One-paragraph component summary.' },
    },
  },

  render: (args) => ({
    components: { ComponentName },
    setup: () => ({ args }),
    template: `<ComponentName v-bind="args" @click="args.onClick">Content</ComponentName>`,
  }),
} satisfies Meta<typeof ComponentName>

export default meta
type Story = StoryObj<typeof meta>

// ── Demo stories (visible in MDX Canvas blocks) ──────────────────────────────

export const Default: Story = {}

export const Variants: Story = {
  parameters: { docs: { description: { story: '...' } } },
  render: (args) => ({ /* … */ }),
}

// ── Interactive stories (hidden from autodocs, run as play-tests) ────────────

export const InteractiveClickEmits: Story = {
  tags: ['!autodocs', 'test'],
  play: async ({ args, canvasElement }) => {
    const btn = within(canvasElement).getByRole('button')
    await userEvent.click(btn)
    await expect(args.onClick).toHaveBeenCalledOnce()
  },
}

export const InteractiveResponsive: Story = {
  tags: ['!autodocs', 'test'],
  play: async ({ canvasElement }) => {
    await forEachViewport(async () => {
      const root = canvasElement.firstElementChild as HTMLElement
      await expect(root).toBeVisible()
      expectNoHorizontalOverflow(root)
      for (const el of canvasElement.querySelectorAll('button, [role="button"], a')) {
        expectMinTargetSize(el, 24)
      }
    })
  },
}
```

---

## Pattern decision tree — required play tests

| Pattern                    | Examples                                                                                                                                                                                                                              | Required play tests (in addition to `InteractiveResponsive`)                                                                          |
| -------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| **A — Presentational**     | Avatar, Badge, Card, Skeleton, Spinner, StatTrend, Divider, AspectRatio, Icon, Alert, Progress, EmptyState, ForbiddenState, ChatBubble                                                                                                | _none_ — `InteractiveResponsive` only                                                                                                 |
| **B — Form input**         | Input, Textarea, Select, Checkbox, Radio, Switch, Slider, Toggle, NumberField, PinInput, ColorField, Editable, Listbox, Autocomplete                                                                                                  | `InteractiveTypeAndEmit`, `InteractiveKeyboardNav`, `InteractiveDisabledBlocks`, `InteractiveErrorState`                              |
| **C — Composite / Portal** | Dialog, AlertDialog, Drawer, Popover, DropdownMenu, ContextMenu, Menubar, Tooltip, HoverCard, Toast, CommandPalette, Authentication, Tour, UnsavedChanges                                                                             | `InteractiveOpensViaTrigger`, `InteractiveClosesOnEscape`, `InteractiveKeyboardNav`, `InteractiveFocusTrapAndReturn`                  |
| **D — Complex / Timeline** | TimeRangeBar, ScheduleTimeline, ActivityTimeline, EventCalendar, DataTable, FilterBar, Sort, Survey, NotificationCenter, Splitter, Stepper, ColorArea, ColorSlider, Calendar, DatePicker, DateRangePicker, VirtualScrollArea, Sidebar | `InteractiveDragOrSelect`, `InteractiveKeyboardAlternative` (SC 2.5.7), `InteractiveBoundaryClamps`, `InteractiveActiveStatesAndA11y` |

Pattern B/C/D contracts:

- **Pattern B contract**: each story sets `'onUpdate:modelValue': fn()` in `args`, types or interacts, then asserts `args['onUpdate:modelValue']` was called with the expected value. `InteractiveDisabledBlocks` uses `args.disabled = true` and asserts the event was NOT emitted.
- **Pattern C contract**: portals teleport to `document.body` — query with `inBody().findByRole('dialog' | 'menu' | 'tooltip')`, not `within(canvasElement)`. Always close via `userEvent.keyboard('{Escape}')` and re-query to assert removal.
- **Pattern D contract**: drag uses `pointerDragBy(handle, dx)` from `playHelpers`. Every drag MUST have a keyboard alternative (ArrowKeys, +/- buttons, click) — that alternative is asserted in `InteractiveKeyboardAlternative` (WCAG 2.5.7). `InteractiveBoundaryClamps` drags past edges and asserts no overflow / no negative values.

---

## `About.mdx` — required sections

```mdx
import { Meta, Canvas, Controls } from '@storybook/addon-docs/blocks';
import * as ComponentNameStories from './ComponentName.stories';

<Meta of={ComponentNameStories} />

# ComponentName

One-paragraph summary.

## When to use

- Bullet 1
- Bullet 2

## When not to use

- Bullet — link to the right alternative.

## Anatomy

<Canvas of={ComponentNameStories.Default} />

## Variants

<Canvas of={ComponentNameStories.Variants} />
<table>...</table>

## Sizes

<Canvas of={ComponentNameStories.Sizes} />

## Props

<Controls of={ComponentNameStories.Default} />

## Accessibility (WCAG 2.2 AA)

- **1.4.3 Contrast**: …
- **1.4.11 Non-text Contrast**: …
- **2.1.1 Keyboard**: …
- **2.4.7 Focus Visible**: …
- **2.4.11 Focus Not Obscured (Min)**: …
- **2.4.13 Focus Appearance**: …
- **2.5.7 Dragging Movements** (if applicable): keyboard alternative is `…`
- **2.5.8 Target Size (Min)**: every interactive size meets ≥ 24 × 24 CSS px
- **4.1.2 Name, Role, Value**: …

## Responsive behaviour

<Canvas of={ComponentNameStories.InteractiveResponsive} />

Description of mobile / tablet / desktop behaviour. Reference any `max-sm:` overrides or JS-level prop swaps.

## Do / Don't

<table>
	<thead>
		<tr>
			<th>Do</th>
			<th>Don't</th>
		</tr>
	</thead>
	<tbody>...</tbody>
</table>
```

---

## WCAG 2.2 checklist (audit every component before sign-off)

| Criterion                           | Level         | What to check                                         | Common fix                                                                           |
| ----------------------------------- | ------------- | ----------------------------------------------------- | ------------------------------------------------------------------------------------ |
| 1.3.1 Info and Relationships        | A             | Semantic HTML / ARIA roles                            | Use `<button>`, `<label for>`, `role` only when native semantics aren't enough       |
| 1.4.3 Contrast (Minimum)            | AA            | Text + UI ≥ 4.5:1                                     | Adjust theme tokens; tested by axe                                                   |
| 1.4.11 Non-text Contrast            | AA            | UI components ≥ 3:1 against neighbours                | Borders, focus rings                                                                 |
| 2.1.1 Keyboard                      | A             | All operations reachable + operable by keyboard       | Add `tabindex`, key handlers                                                         |
| 2.4.3 Focus Order                   | A             | Tab order matches visual order                        | DOM order matches visual                                                             |
| 2.4.7 Focus Visible                 | AA            | Focus indicator visible                               | `focus-visible:outline-2 focus-visible:outline-primary` — never `outline-none` alone |
| **2.4.11 Focus Not Obscured (Min)** | **AA (2.2)**  | Focused element not fully covered by sticky UI        | No element on top of focused without z-index escape                                  |
| **2.4.13 Focus Appearance**         | **AAA (2.2)** | Focus area + contrast                                 | 2 px outline, contrast 3:1                                                           |
| **2.5.7 Dragging Movements**        | **AA (2.2)**  | Single-pointer alt for any drag                       | Add keyboard / button alternative                                                    |
| **2.5.8 Target Size (Min)**         | **AA (2.2)**  | Targets ≥ 24×24 CSS px                                | Expand hit-area with padding or `::before` pseudo-element                            |
| 3.2.2 On Input                      | A             | Input doesn't trigger context change unless announced | Auto-submit forms must warn                                                          |
| **3.3.7 Redundant Entry**           | **A (2.2)**   | Don't ask for the same info twice in a flow           | Forms remember prior values                                                          |
| 4.1.2 Name, Role, Value             | A             | Each control has accessible name and exposes state    | `aria-label`, `aria-valuenow`, `aria-pressed`                                        |
| 4.1.3 Status Messages               | AA            | Programmatically determinable status                  | `role="status"`, `aria-live`                                                         |

axe-core (via `@storybook/addon-a11y`) covers most automatically. The 2.2-specific ones in **bold** often need manual play-function checks (Pattern D).

---

## Mobile-first responsive checklist

- [ ] Source uses mobile-first Tailwind utilities — no prefix for the mobile baseline; `sm:` / `md:` / `lg:` only for upscale. `max-sm:` is allowed for true bottom-sheet patterns (see Dialog).
- [ ] Renders at 320 px without horizontal scroll. Long labels truncate with `truncate` / `line-clamp-N`.
- [ ] Touch targets ≥ 24 × 24 px at every viewport (WCAG 2.5.8). Prefer ≥ 44 × 44 for primary mobile actions.
- [ ] No hover-only affordances on mobile. Anything revealed on `hover:` must also be reachable by tap.
- [ ] Stacked vs side-by-side layout declared — `flex-col sm:flex-row` etc. when widths exceed the viewport.
- [ ] Dialogs / Drawers become bottom-sheet on mobile (`max-sm:` overrides on positioning).
- [ ] Tables / DataTable have a defined small-screen behaviour: horizontal scroll with sticky first column, OR collapse to card list. Documented in MDX.
- [ ] Type ramps — text doesn't get smaller than 14 px on mobile. Inputs use `text-[16px]` or larger on mobile to prevent iOS zoom.
- [ ] Charts re-render legibly at 320 px or document a "min-width 480 px" container constraint.
- [ ] `InteractiveResponsive` story passes at all five viewports (320 / 375 / 768 / 1024 / 1440).

---

## `data-slot` selector convention

Every interactive element exposes a stable `data-slot="<component>-<part>"` attribute. Tests, Cypress specs, and consumers query against these — never against generated CSS classes.

Naming: `<component-kebab>-<part-kebab>`. Examples from `TimeRangeBar.vue`:

- `data-slot="time-range-bar-resize-left"` on the bar's left edge handle
- `data-slot="time-range-bar-resize-right"` on the right edge handle
- `data-slot="segment-resize-left"` on a per-segment handle
- `data-slot="time-range-bar-ruler-tick"` on each ruler tick label

Apply on triggers, content roots, handles, items in lists, search inputs, close buttons, and chip remove icons. Skip on purely decorative wrappers.

---

## i18n requirement

Every user-facing string (slot defaults, placeholders, aria-labels, button text, tooltip content) MUST go through `useI18n().t(TranslationKeys.X)`. This applies to:

- Default slot text (`<slot>{{ t(TranslationKeys.ActionSave) }}</slot>`)
- `placeholder=""` attributes
- `aria-label=""` attributes
- Empty-state copy
- Confirmation dialog titles / descriptions

Workflow for new keys (see backend `CLAUDE.md` "i18n Workflow"): add to `i18n/locales/en.json`, commit + push to `dev` in the i18n submodule, then run `./sync-i18n.sh` in this repo BEFORE referencing the constant. Many common keys already exist (`ActionSave`, `ActionCancel`, `ActionDelete`, `ActionEdit`, `CommonSearch`, etc.) — search first.

---

## Verification before sign-off

```bash
cd packages/ui
npx vue-tsc --noEmit            # zero errors
npm run test                    # unit tests pass
npm run test:storybook          # play tests pass (browser mode)
npm run storybook               # visual + a11y panel green at every viewport
```

Per-component spot check:

- [ ] `npm run test:storybook -- ComponentName` is green
- [ ] Storybook a11y panel: 0 violations
- [ ] `About.mdx` renders with Anatomy + Variants + Props + Accessibility + Responsive sections
- [ ] At least one demo story per variant/size
- [ ] All interactive elements meet WCAG 2.5.8 (≥ 24 × 24 px) — confirmed via `expectMinTargetSize`
- [ ] Drag interactions have a keyboard alternative (WCAG 2.5.7)
- [ ] Focus visible on every focusable element
- [ ] `InteractiveResponsive` passes at 320 / 375 / 768 / 1024 / 1440 with no horizontal overflow
- [ ] `data-slot="<component>-<part>"` on every interactive element
- [ ] No hardcoded English — every user-facing string goes through `t()`
- [ ] **No fixes live in the story file** — passes only `args`/props
- [ ] Consuming apps still typecheck — `npx vue-tsc --noEmit` clean in `apps/web` and `apps/global`
