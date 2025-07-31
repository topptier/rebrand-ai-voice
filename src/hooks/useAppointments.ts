import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'

export interface Appointment {
  id: string
  client_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  appointment_date: string
  appointment_time: string
  service_type: string
  appointment_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes: string | null
  reminder_sent: boolean
  created_at: string
  updated_at: string
  client?: {
    name: string
    business_type: string
  }
}

export interface AppointmentStats {
  total: number
  scheduled: number
  confirmed: number
  completed: number
  cancelled: number
  no_show: number
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0
  })
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (profile) {
      fetchAppointments()
      fetchAppointmentStats()
      
      // Subscribe to real-time appointment updates
      const subscription = supabase
        .channel('appointments_channel')
        .on('postgres_changes', 
          { 
            event: '*', 
            schema: 'public', 
            table: 'appointments',
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

  const fetchAppointments = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select(`
          *,
          client:clients(name, business_type)
        `)
        .order('appointment_date', { ascending: true })
        .limit(100)

      // Filter appointments based on user role
      if (profile?.role !== 'super_admin') {
        query = query.eq('client_id', profile?.organization_id)
      }

      const { data, error } = await query

      if (error) throw error
      setAppointments(data || [])
    } catch (error) {
      console.error('Error fetching appointments:', error)
      toast({
        title: "Error",
        description: "Failed to load appointments",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchAppointmentStats = async () => {
    try {
      let query = supabase
        .from('appointments')
        .select('appointment_status')

      // Filter based on user role
      if (profile?.role !== 'super_admin') {
        query = query.eq('client_id', profile?.organization_id)
      }

      const { data, error } = await query

      if (error) throw error

      const statsData = data?.reduce((acc, appointment) => {
        acc.total++
        acc[appointment.appointment_status as keyof AppointmentStats]++
        return acc
      }, {
        total: 0,
        scheduled: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0
      })

      setStats(statsData || {
        total: 0,
        scheduled: 0,
        confirmed: 0,
        completed: 0,
        cancelled: 0,
        no_show: 0
      })
    } catch (error) {
      console.error('Error fetching appointment stats:', error)
    }
  }

  const handleRealtimeUpdate = (payload: any) => {
    const { eventType, new: newRecord, old: oldRecord } = payload

    setAppointments(currentAppointments => {
      switch (eventType) {
        case 'INSERT':
          return [...currentAppointments, newRecord].sort((a, b) => 
            new Date(a.appointment_date).getTime() - new Date(b.appointment_date).getTime()
          )
        case 'UPDATE':
          return currentAppointments.map(appointment => 
            appointment.id === newRecord.id ? { ...appointment, ...newRecord } : appointment
          )
        case 'DELETE':
          return currentAppointments.filter(appointment => appointment.id !== oldRecord.id)
        default:
          return currentAppointments
      }
    })

    // Refresh stats when appointments change
    fetchAppointmentStats()
  }

  const createAppointment = async (appointmentData: Partial<Appointment>) => {
    try {
      const { data, error } = await supabase
        .from('appointments')
        .insert({
          ...appointmentData,
          client_id: profile?.organization_id,
          appointment_status: 'scheduled'
        })
        .select()
        .single()

      if (error) throw error

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })

      return data
    } catch (error) {
      console.error('Error creating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to create appointment",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: string, notes?: string) => {
    try {
      const updateData: any = { 
        appointment_status: status,
        updated_at: new Date().toISOString()
      }
      
      if (notes) {
        updateData.notes = notes
      }

      const { error } = await supabase
        .from('appointments')
        .update(updateData)
        .eq('id', appointmentId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Appointment status updated successfully",
      })
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment status",
        variant: "destructive",
      })
    }
  }

  const sendReminder = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ 
          reminder_sent: true,
          updated_at: new Date().toISOString()
        })
        .eq('id', appointmentId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Reminder sent successfully",
      })
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  return {
    appointments,
    stats,
    loading,
    fetchAppointments,
    createAppointment,
    updateAppointmentStatus,
    sendReminder
  }
}