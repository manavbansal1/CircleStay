"use client"

import { Card, CardContent } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Avatar } from "@/components/Avatar"
import { MapPin, Users } from "lucide-react"
import { useRouter } from "next/navigation"

interface ListingCardProps {
    id?: string
    title: string
    price: number
    location: string
    vouchCount: number
    connectionType: "Direct" | "2nd Degree" | "3rd Degree"
    hostName: string
    image: string
    hostImage: string
}

export function ListingCard({
    id,
    title,
    price,
    location,
    vouchCount,
    connectionType,
    hostName,
    image,
    hostImage
}: ListingCardProps) {
    const router = useRouter()

    const handleClick = () => {
        if (id) {
            router.push(`/listings/${id}`)
        }
    }

    return (
        <Card
            className="overflow-hidden group cursor-pointer transform transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            onClick={handleClick}
        >
            <div className="aspect-video relative overflow-hidden bg-gradient-to-br from-primary/5 to-accent/5">
                <img
                    src={image}
                    alt={title}
                    className="object-cover w-full h-full group-hover:scale-110 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <Badge
                    variant={connectionType === "Direct" ? "default" : "secondary"}
                    className="absolute top-3 right-3 shadow-lg"
                >
                    {connectionType}
                </Badge>
            </div>
            <CardContent className="p-5">
                <div className="flex justify-between items-start mb-3">
                    <h3 className="font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">{title}</h3>
                    <span className="font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent whitespace-nowrap ml-2 text-lg">
                        ${price}/mo
                    </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-4 gap-1">
                    <MapPin className="h-4 w-4 text-accent flex-shrink-0" />
                    <span className="line-clamp-1">{location}</span>
                </div>
                <div className="flex items-center justify-between pt-4 border-t border-border/50">
                    <div className="flex items-center gap-2">
                        <Avatar src={hostImage} alt={hostName} className="h-8 w-8" />
                        <span className="text-sm font-medium">{hostName}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-muted-foreground bg-secondary/30 px-2.5 py-1 rounded-full">
                        <Users className="h-3.5 w-3.5 text-primary" />
                        <span className="font-medium">{vouchCount}</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}

