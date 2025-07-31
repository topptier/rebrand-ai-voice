import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Phone, PhoneIncoming, PhoneOutgoing, Clock, User, ArrowUpRight } from "lucide-react";
import { useCalls } from "@/hooks/useCalls";
import { formatDistanceToNow } from 'date-fns';

const getStatusColor = (status: string) => {
  switch (status) {
    case "completed":
      return "bg-primary text-primary-foreground";
    case "transferred":
      return "bg-secondary text-secondary-foreground";
    case "in_progress":
      return "bg-accent text-accent-foreground";
    case "failed":
      return "bg-destructive text-destructive-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getCallIcon = (type: string) => {
  return type === "inbound" ? PhoneIncoming : PhoneOutgoing;
};

const formatDuration = (seconds: number | null) => {
  if (!seconds) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
};

export const CallActivity = () => {
  const { calls, loading, updateCallStatus, transferCall } = useCalls();

  if (loading) {
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
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-24 bg-muted rounded"></div>
                    <div className="h-3 w-20 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  <div className="h-6 w-16 bg-muted rounded"></div>
                  <div className="h-3 w-12 bg-muted rounded"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-gradient-card border-border shadow-card-custom">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Phone className="h-5 w-5 text-primary" />
            Recent Call Activity
          </CardTitle>
          <Button variant="ghost" size="sm">
            <ArrowUpRight className="h-4 w-4 mr-2" />
            View All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {calls.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Phone className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No recent calls</p>
            </div>
          ) : (
            calls.slice(0, 5).map((call) => {
              const CallIcon = getCallIcon(call.call_type);
              return (
                <div key={call.id} className="flex items-center justify-between p-3 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <CallIcon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-foreground">{call.caller_name}</p>
                      <p className="text-sm text-muted-foreground">
                        {call.client?.name || 'Unknown Client'}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <User className="h-3 w-3 text-muted-foreground" />
                        <span className="text-xs text-muted-foreground">{call.caller_phone}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4 text-right">
                    <div>
                      <Badge className={getStatusColor(call.call_status)}>
                        {call.call_outcome || call.call_status}
                      </Badge>
                      <div className="flex items-center gap-1 mt-1">
                        <Clock className="h-3 w-3 text-muted-foreground" />
                        <p className="text-xs text-muted-foreground">
                          {formatDuration(call.duration_seconds)}
                        </p>
                      </div>
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDistanceToNow(new Date(call.created_at), { addSuffix: true })}
                    </div>
                    {call.call_status === 'in_progress' && (
                      <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => transferCall(call.id, 'Manual transfer from dashboard')}
                      >
                        Transfer
                      </Button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </CardContent>
    </Card>
  );
};