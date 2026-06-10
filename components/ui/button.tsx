import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Button Component - Single source of truth for all button styles
 *
 * Design system compliance:
 * - Primary: Gold button with black text (primary CTA)
 * - Secondary: Navy button with accent text (secondary action)
 * - Ghost: Transparent with hover effect
 * - Link: Text-only with underline
 *
 * All buttons use:
 * - rounded-full (pill shape)
 * - proper focus-visible rings for accessibility
 * - consistent shadow for depth
 * - transition animations
 */

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        primary:
          'rounded-full bg-primary text-black shadow-lg shadow-black/30 hover:opacity-90 focus-visible:ring-primary focus-visible:ring-offset-background',
        secondary:
          'rounded-full bg-secondary text-accent shadow-lg shadow-black/30 hover:bg-secondary/80 focus-visible:ring-accent focus-visible:ring-offset-background',
        ghost:
          'rounded-full hover:bg-accent/10 focus-visible:ring-primary focus-visible:ring-offset-background',
        link: 'text-primary underline-offset-4 hover:underline focus-visible:ring-primary',
      },
      size: {
        sm: 'px-4 py-2 text-xs',
        default: 'px-6 py-3 text-sm',
        lg: 'px-8 py-4 text-base',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: { variant: 'primary', size: 'default' },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild: _asChild, ...props }, ref) => (
    <button
      className={cn(buttonVariants({ variant, size, className }))}
      ref={ref}
      {...props}
    />
  )
)
Button.displayName = 'Button'

export { Button, buttonVariants }
