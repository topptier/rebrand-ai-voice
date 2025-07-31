import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Call {
  id: string
  client_id: string
  caller_name: string
  caller_phone: string
  call_type: 'inbound' | 'outbound'
  call_status: 'queued' | 'in_progress' | 'completed' | 'failed' | 'transferred'
  call_outcome: string | null
  duration_seconds: number | null
  transcript: string | null
  ai_summary: string | null
  created_at: string
  updated_at: string
  client?: {
    name: string
    business_type: string
  }
}

export const useCalls = () => {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (profile) {
      fetchCalls()
      
      // Subscribe to real-time call updates
      const subscription = supabase
        .channel('calls_channel')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'calls',
            filter: profile.role === 'super_admin' ? undefined : `client_id=eq.${profile.organization_id}`
          }, 
          (payload) => {
            handleRealtimeUpdate(payload)
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [profile])

  const fetchCalls = async () => {
    try {
      let query = supabase
        .from('calls')
        .select(`
          *,
          client:clients(name, business_type)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      // Filter calls based on user role
      if (profile?.role !== 'super_admin') {
        query = query.eq('client_id', profile?.organization_id)
      }

      const { data, error } = await query

      if (error) throw error
      setCalls(data || [])
    } catch (error) {
      console.error('Error fetching calls:', error)
      toast({
        title: "Error",
        description: "Failed to load calls",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setCalls(currentCalls => {
      switch (eventType) {
        case 'INSERT':
          return [newRecord, ...currentCalls]
        case 'UPDATE':
          return currentCalls.map(call => 
            call.id === newRecord.id ? { ...call, ...newRecord } : call
          )
        case 'DELETE':
          return currentCalls.filter(call => call.id !== oldRecord.id)
        default:
          return currentCalls
      }
    })
  }

  const updateCallStatus = async (callId: string, status: string, outcome?: string) => {
    try {
      const updateData: any = { 
        call_status: status,
        updated_at: new Date().toISOString()
      }
      
      if (outcome) {
        updateData.call_outcome = outcome
      }

      const { error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Call status updated successfully",
      })
    } catch (error) {
      console.error('Error updating call:', error)
      toast({
        title: "Error",
        description: "Failed to update call status",
        variant: "destructive",
      })
    }
  }

  const transferCall = async (callId: string, reason: string) => {
    await updateCallStatus(callId, 'transferred', `Transferred: ${reason}`)
  }

  return {
    calls,
    loading,
    fetchCalls,
    updateCallStatus,
    transferCall
  }
}