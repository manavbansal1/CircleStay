"use client"

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getUserProfile, getUserListings } from '@/lib/firestore';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Button } from '@/components/Button';
import { MapPin, Briefcase, DollarSign, User } from 'lucide-react';
import type { UserProfile, Listing } from '@/lib/firestore';
import styles from './page.module.css';

export default function PublicProfilePage() {
    const params = useParams();
    const router = useRouter();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [listings, setListings] = useState<Listing[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadProfile() {
            if (!params.id || typeof params.id !== 'string') return;

            try {
                const userProfile = await getUserProfile(params.id);
                setProfile(userProfile);

                const userListings = await getUserListings(params.id);
                setListings(userListings);
            } catch (error) {
                console.error('Error loading profile:', error);
            } finally {
                setLoading(false);
            }
        }

        loadProfile();
    }, [params.id]);

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
                                <Button onClick={() => router.push('/marketplace')}>
                                    Back to Marketplace
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

                                {profile.bio && (
                                    <p className={styles.bio}>{profile.bio}</p>
                                )}

                                <div className={styles.stats}>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Trust Score</span>
                                        <span className={styles.statValue}>{profile.trustScore}</span>
                                    </div>
                                    <div className={styles.stat}>
                                        <span className={styles.statLabel}>Listings</span>
                                        <span className={styles.statValue}>{listings.length}</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Personal Information */}
                    <div className={styles.section}>
                        <h2 className={styles.sectionTitle}>About</h2>

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

                    {/* Listings */}
                    {listings.length > 0 && (
                        <div className={styles.section}>
                            <h2 className={styles.sectionTitle}>Listings</h2>
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
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    );
}
