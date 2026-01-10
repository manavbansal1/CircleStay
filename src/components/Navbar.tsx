"use client"

import Link from "next/link"
import { Button } from "@/components/Button"
import { Menu, X, User, LogOut } from "lucide-react"
import { useState } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false)
    const { user, signOut, loading } = useAuth()
    const router = useRouter()

    const handleSignOut = async () => {
        try {
            await signOut()
            router.push('/')
        } catch (error) {
            console.error('Sign out error:', error)
        }
    }

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
                    {loading ? (
                        <div className="h-9 w-24 bg-secondary animate-pulse rounded-md" />
                    ) : user ? (
                        <>
                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                                <User className="h-4 w-4" />
                                <span className="text-sm font-medium">{user.displayName || user.email}</span>
                            </div>
                            <Button variant="ghost" size="sm" onClick={handleSignOut}>
                                <LogOut className="h-4 w-4 mr-2" />
                                Sign Out
                            </Button>
                        </>
                    ) : (
                        <>
                            <Link href="/login">
                                <Button variant="ghost" size="sm">
                                    Sign In
                                </Button>
                            </Link>
                            <Link href="/signup">
                                <Button size="sm">Get Started</Button>
                            </Link>
                        </>
                    )}
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
                            {user ? (
                                <>
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-medium">{user.displayName || user.email}</span>
                                    </div>
                                    <Button variant="ghost" size="sm" className="w-full" onClick={handleSignOut}>
                                        <LogOut className="h-4 w-4 mr-2" />
                                        Sign Out
                                    </Button>
                                </>
                            ) : (
                                <>
                                    <Link href="/login" onClick={() => setIsOpen(false)}>
                                        <Button variant="ghost" size="sm" className="w-full">
                                            Sign In
                                        </Button>
                                    </Link>
                                    <Link href="/signup" onClick={() => setIsOpen(false)}>
                                        <Button size="sm" className="w-full">
                                            Get Started
                                        </Button>
                                    </Link>
                                </>
                            )}
                        </div>
                    </nav>
                </div>
            )}
        </header>
    )
}
