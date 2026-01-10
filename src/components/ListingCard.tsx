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
            className="overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
            onClick={handleClick}
        >
            <div className="aspect-video relative overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="object-cover w-full h-full hover:scale-105 transition-transform duration-300"
                />
                <Badge
                    variant={connectionType === "Direct" ? "default" : "secondary"}
                    className="absolute top-2 right-2"
                >
                    {connectionType}
                </Badge>
            </div>
            <CardContent className="p-4">
                <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-lg line-clamp-1">{title}</h3>
                    <span className="font-bold text-primary whitespace-nowrap ml-2">
                        ${price}/mo
                    </span>
                </div>
                <div className="flex items-center text-sm text-muted-foreground mb-3">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span className="line-clamp-1">{location}</span>
                </div>
                <div className="flex items-center justify-between pt-3 border-t">
                    <div className="flex items-center gap-2">
                        <Avatar name={hostName} src={hostImage} size="sm" />
                        <span className="text-sm font-medium">{hostName}</span>
                    </div>
                    <div className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Users className="h-4 w-4" />
                        <span>{vouchCount} vouches</span>
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
