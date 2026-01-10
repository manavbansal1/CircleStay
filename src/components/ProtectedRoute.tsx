"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
    children: React.ReactNode;
    requireProfile?: boolean;
}

export function ProtectedRoute({ children, requireProfile = false }: ProtectedRouteProps) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        if (!loading) {
            if (!user) {
                router.push('/login');
            } else {
                setChecking(false);
            }
        }
    }, [user, loading, router]);

    if (loading || checking) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                    <p className="mt-4 text-muted-foreground">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return <>{children}</>;
}
