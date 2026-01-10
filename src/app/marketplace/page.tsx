"use client"

import { ListingCard } from "@/components/ListingCard"
import { motion } from "framer-motion"
import styles from "./page.module.css"

// Mock Data
const listings = [
    {
        id: 1,
        title: "Cozy Room in Mission District",
        price: 850,
        location: "Mission District, SF",
        vouchCount: 12,
        connectionType: "Direct" as const,
        hostName: "Sarah Chen",
        image: "https://images.unsplash.com/photo-1596276020587-8044fe049813?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        hostImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=100&auto=format&fit=crop&q=60"
    },
    {
        id: 2,
        title: "Sunny Studio near Campus",
        price: 980,
        location: "Berkeley, CA",
        vouchCount: 5,
        connectionType: "2nd Degree" as const,
        hostName: "David Kim",
        image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        hostImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100&auto=format&fit=crop&q=60"
    },
    {
        id: 3,
        title: "Master Bedroom with Bath",
        price: 1100,
        location: "Oakland, CA",
        vouchCount: 8,
        connectionType: "Direct" as const,
        hostName: "Elena Rodriguez",
        image: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        hostImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=60"
    },
    {
        id: 4,
        title: "Shared Loft Space",
        price: 700,
        location: "SOMA, SF",
        vouchCount: 22,
        connectionType: "3rd Degree" as const,
        hostName: "Marcus Johnson",
        image: "https://images.unsplash.com/photo-1505691938895-1758d7feb511?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.0.3",
        hostImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100&auto=format&fit=crop&q=60"
    }
]

export default function MarketplacePage() {
    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <h1 className={styles.title}>Vouch Marketplace</h1>
                <p className={styles.description}>
                    Rent from people you trust. Listings vetted by your network.
                </p>
            </div>

            <div className={styles.grid}>
                {listings.map((listing, index) => (
                    <motion.div
                        key={listing.id}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3, delay: index * 0.1 }}
                    >
                        <ListingCard {...listing} />
                    </motion.div>
                ))}
            </div>
        </div>
    )
}
