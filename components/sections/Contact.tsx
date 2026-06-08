'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import { cn, isOpenNow, DAYS_NB } from '@/lib/utils'
import { salonConfig } from '@/config/salon.config'
import { contactSchema, type ContactFormData } from '@/lib/validations'
import { useToast } from '@/hooks/useToast'
import ToastContainer from '@/components/ui/Toast'

// ---------------------------------------------------------------------------
// Server Action import
// ---------------------------------------------------------------------------

import { submitContact } from '@/app/actions/contact'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type OpeningHour = {
  day_of_week: number
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

type SocialLink = { id: string; platform: string; url: string }

interface ContactProps {
  heading: string
  subheading: string
  openingHours: OpeningHour[]
  socialLinks: SocialLink[]
}

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

// Display order: Monday (1) … Saturday (6) … Sunday (0)
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={cn('size-5', className)}
      aria-hidden="true"
    >
      <path d="M24 12.073C24 5.406 18.627 0 12 0S0 5.406 0 12.073C0 18.1 4.388 23.094 10.125 24v-8.437H7.078v-3.49h3.047V9.41c0-3.026 1.792-4.697 4.533-4.697 1.312 0 2.686.236 2.686.236v2.97h-1.514c-1.491 0-1.956.93-1.956 1.874v2.25h3.328l-.532 3.49h-2.796V24C19.612 23.094 24 18.1 24 12.073Z" />
    </svg>
  )
}

function LinkIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5', className)}
      aria-hidden="true"
    >
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

function MapPinIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
      aria-hidden="true"
    >
      <path d="M20 10c0 6-8 13-8 13s-8-7-8-13a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  )
}

function PhoneIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-5 shrink-0', className)}
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.69 12a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.6 1.18h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L7.91 8.77a16 16 0 0 0 6.29 6.29l.95-.95a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92Z" />
    </svg>
  )
}

function CheckCircleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn('size-12', className)}
      aria-hidden="true"
    >
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
      <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// SuccessState
// ---------------------------------------------------------------------------

function SuccessState({ onReset }: { onReset: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center gap-5 py-16 text-center"
    >
      <CheckCircleIcon className="text-emerald-500" />
      <div>
        <p className="font-heading text-2xl font-semibold text-[var(--color-foreground)]">
          Takk for meldingen!
        </p>
        <p className="mt-2 text-[var(--color-foreground)]/60">
          Vi tar kontakt snart.
        </p>
      </div>
      <button
        onClick={onReset}
        className="mt-2 text-sm font-medium text-[var(--color-primary)] underline-offset-4 hover:underline"
      >
        Send en ny melding
      </button>
    </motion.div>
  )
}

// ---------------------------------------------------------------------------
// ContactForm
// ---------------------------------------------------------------------------

interface ContactFormProps {
  onSuccess: () => void
  onError: (message: string) => void
}

