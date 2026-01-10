"use client"

import { motion } from "framer-motion"

interface TrustScoreProps {
    score: number
    maxScore?: number
}

export function TrustScoreIndicator({ score, maxScore = 100 }: TrustScoreProps) {
    const percentage = (score / maxScore) * 100
    const circumference = 2 * Math.PI * 40 // radius 40

    return (
        <div className="relative flex h-48 w-48 items-center justify-center">
            <svg className="h-full w-full -rotate-90 transform">
                <circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-muted"
                />
                <motion.circle
                    cx="50%"
                    cy="50%"
                    r="40"
                    fill="transparent"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-primary"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                />
            </svg>
            <div className="absolute flex flex-col items-center">
                <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-4xl font-bold"
                >
                    {score}
                </motion.span>
                <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Trust Score</span>
            </div>
        </div>
    )
}
