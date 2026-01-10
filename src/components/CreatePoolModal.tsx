"use client";

import { useState } from "react";
import { Button } from "./Button";
import { Input } from "./Input";
import { X, Users, Home, Wifi, ShoppingBag, Tv, Music, Coffee, Car, Zap } from "lucide-react";
import { createPool } from "@/lib/firestore-pools";
import { useAuth } from "@/contexts/AuthContext";

interface CreatePoolModalProps {
    isOpen: boolean;
    onClose: () => void;
    onPoolCreated?: (poolId: string) => void;
}

const poolIcons = [
    { name: "Users", icon: Users, value: "users" },
    { name: "Home", icon: Home, value: "home" },
    { name: "Wifi", icon: Wifi, value: "wifi" },
    { name: "Shopping", icon: ShoppingBag, value: "shopping" },
    { name: "TV", icon: Tv, value: "tv" },
    { name: "Music", icon: Music, value: "music" },
    { name: "Coffee", icon: Coffee, value: "coffee" },
    { name: "Car", icon: Car, value: "car" },
    { name: "Utilities", icon: Zap, value: "utilities" },
];

const categories = [
    "Household",
    "Utilities",
    "Entertainment",
    "Transportation",
    "Subscriptions",
    "Groceries",
    "Other"
];

export function CreatePoolModal({ isOpen, onClose, onPoolCreated }: CreatePoolModalProps) {
    const { user } = useAuth();
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState(categories[0]);
    const [selectedIcon, setSelectedIcon] = useState(poolIcons[0].value);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!user) {
            setError("You must be logged in to create a pool");
            return;
        }

        if (!name.trim()) {
            setError("Please enter a pool name");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const poolId = await createPool({
                name: name.trim(),
                description: description.trim() || undefined,
                creatorId: user.uid,
                category,
                icon: selectedIcon
            });

            onPoolCreated?.(poolId);
            handleClose();
        } catch (err: any) {
            setError(err.message || "Failed to create pool");
        } finally {
            setLoading(false);
        }
    };

    const handleClose = () => {
        setName("");
        setDescription("");
        setCategory(categories[0]);
        setSelectedIcon(poolIcons[0].value);
        setError("");
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="glass-strong rounded-2xl max-w-md w-full p-6 shadow-2xl border border-border/50 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold gradient-text">Create New Pool</h2>
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
                    {/* Pool Name */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Pool Name <span className="text-destructive">*</span>
                        </label>
                        <Input
                            type="text"
                            placeholder="e.g., Apartment 4B Utilities"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={loading}
                            className="w-full"
                        />
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            placeholder="What is this pool for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={loading}
                            rows={3}
                            className="w-full px-4 py-3 rounded-xl border-2 border-border/50 bg-background/70 backdrop-blur-sm text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 hover:border-primary/30 resize-none"
                        />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="block text-sm font-semibold mb-2">Category</label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            disabled={loading}
                            className="w-full h-12 px-4 rounded-xl border-2 border-border/50 bg-background/70 backdrop-blur-sm text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 hover:border-primary/30"
                        >
                            {categories.map((cat) => (
                                <option key={cat} value={cat}>
                                    {cat}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Icon Selection */}
                    <div>
                        <label className="block text-sm font-semibold mb-3">Select Icon</label>
                        <div className="grid grid-cols-5 gap-2">
                            {poolIcons.map((iconItem) => {
                                const IconComponent = iconItem.icon;
                                return (
                                    <button
                                        key={iconItem.value}
                                        type="button"
                                        onClick={() => setSelectedIcon(iconItem.value)}
                                        disabled={loading}
                                        className={`p-3 rounded-lg border-2 transition-all duration-300 ${selectedIcon === iconItem.value
                                                ? "border-primary bg-gradient-to-r from-primary/10 to-accent/10 scale-105"
                                                : "border-border/30 bg-secondary/30 hover:border-primary/50 hover:scale-105"
                                            }`}
                                    >
                                        <IconComponent className="h-6 w-6 mx-auto" />
                                    </button>
                                );
                            })}
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
                            disabled={loading || !name.trim()}
                            className="flex-1"
                        >
                            {loading ? "Creating..." : "Create Pool"}
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}
