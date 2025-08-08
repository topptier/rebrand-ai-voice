import React, { useState, useEffect, createContext, useContext, useMemo } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Call {
  id: string
  client_id: string
  client?: { name: string }
  caller_name: string
  caller_phone: string
  call_type: 'inbound' | 'outbound'
  call_status: 'pending' | 'in_progress' | 'completed' | 'missed' | 'voicemail'
  call_outcome?: string
  duration?: number
  duration_seconds?: number
  start_time: string
  end_time?: string
  notes?: string
  assigned_agent?: string
  created_at: string
  updated_at: string
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
    if (profile) {
      fetchCalls()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [profile?.id])

  const recalcStats = (list: Call[]) => {
    const total = list.length
    const completed = list.filter(c => c.call_status === 'completed').length
    const avg = list.reduce((acc, c) => acc + (c.duration || 0), 0) / (total || 1)
    const conv = total > 0 ? (completed / total) * 100 : 0
    setStats({ totalCalls: total, completedCalls: completed, avgDuration: avg, conversionRate: conv })
  }

  const fetchCalls = async () => {
    try {
      // Still mock for now
      const mockCalls: Call[] = []
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
    try {
      // Mock insert
      const now = new Date().toISOString()
      const newCall: Call = {
        id: crypto.randomUUID(),
        client_id: 'demo-client',
        client: { name: 'Demo Client' },
        caller_name: callData.caller_name,
        caller_phone: callData.caller_phone,
        call_type: callData.call_type,
        call_status: 'pending',
        start_time: now,
        created_at: now,
        updated_at: now,
        notes: callData.notes,
      }
      const next = [newCall, ...calls]
      setCalls(next)
      recalcStats(next)
      toast({ title: 'Success', description: 'Call logged successfully' })
    } catch (error) {
      console.error('Error creating call:', error)
      toast({ title: 'Error', description: 'Failed to log call', variant: 'destructive' })
      throw error
    }
  }

  const updateCallStatus = async (callId: string, status: Call['call_status'], duration?: number) => {
    try {
      const next = calls.map(c =>
        c.id === callId
          ? {
              ...c,
              call_status: status,
              duration: duration ?? c.duration,
              end_time: status === 'completed' || status === 'missed' ? new Date().toISOString() : c.end_time,
              updated_at: new Date().toISOString(),
            }
          : c
      )
      setCalls(next)
      recalcStats(next)
      toast({ title: 'Success', description: 'Call status updated' })
    } catch (error) {
      console.error('Error updating call:', error)
      toast({ title: 'Error', description: 'Failed to update call', variant: 'destructive' })
    }
  }

  const deleteCall = async (callId: string) => {
    try {
      const next = calls.filter(c => c.id !== callId)
      setCalls(next)
      recalcStats(next)
      toast({ title: 'Success', description: 'Call deleted successfully' })
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
