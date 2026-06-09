'use client'

import Image from 'next/image'

interface HeroProps {
  headline: string
  subheading: string
  heroImageUrl?: string
}

const FALLBACK_IMAGE =
  'https://images.unsplash.com/photo-1560066984-138dadb4c035?w=1200&q=80'

function scrollToSection(id: string) {
  const el = document.getElementById(id.replace('#', ''))
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

export default function Hero({ headline, subheading, heroImageUrl }: HeroProps) {
  const imageUrl = heroImageUrl ?? FALLBACK_IMAGE

  return (
    <section id="hero" className="relative overflow-hidden bg-[var(--color-background)] text-[var(--color-foreground)]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(196,168,130,0.08),transparent_32%),linear-gradient(180deg,rgba(7,10,18,0.95),rgba(7,10,18,0.98))]"
        aria-hidden="true"
      />

      <div className="mx-auto grid max-w-7xl gap-12 px-6 py-20 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:py-24">
        <div className="relative z-10 flex flex-col justify-center gap-8">
          <span className="inline-flex max-w-max rounded-full bg-[var(--color-primary)]/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.28em] text-[var(--color-primary)]">
            Blue Point · Skedsmokorset
          </span>

          <div className="space-y-6">
            <h1 className="text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl lg:text-6xl">
              {headline}
            </h1>
            <p className="max-w-2xl text-base leading-8 text-[var(--color-foreground)]/70 sm:text-lg">
              {subheading}
            </p>
          </div>

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <button
              type="button"
              onClick={() => scrollToSection('#booking')}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-95"
            >
              Book time
            </button>
            <button
              type="button"
              onClick={() => scrollToSection('#tjenester')}
              className="inline-flex items-center justify-center rounded-full bg-[var(--color-accent)]/25 px-6 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:bg-[var(--color-accent)]/35"
            >
              Se tjenester
            </button>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <div className="rounded-2xl bg-[var(--color-secondary)] p-5 text-sm shadow-lg shadow-black/30">
              <p className="font-semibold text-[var(--color-foreground)]">Rask og enkel booking</p>
              <p className="mt-2 text-sm text-[var(--color-foreground)]/70">Book online på sekunder, og kom til avtalt tid.</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-secondary)] p-5 text-sm shadow-lg shadow-black/30">
              <p className="font-semibold text-[var(--color-foreground)]">Erfarne frisører</p>
              <p className="mt-2 text-sm text-[var(--color-foreground)]/70">Vi gir deg personlig styling for alle hårtyper.</p>
            </div>
            <div className="rounded-2xl bg-[var(--color-secondary)] p-5 text-sm shadow-lg shadow-black/30">
              <p className="font-semibold text-[var(--color-foreground)]">Favoritt hos lokalene</p>
              <p className="mt-2 text-sm text-[var(--color-foreground)]/70">Anmeldt 4.8 av fornøyde kunder på Google.</p>
            </div>
          </div>
        </div>

        <div className="relative overflow-hidden rounded-[2rem] bg-[var(--color-secondary)] shadow-2xl shadow-black/50">
          <div className="relative h-[28rem] w-full sm:h-[34rem] lg:h-[42rem]">
            <Image
              src={imageUrl}
              alt="Interiør fra Blue Point frisørsalong"
              fill
              className="object-cover object-center"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" aria-hidden="true" />

            <div className="absolute bottom-0 inset-x-0 px-6 py-8">
              <div className="max-w-md rounded-2xl bg-black/40 backdrop-blur-sm p-6 text-sm">
                <p className="font-semibold uppercase tracking-[0.24em] text-[var(--color-primary)]">4.8 på Google</p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-foreground)]/90">
                  Kundene våre elsker kvalitet, god service og en avslappet salongopplevelse.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
