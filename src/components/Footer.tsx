import Link from "next/link";
import { Heart, Mail, MapPin, Twitter, Linkedin, Github } from "lucide-react";

export function Footer() {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="relative mt-auto border-t border-[rgba(139,86,60,0.15)] bg-gradient-to-b from-[rgba(255,255,255,0.7)] to-[rgba(255,248,245,0.9)] backdrop-blur-sm">
            {/* Decorative gradient orb */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-32 bg-gradient-to-r from-[rgba(139,86,60,0.1)] to-[rgba(176,130,104,0.1)] blur-3xl rounded-full" />

            <div className="container relative z-10 mx-auto px-4 max-w-7xl">
                {/* Main Footer Content */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 py-12">
                    {/* Brand Section */}
                    <div className="md:col-span-2 space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[hsl(25,45%,45%)] to-[hsl(20,60%,65%)] flex items-center justify-center shadow-lg">
                                <span className="text-white font-bold text-xl">C</span>
                            </div>
                            <span className="text-xl font-bold bg-gradient-to-r from-[hsl(25,45%,45%)] to-[hsl(20,60%,65%)] bg-clip-text text-transparent">
                                CircleStay
                            </span>
                        </div>
                        <p className="text-sm text-[hsl(25,5%,45%)] max-w-xs leading-relaxed">
                            Stop paying the Trust Tax. Find affordable, trusted housing through your social circle.
                        </p>
                        <div className="flex items-center gap-2 text-sm text-[hsl(25,5%,45%)]">
                            <MapPin className="h-4 w-4 text-[hsl(20,60%,65%)]" />
                            <span>Building the future of trusted living</span>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-[hsl(25,15%,35%)]">
                            Quick Links
                        </h3>
                        <ul className="space-y-2.5">
                            <li>
                                <Link href="/marketplace" className="text-sm text-[hsl(25,5%,45%)] hover:text-[hsl(25,45%,45%)] transition-colors hover:translate-x-1 inline-block">
                                    Marketplace
                                </Link>
                            </li>
                            <li>
                                <Link href="/commons" className="text-sm text-[hsl(25,5%,45%)] hover:text-[hsl(25,45%,45%)] transition-colors hover:translate-x-1 inline-block">
                                    Commons
                                </Link>
                            </li>
                            <li>
                                <Link href="/trust-score" className="text-sm text-[hsl(25,5%,45%)] hover:text-[hsl(25,45%,45%)] transition-colors hover:translate-x-1 inline-block">
                                    Trust Score
                                </Link>
                            </li>
                        </ul>
                    </div>

                    {/* Contact & Social */}
                    <div className="space-y-4">
                        <h3 className="font-semibold text-sm uppercase tracking-wider text-[hsl(25,15%,35%)]">
                            Connect
                        </h3>
                        <div className="space-y-3">
                            <a
                                href="mailto:hello@circlestay.com"
                                className="flex items-center gap-2 text-sm text-[hsl(25,5%,45%)] hover:text-[hsl(25,45%,45%)] transition-colors group"
                            >
                                <Mail className="h-4 w-4 group-hover:scale-110 transition-transform" />
                                <span>hello@circlestay.com</span>
                            </a>
                            <div className="flex gap-3 pt-2">
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-[rgba(139,86,60,0.08)] backdrop-blur-sm flex items-center justify-center hover:bg-gradient-to-br hover:from-[hsl(25,45%,45%)] hover:to-[hsl(20,60%,65%)] hover:text-white transition-all hover:scale-110 hover:shadow-md text-[hsl(25,15%,35%)]"
                                    aria-label="Twitter"
                                >
                                    <Twitter className="h-4 w-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-[rgba(139,86,60,0.08)] backdrop-blur-sm flex items-center justify-center hover:bg-gradient-to-br hover:from-[hsl(25,45%,45%)] hover:to-[hsl(20,60%,65%)] hover:text-white transition-all hover:scale-110 hover:shadow-md text-[hsl(25,15%,35%)]"
                                    aria-label="LinkedIn"
                                >
                                    <Linkedin className="h-4 w-4" />
                                </a>
                                <a
                                    href="#"
                                    className="w-9 h-9 rounded-lg bg-[rgba(139,86,60,0.08)] backdrop-blur-sm flex items-center justify-center hover:bg-gradient-to-br hover:from-[hsl(25,45%,45%)] hover:to-[hsl(20,60%,65%)] hover:text-white transition-all hover:scale-110 hover:shadow-md text-[hsl(25,15%,35%)]"
                                    aria-label="GitHub"
                                >
                                    <Github className="h-4 w-4" />
                                </a>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Bottom Bar */}
                <div className="border-t border-[rgba(139,86,60,0.15)] py-6">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-sm text-[hsl(25,5%,45%)]">
                            &copy; {currentYear} CircleStay Inc. All rights reserved.
                        </p>
                        <div className="flex items-center gap-1.5 text-sm text-[hsl(25,5%,45%)]">
                            <span>Made with</span>
                            <Heart className="h-4 w-4 text-[hsl(20,60%,65%)] fill-[hsl(20,60%,65%)] animate-pulse" />
                            <span>for trusted communities</span>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    );
}

