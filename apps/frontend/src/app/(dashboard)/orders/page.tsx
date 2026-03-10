'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

export default function OrdersPage() {
  const { user } = useStore();
  const queryClient = useQueryClient();

  const { data: orders, isLoading } = useQuery({
    queryKey: ['orders'],
    queryFn: async () => {
      const res = await api.get('/orders');
      return res.data;
    },
  });

  const cancelMutation = useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/cancel`),
    onSuccess: () => {
      toast.success('Order cancelled successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) => toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message || 'Failed to cancel')
  });

  const checkoutMutation = useMutation({
    mutationFn: (id: string) => api.post(`/orders/${id}/checkout`),
    onSuccess: () => {
      toast.success('Order checked out successfully');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) => toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message || 'Failed to checkout')
  });

  if (isLoading) return <div className="animate-pulse">Loading your orders...</div>;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
        <p className="text-muted-foreground mt-2">
          {user?.role === 'MEMBER' ? 'Track your food orders here.' : 'Manage orders across your region.'}
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Orders</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order ID</TableHead>
                <TableHead>Restaurant</TableHead>
                {user?.role !== 'MEMBER' && <TableHead>User ID</TableHead>}
                <TableHead>Total</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders?.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-6 text-muted-foreground">
                    No orders found
                  </TableCell>
                </TableRow>
              ) : (
                orders?.map((order: Record<string, unknown>) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id.slice(0, 8)}...</TableCell>
                    <TableCell>{order.restaurant?.name}</TableCell>
                    {user?.role !== 'MEMBER' && <TableCell>{order.userId.slice(0,8)}...</TableCell>}
                    <TableCell>${order.totalPrice.toFixed(2)}</TableCell>
                    <TableCell>
                      <Badge variant={order.status === 'CART' ? 'secondary' : order.status === 'CANCELLED' ? 'destructive' : 'default'}>
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      {user?.role !== 'MEMBER' && order.status === 'CART' && (
                        <Button 
                          size="sm" 
                          onClick={() => checkoutMutation.mutate(order.id)}
                          disabled={checkoutMutation.isPending}
                        >
                          Checkout
                        </Button>
                      )}
                      {user?.role !== 'MEMBER' && (order.status !== 'CANCELLED' && order.status !== 'DELIVERED') && (
                        <Button 
                          size="sm" 
                          variant="destructive"
                          onClick={() => cancelMutation.mutate(order.id)}
                          disabled={cancelMutation.isPending}
                        >
                          Cancel
                        </Button>
                      )}
                      {user?.role === 'MEMBER' && (
                        <span className="text-xs text-muted-foreground">View only</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
