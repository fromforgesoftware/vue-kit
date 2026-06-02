export { default as UnsavedChangesBanner } from './UnsavedChangesBanner.vue';
export { default as UnsavedChangesDialog } from './UnsavedChangesDialog.vue';
export { default as UnsavedChangesOutlet } from './UnsavedChangesOutlet.vue';
export {
	createUnsavedChangesRegistry,
	provideUnsavedChangesRegistry,
	useUnsavedChangesRegistry,
	UnsavedChangesRegistryKey,
	type UnsavedChangesRegistration,
	type UnsavedChangesRegistry,
} from './unsavedChangesRegistry.js';
export { useUnsavedChanges } from './useUnsavedChanges.js';
export type {
	UseUnsavedChangesOptions,
	UseUnsavedChangesReturn,
	UnsavedChangesMode,
} from './useUnsavedChanges.js';
export { useFormGuard } from './useFormGuard.js';
export type { UseFormGuardOptions, UseFormGuardReturn, FormGuardMode } from './useFormGuard.js';
export {
	unsavedChangesBannerVariants,
	unsavedChangesBannerInnerVariants,
	unsavedChangesBannerInfoVariants,
	unsavedChangesBannerIconWrapperVariants,
	unsavedChangesBannerTitleVariants,
	unsavedChangesBannerActionsVariants,
	unsavedChangesBannerButtonVariants,
} from './unsaved-changes.js';
