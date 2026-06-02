import { cva, type VariantProps } from 'class-variance-authority';

// ───────────────────────────────────────────────────────────────────────────
// TreeView — hierarchical disclosure (folders/files), built on Reka UI's
// TreeRoot / TreeItem. Roving focus, ArrowUp/Down, ArrowRight (expand or move
// to first child), ArrowLeft (collapse or move to parent), Home/End,
// type-ahead, and `*` (expand siblings) are handled by Reka.
// ───────────────────────────────────────────────────────────────────────────

export const treeViewVariants = cva('flex flex-col gap-px text-sm', {
	variants: {
		size: {
			sm: 'text-xs',
			default: 'text-sm',
		},
	},
	defaultVariants: { size: 'default' },
});

// One row in the tree. The hover/focus/selected states use semantic tokens
// rather than tailwind opacity hacks. `data-selected` is set by Reka when the
// node is in the selected set.
export const treeViewItemVariants = cva(
	[
		'group/tree-item flex w-full cursor-pointer items-center gap-1.5 rounded-md py-1.5 pr-2',
		'transition-colors outline-none',
		'hover:bg-accent hover:text-accent-foreground',
		'focus-visible:bg-accent focus-visible:text-accent-foreground',
		'focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-1',
		'data-[selected]:bg-accent data-[selected]:text-accent-foreground data-[selected]:font-medium',
		'data-[disabled]:opacity-50 data-[disabled]:cursor-not-allowed',
	].join(' '),
	{
		variants: {
			size: {
				sm: 'min-h-6 text-xs',
				default: 'min-h-7 text-sm',
			},
		},
		defaultVariants: { size: 'default' },
	},
);

// 24×24 hit area for the chevron toggle to satisfy WCAG SC 2.5.8.
export const treeViewChevronVariants = cva(
	[
		'shrink-0 inline-flex items-center justify-center size-6 rounded',
		'transition-colors hover:bg-foreground/10',
		'focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring',
	].join(' '),
);

export type TreeViewVariants = VariantProps<typeof treeViewVariants>;
export type TreeViewItemVariants = VariantProps<typeof treeViewItemVariants>;
export type TreeViewSize = NonNullable<TreeViewVariants['size']>;

export interface TreeNode {
	id: string;
	name: string;
	icon?: string;
	expandedIcon?: string;
	children?: TreeNode[];
	disabled?: boolean;
}
