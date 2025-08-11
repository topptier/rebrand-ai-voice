import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  Mail, 
  ArrowUpRight,
  CheckCircle,
  XCircle,
  AlertCircle,
  Bell,
  Plus,
  Edit,
  Trash2
} from "lucide-react";
import { useAppointments, Appointment } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";
import { format, formatDistanceToNow, isToday, isTomorrow } from 'date-fns';
import { AppointmentModal } from "./AppointmentModal";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";

const getStatusColor = (status: string) => {
  switch (status) {
    case "confirmed":
      return "bg-primary text-primary-foreground";
    case "scheduled":
      return "bg-accent text-accent-foreground";
    case "completed":
      return "bg-secondary text-secondary-foreground";
    case "cancelled":
      return "bg-destructive text-destructive-foreground";
    case "no_show":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusIcon = (status: string) => {
  switch (status) {
    case "confirmed":
      return CheckCircle;
    case "scheduled":
      return Clock;
    case "completed":
      return CheckCircle;
    case "cancelled":
      return XCircle;
    case "no_show":
      return AlertCircle;
    default:
      return Clock;
  }
};

const formatAppointmentDate = (dateStr: string) => {
  const date = new Date(dateStr);
  if (isToday(date)) return "Today";
  if (isTomorrow(date)) return "Tomorrow";
  return format(date, 'MMM d, yyyy');
};

export const AppointmentBooking = () => {
  const { appointments, stats, loading, createAppointment, updateAppointment, updateAppointmentStatus, sendReminder, deleteAppointment } = useAppointments();
  const { isOrgAdmin } = useAuth();
  
  const [showModal, setShowModal] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deletingAppointment, setDeletingAppointment] = useState<Appointment | null>(null);
  const [loading1, setLoading1] = useState(false);

  const handleCreateAppointment = () => {
    setEditingAppointment(null);
    setShowModal(true);
  };

  const handleEditAppointment = (appointment: Appointment) => {
    setEditingAppointment(appointment);
    setShowModal(true);
  };

  const handleDeleteAppointment = (appointment: Appointment) => {
    setDeletingAppointment(appointment);
    setShowDeleteDialog(true);
  };

  const confirmDelete = async () => {
    if (!deletingAppointment) return;
    
    setLoading1(true);
    try {
      await deleteAppointment(deletingAppointment.id);
      setShowDeleteDialog(false);
      setDeletingAppointment(null);
    } catch (error) {
      console.error('Failed to delete appointment:', error);
    } finally {
      setLoading1(false);
    }
  };

  const handleSubmitAppointment = async (data: any) => {
    setLoading1(true);
    try {
      if (editingAppointment) {
        await updateAppointment(editingAppointment.id, data);
      } else {
        await createAppointment(data);
      }
    } finally {
      setLoading1(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-20 bg-muted rounded"></div>
                  <div className="h-3 w-16 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const upcomingAppointments = appointments
    .filter(apt => ['scheduled', 'confirmed'].includes(apt.appointment_status))
    .slice(0, 5);

  return (
    <Card className="bg-gradient-card border-border shadow-card-custom">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Calendar className="h-5 w-5 text-primary" />
            Upcoming Appointments
          </CardTitle>
          <div className="flex items-center gap-2">
            {isOrgAdmin && (
              <Button onClick={handleCreateAppointment} size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Add Appointment
              </Button>
            )}
            <Button variant="ghost" size="sm">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View All
            </Button>
          </div>
        </div>
        
        {/* Quick Stats */}
        <div className="grid grid-cols-4 gap-4 mt-4">
          <div className="text-center">
            <p className="text-2xl font-bold text-primary">{stats.scheduled + stats.confirmed}</p>
            <p className="text-xs text-muted-foreground">Upcoming</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-secondary">{stats.completed}</p>
            <p className="text-xs text-muted-foreground">Completed</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-destructive">{stats.cancelled}</p>
            <p className="text-xs text-muted-foreground">Cancelled</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold text-muted-foreground">{stats.no_show}</p>
            <p className="text-xs text-muted-foreground">No Show</p>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="space-y-4">
          {upcomingAppointments.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No upcoming appointments</p>
            </div>
          ) : (
            upcomingAppointments.map((appointment) => {
              const StatusIcon = getStatusIcon(appointment.appointment_status);
              return (
                <div key={appointment.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10">
                      <StatusIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{appointment.customer_name}</p>
                      <p className="text-sm text-muted-foreground">{appointment.service_type}</p>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {formatAppointmentDate(appointment.appointment_date)}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">
                            {appointment.appointment_time}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 mt-1">
                        <div className="flex items-center gap-1">
                          <Phone className="h-3 w-3 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">{appointment.customer_phone}</span>
                        </div>
                        {appointment.customer_email && (
                          <div className="flex items-center gap-1">
                            <Mail className="h-3 w-3 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">{appointment.customer_email}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <div className="text-right">
                      <Badge className={getStatusColor(appointment.appointment_status)}>
                        {appointment.appointment_status}
                      </Badge>
                      <p className="text-xs text-muted-foreground mt-1">
                        {appointment.organization?.name || 'Unknown Org'}
                      </p>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      {!appointment.reminder_sent && appointment.appointment_status === 'scheduled' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => sendReminder(appointment.id)}
                        >
                          <Bell className="h-4 w-4" />
                        </Button>
                      )}
                      
                      {appointment.appointment_status === 'scheduled' && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'confirmed')}
                        >
                          Confirm
                        </Button>
                      )}
                      
                      {['scheduled', 'confirmed'].includes(appointment.appointment_status) && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => updateAppointmentStatus(appointment.id, 'completed')}
                        >
                          Complete
                        </Button>
                      )}

                      {isOrgAdmin && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditAppointment(appointment)}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteAppointment(appointment)}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>

      <AppointmentModal
        open={showModal}
        onOpenChange={setShowModal}
        appointment={editingAppointment}
        onSubmit={handleSubmitAppointment}
        loading={loading1}
      />

      <ConfirmDialog
        open={showDeleteDialog}
        onOpenChange={setShowDeleteDialog}
        title="Delete Appointment"
        description={`Are you sure you want to delete the appointment for ${deletingAppointment?.customer_name}? This action cannot be undone.`}
        confirmText="Delete"
        cancelText="Cancel"
        onConfirm={confirmDelete}
        loading={loading1}
        variant="destructive"
      />
    </Card>
  );
};