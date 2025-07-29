import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CallActivity } from "@/components/dashboard/CallActivity";
import { ClientManagement } from "@/components/dashboard/ClientManagement";
import { QuickActions } from "@/components/dashboard/QuickActions";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      <DashboardHeader />
      
      <main className="container mx-auto px-6 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            ReceptAI Core Dashboard
          </h1>
          <p className="text-muted-foreground">
            Enterprise AI Receptionist Platform - Monitor calls, manage clients, and track performance
          </p>
        </div>

        <div className="space-y-8">
          {/* Stats Overview */}
          <StatsCards />
          
          {/* Quick Actions */}
          <QuickActions />
          
          {/* Main Content Grid */}
          <div className="grid gap-8 md:grid-cols-2">
            <CallActivity />
            <ClientManagement />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Index;
