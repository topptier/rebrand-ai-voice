import { createClient } from '@supabase/supabase-js'

// For Lovable's native Supabase integration, these should be automatically available
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL || ''
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_ANON_KEY || ''

if (!supabaseUrl || !supabaseKey) {
  console.error('Supabase configuration missing. Please ensure Supabase is properly connected to your Lovable project.')
  console.log('Available env vars:', Object.keys(import.meta.env))
}

export const supabase = createClient(supabaseUrl, supabaseKey)

export type Database = {
  public: {
    Tables: {
      organizations: {
        Row: {
          id: string
          name: string
          domain: string
          subscription_tier: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          domain: string
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string
          subscription_tier?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          organization_id: string
          email: string
          full_name: string
          role: 'super_admin' | 'org_admin' | 'agent' | 'client'
          phone: string | null
          avatar_url: string | null
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          organization_id: string
          email: string
          full_name: string
          role?: 'super_admin' | 'org_admin' | 'agent' | 'client'
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          organization_id?: string
          email?: string
          full_name?: string
          role?: 'super_admin' | 'org_admin' | 'agent' | 'client'
          phone?: string | null
          avatar_url?: string | null
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}