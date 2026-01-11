"use client"

import { motion } from "framer-motion"

interface TrustScoreProps {
    score: number
    maxScore?: number
}

export function TrustScoreIndicator({ score, maxScore = 120 }: TrustScoreProps) {
    const percentage = (score / maxScore) * 100
    const radius = 70
    const strokeWidth = 12
    const circumference = 2 * Math.PI * radius

    // Dynamic color based on score
    const getScoreColor = (score: number) => {
        if (score >= 90) return { primary: '#9333ea', secondary: '#c084fc', glow: '147, 51, 234' }; // Purple
        if (score >= 80) return { primary: '#059669', secondary: '#34d399', glow: '5, 150, 105' }; // Green
        if (score >= 70) return { primary: '#8b5c2e', secondary: '#b8865f', glow: '139, 92, 46' }; // Brown
        if (score >= 60) return { primary: '#f59e0b', secondary: '#fbbf24', glow: '245, 158, 11' }; // Yellow
        return { primary: '#f97316', secondary: '#fb923c', glow: '249, 115, 22' }; // Orange
    };

    const colors = getScoreColor(score);

    return (
        <div className="relative flex items-center justify-center" style={{ width: '200px', height: '200px' }}>
            {/* Outer glow effect */}
            <div 
                className="absolute inset-0 rounded-full opacity-20 blur-xl"
                style={{
                    background: `radial-gradient(circle, rgba(${colors.glow}, 0.4) 0%, transparent 70%)`
                }}
            />
            
            {/* SVG Circle */}
            <svg className="absolute transform -rotate-90" width="200" height="200">
                <defs>
                    <linearGradient id={`scoreGradient-${score}`} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" style={{ stopColor: colors.primary, stopOpacity: 1 }} />
                        <stop offset="100%" style={{ stopColor: colors.secondary, stopOpacity: 1 }} />
                    </linearGradient>
                    <filter id="glow">
                        <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                        <feMerge>
                            <feMergeNode in="coloredBlur"/>
                            <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                    </filter>
                </defs>
                
                {/* Background circle */}
                <circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke="rgba(0, 0, 0, 0.05)"
                    strokeWidth={strokeWidth}
                />
                
                {/* Animated progress circle */}
                <motion.circle
                    cx="100"
                    cy="100"
                    r={radius}
                    fill="transparent"
                    stroke={`url(#scoreGradient-${score})`}
                    strokeWidth={strokeWidth}
                    strokeLinecap="round"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: circumference - (percentage / 100) * circumference }}
                    transition={{ duration: 2, ease: "easeInOut", delay: 0.2 }}
                    filter="url(#glow)"
                />
            </svg>

            {/* Center content */}
            <div className="absolute flex flex-col items-center justify-center">
                <motion.div
                    initial={{ scale: 0, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5, delay: 0.8, type: "spring", stiffness: 200 }}
                    className="flex flex-col items-center"
                >
                    <span 
                        className="text-6xl font-bold mb-1"
                        style={{
                            background: `linear-gradient(135deg, ${colors.primary}, ${colors.secondary})`,
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text'
                        }}
                    >
                        {score}
                    </span>
                    <span 
                        className="text-xs font-semibold uppercase tracking-widest"
                        style={{ color: colors.primary }}
                    >
                        Trust Score
                    </span>
                </motion.div>
            </div>

            {/* Floating particles effect */}
            {[...Array(3)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-2 h-2 rounded-full"
                    style={{
                        background: `radial-gradient(circle, ${colors.secondary}, transparent)`,
                        left: `${30 + i * 30}%`,
                        top: '10%'
                    }}
                    animate={{
                        y: [0, -20, 0],
                        opacity: [0.3, 0.6, 0.3],
                        scale: [1, 1.5, 1]
                    }}
                    transition={{
                        duration: 3,
                        repeat: Infinity,
                        delay: i * 0.3,
                        ease: "easeInOut"
                    }}
                />
            ))}
        </div>
    )
}
