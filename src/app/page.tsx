"use client"

import { Button } from "@/components/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { ArrowRight, ShieldCheck, Users, Wallet } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"

export default function Home() {
  return (
    <div className="flex flex-col">
      {/* Hero Section */}
      <section className="relative flex min-h-[80vh] flex-col items-center justify-center overflow-hidden border-b bg-background px-4 py-24 text-center md:px-0">
        <div className="absolute inset-0 -z-10 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px]"></div>
        <div className="absolute left-0 right-0 top-0 -z-10 m-auto h-[310px] w-[310px] rounded-full bg-primary/20 opacity-20 blur-[100px]"></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="container flex max-w-[64rem] flex-col items-center gap-4 text-center"
        >
          <Badge variant="secondary" className="mb-4">
            🚧  Now Accepting Early Access
          </Badge>
          <h1 className="font-heading text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
            Stop Paying the <span className="text-primary">Trust Tax</span>.
          </h1>
          <p className="max-w-[42rem] leading-normal text-muted-foreground sm:text-xl sm:leading-8">
            Rent isn't expensive just because of the market. It's expensive because of strangers.
            Unlock $700 rent prices by leveraging your extended social circle.
          </p>
          <div className="space-x-4">
            <Link href="/marketplace">
              <Button size="lg" className="gap-2">
                Find a Room <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link href="/trust-score">
              <Button variant="outline" size="lg">
                Build Trust Score
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="container space-y-6 bg-slate-50 py-8 dark:bg-transparent md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
          <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
            Why CircleStay?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            We replace high-risk marketplaces with a verified "Vouch System".
          </p>
        </div>
        <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
          <Card>
            <CardHeader>
              <Users className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Vouch Marketplace</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Access unlisted rooms available only to friends-of-friends. No random strangers.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <ShieldCheck className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Trust Score</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Build a portable reputation through on-time payments and community contributions.
              </CardDescription>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <Wallet className="mb-2 h-10 w-10 text-primary" />
              <CardTitle>Commons Pool</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>
                Automatically split costs for essential services like Costco, Netflix, and Internet.
              </CardDescription>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="container py-8 md:py-12 lg:py-24">
        <div className="mx-auto flex max-w-[58rem] flex-col items-center justify-center gap-4 text-center">
          <h2 className="font-heading text-3xl font-bold leading-[1.1] sm:text-3xl md:text-6xl">
            Ready to break the cycle?
          </h2>
          <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
            Join the network of verified students and professionals sharing housing and costs.
          </p>
          <Button size="lg" className="mt-4">
            Join the Waitlist
          </Button>
        </div>
      </section>
    </div>
  )
}
