import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Calendar, DollarSign, Users, TrendingUp, Clock } from "lucide-react";
import { useCalls } from "@/hooks/useCalls";
import { useAppointments } from "@/hooks/useAppointments";
import { useAuth } from "@/contexts/AuthContext";

export const StatsCards = () => {
  const { calls, loading: callsLoading } = useCalls();
  const { stats: appointmentStats, loading: appointmentsLoading } = useAppointments();
  const { profile } = useAuth();

  const activeCalls = calls.filter(call => call.call_status === 'in_progress').length;
  const totalCalls = calls.length;
  const avgResponseTime = calls.length > 0 ? 
    (calls.reduce((acc, call) => acc + (call.duration_seconds || 0), 0) / calls.length / 60).toFixed(1) : 0;

  const stats = [
    {
      title: "Active Calls",
      value: callsLoading ? "..." : activeCalls.toString(),
      change: `${totalCalls} total calls`,
      icon: Phone,
      trend: "up"
    },
    {
      title: "Appointments Today",
      value: appointmentsLoading ? "..." : appointmentStats.confirmed.toString(),
      change: `${appointmentStats.total} total`,
      icon: Calendar,
      trend: "up"
    },
    {
      title: "Completion Rate",
      value: callsLoading ? "..." : `${Math.round((calls.filter(c => c.call_status === 'completed').length / Math.max(totalCalls, 1)) * 100)}%`,
      change: "Call success rate",
      icon: TrendingUp,
      trend: "up"
    },
    {
      title: "Organization",
      value: profile?.role === 'super_admin' ? "All Clients" : "Single Tenant",
      change: profile?.role || "Loading...",
      icon: Users,
      trend: "up"
    },
    {
      title: "Avg Call Duration",
      value: callsLoading ? "..." : `${avgResponseTime}m`,
      change: "Per call average",
      icon: Clock,
      trend: "up"
    },
    {
      title: "Scheduled Appointments",
      value: appointmentsLoading ? "..." : appointmentStats.scheduled.toString(),
      change: `${appointmentStats.cancelled} cancelled`,
      icon: Calendar,
      trend: "up"
    }
  ];

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index} className="bg-gradient-card border-border shadow-card-custom hover:shadow-enterprise transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <Icon className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-foreground">{stat.value}</div>
              <p className="text-xs text-primary">
                {stat.change}
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};