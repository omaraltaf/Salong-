'use client'

import { useState, useCallback, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { motion, AnimatePresence } from 'framer-motion'
import {
  format,
  addDays,
  startOfDay,
  isSameDay,
  isBefore,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  addMonths,
  subMonths,
  isSameMonth,
} from 'date-fns'
import { nb } from 'date-fns/locale'
import { ChevronLeft, ChevronRight, Check, Clock, Scissors, CalendarDays, User, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { bookingSchema, type BookingFormData } from '@/lib/validations'
import { createBooking } from '@/app/actions/booking'

// ─── Types ────────────────────────────────────────────────────────────────────

type Service = {
  id: string
  name: string
  duration_minutes: number
  price_from: number | null
  category: string
}

type Timeslot = {
  id: string
  date: string
  start_time: string
  end_time: string
  is_available: boolean
}

interface BookingProps {
  services: Service[]
  initialTimeslots: Timeslot[]
  bookingWindowDays: number
}

// ─── Constants ───────────────────────────────────────────────────────────────

const STEPS = [
  { number: 1, label: 'Tjeneste' },
  { number: 2, label: 'Dato' },
  { number: 3, label: 'Tid' },
  { number: 4, label: 'Opplysninger' },
  { number: 5, label: 'Bekreftelse' },
] as const

type StepNumber = (typeof STEPS)[number]['number']

const WEEKDAY_LABELS = ['Ma', 'Ti', 'On', 'To', 'Fr', 'Lø', 'Sø']

// ─── Animation variants ───────────────────────────────────────────────────────

const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 60 : -60,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
    transition: { duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] },
  },
  exit: (direction: number) => ({
    x: direction > 0 ? -60 : 60,
    opacity: 0,
    transition: { duration: 0.25, ease: [0.25, 0.46, 0.45, 0.94] },
  }),
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ProgressBar({ currentStep }: { currentStep: StepNumber }) {
  return (
    <div className="mb-10">
      <div className="flex items-center justify-between relative">
        {/* Connecting line */}
        <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-px bg-muted mx-8" aria-hidden="true" />
        <div
          className="absolute left-8 top-1/2 -translate-y-1/2 h-px bg-primary transition-all duration-500"
          style={{ width: `calc(${((currentStep - 1) / (STEPS.length - 1)) * 100}% - 4rem * ${((currentStep - 1) / (STEPS.length - 1))})` }}
          aria-hidden="true"
        />

        {STEPS.map((step) => {
          const isDone = step.number < currentStep
          const isActive = step.number === currentStep
          return (
            <div key={step.number} className="relative flex flex-col items-center gap-2 z-10">
              <div
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center text-sm font-semibold border-2 transition-all duration-300',
                  isDone
                    ? 'bg-primary border-primary text-primary-foreground'
                    : isActive
                    ? 'bg-background border-primary text-primary shadow-[0_0_0_4px] shadow-primary/15'
                    : 'bg-background border-muted text-muted-foreground',
                )}
              >
                {isDone ? <Check className="w-4 h-4" /> : step.number}
              </div>
              <span
                className={cn(
                  'text-xs font-medium hidden sm:block transition-colors duration-300',
                  isActive ? 'text-primary' : isDone ? 'text-foreground' : 'text-muted-foreground',
                )}
              >
                {step.label}
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ─── Step 1: Velg tjeneste ────────────────────────────────────────────────────

function ServiceStep({
  services,
  selectedService,
  onSelect,
}: {
  services: Service[]
  selectedService: Service | null
  onSelect: (s: Service) => void
}) {
  const categories = Array.from(new Set(services.map((s) => s.category)))

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-1">Velg tjeneste</h3>
        <p className="text-muted-foreground text-sm">Velg hvilken tjeneste du ønsker å bestille</p>
      </div>

      {categories.map((cat) => (
        <div key={cat} className="space-y-3">
          <h4 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            {cat}
          </h4>
          <div className="grid gap-3 sm:grid-cols-2">
            {services
              .filter((s) => s.category === cat)
              .map((service) => {
                const isSelected = selectedService?.id === service.id
                return (
                  <button
                    key={service.id}
                    type="button"
                    onClick={() => onSelect(service)}
                    className={cn(
                      'relative text-left rounded-xl border-2 p-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                      isSelected
                        ? 'border-primary bg-primary/5 shadow-sm'
                        : 'border-border hover:border-primary/40 hover:bg-muted/40',
                    )}
                  >
                    {isSelected && (
                      <span className="absolute top-3 right-3 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <Check className="w-3 h-3 text-primary-foreground" />
                      </span>
                    )}
                    <p className={cn('font-semibold text-sm pr-7', isSelected ? 'text-primary' : 'text-foreground')}>
                      {service.name}
                    </p>
                    <div className="flex items-center gap-3 mt-2">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration_minutes} min
                      </span>
                      {service.price_from !== null && (
                        <span className="text-xs font-medium text-foreground">
                          fra {service.price_from.toLocaleString('nb-NO')} kr
                        </span>
                      )}
                    </div>
                  </button>
                )
              })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ─── Step 2: Velg dato ────────────────────────────────────────────────────────

function CalendarStep({
  selectedDate,
  onSelect,
  availableTimeslots,
  bookingWindowDays,
}: {
  selectedDate: Date | null
  onSelect: (d: Date) => void
  availableTimeslots: Timeslot[]
  bookingWindowDays: number
}) {
  const [isClient, setIsClient] = useState(false)
  const today = isClient ? startOfDay(new Date()) : startOfDay(new Date('2026-06-10'))
  const maxDate = addDays(today, bookingWindowDays)
  const [viewMonth, setViewMonth] = useState<Date>(today)

  // Ensure we're on client before rendering dates
  useEffect(() => {
    setIsClient(true)
  }, [])

  const datesWithSlots = new Set(
    availableTimeslots.filter((t) => t.is_available).map((t) => t.date),
  )

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })

  // Monday-first offset: getDay returns 0=Sun, so Mon=1→0, …, Sun=0→6
  const startOffset = (getDay(monthStart) + 6) % 7

  const canGoPrev = isBefore(today, monthStart) === false && !isSameMonth(viewMonth, today)
  const canGoNext = isBefore(addMonths(viewMonth, 1), addMonths(maxDate, 1))

  function isDayDisabled(day: Date) {
    if (isBefore(day, today)) return true
    if (isBefore(maxDate, day)) return true
    const key = format(day, 'yyyy-MM-dd')
    return !datesWithSlots.has(key)
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-1">Velg dato</h3>
        <p className="text-muted-foreground text-sm">Velg en tilgjengelig dato for din booking</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {/* Calendar header */}
        <div className="flex items-center justify-between px-4 py-3 bg-muted/30">
          <button
            type="button"
            onClick={() => setViewMonth((m) => subMonths(m, 1))}
            disabled={!canGoPrev}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Forrige måned"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-semibold capitalize">
            {format(viewMonth, 'MMMM yyyy', { locale: nb })}
          </span>
          <button
            type="button"
            onClick={() => setViewMonth((m) => addMonths(m, 1))}
            disabled={!canGoNext}
            className="p-1.5 rounded-lg hover:bg-muted disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
            aria-label="Neste måned"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Weekday labels */}
        <div className="grid grid-cols-7 border-b border-border">
          {WEEKDAY_LABELS.map((d) => (
            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
              {d}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7">
          {/* Empty cells for offset */}
          {Array.from({ length: startOffset }).map((_, i) => (
            <div key={`empty-${i}`} className="aspect-square" />
          ))}

          {days.map((day) => {
            const disabled = isDayDisabled(day)
            const isSelected = selectedDate !== null && isSameDay(day, selectedDate)
            const isToday = isSameDay(day, today)
            const dateKey = format(day, 'yyyy-MM-dd')
            const hasSlots = datesWithSlots.has(dateKey)

            return (
              <button
                key={dateKey}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(day)}
                className={cn(
                  'aspect-square flex flex-col items-center justify-center text-sm transition-all duration-150 relative focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-primary',
                  isSelected
                    ? 'bg-primary text-primary-foreground font-semibold'
                    : disabled
                    ? 'text-muted-foreground/40 cursor-not-allowed'
                    : 'hover:bg-primary/10 text-foreground cursor-pointer',
                  isToday && !isSelected ? 'font-bold' : '',
                )}
                aria-label={format(day, 'd. MMMM yyyy', { locale: nb })}
                aria-pressed={isSelected}
              >
                <span>{format(day, 'd')}</span>
                {/* Dot indicator for available slots */}
                {hasSlots && !disabled && !isSelected && (
                  <span className="absolute bottom-1.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-primary" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <p className="text-xs text-muted-foreground flex items-center gap-1.5">
        <span className="inline-block w-1.5 h-1.5 rounded-full bg-primary" />
        Dager med tilgjengelige tider er markert med en prikk
      </p>
    </div>
  )
}

// ─── Step 3: Velg tid ─────────────────────────────────────────────────────────

function TimeslotStep({
  selectedDate,
  selectedTimeslot,
  timeslots,
  onSelect,
}: {
  selectedDate: Date | null
  selectedTimeslot: Timeslot | null
  timeslots: Timeslot[]
  onSelect: (t: Timeslot) => void
}) {
  const dateKey = selectedDate ? format(selectedDate, 'yyyy-MM-dd') : null
  const daySlots = dateKey ? timeslots.filter((t) => t.date === dateKey) : []
  const available = daySlots.filter((t) => t.is_available)
  const unavailable = daySlots.filter((t) => !t.is_available)

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-1">Velg tid</h3>
        {selectedDate && (
          <p className="text-muted-foreground text-sm capitalize">
            {format(selectedDate, 'EEEE d. MMMM yyyy', { locale: nb })}
          </p>
        )}
      </div>

      {daySlots.length === 0 ? (
        <div className="rounded-xl border border-border bg-muted/20 p-8 text-center">
          <CalendarDays className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm font-medium text-muted-foreground">Ingen ledige tider denne dagen</p>
        </div>
      ) : (
        <div className="space-y-4">
          {available.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Ledige tider
              </p>
              <div className="flex flex-wrap gap-2">
                {available.map((slot) => {
                  const isSelected = selectedTimeslot?.id === slot.id
                  return (
                    <button
                      key={slot.id}
                      type="button"
                      onClick={() => onSelect(slot)}
                      className={cn(
                        'px-4 py-2 rounded-full text-sm font-medium border-2 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                        isSelected
                          ? 'bg-primary border-primary text-primary-foreground shadow-sm'
                          : 'border-border hover:border-primary/50 hover:bg-primary/5 text-foreground',
                      )}
                    >
                      {slot.start_time.slice(0, 5)}
                    </button>
                  )
                })}
              </div>
            </div>
          )}

          {unavailable.length > 0 && (
            <div>
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-3">
                Opptatte tider
              </p>
              <div className="flex flex-wrap gap-2">
                {unavailable.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    disabled
                    className="px-4 py-2 rounded-full text-sm font-medium border-2 border-border text-muted-foreground/50 cursor-not-allowed line-through"
                  >
                    {slot.start_time.slice(0, 5)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Step 4: Dine opplysninger ────────────────────────────────────────────────

function DetailsStep({
  form,
}: {
  form: ReturnType<typeof useForm<BookingFormData>>
}) {
  const {
    register,
    formState: { errors },
  } = form

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-1">Dine opplysninger</h3>
        <p className="text-muted-foreground text-sm">Fyll inn kontaktinformasjonen din</p>
      </div>

      <div className="space-y-4">
        <FormField
          label="Fullt navn"
          error={errors.customer_name?.message}
          required
        >
          <input
            {...register('customer_name')}
            type="text"
            placeholder="Ola Nordmann"
            autoComplete="name"
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              errors.customer_name ? 'border-destructive' : 'border-border',
            )}
          />
        </FormField>

        <FormField
          label="E-postadresse"
          error={errors.customer_email?.message}
          required
        >
          <input
            {...register('customer_email')}
            type="email"
            placeholder="ola@example.com"
            autoComplete="email"
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              errors.customer_email ? 'border-destructive' : 'border-border',
            )}
          />
        </FormField>

        <FormField
          label="Telefonnummer"
          error={errors.customer_phone?.message}
          required
        >
          <input
            {...register('customer_phone')}
            type="tel"
            placeholder="+47 400 00 000"
            autoComplete="tel"
            className={cn(
              'w-full rounded-lg border px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent',
              errors.customer_phone ? 'border-destructive' : 'border-border',
            )}
          />
        </FormField>

        <FormField label="Kommentar" error={errors.notes?.message}>
          <textarea
            {...register('notes')}
            rows={3}
            placeholder="Spesielle ønsker eller informasjon til frisøren (valgfritt)"
            className="w-full rounded-lg border border-border px-4 py-2.5 text-sm bg-background text-foreground placeholder:text-muted-foreground resize-none transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          />
        </FormField>
      </div>
    </div>
  )
}

function FormField({
  label,
  error,
  required,
  children,
}: {
  label: string
  error?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
      {error && (
        <p className="flex items-center gap-1.5 text-xs text-destructive" role="alert">
          <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
          {error}
        </p>
      )}
    </div>
  )
}

// ─── Step 5: Bekreftelse ──────────────────────────────────────────────────────

function ConfirmationStep({
  selectedService,
  selectedDate,
  selectedTimeslot,
  formData,
  isSubmitting,
}: {
  selectedService: Service
  selectedDate: Date
  selectedTimeslot: Timeslot
  formData: Partial<BookingFormData>
  isSubmitting: boolean
}) {
  const rows: { label: string; value: string; icon: React.ReactNode }[] = [
    {
      label: 'Tjeneste',
      value: `${selectedService.name} (${selectedService.duration_minutes} min)`,
      icon: <Scissors className="w-4 h-4" />,
    },
    {
      label: 'Dato',
      value: format(selectedDate, 'EEEE d. MMMM yyyy', { locale: nb }),
      icon: <CalendarDays className="w-4 h-4" />,
    },
    {
      label: 'Tid',
      value: selectedTimeslot.start_time.slice(0, 5),
      icon: <Clock className="w-4 h-4" />,
    },
    {
      label: 'Navn',
      value: formData.customer_name ?? '',
      icon: <User className="w-4 h-4" />,
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-heading font-semibold text-foreground mb-1">Bekreft booking</h3>
        <p className="text-muted-foreground text-sm">Sjekk at alt stemmer før du bekrefter</p>
      </div>

      <div className="rounded-xl border border-border overflow-hidden">
        {rows.map((row, idx) => (
          <div
            key={row.label}
            className={cn(
              'flex items-center gap-3 px-4 py-3.5',
              idx < rows.length - 1 ? 'border-b border-border' : '',
            )}
          >
            <span className="text-primary flex-shrink-0">{row.icon}</span>
            <div className="min-w-0">
              <p className="text-xs text-muted-foreground font-medium">{row.label}</p>
              <p className="text-sm text-foreground font-semibold capitalize truncate">{row.value}</p>
            </div>
          </div>
        ))}

        {/* Email + phone in a 2-col row */}
        <div className="grid grid-cols-2 border-t border-border">
          {[
            { label: 'E-post', value: formData.customer_email ?? '' },
            { label: 'Telefon', value: formData.customer_phone ?? '' },
          ].map((item, idx) => (
            <div
              key={item.label}
              className={cn('px-4 py-3.5', idx === 0 ? 'border-r border-border' : '')}
            >
              <p className="text-xs text-muted-foreground font-medium">{item.label}</p>
              <p className="text-sm text-foreground font-semibold truncate">{item.value}</p>
            </div>
          ))}
        </div>

        {formData.notes && (
          <div className="border-t border-border px-4 py-3.5">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">Kommentar</p>
            <p className="text-sm text-foreground">{formData.notes}</p>
          </div>
        )}
      </div>

      {isSubmitting && (
        <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground py-2">
          <Loader2 className="w-4 h-4 animate-spin" />
          Sender booking…
        </div>
      )}
    </div>
  )
}

// ─── Success state ────────────────────────────────────────────────────────────

function SuccessMessage({ serviceName, selectedDate, startTime }: { serviceName: string; selectedDate: Date; startTime: string }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
      className="text-center py-10 space-y-5"
    >
      <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
        <Check className="w-8 h-8 text-primary" />
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-heading font-semibold text-foreground">Booking bekreftet!</h3>
        <p className="text-muted-foreground text-sm max-w-sm mx-auto">
          Din time for <strong>{serviceName}</strong>{' '}
          {format(selectedDate, "d. MMMM 'kl.' HH:mm", {
            locale: nb,
          }).replace('HH:mm', startTime.slice(0, 5))}{' '}
          er bestilt. Du vil motta en bekreftelse på e-post.
        </p>
      </div>
    </motion.div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function Booking({ services, initialTimeslots, bookingWindowDays }: BookingProps) {
  const [currentStep, setCurrentStep] = useState<StepNumber>(1)
  const [direction, setDirection] = useState(1)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [selectedTimeslot, setSelectedTimeslot] = useState<Timeslot | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      customer_name: '',
      customer_email: '',
      customer_phone: '',
      service_id: '',
      timeslot_id: '',
      notes: '',
    },
  })

  const hasAvailableSlots = initialTimeslots.some((t) => t.is_available)

  const goToStep = useCallback(
    (next: StepNumber) => {
      setDirection(next > currentStep ? 1 : -1)
      setCurrentStep(next)
    },
    [currentStep],
  )

  const handleNext = useCallback(() => {
    if (currentStep < 5) goToStep((currentStep + 1) as StepNumber)
  }, [currentStep, goToStep])

  const handleBack = useCallback(() => {
    if (currentStep > 1) goToStep((currentStep - 1) as StepNumber)
  }, [currentStep, goToStep])

  const canAdvance = useCallback((): boolean => {
    switch (currentStep) {
      case 1:
        return selectedService !== null
      case 2:
        return selectedDate !== null
      case 3:
        return selectedTimeslot !== null
      case 4:
        return form.formState.isValid
      default:
        return true
    }
  }, [currentStep, selectedService, selectedDate, selectedTimeslot, form.formState.isValid])

  const handleSelectService = (s: Service) => {
    setSelectedService(s)
    form.setValue('service_id', s.id, { shouldValidate: true })
  }

  const handleSelectTimeslot = (t: Timeslot) => {
    setSelectedTimeslot(t)
    form.setValue('timeslot_id', t.id, { shouldValidate: true })
  }

  const handleSubmit = async () => {
    if (!selectedService || !selectedDate || !selectedTimeslot) return

    const values = form.getValues()
    setIsSubmitting(true)
    setSubmitError(null)

    try {
      const result = await createBooking({
        ...values,
        service_id: selectedService.id,
        timeslot_id: selectedTimeslot.id,
      })

      if ('error' in result && result.error) {
        setSubmitError(result.error)
      } else {
        setIsSuccess(true)
      }
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Noe gikk galt. Prøv igjen eller kontakt oss.'
      setSubmitError(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Step 4 requires async validation trigger before going to step 5
  const handleNextFromDetails = async () => {
    const valid = await form.trigger(['customer_name', 'customer_email', 'customer_phone', 'notes'])
    if (valid) handleNext()
  }

  return (
    <section id="booking" className="py-24 px-4 sm:px-6 lg:px-8 bg-background">
      <div className="max-w-2xl mx-auto">
        {/* Section heading */}
        <div className="text-center mb-14">
          <h2 className="font-heading text-4xl sm:text-5xl font-bold text-foreground tracking-tight mb-4">
            Book time
          </h2>
          <p className="text-muted-foreground text-lg">
            Velg tjeneste, dato og tid — det tar bare noen sekunder
          </p>
        </div>

        {/* Empty state: no timeslots at all */}
        {!hasAvailableSlots ? (
          <div className="rounded-2xl border border-border bg-muted/20 p-10 text-center space-y-4">
            <CalendarDays className="w-12 h-12 text-muted-foreground mx-auto" />
            <div>
              <p className="font-semibold text-foreground">Ingen ledige tider</p>
              <p className="text-sm text-muted-foreground mt-1">
                Ingen ledige tider de neste {bookingWindowDays} dagene. Ta kontakt med oss direkte for booking.
              </p>
            </div>
          </div>
        ) : isSuccess && selectedService && selectedDate && selectedTimeslot ? (
          <SuccessMessage
            serviceName={selectedService.name}
            selectedDate={selectedDate}
            startTime={selectedTimeslot.start_time}
          />
        ) : (
          <div className="rounded-2xl border border-border bg-background shadow-sm overflow-hidden">
            <div className="px-6 pt-8 pb-0">
              <ProgressBar currentStep={currentStep} />
            </div>

            {/* Step content with animation */}
            <div className="relative overflow-hidden px-6 pb-8">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                >
                  {currentStep === 1 && (
                    <ServiceStep
                      services={services}
                      selectedService={selectedService}
                      onSelect={handleSelectService}
                    />
                  )}
                  {currentStep === 2 && (
                    <CalendarStep
                      selectedDate={selectedDate}
                      onSelect={setSelectedDate}
                      availableTimeslots={initialTimeslots}
                      bookingWindowDays={bookingWindowDays}
                    />
                  )}
                  {currentStep === 3 && (
                    <TimeslotStep
                      selectedDate={selectedDate}
                      selectedTimeslot={selectedTimeslot}
                      timeslots={initialTimeslots}
                      onSelect={handleSelectTimeslot}
                    />
                  )}
                  {currentStep === 4 && <DetailsStep form={form} />}
                  {currentStep === 5 && selectedService && selectedDate && selectedTimeslot && (
                    <ConfirmationStep
                      selectedService={selectedService}
                      selectedDate={selectedDate}
                      selectedTimeslot={selectedTimeslot}
                      formData={form.getValues()}
                      isSubmitting={isSubmitting}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Error banner */}
            {submitError && (
              <div className="mx-6 mb-4 flex items-start gap-2.5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                {submitError}
              </div>
            )}

            {/* Navigation */}
            <div className="flex items-center justify-between px-6 pb-8 pt-2 border-t border-border">
              <button
                type="button"
                onClick={handleBack}
                disabled={currentStep === 1}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-muted/50 disabled:opacity-0 disabled:pointer-events-none transition-all duration-200"
              >
                <ChevronLeft className="w-4 h-4" />
                Tilbake
              </button>

              {currentStep < 5 ? (
                <button
                  type="button"
                  onClick={currentStep === 4 ? handleNextFromDetails : handleNext}
                  disabled={!canAdvance()}
                  className={cn(
                    'flex items-center gap-1.5 px-6 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
                    canAdvance()
                      ? 'bg-primary text-primary-foreground hover:opacity-90 shadow-sm'
                      : 'bg-muted text-muted-foreground cursor-not-allowed',
                  )}
                >
                  Neste
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="button"
                  onClick={handleSubmit}
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-semibold bg-primary text-primary-foreground hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed shadow-sm transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Sender…
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Bekreft booking
                    </>
                  )}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  )
}
