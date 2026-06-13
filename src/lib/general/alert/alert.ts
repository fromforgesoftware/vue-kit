import { cva, type VariantProps } from 'class-variance-authority';

/** Alert banner — `info` / `warning` / `destructive` / `success` semantic variants. */
export const alertVariants = cva(
	'relative w-full rounded-lg border px-3 py-2 text-sm grid has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] grid-cols-[0_1fr] has-[>svg]:gap-x-3 gap-y-0.5 items-start [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current',
	{
		variants: {
			variant: {
				default: 'bg-card text-card-foreground',
				info: 'bg-card text-info [&>svg]:text-current *:data-[slot=alert-description]:text-info/90',
				warning:
					'bg-card text-warning-foreground [&>svg]:text-warning *:data-[slot=alert-description]:text-foreground/80',
				destructive:
					'bg-card text-destructive [&>svg]:text-current *:data-[slot=alert-description]:text-destructive/90',
				success:
					'bg-card text-success [&>svg]:text-current *:data-[slot=alert-description]:text-success/90',
			},
			tone: {
				solid: '',
				soft: '',
			},
			size: {
				sm: 'px-2 py-1 text-xs [&>svg]:size-3.5',
				default: 'px-3 py-2 text-sm [&>svg]:size-4',
				lg: 'px-4 py-3 text-base [&>svg]:size-5',
			},
		},
		compoundVariants: [
			// Soft tone — tinted background per semantic variant
			{ variant: 'info', tone: 'soft', class: 'bg-info/10 border-info/30' },
			{ variant: 'warning', tone: 'soft', class: 'bg-warning/10 border-warning/30' },
			{
				variant: 'destructive',
				tone: 'soft',
				class: 'bg-destructive/10 border-destructive/30',
			},
			{ variant: 'success', tone: 'soft', class: 'bg-success/10 border-success/30' },
			{ variant: 'default', tone: 'soft', class: 'bg-muted border-transparent' },
		],
		defaultVariants: {
			variant: 'default',
			tone: 'solid',
			size: 'default',
		},
	},
);

export const alertTitleVariants = cva(
	'col-start-2 line-clamp-1 min-h-4 font-medium tracking-tight',
	{
		variants: {
			size: {
				sm: 'text-xs',
				default: 'text-sm',
				lg: 'text-base',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

export const alertDescriptionVariants = cva(
	'col-start-2 grid justify-items-start gap-1 [&_p]:leading-relaxed',
	{
		variants: {
			size: {
				sm: 'text-xs',
				default: 'text-sm',
				lg: 'text-base',
			},
		},
		defaultVariants: {
			size: 'default',
		},
	},
);

// Dismiss button must meet WCAG 2.2 SC 2.5.8: ≥ 24×24 CSS px.
export const alertDismissVariants = cva(
	'absolute right-2 top-2 inline-flex size-6 items-center justify-center rounded-md text-current/80 transition-colors hover:bg-foreground/10 hover:text-current focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-current cursor-pointer [&>svg]:size-3.5 [&>svg]:pointer-events-none',
	{
		variants: {},
		defaultVariants: {},
	},
);

export type AlertVariants = VariantProps<typeof alertVariants>;
export type AlertVariant = NonNullable<AlertVariants['variant']>;
export type AlertTone = NonNullable<AlertVariants['tone']>;
export type AlertSize = NonNullable<AlertVariants['size']>;
