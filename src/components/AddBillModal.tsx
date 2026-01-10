"use client";

import { useState, useEffect } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { Avatar } from "./Avatar";
import { X } from "lucide-react";
import { addBill } from "@/lib/firestore-pools";
import { getUserProfile } from "@/lib/firestore";
import type { Pool, BillSplit } from "@/lib/firestore-pools";

interface AddBillModalProps {
    isOpen: boolean;
    onClose: () => void;
    pool: Pool;
    currentUserId: string;
    onBillAdded?: () => void;
}

export function AddBillModal({ isOpen, onClose, pool, currentUserId, onBillAdded }: AddBillModalProps) {
    const [description, setDescription] = useState("");
    const [amount, setAmount] = useState("");
    const [paidBy, setPaidBy] = useState(currentUserId);
    const [splitType, setSplitType] = useState<'equal' | 'custom'>('equal');
    const [customSplits, setCustomSplits] = useState<Record<string, string>>({});
    const [category, setCategory] = useState("General");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [memberNames, setMemberNames] = useState<Record<string, string>>({});

    // Load member names
    useEffect(() => {
        const loadMemberNames = async () => {
            const names: Record<string, string> = {};
            for (const memberId of pool.memberIds) {
                const profile = await getUserProfile(memberId);
                names[memberId] = profile?.displayName || profile?.email || "Unknown";
            }
            setMemberNames(names);
        };
        if (isOpen) {
            loadMemberNames();
        }
    }, [isOpen, pool.memberIds]);

    const categories = ["General", "Groceries", "Utilities", "Rent", "Entertainment", "Transportation", "Other"];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!description.trim()) {
            setError("Please enter a description");
            return;
        }

        const totalAmount = parseFloat(amount);
        if (isNaN(totalAmount) || totalAmount <= 0) {
            setError("Please enter a valid amount");
            return;
        }

        // Validate custom splits
        let splits: BillSplit[] | undefined;
        if (splitType === 'custom') {
            splits = pool.memberIds.map(userId => ({
                userId,
                amount: parseFloat(customSplits[userId] || "0"),
                paid: userId === paidBy
            }));

            const splitTotal = splits.reduce((sum, split) => sum + split.amount, 0);
            if (Math.abs(splitTotal - totalAmount) > 0.01) {
                setError(`Split amounts ($${splitTotal.toFixed(2)}) don't match total amount ($${totalAmount.toFixed(2)})`);
                return;
            }
        }

        setLoading(true);
        setError("");

        try {
            await addBill({
                poolId: pool.id,
                description: description.trim(),
                totalAmount,
                paidById: paidBy,
                splitType,
                splits,
                category,
                date: new Date()
            });

            onBillAdded?.();
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to add bill");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setDescription("");
        setAmount("");
        setPaidBy(currentUserId);
        setSplitType('equal');
        setCustomSplits({});
        setCategory("General");
        setError("");
        onClose();
    };

    const handleCustomSplitChange = (userId: string, value: string) => {
        setCustomSplits(prev => ({
            ...prev,
            [userId]: value
        }));
    };

    const splitEquallyAmount = amount ? (parseFloat(amount) / pool.memberIds.length).toFixed(2) : "0.00";

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Add Bill</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Description <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g., Electricity Bill - January"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                        />
                    </div>

                    {/* Amount and Category */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-semibold mb-2">
                                Amount <span className="text-destructive">*</span>
                            </label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                disabled={loading}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-semibold mb-2">Category</label>
                            <select
                                value={category}
                                onChange={(e) => setCategory(e.target.value)}
                                disabled={loading}
                                className="w-full h-12 px-4 rounded-xl border-2 border-border/50 bg-background/70 backdrop-blur-sm text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200"
                            >
                                {categories.map((cat) => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    {/* Paid By */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Paid By</label>
                        <select
                            value={paidBy}
                            onChange={(e) => setPaidBy(e.target.value)}
                            disabled={loading}
                            className="w-full h-12 px-4 rounded-xl border-2 border-border/50 bg-background/70 backdrop-blur-sm text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200"
                        >
                            {pool.memberIds.map((memberId) => (
                                <option key={memberId} value={memberId}>
                                    {memberNames[memberId] || memberId} {memberId === currentUserId && "(You)"}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Split Type */}
                    <div>
                        <label className="block text-sm font-semibold mb-3">Split Type</label>
                        <div className="flex gap-3">
                            <button
                                type="button"
                                onClick={() => setSplitType('equal')}
                                disabled={loading}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-300 ${splitType === 'equal'
                                        ? "border-primary bg-gradient-to-r from-primary/10 to-accent/10"
                                        : "border-border/30 bg-secondary/30 hover:border-primary/50"
                                    }`}
                            >
                                Split Equally
                            </button>
                            <button
                                type="button"
                                onClick={() => setSplitType('custom')}
                                disabled={loading}
                                className={`flex-1 py-3 px-4 rounded-lg border-2 font-medium transition-all duration-300 ${splitType === 'custom'
                                        ? "border-primary bg-gradient-to-r from-primary/10 to-accent/10"
                                        : "border-border/30 bg-secondary/30 hover:border-primary/50"
                                    }`}
                            >
                                Custom Split
                            </button>
                        </div>
                    </div>

                    {/* Split Preview/Editor */}
                    <div className="glass rounded-lg p-4 space-y-3">
                        <div className="flex items-center justify-between text-sm font-semibold">
                            <span>Split Details</span>
                            {splitType === 'equal' && amount && (
                                <span className="text-muted-foreground">
                                    ${splitEquallyAmount} per person
                                </span>
                            )}
                        </div>
                        <div className="space-y-2">
                            {pool.memberIds.map((memberId) => (
                                <div key={memberId} className="flex items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 flex-1">
                                        <Avatar
                                            src={undefined}
                                            alt={memberNames[memberId] || memberId}
                                            className="h-8 w-8"
                                        />
                                        <span className="text-sm">
                                            {memberNames[memberId] || memberId}
                                            {memberId === currentUserId && " (You)"}
                                        </span>
                                    </div>
                                    {splitType === 'equal' ? (
                                        <span className="text-sm font-medium">${splitEquallyAmount}</span>
                                    ) : (
                                        <Input
                                            type="number"
                                            step="0.01"
                                            placeholder="0.00"
                                            value={customSplits[memberId] || ""}
                                            onChange={(e) => handleCustomSplitChange(memberId, e.target.value)}
                                            disabled={loading}
                                            className="w-24 h-9 text-sm"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Actions */}
                    <div className="flex gap-3 pt-2">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleClose}
                            disabled={loading}
                            className="flex-1"
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={loading || !description.trim() || !amount}
                            className="flex-1"
                        >
                            {loading ? "Adding..." : "Add Bill"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