function ContactForm({ onSuccess, onError }: ContactFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm<ContactFormData>({ resolver: zodResolver(contactSchema) })

  const onSubmit = async (data: ContactFormData) => {
    try {
      const result = await submitContact(data)
      if (result.success) {
        reset()
        onSuccess()
      } else {
        onError(result.error ?? 'Noe gikk galt. Prøv igjen.')
      }
    } catch {
      onError('Noe gikk galt. Prøv igjen.')
    }
  }

  const inputBase =
    'w-full rounded-lg border border-[var(--color-accent)] bg-white px-4 py-3 text-sm text-[var(--color-foreground)] placeholder-[var(--color-foreground)]/40 transition-colors focus:border-[var(--color-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]/20'

  const errorBase = 'mt-1.5 text-xs text-rose-500'

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
      {/* Navn */}
      <div>
        <label htmlFor="contact-name" className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
          Navn <span aria-hidden="true" className="text-rose-400">*</span>
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          placeholder="Ditt navn"
          className={cn(inputBase, errors.name && 'border-rose-400 focus:ring-rose-400/20')}
          {...register('name')}
        />
        {errors.name && <p className={errorBase} role="alert">{errors.name.message}</p>}
      </div>

      {/* E-post */}
      <div>
        <label htmlFor="contact-email" className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
          E-post <span aria-hidden="true" className="text-rose-400">*</span>
        </label>
        <input
          id="contact-email"
          type="email"
          autoComplete="email"
          placeholder="din@epost.no"
          className={cn(inputBase, errors.email && 'border-rose-400 focus:ring-rose-400/20')}
          {...register('email')}
        />
        {errors.email && <p className={errorBase} role="alert">{errors.email.message}</p>}
      </div>

      {/* Telefon (valgfritt) */}
      <div>
        <label htmlFor="contact-phone" className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
          Telefon{' '}
          <span className="text-xs font-normal text-[var(--color-foreground)]/50">(valgfritt)</span>
        </label>
        <input
          id="contact-phone"
          type="tel"
          autoComplete="tel"
          placeholder="+47 XXX XX XXX"
          className={cn(inputBase, errors.phone && 'border-rose-400 focus:ring-rose-400/20')}
          {...register('phone')}
        />
        {errors.phone && <p className={errorBase} role="alert">{errors.phone.message}</p>}
      </div>

      {/* Melding */}
      <div>
        <label htmlFor="contact-message" className="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
          Melding <span aria-hidden="true" className="text-rose-400">*</span>
        </label>
        <textarea
          id="contact-message"
          rows={5}
          placeholder="Skriv din melding her…"
          className={cn(inputBase, 'resize-none', errors.message && 'border-rose-400 focus:ring-rose-400/20')}
          {...register('message')}
        />
        {errors.message && <p className={errorBase} role="alert">{errors.message.message}</p>}
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className={cn(
          'relative flex items-center justify-center gap-2 rounded-lg bg-[var(--color-primary)] px-6 py-3.5 text-sm font-semibold text-white shadow-sm transition-all',
          'hover:opacity-90 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)] focus-visible:ring-offset-2',
          isSubmitting && 'cursor-not-allowed opacity-70',
        )}
      >
        {isSubmitting ? (
          <>
            <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 0 1 8-8V0C5.373 0 0 5.373 0 12h4Z" />
            </svg>
            Sender…
          </>
        ) : (
          'Send melding'
        )}
      </button>
    </form>
  )
}

// ---------------------------------------------------------------------------
// OpeningHoursTable
// ---------------------------------------------------------------------------

