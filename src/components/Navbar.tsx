import Link from "next/link"
import { Button } from "@/components/Button"
import { cn } from "@/lib/utils"

export function Navbar() {
    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-14 items-center">
                <Link href="/" className="mr-6 flex items-center space-x-2">
                    <img src="/logo.png" alt="CircleStay" className="h-8 w-8 object-contain" />
                    <span className="hidden font-bold sm:inline-block">CircleStay</span>
                </Link>
                <nav className="flex items-center space-x-6 text-sm font-medium">
                    <Link
                        href="/marketplace"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/commons"
                        className="transition-colors hover:text-foreground/80 text-foreground/60"
                    >
                        Commons
                    </Link>
                </nav>
                <div className="ml-auto flex items-center space-x-4">
                    <Link href="/trust-score">
                        <Button variant="ghost" size="sm">
                            Trust Score
                        </Button>
                    </Link>
                    <Button size="sm">Get Started</Button>
                </div>
            </div>
        </header>
    )
}
