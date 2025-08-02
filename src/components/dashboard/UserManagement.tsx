import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Users, Plus, Settings, Eye, Shield } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: 'super_admin' | 'org_admin' | 'agent' | 'client';
  is_active: boolean;
  organization_id: string;
  created_at: string;
}

const getRoleColor = (role: string) => {
  switch (role) {
    case "super_admin":
      return "bg-destructive text-destructive-foreground";
    case "org_admin":
      return "bg-primary text-primary-foreground";
    case "agent":
      return "bg-accent text-accent-foreground";
    case "client":
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

export const UserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { profile } = useAuth();

  useEffect(() => {
    if (profile) {
      fetchUsers();
    }
  }, [profile]);

  const fetchUsers = async () => {
    try {
      let query = supabase
        .from('user_profiles')
        .select(`
          id,
          email,
          full_name,
          role,
          is_active,
          organization_id,
          created_at
        `)
        .order('created_at', { ascending: false });

      // Filter based on user role
      if (profile?.role === 'org_admin') {
        // Org admins can only see users in their organization
        query = query.eq('organization_id', profile.organization_id);
      } else if (profile?.role === 'agent' || profile?.role === 'client') {
        // Agents and clients can only see themselves
        query = query.eq('id', profile.id);
      }
      // Super admins can see all users (no filter)

      const { data, error } = await query;
      if (error) throw error;
      
      setUsers(data || []);
    } catch (error) {
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleUserStatus = async (userId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('user_profiles')
        .update({ is_active: !currentStatus, updated_at: new Date().toISOString() })
        .eq('id', userId);

      if (error) throw error;
      
      // Refresh users list
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
    }
  };

  if (!profile || (profile.role !== 'super_admin' && profile.role !== 'org_admin')) {
    return (
      <Card className="bg-gradient-card border-border shadow-card-custom">
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Insufficient permissions to view user management</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (loading) {
    return (
      <Card className="bg-gradient-card border-border shadow-card-custom">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-foreground">
            <Users className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50">
                <div className="flex items-center space-x-4">
                  <div className="w-10 h-10 rounded-full bg-muted"></div>
                  <div className="space-y-2">
                    <div className="h-4 w-32 bg-muted rounded"></div>
                    <div className="h-3 w-24 bg-muted rounded"></div>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
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
            <Users className="h-5 w-5 text-primary" />
            User Management
          </CardTitle>
          {profile.role === 'super_admin' && (
            <Button variant="enterprise" size="sm">
              <Plus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {users.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No users found</p>
            </div>
          ) : (
            users.map((user) => (
              <div key={user.id} className="flex items-center justify-between p-4 rounded-lg bg-background/50 border border-border/50 hover:border-primary/50 transition-all duration-300">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-gradient-primary text-primary-foreground font-bold text-sm">
                    {user.full_name.split(' ').map(n => n[0]).join('').toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.full_name}</h3>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-6">
                  <div className="text-center">
                    <p className="text-sm font-medium text-foreground">
                      {new Date(user.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Joined</p>
                  </div>
                  <div className="space-y-1">
                    <Badge className={getRoleColor(user.role)}>
                      {user.role.replace('_', ' ')}
                    </Badge>
                    <Badge className={getStatusColor(user.is_active)}>
                      {user.is_active ? 'active' : 'inactive'}
                    </Badge>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                    {(profile.role === 'super_admin' || profile.role === 'org_admin') && (
                      <>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => toggleUserStatus(user.id, user.is_active)}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                      </>
                    )}
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