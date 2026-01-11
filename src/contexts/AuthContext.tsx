"use client"

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import {
    signInWithEmailAndPassword,
    createUserWithEmailAndPassword,
    signOut as firebaseSignOut,
    onAuthStateChanged,
    User as FirebaseUser,
    updateProfile
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { api } from '@/lib/api';
import { getUserProfile } from '@/lib/firestore';

interface User {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    signUp: (email: string, password: string, displayName?: string) => Promise<void>;
    signIn: (email: string, password: string) => Promise<void>;
    signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                // Fetch user profile from Firestore to get the latest photoURL and displayName
                try {
                    const userProfile = await getUserProfile(firebaseUser.uid);
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: userProfile?.displayName || firebaseUser.displayName,
                        photoURL: userProfile?.photoURL || firebaseUser.photoURL,
                    });
                } catch (error) {
                    console.error('Error fetching user profile:', error);
                    // Fallback to Firebase Auth data
                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        displayName: firebaseUser.displayName,
                        photoURL: firebaseUser.photoURL,
                    });
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return unsubscribe;
    }, []);

    const signUp = async (email: string, password: string, displayName?: string) => {
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, email, password);

            if (displayName && userCredential.user) {
                await updateProfile(userCredential.user, { displayName });
            }

            const idToken = await userCredential.user.getIdToken();
            await api.login(idToken);

            // Note: User will be redirected to onboarding from signup page
        } catch (error: any) {
            console.error('Signup error:', error);
            throw new Error(error.message || 'Failed to sign up');
        }
    };

    const signIn = async (email: string, password: string) => {
        try {
            const userCredential = await signInWithEmailAndPassword(auth, email, password);
            const idToken = await userCredential.user.getIdToken();
            await api.login(idToken);
        } catch (error: any) {
            console.error('Sign in error:', error);
            throw new Error(error.message || 'Failed to sign in');
        }
    };

    const signOut = async () => {
        try {
            await api.logout();
            await firebaseSignOut(auth);
        } catch (error: any) {
            console.error('Sign out error:', error);
            throw new Error(error.message || 'Failed to sign out');
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, signUp, signIn, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
