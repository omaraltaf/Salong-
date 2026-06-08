export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      services: {
        Row: {
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
        Insert: {
          id?: string
          name: string
          description?: string | null
          duration_minutes: number
          price_from?: number | null
          price_to?: number | null
          category: 'dame' | 'herre' | 'barn' | 'behandling'
          icon?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          duration_minutes?: number
          price_from?: number | null
          price_to?: number | null
          category?: 'dame' | 'herre' | 'barn' | 'behandling'
          icon?: string | null
          is_active?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      pricing: {
        Row: {
          id: string
          service_id: string
          label: string
          price: number
          is_active: boolean
          sort_order: number
        }
        Insert: {
          id?: string
          service_id: string
          label: string
          price: number
          is_active?: boolean
          sort_order?: number
        }
        Update: {
          id?: string
          service_id?: string
          label?: string
          price?: number
          is_active?: boolean
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: 'pricing_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      timeslots: {
        Row: {
          id: string
          date: string
          start_time: string
          end_time: string
          service_id: string | null
          is_available: boolean
          created_at: string
        }
        Insert: {
          id?: string
          date: string
          start_time: string
          end_time: string
          service_id?: string | null
          is_available?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          date?: string
          start_time?: string
          end_time?: string
          service_id?: string | null
          is_available?: boolean
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'timeslots_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          }
        ]
      }
      bookings: {
        Row: {
          id: string
          timeslot_id: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          service_id: string | null
          notes: string | null
          status: 'pending' | 'confirmed' | 'cancelled'
          created_at: string
        }
        Insert: {
          id?: string
          timeslot_id?: string | null
          customer_name: string
          customer_email: string
          customer_phone: string
          service_id?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Update: {
          id?: string
          timeslot_id?: string | null
          customer_name?: string
          customer_email?: string
          customer_phone?: string
          service_id?: string | null
          notes?: string | null
          status?: 'pending' | 'confirmed' | 'cancelled'
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: 'bookings_service_id_fkey'
            columns: ['service_id']
            isOneToOne: false
            referencedRelation: 'services'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'bookings_timeslot_id_fkey'
            columns: ['timeslot_id']
            isOneToOne: false
            referencedRelation: 'timeslots'
            referencedColumns: ['id']
          }
        ]
      }
      contact_submissions: {
        Row: {
          id: string
          name: string
          email: string
          phone: string | null
          message: string
          is_read: boolean
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          email: string
          phone?: string | null
          message: string
          is_read?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          email?: string
          phone?: string | null
          message?: string
          is_read?: boolean
          created_at?: string
        }
        Relationships: []
      }
      content_blocks: {
        Row: {
          id: string
          key: string
          value: string
          updated_at: string
        }
        Insert: {
          id?: string
          key: string
          value: string
          updated_at?: string
        }
        Update: {
          id?: string
          key?: string
          value?: string
          updated_at?: string
        }
        Relationships: []
      }
      opening_hours: {
        Row: {
          id: string
          day_of_week: number
          open_time: string | null
          close_time: string | null
          is_closed: boolean
        }
        Insert: {
          id?: string
          day_of_week: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
        }
        Update: {
          id?: string
          day_of_week?: number
          open_time?: string | null
          close_time?: string | null
          is_closed?: boolean
        }
        Relationships: []
      }
      testimonials: {
        Row: {
          id: string
          author_name: string
          content: string
          rating: number
          is_published: boolean
          sort_order: number
          created_at: string
        }
        Insert: {
          id?: string
          author_name: string
          content: string
          rating?: number
          is_published?: boolean
          sort_order?: number
          created_at?: string
        }
        Update: {
          id?: string
          author_name?: string
          content?: string
          rating?: number
          is_published?: boolean
          sort_order?: number
          created_at?: string
        }
        Relationships: []
      }
      gallery: {
        Row: {
          id: string
          url: string
          alt_text: string | null
          section: 'hero' | 'about' | 'gallery' | null
          sort_order: number
          is_active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          url: string
          alt_text?: string | null
          section?: 'hero' | 'about' | 'gallery' | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          url?: string
          alt_text?: string | null
          section?: 'hero' | 'about' | 'gallery' | null
          sort_order?: number
          is_active?: boolean
          created_at?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          id: string
          platform: string
          url: string
          is_active: boolean
        }
        Insert: {
          id?: string
          platform: string
          url: string
          is_active?: boolean
        }
        Update: {
          id?: string
          platform?: string
          url?: string
          is_active?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      service_category: 'dame' | 'herre' | 'barn' | 'behandling'
      booking_status: 'pending' | 'confirmed' | 'cancelled'
      gallery_section: 'hero' | 'about' | 'gallery'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

// ─── Convenience Row type aliases ─────────────────────────────────────────────

export type ServiceRow = Database['public']['Tables']['services']['Row']
export type PricingRow = Database['public']['Tables']['pricing']['Row']
export type TimeslotRow = Database['public']['Tables']['timeslots']['Row']
export type BookingRow = Database['public']['Tables']['bookings']['Row']
export type ContactSubmissionRow = Database['public']['Tables']['contact_submissions']['Row']
export type ContentBlockRow = Database['public']['Tables']['content_blocks']['Row']
export type OpeningHoursRow = Database['public']['Tables']['opening_hours']['Row']
export type TestimonialRow = Database['public']['Tables']['testimonials']['Row']
export type GalleryRow = Database['public']['Tables']['gallery']['Row']
export type SocialLinkRow = Database['public']['Tables']['social_links']['Row']
