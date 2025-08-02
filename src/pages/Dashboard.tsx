import { useState } from "react";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { StatsCards } from "@/components/dashboard/StatsCards";
import { CallActivity } from "@/components/dashboard/CallActivity";
import { ClientManagement } from "@/components/dashboard/ClientManagement";
import { QuickActions } from "@/components/dashboard/QuickActions";
import { AppointmentBooking } from "@/components/dashboard/AppointmentBooking";
import { Analytics } from "@/components/dashboard/Analytics";
import { UserManagement } from "@/components/dashboard/UserManagement";
import { Button } from "@/components/ui/button";
import { BarChart3, Users, Building2, Home } from "lucide-react";

type DashboardView = 'overview' | 'analytics' | 'users' | 'clients';

const Dashboard = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('overview');

  const renderView = () => {
    switch (currentView) {
      case 'analytics':
        return <Analytics />;
      case 'users':
        return <UserManagement />;
      case 'clients':
        return <ClientManagement />;
      default:
        return (
          <div className="space-y-8">
            {/* Stats Overview */}
            <StatsCards />
            
            {/* Quick Actions */}
            <QuickActions />
            
            {/* Main Content Grid */}
            <div className="grid gap-8 lg:grid-cols-2">
              <CallActivity />
              <AppointmentBooking />
            </div>
            
            {/* Client Management */}
            <ClientManagement />
          </div>
        );
    }
  };

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

        {/* Navigation Tabs */}
        <div className="flex space-x-2 mb-8">
          <Button
            variant={currentView === 'overview' ? 'enterprise' : 'hero'}
            onClick={() => setCurrentView('overview')}
            className="flex items-center gap-2"
          >
            <Home className="h-4 w-4" />
            Overview
          </Button>
          <Button
            variant={currentView === 'analytics' ? 'enterprise' : 'hero'}
            onClick={() => setCurrentView('analytics')}
            className="flex items-center gap-2"
          >
            <BarChart3 className="h-4 w-4" />
            Analytics
          </Button>
          <Button
            variant={currentView === 'users' ? 'enterprise' : 'hero'}
            onClick={() => setCurrentView('users')}
            className="flex items-center gap-2"
          >
            <Users className="h-4 w-4" />
            Users
          </Button>
          <Button
            variant={currentView === 'clients' ? 'enterprise' : 'hero'}
            onClick={() => setCurrentView('clients')}
            className="flex items-center gap-2"
          >
            <Building2 className="h-4 w-4" />
            Clients
          </Button>
        </div>

        {renderView()}
      </main>
    </div>
  );
};

export default Dashboard;