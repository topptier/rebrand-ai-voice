import React, { createContext, useContext, useEffect, useState } from 'react'
import { User, Session } from '@supabase/supabase-js'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface UserProfile {
  id: string
  organization_id: string | null
  email: string
  full_name: string
  role: 'super_admin' | 'org_admin' | 'agent' | 'user'
  phone: string | null
  avatar_url: string | null
  is_active: boolean
}

interface AuthContextType {
  user: User | null
  profile: UserProfile | null
  session: Session | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, fullName: string, organizationId: string | null) => Promise<void>
  signOut: () => Promise<void>
  hasRole: (roles: string | string[]) => boolean
  isOrgAdmin: boolean
  isSuperAdmin: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)
  
  console.log('AuthContext - Current state:', { user: !!user, profile: !!profile, loading })
  const { toast } = useToast()

  useEffect(() => {
    // Listen for auth changes FIRST
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      setUser(session?.user ?? null)

      if (session?.user) {
        setLoading(true)
        // Defer Supabase calls to avoid deadlocks in the auth callback
        setTimeout(() => {
          fetchUserProfile(session.user!.id)
        }, 0)
      } else {
        setProfile(null)
        setLoading(false)
      }
    })

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      if (session?.user) {
        setLoading(true)
        fetchUserProfile(session.user.id)
      } else {
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, organization_id, role, created_at')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.error('Error fetching profile:', error)
      }

      let row = data as { id: string; organization_id: string | null; role: string } | null

      // If no profile exists, create a minimal one for this user
      if (!row) {
        const { error: insertError } = await supabase
          .from('user_profiles')
          .insert({ id: userId, role: 'user' })

        if (insertError) {
          console.error('Error creating missing profile:', insertError)
        } else {
          row = { id: userId, organization_id: null, role: 'user' }
        }
      }

      if (row) {
        const profile: UserProfile = {
          id: row.id,
          organization_id: row.organization_id || null,
          email: '',
          full_name: '',
          role: (row.role as 'super_admin' | 'org_admin' | 'agent' | 'user') || 'user',
          phone: null,
          avatar_url: null,
          is_active: true,
        }
        setProfile(profile)
      }
    } catch (error) {
      console.error('Error fetching/creating profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const signIn = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Successfully signed in!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign in",
        variant: "destructive",
      })
      throw error
    }
  }

  const signUp = async (email: string, password: string, fullName: string, organizationId: string | null) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
        },
      })

      if (error) {
        throw error
      }

      if (data.user) {
        // Create user profile
        const { error: profileError } = await supabase
          .from('user_profiles')
          .insert({
            id: data.user.id,
            email,
            full_name: fullName,
            organization_id: organizationId,
            role: 'user', // Default role
          })

        if (profileError) {
          throw profileError
        }
      }

      toast({
        title: "Success",
        description: "Account created successfully! Please check your email to verify your account.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create account",
        variant: "destructive",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        throw error
      }
      
      toast({
        title: "Success",
        description: "Successfully signed out!",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to sign out",
        variant: "destructive",
      })
      throw error
    }
  }

  const hasRole = (roles: string | string[]): boolean => {
    if (!profile) return false
    const roleArray = Array.isArray(roles) ? roles : [roles]
    return roleArray.includes(profile.role)
  }

  const isOrgAdmin = hasRole(['org_admin', 'super_admin'])
  const isSuperAdmin = hasRole('super_admin')

  const value = {
    user,
    profile,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    hasRole,
    isOrgAdmin,
    isSuperAdmin,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}