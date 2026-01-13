import { AdminLayout } from '@/components/admin/AdminLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Store, Bell, Shield, Palette, Loader2, Users, UserPlus, Trash2 } from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/auditLog';

interface StoreSettings {
  id: string;
  store_name: string;
  contact_email: string;
  contact_phone: string;
  shipping_charge: number;
  free_shipping_threshold: number;
  new_order_notifications: boolean;
  low_stock_alerts: boolean;
  customer_messages: boolean;
}

interface UserWithRole {
  user_id: string;
  email: string;
  name: string;
  role: 'admin' | 'customer';
}

export default function AdminSettings() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  
  // Form states
  const [storeName, setStoreName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [shippingCharge, setShippingCharge] = useState(99);
  const [freeShippingThreshold, setFreeShippingThreshold] = useState(2000);
  const [newOrderNotifications, setNewOrderNotifications] = useState(true);
  const [lowStockAlerts, setLowStockAlerts] = useState(true);
  const [customerMessages, setCustomerMessages] = useState(false);
  
  // Password states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  
  // Admin management states
  const [newAdminEmail, setNewAdminEmail] = useState('');
  const [isAddingAdmin, setIsAddingAdmin] = useState(false);
  
  // Dark mode state
  const [isDarkMode, setIsDarkMode] = useState(() => {
    return document.documentElement.classList.contains('dark');
  });

  // Fetch settings
  const { data: settings, isLoading } = useQuery({
    queryKey: ['store-settings'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('store_settings')
        .select('*')
        .limit(1)
        .single();

      if (error) throw error;
      return data as StoreSettings;
    },
  });

  // Fetch users with roles
  const { data: usersWithRoles, isLoading: isLoadingUsers } = useQuery({
    queryKey: ['users-with-roles'],
    queryFn: async () => {
      // Get all user roles
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('user_id, role');

      if (rolesError) throw rolesError;

      // Get all profiles
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('user_id, email, name');

      if (profilesError) throw profilesError;

      // Combine profiles with roles
      const usersMap = new Map<string, UserWithRole>();
      
      profiles.forEach(profile => {
        const userRole = roles.find(r => r.user_id === profile.user_id);
        usersMap.set(profile.user_id, {
          user_id: profile.user_id,
          email: profile.email || 'No email',
          name: profile.name || 'Unknown',
          role: (userRole?.role as 'admin' | 'customer') || 'customer',
        });
      });

      return Array.from(usersMap.values());
    },
  });

  // Update form when settings load
  useEffect(() => {
    if (settings) {
      setStoreName(settings.store_name);
      setContactEmail(settings.contact_email);
      setContactPhone(settings.contact_phone);
      setShippingCharge(settings.shipping_charge || 99);
      setFreeShippingThreshold(settings.free_shipping_threshold || 2000);
      setNewOrderNotifications(settings.new_order_notifications);
      setLowStockAlerts(settings.low_stock_alerts);
      setCustomerMessages(settings.customer_messages);
    }
  }, [settings]);

  // Save settings mutation
  const saveSettingsMutation = useMutation({
    mutationFn: async () => {
      if (!settings?.id) throw new Error('No settings found');
      
      const { error } = await supabase
        .from('store_settings')
        .update({
          store_name: storeName,
          contact_email: contactEmail,
          contact_phone: contactPhone,
          shipping_charge: shippingCharge,
          free_shipping_threshold: freeShippingThreshold,
          new_order_notifications: newOrderNotifications,
          low_stock_alerts: lowStockAlerts,
          customer_messages: customerMessages,
        })
        .eq('id', settings.id);

      if (error) throw error;
      
      // Log admin action
      await logAdminAction('settings_updated', {
        store_name: storeName,
        contact_email: contactEmail,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['store-settings'] });
      toast.success('Settings saved successfully');
    },
    onError: (error) => {
      logger.error('Error saving settings', error);
      toast.error('Failed to save settings');
    },
  });

  // Add admin role
  const handleAddAdmin = async () => {
    const emailTrim = newAdminEmail.trim();
    
    // Validate email format
    if (!emailTrim) {
      toast.error('Please enter an email address');
      return;
    }
    
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailTrim)) {
      toast.error('Please enter a valid email address');
      return;
    }

    setIsAddingAdmin(true);

    try {
      // Find the user by email in profiles
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('user_id, email')
        .eq('email', emailTrim)
        .single();

      if (profileError || !profile) {
        toast.error('User not found with that email');
        setIsAddingAdmin(false);
        return;
      }

      // Check if already admin
      const { data: existingRole } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', profile.user_id)
        .eq('role', 'admin')
        .single();

      if (existingRole) {
        toast.error('User is already an admin');
        setIsAddingAdmin(false);
        return;
      }

      // Update user role to admin
      const { error: updateError } = await supabase
        .from('user_roles')
        .update({ role: 'admin' })
        .eq('user_id', profile.user_id);

      if (updateError) throw updateError;
      
      // Log admin action
      await logAdminAction('user_promoted_admin', {
        promoted_user_id: profile.user_id,
        promoted_user_email: profile.email,
      });

      toast.success('Admin role assigned successfully');
      setNewAdminEmail('');
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    } catch (error) {
      logger.error('Error adding admin', error);
      toast.error('Failed to assign admin role');
    } finally {
      setIsAddingAdmin(false);
    }
  };

  // Remove admin role
  const handleRemoveAdmin = async (userId: string, userEmail?: string) => {
    if (userId === user?.id) {
      toast.error("You can't remove your own admin role");
      return;
    }

    try {
      const { error } = await supabase
        .from('user_roles')
        .update({ role: 'customer' })
        .eq('user_id', userId);

      if (error) throw error;
      
      // Log admin action
      await logAdminAction('user_demoted_admin', {
        demoted_user_id: userId,
        demoted_user_email: userEmail,
      });

      toast.success('Admin role removed');
      queryClient.invalidateQueries({ queryKey: ['users-with-roles'] });
    } catch (error) {
      logger.error('Error removing admin', error);
      toast.error('Failed to remove admin role');
    }
  };

  // Handle password change
  const handlePasswordChange = async () => {
    if (!currentPassword || !newPassword) {
      toast.error('Please fill in both password fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }

    setIsChangingPassword(true);

    try {
      // First verify current password by re-authenticating
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: user?.email || '',
        password: currentPassword,
      });

      if (signInError) {
        toast.error('Current password is incorrect');
        setIsChangingPassword(false);
        return;
      }

      // Update password
      const { error: updateError } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (updateError) throw updateError;

      toast.success('Password updated successfully');
      setCurrentPassword('');
      setNewPassword('');
    } catch (error) {
      logger.error('Error changing password', error);
      toast.error('Failed to update password');
    } finally {
      setIsChangingPassword(false);
    }
  };

  // Handle dark mode toggle
  const handleDarkModeToggle = (checked: boolean) => {
    setIsDarkMode(checked);
    if (checked) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  };

  const admins = usersWithRoles?.filter(u => u.role === 'admin') || [];

  if (isLoading) {
    return (
      <AdminLayout title="Settings">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Settings">
      <div className="space-y-6 max-w-3xl">
        {/* Store Settings */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Store className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Store Settings</CardTitle>
            </div>
            <CardDescription>
              Manage your store&apos;s basic information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="storeName">Store Name</Label>
              <Input
                id="storeName"
                value={storeName}
                onChange={(e) => setStoreName(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storeEmail">Contact Email</Label>
              <Input
                id="storeEmail"
                type="email"
                value={contactEmail}
                onChange={(e) => setContactEmail(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="storePhone">Contact Phone</Label>
              <Input
                id="storePhone"
                type="tel"
                value={contactPhone}
                onChange={(e) => setContactPhone(e.target.value)}
              />
            </div>
            
            <Separator className="my-6" />
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-3">Shipping Configuration</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Configure shipping charges for your store
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="shippingCharge">Standard Shipping Charge (₹)</Label>
                <Input
                  id="shippingCharge"
                  type="number"
                  min="0"
                  value={shippingCharge}
                  onChange={(e) => setShippingCharge(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Charge applied to orders below the free shipping threshold
                </p>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="freeShippingThreshold">Free Shipping Threshold (₹)</Label>
                <Input
                  id="freeShippingThreshold"
                  type="number"
                  min="0"
                  value={freeShippingThreshold}
                  onChange={(e) => setFreeShippingThreshold(parseInt(e.target.value) || 0)}
                />
                <p className="text-sm text-muted-foreground">
                  Orders above this amount qualify for free shipping
                </p>
              </div>
              
              <div className="bg-muted p-3 rounded-md">
                <p className="text-sm">
                  <strong>Example:</strong> With current settings, orders below ₹{freeShippingThreshold.toLocaleString()} will be charged ₹{shippingCharge}, and orders above will get free shipping.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Admin Management */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Admin Management</CardTitle>
            </div>
            <CardDescription>
              Manage admin access for your store
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Add New Admin</Label>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder="Enter user email"
                  value={newAdminEmail}
                  onChange={(e) => setNewAdminEmail(e.target.value)}
                />
                <Button
                  onClick={handleAddAdmin}
                  disabled={isAddingAdmin}
                >
                  {isAddingAdmin ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add
                    </>
                  )}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                The user must have an existing account to be assigned admin role.
              </p>
            </div>

            <Separator />

            <div className="space-y-2">
              <Label>Current Admins</Label>
              {isLoadingUsers ? (
                <div className="flex items-center justify-center py-4">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                </div>
              ) : admins.length === 0 ? (
                <p className="text-sm text-muted-foreground py-2">No admins found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead className="w-[100px]">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {admins.map((admin) => (
                      <TableRow key={admin.user_id}>
                        <TableCell className="font-medium">{admin.name}</TableCell>
                        <TableCell>{admin.email}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">Admin</Badge>
                        </TableCell>
                        <TableCell>
                          {admin.user_id !== user?.id && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleRemoveAdmin(admin.user_id, admin.email)}
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <CardDescription>
              Configure email notifications
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>New Order Notifications</Label>
                <p className="text-sm text-muted-foreground">
                  Receive email when a new order is placed
                </p>
              </div>
              <Switch
                checked={newOrderNotifications}
                onCheckedChange={setNewOrderNotifications}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Low Stock Alerts</Label>
                <p className="text-sm text-muted-foreground">
                  Get notified when products are running low
                </p>
              </div>
              <Switch
                checked={lowStockAlerts}
                onCheckedChange={setLowStockAlerts}
              />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div>
                <Label>Customer Messages</Label>
                <p className="text-sm text-muted-foreground">
                  Receive notifications for contact form submissions
                </p>
              </div>
              <Switch
                checked={customerMessages}
                onCheckedChange={setCustomerMessages}
              />
            </div>
          </CardContent>
        </Card>

        {/* Security */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Security</CardTitle>
            </div>
            <CardDescription>
              Manage security settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <Label>Change Password</Label>
              <div className="flex flex-col sm:flex-row gap-2">
                <Input
                  type="password"
                  placeholder="Current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                />
                <Input
                  type="password"
                  placeholder="New password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <Button
                  variant="outline"
                  onClick={handlePasswordChange}
                  disabled={isChangingPassword}
                >
                  {isChangingPassword ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    'Update'
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Appearance */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-muted-foreground" />
              <CardTitle className="text-lg">Appearance</CardTitle>
            </div>
            <CardDescription>
              Customize the look and feel
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label>Dark Mode</Label>
                <p className="text-sm text-muted-foreground">
                  Toggle dark mode for admin panel
                </p>
              </div>
              <Switch
                checked={isDarkMode}
                onCheckedChange={handleDarkModeToggle}
              />
            </div>
          </CardContent>
        </Card>

        <div className="flex justify-end">
          <Button
            onClick={() => saveSettingsMutation.mutate()}
            disabled={saveSettingsMutation.isPending}
          >
            {saveSettingsMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              'Save Changes'
            )}
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}
