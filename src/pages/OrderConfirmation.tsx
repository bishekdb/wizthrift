import { Link, useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Check, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

const OrderConfirmation = () => {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: async () => {
      if (!orderId) return null;
      
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('id', orderId)
        .single();

      if (error) throw error;
      return data;
    },
    enabled: !!orderId,
  });

  if (isLoading) {
    return (
      <Layout>
        <div className="container-narrow py-16 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
        </div>
      </Layout>
    );
  }

  const shortOrderId = orderId ? orderId.slice(0, 8).toUpperCase() : 'N/A';

  return (
    <Layout>
      <div className="container-narrow py-16 md:py-24 text-center">
        <div className="w-12 h-12 border-2 border-foreground flex items-center justify-center mx-auto mb-6">
          <Check className="w-6 h-6" />
        </div>
        <h1 className="text-title mb-2">Order Confirmed</h1>
        <p className="text-small text-muted-foreground mb-8">
          Thank you for your order. We'll send you a confirmation email shortly.
        </p>

        <div className="bg-secondary p-6 mb-8 text-left max-w-md mx-auto">
          <div className="flex justify-between mb-4">
            <span className="text-small text-muted-foreground">Order ID</span>
            <span className="text-small font-mono">{shortOrderId}</span>
          </div>
          <div className="flex justify-between mb-4">
            <span className="text-small text-muted-foreground">Status</span>
            <span className="text-small capitalize">{order?.status || 'Processing'}</span>
          </div>
          {order && (
            <>
              <div className="flex justify-between mb-4">
                <span className="text-small text-muted-foreground">Items</span>
                <span className="text-small">{order.order_items?.length || 0}</span>
              </div>
              <div className="flex justify-between mb-4">
                <span className="text-small text-muted-foreground">Total</span>
                <span className="text-small font-medium">₹{order.total?.toLocaleString()}</span>
              </div>
              <div className="border-t border-border pt-4 mt-4">
                <p className="text-micro text-muted-foreground mb-1">Shipping to:</p>
                <p className="text-small">{order.shipping_name}</p>
                <p className="text-small text-muted-foreground">
                  {order.shipping_street}, {order.shipping_city}
                </p>
                <p className="text-small text-muted-foreground">
                  {order.shipping_state} - {order.shipping_pincode}
                </p>
              </div>
            </>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/orders">
            <Button variant="outline">View Orders</Button>
          </Link>
          <Link to="/products">
            <Button>Continue Shopping</Button>
          </Link>
        </div>
      </div>
    </Layout>
  );
};

export default OrderConfirmation;