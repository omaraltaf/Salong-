import { salonConfig } from '@/config/salon.config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FooterProps {
  tagline: string
  socialLinks: Array<{ id: string; platform: string; url: string; is_active: boolean }>
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_LINKS = [
  { label: 'Om oss', href: '#om-oss' },
  { label: 'Tjenester', href: '#tjenester' },
  { label: 'Priser', href: '#priser' },
  { label: 'Omtaler', href: '#omtaler' },
  { label: 'Kontakt', href: '#kontakt' },
]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function ScissorsIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-6'}
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

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className ?? 'size-4'}
      aria-hidden="true"
    >
      <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  )
}

function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
      aria-hidden="true"
    >
      <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37Z" />
      <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className ?? 'size-4'}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function SocialIcon({ platform }: { platform: string }) {
  const slug = platform.toLowerCase()
  if (slug === 'facebook') return <FacebookIcon className="size-4" />
  if (slug === 'instagram') return <InstagramIcon className="size-4" />
  return <LinkIcon className="size-4" />
}

// ---------------------------------------------------------------------------
// Footer – main export (Server Component)
// ---------------------------------------------------------------------------

export default function Footer({ tagline, socialLinks }: FooterProps) {
  const activeSocials = socialLinks.filter((s) => s.is_active)

  return (
    <footer
      className="bg-[var(--color-background)] text-[var(--color-foreground)]"
      aria-label="Bunntekst"
    >
      {/* Warm top accent line */}
      <div className="h-0.5 bg-gradient-to-r from-transparent via-[var(--color-primary)] to-transparent opacity-60" />

      {/* Main grid */}
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-3 lg:gap-12">

          {/* ── Column 1: Logo + tagline ── */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-2.5">
              <span className="text-[var(--color-primary)]">
                <ScissorsIcon className="size-6" />
              </span>
              <span className="font-heading text-lg font-semibold tracking-wide text-[var(--color-foreground)]">
                {salonConfig.name}
              </span>
            </div>
            <p className="max-w-xs text-sm leading-relaxed text-[var(--color-foreground)]/60">
              {tagline}
            </p>

            {/* Social links */}
            {activeSocials.length > 0 && (
              <div className="mt-2 flex items-center gap-2.5">
                {activeSocials.map((link) => (
                  <a
                    key={link.id}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={link.platform}
                    className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-muted)] text-[var(--color-foreground)]/60 transition-colors hover:bg-[var(--color-primary)] hover:text-black"
                  >
                    <SocialIcon platform={link.platform} />
                  </a>
                ))}
              </div>
            )}
          </div>

          {/* ── Column 2: Navigation ── */}
          <nav aria-label="Bunntekstnavigasjon">
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]/50">
              Navigasjon
            </p>
            <ul className="flex flex-col gap-3">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <a
                    href={link.href}
                    className="text-sm text-[var(--color-foreground)]/70 transition-colors hover:text-[var(--color-primary)]"
                  >
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>

          {/* ── Column 3: Contact info ── */}
          <div>
            <p className="mb-5 text-xs font-semibold uppercase tracking-widest text-[var(--color-foreground)]/50">
              Kontakt
            </p>
            <ul className="flex flex-col gap-3 text-sm text-[var(--color-foreground)]/70">
              <li>
                <span className="block leading-snug">{salonConfig.address}</span>
              </li>
              <li>
                <a
                  href={`tel:${salonConfig.phone.replace(/\s/g, '')}`}
                  className="transition-colors hover:text-[var(--color-primary)]"
                >
                  {salonConfig.phone}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${salonConfig.email}`}
                  className="transition-colors hover:text-[var(--color-primary)]"
                >
                  {salonConfig.email}
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div>
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-5 text-xs text-[var(--color-foreground)]/50 sm:flex-row sm:px-6 lg:px-8">
          <p>© 2024 {salonConfig.name}. Alle rettigheter forbeholdt.</p>
          <p>
            Nettside av{' '}
            <a
              href="https://kvikai.no"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-[var(--color-foreground)]/70 underline-offset-4 transition-colors hover:text-[var(--color-primary)] hover:underline"
            >
              Kvikai
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
