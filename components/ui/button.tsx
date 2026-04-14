import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-2xl text-sm font-bold ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:translate-y-1 active:border-b-0",
  {
    variants: {
      variant: {
        default: "bg-sky-500 text-white hover:bg-sky-400 border-b-4 border-sky-600",
        destructive:
          "bg-rose-500 text-white hover:bg-rose-400 border-b-4 border-rose-600",
        outline:
          "border-2 border-slate-200 bg-white hover:bg-slate-50 text-slate-700 active:border-b-2 active:translate-y-0",
        secondary:
          "bg-amber-400 text-amber-900 hover:bg-amber-300 border-b-4 border-amber-500",
        ghost: "hover:bg-slate-100 text-slate-700 active:translate-y-0",
        link: "text-sky-500 underline-offset-4 hover:underline active:translate-y-0",
        white: "bg-white text-slate-900 hover:bg-slate-50 border-b-4 border-slate-200",
      },
      size: {
        default: "h-12 px-6 py-2",
        sm: "h-10 rounded-xl px-4",
        lg: "h-14 rounded-2xl px-8 text-base",
        icon: "h-12 w-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
