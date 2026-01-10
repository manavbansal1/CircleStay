"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { X, UserPlus, Mail } from "lucide-react";
import { inviteToPool } from "@/lib/firestore-pools";
import { getUserProfile } from "@/lib/firestore";
import type { Pool } from "@/lib/firestore-pools";

interface InviteMembersModalProps {
    isOpen: boolean;
    onClose: () => void;
    pool: Pool;
    currentUserId: string;
    onMembersInvited?: () => void;
}

export function InviteMembersModal({ isOpen, onClose, pool, currentUserId, onMembersInvited }: InviteMembersModalProps) {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!email.trim()) {
            setError("Please enter an email address");
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email.trim())) {
            setError("Please enter a valid email address");
            return;
        }

        setLoading(true);
        setError("");
        setSuccess("");

        try {
            // Find user by email
            const users = await fetch(`/api/users/search?email=${encodeURIComponent(email.trim())}`);

            if (!users.ok) {
                // If API doesn't exist, try direct Firestore query (less efficient but works)
                // For now, we'll show an error and suggest using a user search
                setError(`User with email "${email.trim()}" not found. Make sure they have an account on CircleStay.`);
                setLoading(false);
                return;
            }

            const userData = await users.json();

            if (!userData || !userData.uid) {
                setError(`User with email "${email.trim()}" not found. Make sure they have an account on CircleStay.`);
                setLoading(false);
                return;
            }

            // Check if already a member
            if (pool.memberIds.includes(userData.uid)) {
                setError("This user is already a member of the pool");
                setLoading(false);
                return;
            }

            // Check if already invited
            if (pool.pendingInvites.includes(userData.uid)) {
                setError("This user has already been invited");
                setLoading(false);
                return;
            }

            // Invite user
            await inviteToPool(pool.id, [userData.uid], currentUserId);

            setSuccess(`Invitation sent to ${email.trim()}!`);
            setEmail("");
            onMembersInvited?.();

            // Close modal after 2 seconds
            setTimeout(() => {
                handleClose();
            }, 2000);
        } catch (err: any) {
            setError(err.message || "Failed to send invitation");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setEmail("");
        setError("");
        setSuccess("");
        onClose();
    };

    const availableSpots = 10 - (pool.memberIds.length + pool.pendingInvites.length);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <h2 className="text-2xl font-bold gradient-text">Invite Members</h2>
                        <p className="text-sm text-muted-foreground mt-1">
                            {availableSpots} {availableSpots === 1 ? 'spot' : 'spots'} available
                        </p>
                    </div>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* Pool Info */}
                <div className="mb-6 p-4 rounded-lg bg-secondary/30">
                    <p className="text-sm font-semibold mb-2">{pool.name}</p>
                    <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{pool.memberIds.length} members</span>
                        {pool.pendingInvites.length > 0 && (
                            <span>{pool.pendingInvites.length} pending invites</span>
                        )}
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Email Address <span className="text-destructive">*</span>
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <Input
                                type="email"
                                placeholder="friend@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                disabled={loading || availableSpots === 0}
                                className="pl-10"
                            />
                        </div>
                        <p className="text-xs text-muted-foreground mt-2">
                            The user must have a CircleStay account
                        </p>
                    </div>

                    {/* Success Message */}
                    {success && (
                        <div className="p-3 rounded-lg bg-green-500/10 border border-green-500/30 text-green-500 text-sm">
                            ✓ {success}
                        </div>
                    )}

                    {/* Error Message */}
                    {error && (
                        <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30 text-destructive text-sm">
                            {error}
                        </div>
                    )}

                    {/* Warning if pool is full */}
                    {availableSpots === 0 && (
                        <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/30 text-amber-600 text-sm">
                            Pool is full (10/10 members)
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
                            disabled={loading || !email.trim() || availableSpots === 0}
                            className="flex-1"
                        >
                            {loading ? "Sending..." : "Send Invite"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
