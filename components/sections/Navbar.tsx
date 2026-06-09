'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { salonConfig } from '@/config/salon.config'

interface NavLink {
  label: string
  href: string
}

const NAV_LINKS: NavLink[] = [
  { label: 'Om oss', href: '#om-oss' },
  { label: 'Tjenester', href: '#tjenester' },
  { label: 'Priser', href: '#priser' },
  { label: 'Omtaler', href: '#omtaler' },
  { label: 'Kontakt', href: '#contact' },
]

function scrollToSection(href: string) {
  const id = href.replace('#', '')
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }
}

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="mobile-menu"
          initial={{ opacity: 0, y: -24 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -24 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--color-background)]/95 px-6"
          role="dialog"
          aria-label="Mobil navigasjon"
        >
          <nav className="flex flex-col items-center gap-8 text-center">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => {
                  onClose()
                  setTimeout(() => scrollToSection(link.href), 100)
                }}
                className="text-2xl font-semibold text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <button
            type="button"
            onClick={() => {
              onClose()
              setTimeout(() => scrollToSection('#booking'), 100)
            }}
            className="mt-10 rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-95"
          >
            Book time
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

interface HamburgerButtonProps {
  isOpen: boolean
  onClick: () => void
}

function HamburgerButton({ isOpen, onClick }: HamburgerButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isOpen ? 'Lukk meny' : 'Åpne meny'}
      aria-expanded={isOpen}
      className="relative flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-secondary)] text-[var(--color-foreground)] transition hover:bg-[var(--color-accent)]/10"
    >
      <span className="absolute h-px w-5 bg-current" />
      <span className="absolute h-px w-5 bg-current rotate-45" />
      <span className="absolute h-px w-5 bg-current -rotate-45" />
    </button>
  )
}

export default function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50 bg-[var(--color-background)]/95 backdrop-blur-xl text-[var(--color-foreground)]">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-4 md:px-8">
          <button
            type="button"
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="text-lg font-semibold tracking-tight text-[var(--color-foreground)]"
          >
            {salonConfig.name}
          </button>

          <nav className="hidden items-center gap-8 md:flex" aria-label="Hovednavigasjon">
            {NAV_LINKS.map((link) => (
              <button
                key={link.href}
                type="button"
                onClick={() => scrollToSection(link.href)}
                className="text-sm font-medium text-[var(--color-foreground)] transition hover:text-[var(--color-primary)]"
              >
                {link.label}
              </button>
            ))}
          </nav>

          <div className="hidden md:block">
            <button
              type="button"
              onClick={() => scrollToSection('#booking')}
              className="rounded-full bg-[var(--color-primary)] px-6 py-3 text-sm font-semibold text-black transition hover:opacity-95"
            >
              Book time
            </button>
          </div>

          <div className="md:hidden">
            <HamburgerButton isOpen={mobileOpen} onClick={() => setMobileOpen((prev) => !prev)} />
          </div>
        </div>
      </header>
      <MobileMenu isOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
    </>
  )
}
