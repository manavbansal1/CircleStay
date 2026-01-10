"use client"

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { getUserProfile, getUserListings, verifyUserID } from '@/lib/firestore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { ProfileImageUpload } from '@/components/ProfileImageUpload';
import { Edit, MapPin, Briefcase, DollarSign, ShieldCheck, Star } from 'lucide-react';
import type { UserProfile, Listing } from '@/lib/firestore';
import styles from './page.module.css';

export default function ProfilePage() {
    const { user } = useAuth();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        async function loadProfile() {
            if (!user) return;

            try {
                const userProfile = await getUserProfile(user.uid);
                setProfile(userProfile);

                const userListings = await getUserListings(user.uid);
                setListings(userListings);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [user]);
const handleVerifyID = async () => {
        if (!user) return;

        setVerifying(true);
        try {
            // Mock ID verification - in production this would be a real verification process
            await verifyUserID(user.uid);
            
            // Reload profile to show updated verification status
            const updatedProfile = await getUserProfile(user.uid);
            setProfile(updatedProfile);
            
            alert('ID Verification Successful! Your trust score has been updated.');
        } catch (error) {
            console.error('Error verifying ID:', error);
            alert('Failed to verify ID. Please try again.');
        } finally {
            setVerifying(false);
        }
    };

    
    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                        <p className="mt-4 text-muted-foreground">Loading profile...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!profile) {
        return (
            <ProtectedRoute>
                <div className={styles.page}>
                    <div className={styles.container}>
                        <div className={styles.section}>
                            <div className={styles.emptyState}>
                                <h2 className="text-2xl font-bold mb-4">Profile Not Found</h2>
                                <p className="mb-4">It looks like you haven't completed your profile yet.</p>
                                <Button onClick={() => router.push('/onboarding')}>
                                    Complete Profile
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.container}>
                    {/* Profile Header */}
                    <div className={styles.header}>
                        <div className={styles.profileHeader}>
                            <div className={styles.profileImage}>
                                <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-border">
                                    {profile.photoURL ? (
                                        <img
                                            src={profile.photoURL}
                                            alt={profile.displayName}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="w-full h-full bg-secondary flex items-center justify-center">
                                            <span className="text-4xl font-bold text-muted-foreground">
                                                {profile.displayName.charAt(0).toUpperCase()}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className={styles.profileInfo}>
                                <h1 className={styles.name}>{profile.displayName}</h1>
                                <p className={styles.email}>{profile.email}</p>

                                {profile.bio && (
                                    <p className={styles.bio}>{profile.bio}</p>
                                )}

                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Trust Score</span>
                                        <span className={styles.statValue}>{profile.trustScore}</span>
                                    </div>
                                    {profile.averageRating > 0 && (
                                        <div className={styles.stat}>
                                            <span className={styles.statLabel}>Rating</span>
                                            <span className={styles.statValue}>
                                                <Star className="inline h-4 w-4 fill-yellow-400 text-yellow-400 mr-1" />
                                                {profile.averageRating.toFixed(1)} ({profile.ratingsCount})
                                            </span>
                                        </div>
                                    )}
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Listings</span>
                                        <span className={styles.statValue}>{listings.length}</span>
                                    </div>
                                </div>

                                {/* ID Verification */}
                                <div className="mt-4">
                                    {profile.idVerified ? (
                                        <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-500/10 border border-green-500/30">
                                            <ShieldCheck className="h-5 w-5 text-green-500" />
                                            <span className="text-sm font-medium text-green-700">ID Verified</span>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={handleVerifyID}
                                            disabled={verifying}
                                            variant="outline"
                                            className="gap-2 w-full"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            {verifying ? 'Verifying...' : 'Verify Government ID (+20 Trust Score)'}
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>Personal Information</h2>
                            <Button
                                variant="outline"
                                size="sm"
                                className="gap-2"
                                onClick={() => router.push('/profile/edit')}
                            >
                                <Edit className="h-4 w-4" />
                                Edit Profile
                            </Button>
                        </div>

                        <div className={styles.infoGrid}>
                            {profile.age && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>Age</span>
                                    <span className={styles.infoValue}>{profile.age} years old</span>
                                </div>
                            )}

                            {profile.location && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        <MapPin className="inline h-4 w-4 mr-1" />
                                        Location
                                    </span>
                                    <span className={styles.infoValue}>{profile.location}</span>
                                </div>
                            )}

                            {profile.occupation && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        <Briefcase className="inline h-4 w-4 mr-1" />
                                        Occupation
                                    </span>
                                    <span className={styles.infoValue}>{profile.occupation}</span>
                                </div>
                            )}

                            {profile.monthlyIncome && (
                                <div className={styles.infoItem}>
                                    <span className={styles.infoLabel}>
                                        <DollarSign className="inline h-4 w-4 mr-1" />
                                        Monthly Income
                                    </span>
                                    <span className={styles.infoValue}>${profile.monthlyIncome.toLocaleString()}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* My Listings */}
                    <div className={styles.section}>
                        <div className={styles.sectionHeader}>
                            <h2 className={styles.sectionTitle}>My Listings</h2>
                            <Button onClick={() => router.push('/listings/create')} size="sm">
                                Create Listing
                            </Button>
                        </div>

                        {listings.length > 0 ? (
                            <div className="grid gap-4 md:grid-cols-2">
                                {listings.map((listing) => (
                                    <div
                                        key={listing.id}
                                        className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                                        onClick={() => router.push(`/listings/${listing.id}`)}
                                    >
                                        {listing.images[0] && (
                                            <img
                                                src={listing.images[0]}
                                                alt={listing.title}
                                                className="w-full h-48 object-cover rounded-lg mb-3"
                                            />
                                        )}
                                        <h3 className="font-semibold text-lg mb-2">{listing.title}</h3>
                                        <p className="text-sm text-muted-foreground mb-2">{listing.location}</p>
                                        <p className="font-bold text-primary">${listing.price}/month</p>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className={styles.emptyState}>
                                <p>You haven't created any listings yet.</p>
                                <Button
                                    onClick={() => router.push('/listings/create')}
                                    className="mt-4"
                                >
                                    Create Your First Listing
                                </Button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    );
}
