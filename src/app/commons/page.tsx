"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Button } from "@/components/Button"
import { Badge } from "@/components/Badge"
import { Avatar } from "@/components/Avatar"
import { Plus, Wifi, ShoppingBag, Tv, Music } from "lucide-react"

const pools = [
    {
        id: 1,
        name: "Household Essentials (Costco)",
        icon: ShoppingBag,
        totalCost: 60,
        members: [
            { name: "You", image: null },
            { name: "Sarah", image: "https://images.unsplash.com/photo-1596276020587-8044fe049813?w=100" },
            { name: "David", image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=100" }
        ],
        maxMembers: 4,
        status: "Active",
        nextPayment: "Feb 1st"
    },
    {
        id: 2,
        name: "Gigabit Internet",
        icon: Wifi,
        totalCost: 80,
        members: [
            { name: "You", image: null },
            { name: "Mike", image: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=100" },
        ],
        maxMembers: 4,
        status: "Active",
        nextPayment: "Feb 1st"
    },
    {
        id: 3,
        name: "Netflix Premium",
        icon: Tv,
        totalCost: 23,
        members: [
            { name: "Elena", image: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100" },
        ],
        maxMembers: 4,
        status: "Open Spot",
        nextPayment: "Jan 15th"
    },
    {
        id: 4,
        name: "Spotify Family",
        icon: Music,
        totalCost: 17,
        members: [
            { name: "Marcus", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=100" },
            { name: "You", image: null }
        ],
        maxMembers: 6,
        status: "Active",
        nextPayment: "Feb 5th"
    }
]

export default function CommonsPage() {
    return (
        <div className="container py-8 md:py-12">
            <div className="mx-auto max-w-5xl space-y-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                    <div>
                        <h1 className="text-3xl font-bold md:text-4xl">Commons Pool</h1>
                        <p className="mt-2 text-muted-foreground">Automated cost splitting for your circle.</p>
                    </div>
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" /> New Pool
                    </Button>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {pools.map((pool) => (
                        <Card key={pool.id} className="flex flex-col">
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-base font-medium">
                                    {pool.name}
                                </CardTitle>
                                <pool.icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent className="mt-4 flex-1">
                                <div className="text-2xl font-bold">
                                    ${(pool.totalCost / pool.members.length).toFixed(2)}
                                    <span className="text-xs font-normal text-muted-foreground">/mo per person</span>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Total: ${pool.totalCost}/mo • Next: {pool.nextPayment}
                                </p>

                                <div className="mt-6">
                                    <div className="mb-2 text-xs font-medium text-muted-foreground">Members ({pool.members.length}/{pool.maxMembers})</div>
                                    <div className="flex -space-x-2">
                                        {pool.members.map((member, i) => (
                                            <Avatar key={i} src={member.image || undefined} fallback={member.name[0]} className="border-2 border-background" />
                                        ))}
                                        {Array.from({ length: pool.maxMembers - pool.members.length }).map((_, i) => (
                                            <div key={`empty-${i}`} className="flex h-10 w-10 items-center justify-center rounded-full border-2 border-dashed border-muted bg-transparent text-muted-foreground">
                                                <Plus className="h-4 w-4" />
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="mt-6">
                                    <Button variant={pool.status === "Open Spot" ? "default" : "outline"} className="w-full">
                                        {pool.status === "Open Spot" ? "Join Pool" : "Manage"}
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </div>
    )
}
