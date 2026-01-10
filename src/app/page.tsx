"use client"

import { Button } from "@/components/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { ArrowRight, ShieldCheck, Users, Wallet } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroGrid}></div>
        <div className={styles.heroGlow}></div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={styles.heroContent}
        >
          <Badge variant="secondary" className={styles.badge}>
            🚧  Now Accepting Early Access
          </Badge>
          <h1 className={styles.heroTitle}>
            Stop Paying the <span className={styles.primaryText}>Trust Tax</span>.
          </h1>
          <p className={styles.heroDescription}>
            Rent isn't expensive just because of the market. It's expensive because of strangers.
            Unlock $700 rent prices by leveraging your extended social circle.
          </p>
          <div className={styles.heroActions}>
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
      <section className={`${styles.features} container`}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>
            Why CircleStay?
          </h2>
          <p className={styles.featuresDescription}>
            We replace high-risk marketplaces with a verified "Vouch System".
          </p>
        </div>
        <div className={styles.featuresGrid}>
          <Card>
            <CardHeader>
              <Users className={styles.featureIcon} />
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
              <ShieldCheck className={styles.featureIcon} />
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
              <Wallet className={styles.featureIcon} />
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
      <section className={`${styles.cta} container`}>
        <div className={styles.ctaContent}>
          <h2 className={styles.ctaTitle}>
            Ready to break the cycle?
          </h2>
          <p className={styles.ctaDescription}>
            Join the network of verified students and professionals sharing housing and costs.
          </p>
          <Button size="lg" className={styles.ctaButton}>
            Join the Waitlist
          </Button>
        </div>
      </section>
    </div>
  )
}
