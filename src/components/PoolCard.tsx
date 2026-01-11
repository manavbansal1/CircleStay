"use client";

import { Card, CardContent } from "./Card";
import { Avatar } from "./Avatar";
import { Button } from "./Button";
import { Badge } from "./Badge";
import { Users, Plus, DollarSign, Globe, Lock, TrendingUp, TrendingDown, CheckCircle2 } from "lucide-react";
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
    const maxMembers = pool.maxMembers || 10;
    const hasOpenSpots = pool.memberIds.length < maxMembers;
    const isPublic = pool.visibility === 'public';

    return (
        <Card className="group overflow-hidden hover:shadow-2xl transition-all duration-300 border-2 hover:border-primary/30">
            <CardContent className="p-0">
                {/* Header with gradient background */}
                <div className={`p-6 pb-4 bg-gradient-to-br ${isPublic ? 'from-blue-50 to-indigo-50' : 'from-amber-50 to-orange-50'}`}>
                    <div className="flex items-start justify-between mb-3">
                        <div className="flex items-start gap-3 flex-1">
                            <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${isPublic ? 'from-blue-400 to-indigo-500' : 'from-primary to-accent'} flex items-center justify-center flex-shrink-0 shadow-lg`}>
                                <IconComponent className="h-7 w-7 text-white" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <h3 className="font-bold text-xl line-clamp-1 group-hover:text-primary transition-colors">
                                        {pool.name}
                                    </h3>
                                    {isPublic ? (
                                        <Badge className="bg-blue-500 text-white border-0">
                                            <Globe className="h-3 w-3 mr-1" />
                                            Public
                                        </Badge>
                                    ) : (
                                        <Badge variant="secondary" className="border-0">
                                            <Lock className="h-3 w-3 mr-1" />
                                            Private
                                        </Badge>
                                    )}
                                </div>
                                {pool.description && (
                                    <p className="text-sm text-muted-foreground line-clamp-2 mt-1">
                                        {pool.description}
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                    
                    <div className="flex gap-2 mt-3">
                        {pool.category && (
                            <Badge variant="outline" className="text-xs bg-white/70">
                                {pool.category}
                            </Badge>
                        )}
                        {pool.monthlyFee && (
                            <Badge variant="outline" className="text-xs bg-white/70">
                                <DollarSign className="h-3 w-3 mr-1" />
                                {pool.monthlyFee}/mo
                            </Badge>
                        )}
                    </div>
                </div>

                <div className="p-6 pt-4">
                    {/* Balance - only show for private pools or if user has balance */}
                    {(!isPublic || userBalance !== 0) && (
                        <div className="mb-4 p-4 rounded-xl bg-gradient-to-r from-secondary/30 to-secondary/10 border border-border/50">
                            <div className="flex items-center justify-between">
                                <span className="text-sm font-medium text-muted-foreground">Your Balance</span>
                                <div className="flex items-center gap-2">
                                    {userBalance > 0 ? (
                                        <TrendingUp className="h-5 w-5 text-green-500" />
                                    ) : userBalance < 0 ? (
                                        <TrendingDown className="h-5 w-5 text-red-500" />
                                    ) : (
                                        <CheckCircle2 className="h-5 w-5 text-muted-foreground" />
                                    )}
                                    <span className={`font-bold text-2xl ${
                                        userBalance > 0 
                                            ? 'text-green-600' 
                                            : userBalance < 0 
                                                ? 'text-red-600' 
                                                : 'text-foreground'
                                    }`}>
                                        ${Math.abs(userBalance).toFixed(2)}
                                    </span>
                                </div>
                            </div>
                            {userBalance !== 0 && (
                                <p className="text-xs text-muted-foreground mt-2 font-medium">
                                    {userBalance > 0 ? "✓ You are owed" : "⚠ You owe"}
                                </p>
                            )}
                        </div>
                    )}

                    {/* Members */}
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                                <Users className="h-4 w-4" />
                                {pool.memberIds.length}/{maxMembers} Members
                            </span>
                            {hasOpenSpots && (
                                <Badge className="text-xs bg-green-100 text-green-700 border-green-200">
                                    {maxMembers - pool.memberIds.length} spots open
                                </Badge>
                            )}
                        </div>
                        <div className="flex items-center gap-1.5">
                            {pool.memberIds.slice(0, 5).map((memberId, index) => (
                                <Avatar
                                    key={memberId}
                                    src={undefined}
                                    alt={memberNames[memberId] || "Member"}
                                    className="h-9 w-9 border-3 border-white shadow-md"
                                />
                            ))}
                            {pool.memberIds.length > 5 && (
                                <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 border-3 border-white shadow-md flex items-center justify-center">
                                    <span className="text-xs font-bold text-primary">+{pool.memberIds.length - 5}</span>
                                </div>
                            )}
                            {hasOpenSpots && (
                                <div className="h-9 w-9 rounded-full bg-secondary/50 border-2 border-dashed border-border flex items-center justify-center">
                                    <Plus className="h-4 w-4 text-muted-foreground" />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-2 pt-2">
                        <Link href={`/commons/${pool.id}`} className="flex-1">
                            <Button variant="outline" className="w-full font-semibold hover:bg-primary hover:text-white transition-all">
                                View Pool
                            </Button>
                        </Link>
                        {onAddBill && !isPublic && (
                            <Button onClick={onAddBill} className="flex-1 font-semibold shadow-md">
                                <Plus className="h-4 w-4 mr-1" />
                                Add Bill
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
