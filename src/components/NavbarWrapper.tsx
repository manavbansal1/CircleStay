"use client"

import { useAuth } from "@/contexts/AuthContext";
import { Navbar } from "./Navbar";

export function NavbarWrapper() {
    const { user, loading } = useAuth();

    if (loading) return null;
    if (!user) return null;

    return <Navbar />;
}
