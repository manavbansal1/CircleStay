"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { AddBillModal } from "@/components/AddBillModal";
import { InviteMembersModal } from "@/components/InviteMembersModal";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import {
    ArrowLeft,
    Plus,
    Users,
    UserPlus,
    DollarSign,
    Calendar,
    Receipt,
    Settings2,
    MoreVertical,
    Loader2,
    TrendingUp,
    TrendingDown
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    getPool,
    getPoolBills,
    calculateBalances,
    type Pool,
    type Bill,
    type Balance
} from "@/lib/firestore-pools";
import { getUserProfile } from "@/lib/firestore";

export default function PoolDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const poolId = params.poolId as string;

    const [pool, setPool] = useState<Pool | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [balances, setBalances] = useState<Map<string, Balance>>(new Map());
    const [memberNames, setMemberNames] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);

    const loadPoolData = async () => {
        if (!poolId) return;

        setLoading(true);
        try {
            const [poolData, billsData, balancesData] = await Promise.all([
                getPool(poolId),
                getPoolBills(poolId),
                calculateBalances(poolId)
            ]);

            setPool(poolData);
            setBills(billsData);
            setBalances(balancesData);

            // Load member names
            if (poolData) {
                const names: Record<string, string> = {};
                for (const memberId of poolData.memberIds) {
                    const profile = await getUserProfile(memberId);
                    names[memberId] = profile?.displayName || profile?.email || "Unknown";
                }
                setMemberNames(names);
            }
        } catch (error) {
            console.error("Error loading pool data:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadPoolData();
    }, [poolId]);

    const handleBillAdded = () => {
        loadPoolData();
        setShowAddBillModal(false);
    };

    const userBalance = user ? balances.get(user.uid) : null;
    const totalPoolExpenses = bills.reduce((sum, bill) => sum + bill.totalAmount, 0);

    if (loading) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
                        <p className="text-muted-foreground">Loading pool details...</p>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    if (!pool) {
        return (
            <ProtectedRoute>
                <div className="min-h-screen flex items-center justify-center">
                    <div className="text-center">
                        <h2 className="text-2xl font-bold mb-2">Pool Not Found</h2>
                        <p className="text-muted-foreground mb-4">The pool you're looking for doesn't exist.</p>
                        <Button onClick={() => router.push("/commons")}>
                            <ArrowLeft className="h-4 w-4 mr-2" />
                            Back to Commons
                        </Button>
                    </div>
                </div>
            </ProtectedRoute>
        );
    }

    return (
        <ProtectedRoute>
            <div className="min-h-screen bg-gradient-to-b from-background to-secondary/10 px-6 py-12">
                <div className="max-w-7xl mx-auto space-y-6">
                    {/* Header */}
                    <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4">
                            <Button
                                variant="outline"
                                onClick={() => router.push("/commons")}
                                className="mt-1"
                            >
                                <ArrowLeft className="h-4 w-4" />
                            </Button>
                            <div>
                                <h1 className="text-3xl font-bold gradient-text mb-2">{pool.name}</h1>
                                {pool.description && (
                                    <p className="text-muted-foreground">{pool.description}</p>
                                )}
                                <div className="flex items-center gap-3 mt-2">
                                    {pool.category && (
                                        <Badge variant="secondary">{pool.category}</Badge>
                                    )}
                                    <Badge variant="outline">
                                        {pool.memberIds.length} / 10 Members
                                    </Badge>
                                </div>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button onClick={() => setShowInviteModal(true)} variant="outline">
                                <UserPlus className="h-4 w-4 mr-2" />
                                Invite Members
                            </Button>
                            <Button onClick={() => setShowAddBillModal(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Add Bill
                            </Button>
                            <Button variant="outline">
                                <Settings2 className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    {/* Stats Overview */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* User's Balance */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Your Balance</p>
                                        <div className="flex items-baseline gap-2">
                                            <span
                                                className={`text-3xl font-bold ${(userBalance?.netBalance || 0) > 0
                                                    ? "text-green-500"
                                                    : (userBalance?.netBalance || 0) < 0
                                                        ? "text-destructive"
                                                        : ""
                                                    }`}
                                            >
                                                ${Math.abs(userBalance?.netBalance || 0).toFixed(2)}
                                            </span>
                                        </div>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {(userBalance?.netBalance || 0) > 0
                                                ? "You are owed"
                                                : (userBalance?.netBalance || 0) < 0
                                                    ? "You owe"
                                                    : "All settled up"}
                                        </p>
                                    </div>
                                    <div className={`p-3 rounded-full ${(userBalance?.netBalance || 0) > 0
                                        ? "bg-green-500/10"
                                        : (userBalance?.netBalance || 0) < 0
                                            ? "bg-destructive/10"
                                            : "bg-secondary"
                                        }`}>
                                        {(userBalance?.netBalance || 0) > 0 ? (
                                            <TrendingUp className="h-6 w-6 text-green-500" />
                                        ) : (userBalance?.netBalance || 0) < 0 ? (
                                            <TrendingDown className="h-6 w-6 text-destructive" />
                                        ) : (
                                            <DollarSign className="h-6 w-6" />
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Total Expenses */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Total Expenses</p>
                                        <p className="text-3xl font-bold">${totalPoolExpenses.toFixed(2)}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {bills.length} {bills.length === 1 ? "bill" : "bills"}
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-primary/10">
                                        <Receipt className="h-6 w-6 text-primary" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Members Count */}
                        <Card>
                            <CardContent className="pt-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-1">Pool Members</p>
                                        <p className="text-3xl font-bold">{pool.memberIds.length}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {10 - pool.memberIds.length} spots open
                                        </p>
                                    </div>
                                    <div className="p-3 rounded-full bg-accent/10">
                                        <Users className="h-6 w-6 text-accent" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Main Content Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {/* Bills List */}
                        <div className="lg:col-span-2 space-y-4">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-semibold">Recent Bills</h2>
                            </div>

                            {bills.length === 0 ? (
                                <Card>
                                    <CardContent className="py-12 text-center">
                                        <Receipt className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
                                        <h3 className="text-lg font-semibold mb-2">No bills yet</h3>
                                        <p className="text-muted-foreground mb-4">
                                            Start by adding your first bill to this pool
                                        </p>
                                        <Button onClick={() => setShowAddBillModal(true)}>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Add First Bill
                                        </Button>
                                    </CardContent>
                                </Card>
                            ) : (
                                <div className="space-y-3">
                                    {bills.map((bill) => (
                                        <Card key={bill.id} className="hover:shadow-md transition-shadow">
                                            <CardContent className="p-4">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            <h4 className="font-semibold">{bill.description}</h4>
                                                            {bill.category && (
                                                                <Badge variant="outline" className="text-xs">
                                                                    {bill.category}
                                                                </Badge>
                                                            )}
                                                        </div>
                                                        <p className="text-sm text-muted-foreground flex items-center gap-2">
                                                            <Calendar className="h-3.5 w-3.5" />
                                                            {bill.date.toLocaleDateString()}
                                                        </p>
                                                        <p className="text-sm text-muted-foreground mt-1">
                                                            Paid by {memberNames[bill.paidById] || "Unknown"}
                                                        </p>
                                                    </div>
                                                    <div className="text-right">
                                                        <p className="text-2xl font-bold text-primary">
                                                            ${bill.totalAmount.toFixed(2)}
                                                        </p>
                                                        <p className="text-xs text-muted-foreground mt-1">
                                                            ${(bill.totalAmount / bill.splits.length).toFixed(2)} per person
                                                        </p>
                                                    </div>
                                                </div>
                                            </CardContent>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Sidebar - Members & Balances */}
                        <div className="space-y-6">
                            {/* Members */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Users className="h-5 w-5" />
                                        Members
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    {pool.memberIds.map((memberId) => {
                                        const memberBalance = balances.get(memberId);
                                        return (
                                            <div key={memberId} className="flex items-center justify-between">
                                                <div className="flex items-center gap-2">
                                                    <Avatar
                                                        src={undefined}
                                                        alt={memberNames[memberId] || memberId}
                                                        className="h-10 w-10"
                                                    />
                                                    <div>
                                                        <p className="font-medium text-sm">
                                                            {memberNames[memberId] || memberId}
                                                            {memberId === user?.uid && " (You)"}
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="text-right">
                                                    <span
                                                        className={`text-sm font-semibold ${(memberBalance?.netBalance || 0) > 0
                                                            ? "text-green-500"
                                                            : (memberBalance?.netBalance || 0) < 0
                                                                ? "text-destructive"
                                                                : "text-muted-foreground"
                                                            }`}
                                                    >
                                                        ${Math.abs(memberBalance?.netBalance || 0).toFixed(2)}
                                                    </span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </CardContent>
                            </Card>

                            {/* Who Owes Who */}
                            {userBalance && (userBalance.owesTo.length > 0 || userBalance.owedBy.length > 0) && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Your Balances</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-3">
                                        {userBalance.owesTo.map((debt) => (
                                            <div key={debt.userId} className="flex items-center justify-between p-3 rounded-lg bg-destructive/5">
                                                <p className="text-sm">
                                                    You owe <span className="font-semibold">{memberNames[debt.userId]}</span>
                                                </p>
                                                <span className="font-bold text-destructive">
                                                    ${debt.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                        {userBalance.owedBy.map((credit) => (
                                            <div key={credit.userId} className="flex items-center justify-between p-3 rounded-lg bg-green-500/5">
                                                <p className="text-sm">
                                                    <span className="font-semibold">{memberNames[credit.userId]}</span> owes you
                                                </p>
                                                <span className="font-bold text-green-500">
                                                    ${credit.amount.toFixed(2)}
                                                </span>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Modals */}
            {user && (
                <>
                    <AddBillModal
                        isOpen={showAddBillModal}
                        onClose={() => setShowAddBillModal(false)}
                        pool={pool}
                        currentUserId={user.uid}
                        onBillAdded={handleBillAdded}
                    />

                    <InviteMembersModal
                        isOpen={showInviteModal}
                        onClose={() => setShowInviteModal(false)}
                        pool={pool}
                        currentUserId={user.uid}
                        onMembersInvited={loadPoolData}
                    />
                </>
            )}
        </ProtectedRoute>
    );
}
