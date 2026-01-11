"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/Button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/Card";
import { Avatar } from "@/components/Avatar";
import { Badge } from "@/components/Badge";
import { AddBillModal } from "@/components/AddBillModal";
import { InviteMembersModal } from "@/components/InviteMembersModal";
import { RateUserModal } from "@/components/RateUserModal";
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
    TrendingDown,
    Star,
    Trash2
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import {
    getPool,
    getPoolBills,
    calculateBalances,
    deletePool,
    type Pool,
    type Bill,
    type Balance
} from "@/lib/firestore-pools";
import { getUserProfile, canRateUser, type UserProfile } from "@/lib/firestore";

export default function PoolDetailPage() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const poolId = params.poolId as string;

    const [pool, setPool] = useState<Pool | null>(null);
    const [bills, setBills] = useState<Bill[]>([]);
    const [balances, setBalances] = useState<Map<string, Balance>>(new Map());
    const [memberNames, setMemberNames] = useState<Record<string, string>>({});
    const [memberPhotos, setMemberPhotos] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [showAddBillModal, setShowAddBillModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [showRateModal, setShowRateModal] = useState(false);
    const [ratingTarget, setRatingTarget] = useState<{ userId: string; billId?: string } | null>(null);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [deleting, setDeleting] = useState(false);

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

            // Load member names and photos
            if (poolData) {
                const names: Record<string, string> = {};
                const photos: Record<string, string> = {};
                for (const memberId of poolData.memberIds) {
                    const profile = await getUserProfile(memberId);
                    names[memberId] = profile?.displayName || profile?.email || "Unknown";
                    photos[memberId] = profile?.photoURL || "";
                }
                setMemberNames(names);
                setMemberPhotos(photos);
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

    const handleRateUser = async (userId: string, billId?: string) => {
        if (!user) return;
        
        // Check if user can rate
        const canRate = await canRateUser(user.uid, userId, billId);
        if (!canRate) {
            alert('You have already rated this user for this payment.');
            return;
        }

        setRatingTarget({ userId, billId });
        setShowRateModal(true);
    };

    const handleRatingSubmitted = () => {
        setShowRateModal(false);
        setRatingTarget(null);
        loadPoolData(); // Reload to update any trust scores
    };

    const handleBillAdded = () => {
        loadPoolData();
        setShowAddBillModal(false);
    };

    const handleDeletePool = async () => {
        if (!pool || !user) return;

        // Only creator can delete
        if (pool.creatorId !== user.uid) {
            alert('Only the pool creator can delete this pool.');
            return;
        }

        setDeleting(true);
        try {
            await deletePool(poolId);
            router.push('/commons');
        } catch (error) {
            console.error('Error deleting pool:', error);
            alert('Failed to delete pool. Please try again.');
            setDeleting(false);
        }
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
                            {pool.creatorId === user?.uid && (
                                <Button 
                                    variant="outline" 
                                    onClick={() => setShowDeleteModal(true)}
                                    className="text-red-600 border-red-200 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            )}
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
                                        const isCurrentUser = memberId === user?.uid;
                                        return (
                                            <div key={memberId} className="flex items-center justify-between p-2 rounded-lg hover:bg-secondary/30 transition-colors">
                                                <div className="flex items-center gap-2 flex-1">
                                                    <Avatar
                                                        src={memberPhotos[memberId]}
                                                        alt={memberNames[memberId] || memberId}
                                                        className="h-10 w-10"
                                                    />
                                                    <div className="flex-1">
                                                        <p className="font-medium text-sm">
                                                            {memberNames[memberId] || memberId}
                                                            {isCurrentUser && " (You)"}
                                                        </p>
                                                        <span
                                                            className={`text-xs font-semibold ${(memberBalance?.netBalance || 0) > 0
                                                                ? "text-green-500"
                                                                : (memberBalance?.netBalance || 0) < 0
                                                                    ? "text-destructive"
                                                                    : "text-muted-foreground"
                                                                }`}
                                                        >
                                                            ${Math.abs(memberBalance?.netBalance || 0).toFixed(2)}
                                                            {(memberBalance?.netBalance || 0) > 0 && " owed"}
                                                            {(memberBalance?.netBalance || 0) < 0 && " owes"}
                                                        </span>
                                                    </div>
                                                </div>
                                                {!isCurrentUser && (
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => handleRateUser(memberId)}
                                                        className="gap-1"
                                                    >
                                                        <Star className="h-3 w-3" />
                                                        Rate
                                                    </Button>
                                                )}
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

                    {ratingTarget && (
                        <RateUserModal
                            isOpen={showRateModal}
                            onClose={() => {
                                setShowRateModal(false);
                                setRatingTarget(null);
                            }}
                            raterId={user.uid}
                            ratedUserId={ratingTarget.userId}
                            ratedUserName={memberNames[ratingTarget.userId] || "User"}
                            ratedUserPhoto={memberPhotos[ratingTarget.userId]}
                            poolId={poolId}
                            billId={ratingTarget.billId}
                            category="payment"
                            onRatingSubmitted={handleRatingSubmitted}
                        />
                    )}
                </>
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full shadow-2xl border border-gray-200">
                        <h3 className="text-xl font-bold mb-4 text-gray-900">Delete Pool</h3>
                        <p className="text-sm text-gray-600 mb-6">
                            Are you sure you want to delete "{pool.name}"? This will permanently delete all bills and balances. This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <Button
                                variant="outline"
                                onClick={() => setShowDeleteModal(false)}
                                className="flex-1"
                                disabled={deleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleDeletePool}
                                disabled={deleting}
                                className="flex-1 bg-red-600 hover:bg-red-700"
                            >
                                {deleting ? 'Deleting...' : 'Delete Pool'}
                            </Button>
                        </div>
                    </div>
                </div>
            )}
        </ProtectedRoute>
    );
}
