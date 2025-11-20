import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://byqnksapkhiurzocguls.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ5cW5rc2Fwa2hpdXJ6b2NndWxzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjM2NTMyNDUsImV4cCI6MjA3OTIyOTI0NX0.P5BrvYW4-GqznTPcekIUfaR7PIHziuo8bNiYTq0luKc'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      skills: {
        Row: {
          id: string
          user_address: string
          title: string
          description: string
          category: string
          tags: string[]
          price: number
          active: boolean
          created_at: string
        }
        Insert: {
          id?: string
          user_address: string
          title: string
          description: string
          category: string
          tags: string[]
          price: number
          active?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          user_address?: string
          title?: string
          description?: string
          category?: string
          tags?: string[]
          price?: number
          active?: boolean
          created_at?: string
        }
      }
      platform_fees: {
        Row: {
          id: string
          user_address: string
          offer_id: number
          fee_amount: number
          created_at: string
        }
        Insert: {
          id?: string
          user_address: string
          offer_id: number
          fee_amount: number
          created_at?: string
        }
        Update: {
          id?: string
          user_address?: string
          offer_id?: number
          fee_amount?: number
          created_at?: string
        }
      }
    }
  }
}