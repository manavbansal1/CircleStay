"use client"

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/lib/firestore';
import { Button } from '@/components/Button';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import styles from '../login/page.module.css';

export default function SignupPage() {
    const [step, setStep] = useState(1);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [displayName, setDisplayName] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [occupation, setOccupation] = useState('');
    const [bio, setBio] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { signUp } = useAuth();
    const router = useRouter();

    const handleNext = () => {
        if (step === 1) {
            if (!email || !password || !displayName) {
                setError('Please fill in all required fields');
                return;
            }
            if (password.length < 6) {
                setError('Password must be at least 6 characters');
                return;
            }
        }
        if (step === 2) {
            if (!age || !location || !monthlyIncome) {
                setError('Please fill in all required fields');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const handleBack = () => {
        setError('');
        setStep(step - 1);
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await signUp(email, password, displayName);

            // Get the user from Firebase auth (it's now set in the context)
            // We need to wait a moment for the auth state to update
            setTimeout(async () => {
                const user = (await import('firebase/auth')).getAuth().currentUser;
                if (user) {
                    await createUserProfile(user.uid, {
                        uid: user.uid,
                        email: user.email || '',
                        displayName: displayName,
                        photoURL: photoURL || undefined,
                        age: parseInt(age),
                        location: location,
                        monthlyIncome: parseInt(monthlyIncome),
                        occupation: occupation,
                        bio: bio,
                        trustScore: 50,
                        createdAt: new Date(),
                        updatedAt: new Date()
                    });
                }
                router.push('/marketplace');
            }, 1000);
        } catch (err: any) {
            setError(err.message || 'Failed to create account');
            setLoading(false);
        }
    };

    return (
        <div className={styles.page}>
            <div className={styles.backgroundCircle1} />
            <div className={styles.backgroundCircle2} />

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <img src="/logo.png" alt="CircleStay" className={styles.logo} />
                        <h1 className={styles.title}>Join CircleStay</h1>
                        <p className={styles.subtitle}>
                            {step === 1 && 'Create your account'}
                            {step === 2 && 'Tell us about yourself'}
                            {step === 3 && 'Almost done!'}
                        </p>
                    </div>

                    {/* Progress indicator */}
                    <div className="flex gap-2 mb-6">
                        <div className={`flex-1 h-1 rounded-full ${step >= 1 ? 'bg-primary' : 'bg-secondary'}`} />
                        <div className={`flex-1 h-1 rounded-full ${step >= 2 ? 'bg-primary' : 'bg-secondary'}`} />
                        <div className={`flex-1 h-1 rounded-full ${step >= 3 ? 'bg-primary' : 'bg-secondary'}`} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        {/* Step 1: Account Info */}
                        {step === 1 && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="name" className={styles.label}>Full Name *</label>
                                    <input
                                        id="name"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className={styles.input}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="email" className={styles.label}>Email *</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={styles.input}
                                        placeholder="you@example.com"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="password" className={styles.label}>Password *</label>
                                    <input
                                        id="password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                        placeholder="••••••••"
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className={styles.submitButton}
                                    size="lg"
                                >
                                    Continue
                                </Button>
                            </>
                        )}

                        {/* Step 2: Personal Info */}
                        {step === 2 && (
                            <>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="age" className={styles.label}>Age *</label>
                                        <input
                                            id="age"
                                            type="number"
                                            value={age}
                                            onChange={(e) => setAge(e.target.value)}
                                            className={styles.input}
                                            placeholder="25"
                                            required
                                            min="18"
                                            max="100"
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <label htmlFor="location" className={styles.label}>Location *</label>
                                        <input
                                            id="location"
                                            type="text"
                                            value={location}
                                            onChange={(e) => setLocation(e.target.value)}
                                            className={styles.input}
                                            placeholder="San Francisco, CA"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="monthlyIncome" className={styles.label}>Monthly Income *</label>
                                    <input
                                        id="monthlyIncome"
                                        type="number"
                                        value={monthlyIncome}
                                        onChange={(e) => setMonthlyIncome(e.target.value)}
                                        className={styles.input}
                                        placeholder="5000"
                                        required
                                        min="0"
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        size="lg"
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="button"
                                        onClick={handleNext}
                                        size="lg"
                                        className="flex-1"
                                    >
                                        Continue
                                    </Button>
                                </div>
                            </>
                        )}

                        {/* Step 3: Additional Info */}
                        {step === 3 && (
                            <>
                                <div className="flex justify-center mb-4">
                                    <ProfileImageUpload
                                        value={photoURL}
                                        onChange={setPhotoURL}
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="occupation" className={styles.label}>Occupation</label>
                                    <input
                                        id="occupation"
                                        type="text"
                                        value={occupation}
                                        onChange={(e) => setOccupation(e.target.value)}
                                        className={styles.input}
                                        placeholder="Software Engineer"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="bio" className={styles.label}>Bio</label>
                                    <textarea
                                        id="bio"
                                        value={bio}
                                        onChange={(e) => setBio(e.target.value)}
                                        className={styles.input}
                                        placeholder="Tell us a bit about yourself..."
                                        rows={4}
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={handleBack}
                                        size="lg"
                                        className="flex-1"
                                    >
                                        Back
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={loading}
                                        size="lg"
                                        className="flex-1"
                                    >
                                        {loading ? 'Creating account...' : 'Complete Signup'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>

                    <div className={styles.footer}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.link}>
                            Sign in
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
