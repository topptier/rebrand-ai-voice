import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export interface Appointment {
  id: string
  organization_id: string
  customer_name: string
  customer_phone: string
  customer_email: string
  scheduled_at: string
  duration_minutes: number
  status: 'scheduled' | 'confirmed' | 'cancelled' | 'completed' | 'no_show'
  notes?: string
  created_at: string
  updated_at: string
}

export interface AppointmentForm {
  customer_name: string
  customer_phone: string
  customer_email: string
  scheduled_at: string
  duration_minutes: number
  notes?: string
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (profile) {
      fetchAppointments()
    }
  }, [profile, fetchAppointments])

  const fetchAppointments = useCallback(async () => {
    if (!profile?.organization_id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select('*')
        .eq('organization_id', profile.organization_id)
        .order('scheduled_at', { ascending: true })

      if (error) {
        throw error
      }

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
  }, [profile?.organization_id, toast])

  const createAppointment = async (appointmentData: AppointmentForm) => {
    if (!profile?.organization_id) {
      throw new Error('No organization ID found')
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .insert({
          organization_id: profile.organization_id,
          customer_name: appointmentData.customer_name,
          customer_phone: appointmentData.customer_phone,
          customer_email: appointmentData.customer_email,
          scheduled_at: appointmentData.scheduled_at,
          duration_minutes: appointmentData.duration_minutes,
          notes: appointmentData.notes,
          status: 'scheduled'
        })

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Appointment created successfully",
      })
      await fetchAppointments()
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

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['status']) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .update({ status })
        .eq('id', appointmentId)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Appointment status updated",
      })
      await fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment", 
        variant: "destructive",
      })
    }
  }

  const sendReminder = async (appointmentId: string) => {
    try {
      // Mock implementation for reminders - could integrate with email/SMS service
      console.log('Send reminder:', appointmentId)
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

  // Calculate stats from appointments
  const stats = {
    total: appointments.length,
    scheduled: appointments.filter(a => a.status === 'scheduled').length,
    confirmed: appointments.filter(a => a.status === 'confirmed').length,
    completed: appointments.filter(a => a.status === 'completed').length,
    cancelled: appointments.filter(a => a.status === 'cancelled').length,
    no_show: appointments.filter(a => a.status === 'no_show').length,
  }

  const deleteAppointment = async (appointmentId: string) => {
    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)

      if (error) {
        throw error
      }

      toast({
        title: "Success", 
        description: "Appointment deleted successfully",
      })
      await fetchAppointments()
    } catch (error) {
      console.error('Error deleting appointment:', error)
      toast({
        title: "Error",
        description: "Failed to delete appointment",
        variant: "destructive",
      })
    }
  }

  return {
    appointments,
    loading,
    stats,
    createAppointment,
    updateAppointmentStatus,
    sendReminder,
    deleteAppointment,
    fetchAppointments
  }
}