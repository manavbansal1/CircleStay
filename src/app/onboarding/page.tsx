"use client"

import { useState, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { createUserProfile } from '@/lib/firestore';
import { Button } from '@/components/Button';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import styles from './page.module.css';

export default function OnboardingPage() {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { user } = useAuth();
    const router = useRouter();

    const [formData, setFormData] = useState({
        age: '',
        location: '',
        monthlyIncome: '',
        bio: '',
        occupation: ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            if (!user) {
                throw new Error('Not authenticated');
            }

            await createUserProfile(user.uid, {
                uid: user.uid,
                email: user.email || '',
                displayName: user.displayName || '',
                photoURL: user.photoURL || undefined,
                age: parseInt(formData.age),
                location: formData.location,
                monthlyIncome: parseInt(formData.monthlyIncome),
                bio: formData.bio,
                occupation: formData.occupation,
                trustScore: 50,
                createdAt: new Date(),
                updatedAt: new Date()
            });

            router.push('/marketplace');
        } catch (err: any) {
            setError(err.message || 'Failed to create profile');
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.age || !formData.location) {
                setError('Please fill in all required fields');
                return;
            }
        }
        setError('');
        setStep(step + 1);
    };

    const prevStep = () => {
        setError('');
        setStep(step - 1);
    };

    return (
        <div className={styles.page}>
            <div className={styles.backgroundCircle1} />
            <div className={styles.backgroundCircle2} />

            <div className={styles.container}>
                <div className={styles.card}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Complete Your Profile</h1>
                        <p className={styles.subtitle}>Help us personalize your CircleStay experience</p>
                    </div>

                    <div className={styles.progress}>
                        <div className={`${styles.progressDot} ${step >= 1 ? styles.active : ''}`} />
                        <div className={`${styles.progressDot} ${step >= 2 ? styles.active : ''}`} />
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        {step === 1 && (
                            <>
                                <div className={styles.formGrid}>
                                    <div className={styles.inputGroup}>
                                        <label htmlFor="age" className={styles.label}>Age *</label>
                                        <input
                                            id="age"
                                            name="age"
                                            type="number"
                                            value={formData.age}
                                            onChange={handleChange}
                                            className={styles.input}
                                            placeholder="25"
                                            required
                                            min="18"
                                            max="100"
                                        />
                                    </div>

                                    <div className={styles.inputGroup}>
                                        <LocationAutocomplete
                                            value={formData.location}
                                            onChange={(address) => setFormData({ ...formData, location: address })}
                                            label="Location"
                                            placeholder="San Francisco, CA"
                                            className={styles.input}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="monthlyIncome" className={styles.label}>Monthly Income *</label>
                                    <input
                                        id="monthlyIncome"
                                        name="monthlyIncome"
                                        type="number"
                                        value={formData.monthlyIncome}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="5000"
                                        required
                                        min="0"
                                    />
                                </div>

                                <Button type="button" onClick={nextStep} size="lg">
                                    Continue
                                </Button>
                            </>
                        )}

                        {step === 2 && (
                            <>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="occupation" className={styles.label}>Occupation</label>
                                    <input
                                        id="occupation"
                                        name="occupation"
                                        type="text"
                                        value={formData.occupation}
                                        onChange={handleChange}
                                        className={styles.input}
                                        placeholder="Software Engineer"
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="bio" className={styles.label}>Bio</label>
                                    <textarea
                                        id="bio"
                                        name="bio"
                                        value={formData.bio}
                                        onChange={handleChange}
                                        className={styles.textarea}
                                        placeholder="Tell us a bit about yourself..."
                                    />
                                </div>

                                <div className="flex gap-4">
                                    <Button type="button" variant="outline" onClick={prevStep} size="lg" className="flex-1">
                                        Back
                                    </Button>
                                    <Button type="submit" disabled={loading} size="lg" className="flex-1">
                                        {loading ? 'Creating profile...' : 'Complete'}
                                    </Button>
                                </div>
                            </>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
