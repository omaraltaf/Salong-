'use client'

import type { CSSProperties } from 'react'
import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { cn } from '@/lib/utils'

type Testimonial = {
  id: string
  author_name: string
  content: string
  rating: number
}

interface TestimonialsProps {
  testimonials: Testimonial[]
}

function StarIcon({ filled }: { filled: boolean }) {
  return (
    <svg
      viewBox="0 0 20 20"
      className="h-4 w-4"
      aria-hidden="true"
      fill={filled ? 'var(--color-primary)' : 'none'}
      stroke="var(--color-primary)"
      strokeWidth="1.5"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
      />
    </svg>
  )
}

function StarRating({ rating }: { rating: number }) {
  const clamped = Math.min(5, Math.max(0, Math.round(rating)))
  return (
    <div className="flex items-center gap-0.5" aria-label={`${clamped} av 5 stjerner`}>
      {Array.from({ length: 5 }, (_, i) => (
        <StarIcon key={i} filled={i < clamped} />
      ))}
    </div>
  )
}

function QuoteIcon({ className, style }: { className?: string; style?: CSSProperties }) {
  return (
    <svg
      className={className}
      style={style}
      viewBox="0 0 32 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M0 24V14.4C0 9.6 1.6 5.867 4.8 3.2 8 .533 12.267-.533 17.6 0l.8 2.4C14.4 3.2 11.6 4.4 9.6 6.4 7.6 8.267 6.667 10.667 6.8 13.6H12V24H0zm20 0V14.4c0-4.8 1.6-8.533 4.8-11.2C28 .533 32.267-.533 37.6 0l.8 2.4C34.4 3.2 31.6 4.4 29.6 6.4c-2 1.867-2.933 4.267-2.8 7.2H32V24H20z" />
    </svg>
  )
}

function TestimonialCard({ testimonial }: { testimonial: Testimonial }) {
  return (
    <article
      className={cn(
        'relative flex flex-col gap-5 rounded-2xl p-6 md:p-7',
        'min-w-[320px] max-w-[380px]',
        'shadow-sm',
        'bg-[var(--color-secondary)]',
      )}
    >
      {/* Decorative quote mark */}
      <QuoteIcon
        className="absolute top-5 right-6 h-8 w-8 opacity-10"
        style={{ color: 'var(--color-primary)' }}
      />

      {/* Rating */}
      <StarRating rating={testimonial.rating} />

      {/* Content */}
      <blockquote className="text-sm leading-relaxed text-[var(--color-foreground)]/75 flex-1">
        {testimonial.content}
      </blockquote>

      {/* Author */}
      <footer className="flex items-center gap-3 pt-3 mt-2">
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-black"
          style={{ backgroundColor: 'var(--color-primary)' }}
          aria-hidden="true"
        >
          {testimonial.author_name.charAt(0).toUpperCase()}
        </div>
        <span className="text-sm font-medium text-[var(--color-foreground)]">
          {testimonial.author_name}
        </span>
      </footer>
    </article>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center gap-4 py-16 text-center">
      <div
        className="flex h-16 w-16 items-center justify-center rounded-full"
        style={{ backgroundColor: 'var(--color-accent)' }}
      >
        <svg
          className="h-8 w-8"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          style={{ color: 'var(--color-primary)' }}
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </div>
      <p
        className="text-base font-medium"
        style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-foreground)' }}
      >
        Bli den første til å gi oss en omtale
      </p>
      <p className="text-sm text-[var(--color-foreground)]/50 max-w-xs">
        Vi setter stor pris på tilbakemeldinger fra våre kunder.
      </p>
    </div>
  )
}

export default function Testimonials({ testimonials }: TestimonialsProps) {
  const ref = useRef<HTMLDivElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })

  // Duplicate items to create the seamless infinite loop
  const doubled = [...testimonials, ...testimonials]

  return (
    <section
      id="omtaler"
      className="relative py-20 md:py-28 lg:py-32 overflow-hidden"
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
          <h2 className="font-heading text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-[var(--color-foreground)]">
            Hva kundene sier
          </h2>
          <div
            className="mx-auto mt-4 h-px w-16"
            style={{ backgroundColor: 'var(--color-primary)' }}
          />
        </motion.div>
      </div>

      {/* Carousel / empty state */}
      <motion.div
        ref={ref}
        initial={{ opacity: 0 }}
        animate={inView ? { opacity: 1 } : { opacity: 0 }}
        transition={{ duration: 0.7, delay: 0.2 }}
      >
        {testimonials.length === 0 ? (
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
            <EmptyState />
          </div>
        ) : (
          <>
            {/* Edge fade masks */}
            <div
              className="relative"
              style={{
                maskImage:
                  'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
                WebkitMaskImage:
                  'linear-gradient(to right, transparent 0%, black 8%, black 92%, transparent 100%)',
              }}
            >
              {/* Scrolling track — pause on hover */}
              <div
                className="flex gap-6 animate-[scroll-left_40s_linear_infinite] hover:[animation-play-state:paused] w-max"
              >
                {doubled.map((testimonial, index) => (
                  <TestimonialCard
                    key={`${testimonial.id}-${index}`}
                    testimonial={testimonial}
                  />
                ))}
              </div>
            </div>
          </>
        )}
      </motion.div>
    </section>
  )
}
