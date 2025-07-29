import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Settings, Plus, Eye } from "lucide-react";

const clients = [
  {
    id: "1",
    name: "Downtown Dental",
    type: "Dental Clinic",
    plan: "Enterprise",
    calls: 1247,
    revenue: "$3,245",
    status: "active",
    logo: "DD"
  },
  {
    id: "2",
    name: "Legal Associates",
    type: "Law Firm", 
    plan: "Pro",
    calls: 856,
    revenue: "$2,180",
    status: "active",
    logo: "LA"
  },
  {
    id: "3",
    name: "Wellness Clinic",
    type: "Medical",
    plan: "Starter",
    calls: 432,
    revenue: "$1,098",
    status: "active",
    logo: "WC"
  },
  {
    id: "4",
    name: "Med Center Plus",
    type: "Medical",
    plan: "Pro",
    calls: 698,
    revenue: "$1,756",
    status: "trial",
    logo: "MC"
  }
];

const getPlanColor = (plan: string) => {
  switch (plan) {
    case "Enterprise":
      return "bg-primary text-primary-foreground";
    case "Pro":
      return "bg-accent text-accent-foreground";
    case "Starter":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "active":
      return "bg-primary text-primary-foreground";
    case "trial":
      return "bg-accent text-accent-foreground";
    case "inactive":
      return "bg-muted text-muted-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

export const ClientManagement = () => {
  return (
    <Card className="bg-gradient-card border-border shadow-card-custom">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Client Management
          </CardTitle>
          <Button variant="enterprise" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Add Client
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {clients.map((client) => (
            <div key={client.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
              <div className="flex items-center space-x-4">
                <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-primary-foreground font-bold">
                  {client.logo}
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{client.name}</h3>
                  <p className="text-sm text-muted-foreground">{client.type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-6">
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{client.calls}</p>
                  <p className="text-xs text-muted-foreground">Calls</p>
                </div>
                <div className="text-center">
                  <p className="text-sm font-medium text-foreground">{client.revenue}</p>
                  <p className="text-xs text-muted-foreground">Revenue</p>
                </div>
                <div className="space-y-1">
                  <Badge className={getPlanColor(client.plan)}>
                    {client.plan}
                  </Badge>
                  <Badge className={getStatusColor(client.status)}>
                    {client.status}
                  </Badge>
                </div>
                <div className="flex space-x-2">
                  <Button variant="ghost" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};