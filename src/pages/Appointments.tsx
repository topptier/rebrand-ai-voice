import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  Plus,
  CheckCircle,
  XCircle,
  AlertCircle,
} from "lucide-react"
import { useAppointments } from "@/hooks/useAppointments"
import { AppointmentModal } from "@/components/AppointmentModal"
import { format, isToday, isTomorrow } from 'date-fns'

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-primary text-primary-foreground"
    case "scheduled":
      return "bg-accent text-accent-foreground"
    case "completed":
      return "bg-secondary text-secondary-foreground"
    case "cancelled":
      return "bg-destructive text-destructive-foreground"
    case "no_show":
      return "bg-muted text-muted-foreground"
    default:
      return "bg-muted text-muted-foreground"
  }
}

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return CheckCircle
    case "scheduled":
      return Clock
    case "completed":
      return CheckCircle
    case "cancelled":
      return XCircle
    case "no_show":
      return AlertCircle
    default:
      return Clock
  }
}

const formatAppointmentDate = (dateStr: string) => {
  const date = new Date(dateStr)
  if (isToday(date)) return "Today"
  if (isTomorrow(date)) return "Tomorrow"
  return format(date, 'MMM d, yyyy')
}

const Appointments = () => {
  const { appointments, stats, loading, updateAppointmentStatus, deleteAppointment, fetchAppointments } = useAppointments()

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Appointments</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-6">
                <div className="h-8 w-20 bg-muted rounded mb-2"></div>
                <div className="h-4 w-16 bg-muted rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <Card>
          <CardContent className="p-6">
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted"></div>
                    <div className="space-y-2">
                      <div className="h-4 w-32 bg-muted rounded"></div>
                      <div className="h-3 w-24 bg-muted rounded"></div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="h-6 w-20 bg-muted rounded"></div>
                    <div className="h-8 w-24 bg-muted rounded"></div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Appointments</h1>
        <AppointmentModal
          trigger={
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Book Appointment
            </Button>
          }
          onSuccess={fetchAppointments}
        />
      </div>
      
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <Calendar className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-accent/10">
                <Clock className="h-4 w-4 text-accent-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.scheduled}</p>
                <p className="text-xs text-muted-foreground">Scheduled</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-primary/10">
                <CheckCircle className="h-4 w-4 text-primary" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.confirmed}</p>
                <p className="text-xs text-muted-foreground">Confirmed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-secondary/10">
                <CheckCircle className="h-4 w-4 text-secondary-foreground" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center">
              <div className="p-2 rounded-full bg-destructive/10">
                <XCircle className="h-4 w-4 text-destructive" />
              </div>
              <div className="ml-4">
                <p className="text-2xl font-bold">{stats.cancelled}</p>
                <p className="text-xs text-muted-foreground">Cancelled</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            All Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {appointments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p className="text-lg font-medium mb-2">No appointments found</p>
                <p className="text-sm">Create your first appointment to get started</p>
                <AppointmentModal
                  trigger={
                    <Button className="mt-4">
                      <Plus className="h-4 w-4 mr-2" />
                      Book Your First Appointment
                    </Button>
                  }
                  onSuccess={fetchAppointments}
                />
              </div>
            ) : (
              appointments.map((appointment) => {
                const StatusIcon = getStatusIcon(appointment.status)
                const appointmentDate = new Date(appointment.scheduled_at)
                return (
                  <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
                        <StatusIcon className="h-6 w-6 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium text-foreground text-lg">{appointment.customer_name}</p>
                        <p className="text-sm text-muted-foreground">{appointment.duration_minutes} minutes</p>
                        <div className="flex items-center gap-6 mt-2">
                          <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {formatAppointmentDate(appointment.scheduled_at)}
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">
                              {format(appointmentDate, 'h:mm a')}
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-6 mt-1">
                          <div className="flex items-center gap-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm text-muted-foreground">{appointment.customer_phone}</span>
                          </div>
                          {appointment.customer_email && (
                            <div className="flex items-center gap-2">
                              <Mail className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm text-muted-foreground">{appointment.customer_email}</span>
                            </div>
                          )}
                        </div>
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground mt-2 italic">"{appointment.notes}"</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <Badge className={getStatusColor(appointment.status)}>
                        {appointment.status}
                      </Badge>
                      
                      <div className="flex flex-col gap-2">
                        {appointment.status === 'scheduled' && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                          >
                            Confirm
                          </Button>
                        )}
                        
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                          >
                            Complete
                          </Button>
                        )}
                        
                        {['scheduled', 'confirmed'].includes(appointment.status) && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateAppointmentStatus(appointment.id, 'cancelled')}
                          >
                            Cancel
                          </Button>
                        )}
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => deleteAppointment(appointment.id)}
                          className="text-destructive hover:text-destructive"
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Appointments