import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, isWithinInterval, parse } from 'date-fns'
import { nb } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(amount: number, currency = 'NOK'): string {
  return new Intl.NumberFormat('nb-NO', { style: 'currency', currency }).format(amount)
}

export function formatDate(date: string | Date): string {
  return format(new Date(date), 'EEEE d. MMMM yyyy', { locale: nb })
}

export function formatTime(time: string): string {
  return time.slice(0, 5)
}

export function isOpenNow(openTime: string | null, closeTime: string | null, isClosed: boolean): boolean {
  if (isClosed || !openTime || !closeTime) return false
  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const open = parse(`${todayStr} ${openTime}`, 'yyyy-MM-dd HH:mm:ss', new Date())
  const close = parse(`${todayStr} ${closeTime}`, 'yyyy-MM-dd HH:mm:ss', new Date())
  return isWithinInterval(now, { start: open, end: close })
}

export const DAYS_NB = ['Søndag', 'Mandag', 'Tirsdag', 'Onsdag', 'Torsdag', 'Fredag', 'Lørdag']
