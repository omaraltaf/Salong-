'use client'

import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { formatCurrency } from '@/lib/utils'

type PricingTier = {
  id: string
  label: string
  price: number
}

type PricingService = {
  id: string
  name: string
  category: string
  price_from: number | null
  price_to: number | null
  duration_minutes: number
  pricing: PricingTier[]
}

interface PricingProps {
  services: PricingService[]
}

// Norwegian category display names and sort order
const CATEGORY_META: Record<string, { label: string; order: number }> = {
  dame: { label: 'Dame', order: 0 },
  herre: { label: 'Herre', order: 1 },
  barn: { label: 'Barn', order: 2 },
  behandling: { label: 'Behandling', order: 3 },
}

function getCategoryLabel(category: string): string {
  return CATEGORY_META[category]?.label ?? category
}

function getCategoryOrder(category: string): number {
  return CATEGORY_META[category]?.order ?? 99
}

function formatPriceRange(
  priceFrom: number | null,
  priceTo: number | null,
): string | null {
  if (priceFrom === null) return null
  if (priceTo !== null && priceTo !== priceFrom) {
    return `${formatCurrency(priceFrom)} – ${formatCurrency(priceTo)}`
  }
  return formatCurrency(priceFrom)
}

const sectionVariants = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
}

const rowVariants = {
  hidden: { opacity: 0, x: -10 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.4, ease: 'easeOut' },
  },
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.06 },
  },
}

function PriceRow({
  label,
  duration,
  priceFrom,
  priceTo,
  tiers,
}: {
  label: string
  duration: number
  priceFrom: number | null
  priceTo: number | null
  tiers: PricingTier[]
}) {
  const priceDisplay = formatPriceRange(priceFrom, priceTo)
  const hasTiers = tiers.length > 0

  return (
    <motion.div variants={rowVariants}>
      {/* Main service row */}
      <div className="flex items-baseline justify-between gap-4 py-3.5">
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-sm font-medium text-[var(--color-foreground)] leading-snug">
            {label}
          </span>
          <span className="text-xs text-[var(--color-foreground)]/45">
            {duration} min
          </span>
        </div>
        {priceDisplay && !hasTiers && (
          <span
            className="shrink-0 text-sm font-semibold tabular-nums"
            style={{ color: 'var(--color-primary)' }}
          >
            {priceDisplay}
          </span>
        )}
      </div>

      {/* Pricing tiers as indented sub-rows */}
      {hasTiers && (
        <div className="mb-1 ml-4 border-l-2 pl-4" style={{ borderColor: 'var(--color-accent)' }}>
          {tiers.map((tier) => (
            <div
              key={tier.id}
              className="flex items-center justify-between gap-4 py-2"
            >
              <span className="text-xs text-[var(--color-foreground)]/60">
                {tier.label}
              </span>
              <span
                className="shrink-0 text-xs font-medium tabular-nums"
                style={{ color: 'var(--color-primary)' }}
              >
                {formatCurrency(tier.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  )
}

function CategorySection({
  category,
  services,
}: {
  category: string
  services: PricingService[]
}) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-60px' })

  return (
    <motion.div
      ref={ref}
      variants={sectionVariants}
      initial="hidden"
      animate={inView ? 'visible' : 'hidden'}
      className="mb-12 last:mb-0"
    >
      {/* Category heading */}
      <div className="mb-1 flex items-center gap-4">
        <h3
          className="text-xl font-semibold tracking-wide text-[var(--color-foreground)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {getCategoryLabel(category)}
        </h3>
        <div className="flex-1 h-px" style={{ backgroundColor: 'var(--color-accent)' }} />
      </div>

      {/* Service rows */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate={inView ? 'visible' : 'hidden'}
        className="divide-y"
        style={{ borderColor: 'var(--color-accent)/60' }}
      >
        {services.map((service) => (
          <PriceRow
            key={service.id}
            label={service.name}
            duration={service.duration_minutes}
            priceFrom={service.price_from}
            priceTo={service.price_to}
            tiers={service.pricing}
          />
        ))}
      </motion.div>
    </motion.div>
  )
}

export default function Pricing({ services }: PricingProps) {
  // Group services by category
  const grouped = services.reduce<Record<string, PricingService[]>>(
    (acc, service) => {
      const key = service.category
      if (!acc[key]) acc[key] = []
      acc[key].push(service)
      return acc
    },
    {},
  )

  // Sort categories by defined order
  const sortedCategories = Object.keys(grouped).sort(
    (a, b) => getCategoryOrder(a) - getCategoryOrder(b),
  )

  return (
    <section
      id="priser"
      className="relative py-20 md:py-28 lg:py-32"
      style={{ backgroundColor: 'var(--color-background)' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-3xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="mb-14 md:mb-18"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-foreground)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Priser
          </h2>
          <div
            className="mt-4 h-px w-16"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
          <p className="mt-4 text-sm text-[var(--color-foreground)]/50">
            Alle priser er inklusiv mva.
          </p>
        </motion.div>

        {/* Category sections */}
        {sortedCategories.length > 0 ? (
          sortedCategories.map((category) => (
            <CategorySection
              key={category}
              category={category}
              services={grouped[category]}
            />
          ))
        ) : (
          <p className="text-center text-[var(--color-foreground)]/50 py-12">
            Ingen priser tilgjengelig ennå.
          </p>
        )}
      </div>
    </section>
  )
}
