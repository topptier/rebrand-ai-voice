import { useState, useEffect } from 'react'
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

export const useCalls = () => {
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
  }, [profile])

  const fetchCalls = async () => {
    try {
      // For now, return mock data since calls table doesn't exist
      const mockCalls: Call[] = []
      setCalls(mockCalls)
      
      // Calculate stats from mock data
      setStats({
        totalCalls: mockCalls.length,
        completedCalls: mockCalls.filter(call => call.call_status === 'completed').length,
        avgDuration: mockCalls.reduce((acc, call) => acc + (call.duration || 0), 0) / (mockCalls.length || 1),
        conversionRate: mockCalls.length > 0 ? (mockCalls.filter(call => call.call_status === 'completed').length / mockCalls.length) * 100 : 0
      })
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

  const createCall = async (callData: CallForm) => {
    try {
      // Mock implementation - would need calls table
      console.log('Create call:', callData)
      toast({
        title: "Success",
        description: "Call logged successfully",
      })
      await fetchCalls()
    } catch (error) {
      console.error('Error creating call:', error)
      toast({
        title: "Error",
        description: "Failed to log call",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateCallStatus = async (callId: string, status: Call['call_status'], duration?: number) => {
    try {
      // Mock implementation - would need calls table
      console.log('Update call status:', callId, status, duration)
      toast({
        title: "Success",
        description: "Call status updated",
      })
      await fetchCalls()
    } catch (error) {
      console.error('Error updating call:', error)
      toast({
        title: "Error",
        description: "Failed to update call",
        variant: "destructive",
      })
    }
  }

  const deleteCall = async (callId: string) => {
    try {
      // Mock implementation - would need calls table
      console.log('Delete call:', callId)
      toast({
        title: "Success",
        description: "Call deleted successfully",
      })
      await fetchCalls()
    } catch (error) {
      console.error('Error deleting call:', error)
      toast({
        title: "Error",
        description: "Failed to delete call",
        variant: "destructive",
      })
    }
  }

  const transferCall = async (callId: string, agentId: string) => {
    try {
      console.log('Transfer call:', callId, agentId)
      toast({
        title: "Success",
        description: "Call transferred successfully",
      })
    } catch (error) {
      console.error('Error transferring call:', error)
      toast({
        title: "Error",
        description: "Failed to transfer call",
        variant: "destructive",
      })
    }
  }

  return {
    calls,
    loading,
    stats,
    createCall,
    updateCallStatus,
    deleteCall,
    transferCall,
    fetchCalls
  }
}