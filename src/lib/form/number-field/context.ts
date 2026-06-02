import type { ComputedRef, InjectionKey } from 'vue';
import type { NumberFieldSize, NumberFieldVariant } from './number-field.js';

export interface NumberFieldContext {
	size: ComputedRef<NumberFieldSize>;
	variant: ComputedRef<NumberFieldVariant>;
	disabled: ComputedRef<boolean>;
	error: ComputedRef<boolean>;
	describedBy: ComputedRef<string | undefined>;
}

export const numberFieldContextKey: InjectionKey<NumberFieldContext> = Symbol('NumberFieldContext');
