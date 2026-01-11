"use client"

import { useState, useEffect } from "react"
import { ListingCard } from "@/components/ListingCard"
import { ProtectedRoute } from "@/components/ProtectedRoute"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Plus, Search, X, Home, Users, MapPin, DollarSign } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import { getAllListings, getUserProfile } from "@/lib/firestore"
import type { Listing } from "@/lib/firestore"
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
    const [priceRange, setPriceRange] = useState<[number, number]>([0, 10000])
    const [selectedType, setSelectedType] = useState<string>("all")

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
                
                // Set initial price range based on available listings
                if (listingsWithHosts.length > 0) {
                    const prices = listingsWithHosts.map(l => l.price)
                    const maxPrice = Math.max(...prices)
                    setPriceRange([0, maxPrice])
                }
            } catch (error) {
                console.error('Error loading listings:', error)
            } finally {
                setLoading(false)
            }
        }

        loadListings()
    }, [])

    // Filter listings based on all criteria
    const filteredListings = listings.filter(listing => {
        const matchesSearch = listing.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            listing.location.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesConnection = connectionFilter === "All" || listing.connectionType === connectionFilter
        const matchesPrice = listing.price >= priceRange[0] && listing.price <= priceRange[1]
        const matchesType = selectedType === "all" || listing.type === selectedType

        return matchesSearch && matchesConnection && matchesPrice && matchesType
    })

    const connectionTypes: ConnectionFilter[] = ["All", "Direct", "2nd Degree", "3rd Degree"]
    const propertyTypes = [
        { value: "all", label: "All Types" },
        { value: "apartment", label: "Apartment" },
        { value: "house", label: "House" },
        { value: "room", label: "Room" },
        { value: "studio", label: "Studio" }
    ]

    const hasActiveFilters = searchQuery || connectionFilter !== "All" || selectedType !== "all"

    const clearAllFilters = () => {
        setSearchQuery("")
        setConnectionFilter("All")
        setSelectedType("all")
        if (listings.length > 0) {
            const prices = listings.map(l => l.price)
            const maxPrice = Math.max(...prices)
            setPriceRange([0, maxPrice])
        }
    }

    return (
        <ProtectedRoute>
            <div className={styles.page}>
                <div className={styles.wrapper}>
                    {/* Header */}
                    <div className={styles.header}>
                        <div className={styles.headerText}>
                            <h1>Vouch Marketplace</h1>
                            <p>Rent from people you trust. Listings vetted by your network.</p>
                        </div>
                        <Link href="/listings/create">
                            <Button className="gap-2 shadow-lg">
                                <Plus className="h-4 w-4" />
                                Create Listing
                            </Button>
                        </Link>
                    </div>

                    {/* Main Content with Sidebar */}
                    <div className={styles.mainContent}>
                        {/* Sidebar Filters */}
                        <aside className={styles.sidebar}>
                            <div className={styles.filterSection}>
                                <div className={styles.filterHeader}>
                                    <h3>Filters</h3>
                                    {hasActiveFilters && (
                                        <button
                                            onClick={clearAllFilters}
                                            className={styles.clearButton}
                                        >
                                            Clear All
                                        </button>
                                    )}
                                </div>

                                {/* Search */}
                                <div className={styles.filterGroup}>
                                    <label>
                                        <Search className="h-4 w-4" />
                                        Search
                                    </label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            placeholder="Location or title..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className={styles.searchInput}
                                        />
                                        {searchQuery && (
                                            <button
                                                onClick={() => setSearchQuery("")}
                                                className={styles.clearInputButton}
                                            >
                                                <X className="h-4 w-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>

                                {/* Connection Type */}
                                <div className={styles.filterGroup}>
                                    <label>
                                        <Users className="h-4 w-4" />
                                        Connection Type
                                    </label>
                                    <div className={styles.filterOptions}>
                                        {connectionTypes.map((type) => (
                                            <button
                                                key={type}
                                                onClick={() => setConnectionFilter(type)}
                                                className={connectionFilter === type ? styles.filterOptionActive : styles.filterOption}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Property Type */}
                                <div className={styles.filterGroup}>
                                    <label>
                                        <Home className="h-4 w-4" />
                                        Property Type
                                    </label>
                                    <div className={styles.filterOptions}>
                                        {propertyTypes.map((type) => (
                                            <button
                                                key={type.value}
                                                onClick={() => setSelectedType(type.value)}
                                                className={selectedType === type.value ? styles.filterOptionActive : styles.filterOption}
                                            >
                                                {type.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Price Range */}
                                <div className={styles.filterGroup}>
                                    <label>
                                        <DollarSign className="h-4 w-4" />
                                        Price Range
                                    </label>
                                    <div className={styles.priceRange}>
                                        <div className={styles.priceInputs}>
                                            <input
                                                type="number"
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([parseInt(e.target.value) || 0, priceRange[1]])}
                                                placeholder="Min"
                                                className={styles.priceInput}
                                            />
                                            <span>-</span>
                                            <input
                                                type="number"
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], parseInt(e.target.value) || 10000])}
                                                placeholder="Max"
                                                className={styles.priceInput}
                                            />
                                        </div>
                                        <div className={styles.sliderContainer}>
                                            <input
                                                type="range"
                                                min="0"
                                                max={Math.max(...listings.map(l => l.price), 10000)}
                                                value={priceRange[0]}
                                                onChange={(e) => setPriceRange([Math.min(parseInt(e.target.value), priceRange[1] - 100), priceRange[1]])}
                                                className={styles.rangeSlider}
                                                style={{ zIndex: priceRange[0] > (Math.max(...listings.map(l => l.price), 10000) / 2) ? 5 : 3 }}
                                            />
                                            <input
                                                type="range"
                                                min="0"
                                                max={Math.max(...listings.map(l => l.price), 10000)}
                                                value={priceRange[1]}
                                                onChange={(e) => setPriceRange([priceRange[0], Math.max(parseInt(e.target.value), priceRange[0] + 100)])}
                                                className={styles.rangeSlider}
                                                style={{ zIndex: priceRange[0] > (Math.max(...listings.map(l => l.price), 10000) / 2) ? 3 : 5 }}
                                            />
                                        </div>
                                        <div className={styles.priceLabels}>
                                            <span>${priceRange[0]}</span>
                                            <span>${priceRange[1]}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </aside>

                        {/* Listings Content */}
                        <div className={styles.content}>
                            {/* Results Header */}
                            <div className={styles.resultsHeader}>
                                <p className={styles.resultsCount}>
                                    {loading ? "Loading..." : `${filteredListings.length} ${filteredListings.length === 1 ? 'listing' : 'listings'} found`}
                                </p>
                            </div>

                            {/* Listings Grid */}
                            {loading ? (
                                <div className={styles.loadingState}>
                                    <div className="inline-block h-12 w-12 spinner"></div>
                                    <p>Loading listings...</p>
                                </div>
                            ) : filteredListings.length > 0 ? (
                                <div className={styles.grid}>
                                    {filteredListings.map((listing, index) => (
                                        <motion.div
                                            key={listing.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ duration: 0.4, delay: index * 0.05 }}
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
                                <div className={styles.emptyState}>
                                    <h3>
                                        {hasActiveFilters
                                            ? "No listings match your filters"
                                            : "No listings yet"
                                        }
                                    </h3>
                                    <p>
                                        {hasActiveFilters
                                            ? "Try adjusting your search or filters"
                                            : "Be the first to create a listing!"
                                        }
                                    </p>
                                    {hasActiveFilters ? (
                                        <Button variant="outline" onClick={clearAllFilters}>
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
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </ProtectedRoute>
    )
}
