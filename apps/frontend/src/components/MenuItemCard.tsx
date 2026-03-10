'use client';

import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useStore } from '@/lib/store';
import { toast } from 'sonner';

interface MenuItemCardProps {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  restaurantId: string;
}

export default function MenuItemCard({ id, name, price, isAvailable, restaurantId }: MenuItemCardProps) {
  const { addToCart, cartRestaurantId } = useStore();

  const handleAdd = () => {
    if (cartRestaurantId && cartRestaurantId !== restaurantId) {
      const confirmReset = window.confirm('Adding items from a different restaurant will clear your current cart. Proceed?');
      if (!confirmReset) return;
    }
    
    addToCart({ menuItemId: id, name, price, quantity: 1 }, restaurantId);
    toast.success(`1x ${name} added to cart!`);
  };

  return (
    <Card className="flex flex-col justify-between">
      <CardHeader>
        <CardTitle>{name}</CardTitle>
        <CardDescription>Delicious and freshly prepared</CardDescription>
      </CardHeader>
      <CardContent className="flex items-center justify-between mt-auto pb-4">
        <span className="font-bold text-lg text-primary">${price.toFixed(2)}</span>
        <Button onClick={handleAdd} disabled={!isAvailable} size="sm">
          {isAvailable ? 'Add to Cart' : 'Unavailable'}
        </Button>
      </CardContent>
    </Card>
  );
}
