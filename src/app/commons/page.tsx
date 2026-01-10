"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Avatar } from "@/components/Avatar"
import { Plus, Wifi, ShoppingBag, Tv, Music } from "lucide-react"
import styles from "./page.module.css"

const pools = [
    {
        id: 1,
        name: "Household Essentials (Costco)",
        icon: ShoppingBag,
        totalCost: 60,
        members: [
            { name: "You", image: null },
            { name: "Sarah", image: "https://images.unsplash.com/photo-1596276020587-8044fe049813?w=100" },
            { name: "David", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100" }
        ],
        maxMembers: 4,
        status: "Active",
        nextPayment: "Feb 1st"
    },
    {
        id: 2,
        name: "Gigabit Internet",
        icon: Wifi,
        totalCost: 80,
        members: [
            { name: "You", image: null },
            { name: "Mike", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        ],
        maxMembers: 4,
        status: "Active",
        nextPayment: "Feb 1st"
    },
    {
        id: 3,
        name: "Netflix Premium",
        icon: Tv,
        totalCost: 23,
        members: [
            { name: "Elena", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
        ],
        maxMembers: 4,
        status: "Open Spot",
        nextPayment: "Jan 15th"
    },
    {
        id: 4,
        name: "Spotify Family",
        icon: Music,
        totalCost: 17,
        members: [
            { name: "Marcus", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
            { name: "You", image: null }
        ],
        maxMembers: 6,
        status: "Active",
        nextPayment: "Feb 5th"
    }
]

export default function CommonsPage() {
    return (
        <div className={styles.page}>
            <div className={styles.wrapper}>
                <div className={styles.header}>
                    <div className={styles.headerText}>
                        <h1>Commons Pool</h1>
                        <p>Automated cost splitting for your circle.</p>
                    </div>
                    <Button className="gap-2 shadow-lg">
                        <Plus className="h-4 w-4" /> New Pool
                    </Button>
                </div>

                <div className={styles.grid}>
                    {pools.map((pool) => (
                        <div key={pool.id} className={styles.poolCard}>
                            <div className={styles.poolHeader}>
                                <div className={styles.poolTitle}>
                                    {pool.name}
                                </div>
                                <pool.icon className={styles.poolIcon} />
                            </div>
                            <div className={styles.poolContent}>
                                <div>
                                    <span className={styles.poolPrice}>
                                        ${(pool.totalCost / pool.members.length).toFixed(2)}
                                    </span>
                                    <span className={styles.poolPriceUnit}>/mo per person</span>
                                    <p className={styles.poolDetails}>
                                        Total: ${pool.totalCost}/mo • Next: {pool.nextPayment}
                                    </p>
                                </div>

                                <div className={styles.membersSection}>
                                    <div className={styles.membersLabel}>Members ({pool.members.length}/{pool.maxMembers})</div>
                                    <div className={styles.membersGrid}>
                                        {pool.members.map((member, i) => (
                                            <Avatar key={i} src={member.image || undefined} fallback={member.name[0]} className="border-2 border-background" />
                                        ))}
                                        {Array.from({ length: pool.maxMembers - pool.members.length }).map((_, i) => (
                                            <div key={`empty-${i}`} className={styles.emptySlot}>
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className={styles.poolActions}>
                                    <Button variant={pool.status === "Open Spot" ? "default" : "outline"} className="w-full">
                                        {pool.status === "Open Spot" ? "Join Pool" : "Manage"}
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
