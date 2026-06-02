/**
 * Form state management with Zod validation and ValidationError integration.
 *
 * @param options - Configuration options
 * @param options.schema - Zod schema for validation
 * @param options.initialValues - Initial form values
 * @param options.onSubmit - Submit handler called with validated values
 * @returns Form state, errors, and control methods
 *
 * @example
 * ```ts
 * import { z } from 'zod'
 *
 * const schema = z.object({
 *   name: z.string().min(2, 'Name must be at least 2 characters'),
 *   email: z.string().email('Invalid email'),
 *   age: z.number().min(18, 'Must be at least 18')
 * })
 *
 * const {
 *   fields,
 *   errors,
 *   isDirty,
 *   isValid,
 *   isSubmitting,
 *   submit,
 *   reset,
 *   setFieldValue,
 *   validate
 * } = useForm({
 *   schema,
 *   initialValues: { name: '', email: '', age: 0 },
 *   onSubmit: async (values) => {
 *     await saveUser(values)
 *   }
 * })
 *
 * // Bind to form
 * // <input v-model="fields.name" />
 * // <span v-if="errors.getError('name')">{{ errors.getError('name') }}</span>
 *
 * // Submit form
 * await submit()
 * ```
 */
import { ref, readonly, computed, type Ref, type DeepReadonly, type ComputedRef } from 'vue';
import type { ZodObject, ZodRawShape, infer as ZodInfer } from 'zod';
import { ValidationError } from '@fromforgesoftware/ts-kit/errors';

// Constrain to ZodObject schemas which always produce object types
type FormSchema = ZodObject<ZodRawShape>;

export interface UseFormOptions<T extends FormSchema> {
	/** Zod schema for validation */
	schema: T;
	/** Initial form values */
	initialValues: ZodInfer<T>;
	/** Submit handler called with validated values */
	onSubmit: (values: ZodInfer<T>) => void | Promise<void>;
}

export interface UseFormReturn<T extends FormSchema> {
	/** Reactive form field values */
	fields: Ref<ZodInfer<T>>;
	/** Validation errors (uses ValidationError class) */
	errors: DeepReadonly<Ref<ValidationError<ZodInfer<T>>>>;
	/** Whether any field has been modified */
	isDirty: ComputedRef<boolean>;
	/** Whether form passes validation */
	isValid: ComputedRef<boolean>;
	/** Whether form is currently submitting */
	isSubmitting: DeepReadonly<Ref<boolean>>;
	/** Submit the form (validates first) */
	submit: () => Promise<void>;
	/** Reset form to initial values */
	reset: () => void;
	/** Set a single field value */
	setFieldValue: <K extends keyof ZodInfer<T>>(field: K, value: ZodInfer<T>[K]) => void;
	/** Validate form and update errors */
	validate: () => boolean;
	/** Clear all errors */
	clearErrors: () => void;
	/** Set a field error manually */
	setFieldError: <K extends keyof ZodInfer<T>>(field: K, message: string) => void;
}

function deepClone<T>(obj: T): T {
	return JSON.parse(JSON.stringify(obj));
}

function deepEqual<T>(a: T, b: T): boolean {
	return JSON.stringify(a) === JSON.stringify(b);
}

export function useForm<T extends FormSchema>(options: UseFormOptions<T>): UseFormReturn<T> {
	const { schema, initialValues, onSubmit } = options;

	type FormValues = ZodInfer<T>;

	const fields = ref<FormValues>(deepClone(initialValues)) as Ref<FormValues>;
	const errors = ref<ValidationError<FormValues>>(new ValidationError<FormValues>());
	const isSubmitting = ref(false);

	const isDirty = computed(() => {
		return !deepEqual(fields.value, initialValues);
	});

	const isValid = computed(() => {
		return !errors.value.hasErrors();
	});

	const validate = (): boolean => {
		const result = schema.safeParse(fields.value);

		if (result.success) {
			errors.value = new ValidationError<FormValues>();
			return true;
		}

		// Convert Zod errors to ValidationError using the factory
		errors.value = ValidationError.fromZodError<FormValues>(result.error);
		return false;
	};

	const submit = async (): Promise<void> => {
		if (isSubmitting.value) return;

		// Validate first
		if (!validate()) {
			return;
		}

		isSubmitting.value = true;

		try {
			await onSubmit(fields.value);
		} finally {
			isSubmitting.value = false;
		}
	};

	const reset = (): void => {
		fields.value = deepClone(initialValues);
		errors.value = new ValidationError<FormValues>();
	};

	const setFieldValue = <K extends keyof FormValues>(field: K, value: FormValues[K]): void => {
		(fields.value as Record<K, FormValues[K]>)[field] = value;
	};

	const clearErrors = (): void => {
		errors.value = new ValidationError<FormValues>();
	};

	const setFieldError = <K extends keyof FormValues>(field: K, message: string): void => {
		const newErrors = new ValidationError<FormValues>(errors.value.getErrors());
		newErrors.setError(field, message);
		errors.value = newErrors;
	};

	return {
		fields,
		errors: readonly(errors),
		isDirty,
		isValid,
		isSubmitting: readonly(isSubmitting),
		submit,
		reset,
		setFieldValue,
		validate,
		clearErrors,
		setFieldError,
	};
}
