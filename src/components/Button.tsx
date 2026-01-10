import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "link"
    size?: "default" | "sm" | "lg"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "default", ...props }, ref) => {
        return (
            <button
                ref={ref}
                className={cn(
                    "inline-flex items-center justify-center rounded-lg font-medium",
                    "transition-all duration-300 ease-in-out",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                    "disabled:pointer-events-none disabled:opacity-50",
                    "active:scale-95",
                    {
                        "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-lg hover:shadow-xl hover:from-primary/90 hover:to-accent/90 hover:-translate-y-0.5": variant === "default",
                        "border-2 border-primary/30 bg-transparent backdrop-blur-sm shadow-sm hover:bg-primary/10 hover:border-primary hover:shadow-md": variant === "outline",
                        "hover:bg-primary/10 hover:text-primary": variant === "ghost",
                        "text-primary underline-offset-4 hover:underline hover:text-accent": variant === "link",
                        "h-9 px-4 py-2 text-sm": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-11 rounded-lg px-8 text-base": size === "lg",
                    },
                    className
                )}
                {...props}
            />
        )
    }
)
Button.displayName = "Button"

export { Button }

