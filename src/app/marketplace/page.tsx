"use client"

import { useState, useEffect } from "react"
import { ListingCard } from "@/components/ListingCard"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Plus, Search, Filter, X } from "lucide-react"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"
import { getAllListings, getUserProfile } from "@/lib/firestore"
import type { Listing, UserProfile } from "@/lib/firestore"
import styles from "./page.module.css"

interface ListingWithHost extends Listing {
    hostName: string;
    hostImage: string;
}

type ConnectionFilter = "All" | "Direct" | "2nd Degree" | "3rd Degree";

export default function MarketplacePage() {
    const [listings, setListings] = useState<ListingWithHost[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [connectionFilter, setConnectionFilter] = useState<ConnectionFilter>("All")
    const [showFilters, setShowFilters] = useState(false)

    useEffect(() => {
        async function loadListings() {
            try {
                const data = await getAllListings()

                // Fetch host profiles for each listing
                const listingsWithHosts = await Promise.all(
                    data.map(async (listing) => {
                        const hostProfile = await getUserProfile(listing.hostId)
                        return {
                            ...listing,
                            hostName: hostProfile?.displayName || 'Unknown Host',
                            hostImage: hostProfile?.photoURL || ''
                        }
                    })
                )

                setListings(listingsWithHosts)
            } catch (error) {
                console.error('Error loading listings:', error)
            } finally {
                setLoading(false)
            }
        }

        loadListings()
    }, [])

    // Filter listings based on search and connection type
    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesConnection = connectionFilter === "All" || listing.connectionType === connectionFilter

        return matchesSearch && matchesConnection
    })

    const connectionTypes: ConnectionFilter[] = ["All", "Direct", "2nd Degree", "3rd Degree"]

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.container}>
                    {/* Header */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                        <div className={styles.header}>
                            <h1 className={styles.title}>Vouch Marketplace</h1>
                            <p className={styles.description}>
                                Rent from people you trust. Listings vetted by your network.
                            </p>
                        </div>
                        <Link href="/listings/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Listing
                            </Button>
                        </Link>
                    </div>

                    {/* Search and Filters */}
                    <div className="mb-8 space-y-4">
                        {/* Search Bar */}
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                            <input
                                type="text"
                                placeholder="Search by location or title..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-14 pl-12 pr-4 rounded-xl border-2 border-border/50 bg-background/70 backdrop-blur-sm text-base placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary/50 transition-all duration-200 hover:border-primary/30"
                            />
                        </div>

                        {/* Filter Toggle Button (Mobile) */}
                        <div className="flex items-center justify-between md:hidden">
                            <Button
                                variant="outline"
                                onClick={() => setShowFilters(!showFilters)}
                                className="gap-2"
                            >
                                <Filter className="h-4 w-4" />
                                Filters
                                {connectionFilter !== "All" && (
                                    <Badge variant="default" className="ml-1">1</Badge>
                                )}
                            </Button>
                        </div>

                        {/* Filters Panel */}
                        <AnimatePresence>
                            {(showFilters || window.innerWidth >= 768) && (
                                <motion.div
                                    initial={{ opacity: 0, height: 0 }}
                                    animate={{ opacity: 1, height: "auto" }}
                                    exit={{ opacity: 0, height: 0 }}
                                    className="overflow-hidden"
                                >
                                    <div className="glass-strong rounded-xl p-6 border border-border/50 shadow-lg">
                                        <div className="flex items-center justify-between mb-4">
                                            <h3 className="font-semibold text-sm uppercase tracking-wider">
                                                Connection Type
                                            </h3>
                                            {connectionFilter !== "All" && (
                                                <button
                                                    onClick={() => setConnectionFilter("All")}
                                                    className="text-sm text-primary hover:text-accent transition-colors flex items-center gap-1"
                                                >
                                                    <X className="h-3.5 w-3.5" />
                                                    Clear
                                                </button>
                                            )}
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                            {connectionTypes.map((type) => (
                                                <button
                                                    key={type}
                                                    onClick={() => setConnectionFilter(type)}
                                                    className={`px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-300 ${connectionFilter === type
                                                            ? "bg-gradient-to-r from-primary to-accent text-primary-foreground shadow-md scale-105"
                                                            : "bg-secondary/50 text-foreground hover:bg-secondary hover:scale-105"
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Active Filters Summary */}
                        {(searchQuery || connectionFilter !== "All") && (
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className="text-sm text-muted-foreground">Active filters:</span>
                                {searchQuery && (
                                    <Badge variant="outline" className="gap-1.5">
                                        Search: {searchQuery}
                                        <button
                                            onClick={() => setSearchQuery("")}
                                            className="hover:text-primary transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                                {connectionFilter !== "All" && (
                                    <Badge variant="outline" className="gap-1.5">
                                        {connectionFilter}
                                        <button
                                            onClick={() => setConnectionFilter("All")}
                                            className="hover:text-primary transition-colors"
                                        >
                                            <X className="h-3 w-3" />
                                        </button>
                                    </Badge>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Listings Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block h-12 w-12 spinner"></div>
                                <p className="mt-4 text-muted-foreground">Loading listings...</p>
                            </div>
                        </div>
                    ) : filteredListings.length > 0 ? (
                        <>
                            <div className="mb-4">
                                <p className="text-sm text-muted-foreground">
                                    Showing {filteredListings.length} of {listings.length} listings
                                </p>
                            </div>
                            <div className={styles.grid}>
                                {filteredListings.map((listing, index) => (
                                    <motion.div
                                        key={listing.id}
                                        className={styles.cardWrapper}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4, delay: index * 0.1 }}
                                    >
                                        <ListingCard
                                            id={listing.id}
                                            title={listing.title}
                                            price={listing.price}
                                            location={listing.location}
                                            vouchCount={listing.vouchCount}
                                            connectionType={listing.connectionType}
                                            hostName={listing.hostName}
                                            image={listing.images[0] || "https://images.unsplash.com/photo-1596276020587-8044fe049813?w=800&auto=format&fit=crop&q=60"}
                                            hostImage={listing.hostImage}
                                        />
                                    </motion.div>
                                ))}
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12">
                            <div className="glass-strong rounded-xl p-8 max-w-md mx-auto">
                                <h3 className="text-xl font-semibold mb-2">
                                    {searchQuery || connectionFilter !== "All"
                                        ? "No listings match your filters"
                                        : "No listings yet"
                                    }
                                </h3>
                                <p className="text-muted-foreground mb-4">
                                    {searchQuery || connectionFilter !== "All"
                                        ? "Try adjusting your search or filters"
                                        : "Be the first to create a listing!"
                                    }
                                </p>
                                {searchQuery || connectionFilter !== "All" ? (
                                    <Button
                                        variant="outline"
                                        onClick={() => {
                                            setSearchQuery("")
                                            setConnectionFilter("All")
                                        }}
                                    >
                                        Clear all filters
                                    </Button>
                                ) : (
                                    <Link href="/listings/create">
                                        <Button>
                                            <Plus className="h-4 w-4 mr-2" />
                                            Create Listing
                                        </Button>
                                    </Link>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}

