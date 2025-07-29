import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Phone, Calendar, DollarSign, Users, TrendingUp, Clock } from "lucide-react";

const stats = [
  {
    title: "Active Calls",
    value: "24",
    change: "+12% from yesterday",
    icon: Phone,
    trend: "up"
  },
  {
    title: "Appointments Booked",
    value: "156",
    change: "+23% from last week",
    icon: Calendar,
    trend: "up"
  },
  {
    title: "Revenue Collected",
    value: "$12,847",
    change: "+8% from last month",
    icon: DollarSign,
    trend: "up"
  },
  {
    title: "AI Accuracy",
    value: "94.2%",
    change: "+2.1% improvement",
    icon: TrendingUp,
    trend: "up"
  },
  {
    title: "Active Clients",
    value: "48",
    change: "+5 new this month",
    icon: Users,
    trend: "up"
  },
  {
    title: "Avg Response Time",
    value: "0.8s",
    change: "-0.2s improvement",
    icon: Clock,
    trend: "up"
  }
];

export const StatsCards = () => {
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