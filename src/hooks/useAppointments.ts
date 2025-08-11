import { useState, useEffect } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export interface Appointment {
  id: string
  organization_id: string
  appointment_type_id?: string
  customer_name: string
  customer_phone: string
  customer_email?: string
  scheduled_at: string
  appointment_date: string // Derived from scheduled_at for compatibility
  appointment_time: string // Derived from scheduled_at for compatibility
  duration_minutes: number
  service_type: string // Derived from appointment_type for compatibility
  appointment_status: 'scheduled' | 'confirmed' | 'completed' | 'cancelled' | 'no_show'
  notes?: string
  reminder_sent_at?: string[]
  reminder_sent?: boolean // Computed field
  created_at: string
  updated_at: string
  // Relationship data
  appointment_type?: { name: string; duration_minutes: number }
  organization?: { name: string }
}

export interface AppointmentForm {
  customer_name: string
  customer_phone: string
  customer_email?: string
  appointment_date: string
  appointment_time: string
  service_type: string
  notes?: string
}

interface AppointmentStats {
  total: number
  scheduled: number
  confirmed: number
  completed: number
  cancelled: number
  no_show: number
}

export const useAppointments = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AppointmentStats>({
    total: 0,
    scheduled: 0,
    confirmed: 0,
    completed: 0,
    cancelled: 0,
    no_show: 0
  })
  const { profile } = useAuth()
  const { toast } = useToast()

  useEffect(() => {
    if (profile?.organization_id) {
      fetchAppointments()
    }
  }, [profile?.organization_id])

  const recalcStats = (appointmentList: Appointment[]) => {
    const total = appointmentList.length
    const scheduled = appointmentList.filter(a => a.appointment_status === 'scheduled').length
    const confirmed = appointmentList.filter(a => a.appointment_status === 'confirmed').length
    const completed = appointmentList.filter(a => a.appointment_status === 'completed').length
    const cancelled = appointmentList.filter(a => a.appointment_status === 'cancelled').length
    const no_show = appointmentList.filter(a => a.appointment_status === 'no_show').length
    
    setStats({ total, scheduled, confirmed, completed, cancelled, no_show })
  }

  const fetchAppointments = async () => {
    if (!profile?.organization_id) {
      setLoading(false)
      return
    }

    try {
      const { data, error } = await supabase
        .from('appointments')
        .select(`
          *,
          appointment_types (
            name,
            duration_minutes
          ),
          organizations (
            name
          )
        `)
        .eq('organization_id', profile.organization_id)
        .order('scheduled_at', { ascending: true })

      if (error) {
        throw error
      }

      const processedAppointments: Appointment[] = (data || []).map((apt) => {
        const scheduledAt = new Date(apt.scheduled_at)
        return {
          ...apt,
          appointment_date: scheduledAt.toISOString().split('T')[0],
          appointment_time: scheduledAt.toTimeString().slice(0, 5),
          service_type: apt.appointment_types?.name || 'General',
          reminder_sent: apt.reminder_sent_at && apt.reminder_sent_at.length > 0,
          appointment_status: apt.status as Appointment['appointment_status'],
        }
      })

      setAppointments(processedAppointments)
      recalcStats(processedAppointments)
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

  const createAppointment = async (appointmentData: AppointmentForm) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      // First, get or create appointment type
      let appointmentTypeId: string | null = null
      
      const { data: existingType } = await supabase
        .from('appointment_types')
        .select('id')
        .eq('organization_id', profile.organization_id)
        .eq('name', appointmentData.service_type)
        .single()

      if (existingType) {
        appointmentTypeId = existingType.id
      } else {
        const { data: newType, error: typeError } = await supabase
          .from('appointment_types')
          .insert({
            organization_id: profile.organization_id,
            name: appointmentData.service_type,
            duration_minutes: 30, // Default duration
          })
          .select('id')
          .single()

        if (typeError) throw typeError
        appointmentTypeId = newType.id
      }

      // Create the appointment
      const scheduledAt = new Date(`${appointmentData.appointment_date}T${appointmentData.appointment_time}:00`)
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          organization_id: profile.organization_id,
          appointment_type_id: appointmentTypeId,
          customer_name: appointmentData.customer_name,
          customer_phone: appointmentData.customer_phone,
          customer_email: appointmentData.customer_email || null,
          scheduled_at: scheduledAt.toISOString(),
          duration_minutes: 30, // Default duration
          status: 'scheduled',
          notes: appointmentData.notes || null,
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

  const updateAppointment = async (appointmentId: string, appointmentData: AppointmentForm) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const scheduledAt = new Date(`${appointmentData.appointment_date}T${appointmentData.appointment_time}:00`)
      
      const { error } = await supabase
        .from('appointments')
        .update({
          customer_name: appointmentData.customer_name,
          customer_phone: appointmentData.customer_phone,
          customer_email: appointmentData.customer_email || null,
          scheduled_at: scheduledAt.toISOString(),
          notes: appointmentData.notes || null,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('organization_id', profile.organization_id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Appointment updated successfully",
      })
      await fetchAppointments()
    } catch (error) {
      console.error('Error updating appointment:', error)
      toast({
        title: "Error",
        description: "Failed to update appointment",
        variant: "destructive",
      })
      throw error
    }
  }

  const updateAppointmentStatus = async (appointmentId: string, status: Appointment['appointment_status']) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('organization_id', profile.organization_id)

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
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .update({
          reminder_sent_at: supabase.sql`array_append(reminder_sent_at, NOW())`,
          updated_at: new Date().toISOString(),
        })
        .eq('id', appointmentId)
        .eq('organization_id', profile.organization_id)

      if (error) {
        throw error
      }

      toast({
        title: "Success",
        description: "Reminder sent successfully",
      })
      await fetchAppointments()
    } catch (error) {
      console.error('Error sending reminder:', error)
      toast({
        title: "Error",
        description: "Failed to send reminder",
        variant: "destructive",
      })
    }
  }

  const deleteAppointment = async (appointmentId: string) => {
    if (!profile?.organization_id) {
      throw new Error('No organization found')
    }

    try {
      const { error } = await supabase
        .from('appointments')
        .delete()
        .eq('id', appointmentId)
        .eq('organization_id', profile.organization_id)

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
    updateAppointment,
    updateAppointmentStatus,
    sendReminder,
    deleteAppointment,
    fetchAppointments
  }
}