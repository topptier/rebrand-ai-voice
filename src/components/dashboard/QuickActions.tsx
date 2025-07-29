import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Phone, 
  Calendar, 
  CreditCard, 
  Settings, 
  BarChart3, 
  Users, 
  Palette,
  Shield
} from "lucide-react";

const actions = [
  {
    title: "Test Call Flow",
    description: "Simulate AI receptionist call",
    icon: Phone,
    variant: "enterprise" as const,
    color: "text-primary"
  },
  {
    title: "Schedule Demo",
    description: "Book client demonstration",
    icon: Calendar,
    variant: "hero" as const,
    color: "text-primary"
  },
  {
    title: "Payment Setup",
    description: "Configure Stripe integration",
    icon: CreditCard,
    variant: "hero" as const,
    color: "text-primary"
  },
  {
    title: "White-Label Config",
    description: "Customize client branding",
    icon: Palette,
    variant: "hero" as const,
    color: "text-primary"
  },
  {
    title: "Analytics Dashboard",
    description: "View performance metrics",
    icon: BarChart3,
    variant: "hero" as const,
    color: "text-primary"
  },
  {
    title: "User Management",
    description: "Manage team access",
    icon: Users,
    variant: "hero" as const,
    color: "text-primary"
  },
  {
    title: "Compliance Settings",
    description: "HIPAA/GDPR configuration",
    icon: Shield,
    variant: "hero" as const,
    color: "text-primary"
  },
  {
    title: "System Settings",
    description: "Configure platform settings",
    icon: Settings,
    variant: "hero" as const,
    color: "text-primary"
  }
];

export const QuickActions = () => {
  return (
    <Card className="bg-gradient-card border-border shadow-card-custom">
      <CardHeader>
        <CardTitle className="text-foreground">Quick Actions</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {actions.map((action, index) => {
            const Icon = action.icon;
            return (
              <Button
                key={index}
                variant={action.variant}
                className="h-auto p-4 flex flex-col items-center space-y-2"
              >
                <Icon className={`h-6 w-6 ${action.color}`} />
                <div className="text-center">
                  <p className="text-sm font-medium">{action.title}</p>
                  <p className="text-xs opacity-70">{action.description}</p>
                </div>
              </Button>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
};