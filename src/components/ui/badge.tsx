import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const badgeVariants = cva(
    'inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium w-fit whitespace-nowrap shrink-0 gap-1 transition-colors',
    {
        variants: {
            variant: {
                default:
                    'border-transparent bg-[#0076FF] text-white hover:bg-[#0060D0]',
                secondary:
                    'border-transparent bg-slate-100 text-slate-900 hover:bg-slate-200',
                destructive:
                    'border-transparent bg-red-500 text-white hover:bg-red-600',
                outline:
                    'text-slate-900 border-slate-200 hover:bg-slate-50',
            },
        },
        defaultVariants: {
            variant: 'default',
        },
    },
)

function Badge({
    className,
    variant,
    ...props
}: React.ComponentProps<'span'> &
    VariantProps<typeof badgeVariants>) {
    return (
        <span
            data-slot="badge"
            className={cn(badgeVariants({ variant }), className)}
            {...props}
        />
    )
}

export { Badge, badgeVariants }
