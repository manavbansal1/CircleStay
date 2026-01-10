"use client"

import { useState, useEffect } from "react"
import { ListingCard } from "@/components/ListingCard"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/Button"
import { Plus } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getAllListings, getUserProfile } from "@/lib/firestore"
import type { Listing, UserProfile } from "@/lib/firestore"
import styles from "./page.module.css"

interface ListingWithHost extends Listing {
    hostName: string;
    hostImage: string;
}

export default function MarketplacePage() {
    const [listings, setListings] = useState<ListingWithHost[]>([])
    const [loading, setLoading] = useState(true)

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

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.container}>
                    <div className="flex justify-between items-start mb-8">
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

                    {loading ? (
                        <div className="flex items-center justify-center py-12">
                            <div className="text-center">
                                <div className="inline-block h-12 w-12 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent"></div>
                                <p className="mt-4 text-muted-foreground">Loading listings...</p>
                            </div>
                        </div>
                    ) : listings.length > 0 ? (
                        <div className={styles.grid}>
                            {listings.map((listing, index) => (
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
                    ) : (
                        <div className="text-center py-12">
                            <h3 className="text-xl font-semibold mb-2">No listings yet</h3>
                            <p className="text-muted-foreground mb-4">Be the first to create a listing!</p>
                            <Link href="/listings/create">
                                <Button>
                                    <Plus className="h-4 w-4 mr-2" />
                                    Create Listing
                                </Button>
                            </Link>
                        </div>
                    )}
                </div>
            </div>
        </ProtectedRoute>
    )
}
