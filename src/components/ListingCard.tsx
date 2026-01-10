import { Card, CardContent, CardFooter, CardHeader } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Button } from "@/components/Button"
import { Avatar } from "@/components/Avatar"
import { MapPin, Users, Heart } from "lucide-react"

interface ListingCardProps {
    image: string
    title: string
    price: number
    location: string
    vouchCount: number
    connectionType: "Direct" | "2nd Degree" | "3rd Degree"
    hostName: string
    hostImage?: string
}

export function ListingCard({
    image,
    title,
    price,
    location,
    vouchCount,
    connectionType,
    hostName,
    hostImage,
}: ListingCardProps) {
    return (
        <Card className="overflow-hidden bg-card transition-all hover:shadow-lg">
            <div className="relative aspect-video w-full overflow-hidden">
                <img
                    src={image}
                    alt={title}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                />
                <div className="absolute right-3 top-3">
                    <Badge
                        variant={connectionType === "Direct" ? "default" : "secondary"}
                        className="backdrop-blur-md"
                    >
                        {connectionType}
                    </Badge>
                </div>
            </div>
            <CardHeader className="p-4">
                <div className="flex items-start justify-between">
                    <div>
                        <h3 className="font-semibold">{title}</h3>
                        <div className="flex items-center text-sm text-muted-foreground">
                            <MapPin className="mr-1 h-3 w-3" />
                            {location}
                        </div>
                    </div>
                    <p className="font-bold text-primary">${price}/mo</p>
                </div>
            </CardHeader>
            <CardContent className="p-4 pt-0">
                <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                        <Avatar src={hostImage} alt={hostName} className="h-6 w-6" />
                        <span className="text-muted-foreground">Hosted by {hostName}</span>
                    </div>
                </div>
                <div className="mt-4 flex items-center gap-2 rounded-md bg-secondary/50 p-2 text-xs">
                    <Users className="h-3 w-3 text-primary" />
                    <span className="font-medium text-primary">{vouchCount} mutual friends</span> vouch for this.
                </div>
            </CardContent>
            <CardFooter className="p-4 pt-0">
                <Button className="w-full">Request to View</Button>
            </CardFooter>
        </Card>
    )
}
