export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      services: {
        Row: ServiceRow
        Insert: Omit<ServiceRow, 'id' | 'created_at'>
        Update: Partial<Omit<ServiceRow, 'id' | 'created_at'>>
      }
      pricing: {
        Row: PricingRow
        Insert: Omit<PricingRow, 'id'>
        Update: Partial<Omit<PricingRow, 'id'>>
      }
      timeslots: {
        Row: TimeslotRow
        Insert: Omit<TimeslotRow, 'id' | 'created_at'>
        Update: Partial<Omit<TimeslotRow, 'id' | 'created_at'>>
      }
      bookings: {
        Row: BookingRow
        Insert: Omit<BookingRow, 'id' | 'created_at'>
        Update: Partial<Omit<BookingRow, 'id' | 'created_at'>>
      }
      contact_submissions: {
        Row: ContactSubmissionRow
        Insert: Omit<ContactSubmissionRow, 'id' | 'created_at'>
        Update: Partial<Omit<ContactSubmissionRow, 'id' | 'created_at'>>
      }
      content_blocks: {
        Row: ContentBlockRow
        Insert: Omit<ContentBlockRow, 'id'>
        Update: Partial<Omit<ContentBlockRow, 'id'>>
      }
      opening_hours: {
        Row: OpeningHoursRow
        Insert: Omit<OpeningHoursRow, 'id'>
        Update: Partial<Omit<OpeningHoursRow, 'id'>>
      }
      testimonials: {
        Row: TestimonialRow
        Insert: Omit<TestimonialRow, 'id' | 'created_at'>
        Update: Partial<Omit<TestimonialRow, 'id' | 'created_at'>>
      }
      gallery: {
        Row: GalleryRow
        Insert: Omit<GalleryRow, 'id' | 'created_at'>
        Update: Partial<Omit<GalleryRow, 'id' | 'created_at'>>
      }
      social_links: {
        Row: SocialLinkRow
        Insert: Omit<SocialLinkRow, 'id'>
        Update: Partial<Omit<SocialLinkRow, 'id'>>
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      service_category: 'dame' | 'herre' | 'barn' | 'behandling'
      booking_status: 'pending' | 'confirmed' | 'cancelled'
      gallery_section: 'hero' | 'about' | 'gallery'
    }
  }
}

// ─── Row types ────────────────────────────────────────────────────────────────

export interface ServiceRow {
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
  created_at: string
}

export interface PricingRow {
  id: string
  service_id: string
  label: string
  price: number
  is_active: boolean
  sort_order: number
}

export interface TimeslotRow {
  id: string
  date: string
  start_time: string
  end_time: string
  service_id: string | null
  is_available: boolean
  created_at: string
}

export interface BookingRow {
  id: string
  timeslot_id: string
  customer_name: string
  customer_email: string
  customer_phone: string
  service_id: string
  notes: string | null
  status: 'pending' | 'confirmed' | 'cancelled'
  created_at: string
}

export interface ContactSubmissionRow {
  id: string
  name: string
  email: string
  phone: string | null
  message: string
  is_read: boolean
  created_at: string
}

export interface ContentBlockRow {
  id: string
  key: string
  value: string
  updated_at: string
}

export interface OpeningHoursRow {
  id: string
  day_of_week: 0 | 1 | 2 | 3 | 4 | 5 | 6
  open_time: string | null
  close_time: string | null
  is_closed: boolean
}

export interface TestimonialRow {
  id: string
  author_name: string
  content: string
  rating: 1 | 2 | 3 | 4 | 5
  is_published: boolean
  sort_order: number
  created_at: string
}

export interface GalleryRow {
  id: string
  url: string
  alt_text: string | null
  section: 'hero' | 'about' | 'gallery'
  sort_order: number
  is_active: boolean
  created_at: string
}

export interface SocialLinkRow {
  id: string
  platform: string
  url: string
  is_active: boolean
}
