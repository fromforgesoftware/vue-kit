import type { InjectionKey, Ref } from 'vue';
import type { EditableSize } from './editable';

// Shared size token between Editable and its sub-components. Set by Editable
// via `provide`; consumed by Preview / Input / Trigger via `inject` so a
// single `<Editable size="sm">` styles every part.
export const editableSizeKey = Symbol('editable-size') as InjectionKey<Ref<EditableSize>>;
