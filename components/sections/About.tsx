'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface AboutProps {
  heading: string
  text: string
  imageUrl?: string
}

interface StatPill {
  label: string
  icon?: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=800&q=80'

const STAT_PILLS: StatPill[] = [
  { label: 'Siden 1986' },
  { label: '4.8 ⭐ Google' },
  { label: 'Skedsmokorset' },
]

// ---------------------------------------------------------------------------
// Animation variants
// ---------------------------------------------------------------------------

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.18,
      delayChildren: 0.05,
    },
  },
}

const slideInLeft = {
  hidden: { opacity: 0, x: -56 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
  },
}

const slideInRight = {
  hidden: { opacity: 0, x: 48 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
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

const pillVariants = {
  hidden: { opacity: 0, scale: 0.88 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
}

// ---------------------------------------------------------------------------
// StatPillList
// ---------------------------------------------------------------------------

function StatPillList() {
  return (
    <motion.div
      variants={containerVariants}
      className="mt-8 flex flex-wrap gap-3"
    >
      {STAT_PILLS.map((pill) => (
        <motion.span
          key={pill.label}
          variants={pillVariants}
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-4 py-2',
            'bg-[var(--color-accent)] text-sm font-medium text-[var(--color-foreground)]',
            'ring-1 ring-[var(--color-primary)]/20',
          )}
        >
          {pill.label}
        </motion.span>
      ))}
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// About – main export
// ---------------------------------------------------------------------------

export default function About({ heading, text, imageUrl }: AboutProps) {
  const image = imageUrl ?? FALLBACK_IMAGE

  return (
    <section
      id="om-oss"
      className="bg-[var(--color-background)] py-24 md:py-32"
      aria-labelledby="about-heading"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-start gap-12 md:flex-row md:items-center md:gap-16 lg:gap-24">
          {/* ---------------------------------------------------------------- */}
          {/* Left: image (wider column – 55%)                                 */}
          {/* ---------------------------------------------------------------- */}
          <motion.div
            variants={slideInLeft}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="relative w-full shrink-0 md:w-[55%]"
          >
            {/* Decorative background rectangle */}
            <div
              className="absolute -bottom-4 -left-4 h-full w-full rounded-2xl bg-[var(--color-accent)]"
              aria-hidden="true"
            />

            {/* Image with slight editorial rotation */}
            <div className="relative overflow-hidden rounded-2xl shadow-xl">
              <motion.div
                style={{ rotate: -2 }}
                whileInView={{ rotate: -2 }}
                className="origin-center"
              >
                <img
                  src={image}
                  alt="Blue Point frisørsalong"
                  className="aspect-[3/4] w-full object-cover object-center"
                />
              </motion.div>

              {/* Subtle vignette */}
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" aria-hidden="true" />
            </div>
          </motion.div>

          {/* ---------------------------------------------------------------- */}
          {/* Right: text content                                               */}
          {/* ---------------------------------------------------------------- */}
          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-80px' }}
            className="flex w-full flex-col md:w-[45%]"
          >
            {/* Eyebrow label */}
            <motion.span
              variants={fadeUp}
              className="mb-4 text-xs font-semibold uppercase tracking-widest text-[var(--color-primary)]"
            >
              Om oss
            </motion.span>

            {/* Heading */}
            <motion.h2
              id="about-heading"
              variants={slideInRight}
              className="font-heading text-4xl font-bold leading-tight tracking-tight text-[var(--color-foreground)] md:text-5xl"
            >
              {heading}
            </motion.h2>

            {/* Decorative divider */}
            <motion.div
              variants={fadeUp}
              className="mt-6 h-px w-16 bg-[var(--color-primary)]"
              aria-hidden="true"
            />

            {/* Rich text body (from Tiptap HTML) */}
            <motion.div
              variants={fadeUp}
              className={cn(
                'prose prose-neutral mt-6 max-w-none text-[var(--color-foreground)]/75',
                // Prose overrides to match the design system
                '[&_p]:leading-relaxed [&_p]:text-base',
                '[&_strong]:font-semibold [&_strong]:text-[var(--color-foreground)]',
                '[&_ul]:space-y-1 [&_li]:text-[var(--color-foreground)]/75',
                '[&_h2]:font-heading [&_h2]:text-[var(--color-foreground)]',
                '[&_h3]:font-heading [&_h3]:text-[var(--color-foreground)]',
              )}
              // Text comes from CMS (Tiptap HTML stored in Supabase)
              // eslint-disable-next-line react/no-danger
              dangerouslySetInnerHTML={{ __html: text }}
            />

            {/* Stat pills */}
            <StatPillList />
          </motion.div>
        </div>
      </div>
    </section>
  )
}
