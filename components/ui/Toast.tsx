'use client'

import { AnimatePresence, motion } from 'framer-motion'
import { cn } from '@/lib/utils'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type ToastType = 'success' | 'error' | 'info'

interface Toast {
  id: string
  message: string
  type: ToastType
}

interface ToastProps {
  toasts: Toast[]
  removeToast: (id: string) => void
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const borderColors: Record<ToastType, string> = {
  success: 'border-l-emerald-500',
  error: 'border-l-rose-500',
  info: 'border-l-[var(--color-primary)]',
}

const iconColors: Record<ToastType, string> = {
  success: 'text-emerald-500',
  error: 'text-rose-500',
  info: 'text-[var(--color-primary)]',
}

function ToastIcon({ type }: { type: ToastType }) {
  if (type === 'success') {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.707-9.293a1 1 0 0 0-1.414-1.414L9 10.586 7.707 9.293a1 1 0 0 0-1.414 1.414l2 2a1 1 0 0 0 1.414 0l4-4Z"
        />
      </svg>
    )
  }
  if (type === 'error') {
    return (
      <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden="true">
        <path
          fillRule="evenodd"
          clipRule="evenodd"
          d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
        />
      </svg>
    )
  }
  return (
    <svg viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0" aria-hidden="true">
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M18 10a8 8 0 1 1-16 0 8 8 0 0 1 16 0Zm-7-4a1 1 0 1 1-2 0 1 1 0 0 1 2 0ZM9 9a.75.75 0 0 0 0 1.5h.253a.25.25 0 0 1 .244.304l-.459 2.066A1.75 1.75 0 0 0 10.747 15H11a.75.75 0 0 0 0-1.5h-.253a.25.25 0 0 1-.244-.304l.459-2.066A1.75 1.75 0 0 0 9.253 9H9Z"
      />
    </svg>
  )
}

// ---------------------------------------------------------------------------
// Toast container – main export
// ---------------------------------------------------------------------------

export default function ToastContainer({ toasts, removeToast }: ToastProps) {
  return (
    <div
      aria-live="polite"
      aria-atomic="false"
      className="pointer-events-none fixed bottom-6 right-6 z-[200] flex flex-col gap-3"
    >
      <AnimatePresence initial={false}>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            layout
            initial={{ opacity: 0, x: 64, scale: 0.96 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 64, scale: 0.96, transition: { duration: 0.2 } }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            className={cn(
              'pointer-events-auto flex w-80 items-start gap-3 rounded-lg border-l-4 bg-white px-4 py-3 shadow-lg shadow-black/10 ring-1 ring-black/5',
              borderColors[toast.type],
            )}
            role="alert"
          >
            {/* Icon */}
            <span className={cn('mt-0.5', iconColors[toast.type])}>
              <ToastIcon type={toast.type} />
            </span>

            {/* Message */}
            <p className="flex-1 text-sm font-medium text-[var(--color-foreground)]">
              {toast.message}
            </p>

            {/* Dismiss button */}
            <button
              onClick={() => removeToast(toast.id)}
              aria-label="Lukk varsel"
              className="mt-0.5 shrink-0 rounded text-[var(--color-foreground)]/40 transition-colors hover:text-[var(--color-foreground)]/70 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            >
              <svg viewBox="0 0 16 16" fill="currentColor" className="size-4" aria-hidden="true">
                <path d="M3.72 3.72a.75.75 0 0 1 1.06 0L8 6.94l3.22-3.22a.75.75 0 1 1 1.06 1.06L9.06 8l3.22 3.22a.75.75 0 1 1-1.06 1.06L8 9.06l-3.22 3.22a.75.75 0 0 1-1.06-1.06L6.94 8 3.72 4.78a.75.75 0 0 1 0-1.06Z" />
              </svg>
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
