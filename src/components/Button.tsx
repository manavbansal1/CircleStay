import * as React from "react"
// Removed unused imports

// I should stick to simple props or install them. Usage of cva is standard but I didn't add it.
// I will start with a simpler button or add the dependency.
// "npm install class-variance-authority @radix-ui/react-slot" was not run.
// I'll stick to a simpler implementation without cva to save time, or just install them.
// Installing is better for quality.
// But as I cannot run a command in this turn, I will use a simple implementation for now and refactor if needed, 
// OR I can assume I can run the command in the next turn and just write the file now? No, that breaks the build.
// I'll write a simple Button component using clsx/tailwind-merge.

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
                    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50",
                    {
                        "bg-primary text-primary-foreground shadow hover:bg-primary/90": variant === "default",
                        "border border-input bg-transparent shadow-sm hover:bg-accent hover:text-accent-foreground": variant === "outline",
                        "hover:bg-accent hover:text-accent-foreground": variant === "ghost",
                        "text-primary underline-offset-4 hover:underline": variant === "link",
                        "h-9 px-4 py-2": size === "default",
                        "h-8 rounded-md px-3 text-xs": size === "sm",
                        "h-10 rounded-md px-8": size === "lg",
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
