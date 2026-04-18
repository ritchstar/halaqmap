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
      profiles: {
        Row: {
          id: string
          email: string
          full_name: string | null
          phone: string | null
          avatar_url: string | null
          user_type: 'customer' | 'barber' | 'admin'
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          email: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'customer' | 'barber' | 'admin'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          email?: string
          full_name?: string | null
          phone?: string | null
          avatar_url?: string | null
          user_type?: 'customer' | 'barber' | 'admin'
          created_at?: string
          updated_at?: string
        }
      }
      barbers: {
        Row: {
          id: string
          member_number: number | null
          user_id: string | null
          name: string
          email: string
          phone: string
          latitude: number | null
          longitude: number | null
          address: string
          city: string | null
          tier: 'bronze' | 'gold' | 'diamond'
          rating: number
          total_reviews: number
          profile_image: string | null
          cover_image: string | null
          bio: string | null
          experience_years: number | null
          specialties: string[] | null
          is_active: boolean
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          member_number?: number
          user_id?: string | null
          name: string
          email: string
          phone: string
          latitude?: number | null
          longitude?: number | null
          address: string
          city?: string | null
          tier?: 'bronze' | 'gold' | 'diamond'
          rating?: number
          total_reviews?: number
          profile_image?: string | null
          cover_image?: string | null
          bio?: string | null
          experience_years?: number | null
          specialties?: string[] | null
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          member_number?: number
          user_id?: string | null
          name?: string
          email?: string
          phone?: string
          latitude?: number | null
          longitude?: number | null
          address?: string
          city?: string | null
          tier?: 'bronze' | 'gold' | 'diamond'
          rating?: number
          total_reviews?: number
          profile_image?: string | null
          cover_image?: string | null
          bio?: string | null
          experience_years?: number | null
          specialties?: string[] | null
          is_active?: boolean
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      bookings: {
        Row: {
          id: string
          barber_id: string
          customer_id: string | null
          customer_name: string
          customer_phone: string
          customer_email: string | null
          service_name: string
          service_price: number | null
          booking_date: string
          booking_time: string
          duration_minutes: number
          status: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes: string | null
          cancellation_reason: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barber_id: string
          customer_id?: string | null
          customer_name: string
          customer_phone: string
          customer_email?: string | null
          service_name: string
          service_price?: number | null
          booking_date: string
          booking_time: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barber_id?: string
          customer_id?: string | null
          customer_name?: string
          customer_phone?: string
          customer_email?: string | null
          service_name?: string
          service_price?: number | null
          booking_date?: string
          booking_time?: string
          duration_minutes?: number
          status?: 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
          notes?: string | null
          cancellation_reason?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reviews: {
        Row: {
          id: string
          barber_id: string
          customer_id: string | null
          booking_id: string | null
          customer_name: string
          rating: number
          comment: string | null
          images: string[] | null
          barber_reply: string | null
          barber_reply_at: string | null
          is_verified: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barber_id: string
          customer_id?: string | null
          booking_id?: string | null
          customer_name: string
          rating: number
          comment?: string | null
          images?: string[] | null
          barber_reply?: string | null
          barber_reply_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barber_id?: string
          customer_id?: string | null
          booking_id?: string | null
          customer_name?: string
          rating?: number
          comment?: string | null
          images?: string[] | null
          barber_reply?: string | null
          barber_reply_at?: string | null
          is_verified?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      notifications: {
        Row: {
          id: string
          user_id: string
          type: 'booking' | 'payment' | 'review' | 'message' | 'subscription' | 'system'
          title: string
          message: string
          link: string | null
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          type: 'booking' | 'payment' | 'review' | 'message' | 'subscription' | 'system'
          title: string
          message: string
          link?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          type?: 'booking' | 'payment' | 'review' | 'message' | 'subscription' | 'system'
          title?: string
          message?: string
          link?: string | null
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      messages: {
        Row: {
          id: string
          sender_id: string
          receiver_id: string
          message: string
          is_read: boolean
          read_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          sender_id: string
          receiver_id: string
          message: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          sender_id?: string
          receiver_id?: string
          message?: string
          is_read?: boolean
          read_at?: string | null
          created_at?: string
        }
      }
      barber_services: {
        Row: {
          id: string
          barber_id: string
          service_name: string
          description: string | null
          price: number
          duration_minutes: number
          category: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          barber_id: string
          service_name: string
          description?: string | null
          price: number
          duration_minutes: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          barber_id?: string
          service_name?: string
          description?: string | null
          price?: number
          duration_minutes?: number
          category?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
}