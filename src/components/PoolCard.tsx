"use client";

import { Card, CardContent } from "./Card";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Users, Plus, DollarSign } from "lucide-react";
import Link from "next/link";
import type { Pool } from "@/lib/firestore-pools";
import { getUserProfile } from "@/lib/firestore";
import { useState, useEffect } from "react";

interface PoolCardProps {
    pool: Pool;
    userBalance?: number;
    onAddBill?: () => void;
}

const iconMap: Record<string, any> = {
    users: Users,
    home: require("lucide-react").Home,
    wifi: require("lucide-react").Wifi,
    shopping: require("lucide-react").ShoppingBag,
    tv: require("lucide-react").Tv,
    music: require("lucide-react").Music,
    coffee: require("lucide-react").Coffee,
    car: require("lucide-react").Car,
    utilities: require("lucide-react").Zap,
};

export function PoolCard({ pool, userBalance = 0, onAddBill }: PoolCardProps) {
    const [memberNames, setMemberNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const loadMemberNames = async () => {
            const names: Record<string, string> = {};
            for (const memberId of pool.memberIds.slice(0, 4)) { // Load first 4 for display
                const profile = await getUserProfile(memberId);
                names[memberId] = profile?.displayName || profile?.email || "?";
            }
            setMemberNames(names);
            setLoading(false);
        };
        loadMemberNames();
    }, [pool.memberIds]);

    const IconComponent = pool.icon ? iconMap[pool.icon] || Users : Users;
    const hasOpenSpots = pool.memberIds.length < 10;

    return (
        <Card className="group overflow-hidden">
            <CardContent className="p-6">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-start gap-3 flex-1">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center flex-shrink-0">
                            <IconComponent className="h-6 w-6 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
                                {pool.name}
                            </h3>
                            {pool.description && (
                                <p className="text-sm text-muted-foreground line-clamp-1 mt-0.5">
                                    {pool.description}
                                </p>
                            )}
                            {pool.category && (
                                <span className="inline-block mt-2 text-xs px-2 py-1 rounded-full bg-secondary/50 text-muted-foreground">
                                    {pool.category}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Balance */}
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-secondary/30 to-secondary/10">
                    <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">Your Balance</span>
                        <div className="flex items-center gap-1">
                            <DollarSign className={`h-4 w-4 ${userBalance > 0 ? 'text-green-500' : userBalance < 0 ? 'text-destructive' : 'text-muted-foreground'}`} />
                            <span className={`font-bold text-lg ${userBalance > 0 ? 'text-green-500' : userBalance < 0 ? 'text-destructive' : 'text-foreground'}`}>
                                {Math.abs(userBalance).toFixed(2)}
                            </span>
                        </div>
                    </div>
                    {userBalance !== 0 && (
                        <p className="text-xs text-muted-foreground mt-1">
                            {userBalance > 0 ? "You are owed" : "You owe"}
                        </p>
                    )}
                </div>

                {/* Members */}
                <div className="mb-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-muted-foreground">
                            Members ({pool.memberIds.length}/10)
                        </span>
                        {hasOpenSpots && (
                            <span className="text-xs px-2 py-1 rounded-full bg-accent/10 text-accent">
                                {10 - pool.memberIds.length} spots open
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-1">
                        {pool.memberIds.slice(0, 4).map((memberId, index) => (
                            <Avatar
                                key={memberId}
                                src={undefined}
                                alt={memberNames[memberId] || "Member"}
                                className="h-8 w-8 border-2 border-background"
                            />
                        ))}
                        {pool.memberIds.length > 4 && (
                            <div className="h-8 w-8 rounded-full bg-secondary/50 border-2 border-background flex items-center justify-center">
                                <span className="text-xs font-medium">+{pool.memberIds.length - 4}</span>
                            </div>
                        )}
                        {hasOpenSpots && (
                            <div className="h-8 w-8 rounded-full bg-secondary/30 border-2 border-dashed border-border flex items-center justify-center">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                            </div>
                        )}
                    </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Link href={`/commons/${pool.id}`} className="flex-1">
                        <Button variant="outline" className="w-full">
                            View Details
                        </Button>
                    </Link>
                    {onAddBill && (
                        <Button onClick={onAddBill} className="flex-1">
                            Add Bill
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
