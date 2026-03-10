'use client';

import { useState } from 'react';
import { useStore } from '@/lib/store';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/lib/api';
import { toast } from 'sonner';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';

export default function AdminPage() {
  const { user } = useStore();
  const queryClient = useQueryClient();
  const [orderId, setOrderId] = useState('');
  const [method, setMethod] = useState('CREDIT_CARD');

  const updatePaymentMutation = useMutation({
    mutationFn: () => api.patch('/payments/update-method', { orderId, method }),
    onSuccess: () => {
      toast.success('Payment method updated successfully');
      setOrderId('');
      queryClient.invalidateQueries({ queryKey: ['orders'] });
    },
    onError: (err: unknown) => toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message || 'Failed to update payment method')
  });

  if (user?.role !== 'ADMIN') {
    return (
      <div className="p-12 text-center text-destructive">
        <h2 className="text-2xl font-bold">Unauthorized Access</h2>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">Manage global platform settings and overrides.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Update Order Payment Method</CardTitle>
          <CardDescription>Manually override the payment method of an existing order.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="orderId">Order ID</Label>
            <Input 
              id="orderId" 
              placeholder="Enter specific Order UUID" 
              value={orderId}
              onChange={(e) => setOrderId(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="method">New Payment Method</Label>
            <Input 
              id="method" 
              placeholder="e.g. CASH, PAYPAL" 
              value={method}
              onChange={(e) => setMethod(e.target.value)}
            />
          </div>
          <Button 
            className="w-full mt-4" 
            onClick={() => updatePaymentMutation.mutate()}
            disabled={!orderId || updatePaymentMutation.isPending}
          >
            Update Payment
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
