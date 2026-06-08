'use client'

import {
  motion,
  useScroll,
  useTransform,
  useMotionTemplate,
} from 'framer-motion'
import { useRef } from 'react'
import Image from 'next/image'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface HeroProps {
  headline: string
  subheading: string
  heroImageUrl?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=800&q=80'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function scrollToSection(id: string) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ---------------------------------------------------------------------------
// StarIcon
// ---------------------------------------------------------------------------

function StarIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="currentColor"
      className={cn('size-4', className)}
      aria-hidden="true"
    >
      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// GoogleBadge – floating rating badge
// ---------------------------------------------------------------------------

function GoogleBadge() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 1.0, duration: 0.5, ease: 'easeOut' }}
      className="absolute bottom-6 left-6 flex items-center gap-2.5 rounded-2xl bg-white/95 px-4 py-2.5 shadow-xl backdrop-blur-sm"
    >
      {/* Google G icon */}
      <svg viewBox="0 0 24 24" className="size-5 shrink-0" aria-hidden="true">
        <path
          d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          fill="#4285F4"
        />
        <path
          d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          fill="#34A853"
        />
        <path
          d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
          fill="#FBBC05"
        />
        <path
          d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
          fill="#EA4335"
        />
      </svg>

      <div className="flex flex-col leading-none">
        <div className="flex items-center gap-0.5">
          <StarIcon className="text-amber-400" />
          <StarIcon className="text-amber-400" />
          <StarIcon className="text-amber-400" />
          <StarIcon className="text-amber-400" />
          <StarIcon className="text-amber-400" />
        </div>
        <span className="mt-0.5 text-xs font-semibold text-[var(--color-foreground)]">
          4.8 på Google
        </span>
      </div>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// Hero – main export
// ---------------------------------------------------------------------------

export default function Hero({ headline, subheading, heroImageUrl }: HeroProps) {
  const containerRef = useRef<HTMLElement>(null)
  const imageUrl = heroImageUrl ?? FALLBACK_IMAGE

  // Parallax: image shifts up slightly as user scrolls down
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start start', 'end start'],
  })
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '15%'])
  const imageTransform = useMotionTemplate`translateY(${imageY})`

  // Animation variants
  const contentVariants = {
    hidden: { opacity: 0, x: -48 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const imageVariants = {
    hidden: { opacity: 0, x: 48 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.7, ease: [0.22, 1, 0.36, 1] },
    },
  }

  const staggerChildren = {
    visible: {
      transition: {
        staggerChildren: 0.12,
        delayChildren: 0.15,
      },
    },
  }

  const fadeUp = {
    hidden: { opacity: 0, y: 24 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-screen overflow-hidden bg-[var(--color-secondary)]"
      aria-label="Velkomstseksjon"
    >
      {/* ------------------------------------------------------------------ */}
      {/* Mobile layout: image band at top, content below                     */}
      {/* Desktop layout: side-by-side (content 55 / image 45)               */}
      {/* ------------------------------------------------------------------ */}

      {/* Mobile image band */}
      <div className="absolute inset-x-0 top-0 h-[45vh] overflow-hidden md:hidden">
        <motion.div
          variants={imageVariants}
          initial="hidden"
          animate="visible"
          className="absolute inset-0 w-full h-full"
          style={{ transform: imageTransform }}
        >
          <Image
            src={imageUrl}
            alt="Blue Point frisørsalong"
            fill
            className="object-cover object-top"
            priority
          />
          {/* Gradient overlay fading into dark section below */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-[var(--color-secondary)]" />
        </motion.div>
      </div>

      {/* Main flex container - left-first layout */}
      <div className="relative z-10 flex w-full flex-col px-6 pt-[42vh] md:pt-0 md:items-start">
        {/* ---------------------------------------------------------------- */}
        {/* Left / bottom: text content                                       */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          className="flex w-full flex-col justify-center py-12 md:w-1/2 md:py-24 md:pl-12 md:pr-8"
          variants={{ ...contentVariants, ...staggerChildren }}
          initial="hidden"
          animate="visible"
        >
          {/* Eyebrow */}
          <motion.span
            variants={fadeUp}
            className="mb-4 inline-block text-sm font-semibold uppercase tracking-widest text-[var(--color-primary)]"
          >
            Frisørsalong · Skedsmokorset
          </motion.span>

          {/* Headline */}
          <motion.h1
            variants={fadeUp}
            className="font-heading text-5xl font-bold leading-[1.07] tracking-tight text-white md:text-6xl lg:text-7xl"
          >
            {headline}
          </motion.h1>

          {/* Subheading */}
          <motion.p
            variants={fadeUp}
            className="mt-6 max-w-md text-base leading-relaxed text-white/70 md:text-lg"
          >
            {subheading}
          </motion.p>

          {/* CTA buttons */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap gap-4"
          >
            <button
              onClick={() => scrollToSection('#booking')}
              className="rounded-full bg-[var(--color-primary)] px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-all hover:opacity-90 hover:shadow-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-secondary)]"
            >
              Book time
            </button>
            <button
              onClick={() => scrollToSection('#tjenester')}
              className="rounded-full border border-white/40 px-7 py-3.5 text-sm font-semibold text-white transition-all hover:border-white/80 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-secondary)]"
            >
              Se tjenester
            </button>
          </motion.div>

          {/* Trust row */}
          <motion.div
            variants={fadeUp}
            className="mt-10 flex flex-wrap items-center gap-6 text-white/50"
          >
            <span className="text-sm">Siden 1986</span>
            <span className="size-1 rounded-full bg-white/30" aria-hidden="true" />
            <span className="text-sm">Erfarne frisører</span>
            <span className="size-1 rounded-full bg-white/30" aria-hidden="true" />
            <span className="text-sm">Gratis parkering</span>
          </motion.div>
        </motion.div>

        {/* ---------------------------------------------------------------- */}
        {/* Right: image (desktop only)                                       */}
        {/* ---------------------------------------------------------------- */}
        <motion.div
          className="relative hidden md:block md:absolute md:inset-y-0 md:right-12 md:w-[45%] overflow-hidden md:rounded-2xl md:shadow-2xl"
          variants={imageVariants}
          initial="hidden"
          animate="visible"
        >
          {/* Image card with subtle parallax */}
          <motion.div
            className="absolute inset-0"
            style={{ transform: imageTransform }}
          >
            <Image
              src={imageUrl}
              alt="Blue Point frisørsalong interiør"
              fill
              className="object-cover object-center"
              priority
            />
          </motion.div>

          {/* Subtle overlay for contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 via-transparent to-transparent rounded-2xl" />

          {/* Floating Google badge inside the card */}
          <div className="absolute bottom-4 right-4">
            <GoogleBadge />
          </div>
        </motion.div>
      </div>

      {/* Mobile Google badge (below the image band) */}
      <div className="absolute left-4 top-[calc(45vh-56px)] z-20 md:hidden">
        <GoogleBadge />
      </div>

      {/* Scroll cue */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1.6, duration: 0.6 }}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 hidden md:flex flex-col items-center gap-2"
        aria-hidden="true"
      >
        <span className="text-xs uppercase tracking-widest text-white/40">Scroll</span>
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 1.5, ease: 'easeInOut' }}
          className="size-5 rounded-full border border-white/30 flex items-center justify-center"
        >
          <svg viewBox="0 0 10 10" fill="none" className="size-2.5" aria-hidden="true">
            <path d="M2 3.5L5 6.5L8 3.5" stroke="white" strokeOpacity="0.5" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}
