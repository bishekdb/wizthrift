import { AdminLayout } from '@/components/admin/AdminLayout';
import { Package, ShoppingCart, DollarSign, TrendingUp, Loader2 } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { format, startOfDay, startOfMonth } from 'date-fns';

const AdminDashboard = () => {
  // Fetch products count
  const { data: productsCount = 0 } = useQuery({
    queryKey: ['admin-products-count'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('products')
        .select('*', { count: 'exact', head: true });
      if (error) throw error;
      return count || 0;
    },
  });

  // Fetch orders with stats
  const { data: ordersData, isLoading: ordersLoading } = useQuery({
    queryKey: ['admin-orders-stats'],
    queryFn: async () => {
      const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      const now = new Date();
      const todayStart = startOfDay(now).toISOString();
      const monthStart = startOfMonth(now).toISOString();
      
      const activeOrders = orders?.filter(o => 
        ['pending', 'confirmed', 'processing', 'shipped'].includes(o.status)
      ).length || 0;
      
      const todayRevenue = orders?.filter(o => 
        o.created_at >= todayStart && o.payment_status === 'paid'
      ).reduce((sum, o) => sum + o.total, 0) || 0;
      
      const monthRevenue = orders?.filter(o => 
        o.created_at >= monthStart && o.payment_status === 'paid'
      ).reduce((sum, o) => sum + o.total, 0) || 0;
      
      const recentOrders = orders?.slice(0, 10) || [];
      
      return {
        activeOrders,
        todayRevenue,
        monthRevenue,
        recentOrders,
      };
    },
  });

  const stats = [
    { label: 'Total Products', value: productsCount.toString(), icon: Package },
    { label: 'Active Orders', value: ordersData?.activeOrders.toString() || '0', icon: ShoppingCart },
    { label: 'Revenue (Today)', value: `₹${(ordersData?.todayRevenue || 0).toLocaleString()}`, icon: DollarSign },
    { label: 'Revenue (Month)', value: `₹${(ordersData?.monthRevenue || 0).toLocaleString()}`, icon: TrendingUp },
  ];

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'confirmed':
      case 'delivered':
        return 'bg-foreground text-background';
      case 'shipped':
      case 'processing':
        return 'bg-secondary text-foreground';
      case 'cancelled':
        return 'bg-destructive text-destructive-foreground';
      default:
        return 'bg-secondary text-muted-foreground';
    }
  };

  return (
    <AdminLayout title="Dashboard">
      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-background border border-border p-6">
            <div className="flex items-center gap-3 mb-2">
              <stat.icon className="w-4 h-4 text-muted-foreground" />
              <span className="text-micro uppercase tracking-wider text-muted-foreground">
                {stat.label}
              </span>
            </div>
            <p className="text-title">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="bg-background border border-border">
        <div className="p-4 border-b border-border">
          <h2 className="text-small font-medium">Recent Orders</h2>
        </div>
        {ordersLoading ? (
          <div className="flex items-center justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : ordersData?.recentOrders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Order ID
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Customer
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Date
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Amount
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody>
                {ordersData?.recentOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-small font-mono">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4 text-small">{order.shipping_name}</td>
                    <td className="p-4 text-small text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="p-4 text-small">₹{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2 py-1 text-micro uppercase tracking-wider ${getStatusStyle(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;
