import React, { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export interface Call {
  id: string
  organization_id: string
  twilio_call_sid?: string
  caller_phone: string
  caller_name: string
  direction: 'inbound' | 'outbound'
  status: 'initiated' | 'ringing' | 'answered' | 'completed' | 'failed' | 'busy' | 'no_answer'
  call_type?: 'appointment' | 'inquiry' | 'emergency' | 'support' | 'other'
  start_time: string
  end_time?: string
  duration_seconds?: number
  recording_url?: string
  transcript?: string
  escalated_to_human?: boolean
  escalation_reason?: string
  outcome?: 'appointment_booked' | 'information_provided' | 'payment_collected' | 'escalated' | 'voicemail' | 'hang_up'
  notes?: string
  created_at: string
  updated_at: string
  // Legacy compatibility fields
  call_status: 'pending' | 'in_progress' | 'completed' | 'missed' | 'voicemail'
  call_outcome?: string
  duration?: number
  assigned_agent?: string
  // Relationship data  
  organization?: { name: string }
}

export interface CallForm {
  caller_name: string
  caller_phone: string
  call_type: 'inbound' | 'outbound'
  notes?: string
}

interface CallsContextValue {
  calls: Call[]
  loading: boolean
  stats: {
    totalCalls: number
    completedCalls: number
    avgDuration: number
    conversionRate: number
  }
  fetchCalls: () => Promise<void>
  createCall: (callData: CallForm) => Promise<void>
  updateCall: (callId: string, callData: CallForm) => Promise<void>
  updateCallStatus: (callId: string, status: Call['call_status'], duration?: number) => Promise<void>
  deleteCall: (callId: string) => Promise<void>
  transferCall: (callId: string, agentId: string) => Promise<void>
  simulateCallFlow: () => Promise<void>
}

const CallsContext = createContext<CallsContextValue | undefined>(undefined)

export const CallsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calls, setCalls] = useState<Call[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalCalls: 0,
    completedCalls: 0,
    avgDuration: 0,
    conversionRate: 0
  })
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (profile?.organization_id) {
      fetchCalls()
    }
  }, [profile?.organization_id])

  const recalcStats = (list: Call[]) => {
    const total = list.length
    const completed = list.filter(c => c.call_status === 'completed').length
    const avg = list.reduce((acc, c) => acc + (c.duration_seconds || 0), 0) / (total || 1)
    const conv = total > 0 ? (completed / total) * 100 : 0
    setStats({ totalCalls: total, completedCalls: completed, avgDuration: avg, conversionRate: conv })
  }

  const processCallData = (call: any): Call => {
    const statusMap: { [key: string]: Call['call_status'] } = {
      'initiated': 'pending',
      'ringing': 'pending', 
      'answered': 'in_progress',
      'completed': 'completed',
      'failed': 'missed',
      'busy': 'missed',
      'no_answer': 'missed'
    }

    return {
      ...call,
      call_status: statusMap[call.status] || 'pending',
      call_outcome: call.outcome,
      duration: call.duration_seconds,
      call_type: call.direction, // Map direction to call_type for compatibility
      organization: call.organizations ? { name: call.organizations.name } : undefined,
    }
  }

  const fetchCalls = async () => {
    if (!profile?.organization_id) {
      setLoading(false)
      return
    }

    try {
      // DEMO MODE: Mock some calls to show CRUD functionality
      const mockCalls: Call[] = [
        {
          id: 'call-1',
          organization_id: profile.organization_id,
          caller_phone: '+1 (555) 111-2222',
          caller_name: 'Alex Thompson',
          direction: 'inbound',
          status: 'completed',
          start_time: new Date('2025-08-11T09:30:00').toISOString(),
          end_time: new Date('2025-08-11T09:35:00').toISOString(),
          duration_seconds: 300,
          outcome: 'appointment_booked',
          created_at: new Date('2025-08-11T09:30:00').toISOString(),
          updated_at: new Date('2025-08-11T09:35:00').toISOString(),
          // Legacy compatibility fields
          call_status: 'completed',
          call_outcome: 'appointment_booked',
          duration: 300,
          call_type: 'inbound',
          organization: { name: 'Demo Healthcare Clinic' }
        },
        {
          id: 'call-2',
          organization_id: profile.organization_id,
          caller_phone: '+1 (555) 333-4444',
          caller_name: 'Maria Garcia',
          direction: 'outbound',
          status: 'completed',
          start_time: new Date('2025-08-11T11:15:00').toISOString(),
          end_time: new Date('2025-08-11T11:18:00').toISOString(),
          duration_seconds: 180,
          outcome: 'information_provided',
          created_at: new Date('2025-08-11T11:15:00').toISOString(),
          updated_at: new Date('2025-08-11T11:18:00').toISOString(),
          // Legacy compatibility fields
          call_status: 'completed',
          call_outcome: 'information_provided',
          duration: 180,
          call_type: 'outbound',
          organization: { name: 'Demo Healthcare Clinic' }
        },
        {
          id: 'call-3',
          organization_id: profile.organization_id,
          caller_phone: '+1 (555) 555-6666',
          caller_name: 'Robert Johnson',
          direction: 'inbound',
          status: 'answered',
          start_time: new Date().toISOString(),
          duration_seconds: 45,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          // Legacy compatibility fields
          call_status: 'in_progress',
          duration: 45,
          call_type: 'inbound',
          organization: { name: 'Demo Healthcare Clinic' }
        }
      ]

      setCalls(mockCalls)
      recalcStats(mockCalls)
    } catch (error) {
      console.error('Error fetching calls:', error)
      toast({ title: 'Error', description: 'Failed to load calls', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const createCall = async (callData: CallForm) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const { error } = await supabase
        .from('calls')
        .insert({
          organization_id: profile.organization_id,
          caller_name: callData.caller_name,
          caller_phone: callData.caller_phone,
          direction: callData.call_type,
          status: 'initiated',
          start_time: new Date().toISOString(),
        })

      if (error) {
        throw error
      }

      toast({ title: 'Success', description: 'Call logged successfully' })
      await fetchCalls()
    } catch (error) {
      console.error('Error creating call:', error)
      toast({ title: 'Error', description: 'Failed to log call', variant: 'destructive' })
      throw error
    }
  }

  const updateCall = async (callId: string, callData: CallForm) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const { error } = await supabase
        .from('calls')
        .update({
          caller_name: callData.caller_name,
          caller_phone: callData.caller_phone,
          direction: callData.call_type,
          updated_at: new Date().toISOString(),
        })
        .eq('id', callId)
        .eq('organization_id', profile.organization_id)

      if (error) {
        throw error
      }

      toast({ title: 'Success', description: 'Call updated successfully' })
      await fetchCalls()
    } catch (error) {
      console.error('Error updating call:', error)
      toast({ title: 'Error', description: 'Failed to update call', variant: 'destructive' })
      throw error
    }
  }

  const updateCallStatus = async (callId: string, status: Call['call_status'], duration?: number) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const statusMap: { [key in Call['call_status']]: string } = {
        'pending': 'initiated',
        'in_progress': 'answered',
        'completed': 'completed',
        'missed': 'failed',
        'voicemail': 'completed'
      }

      const updateData: any = {
        status: statusMap[status],
        updated_at: new Date().toISOString(),
      }

      if (duration !== undefined) {
        updateData.duration_seconds = duration
      }

      if (status === 'completed' || status === 'missed') {
        updateData.end_time = new Date().toISOString()
      }

      const { error } = await supabase
        .from('calls')
        .update(updateData)
        .eq('id', callId)
        .eq('organization_id', profile.organization_id)

      if (error) {
        throw error
      }

      toast({ title: 'Success', description: 'Call status updated' })
      await fetchCalls()
    } catch (error) {
      console.error('Error updating call:', error)
      toast({ title: 'Error', description: 'Failed to update call', variant: 'destructive' })
    }
  }

  const deleteCall = async (callId: string) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const { error } = await supabase
        .from('calls')
        .delete()
        .eq('id', callId)
        .eq('organization_id', profile.organization_id)

      if (error) {
        throw error
      }

      toast({ title: 'Success', description: 'Call deleted successfully' })
      await fetchCalls()
    } catch (error) {
      console.error('Error deleting call:', error)
      toast({ title: 'Error', description: 'Failed to delete call', variant: 'destructive' })
    }
  }

  const transferCall = async (callId: string, agentId: string) => {
    try {
      console.log('Transfer call:', callId, agentId)
      toast({ title: 'Success', description: 'Call transferred successfully' })
    } catch (error) {
      console.error('Error transferring call:', error)
      toast({ title: 'Error', description: 'Failed to transfer call', variant: 'destructive' })
    }
  }

  const simulateCallFlow = async () => {
    // Create a simulated inbound call and progress through statuses
    const now = new Date()
    const id = crypto.randomUUID()
    const call: Call = {
      id,
      client_id: 'demo-client',
      client: { name: 'ReceptAI Demo Org' },
      caller_name: 'Alex Johnson',
      caller_phone: '+1 (415) 555-0138',
      call_type: 'inbound',
      call_status: 'in_progress',
      start_time: now.toISOString(),
      created_at: now.toISOString(),
      updated_at: now.toISOString(),
      notes: 'Demo call started from Quick Actions',
    }
    const startList = [call, ...calls]
    setCalls(startList)
    recalcStats(startList)
    toast({ title: 'Call Started', description: 'Inbound caller connected. Simulating flow...' })

    // After 6 seconds, mark completed with duration
    setTimeout(() => {
      const duration = 78 // seconds
      const endList: Call[] = startList.map(c =>
        c.id === id
          ? ({
              ...c,
              call_status: 'completed' as Call['call_status'],
              duration,
              end_time: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              call_outcome: 'appointment_booked',
            } as Call)
          : c
      )
      setCalls(endList)
      recalcStats(endList)
      toast({ title: 'Call Completed', description: 'Demo call ended successfully' })
    }, 6000)
  }

  const value = useMemo<CallsContextValue>(() => ({
    calls,
    loading,
    stats,
    fetchCalls,
    createCall,
    updateCall,
    updateCallStatus,
    deleteCall,
    transferCall,
    simulateCallFlow,
  }), [calls, loading, stats])

  return <CallsContext.Provider value={value}>{children}</CallsContext.Provider>
}

export const useCalls = () => {
  const ctx = useContext(CallsContext)
  if (!ctx) {
    throw new Error('useCalls must be used within a CallsProvider')
  }
  return ctx
}
