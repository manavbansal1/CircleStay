import * as React from "react"
import { cn } from "@/lib/utils"

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "secondary" | "destructive" | "outline"
}

function Badge({ className, variant = "default", ...props }: BadgeProps) {
    return (
        <div
            className={cn(
                "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold",
                "transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "backdrop-blur-md shadow-sm",
                {
                    "border-transparent bg-gradient-to-r from-primary to-accent text-primary-foreground hover:shadow-md hover:scale-105": variant === "default",
                    "border-transparent bg-secondary/80 text-secondary-foreground hover:bg-secondary": variant === "secondary",
                    "border-transparent bg-destructive/80 text-destructive-foreground hover:bg-destructive": variant === "destructive",
                    "text-foreground border-primary/30 bg-background/50 hover:bg-primary/10": variant === "outline",
                },
                className
            )}
            {...props}
        />
    )
}

export { Badge }

