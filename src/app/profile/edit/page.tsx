"use client"

import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, updateUserProfile } from '@/lib/firestore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { LocationAutocomplete } from '@/components/LocationAutocomplete';
import type { UserProfile } from '@/lib/firestore';
import styles from './page.module.css';

export default function EditProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const [displayName, setDisplayName] = useState('');
    const [photoURL, setPhotoURL] = useState('');
    const [age, setAge] = useState('');
    const [location, setLocation] = useState('');
    const [monthlyIncome, setMonthlyIncome] = useState('');
    const [occupation, setOccupation] = useState('');
    const [bio, setBio] = useState('');

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                const profile = await getUserProfile(user.uid);
                if (profile) {
                    setDisplayName(profile.displayName || '');
                    setPhotoURL(profile.photoURL || '');
                    setAge(profile.age?.toString() || '');
                    setLocation(profile.location || '');
                    setMonthlyIncome(profile.monthlyIncome?.toString() || '');
                    setOccupation(profile.occupation || '');
                    setBio(profile.bio || '');
                }
            } catch (error) {
                console.error('Error loading profile:', error);
                setError('Failed to load profile');
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user]);

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setSaving(true);

        if (!user) {
            setError('Not authenticated');
            setSaving(false);
            return;
        }

        try {
            await updateUserProfile(user.uid, {
                displayName,
                photoURL: photoURL || undefined,
                age: age ? parseInt(age) : undefined,
                location,
                monthlyIncome: monthlyIncome ? parseInt(monthlyIncome) : undefined,
                occupation,
                bio
            });

            setSuccess('Profile updated successfully!');
            setTimeout(() => {
                router.push('/profile');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className={styles.header}>
                        <h1 className={styles.title}>Edit Profile</h1>
                        <p className={styles.subtitle}>Update your personal information</p>
                    </div>

                    <form onSubmit={handleSubmit} className={styles.form}>
                        {error && (
                            <div className={styles.error}>
                                {error}
                            </div>
                        )}

                        {success && (
                            <div className={styles.success}>
                                {success}
                            </div>
                        )}

                        {/* Profile Photo */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Profile Photo</h2>
                            <div className={styles.photoSection}>
                                <ProfileImageUpload
                                    value={photoURL}
                                    onChange={setPhotoURL}
                                />
                            </div>
                        </div>

                        {/* Basic Information */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Basic Information</h2>
                            <div className={styles.grid}>
                                <div className={styles.inputGroup}>
                                    <label htmlFor="displayName" className={styles.label}>Display Name *</label>
                                    <input
                                        id="displayName"
                                        type="text"
                                        value={displayName}
                                        onChange={(e) => setDisplayName(e.target.value)}
                                        className={styles.input}
                                        placeholder="John Doe"
                                        required
                                    />
                                </div>

                                <div className={styles.inputGroup}>
                                    <label htmlFor="age" className={styles.label}>Age</label>
                                    <input
                                        id="age"
                                        type="number"
                                        value={age}
                                        onChange={(e) => setAge(e.target.value)}
                                        className={styles.input}
                                        placeholder="25"
                                        min="18"
                                        max="100"
                                    />
                                </div>
                            </div>

                            <div className={styles.inputGroup}>
                                <LocationAutocomplete
                                    value={location}
                                    onChange={(address) => setLocation(address)}
                                    label="Location"
                                    placeholder="San Francisco, CA"
                                    className={styles.input}
                                />
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Professional Information</h2>
                            <div className={styles.grid}>
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
                                    <label htmlFor="monthlyIncome" className={styles.label}>Monthly Income</label>
                                    <input
                                        id="monthlyIncome"
                                        type="number"
                                        value={monthlyIncome}
                                        onChange={(e) => setMonthlyIncome(e.target.value)}
                                        className={styles.input}
                                        placeholder="5000"
                                        min="0"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* About */}
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>About</h2>
                            <div className={styles.inputGroup}>
                                <label htmlFor="bio" className={styles.label}>Bio</label>
                                <textarea
                                    id="bio"
                                    value={bio}
                                    onChange={(e) => setBio(e.target.value)}
                                    className={styles.textarea}
                                    placeholder="Tell us about yourself..."
                                />
                            </div>
                        </div>

                        <div className={styles.actions}>
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => router.push('/profile')}
                                className="flex-1"
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                disabled={saving}
                                className="flex-1"
                            >
                                {saving ? 'Saving...' : 'Save Changes'}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </ProtectedRoute>
    );
}
