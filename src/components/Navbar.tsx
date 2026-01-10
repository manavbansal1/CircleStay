"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import Image from "next/image";
import { Button } from "@/components/Button";
import { User, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useRouter } from "next/navigation";
import { NotificationCenter } from "@/components/NotificationCenter";
import "./Navbar.css";

const links = [
    { name: "Marketplace", href: "/marketplace" },
    { name: "Commons", href: "/commons" },
    { name: "Trust Score", href: "/trust-score" },
];

const LOGO_PATH: string = "/logo.png";

export function Navbar() {
    const pathname = usePathname();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const { user, signOut, loading } = useAuth();
    const router = useRouter();

    const handleSignOut = async () => {
        try {
            await signOut();
            router.push("/");
        } catch (error) {
            console.error("Sign out error:", error);
        }
    };

    // Handle scroll effect for enhanced shadow
    useEffect(() => {
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // Close mobile menu when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            const target = event.target as HTMLElement;
            if (isMobileMenuOpen && !target.closest(".navbar-glass")) {
                setIsMobileMenuOpen(false);
            }
        };

        if (isMobileMenuOpen) {
            document.addEventListener("click", handleClickOutside);
        }

        return () => document.removeEventListener("click", handleClickOutside);
    }, [isMobileMenuOpen]);

    // Prevent body scroll when mobile menu is open
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }

        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    return (
        <nav
            className={`navbar-glass sticky top-0 z-50 ${isScrolled ? "scrolled has-shadow" : ""
                }`}
        >
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Logo Section */}
                    <Link
                        href="/"
                        className="logo-container"
                        onClick={() => setIsMobileMenuOpen(false)}
                    >
                        <div className="logo-image">
                            <Image
                                src={LOGO_PATH}
                                alt="CircleStay Logo"
                                width={44}
                                height={44}
                                className="object-contain"
                                priority
                            />
                        </div>
                        <span className="logo-text">CircleStay</span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1.5">
                        {links.map((link) => (
                            <Link
                                key={link.href}
                                href={link.href}
                                className={`nav-link ${pathname === link.href
                                        ? "nav-link-active"
                                        : "nav-link-inactive"
                                    }`}
                            >
                                {link.name}
                            </Link>
                        ))}
                    </div>

                    {/* Desktop CTA */}
                    <div className="hidden md:flex items-center space-x-4">
                        {loading ? (
                            <div className="h-9 w-24 bg-secondary animate-pulse rounded-md" />
                        ) : user ? (
                            <>
                                <NotificationCenter />
                                <Link href="/profile">
                                    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                                        <User className="h-4 w-4" />
                                        <span className="text-sm font-medium">
                                            {user.displayName || user.email}
                                        </span>
                                    </div>
                                </Link>
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
                        onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        className={`md:hidden mobile-menu-btn ${isMobileMenuOpen ? "open" : ""
                            }`}
                        aria-label="Toggle navigation menu"
                        aria-expanded={isMobileMenuOpen}
                    >
                        <span className="hamburger-line hamburger-line-1" />
                        <span className="hamburger-line hamburger-line-2" />
                        <span className="hamburger-line hamburger-line-3" />
                    </button>
                </div>

                {/* Mobile Navigation Dropdown */}
                {isMobileMenuOpen && (
                    <div className="md:hidden mobile-nav-container">
                        <div className="mobile-nav-menu space-y-2">
                            {links.map((link) => (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className={`mobile-nav-link ${pathname === link.href
                                            ? "mobile-nav-link-active"
                                            : "mobile-nav-link-inactive"
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            ))}
                            <div className="user-profile-section space-y-2 mx-2">
                                {user ? (
                                    <>
                                        <Link href="/profile" onClick={() => setIsMobileMenuOpen(false)}>
                                            <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-secondary/50 hover:bg-secondary transition-colors cursor-pointer">
                                                <User className="h-4 w-4" />
                                                <span className="text-sm font-medium">
                                                    {user.displayName || user.email}
                                                </span>
                                            </div>
                                        </Link>
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="w-full"
                                            onClick={handleSignOut}
                                        >
                                            <LogOut className="h-4 w-4 mr-2" />
                                            Sign Out
                                        </Button>
                                    </>
                                ) : (
                                    <>
                                        <Link
                                            href="/login"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Button variant="ghost" size="sm" className="w-full">
                                                Sign In
                                            </Button>
                                        </Link>
                                        <Link
                                            href="/signup"
                                            onClick={() => setIsMobileMenuOpen(false)}
                                        >
                                            <Button size="sm" className="w-full">
                                                Get Started
                                            </Button>
                                        </Link>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </nav>
    );
}
