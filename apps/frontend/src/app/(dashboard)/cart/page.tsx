'use client';

import { useStore } from '@/lib/store';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent, CardDescription, CardFooter } from '@/components/ui/card';
import { Trash2 } from 'lucide-react';
import { useState } from 'react';
import api from '@/lib/api';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function CartPage() {
  const { cart, cartRestaurantId, removeFromCart, clearCart } = useStore();
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const handleCheckout = async () => {
    if (!cartRestaurantId || cart.length === 0) return;
    
    setLoading(true);
    try {
      await api.post('/orders', {
        restaurantId: cartRestaurantId,
        items: cart.map(item => ({
          menuItemId: item.menuItemId,
          quantity: item.quantity
        }))
      });
      toast.success('Order placed successfully!');
      clearCart();
      router.push('/orders');
    } catch (err: unknown) {
      toast.error((err as {response?:{data?:{message?:string}}}).response?.data?.message || 'Failed to place order');
    } finally {
      setLoading(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-lg bg-card">
        <h2 className="text-2xl font-bold mb-2">Your Cart is Empty</h2>
        <p className="text-muted-foreground mb-6">Looks like you haven&apos;t added anything to your cart yet.</p>
        <Button onClick={() => router.push('/restaurants')}>Browse Restaurants</Button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Your Cart</h1>
        <p className="text-muted-foreground">Review your items before placing an order.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Order Summary</CardTitle>
          <CardDescription>Items from restaurant ID: {cartRestaurantId}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {cart.map((item) => (
            <div key={item.menuItemId} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <p className="font-medium">{item.name}</p>
                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
              </div>
              <div className="flex items-center space-x-4">
                <span className="font-bold">${(item.price * item.quantity).toFixed(2)}</span>
                <Button variant="ghost" size="icon" onClick={() => removeFromCart(item.menuItemId)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </div>
          ))}
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 bg-muted/20 border-t pt-6">
          <div className="flex items-center justify-between w-full">
            <span className="font-bold text-lg">Total</span>
            <span className="font-bold text-xl">${total.toFixed(2)}</span>
          </div>
          <div className="flex space-x-4 w-full">
            <Button variant="outline" className="w-1/3" onClick={clearCart}>Clear</Button>
            <Button className="w-2/3" onClick={handleCheckout} disabled={loading}>
              {loading ? 'Placing Order...' : 'Place Order'}
            </Button>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
