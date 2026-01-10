"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { Menu, X } from "lucide-react"
import { useState } from "react"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center justify-between">
                {/* Logo */}
                <Link href="/" className="flex items-center space-x-2">
                    <img src="/logo.png" alt="CircleStay" className="h-10 w-10 object-contain" />
                    <span className="font-bold text-lg">CircleStay</span>
                </Link>

                {/* Desktop Navigation */}
                <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
                    <Link
                        href="/marketplace"
                        className="transition-colors hover:text-primary text-foreground/80"
                    >
                        Marketplace
                    </Link>
                    <Link
                        href="/commons"
                        className="transition-colors hover:text-primary text-foreground/80"
                    >
                        Commons
                    </Link>
                    <Link
                        href="/trust-score"
                        className="transition-colors hover:text-primary text-foreground/80"
                    >
                        Trust Score
                    </Link>
                </nav>

                {/* Desktop CTA */}
                <div className="hidden md:flex items-center space-x-4">
                    <Button variant="ghost" size="sm">
                        Sign In
                    </Button>
                    <Button size="sm">Get Started</Button>
                </div>

                {/* Mobile Menu Button */}
                <button
                    className="md:hidden p-2 hover:bg-secondary rounded-md transition-colors"
                    onClick={() => setIsOpen(!isOpen)}
                    aria-label="Toggle menu"
                >
                    {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                </button>
            </div>

            {/* Mobile Menu */}
            {isOpen && (
                <div className="md:hidden border-t bg-background">
                    <nav className="container flex flex-col space-y-4 py-4">
                        <Link
                            href="/marketplace"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Marketplace
                        </Link>
                        <Link
                            href="/commons"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Commons
                        </Link>
                        <Link
                            href="/trust-score"
                            className="text-sm font-medium transition-colors hover:text-primary"
                            onClick={() => setIsOpen(false)}
                        >
                            Trust Score
                        </Link>
                        <div className="flex flex-col space-y-2 pt-4 border-t">
                            <Button variant="ghost" size="sm" className="w-full">
                                Sign In
                            </Button>
                            <Button size="sm" className="w-full">
                                Get Started
                            </Button>
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
