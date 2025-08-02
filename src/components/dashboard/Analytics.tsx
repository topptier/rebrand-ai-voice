import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, TrendingUp, Phone, Calendar, Users, Clock } from "lucide-react";
import { useCalls } from "@/hooks/useCalls";
import { useAppointments } from "@/hooks/useAppointments";

export const Analytics = () => {
  const { calls } = useCalls();
  const { appointments } = useAppointments();

  // Calculate analytics data
  const totalCalls = calls.length;
  const completedCalls = calls.filter(call => call.call_status === 'completed').length;
  const avgDuration = calls.length > 0 ? 
    calls.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) / calls.length : 0;
  
  const successRate = totalCalls > 0 ? Math.round((completedCalls / totalCalls) * 100) : 0;
  
  // Call type distribution
  const inboundCalls = calls.filter(call => call.call_type === 'inbound').length;
  const outboundCalls = calls.filter(call => call.call_type === 'outbound').length;

  // Appointment status distribution
  const confirmedAppointments = appointments.filter(apt => apt.appointment_status === 'confirmed').length;
  const scheduledAppointments = appointments.filter(apt => apt.appointment_status === 'scheduled').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-6">
        <BarChart3 className="h-6 w-6 text-primary" />
        <h2 className="text-2xl font-bold text-foreground">Analytics Dashboard</h2>
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-gradient-card border-border shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Success Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{successRate}%</div>
            <p className="text-xs text-primary">
              {completedCalls} of {totalCalls} calls completed
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Avg Call Duration</CardTitle>
            <Clock className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">
              {Math.round(avgDuration / 60)}m {Math.round(avgDuration % 60)}s
            </div>
            <p className="text-xs text-primary">Per call average</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Call Distribution</CardTitle>
            <Phone className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{inboundCalls}:{outboundCalls}</div>
            <p className="text-xs text-primary">Inbound:Outbound ratio</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-card border-border shadow-card-custom">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-foreground">{confirmedAppointments}</div>
            <p className="text-xs text-primary">{scheduledAppointments} scheduled</p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity Chart */}
      <Card className="bg-gradient-card border-border shadow-card-custom">
        <CardHeader>
          <CardTitle className="text-foreground">Call Activity Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Completed Calls</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full" 
                    style={{ width: `${successRate}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{successRate}%</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Inbound Calls</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-accent h-2 rounded-full" 
                    style={{ width: `${totalCalls > 0 ? (inboundCalls / totalCalls) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{inboundCalls}</span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-foreground">Confirmed Appointments</span>
              <div className="flex items-center gap-2">
                <div className="w-32 bg-muted rounded-full h-2">
                  <div 
                    className="bg-secondary h-2 rounded-full" 
                    style={{ width: `${appointments.length > 0 ? (confirmedAppointments / appointments.length) * 100 : 0}%` }}
                  ></div>
                </div>
                <span className="text-sm text-muted-foreground">{confirmedAppointments}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};