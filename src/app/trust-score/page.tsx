"use client"

import { TrustScoreIndicator } from "@/components/TrustScoreIndicator"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { Activity, CheckCircle, Clock } from "lucide-react"

export default function TrustScorePage() {
    return (
        <div className="container py-8 md:py-12">
            <div className="mx-auto max-w-4xl space-y-8">

                <div className="text-center">
                    <h1 className="text-3xl font-bold md:text-4xl">Your Reputation</h1>
                    <p className="mt-2 text-muted-foreground">Portable trust built on real actions.</p>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                    <Card className="flex flex-col items-center justify-center p-6 bg-gradient-to-br from-background to-secondary/20 border-primary/20">
                        <TrustScoreIndicator score={85} />
                        <div className="mt-4 flex gap-2">
                            <Badge variant="default" className="bg-green-500 hover:bg-green-600">High Reliability</Badge>
                            <Badge variant="outline">Top 10%</Badge>
                        </div>
                    </Card>

                    <div className="space-y-4">
                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-primary" /> Recent Activity
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <ul className="space-y-4">
                                    <li className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" /> Rent Paid on Time
                                        </span>
                                        <span className="text-muted-foreground">+5 pts</span>
                                    </li>
                                    <li className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <CheckCircle className="h-4 w-4 text-green-500" /> Commons Contribution
                                        </span>
                                        <span className="text-muted-foreground">+2 pts</span>
                                    </li>
                                    <li className="flex justify-between items-center text-sm">
                                        <span className="flex items-center gap-2">
                                            <Clock className="h-4 w-4 text-orange-500" /> Profile Verification
                                        </span>
                                        <span className="text-muted-foreground">Pending</span>
                                    </li>
                                </ul>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader className="pb-2">
                                <CardTitle className="text-lg flex items-center gap-2">
                                    <UsersIcon /> Network Vouch
                                </CardTitle>
                                <CardDescription>People who vouched for you</CardDescription>
                            </CardHeader>
                            <CardContent className="flex -space-x-2 overflow-hidden">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="inline-block h-8 w-8 rounded-full ring-2 ring-background bg-slate-400" />
                                ))}
                                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted ring-2 ring-background text-xs font-medium">
                                    +12
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>

            </div>
        </div>
    )
}

function UsersIcon() {
    return (
        <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-5 w-5 text-primary"
        >
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
        </svg>
    )
}