function OpeningHoursTable({ openingHours }: { openingHours: OpeningHour[] }) {
  const today = new Date().getDay()

  // Bucket hours by day_of_week for O(1) lookup
  const hoursByDay = Object.fromEntries(openingHours.map((h) => [h.day_of_week, h]))

  // Determine live open/closed status from today's hours
  const todayHours = hoursByDay[today]
  const openNow = todayHours
    ? isOpenNow(todayHours.open_time, todayHours.close_time, todayHours.is_closed)
    : false

  return (
    <div>
      {/* Live badge */}
      <div className="mb-4 flex items-center gap-2">
        <span
          className={cn(
            'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold',
            openNow
              ? 'bg-emerald-100 text-emerald-700'
              : 'bg-rose-100 text-rose-700',
          )}
        >
          <span
            className={cn(
              'size-1.5 rounded-full',
              openNow ? 'animate-pulse bg-emerald-500' : 'bg-rose-500',
            )}
          />
          {openNow ? 'Åpen nå' : 'Stengt nå'}
        </span>
      </div>

      {/* Hours rows */}
      <table className="w-full text-sm">
        <tbody>
          {DAY_ORDER.map((dayNum) => {
            const hours = hoursByDay[dayNum]
            const isToday = dayNum === today
            const dayName = DAYS_NB[dayNum]

            let timeStr: string
            if (!hours || hours.is_closed) {
              timeStr = 'Stengt'
            } else if (hours.open_time && hours.close_time) {
              const fmt = (t: string) => t.slice(0, 5)
              timeStr = `${fmt(hours.open_time)} – ${fmt(hours.close_time)}`
            } else {
              timeStr = 'Stengt'
            }

            const isClosed = !hours || hours.is_closed

            return (
              <tr
                key={dayNum}
                className={cn(
                  'border-b border-[var(--color-accent)]/60 last:border-0',
                  isToday && 'rounded bg-[var(--color-muted)]',
                )}
              >
                <td
                  className={cn(
                    'py-2 pr-4 font-medium',
                    isToday ? 'text-[var(--color-primary)]' : 'text-[var(--color-foreground)]',
                  )}
                >
                  {dayName}
                  {isToday && <span className="ml-1.5 text-xs font-normal opacity-60">(i dag)</span>}
                </td>
                <td
                  className={cn(
                    'py-2 text-right',
                    isClosed
                      ? 'text-[var(--color-foreground)]/40'
                      : 'text-[var(--color-foreground)]/80',
                  )}
                >
                  {timeStr}
                </td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Contact – main export
// ---------------------------------------------------------------------------

export default function Contact({ heading, subheading, openingHours, socialLinks }: ContactProps) {
  const [submitted, setSubmitted] = useState(false)
  const { toasts, addToast, removeToast } = useToast()

  const handleSuccess = () => setSubmitted(true)
  const handleError = (message: string) => addToast(message, 'error')
  const handleReset: () => void = () => setSubmitted(false)

  return (
    <>
      <section
        id="kontakt"
        className="bg-[var(--color-background)] py-20 sm:py-28"
        aria-labelledby="contact-heading"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {/* Section header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="mb-14 text-center"
          >
            <h2
              id="contact-heading"
              className="font-heading text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl"
            >
              {heading}
            </h2>
            {subheading && (
              <p className="mt-4 text-base text-[var(--color-foreground)]/60 sm:text-lg">
                {subheading}
              </p>
            )}
          </motion.div>

          {/* Two-column grid */}
          <div className="grid gap-12 lg:grid-cols-2 lg:gap-16">
            {/* ── Left: form ── */}
            <motion.div
              initial={{ opacity: 0, x: -24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="rounded-2xl border border-[var(--color-accent)] bg-white p-8 shadow-sm"
            >
              <h3 className="mb-6 font-heading text-2xl font-semibold text-[var(--color-foreground)]">
                Send oss en melding
              </h3>

              <AnimatePresence mode="wait">
                {submitted ? (
                  <SuccessState key="success" onReset={handleReset} />
                ) : (
                  <motion.div
                    key="form"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.25 }}
                  >
                    <ContactForm onSuccess={handleSuccess} onError={handleError} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* ── Right: info panel ── */}
            <motion.div
              initial={{ opacity: 0, x: 24 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="flex flex-col gap-10"
            >
              {/* Contact details */}
              <div className="rounded-2xl border border-[var(--color-accent)] bg-white p-8 shadow-sm">
                <h3 className="mb-5 font-heading text-2xl font-semibold text-[var(--color-foreground)]">
                  Finn oss
                </h3>

                <ul className="flex flex-col gap-4">
                  {/* Address */}
                  <li className="flex items-start gap-3 text-sm text-[var(--color-foreground)]/80">
                    <MapPinIcon className="mt-0.5 text-[var(--color-primary)]" />
                    <span>{salonConfig.address}</span>
                  </li>

                  {/* Phone */}
                  <li className="flex items-start gap-3 text-sm">
                    <PhoneIcon className="mt-0.5 text-[var(--color-primary)]" />
                    <a
                      href={`tel:${salonConfig.phone.replace(/\s/g, '')}`}
                      className="font-medium text-[var(--color-foreground)]/80 underline-offset-4 transition-colors hover:text-[var(--color-primary)] hover:underline"
                    >
                      {salonConfig.phone}
                    </a>
                  </li>
                </ul>

                {/* Social links */}
                {socialLinks.length > 0 && (
                  <div className="mt-6 flex items-center gap-3">
                    {socialLinks.map((link) => (
                      <a
                        key={link.id}
                        href={link.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        aria-label={link.platform}
                        className="flex size-9 items-center justify-center rounded-lg bg-[var(--color-muted)] text-[var(--color-foreground)]/60 transition-colors hover:bg-[var(--color-accent)] hover:text-[var(--color-primary)]"
                      >
                        {link.platform.toLowerCase() === 'facebook' ? (
                          <FacebookIcon />
                        ) : (
                          <LinkIcon />
                        )}
                      </a>
                    ))}
                  </div>
                )}
              </div>

              {/* Opening hours */}
              <div className="rounded-2xl border border-[var(--color-accent)] bg-white p-8 shadow-sm">
                <h3 className="mb-5 font-heading text-2xl font-semibold text-[var(--color-foreground)]">
                  Åpningstider
                </h3>
                <OpeningHoursTable openingHours={openingHours} />
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </>
  )
}
