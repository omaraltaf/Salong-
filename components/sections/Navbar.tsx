'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { salonConfig } from '@/config/salon.config'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface NavLink {
  label: string
  href: string
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const NAV_LINKS: NavLink[] = [
  { label: 'Om oss', href: '#om-oss' },
  { label: 'Tjenester', href: '#tjenester' },
  { label: 'Priser', href: '#priser' },
  { label: 'Omtaler', href: '#omtaler' },
  { label: 'Kontakt', href: '#kontakt' },
]

// ---------------------------------------------------------------------------
// useScrollPosition – inline hook
// ---------------------------------------------------------------------------

function useScrollPosition(): number {
  const [scrollY, setScrollY] = useState(0)

  useEffect(() => {
    const handleScroll = () => setScrollY(window.scrollY)
    // Passive listener for performance
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return scrollY
}

// ---------------------------------------------------------------------------
// ScissorsIcon – inline SVG so we avoid an extra dependency
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
      className={cn('size-6', className)}
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

// ---------------------------------------------------------------------------
// Smooth-scroll helper
// ---------------------------------------------------------------------------

function scrollToSection(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

// ---------------------------------------------------------------------------
// MobileMenu
// ---------------------------------------------------------------------------

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  // Prevent body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  const handleLinkClick = (href: string) => {
    onClose()
    // Small delay so the menu closes before scrolling
    setTimeout(() => scrollToSection(href), 300)
  }

  const handleBookingClick = () => {
    onClose()
    setTimeout(() => scrollToSection('#booking'), 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: '-100%' }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: '-100%' }}
          transition={{ type: 'tween', duration: 0.35, ease: [0.32, 0, 0.67, 0] }}
          className="fixed inset-0 z-40 flex flex-col items-center justify-center bg-[var(--color-secondary)]"
          aria-modal="true"
          role="dialog"
          aria-label="Navigasjonsmeny"
        >
          <nav className="flex flex-col items-center gap-8">
            {NAV_LINKS.map((link, index) => (
              <motion.button
                key={link.href}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 24 }}
                transition={{ delay: 0.05 * index + 0.1 }}
                onClick={() => handleLinkClick(link.href)}
                className="font-heading text-3xl font-medium text-white/90 transition-colors hover:text-[var(--color-primary)]"
              >
                {link.label}
              </motion.button>
            ))}

            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 24 }}
              transition={{ delay: 0.05 * NAV_LINKS.length + 0.1 }}
              onClick={handleBookingClick}
              className="mt-4 rounded-full bg-[var(--color-primary)] px-8 py-3 text-base font-semibold text-white transition-opacity hover:opacity-90"
            >
              Book time
            </motion.button>
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// ---------------------------------------------------------------------------
// HamburgerButton
// ---------------------------------------------------------------------------

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
  scrolled: boolean
}

function HamburgerButton({ isOpen, onClick, scrolled }: HamburgerButtonProps) {
  return (
    <button
      onClick={onClick}
      aria-label={isOpen ? 'Lukk meny' : 'Åpne meny'}
      aria-expanded={isOpen}
      className={cn(
        'relative z-50 flex size-10 flex-col items-center justify-center gap-[5px] rounded-md transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
        isOpen ? 'text-white' : scrolled ? 'text-[var(--color-foreground)]' : 'text-white',
      )}
    >
      <motion.span
        animate={isOpen ? { rotate: 45, y: 7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        className="block h-[2px] w-6 rounded-full bg-current origin-center"
      />
      <motion.span
        animate={isOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
        transition={{ duration: 0.2 }}
        className="block h-[2px] w-6 rounded-full bg-current"
      />
      <motion.span
        animate={isOpen ? { rotate: -45, y: -7 } : { rotate: 0, y: 0 }}
        transition={{ duration: 0.25 }}
        className="block h-[2px] w-6 rounded-full bg-current origin-center"
      />
    </button>
  )
}

// ---------------------------------------------------------------------------
// Navbar – main export
// ---------------------------------------------------------------------------

export default function Navbar() {
  const scrollY = useScrollPosition()
  const [mobileOpen, setMobileOpen] = useState(false)
  const navRef = useRef<HTMLElement>(null)

  const scrolled = scrollY > 20

  const toggleMobile = () => setMobileOpen((prev) => !prev)
  const closeMobile = () => setMobileOpen(false)

  return (
    <>
      <header
        ref={navRef}
        className={cn(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled
            ? 'bg-white/90 shadow-sm backdrop-blur-md'
            : 'bg-transparent',
        )}
      >
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className={cn(
              'flex items-center gap-2.5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
              scrolled ? 'text-[var(--color-foreground)]' : 'text-white',
            )}
            aria-label="Gå til toppen"
          >
            <ScissorsIcon
              className={cn(
                'transition-colors',
                scrolled ? 'text-[var(--color-primary)]' : 'text-white',
              )}
            />
            <span className="font-heading text-lg font-semibold tracking-wide">
              {salonConfig.name}
            </span>
          </button>

          {/* Desktop nav links */}
          <nav className="hidden items-center gap-7 md:flex" aria-label="Hovednavigasjon">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                onClick={() => scrollToSection(link.href)}
                className={cn(
                  'text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]',
                  scrolled
                    ? 'text-[var(--color-foreground)]/80 hover:text-[var(--color-primary)]'
                    : 'text-white/90 hover:text-white',
                )}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex">
            <button
              onClick={() => scrollToSection('#booking')}
              className="rounded-full bg-[var(--color-primary)] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-all hover:opacity-90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2"
            >
              Book time
            </button>
          </div>

          {/* Mobile hamburger */}
          <div className="flex md:hidden">
            <HamburgerButton
              isOpen={mobileOpen}
              onClick={toggleMobile}
              scrolled={scrolled}
            />
          </div>
        </div>
      </header>

      {/* Mobile full-screen overlay */}
      <MobileMenu isOpen={mobileOpen} onClose={closeMobile} />
    </>
  )
}
