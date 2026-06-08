'use client'

import { useState, useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn, formatCurrency } from '@/lib/utils'

type Service = {
  id: string
  name: string
  description: string | null
  duration_minutes: number
  price_from: number | null
  price_to: number | null
  category: 'dame' | 'herre' | 'barn' | 'behandling'
  icon: string | null
  is_active: boolean
  sort_order: number
}

interface ServicesProps {
  services: Service[]
}

type CategoryKey = 'alle' | Service['category']

const CATEGORY_LABELS: Record<CategoryKey, string> = {
  alle: 'Alle',
  dame: 'Dame',
  herre: 'Herre',
  barn: 'Barn',
  behandling: 'Behandling',
}

// Inline SVG icons — simple, single-stroke style
function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  )
}

function RazorIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 2h6l3 7H6L9 2z" />
      <rect x="5" y="9" width="14" height="10" rx="2" />
      <line x1="12" y1="9" x2="12" y2="19" />
      <line x1="8" y1="13" x2="16" y2="13" />
    </svg>
  )
}

function ChildIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="12" cy="5" r="3" />
      <path d="M6 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2" />
      <path d="M8 10.5c0 0 1.5 1.5 4 1.5s4-1.5 4-1.5" />
    </svg>
  )
}

function LeafIcon({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10z" />
      <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
    </svg>
  )
}

function CategoryIcon({
  category,
  className,
}: {
  category: Service['category']
  className?: string
}) {
  switch (category) {
    case 'dame':
      return <ScissorsIcon className={className} />
    case 'herre':
      return <RazorIcon className={className} />
    case 'barn':
      return <ChildIcon className={className} />
    case 'behandling':
      return <LeafIcon className={className} />
  }
}

const containerVariants = {
  hidden: {},
  visible: {
    transition: {
      staggerChildren: 0.08,
    },
  },
}

const cardVariants = {
  hidden: { opacity: 0, y: 28 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  },
}

function ServiceCard({ service }: { service: Service }) {
  const priceLabel =
    service.price_from !== null
      ? service.price_to !== null && service.price_to !== service.price_from
        ? `fra ${formatCurrency(service.price_from)}`
        : `${formatCurrency(service.price_from)}`
      : null

  return (
    <motion.article
      variants={cardVariants}
      className={cn(
        'group relative flex flex-col gap-4 rounded-2xl p-6',
        'bg-[var(--color-background)] border border-[var(--color-accent)]/40',
        'shadow-sm transition-all duration-300 ease-out',
        'hover:-translate-y-1 hover:shadow-md hover:border-[var(--color-primary)]/30',
      )}
    >
      {/* Icon */}
      <div
        className={cn(
          'flex h-11 w-11 items-center justify-center rounded-xl',
          'bg-[var(--color-accent)]/50 text-[var(--color-primary)]',
          'transition-colors duration-300 group-hover:bg-[var(--color-primary)]/10',
        )}
      >
        <CategoryIcon category={service.category} className="h-5 w-5" />
      </div>

      {/* Content */}
      <div className="flex flex-col gap-2 flex-1">
        <h3
          className="font-heading text-base font-semibold leading-snug text-[var(--color-foreground)]"
          style={{ fontFamily: 'var(--font-heading)' }}
        >
          {service.name}
        </h3>
        {service.description && (
          <p className="text-sm leading-relaxed text-[var(--color-foreground)]/60 line-clamp-3">
            {service.description}
          </p>
        )}
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-2 border-t border-[var(--color-accent)]/40">
        <span className="inline-flex items-center gap-1 text-xs text-[var(--color-foreground)]/50">
          <svg
            className="h-3.5 w-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            aria-hidden="true"
          >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
          </svg>
          {service.duration_minutes} min
        </span>
        {priceLabel && (
          <span
            className="text-sm font-semibold"
            style={{ color: 'var(--color-primary)' }}
          >
            {priceLabel}
          </span>
        )}
      </div>
    </motion.article>
  )
}

export default function Services({ services }: ServicesProps) {
  const activeServices = services.filter((s) => s.is_active)
  const showTabs = activeServices.length > 5

  const categories = Array.from(
    new Set(activeServices.map((s) => s.category)),
  ) as Service['category'][]

  const tabKeys: CategoryKey[] = showTabs
    ? ['alle', ...categories]
    : categories

  const [activeTab, setActiveTab] = useState<CategoryKey>('alle')

  const filtered =
    activeTab === 'alle'
      ? activeServices
      : activeServices.filter((s) => s.category === activeTab)

  const sorted = [...filtered].sort((a, b) => a.sort_order - b.sort_order)

  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  return (
    <section
      id="tjenester"
      className="relative py-20 md:py-28 lg:py-32"
      style={{ backgroundColor: 'var(--color-muted)' }}
    >
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-center mb-12 md:mb-16"
        >
          <h2
            className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-foreground)]"
            style={{ fontFamily: 'var(--font-heading)' }}
          >
            Våre tjenester
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        </motion.div>

        {/* Category tabs */}
        {showTabs && (
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="mb-10 md:mb-12"
          >
            {/* Mobile: horizontal scroll */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none md:justify-center">
              {tabKeys.map((key) => (
                <button
                  key={key}
                  onClick={() => setActiveTab(key)}
                  className={cn(
                    'shrink-0 rounded-full px-5 py-2 text-sm font-medium transition-all duration-200',
                    activeTab === key
                      ? 'text-white shadow-sm'
                      : 'bg-[var(--color-background)] text-[var(--color-foreground)]/60 hover:text-[var(--color-foreground)] border border-[var(--color-accent)]',
                  )}
                  style={
                    activeTab === key
                      ? { backgroundColor: 'var(--color-primary)' }
                      : {}
                  }
                >
                  {CATEGORY_LABELS[key]}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* Cards grid — mobile horizontal scroll, md+ regular grid */}
        <div ref={ref}>
          {/* Mobile scroll container */}
          <div className="md:hidden overflow-x-auto pb-4 scrollbar-none">
            <motion.div
              key={activeTab}
              variants={containerVariants}
              initial="hidden"
              animate={inView ? 'visible' : 'hidden'}
              className="flex gap-4"
              style={{ width: 'max-content' }}
            >
              {sorted.map((service) => (
                <div key={service.id} className="w-72 shrink-0">
                  <ServiceCard service={service} />
                </div>
              ))}
            </motion.div>
          </div>

          {/* Desktop grid */}
          <motion.div
            key={`desktop-${activeTab}`}
            variants={containerVariants}
            initial="hidden"
            animate={inView ? 'visible' : 'hidden'}
            className="hidden md:grid grid-cols-2 lg:grid-cols-3 gap-5 lg:gap-6"
          >
            {sorted.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </motion.div>
        </div>

        {sorted.length === 0 && (
          <p className="text-center text-[var(--color-foreground)]/50 py-12">
            Ingen tjenester i denne kategorien ennå.
          </p>
        )}
      </div>
    </section>
  )
}
