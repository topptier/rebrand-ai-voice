import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Building2, Users, Settings, Plus, Eye } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface Client {
  id: string;
  name: string;
  business_type: string;
  subscription_tier: string;
  is_active: boolean;
  total_calls?: number;
  created_at: string;
}

const getPlanColor = (plan: string) => {
  switch (plan) {
    case "enterprise":
      return "bg-primary text-primary-foreground";
    case "professional":
      return "bg-accent text-accent-foreground";
    case "basic":
      return "bg-secondary text-secondary-foreground";
    default:
      return "bg-muted text-muted-foreground";
  }
};

const getStatusColor = (isActive: boolean) => {
  return isActive 
    ? "bg-primary text-primary-foreground"
    : "bg-muted text-muted-foreground";
};

export const ClientManagement = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    fetchClients();
  }, [profile]);

  const fetchClients = async () => {
    try {
      let query = supabase
        .from('clients')
        .select(`
          id,
          name,
          business_type,
          subscription_tier,
          is_active,
          created_at
        `)
        .order('created_at', { ascending: false });

      // If not super admin, only show own organization's data
      if (profile?.role !== 'super_admin') {
        query = query.eq('id', profile?.organization_id);
      }

      const { data, error } = await query;
      if (error) throw error;
      
      setClients(data || []);
    } catch (error) {
      console.error('Error fetching clients:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Building2 className="h-5 w-5 text-primary" />
            Client Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 rounded-lg bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-5 w-32 bg-muted rounded"></div>
                    <div className="h-4 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-6">
                  <div className="h-6 w-16 bg-muted rounded"></div>
                  <div className="h-6 w-20 bg-muted rounded"></div>
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
          {clients.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Building2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No clients found</p>
            </div>
          ) : (
            clients.map((client) => (
              <div key={client.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-12 h-12 rounded-lg bg-gradient-primary text-primary-foreground font-bold">
                    {client.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{client.name}</h3>
                    <p className="text-sm text-muted-foreground">{client.business_type}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">{client.total_calls || 0}</p>
                    <p className="text-xs text-muted-foreground">Calls</p>
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(client.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Created</p>
                  </div>
                  <div className="space-y-1">
                    <Badge className={getPlanColor(client.subscription_tier)}>
                      {client.subscription_tier}
                    </Badge>
                    <Badge className={getStatusColor(client.is_active)}>
                      {client.is_active ? 'active' : 'inactive'}
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
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
};