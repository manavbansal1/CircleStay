"use client"

import { useEffect, useState } from 'react';
import { getAreaInsights, type AreaInsights } from '@/lib/area-insights';
import { MapPin, Train, Shield, Home, Loader2 } from 'lucide-react';
import styles from './AreaInsightsCard.module.css';

interface AreaInsightsCardProps {
    address: string;
    lat?: number;
    lng?: number;
}

export function AreaInsightsCard({ address, lat, lng }: AreaInsightsCardProps) {
    const [insights, setInsights] = useState<AreaInsights | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadInsights() {
            setLoading(true);
            const data = await getAreaInsights(address, lat, lng);
            setInsights(data);
            setLoading(false);
        }

        if (address) {
            loadInsights();
        }
    }, [address, lat, lng]);

    if (loading) {
        return (
            <div className={styles.card}>
                <div className={styles.loading}>
                    <Loader2 className="h-8 w-8 animate-spin" style={{ color: 'hsl(25, 70%, 50%)' }} />
                    <p>Analyzing area...</p>
                </div>
            </div>
        );
    }

    if (!insights || insights.error) {
        return null;
    }

    const getScoreColor = (score: number) => {
        if (score >= 80) return '#10b981'; // green
        if (score >= 60) return '#3b82f6'; // blue
        if (score >= 40) return '#f59e0b'; // orange
        return '#ef4444'; // red
    };

    const ScoreCircle = ({ score, label, icon: Icon }: { score: number; label: string; icon: any }) => (
        <div className={styles.scoreItem}>
            <div className={styles.scoreCircle} style={{ 
                background: `conic-gradient(${getScoreColor(score)} ${score * 3.6}deg, rgba(139, 92, 46, 0.1) 0deg)` 
            }}>
                <div className={styles.scoreInner}>
                    <Icon className={styles.scoreIcon} />
                    <span className={styles.scoreValue}>{score}</span>
                </div>
            </div>
            <span className={styles.scoreLabel}>{label}</span>
        </div>
    );

    return (
        <div className={styles.card}>
            <div className={styles.header}>
                <MapPin className={styles.headerIcon} />
                <h3 className={styles.title}>Area Insights</h3>
            </div>

            <p className={styles.summary}>{insights.summary}</p>

            {/* Scores */}
            <div className={styles.scoresGrid}>
                <ScoreCircle score={insights.livabilityScore} label="Livability" icon={Home} />
                <ScoreCircle score={insights.transitScore} label="Transit" icon={Train} />
                <ScoreCircle score={insights.safetyScore} label="Safety" icon={Shield} />
                <ScoreCircle score={insights.amenitiesScore} label="Amenities" icon={MapPin} />
            </div>

            {/* Score Calculation Info */}
            <div className={styles.calculationInfo}>
                <h4 className={styles.calculationTitle}>How Scores are Calculated</h4>
                <div className={styles.calculationGrid}>
                    <div className={styles.calculationItem}>
                        <strong>Livability:</strong> Based on restaurants (×2), stores (×3), parks (×4), schools (×3), and hospitals (×2) within 1.5km
                    </div>
                    <div className={styles.calculationItem}>
                        <strong>Transit:</strong> Number of transit stations (×15) within 1.5km radius
                    </div>
                    <div className={styles.calculationItem}>
                        <strong>Safety:</strong> AI-estimated based on area amenities and characteristics
                    </div>
                    <div className={styles.calculationItem}>
                        <strong>Amenities:</strong> Average of restaurants, stores, and parks (×10) within 1.5km
                    </div>
                </div>
            </div>

            {/* Attractions */}
            {insights.attractions.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Nearby Attractions</h4>
                    <ul className={styles.list}>
                        {insights.attractions.map((attraction, index) => (
                            <li key={index} className={styles.listItem}>{attraction}</li>
                        ))}
                    </ul>
                </div>
            )}

            {/* Transit */}
            {insights.transitOptions.length > 0 && (
                <div className={styles.section}>
                    <h4 className={styles.sectionTitle}>Transit Options</h4>
                    <ul className={styles.list}>
                        {insights.transitOptions.map((transit, index) => (
                            <li key={index} className={styles.listItem}>{transit}</li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
}
