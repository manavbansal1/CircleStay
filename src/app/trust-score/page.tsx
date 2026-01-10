"use client"

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserProfile, getUserRatings, verifyUserID } from "@/lib/firestore";
import type { UserProfile, UserRating } from "@/lib/firestore";
import { TrustScoreIndicator } from "@/components/TrustScoreIndicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Activity, CheckCircle, Clock, Shield, Star, TrendingUp, Award, ShieldCheck, Loader2 } from "lucide-react"
import styles from "./page.module.css"

export default function TrustScorePage() {
    const { user } = useAuth();
    const [profile, setProfile] = useState<UserProfile | null>(null);
    const [ratings, setRatings] = useState<UserRating[]>([]);
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        const loadData = async () => {
            if (!user) return;

            try {
                const [userProfile, userRatings] = await Promise.all([
                    getUserProfile(user.uid),
                    getUserRatings(user.uid)
                ]);

                setProfile(userProfile);
                setRatings(userRatings);
            } catch (error) {
                console.error("Error loading trust score data:", error);
            } finally {
                setLoading(false);
            }
        };

        loadData();
    }, [user]);

    const handleVerifyID = async () => {
        if (!user) return;

        setVerifying(true);
        try {
            await verifyUserID(user.uid);
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
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading your trust score...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!profile) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <p className="text-muted-foreground">Profile not found</p>
                </div>
            </ProtectedRoute>
        );
    }

    // Calculate score breakdown
    const baseScore = 50;
    const idVerificationBonus = profile.idVerified ? 20 : 0;
    const averageRating = profile.averageRating || 0;
    const ratingsCount = profile.ratingsCount || 0;
    const ratingScore = Math.round((averageRating / 5) * 30);
    const activityBonus = Math.min(ratingsCount * 2, 20);

    const getTrustLevel = (score: number) => {
        if (score >= 90) return { label: "Exceptional", color: "bg-purple-500 hover:bg-purple-600" };
        if (score >= 80) return { label: "Excellent", color: "bg-green-500 hover:bg-green-600" };
        if (score >= 70) return { label: "High Reliability", color: "bg-blue-500 hover:bg-blue-600" };
        if (score >= 60) return { label: "Good Standing", color: "bg-yellow-500 hover:bg-yellow-600" };
        return { label: "Building Trust", color: "bg-orange-500 hover:bg-orange-600" };
    };

    const trustLevel = getTrustLevel(profile.trustScore);

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.wrapper}>

                    <div className={styles.header}>
                        <h1 className={styles.title}>Your Trust Score</h1>
                        <p className={styles.subtitle}>Build reputation through verified actions and community trust</p>
                    </div>

                    {/* Hero Score Card */}
                    <div className={styles.heroCard}>
                        <TrustScoreIndicator score={profile.trustScore} />
                        <div className={styles.badges}>
                            <Badge variant="default" className={trustLevel.color}>{trustLevel.label}</Badge>
                            {profile.idVerified && (
                                <Badge variant="outline" className="border-green-500 text-green-700">
                                    <ShieldCheck className="h-3 w-3 mr-1" />
                                    ID Verified
                                </Badge>
                            )}
                        </div>
                    </div>

                    {/* Content Grid */}
                    <div className={styles.contentGrid}>
                        {/* Score Breakdown */}
                        <Card className={styles.glassCard}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <TrendingUp className="h-5 w-5 text-primary" /> Score Breakdown
                                </CardTitle>
                                <CardDescription>How your score is calculated</CardDescription>
                            </CardHeader>
                                <CardContent>
                                    <ul className={styles.activityList}>
                                        <li className={styles.activityItem}>
                                            <span className={styles.activityLabel}>
                                                <CheckCircle className="h-4 w-4 text-blue-500" /> Base Score
                                            </span>
                                            <span className={styles.activityPoints}>{baseScore} pts</span>
                                        </li>
                                        <li className={styles.activityItem}>
                                            <span className={styles.activityLabel}>
                                                {profile.idVerified ? (
                                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                                ) : (
                                                    <Clock className="h-4 w-4 text-orange-500" />
                                                )} ID Verification
                                            </span>
                                            <span className={styles.activityPoints}>
                                                {profile.idVerified ? `+${idVerificationBonus} pts` : "Pending"}
                                            </span>
                                        </li>
                                        <li className={styles.activityItem}>
                                            <span className={styles.activityLabel}>
                                                <Star className="h-4 w-4 text-yellow-500" /> 
                                                Rating Score ({averageRating.toFixed(1)}/5)
                                            </span>
                                            <span className={styles.activityPoints}>+{ratingScore} pts</span>
                                        </li>
                                        <li className={styles.activityItem}>
                                            <span className={styles.activityLabel}>
                                                <Activity className="h-4 w-4 text-purple-500" /> 
                                                Activity Bonus ({ratingsCount} ratings)
                                            </span>
                                            <span className={styles.activityPoints}>+{activityBonus} pts</span>
                                        </li>
                                    </ul>
                                    <div className="mt-4 pt-4 border-t border-border">
                                        <div className="flex justify-between items-center">
                                            <span className="font-semibold">Total Score</span>
                                            <span className="text-2xl font-bold text-primary">{profile.trustScore}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                        <div className={styles.sidebar}>
                            {/* ID Verification */}
                            {!profile.idVerified && (
                                <Card className={styles.glassCard}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Shield className="h-5 w-5 text-primary" /> Boost Your Score
                                        </CardTitle>
                                        <CardDescription>Verify your ID to increase trust</CardDescription>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-sm text-muted-foreground mb-4">
                                            ID verification adds +20 points to your trust score and shows others you're serious about building trust.
                                        </p>
                                        <Button
                                            onClick={handleVerifyID}
                                            disabled={verifying}
                                            className="w-full gap-2"
                                        >
                                            <ShieldCheck className="h-4 w-4" />
                                            {verifying ? 'Verifying...' : 'Verify Government ID'}
                                        </Button>
                                    </CardContent>
                                </Card>
                            )}

                            {/* Recent Ratings */}
                            <Card className={styles.glassCard}>
                                <CardHeader className="pb-2">
                                    <CardTitle className="text-lg flex items-center gap-2">
                                        <Award className="h-5 w-5 text-primary" /> Recent Ratings
                                    </CardTitle>
                                    <CardDescription>
                                        {profile.ratingsCount} total {profile.ratingsCount === 1 ? 'rating' : 'ratings'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    {ratings.length > 0 ? (
                                        <ul className="space-y-3">
                                            {ratings.slice(0, 5).map((rating) => (
                                                <li key={rating.id} className="flex items-start gap-3 p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-1 mb-1">
                                                            {[...Array(5)].map((_, i) => (
                                                                <Star
                                                                    key={i}
                                                                    className={`h-3 w-3 ${
                                                                        i < rating.rating
                                                                            ? "fill-yellow-400 text-yellow-400"
                                                                            : "text-gray-300"
                                                                    }`}
                                                                />
                                                            ))}
                                                        </div>
                                                        {rating.comment && (
                                                            <p className="text-xs text-muted-foreground line-clamp-2">
                                                                "{rating.comment}"
                                                            </p>
                                                        )}
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            {rating.category} • {new Date(rating.createdAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-sm text-muted-foreground text-center py-4">
                                            No ratings yet. Participate in pools and payments to build your reputation!
                                        </p>
                                    )}
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </div>
            </div>
        </ProtectedRoute>
    )
}
