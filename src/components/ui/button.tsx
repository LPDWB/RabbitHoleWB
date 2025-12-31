import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"

    return (
      <Comp
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--glass-ring)] focus-visible:ring-offset-2 focus-visible:ring-offset-background disabled:pointer-events-none disabled:opacity-50 bg-[linear-gradient(135deg,hsl(var(--primary)/0.98),hsl(var(--primary)/0.9))] text-primary-foreground shadow-[0_12px_32px_hsl(var(--foreground)/0.16)] ring-1 ring-[color:var(--glass-border)] hover:bg-[linear-gradient(135deg,hsl(var(--primary)),hsl(var(--primary)/0.9))] hover:shadow-[0_0_0_4px_hsl(var(--glass-ring)/0.5),0_16px_40px_hsl(var(--foreground)/0.2)] active:translate-y-[1px] h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)

Button.displayName = "Button"

export { Button }
