"use client"

import { Button } from "@/components/Button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/Card"
import { Badge } from "@/components/Badge"
import { ArrowRight, ShieldCheck, Users, Wallet, Sparkles, Zap, Trophy } from "lucide-react"
import Link from "next/link"
import { motion } from "framer-motion"
import styles from "./page.module.css"

export default function Home() {
  return (
    <div className={styles.container}>
      {/* Hero Section */}
      <section className={styles.hero}>
        {/* Background Elements */}
        <div className={styles.heroGradient} />
        <div className={styles.heroCircle1} />
        <div className={styles.heroCircle2} />

        <div className={styles.heroContent}>
          {/* Left Content */}
          <div className={styles.heroLeft}>
            <div className={styles.heroBadge}>
              <Sparkles className="w-4 h-4" />
              Trusted Housing Platform
            </div>

            <h1 className={styles.heroTitle}>
              Stop Paying the <span className={styles.primaryGradient}>Trust Tax</span>.
            </h1>

            <p className={styles.heroDescription}>
              Rent isn't expensive just because of the market. It's expensive because of strangers.
              Unlock <strong>$700 rent prices</strong> by leveraging your extended social circle.
            </p>

            <div className={styles.heroActions}>
              <Link href="/marketplace">
                <Button size="lg" className="gap-2 shadow-lg">
                  Find a Room <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/trust-score">
                <Button variant="outline" size="lg" className="backdrop-blur-sm bg-white/70">
                  Build Trust Score
                </Button>
              </Link>
            </div>
          </div>

          {/* Right Content - App Mockup */}
          <div className={styles.heroRight}>
            <div className={styles.heroImageContainer}>
              <img
                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?w=800&auto=format&fit=crop&q=60"
                alt="Modern Housing"
                className="w-full h-full object-cover"
              />
              <div className={styles.heroImageGlow} />
            </div>

            {/* Floating stat cards */}
            <div className={`${styles.floatingCard} ${styles.floatingCard1}`}>
              <div className={styles.floatingCardContent}>
                <div className={styles.floatingCardIcon}>
                  <Zap className="w-6 h-6" />
                </div>
                <div className={styles.floatingCardText}>
                  <div className={styles.floatingCardLabel}>Avg. Savings</div>
                  <div className={styles.floatingCardValue}>$400/mo</div>
                </div>
              </div>
            </div>

            <div className={`${styles.floatingCard} ${styles.floatingCard2}`}>
              <div className={styles.floatingCardContent}>
                <div className={styles.floatingCardIcon}>
                  <Trophy className="w-6 h-6" />
                </div>
                <div className={styles.floatingCardText}>
                  <div className={styles.floatingCardLabel}>Trust Score</div>
                  <div className={styles.floatingCardValue}>95%</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className={`${styles.features} container`}>
        <div className={styles.featuresHeader}>
          <h2 className={styles.featuresTitle}>
            Everything You Need to{' '}
            <span className={styles.primaryGradient}>Find Your Home</span>
          </h2>
          <p className={styles.featuresDescription}>
            We replace high-risk marketplaces with a verified "Vouch System".
          </p>
        </div>

        <div className={styles.featuresGrid}>
          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Users className="w-7 h-7" />
            </div>
            <CardTitle className="mb-2">Vouch Marketplace</CardTitle>
            <CardDescription>
              Access unlisted rooms available only to friends-of-friends. No random strangers.
            </CardDescription>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <ShieldCheck className="w-7 h-7" />
            </div>
            <CardTitle className="mb-2">Trust Score</CardTitle>
            <CardDescription>
              Build a portable reputation through on-time payments and community contributions.
            </CardDescription>
          </div>

          <div className={styles.featureCard}>
            <div className={styles.featureIcon}>
              <Wallet className="w-7 h-7" />
            </div>
            <CardTitle className="mb-2">Commons Pool</CardTitle>
            <CardDescription>
              Automatically split costs for essential services like Costco, Netflix, and Internet.
            </CardDescription>
          </div>
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
