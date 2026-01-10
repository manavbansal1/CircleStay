"use client"

import { useState, useEffect } from "react";
import { Button } from "@/components/Button";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { CreatePoolModal } from "@/components/CreatePoolModal";
import { AddBillModal } from "@/components/AddBillModal";
import { PoolCard } from "@/components/PoolCard";
import { Plus, Loader2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getUserPools, getUserPoolBalance } from "@/lib/firestore-pools";
import type { Pool } from "@/lib/firestore-pools";
import styles from "./page.module.css";

export default function CommonsPage() {
    const { user } = useAuth();
    const [pools, setPools] = useState<Pool[]>([]);
    const [balances, setBalances] = useState<Record<string, number>>({});
    const [loading, setLoading] = useState(true);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [selectedPool, setSelectedPool] = useState<Pool | null>(null);

    const loadPools = async () => {
        if (!user) return;

        setLoading(true);
        try {
            const userPools = await getUserPools(user.uid);
            setPools(userPools);

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

                    {/* Loading State */}
                    {loading ? (
                        <div className="flex items-center justify-center py-20">
                            <div className="text-center">
                                <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                                <p className="text-muted-foreground">Loading your pools...</p>
                            </div>
                        </div>
                    ) : activePools.length === 0 ? (
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
                        /* Pools Grid */
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
                                    <h2 className="text-xl font-semibold mb-4 px-2 text-muted-foreground">
                                        Archived Pools ({archivedPools.length})
                                    </h2>
                                    <div className={styles.grid}>
                                        {archivedPools.map((pool) => (
                                            <PoolCard
                                                key={pool.id}
                                                pool={pool}
                                                userBalance={balances[pool.id] || 0}
                                            />
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
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

