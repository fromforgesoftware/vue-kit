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
} from './unsavedChangesRegistry';
export { useUnsavedChanges } from './useUnsavedChanges';
export type {
	UseUnsavedChangesOptions,
	UseUnsavedChangesReturn,
	UnsavedChangesMode,
} from './useUnsavedChanges';
export { useFormGuard } from './useFormGuard';
export type { UseFormGuardOptions, UseFormGuardReturn, FormGuardMode } from './useFormGuard';
export {
	unsavedChangesBannerVariants,
	unsavedChangesBannerInnerVariants,
	unsavedChangesBannerInfoVariants,
	unsavedChangesBannerIconWrapperVariants,
	unsavedChangesBannerTitleVariants,
	unsavedChangesBannerActionsVariants,
	unsavedChangesBannerButtonVariants,
} from './unsaved-changes';
