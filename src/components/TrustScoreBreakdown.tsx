"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { CheckCircle, Clock, Star, Activity, ShieldCheck, TrendingUp } from "lucide-react"
import styles from './TrustScoreBreakdown.module.css'

interface TrustScoreBreakdownProps {
    trustScore: number;
    idVerified: boolean;
    averageRating: number;
    ratingsCount: number;
    idVerificationDate?: Date;
}

export function TrustScoreBreakdown({
    trustScore,
    idVerified,
    averageRating = 0,
    ratingsCount = 0,
    idVerificationDate
}: TrustScoreBreakdownProps) {
    // Calculate score breakdown
    const baseScore = 50;
    const idVerificationBonus = idVerified ? 20 : 0;
    const ratingScore = Math.round((averageRating / 5) * 30);
    const activityBonus = Math.min(ratingsCount * 2, 20);

    const getTrustLevel = (score: number) => {
        if (score >= 90) return { label: "Exceptional", color: "bg-gradient-to-r from-[hsl(25,55%,35%)] to-[hsl(20,70%,55%)]" };
        if (score >= 80) return { label: "Excellent", color: "bg-gradient-to-r from-[hsl(25,50%,40%)] to-[hsl(20,65%,60%)]" };
        if (score >= 70) return { label: "High Reliability", color: "bg-gradient-to-r from-[hsl(25,45%,45%)] to-[hsl(20,60%,65%)]" };
        if (score >= 60) return { label: "Good Standing", color: "bg-gradient-to-r from-[hsl(30,40%,50%)] to-[hsl(25,55%,70%)]" };
        return { label: "Building Trust", color: "bg-gradient-to-r from-[hsl(35,35%,55%)] to-[hsl(30,50%,75%)]" };
    };

    const trustLevel = getTrustLevel(trustScore);

    return (
        <Card className={styles.card}>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                        <TrendingUp className="h-5 w-5" style={{ color: 'hsl(25, 70%, 50%)' }} /> 
                        Trust Score Breakdown
                    </CardTitle>
                    <div className="flex gap-2">
                        <Badge variant="default" className={trustLevel.color}>{trustLevel.label}</Badge>
                        {idVerified && (
                            <Badge variant="outline" className="border-green-500 text-green-700">
                                <ShieldCheck className="h-3 w-3 mr-1" />
                                Verified
                            </Badge>
                        )}
                    </div>
                </div>
                <CardDescription>How this trust score is calculated</CardDescription>
            </CardHeader>
            <CardContent>
                <div className={styles.scoreDisplay}>
                    <span className={styles.scoreLabel}>Current Score</span>
                    <span className={styles.scoreValue}>{trustScore}</span>
                </div>

                <ul className={styles.breakdown}>
                    <li className={styles.breakdownItem}>
                        <span className={styles.itemLabel}>
                            <CheckCircle className="h-4 w-4 text-blue-500" /> 
                            Base Score
                        </span>
                        <span className={styles.itemPoints}>{baseScore} pts</span>
                    </li>
                    <li className={styles.breakdownItem}>
                        <span className={styles.itemLabel}>
                            {idVerified ? (
                                <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : (
                                <Clock className="h-4 w-4 text-orange-500" />
                            )} 
                            ID Verification
                        </span>
                        <span className={styles.itemPoints}>
                            {idVerified ? `+${idVerificationBonus} pts` : "Not verified"}
                        </span>
                    </li>
                    <li className={styles.breakdownItem}>
                        <span className={styles.itemLabel}>
                            <Star className="h-4 w-4 text-yellow-500" /> 
                            Rating Score ({averageRating.toFixed(1)}/5)
                        </span>
                        <span className={styles.itemPoints}>+{ratingScore} pts</span>
                    </li>
                    <li className={styles.breakdownItem}>
                        <span className={styles.itemLabel}>
                            <Activity className="h-4 w-4 text-purple-500" /> 
                            Activity Bonus ({ratingsCount} ratings)
                        </span>
                        <span className={styles.itemPoints}>+{activityBonus} pts</span>
                    </li>
                </ul>

                <div className={styles.formula}>
                    <p className={styles.formulaTitle}>Formula:</p>
                    <p className={styles.formulaText}>
                        Base (50) + ID Verification (0-20) + Ratings (0-30) + Activity (0-20)
                    </p>
                    <p className={styles.maxScore}>Maximum possible: 120 points</p>
                </div>
            </CardContent>
        </Card>
    );
}
