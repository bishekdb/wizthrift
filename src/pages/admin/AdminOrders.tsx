import { AdminLayout } from '@/components/admin/AdminLayout';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logger';
import { logAdminAction } from '@/lib/auditLog';
import { format } from 'date-fns';
import { Loader2 } from 'lucide-react';

const statusOptions = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'];

const AdminOrders = () => {
  const queryClient = useQueryClient();

  const { data: orders = [], isLoading } = useQuery({
    queryKey: ['admin-orders'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*, order_items(count)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, newStatus, oldStatus }: { orderId: string; newStatus: string; oldStatus?: string }) => {
      const { error } = await supabase
        .from('orders')
        .update({ status: newStatus })
        .eq('id', orderId);

      if (error) throw error;
      
      // Log admin action
      await logAdminAction('order_status_changed', {
        order_id: orderId,
        old_status: oldStatus,
        new_status: newStatus,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-orders'] });
      toast.success('Order status updated');
    },
    onError: (error) => {
      logger.error('Error updating order status', error);
      toast.error('Failed to update order status');
    },
  });

  const updateStatus = (orderId: string, newStatus: string, oldStatus?: string) => {
    updateStatusMutation.mutate({ orderId, newStatus, oldStatus });
  };

  if (isLoading) {
    return (
      <AdminLayout title="Orders">
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Orders">
      <div className="bg-background border border-border overflow-hidden">
        {orders.length === 0 ? (
          <div className="p-8 text-center text-muted-foreground">
            No orders yet
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Order
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Customer
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Items
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Amount
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Payment
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Status
                  </th>
                  <th className="text-left text-micro uppercase tracking-wider text-muted-foreground p-4">
                    Date
                  </th>
                </tr>
              </thead>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0">
                    <td className="p-4 text-small font-mono">{order.id.slice(0, 8).toUpperCase()}</td>
                    <td className="p-4">
                      <div>
                        <p className="text-small">{order.shipping_name}</p>
                        <p className="text-micro text-muted-foreground">{order.customer_email}</p>
                      </div>
                    </td>
                    <td className="p-4 text-small">
                      {order.order_items?.[0]?.count || 0}
                    </td>
                    <td className="p-4 text-small">₹{order.total.toLocaleString()}</td>
                    <td className="p-4">
                      <span
                        className={`inline-block px-2 py-1 text-micro uppercase tracking-wider ${
                          order.payment_status === 'paid'
                            ? 'bg-foreground text-background'
                            : 'bg-secondary text-muted-foreground'
                        }`}
                      >
                        {order.payment_status}
                      </span>
                    </td>
                    <td className="p-4">
                      <select
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value, order.status)}
                        disabled={updateStatusMutation.isPending}
                        className="text-micro uppercase tracking-wider bg-secondary border-none p-2 focus:outline-none focus:ring-1 focus:ring-foreground disabled:opacity-50"
                      >
                        {statusOptions.map((status) => (
                          <option key={status} value={status}>
                            {status}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="p-4 text-small text-muted-foreground">
                      {format(new Date(order.created_at), 'MMM d, yyyy')}
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

export default AdminOrders;
