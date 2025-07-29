import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Phone, PhoneCall, PhoneIncoming, PhoneOutgoing } from "lucide-react";

const recentCalls = [
  {
    id: "1",
    caller: "Sarah Johnson",
    clinic: "Downtown Dental",
    type: "inbound",
    status: "completed",
    outcome: "Appointment Booked",
    time: "2 min ago",
    duration: "3:42"
  },
  {
    id: "2",
    caller: "Michael Chen",
    clinic: "Legal Associates",
    type: "inbound",
    status: "completed",
    outcome: "Information Provided",
    time: "5 min ago",
    duration: "2:18"
  },
  {
    id: "3",
    caller: "Emma Davis",
    clinic: "Wellness Clinic",
    type: "outbound",
    status: "completed",
    outcome: "Appointment Confirmed",
    time: "12 min ago",
    duration: "1:45"
  },
  {
    id: "4",
    caller: "Robert Smith",
    clinic: "Downtown Dental",
    type: "inbound",
    status: "transferred",
    outcome: "Escalated to Human",
    time: "18 min ago",
    duration: "4:22"
  },
  {
    id: "5",
    caller: "Lisa Wang",
    clinic: "Med Center Plus",
    type: "inbound",
    status: "completed",
    outcome: "Payment Collected",
    time: "25 min ago",
    duration: "6:15"
  }
];

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-primary text-primary-foreground";
    case "transferred":
      return "bg-secondary text-secondary-foreground";
    case "ongoing":
      return "bg-accent text-accent-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getCallIcon = (type: string) => {
  return type === "inbound" ? PhoneIncoming : PhoneOutgoing;
};

export const CallActivity = () => {
  return (
    <Card className="bg-gradient-card border-border shadow-card-custom">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-foreground">
          <Phone className="h-5 w-5 text-primary" />
          Recent Call Activity
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentCalls.map((call) => {
            const CallIcon = getCallIcon(call.type);
            return (
              <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                    <CallIcon className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <p className="font-medium text-foreground">{call.caller}</p>
                    <p className="text-sm text-muted-foreground">{call.clinic}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4 text-right">
                  <div>
                    <Badge className={getStatusColor(call.status)}>
                      {call.outcome}
                    </Badge>
                    <p className="text-xs text-muted-foreground mt-1">{call.duration}</p>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {call.time}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};