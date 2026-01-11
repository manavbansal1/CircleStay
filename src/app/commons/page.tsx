"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreatePoolModal } from "@/components/CreatePoolModal";
import { AddBillModal } from "@/components/AddBillModal";
import { PoolCard } from "@/components/PoolCard";
import { Plus, Loader2, Globe, Users, Lock, Shield, DollarSign, CheckCircle2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPools, getUserPoolBalance, getPublicPools, joinPublicPool } from "@/lib/firestore-pools";
import type { Pool } from "@/lib/firestore-pools";
import styles from "./page.module.css";

export default function CommonsPage() {
    const { user } = useAuth();
    const [pools, setPools] = useState<Pool[]>([]);
    const [publicPools, setPublicPools] = useState<Pool[]>([]);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);
    const [viewMode, setViewMode] = useState<'my-pools' | 'public-pools'>('my-pools');
    const [joiningPool, setJoiningPool] = useState<string | null>(null);

    const loadPools = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const [userPools, allPublicPools] = await Promise.all([
                getUserPools(user.uid),
                getPublicPools()
            ]);
            
            setPools(userPools);
            // Filter out public pools user is already a member of
            setPublicPools(allPublicPools.filter(p => !p.memberIds.includes(user.uid)));

            // Load balances for each pool
            const balancePromises = userPools.map(async (pool) => {
                const balance = await getUserPoolBalance(pool.id, user.uid);
                return { poolId: pool.id, balance: balance?.netBalance || 0 };
            });

            const balanceResults = await Promise.all(balancePromises);
            const balancesMap: Record<string, number> = {};
            balanceResults.forEach(({ poolId, balance }) => {
                balancesMap[poolId] = balance;
            });
            setBalances(balancesMap);
        } catch (error) {
            console.error("Error loading pools:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPools();
    }, [user]);

    const handlePoolCreated = () => {
        loadPools();
    };

    const handleBillAdded = () => {
        loadPools();
        setShowAddBillModal(false);
        setSelectedPool(null);
    };

    const handleAddBill = (pool: Pool) => {
        setSelectedPool(pool);
        setShowAddBillModal(true);
    };

    const handleJoinPool = async (poolId: string) => {
        if (!user) return;

        setJoiningPool(poolId);
        try {
            await joinPublicPool(poolId, user.uid);
            await loadPools();
            alert('Successfully joined the pool!');
        } catch (error: any) {
            console.error('Error joining pool:', error);
            alert(error.message || 'Failed to join pool');
        } finally {
            setJoiningPool(null);
        }
    };

    const activePools = pools.filter(p => p.status === 'active');
    const archivedPools = pools.filter(p => p.status === 'archived');

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.wrapper}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerText}>
                            <h1>Commons Pool</h1>
                            <p>Automated cost splitting for your circle.</p>
                        </div>
                        <Button
                            className="gap-2 shadow-lg"
                            onClick={() => setShowCreateModal(true)}
                        >
                            <Plus className="h-4 w-4" /> New Pool
                        </Button>
                    </div>

                    {/* Tab Navigation */}
                    <div className="flex gap-3 mb-6 p-1.5 bg-white/70 rounded-2xl backdrop-blur-sm border border-border/30 shadow-sm">
                        <Button
                            variant={viewMode === 'my-pools' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('my-pools')}
                            className={`flex-1 rounded-xl transition-all ${viewMode === 'my-pools' ? 'shadow-md' : ''}`}
                        >
                            <Lock className="h-4 w-4 mr-2" />
                            My Pools
                        </Button>
                        <Button
                            variant={viewMode === 'public-pools' ? 'default' : 'ghost'}
                            onClick={() => setViewMode('public-pools')}
                            className={`flex-1 rounded-xl transition-all ${viewMode === 'public-pools' ? 'shadow-md' : ''}`}
                        >
                            <Globe className="h-4 w-4 mr-2" />
                            Discover
                        </Button>
                    </div>

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                                <p className="text-muted-foreground">Loading pools...</p>
                            </div>
                        </div>
                    ) : viewMode === 'my-pools' ? (
                        activePools.length === 0 ? (
                            /* Empty State */
                            <div className="text-center py-20">
                                <div className="glass-strong rounded-2xl p-8 max-w-md mx-auto">
                                    <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center mx-auto mb-4">
                                        <Plus className="h-8 w-8 text-primary" />
                                    </div>
                                    <h2 className="text-2xl font-bold mb-2">No Pools Yet</h2>
                                    <p className="text-muted-foreground mb-6">
                                        Create your first pool to start splitting costs with your friends and housemates.
                                    </p>
                                    <Button onClick={() => setShowCreateModal(true)} className="gap-2">
                                        <Plus className="h-4 w-4" />
                                        Create Your First Pool
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            /* My Pools Grid */
                            <>
                                {/* Active Pools */}
                                <div className="mb-8">
                                    <h2 className="text-xl font-semibold mb-4 px-2">
                                        Active Pools ({activePools.length})
                                    </h2>
                                    <div className={styles.grid}>
                                        {activePools.map((pool) => (
                                            <PoolCard
                                                key={pool.id}
                                                pool={pool}
                                                userBalance={balances[pool.id] || 0}
                                                onAddBill={() => handleAddBill(pool)}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Archived Pools */}
                                {archivedPools.length > 0 && (
                                    <div>
                                        <h2 className="text-xl font-semibold mb-4 px-2">
                                            Archived Pools ({archivedPools.length})
                                        </h2>
                                        <div className={styles.grid}>
                                            {archivedPools.map((pool) => (
                                                <PoolCard
                                                    key={pool.id}
                                                    pool={pool}
                                                    userBalance={balances[pool.id] || 0}
                                                    onAddBill={() => handleAddBill(pool)}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </>
                        )
                    ) : (
                        /* Public Pools View */
                        publicPools.length === 0 ? (
                            <div className="text-center py-20">
                                <div className="glass-strong rounded-2xl p-8 max-w-md mx-auto">
                                    <Globe className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
                                    <h2 className="text-2xl font-bold mb-2">No Public Pools Available</h2>
                                    <p className="text-muted-foreground">
                                        Be the first to create a public pool for sharing subscriptions!
                                    </p>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold mb-6 px-2 bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                                    Discover Public Pools
                                </h2>
                                <div className={styles.grid}>
                                    {publicPools.map((pool) => {
                                        const isFull = pool.memberIds.length >= (pool.maxMembers || 10);
                                        const IconComponent = pool.icon === 'tv' ? require('lucide-react').Tv :
                                            pool.icon === 'music' ? require('lucide-react').Music :
                                                pool.icon === 'wifi' ? require('lucide-react').Wifi :
                                                    Globe;
                                        const fillPercentage = (pool.memberIds.length / (pool.maxMembers || 10)) * 100;
                                        
                                        return (
                                            <div
                                                key={pool.id}
                                                className="group relative overflow-hidden bg-white/80 backdrop-blur-md rounded-3xl hover:shadow-2xl transition-all duration-500 border-2 border-border/30 hover:border-primary/40 hover:-translate-y-1"
                                            >
                                                {/* Gradient Header */}
                                                <div className="p-6 pb-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
                                                    <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl" />
                                                    
                                                    <div className="relative flex items-start gap-4">
                                                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-xl flex-shrink-0 group-hover:scale-110 transition-transform">
                                                            <IconComponent className="h-8 w-8 text-white" />
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-start justify-between mb-2">
                                                                <h3 className="font-bold text-xl text-gray-900 line-clamp-1 group-hover:text-primary transition-colors">
                                                                    {pool.name}
                                                                </h3>
                                                                <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-blue-500 text-white text-xs font-semibold shadow-sm">
                                                                    <Globe className="h-3 w-3" />
                                                                    Public
                                                                </div>
                                                            </div>
                                                            {pool.category && (
                                                                <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-600 bg-white/60 px-2.5 py-1 rounded-full">
                                                                    {pool.category}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>

                                                <div className="p-6 pt-4">
                                                    {/* Description */}
                                                    {pool.description && (
                                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2 leading-relaxed">
                                                            {pool.description}
                                                        </p>
                                                    )}

                                                    {/* Stats Grid */}
                                                    <div className="grid grid-cols-2 gap-3 mb-4">
                                                        <div className="p-3 rounded-xl bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100">
                                                            <div className="flex items-center gap-2 mb-1">
                                                                <Users className="h-4 w-4 text-blue-600" />
                                                                <span className="text-xs font-semibold text-gray-600">Members</span>
                                                            </div>
                                                            <div className="flex items-baseline gap-1">
                                                                <span className="text-2xl font-bold text-blue-600">{pool.memberIds.length}</span>
                                                                <span className="text-sm text-gray-500">/ {pool.maxMembers || 10}</span>
                                                            </div>
                                                            {/* Progress bar */}
                                                            <div className="mt-2 h-1.5 bg-blue-100 rounded-full overflow-hidden">
                                                                <div 
                                                                    className={`h-full rounded-full transition-all duration-500 ${isFull ? 'bg-red-500' : 'bg-blue-500'}`}
                                                                    style={{ width: `${fillPercentage}%` }}
                                                                />
                                                            </div>
                                                        </div>

                                                        {pool.monthlyFee ? (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <DollarSign className="h-4 w-4 text-emerald-600" />
                                                                    <span className="text-xs font-semibold text-gray-600">Cost/Month</span>
                                                                </div>
                                                                <div className="text-2xl font-bold text-emerald-600">
                                                                    ${pool.monthlyFee}
                                                                </div>
                                                                <div className="text-xs text-gray-500 mt-1">
                                                                    ≈ ${(pool.monthlyFee / pool.memberIds.length).toFixed(2)}/person
                                                                </div>
                                                            </div>
                                                        ) : (
                                                            <div className="p-3 rounded-xl bg-gradient-to-br from-gray-50 to-slate-50 border border-gray-100">
                                                                <div className="flex items-center gap-2 mb-1">
                                                                    <CheckCircle2 className="h-4 w-4 text-gray-500" />
                                                                    <span className="text-xs font-semibold text-gray-600">Status</span>
                                                                </div>
                                                                <div className="text-sm font-bold text-gray-700">
                                                                    Free to Join
                                                                </div>
                                                            </div>
                                                        )}\n                                                    </div>

                                                    {/* Join Button */}
                                                    <Button
                                                        onClick={() => handleJoinPool(pool.id)}
                                                        disabled={isFull || joiningPool === pool.id}
                                                        className={`w-full font-semibold transition-all shadow-lg ${
                                                            isFull 
                                                                ? 'bg-gray-300 hover:bg-gray-300 cursor-not-allowed' 
                                                                : 'bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700'
                                                        }`}
                                                        size="lg"
                                                    >
                                                        {joiningPool === pool.id ? (
                                                            <>
                                                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                                                Joining...
                                                            </>
                                                        ) : isFull ? (
                                                            <>
                                                                <Shield className="h-4 w-4 mr-2" />
                                                                Pool Full
                                                            </>
                                                        ) : (
                                                            <>
                                                                <Plus className="h-4 w-4 mr-2" />
                                                                Join Pool
                                                            </>
                                                        )}
                                                    </Button>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>
                        )
                    )}
                </div>
            </div>

            {/* Modals */}
            <CreatePoolModal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                onPoolCreated={handlePoolCreated}
            />

            {selectedPool && user && (
                <AddBillModal
                    isOpen={showAddBillModal}
                    onClose={() => {
                        setShowAddBillModal(false);
                        setSelectedPool(null);
                    }}
                    pool={selectedPool}
                    currentUserId={user.uid}
                    onBillAdded={handleBillAdded}
                />
            )}
        </ProtectedRoute>
    );
}

