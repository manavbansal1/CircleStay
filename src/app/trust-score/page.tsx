"use client"

import { TrustScoreIndicator } from "@/components/TrustScoreIndicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Activity, CheckCircle, Clock } from "lucide-react"
import styles from "./page.module.css"

export default function TrustScorePage() {
    return (
        <div className={styles.page}>
            <div className={styles.wrapper}>

                <div className={styles.header}>
                    <h1 className={styles.title}>Your Reputation</h1>
                    <p className={styles.subtitle}>Portable trust built on real actions.</p>
                </div>

                <div className={styles.grid}>
                    <div className={styles.scoreCard}>
                        <TrustScoreIndicator score={85} />
                        <div className={styles.badges}>
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">High Reliability</Badge>
                            <Badge variant="outline">Top 10%</Badge>
                        </div>
                    </div>

                    <div className={styles.sidebar}>
                        <Card className={styles.glassCard}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className={styles.activityList}>
                                    <li className={styles.activityItem}>
                                        <span className={styles.activityLabel}>
                                            <CheckCircle className="h-4 w-4 text-green-500" /> Rent Paid on Time
                                        </span>
                                        <span className={styles.activityPoints}>+5 pts</span>
                                    </li>
                                    <li className={styles.activityItem}>
                                        <span className={styles.activityLabel}>
                                            <CheckCircle className="h-4 w-4 text-green-500" /> Commons Contribution
                                        </span>
                                        <span className={styles.activityPoints}>+2 pts</span>
                                    </li>
                                    <li className={styles.activityItem}>
                                        <span className={styles.activityLabel}>
                                            <Clock className="h-4 w-4 text-orange-500" /> Profile Verification
                                        </span>
                                        <span className={styles.activityPoints}>Pending</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card className={styles.glassCard}>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UsersIcon /> Network Vouch
                                </CardTitle>
                                <CardDescription>People who vouched for you</CardDescription>
                            </CardHeader>
                            <CardContent className={styles.avatarGroup}>
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-400" />
                                ))}
                                <div className={styles.avatarMore}>
                                    +12
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    )
}

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
