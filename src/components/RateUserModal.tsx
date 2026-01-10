"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Avatar } from "./Avatar";
import { X, Star } from "lucide-react";
import { addUserRating } from "@/lib/firestore";

interface RateUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    raterId: string;
    ratedUserId: string;
    ratedUserName: string;
    ratedUserPhoto?: string;
    poolId?: string;
    billId?: string;
    category?: 'payment' | 'reliability' | 'communication' | 'general';
    onRatingSubmitted?: () => void;
}

export function RateUserModal({
    isOpen,
    onClose,
    raterId,
    ratedUserId,
    ratedUserName,
    ratedUserPhoto,
    poolId,
    billId,
    category = 'payment',
    onRatingSubmitted
}: RateUserModalProps) {
    const [rating, setRating] = useState(0);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [comment, setComment] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError("Please select a rating");
            return;
        }

        setLoading(true);
        setError("");

        try {
            await addUserRating({
                raterId,
                ratedUserId,
                rating,
                comment: comment.trim() || undefined,
                category,
                poolId,
                billId
            });

            onRatingSubmitted?.();
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to submit rating");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setRating(0);
        setHoveredRating(0);
        setComment("");
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border/50">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Rate User</h2>
                    <button
                        onClick={handleClose}
                        className="p-2 hover:bg-secondary/50 rounded-lg transition-colors"
                        disabled={loading}
                    >
                        <X className="h-5 w-5" />
                    </button>
                </div>

                {/* User Info */}
                <div className="flex items-center gap-3 mb-6 p-4 rounded-lg bg-secondary/30">
                    <Avatar
                        src={ratedUserPhoto}
                        alt={ratedUserName}
                        className="h-12 w-12"
                    />
                    <div>
                        <p className="font-semibold">{ratedUserName}</p>
                        <p className="text-sm text-muted-foreground">
                            {category === 'payment' && 'Rate their payment reliability'}
                            {category === 'reliability' && 'Rate their reliability'}
                            {category === 'communication' && 'Rate their communication'}
                            {category === 'general' && 'Rate this user'}
                        </p>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Star Rating */}
                    <div>
                        <label className="block text-sm font-semibold mb-3">
                            Rating <span className="text-destructive">*</span>
                        </label>
                        <div className="flex gap-2 justify-center">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className="transition-transform hover:scale-110"
                                    disabled={loading}
                                >
                                    <Star
                                        className={`h-10 w-10 transition-colors ${
                                            star <= (hoveredRating || rating)
                                                ? "fill-yellow-400 text-yellow-400"
                                                : "text-gray-300"
                                        }`}
                                    />
                                </button>
                            ))}
                        </div>
                        {rating > 0 && (
                            <p className="text-center text-sm text-muted-foreground mt-2">
                                {rating === 1 && "Poor"}
                                {rating === 2 && "Fair"}
                                {rating === 3 && "Good"}
                                {rating === 4 && "Very Good"}
                                {rating === 5 && "Excellent"}
                            </p>
                        )}
                    </div>

                    {/* Comment */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Comment (optional)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            disabled={loading}
                            placeholder="Share your experience..."
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-border/50 bg-background/70 backdrop-blur-sm text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 resize-none"
                        />
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
                            disabled={loading || rating === 0}
                            className="flex-1"
                        >
                            {loading ? "Submitting..." : "Submit Rating"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
